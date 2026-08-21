# Paiement CamerPay pour CamerData

Objectif : brancher un vrai paiement Mobile Money (MTN / Orange) via CamerPay sur la landing page existante, avec suivi des transactions en base et activation du forfait après confirmation.

## Note sur la stack

Le projet tourne sur TanStack Start (React + Tailwind) avec un backend intégré. Il n'y a donc pas de serveur Express séparé ni de MongoDB : le backend est écrit en fonctions serveur TypeScript dans le même projet, et la base de données est PostgreSQL via Lovable Cloud (à activer). Tous les endpoints demandés existent quand même, avec le même comportement et les mêmes URLs pour ce qui doit être public (webhook, page de retour).

## Ce qui sera construit

**1. Base de données** — table `transactions` :
`id`, `transaction_uuid`, `merchant_invoice_id` (unique, clé d'idempotence), `numero_beneficiaire`, `numero_payeur`, `operateur`, `forfait`, `montant`, `payment_method`, `statut` (PENDING/PROCESSING/COMPLETED/FAILED/CANCELLED), `pay_url`, `webhook_data`, `created_at`, `updated_at`, `activated_at`.
Accès verrouillé : aucune lecture publique de la table ; le suivi se fait par `transaction_uuid` via le backend uniquement.

**2. Backend**
- `initiate-payment` : valide les entrées (numéro `+237 6XXXXXXXX`, montant correspondant au forfait), génère une référence `KMD-2026-XXXX`, crée la ligne PENDING, appelle CamerPay `POST /payment/initiate`, renvoie `transaction_uuid` + `pay_url`. Réutilise la transaction existante si la même référence est rejouée (idempotence). Retry réseau 3 tentatives.
- `POST /api/public/payment-webhook` : endpoint public, vérifie la signature HMAC-SHA256 (`X-CamerPay-Signature`) en comparaison à temps constant sur le corps brut avant tout traitement, met à jour le statut, déclenche l'activation si `completed`, répond 200.
- `payment-status` : lit la transaction et interroge CamerPay `GET /payment/{uuid}/status` en secours, sert au polling frontend.
- `activate-forfait` : appelé après paiement confirmé ; simulation (délai 2 s) + horodatage `activated_at`, prêt à recevoir les API opérateurs plus tard.
- Timeout : une transaction PENDING de plus de 10 minutes est marquée `FAILED` lors d'une consultation de statut.
- Remboursement : prévu plus tard, non inclus dans cette étape.

**3. Frontend**
- La modale d'achat existante conserve ses étapes, mais l'étape finale appelle réellement `initiate-payment`, affiche un loader ("Redirection vers CamerPay…") puis redirige vers `pay_url`.
- Nouvelle page `/payment-return` : polling du statut avec spinner et compte à rebours, puis écran succès / échec / en attente, bouton retour à l'accueil.
- Badge "MODE TEST" visible en haut de page quand CamerPay est en sandbox.

**4. Documentation** — un `README` d'intégration : création du compte CamerPay, obtention du token, configuration de l'URL de webhook, exemples cURL (initiation, statut, webhook signé), passage sandbox → production, quotas (30 req/min en sandbox).

## Sécurité

Le token API et le secret HMAC sont stockés dans le coffre de secrets du projet (jamais dans le code, jamais exposés au navigateur). Le montant est toujours recalculé côté serveur à partir du forfait choisi, jamais accepté depuis le client. Limitation de débit sur l'initiation de paiement.

## Ce qu'il me faudra de vous

Après validation du plan, j'activerai Lovable Cloud puis vous demanderai, via le formulaire sécurisé, `CAMERPAY_API_TOKEN` et `CAMERPAY_WEBHOOK_SECRET`. Je vous fournirai l'URL exacte du webhook à coller dans votre tableau de bord CamerPay.
