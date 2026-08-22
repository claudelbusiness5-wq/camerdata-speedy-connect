# Redirection vers la page de paiement CamerPay

## Objectif

Faire du parcours hébergé par CamerPay le flux principal : après vérification du forfait et des numéros, CamerData crée la transaction, récupère l’URL de paiement CamerPay et redirige immédiatement l’utilisateur vers cette page. CamerPay renvoie ensuite l’utilisateur vers CamerData pour afficher le statut final.

## Constat vérifié

- La modale tente déjà une redirection vers le `pay_url` renvoyé par CamerPay.
- La redirection ne se produit pas parce que l’appel d’initiation échoue avant de fournir cette URL.
- Les journaux du site publié montrent actuellement une réponse HTTP `520` de CamerPay sur l’initiation.

## Mise en œuvre

1. **Aligner l’initiation sur le contrat CamerPay de production**
   - Vérifier l’URL d’initiation, les champs obligatoires, le format du numéro, la valeur de `source` et la forme exacte de la réponse avec la documentation et l’exemple du compte marchand.
   - Envoyer uniquement les champs attendus pour le paiement hébergé MTN Mobile Money ou Orange Money.
   - Accepter les variantes documentées du champ URL de paiement sans masquer une réponse invalide.

2. **Fiabiliser la redirection vers CamerPay**
   - Conserver le bouton de confirmation en état de chargement pendant la création du paiement.
   - Dès qu’une URL CamerPay HTTPS valide est reçue, effectuer une navigation complète vers cette URL.
   - Si CamerPay refuse l’initiation, rester dans la modale et afficher un message utile au lieu d’annoncer un envoi USSD qui n’a pas eu lieu.

3. **Fiabiliser le retour vers CamerData**
   - Fournir à CamerPay l’URL de retour publique `https://camer-data-plus.lovable.app/payment-return` et le callback `https://camer-data-plus.lovable.app/api/public/payment-webhook`.
   - Adapter la page de retour aux identifiants réellement renvoyés par CamerPay (`transaction_uuid` ou référence marchande), puis lancer le suivi du statut.
   - Afficher distinctement paiement confirmé, en attente, annulé ou échoué.

4. **Diagnostic exploitable sans fuite de données**
   - Journaliser côté serveur le statut HTTP et la structure non sensible de la réponse CamerPay.
   - Remonter au client une erreur claire et sûre, tout en gardant le token API et les données sensibles exclusivement côté serveur.

5. **Validation du parcours de production**
   - Tester une initiation MTN et une initiation Orange depuis le site publié.
   - Confirmer l’ouverture réelle de la page hébergée CamerPay, puis le retour sur CamerData.
   - Vérifier que le webhook met à jour la même transaction et que le polling termine correctement.

## Détails techniques

- Le montant restera recalculé côté serveur depuis le catalogue CamerData.
- La transaction sera créée en `PENDING`, passera en `PROCESSING` uniquement après réception d’un identifiant et d’une URL CamerPay valides, puis sera finalisée par webhook ou interrogation de statut.
- La destination de redirection sera validée comme URL HTTPS CamerPay avant navigation.
- Les fonctions serveur resteront des wrappers minces ; les schémas et helpers d’exécution seront isolés dans des modules adaptés au serveur.

## Résultat attendu

```text
CamerData → confirmation → page de paiement CamerPay
           ← retour client ← paiement manuel MTN/Orange
           ← webhook signé ← confirmation CamerPay
```