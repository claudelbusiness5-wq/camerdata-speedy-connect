import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type Plan = { id: string; name: string; validity: string; price: number };

type Operator = "MTN" | "Orange" | null;

export function detectOperator(local: string): Operator {
  const p = local.slice(0, 2);
  if (["67", "68"].includes(p) || local.startsWith("650") || local.startsWith("651")) return "MTN";
  if (["69", "65"].includes(p)) return "Orange";
  return null;
}

const digits = (v: string) => v.replace(/\D/g, "").slice(0, 9);
const format = (v: string) => v.replace(/(\d{3})(?=\d)/g, "$1 ").trim();

function OperatorTag({ operator }: { operator: Operator }) {
  if (!operator) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        operator === "MTN" ? "bg-mtn text-primary" : "bg-orange-brand text-primary-foreground"
      }`}
    >
      {operator}
    </span>
  );
}

export function PurchaseModal({
  plan,
  open,
  onOpenChange,
}: {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [target, setTarget] = useState("");
  const [payer, setPayer] = useState("");
  const [method, setMethod] = useState<"MTN Mobile Money" | "Orange Money" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setTarget("");
      setPayer("");
      setMethod(null);
      setLoading(false);
    }
  }, [open, plan?.id]);

  if (!plan) return null;

  const targetOp = detectOperator(target);
  const payerOp = detectOperator(payer);

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(5);
    }, 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md rounded-2xl border-0 p-0 sm:rounded-3xl">
        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep(step - 1)}
                aria-label="Retour"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div className="min-w-0">
              <DialogTitle className="truncate text-base font-bold text-primary">
                Forfait {plan.name} — {plan.price.toLocaleString("fr-FR")} FCFA
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {step < 5 ? `Étape ${step} sur 4` : "Terminé"} · {plan.validity}
              </p>
            </div>
          </div>

          <div key={step} className="animate-fade-up">
            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-primary">
                  Numéro à recharger
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                  <Smartphone className="size-4 shrink-0 text-muted-foreground" />
                  <span className="shrink-0 text-sm font-semibold text-primary">+237</span>
                  <input
                    inputMode="numeric"
                    autoFocus
                    value={format(target)}
                    onChange={(e) => setTarget(digits(e.target.value))}
                    placeholder="6XX XXX XXX"
                    className="min-w-0 flex-1 bg-transparent text-base outline-none"
                  />
                  <OperatorTag operator={targetOp} />
                </div>
                <Button
                  variant="cta"
                  size="xl"
                  className="w-full"
                  disabled={target.length !== 9}
                  onClick={() => setStep(2)}
                >
                  Continuer
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary">Moyen de paiement</p>
                {(["MTN Mobile Money", "Orange Money"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMethod(m);
                      setStep(3);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:bg-secondary"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-lg text-xs font-black ${
                        m.startsWith("MTN")
                          ? "bg-mtn text-primary"
                          : "bg-orange-brand text-primary-foreground"
                      }`}
                    >
                      {m.startsWith("MTN") ? "MTN" : "OM"}
                    </span>
                    <span className="min-w-0 font-semibold text-primary">{m}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-primary">Numéro à débiter</label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                  <span className="shrink-0 text-sm font-semibold text-primary">+237</span>
                  <input
                    inputMode="numeric"
                    autoFocus
                    value={format(payer)}
                    onChange={(e) => setPayer(digits(e.target.value))}
                    placeholder="6XX XXX XXX"
                    className="min-w-0 flex-1 bg-transparent text-base outline-none"
                  />
                  <OperatorTag operator={payerOp} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Le débit sera effectué via {method}.
                </p>
                <Button
                  variant="cta"
                  size="xl"
                  className="w-full"
                  disabled={payer.length !== 9}
                  onClick={() => setStep(4)}
                >
                  Continuer
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2.5 rounded-xl border border-border bg-card p-4 text-sm">
                  {[
                    ["Forfait", `${plan.name} · ${plan.validity}`],
                    ["Numéro rechargé", `+237 ${format(target)}`],
                    ["Paiement", method ?? ""],
                    ["Numéro débité", `+237 ${format(payer)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-right font-semibold text-primary">{v}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-semibold text-primary">Total à payer</span>
                    <span className="text-lg font-black text-accent">
                      {plan.price.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
                <Button
                  variant="cta"
                  size="xl"
                  className="w-full"
                  disabled={loading}
                  onClick={submit}
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {loading ? "Traitement..." : "Obtenir mon forfait"}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" /> Transaction sécurisée SSL
                </p>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 py-4 text-center">
                <CheckCircle2 className="animate-pop-in mx-auto size-16 text-accent" />
                <h3 className="text-lg font-bold text-primary">Vérifiez votre téléphone</h3>
                <p className="text-sm text-muted-foreground">
                  Un message de validation a été envoyé au +237 {format(payer)}. Confirmez avec
                  votre code secret pour activer le forfait {plan.name}.
                </p>
                <Button
                  variant="cta"
                  size="xl"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  Terminer
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
