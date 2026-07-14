Guide rapide — Configuration Firebase pour CENABAT

1) Créer un projet Firebase
- Rendez-vous sur https://console.firebase.google.com/ et créez un projet.

2) Activer Firestore
- Dans votre projet, allez à "Firestore Database" → Créer une base en mode "production" ou "test".

3) Récupérer la configuration Web
- Allez dans la roue dentée (Paramètres du projet) → "Vos applications" → Ajouter une application Web si nécessaire.
- Copiez la configuration (apiKey, authDomain, projectId, ...)

4) Règles Firestore (exemple basique pour admin uniquement)
- Dans Firestore → Rules, utiliser temporairement (à sécuriser ensuite):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
  }
}

(Remarque: pour simplifier, le code d'administration que j'ai ajouté n'utilise pas Firebase Auth. Pour production, configurez une authentification et adaptez les règles.)

5) Mettre à jour la config dans `admin.html`
- Ouvrez `admin.html` et remplacez les valeurs "REPLACE_ME" par celles de votre projet Firebase.

6) Migration initiale des données
- Depuis l'interface d'administration, cliquez sur "Réinitialiser" puis ajoutez ou importez vos produits, ou utilisez le bouton Export/Import JSON.

7) Tester
- Ouvrez le site (index.html) et l'admin (admin.html) sur le même navigateur. Les modifications sauvegardées dans l'admin seront synchronisées vers Firestore et répercutées dans le site lors du rafraîchissement.

Besoin que je génère les règles Firestore plus sûres et l'intégration Firebase Auth ? Je peux l'automatiser pour vous.