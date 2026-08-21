import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { getPaymentStatus } from "@/lib/payments.functions";

type Search = { uuid?: string | undefined };

export const Route = createFileRoute("/payment-return")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    uuid: typeof search["uuid"] === "string" ? search["uuid"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Résultat du paiement — CamerData" },
      {
        name: "description",
        content:
          "Suivi de votre paiement Mobile Money CamerData et confirmation de l'activation de votre forfait internet.",
      },
      { property: "og:title", content: "Résultat du paiement — CamerData" },
      {
        property: "og:description",
        content: "Confirmation de votre paiement Mobile Money et activation du forfait.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentReturn,
});

type Result = Awaited<ReturnType<typeof getPaymentStatus>>;

function PaymentReturn() {
  const { uuid } = useSearch({ from: "/payment-return" });
  const [result, setResult] = useState<Result | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const stopped = useRef(false);

  useEffect(() => {
    if (!uuid) return;
    stopped.current = false;

    const poll = async () => {
      try {
        const res = await getPaymentStatus({ data: { uuid } });
        setResult(res);
        if (res.found && ["COMPLETED", "FAILED", "CANCELLED"].includes(res.statut)) {
          stopped.current = true;
        }
      } catch (error) {
        console.error(error);
      }
    };

    void poll();
    const interval = setInterval(() => {
      setElapsed((e) => e + 4);
      if (!stopped.current) void poll();
    }, 4000);

    return () => clearInterval(interval);
  }, [uuid]);

  const statut = result?.found ? result.statut : null;
  const pending = !statut || statut === "PENDING" || statut === "PROCESSING";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto flex max-w-lg flex-col items-center px-5 pt-[110px] pb-16 text-center">
        <div className="glass w-full rounded-3xl p-8">
          {!uuid && (
            <>
              <XCircle className="mx-auto size-14 text-muted-foreground" />
              <h1 className="mt-4 text-xl font-black text-primary">Transaction introuvable</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune référence de paiement n&apos;a été fournie.
              </p>
            </>
          )}

          {uuid && pending && (
            <>
              <Loader2 className="mx-auto size-14 animate-spin text-accent" />
              <h1 className="mt-4 text-xl font-black text-primary">
                Paiement en cours de confirmation…
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Validez la notification Mobile Money sur votre téléphone avec votre code secret.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Vérification automatique · {Math.floor(elapsed / 60)}:
                {String(elapsed % 60).padStart(2, "0")}
              </p>
            </>
          )}

          {uuid && statut === "COMPLETED" && result?.found && (
            <>
              <CheckCircle2 className="animate-pop-in mx-auto size-16 text-accent" />
              <h1 className="mt-4 text-xl font-black text-primary">✅ Paiement confirmé !</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre forfait {result.forfait} ({result.operateur}) est activé sur le{" "}
                {result.numeroBeneficiaire}.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Référence : {result.reference}</p>
            </>
          )}

          {uuid && (statut === "FAILED" || statut === "CANCELLED") && (
            <>
              <XCircle className="mx-auto size-14 text-muted-foreground" />
              <h1 className="mt-4 text-xl font-black text-primary">
                Transaction annulée ou échouée
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Aucun montant n&apos;a été débité durablement. Vous pouvez réessayer.
              </p>
            </>
          )}

          {uuid && result && !result.found && (
            <p className="mt-2 text-sm text-muted-foreground">
              Cette transaction n&apos;existe pas ou a expiré.
            </p>
          )}

          <Button variant="cta" size="xl" className="mt-6 w-full" asChild>
            <Link to="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
