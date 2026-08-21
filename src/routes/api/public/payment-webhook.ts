import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payment-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("x-camerpay-signature");
        const event = request.headers.get("x-camerpay-event");

        const { verifyWebhookSignature, mapStatus, activateForfait } = await import(
          "@/lib/camerpay.server"
        );
        const secret = process.env["CAMERPAY_WEBHOOK_SECRET"] ?? "";

        if (!verifyWebhookSignature(raw, signature, secret)) {
          console.error("Webhook CamerPay: signature invalide", { event });
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const uuid = typeof payload["transaction_uuid"] === "string" ? payload["transaction_uuid"] : null;
        const status = typeof payload["status"] === "string" ? payload["status"] : "";
        if (!uuid) return new Response("Missing transaction_uuid", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: tx } = await supabaseAdmin
          .from("transactions")
          .select("*")
          .eq("transaction_uuid", uuid)
          .maybeSingle();

        if (!tx) {
          console.error("Webhook CamerPay: transaction inconnue", uuid);
          return new Response("ok", { status: 200 });
        }

        const statut = mapStatus(status.toLowerCase());

        await supabaseAdmin
          .from("transactions")
          .update({ statut, webhook_data: payload as never })
          .eq("id", tx.id);

        // Idempotent : on n'active qu'une seule fois.
        if (statut === "COMPLETED" && !tx.activated_at) {
          await activateForfait({
            numeroBeneficiaire: tx.numero_beneficiaire,
            operateur: tx.operateur,
            forfait: tx.forfait,
          });
          await supabaseAdmin
            .from("transactions")
            .update({ activated_at: new Date().toISOString() })
            .eq("id", tx.id);
        }

        if (statut === "FAILED" || statut === "CANCELLED") {
          console.warn("Paiement non abouti", { uuid, statut, reference: tx.merchant_invoice_id });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
