# Comment ajouter un article sur Ayn (sans coder)

1. Ouvre le fichier `data/articles.json` avec un éditeur de texte simple (Bloc-notes, TextEdit ou VS Code).
2. Juste avant le dernier crochet `]` tout en bas, ajoute une virgule après le `}` du dernier article existant.
3. Copie un bloc d'article existant (tout ce qui est entre `{` et `}`) et colle-le juste après, comme modèle à remplir.
4. Remplis `"titre"` (le titre), `"excerpt"` (un résumé en une phrase) et `"body"` (le texte complet, en HTML : chaque paragraphe entre `<p>` et `</p>`).
5. Pour `"id"`, invente un identifiant unique en minuscules, sans accents ni espaces, avec des tirets (ex : `"mon-nouveau-sujet-2026"`).
6. Pour `"categorie"`, écris exactement l'un de ces 6 mots : `politique`, `economie`, `sport`, `culture`, `tech`, `diaspora`.
7. Pour `"tags"`, mets des mots-clés entre guillemets dans des crochets, séparés par des virgules (ex : `["Bénin", "économie"]`).
8. Pour `"date"`, utilise le format Année-Mois-Jour (ex : `"2026-07-17"`), c'est la date de publication.
9. Pour `"image"`, laisse `null` si tu n'as pas d'image, ou colle le lien complet d'une image en ligne entre guillemets (ex : `"https://exemple.com/photo.jpg"`).
10. Vérifie qu'il y a une virgule après chaque ligne sauf la dernière du bloc, enregistre le fichier, puis dépose (glisser-déposer) le dossier entier sur Netlify : le site se met à jour automatiquement.
