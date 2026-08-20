# CamerData Speedy Connect

Agis comme un expert en UI/UX et en développement Frontend. Crée une landing page one-page, moderne, simple et facile à comprendre, pour une plateforme de recharge de forfaits internet au Cameroun. 



**CONTRAINTES STRICTES :**

- NE PAS utiliser la couleur rouge nulle part.

- NE PAS inclure de bouton WhatsApp.

- NE PAS inclure de case à cocher "C'est mon numéro" dans le formulaire.

- Les seuls moyens de paiement acceptés sont : MTN Mobile Money et Orange Money.

- Le design doit être "Mobile-First" mais parfaitement responsive sur desktop.



**SYSTÈME DE DESIGN & EFFETS VISUELS :**

- Palette de couleurs : 

  - Primaire : Bleu Sarcelle profond (Deep Teal, ex: #0F4C75) pour la confiance et la neutralité.

  - Accent : Vert Émeraude (ex: #10B981) pour tous les boutons d'action (Acheter, Continuer, Payer) pour évoquer le succès et l'argent.

  - Fond : Gris très clair / Blanc cassé (ex: #F8FAFC) avec de subtils dégradés.

- Effet Glassmorphism : Utilise `backdrop-filter: blur(12px)`, des fonds semi-transparents (`bg-white/40` ou `bg-white/60`), et des bordures fines et subtiles (`border border-white/30`) pour les cartes de forfaits et les modales.

- Effet de brillance (Shimmer) : Ajoute une animation de reflet lumineux subtil qui traverse les boutons d'action principaux (CTA) au survol, pour un aspect premium et fintech.



**STRUCTURE DE LA PAGE (One-Page) :**



1. **HEADER :** 

   - Simple et épuré. Logo à gauche (texte "CamerData" ou placeholder). 

   - Pas de menu de navigation complexe, juste un lien "Support" vers un email.



2. **BANDE FILANTE DE MARQUE (Juste sous le header) :**

   - Un composant "Marquee" (défilement infini horizontal lent et fluide).

   - Contenu : Placeholders pour des logos de confiance (ex: "Logo Partenaire 1", "Logo Partenaire 2", "Paiement 100% Sécurisé", "SSL Encrypté"). Cela doit renforcer la crédibilité immédiatement.



3. **SECTION HÉRO (Hero) :**

   - Titre principal : "Rechargez votre forfait internet en 30 secondes."

   - Sous-titre : "MTN, Orange et CAMTEL. Paiement instantané et sécurisé via Mobile Money."

   - Badge de confiance proéminent avec icône de vérification : "✅ +250 activations effectuées avec succès".



4. **BANDE FILANTE D'ACTIVITÉ EN TEMPS RÉEL :**

   - Une barre fine et élégante (style glassmorphism) juste au-dessus ou en dessous des forfaits.

   - Animation de défilement ou de notification type "toast" qui affiche des messages aléatoires comme : 

     "🟢 67 ** ** 89 vient d'activer 7 Go à l'instant"

     "🟢 69 ** ** 12 vient d'activer le forfait Illimité"

     "🟢 65 ** ** 45 vient d'activer 30 Go"



5. **SECTION DES FORFAITS (Le cœur de l'app) :**

   - 3 cartes au design glassmorphism, alignées proprement.

   - Carte 1 : "7 Go" | "Validité : 7 jours" | "1 200 FCFA" | Bouton Vert "Acheter".

   - Carte 2 (Mise en avant "Populaire" avec un petit badge et une bordure verte subtile) : "30 Go" | "Validité : 30 jours" | "2 500 FCFA" | Bouton Vert "Acheter".

   - Carte 3 : "Illimité" | "Validité : 30 jours" | "5 000 FCFA" | Bouton Vert "Acheter".



6. **SECTION "COMMENT ÇA MARCHE ?" :**

   - 3 étapes avec des icônes minimalistes :

     1. Choisissez (Sélectionnez votre forfait)

     2. Payez (Via MTN MoMo ou Orange Money)

     3. Recevez (Activation instantanée par SMS)



7. **MODALE / FLUX DE PAIEMENT (Simulé au clic sur "Acheter") :**

   - Étape 1 : Champ "Numéro à recharger" avec indicatif +237 pré-rempli. (Ajoute une logique simple : si le numéro commence par 67/68, affiche l'icône MTN ; si 65/69, affiche l'icône Orange).

   - Étape 2 : Choix du moyen de paiement (Deux gros boutons clairs : "MTN Mobile Money" et "Orange Money").

   - Étape 3 : Champ "Numéro à débiter" (pour entrer le numéro qui va payer, sans aucune case à cocher de sauvegarde).

   - Étape 4 : Récapitulatif (Total à payer : XXXX FCFA) et un grand bouton vert brillant "Obtenir mon forfait".

   - Étape 5 : Écran de succès avec animation : "✅ Vérifiez votre téléphone. Un message de validation a été envoyé."



8. **FOOTER :**

   - Minimaliste. "© 2026 CamerData. Tous droits réservés."

   - Email de support : support@camerdata.cm

   - Aucun bouton flottant, aucun lien WhatsApp.



**TECHNIQUE :**

- Utilise React, Tailwind CSS, et Framer Motion (ou des animations CSS natives) pour les effets de brillance (shimmer) et les bandes filantes (marquee).

- Assure-toi que les contrastes sont excellents pour la lisibilité.

- Les transitions entre les étapes de la modale doivent être fluides (fade in/out).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/084b9a85-7c66-46e0-b121-e3e1ef8de5ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
