<?php
/**
 * Plugin Name: Smart Ratings
 * Description: Simple star ratings for posts with AJAX-loaded statistics.
 * Version: 1.0.0
 * Author: Ali Ergal
 */

if ( ! defined('ABSPATH') ) {
    exit;
}

define('SMART_RATINGS_PATH', plugin_dir_path(__FILE__));
define('SMART_RATINGS_URL', plugin_dir_url(__FILE__));

require_once SMART_RATINGS_PATH . 'includes/class-installer.php';
require_once SMART_RATINGS_PATH . 'includes/class-settings.php';
require_once SMART_RATINGS_PATH . 'includes/class-shortcode.php';
require_once SMART_RATINGS_PATH . 'includes/class-ajax.php';
require_once SMART_RATINGS_PATH . 'includes/class-assets.php';

register_activation_hook(__FILE__, ['SmartRatings_Installer', 'install']);

add_action('plugins_loaded', function () {

    (new SmartRatings_Settings())->init();
    (new SmartRatings_Shortcode())->init();
    (new SmartRatings_Ajax())->init();
    (new SmartRatings_Assets())->init();

});
