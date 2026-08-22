import { createHmac, timingSafeEqual } from "node:crypto";

export type CamerPayConfig = {
  apiUrl: string;
  token: string;
  webhookSecret: string;
  mode: "sandbox" | "production";
  callbackUrl: string;
  returnUrl: string;
};

/** Read configuration at call time (env is injected per request on the edge runtime). */
export function getCamerPayConfig(origin: string): CamerPayConfig {
  const token = process.env["CAMERPAY_API_TOKEN"];
  if (!token) throw new Error("CAMERPAY_API_TOKEN manquant");

  const mode = (process.env["CAMERPAY_MODE"] ?? "sandbox") as "sandbox" | "production";

  return {
    apiUrl: (process.env["CAMERPAY_API_URL"] ?? "https://camerpay.biz/api").replace(/\/$/, ""),
    token,
    webhookSecret: process.env["CAMERPAY_WEBHOOK_SECRET"] ?? "",
    mode,
    callbackUrl: process.env["MERCHANT_CALLBACK_URL"] ?? `${origin}/api/public/payment-webhook`,
    returnUrl: process.env["MERCHANT_RETURN_URL"] ?? `${origin}/payment-return`,
  };
}

export function isSandbox() {
  return (process.env["CAMERPAY_MODE"] ?? "sandbox") !== "production";
}

/** fetch with up to 3 attempts on network errors / 5xx, with backoff. */
async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status >= 500 && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
        continue;
      }
      return res;
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("CamerPay injoignable");
}

export type InitiateResult = {
  transaction_uuid: string;
  pay_url: string;
  raw: unknown;
};

export async function camerpayInitiate(
  config: CamerPayConfig,
  payload: {
    amount: number;
    customer_phone: string;
    merchant_invoice_id: string;
    payment_method?: string;
  },
): Promise<InitiateResult> {
  const res = await fetchWithRetry(`${config.apiUrl}/payment/initiate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.merchant_invoice_id,
    },
    body: JSON.stringify({
      amount: payload.amount,
      currency: "XAF",
      customer_phone: payload.customer_phone,
      merchant_invoice_id: payload.merchant_invoice_id,
      merchant_callback_url: config.callbackUrl,
      merchant_return_url: config.returnUrl,
      ...(payload.payment_method ? { payment_method: payload.payment_method } : {}),
    }),
  });

  const rawText = await res.text().catch(() => "");
  let body: Record<string, unknown> | null = null;
  try {
    body = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    body = null;
  }

  if (!res.ok || !body) {
    console.error(
      "CamerPay initiate failed",
      res.status,
      res.headers.get("content-type"),
      rawText.slice(0, 500),
    );
    const apiMessage =
      body && typeof body["message"] === "string" ? (body["message"] as string) : "";
    throw new Error(
      apiMessage
        ? `CamerPay: ${apiMessage}`
        : "Le service de paiement a refusé la transaction (réponse invalide).",
    );
  }


  const data = ((body["data"] as Record<string, unknown>) ?? body) as Record<string, unknown>;
  const uuid = (data["transaction_uuid"] ?? data["uuid"] ?? data["id"]) as string | undefined;
  const payUrl = (data["pay_url"] ?? data["payment_url"] ?? data["url"]) as string | undefined;

  if (!uuid || !payUrl) {
    console.error("CamerPay initiate: réponse inattendue", body);
    throw new Error("Réponse inattendue du service de paiement.");
  }

  return { transaction_uuid: uuid, pay_url: payUrl, raw: body };
}

export async function camerpayStatus(config: CamerPayConfig, uuid: string) {
  const res = await fetchWithRetry(`${config.apiUrl}/payment/${uuid}/status`, {
    method: "GET",
    headers: { Authorization: `Bearer ${config.token}`, Accept: "application/json" },
  });
  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok || !body) return null;
  const data = ((body["data"] as Record<string, unknown>) ?? body) as Record<string, unknown>;
  return { status: String(data["status"] ?? "").toLowerCase(), raw: body };
}

/** Constant-time HMAC-SHA256 verification over the RAW request body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const received = signature.trim().replace(/^sha256=/i, "");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Statut CamerPay -> statut interne */
export function mapStatus(status: string) {
  switch (status) {
    case "completed":
    case "success":
    case "successful":
      return "COMPLETED";
    case "failed":
    case "error":
      return "FAILED";
    case "cancelled":
    case "canceled":
      return "CANCELLED";
    case "processing":
      return "PROCESSING";
    default:
      return "PENDING";
  }
}

/**
 * Activation du forfait auprès de l'opérateur.
 * Simulation pour l'instant — les API MTN/Orange/CAMTEL seront branchées ici.
 */
export async function activateForfait(input: {
  numeroBeneficiaire: string;
  operateur: string;
  forfait: string;
}) {
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Forfait activé (simulation)", input);
  return { success: true, message: "Forfait activé" };
}
