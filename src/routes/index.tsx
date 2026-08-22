import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, CreditCard, MousePointerClick, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/Marquee";
import { Navbar } from "@/components/Navbar";
import { OperatorLogo, type OperatorId } from "@/components/OperatorLogo";
import { PurchaseModal, type Plan } from "@/components/PurchaseModal";
import image1 from "@/assets/image1.jpg";
import image2 from "@/assets/image2.jpg";
import image3 from "@/assets/image3.jpg";

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
          "Forfaits 7 Go, 30 Go et Illimité pour MTN, Orange et CAMTEL. Paiement Mobile Money, activation instantanée.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    try {
      return await getPaymentMode();
    } catch {
      return { sandbox: true };
    }
  },
  errorComponent: () => <Index />,
  component: Index,
});

const plans: Plan[] = [
  { id: "7go", name: "7 Go", validity: "Validité : 7 jours", price: 1200 },
  { id: "30go", name: "30 Go", validity: "Validité : 30 jours", price: 2500 },
  { id: "illimite", name: "Illimité", validity: "Validité : 30 jours", price: 5000 },
];

const operators: {
  id: OperatorId;
  name: string;
  anchor: string;
  cardClass: string;
  sectionClass: string;
  borderClass: string;
}[] = [
  {
    id: "mtn",
    name: "MTN Cameroun",
    anchor: "mtn-forfaits",
    cardClass: "from-mtn/35 to-mtn/5 border-mtn/60",
    sectionClass: "bg-mtn-tint",
    borderClass: "border-mtn/50",
  },
  {
    id: "orange",
    name: "Orange Cameroun",
    anchor: "orange-forfaits",
    cardClass: "from-orange-brand/30 to-orange-brand/5 border-orange-brand/50",
    sectionClass: "bg-orange-tint",
    borderClass: "border-orange-brand/40",
  },
  {
    id: "camtel",
    name: "CAMTEL",
    anchor: "camtel-forfaits",
    cardClass: "from-camtel/25 to-camtel/5 border-camtel/40",
    sectionClass: "bg-camtel-tint",
    borderClass: "border-camtel/35",
  },
];

const brandImages = [
  { src: image1, alt: "Recharge internet instantanée CamerData" },
  { src: image2, alt: "Activation rapide des forfaits CamerData" },
  { src: image3, alt: "Paiement Mobile Money sécurisé avec CamerData" },
];

const activities = [
  "🟢 67 ** ** 89 vient d'activer 7 Go",
  "🟢 65 ** ** 12 vient d'activer 30 Go",
  "🟢 69 ** ** 45 vient d'activer le forfait Illimité",
  "🟢 68 ** ** 03 vient d'activer 7 Go",
  "🟢 65 ** ** 77 vient d'activer 30 Go",
];

function Index() {
  const { sandbox } = Route.useLoaderData();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [operator, setOperator] = useState<OperatorId>("mtn");
  const [open, setOpen] = useState(false);

  const buy = (p: Plan, o: OperatorId) => {
    setPlan(p);
    setOperator(o);
    setOpen(true);
  };

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <div style={{ backgroundImage: "var(--gradient-hero)" }} className="pt-[70px]">
          <section className="mx-auto max-w-3xl px-5 pt-12 pb-10 text-center sm:pt-16">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <BadgeCheck className="size-4 text-accent" />
              +250 activations effectuées avec succès
            </span>
            <h1 className="mt-6 text-4xl leading-[1.1] font-black tracking-tight text-primary sm:text-5xl">
              Rechargez votre forfait internet en 30 secondes
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              MTN, Orange et CAMTEL. Paiement instantané via Mobile Money.
            </p>
            <Button variant="cta" size="xl" className="shimmer-always mt-7 w-full sm:w-auto" asChild>
              <a href="#operateurs">Choisir mon opérateur</a>
            </Button>
          </section>

          {/* Bande filante d'images de marque */}
          <div className="marquee-mask py-6">
            <Marquee
              duration={28}
              gapClass="gap-8"
              items={brandImages.map((img) => (
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={992}
                  height={672}
                  className="h-[200px] w-auto rounded-2xl object-cover shadow-[var(--shadow-soft)] transition-transform duration-500 hover:scale-105 sm:h-[240px]"
                />
              ))}
            />
          </div>
        </div>

        {/* Activité en temps réel */}
        <div className="mx-auto max-w-6xl px-5">
          <div className="glass marquee-mask rounded-full py-2.5">
            <Marquee
              duration={30}
              gapClass="gap-12"
              items={activities.map((a) => (
                <span className="text-xs text-primary sm:text-sm">{a}</span>
              ))}
            />
          </div>
        </div>

        {/* Sélection d'opérateur */}
        <section id="operateurs" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
          <h2 className="text-center text-2xl font-black text-primary sm:text-3xl">
            Choisissez votre opérateur
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {operators.map((o) => (
              <a
                key={o.id}
                href={`#${o.anchor}`}
                aria-label={`Voir les forfaits ${o.name}`}
                className={`group flex items-center gap-4 rounded-3xl border bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] ${o.cardClass}`}
              >
                <OperatorLogo operator={o.id} className="size-14 text-sm" />
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-primary">{o.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    Forfaits 7 Go, 30 Go, Illimité
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Forfaits par opérateur */}
        {operators.map((o) => (
          <section
            key={o.id}
            id={o.anchor}
            className={`scroll-mt-24 py-14 ${o.sectionClass}`}
            aria-label={`Forfaits ${o.name}`}
          >
            <div className="mx-auto max-w-6xl px-5">
              <div className="flex items-center justify-center gap-3">
                <OperatorLogo operator={o.id} className="size-11 text-xs" />
                <h2 className="text-2xl font-black text-primary sm:text-3xl">
                  Forfaits {o.id === "camtel" ? "CAMTEL" : o.id === "mtn" ? "MTN" : "Orange"}
                </h2>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {plans.map((p, i) => {
                  const popular = i === 1;
                  return (
                    <div
                      key={p.id}
                      className={`glass relative flex flex-col rounded-3xl border p-6 ${o.borderClass} ${
                        popular ? "md:-translate-y-2" : ""
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
                      <Button
                        variant="cta"
                        size="xl"
                        className="shimmer-always mt-6 w-full"
                        onClick={() => buy(p, o.id)}
                      >
                        Acheter
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

        {/* Comment ça marche */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center text-2xl font-black text-primary sm:text-3xl">
            Comment ça marche ?
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: MousePointerClick,
                t: "Choisissez",
                d: "Sélectionnez votre opérateur et forfait.",
              },
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
      </main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 Camer-Data. Tous droits réservés.</p>
          <a href="mailto:support@camer-data.cm" className="font-semibold text-primary">
            support@camer-data.cm
          </a>
        </div>
      </footer>

      <PurchaseModal plan={plan} operator={operator} open={open} onOpenChange={setOpen} />
    </div>
  );
}
