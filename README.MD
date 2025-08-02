# Weather Block Plugin

Un plugin WordPress personnalisé qui ajoute un bloc Gutenberg pour afficher la météo basée sur la géolocalisation de l'utilisateur.

## Fonctionnalités

-   🌤️ Bloc Gutenberg personnalisé pour afficher la météo
-   📍 Détection automatique de la géolocalisation de l'utilisateur
-   💾 Cache des données météo en base de données (évite les appels API répétés)
-   🔄 Mise en cache quotidienne des données
-   ⚠️ Gestion des erreurs (géolocalisation refusée, API indisponible)
-   🎨 Interface utilisateur moderne et responsive

## Prérequis

-   WordPress 5.0+
-   PHP 7.4+
-   Clé API WeatherAPI.com

## Installation

### Étape 1: Obtenir une clé API

1. Créez un compte gratuit sur [WeatherAPI.com](https://www.weatherapi.com/)
2. Récupérez votre clé API depuis votre tableau de bord

### Étape 2: Structure des fichiers

Créez la structure de dossiers suivante dans `/wp-content/plugins/weather-block/`:

```
weather-block/
├── weather-block.php (fichier principal)
├── README.md
├── assets/
│   ├── js/
│   │   ├── editor.js
│   │   └── frontend.js
│   └── css/
│       ├── style.css
│       └── editor.css
└── languages/ (optionnel)
```

### Étape 3: Configuration de l'API

1. Ouvrez le fichier `weather-block.php`
2. Trouvez la ligne suivante dans la fonction `fetch_weather_from_api()`:
    ```php
    $api_key = 'YOUR_API_KEY';
    ```
3. Remplacez `'YOUR_API_KEY'` par votre vraie clé API WeatherAPI

### Étape 4: Activation du plugin

1. Connectez-vous à votre administration WordPress
2. Allez dans **Extensions** → **Extensions installées**
3. Trouvez "Weather Block Plugin" et cliquez sur **Activer**
4. Le plugin créera automatiquement la table de cache en base de données

## Utilisation

1. Éditez une page ou un article avec l'éditeur Gutenberg
2. Cliquez sur le bouton **+** pour ajouter un bloc
3. Recherchez "Weather Display" ou "Bloc Météo"
4. Ajoutez le bloc à votre contenu
5. Publiez votre page

Sur le frontend, le bloc :

-   Demandera automatiquement l'autorisation de géolocalisation
-   Affichera la météo actuelle si l'autorisation est accordée
-   Affichera un message d'erreur si l'autorisation est refusée

## Base de données

Le plugin crée une table `wp_weather_cache` avec la structure suivante :

-   `id` : Identifiant unique
-   `location_key` : Clé MD5 des coordonnées
-   `weather_data` : Données météo en JSON
-   `date_cached` : Date de mise en cache
-   `created_at` : Timestamp de création

## Dépannage

### Le bloc ne s'affiche pas

-   Vérifiez que votre clé API est correctement configurée
-   Vérifiez les logs d'erreur WordPress

### Erreur "Impossible de récupérer les données météo"

-   Vérifiez votre clé API WeatherAPI
-   Vérifiez que votre serveur peut faire des appels HTTP sortants

### La géolocalisation ne fonctionne pas

-   Le site doit être en HTTPS pour que la géolocalisation fonctionne
-   L'utilisateur doit autoriser la géolocalisation dans son navigateur

## Licence

Ce plugin est sous licence GPL v2 ou ultérieure.

## Support

Pour tout problème ou question, créez une issue sur le repository GitHub.
