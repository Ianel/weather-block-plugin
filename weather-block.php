<?php
/**
 * Plugin Name: Weather Block Plugin
 * Description: Un bloc Gutenberg personnalisé qui affiche la météo basée sur la géolocalisation
 * Version: 1.0.3
 * Author: Ianel Tombozafy
 * Text Domain: weather-block
 */

// Sécurité : empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Définir les constantes du plugin
define('WEATHER_BLOCK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WEATHER_BLOCK_PLUGIN_PATH', plugin_dir_path(__FILE__));

class WeatherBlockPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
        add_action('wp_ajax_get_weather_data', array($this, 'handle_weather_request'));
        add_action('wp_ajax_nopriv_get_weather_data', array($this, 'handle_weather_request'));
        
        // Hook d'activation pour créer les tables
        register_activation_hook(__FILE__, array($this, 'create_weather_table'));
    }
    
    public function init() {
        // Enregistrer le bloc
        register_block_type('weather-block/weather-display', array(
            'editor_script' => 'weather-block-editor',
            'editor_style' => 'weather-block-editor-style',
            'style' => 'weather-block-style',
            'render_callback' => array($this, 'render_weather_block')
        ));
        
        // Charger les traductions
        load_plugin_textdomain('weather-block', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'weather-block-editor',
            WEATHER_BLOCK_PLUGIN_URL . 'assets/js/editor.js',
            array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-components', 'wp-editor'),
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'weather-block-editor-style',
            WEATHER_BLOCK_PLUGIN_URL . 'assets/css/editor.css',
            array('wp-edit-blocks'),
            '1.0.0'
        );
    }
    
    public function enqueue_frontend_scripts() {
        wp_enqueue_script(
            'weather-block-frontend',
            WEATHER_BLOCK_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'weather-block-style',
            WEATHER_BLOCK_PLUGIN_URL . 'assets/css/style.css',
            array(),
            '1.0.0'
        );
        
        // Localiser le script pour AJAX
        wp_localize_script('weather-block-frontend', 'weatherBlock', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('weather_block_nonce')
        ));
    }
    
    public function render_weather_block($attributes, $content) {
        $current_date = date('l j F Y'); // Format: Lundi 15 janvier 2024
        setlocale(LC_TIME, 'fr_FR.UTF-8'); // Pour les noms en français
        $current_date_fr = strftime('%A %d %B %Y');
        
        return '<div class="weather-block-container" id="weather-block-' . uniqid() . '">
            <div class="weather-date">' . $current_date_fr . '</div>
            <div class="weather-loading">Chargement de la météo...</div>
            <div class="weather-content" style="display: none;"></div>
            <div class="weather-error" style="display: none;"></div>
        </div>';
    }
    
    public function create_weather_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'weather_cache';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            location_key varchar(100) NOT NULL,
            weather_data longtext NOT NULL,
            date_cached date NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY location_date (location_key, date_cached)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    public function handle_weather_request() {
        // Vérifier le nonce
        if (!wp_verify_nonce($_POST['nonce'], 'weather_block_nonce')) {
            wp_die('Accès non autorisé');
        }
        
        $latitude = floatval($_POST['latitude']);
        $longitude = floatval($_POST['longitude']);
        
        if (!$latitude || !$longitude) {
            wp_send_json_error('Coordonnées invalides');
        }
        
        // Utiliser plus de précision pour la clé de cache
        $location_key = md5(round($latitude, 4) . ',' . round($longitude, 4));
        $today = date('Y-m-d');
        
        // Vérifier si on a des données en cache
        global $wpdb;
        $table_name = $wpdb->prefix . 'weather_cache';
        
        $cached_data = $wpdb->get_row($wpdb->prepare(
            "SELECT weather_data FROM $table_name WHERE location_key = %s AND date_cached = %s",
            $location_key,
            $today
        ));
        
        if ($cached_data) {
            wp_send_json_success(json_decode($cached_data->weather_data, true));
        }
        
        // Appeler l'API WeatherAPI
        $weather_data = $this->fetch_weather_from_api($latitude, $longitude);
        
        if ($weather_data) {
            // Sauvegarder en cache
            $wpdb->replace(
                $table_name,
                array(
                    'location_key' => $location_key,
                    'weather_data' => json_encode($weather_data),
                    'date_cached' => $today
                )
            );
            
            wp_send_json_success($weather_data);
        } else {
            wp_send_json_error('Impossible de récupérer les données météo');
        }

        // Après avoir récupéré les coordonnées :
        error_log("Coordonnées reçues: Lat={$latitude}, Lon={$longitude}");
        error_log("Données météo: " . print_r($weather_data, true));
    }
    
    private function fetch_weather_from_api($latitude, $longitude) {
        // Essayer d'obtenir le nom de localisation exact
        $exact_location = $this->get_location_name($latitude, $longitude);
        // Remplacez YOUR_API_KEY par votre clé API de weatherapi.com
        $api_key = 'YOUR_API_EY';
        // Utiliser plus de précision dans les coordonnées et ajouter des paramètres
        $latitude = round($latitude, 4);
        $longitude = round($longitude, 4);
        $url = "http://api.weatherapi.com/v1/current.json?key={$api_key}&q={$latitude},{$longitude}&aqi=no&lang=fr";
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || isset($data['error'])) {
            return false;
        }

        // Après avoir récupéré $data, modifier le retour :
        $location_data = array(
            'location' => $exact_location ? explode(', ', $exact_location)[0] : $data['location']['name'],
            'country' => $exact_location ? explode(', ', $exact_location)[1] : $data['location']['country'],
            'temperature' => $data['current']['temp_c'],
            'condition' => $data['current']['condition']['text'],
            'icon' => $data['current']['condition']['icon'],
            'humidity' => $data['current']['humidity'],
            'wind_speed' => $data['current']['wind_kph'],
            'wind_direction' => $data['current']['wind_dir']
        );

        return $location_data;
    }

    private function get_location_name($latitude, $longitude) {
        // Utiliser l'API de géocodage inverse de WeatherAPI pour obtenir le nom exact
        $api_key = 'YOUR_API_KEY'; // la même clé API qu'en haut
        $url = "http://api.weatherapi.com/v1/search.json?key={$api_key}&q={$latitude},{$longitude}";
        
        $response = wp_remote_get($url);
        
        if (!is_wp_error($response)) {
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (!empty($data) && is_array($data)) {
                // Prendre la première suggestion qui devrait être la plus proche
                return $data[0]['name'] . ', ' . $data[0]['country'];
            }
        }
    
    return null;
}
}

// Initialiser le plugin
new WeatherBlockPlugin();



