# CamerData — intégration CamerPay

Plateforme de recharge de forfaits internet (MTN, Orange, CAMTEL) avec paiement
Mobile Money via [CamerPay](https://camerpay.biz), en mode redirection.

## 1. Compte CamerPay

1. Créez un compte marchand sur https://camerpay.biz.
2. Dans le tableau de bord, section **API**, générez un **token API** (sandbox puis production).
3. Générez (ou choisissez) un **secret de webhook** — une chaîne aléatoire forte, par ex.
   `openssl rand -hex 32`. La même valeur doit être enregistrée des deux côtés.

## 2. Secrets à configurer dans le projet

| Nom | Rôle |
| --- | --- |
| `CAMERPAY_API_TOKEN` | Token Bearer pour appeler l'API CamerPay |
| `CAMERPAY_WEBHOOK_SECRET` | Secret HMAC-SHA256 de vérification du webhook |
| `CAMERPAY_MODE` (optionnel) | `sandbox` (défaut) ou `production` |
| `CAMERPAY_API_URL` (optionnel) | Défaut `https://camerpay.biz/api` |
| `MERCHANT_CALLBACK_URL` (optionnel) | Écrase l'URL de webhook déduite |
| `MERCHANT_RETURN_URL` (optionnel) | Écrase l'URL de retour déduite |

Les secrets ne sont jamais dans le code : ils sont stockés chiffrés et injectés
côté serveur uniquement.

## 3. URLs à renseigner dans CamerPay

- Webhook (callback) : `https://camer-data-plus.lovable.app/api/public/payment-webhook`
- Retour client : `https://camer-data-plus.lovable.app/payment-return`

En préversion : `https://project--084b9a85-7c66-46e0-b121-e3e1ef8de5ce-dev.lovable.app/...`

## 4. Parcours de paiement

1. L'utilisateur choisit un opérateur puis un forfait, saisit le numéro à recharger,
   le moyen de paiement et le numéro à débiter.
2. `initiatePayment` (fonction serveur) valide les entrées, **recalcule le montant
   côté serveur** à partir du forfait, crée une transaction `PENDING` avec une
   référence `KMD-<année>-<id>`, puis appelle CamerPay.
3. Le client est redirigé vers `pay_url` (page CamerPay).
4. CamerPay appelle le webhook signé ; le statut est mis à jour et le forfait activé
   une seule fois (idempotent).
5. Le client revient sur `/payment-return`, qui interroge le statut en polling.
   Une transaction non confirmée après 10 minutes passe en `FAILED`.

## 5. Exemples cURL

Statut d'une transaction (API CamerPay) :

```bash
curl -H "Authorization: Bearer $CAMERPAY_API_TOKEN" \
  https://camerpay.biz/api/payment/<transaction_uuid>/status
```

Simuler un webhook signé vers l'application :

```bash
BODY='{"transaction_uuid":"<uuid>","status":"completed"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$CAMERPAY_WEBHOOK_SECRET" -hex | awk '{print $2}')

curl -X POST https://camer-data-plus.lovable.app/api/public/payment-webhook \
  -H "Content-Type: application/json" \
  -H "X-CamerPay-Event: payment.completed" \
  -H "X-CamerPay-Signature: $SIG" \
  -d "$BODY"
```

Une signature invalide renvoie `401`.

## 6. Passage sandbox → production

1. Remplacez `CAMERPAY_API_TOKEN` par le token de production.
2. Mettez `CAMERPAY_MODE` à `production` (le bandeau « Mode test » disparaît).
3. Mettez à jour les URLs de webhook/retour dans le tableau de bord CamerPay avec
   le domaine de production.
4. Faites une transaction réelle de faible montant pour valider le bout en bout.

Quota sandbox : environ 30 requêtes/minute. Les appels sortants réessaient 3 fois
avec backoff en cas d'erreur réseau ou 5xx.

## 7. Développement

```bash
bun install
bun run dev
```
