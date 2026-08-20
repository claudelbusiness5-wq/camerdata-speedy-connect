import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, CreditCard, MousePointerClick, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/Marquee";
import { PurchaseModal, type Plan } from "@/components/PurchaseModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CamerData — Recharge de forfaits internet au Cameroun" },
      {
        name: "description",
        content:
          "Rechargez votre forfait internet MTN, Orange ou CAMTEL en 30 secondes. Paiement instantané et sécurisé via MTN Mobile Money et Orange Money.",
      },
      { property: "og:title", content: "CamerData — Forfaits internet en 30 secondes" },
      {
        property: "og:description",
        content:
          "Forfaits 7 Go, 30 Go et Illimité. Paiement Mobile Money, activation instantanée par SMS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const plans: Plan[] = [
  { id: "7go", name: "7 Go", validity: "Validité : 7 jours", price: 1200 },
  { id: "30go", name: "30 Go", validity: "Validité : 30 jours", price: 2500 },
  { id: "illimite", name: "Illimité", validity: "Validité : 30 jours", price: 5000 },
];

const activities = [
  "🟢 67 ** ** 89 vient d'activer 7 Go à l'instant",
  "🟢 69 ** ** 12 vient d'activer le forfait Illimité",
  "🟢 65 ** ** 45 vient d'activer 30 Go",
  "🟢 68 ** ** 03 vient d'activer 7 Go",
  "🟢 65 ** ** 77 vient d'activer 30 Go",
];

function Index() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(i);
  }, []);

  const buy = (p: Plan) => {
    setPlan(p);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div style={{ backgroundImage: "var(--gradient-hero)" }}>
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <span className="font-display truncate text-xl font-black tracking-tight text-primary">
            Camer<span className="text-accent">Data</span>
          </span>
          <a
            href="mailto:support@camerdata.cm"
            className="shrink-0 text-sm font-semibold text-primary hover:text-accent"
          >
            Support
          </a>
        </header>

        <div className="glass-subtle border-x-0 py-2.5">
          <Marquee
            duration={38}
            items={[
              "Logo Partenaire 1",
              "Paiement 100% Sécurisé",
              "Logo Partenaire 2",
              "SSL Encrypté",
              "Logo Partenaire 3",
              "Activation instantanée",
            ].map((t) => (
              <span className="text-xs font-semibold tracking-wide text-primary/70 uppercase">
                {t}
              </span>
            ))}
          />
        </div>

        <section className="mx-auto max-w-3xl px-5 pt-12 pb-10 text-center sm:pt-16">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
            <BadgeCheck className="size-4 text-accent" />
            +250 activations effectuées avec succès
          </span>
          <h1 className="mt-6 text-4xl leading-[1.1] font-black tracking-tight text-primary sm:text-5xl">
            Rechargez votre forfait internet en 30 secondes.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            MTN, Orange et CAMTEL. Paiement instantané et sécurisé via Mobile Money.
          </p>
          <Button
            variant="cta"
            size="xl"
            className="mt-7 w-full sm:w-auto"
            onClick={() => buy(plans[1])}
          >
            Choisir mon forfait
          </Button>
        </section>
      </div>

      <div className="mx-auto max-w-6xl px-5">
        <div className="glass flex items-center gap-3 rounded-full px-4 py-2.5">
          <span className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />
          <p key={tick} className="animate-fade-up min-w-0 truncate text-xs text-primary sm:text-sm">
            {activities[tick % activities.length]}
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-black text-primary sm:text-3xl">
          Nos forfaits internet
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Des prix clairs, sans frais cachés.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((p, i) => {
            const popular = i === 1;
            return (
              <div
                key={p.id}
                className={`glass relative flex flex-col rounded-3xl p-6 ${
                  popular ? "border-2 border-accent/40 md:-translate-y-2" : ""
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                    Populaire
                  </span>
                )}
                <p className="text-3xl font-black text-primary">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.validity}</p>
                <p className="mt-6 text-2xl font-black text-primary">
                  {p.price.toLocaleString("fr-FR")}{" "}
                  <span className="text-sm font-semibold text-muted-foreground">FCFA</span>
                </p>
                <Button variant="cta" size="xl" className="mt-6 w-full" onClick={() => buy(p)}>
                  Acheter
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-center text-2xl font-black text-primary sm:text-3xl">
          Comment ça marche ?
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { icon: MousePointerClick, t: "Choisissez", d: "Sélectionnez votre forfait." },
            { icon: CreditCard, t: "Payez", d: "Via MTN MoMo ou Orange Money." },
            { icon: Zap, t: "Recevez", d: "Activation instantanée par SMS." },
          ].map((s, i) => (
            <div key={s.t} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <s.icon className="size-5" />
                </span>
                <span className="text-sm font-bold text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-primary">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-accent" /> Paiements acceptés : MTN Mobile Money et
          Orange Money
        </p>
      </section>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 CamerData. Tous droits réservés.</p>
          <a href="mailto:support@camerdata.cm" className="font-semibold text-primary">
            support@camerdata.cm
          </a>
        </div>
      </footer>

      <PurchaseModal plan={plan} open={open} onOpenChange={setOpen} />
    </div>
  );
}
