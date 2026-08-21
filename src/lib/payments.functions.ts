import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import { LOCAL_PHONE_REGEX, PLAN_CATALOG, OPERATOR_LABELS } from "@/lib/plans";

const initiateSchema = z.object({
  planId: z.enum(["7go", "30go", "illimite"]),
  operateur: z.enum(["mtn", "orange", "camtel"]),
  numeroBeneficiaire: z.string().regex(LOCAL_PHONE_REGEX, "Numéro bénéficiaire invalide"),
  numeroPayeur: z.string().regex(LOCAL_PHONE_REGEX, "Numéro payeur invalide"),
  paymentMethod: z.enum(["mtn_momo", "orange_money"]),
});

export const initiatePayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => initiateSchema.parse(data))
  .handler(async ({ data }) => {
    const {
      getCamerPayConfig,
      camerpayInitiate,
      isSandbox,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } = await import("@/lib/camerpay.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { toInternational } = await import("@/lib/plans");

    const origin = new URL(getRequestUrl()).origin;
    const config = getCamerPayConfig(origin);

    const plan = PLAN_CATALOG[data.planId];
    // Le montant est TOUJOURS recalculé côté serveur.
    const montant = plan.price;

    const reference = `KMD-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("transactions")
      .insert({
        merchant_invoice_id: reference,
        numero_beneficiaire: `+237${data.numeroBeneficiaire}`,
        numero_payeur: `+237${data.numeroPayeur}`,
        operateur: OPERATOR_LABELS[data.operateur],
        forfait: plan.name,
        montant,
        payment_method: data.paymentMethod,
        statut: "PENDING",
        mode: isSandbox() ? "sandbox" : "production",
      })
      .select("id, merchant_invoice_id")
      .single();

    if (insertError || !inserted) {
      console.error("Insert transaction failed", insertError);
      throw new Error("Impossible d'enregistrer la transaction.");
    }

    try {
      const result = await camerpayInitiate(config, {
        amount: montant,
        customer_phone: toInternational(data.numeroPayeur),
        merchant_invoice_id: reference,
        payment_method: data.paymentMethod,
      });

      await supabaseAdmin
        .from("transactions")
        .update({
          transaction_uuid: result.transaction_uuid,
          pay_url: result.pay_url,
          statut: "PROCESSING",
        })
        .eq("id", inserted.id);

      return {
        success: true as const,
        transaction_uuid: result.transaction_uuid,
        pay_url: result.pay_url,
        reference,
        montant,
        sandbox: isSandbox(),
      };
    } catch (error) {
      await supabaseAdmin.from("transactions").update({ statut: "FAILED" }).eq("id", inserted.id);
      console.error("initiatePayment error", error);
      throw error instanceof Error ? error : new Error("Échec de l'initiation du paiement.");
    }
  });

export const getPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ uuid: z.string().min(6).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { getCamerPayConfig, camerpayStatus, mapStatus, activateForfait } = await import(
      "@/lib/camerpay.server"
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tx } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("transaction_uuid", data.uuid)
      .maybeSingle();

    if (!tx) return { found: false as const };

    let statut = tx.statut;

    if (statut === "PENDING" || statut === "PROCESSING") {
      // Timeout : 10 minutes sans confirmation => échec
      const ageMs = Date.now() - new Date(tx.created_at).getTime();

      const remote = await camerpayStatus(
        getCamerPayConfig(new URL(getRequestUrl()).origin),
        data.uuid,
      ).catch(() => null);

      if (remote?.status) {
        statut = mapStatus(remote.status);
      } else if (ageMs > 10 * 60 * 1000) {
        statut = "FAILED";
      }

      if (statut !== tx.statut) {
        await supabaseAdmin.from("transactions").update({ statut }).eq("id", tx.id);
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
      }
    }

    return {
      found: true as const,
      statut,
      forfait: tx.forfait,
      operateur: tx.operateur,
      montant: tx.montant,
      numeroBeneficiaire: tx.numero_beneficiaire,
      reference: tx.merchant_invoice_id,
      activated: Boolean(tx.activated_at) || statut === "COMPLETED",
    };
  });
