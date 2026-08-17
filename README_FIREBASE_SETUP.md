Guide rapide — Configuration Firebase pour CENABAT

1. Créer un projet Firebase

- Rendez-vous sur https://console.firebase.google.com/ et créez un projet.

2. Activer Firestore

- Dans votre projet, allez à "Firestore Database" → "Créer une base de données".
- Choisissez un mode de test ou production selon votre plan de démarrage.

3. Récupérer la configuration Web

- Allez dans les paramètres du projet → "Vos applications" → Ajouter une application Web.
- Copiez la configuration firebase (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

4. Configurer le site pour utiliser cette clé

- Ouvrez le fichier `admin.html`.
- Définissez avant le chargement du script principal :

```html
<script>
  window.CENABAT_FIREBASE_CONFIG = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    projectId: "VOTRE_PROJECT",
    storageBucket: "VOTRE_PROJECT.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcd1234",
  };
</script>
```

- Si les valeurs restent en `REPLACE_ME`, le site reste en mode localStorage sans erreur.

5. Règles Firestore (exemple)

- Dans Firestore → Rules, utilisez temporairement :

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

- En production, il faudra sécuriser avec Firebase Auth ou un système d’administration plus strict.

6. Migration initiale des données

- Ouvrez la page d’administration.
- Ajoutez, modifiez ou réinitialisez les produits.
- Les données seront écrites dans Firestore si la configuration est valide.

7. Tester

- Ouvrez le site et l’admin dans le même navigateur.
- Le site lit d’abord le catalogue localStorage, puis synchronise depuis Firestore s’il est disponible.

8. Remarque importante

- Le code actuel est prêt pour Firebase, mais sans identifiants réels il continue à fonctionner en mode local, sans casser le site.
