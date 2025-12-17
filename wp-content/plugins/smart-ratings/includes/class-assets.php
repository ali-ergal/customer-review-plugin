<?php

class SmartRatings_Assets {

    /**
     * Initialize the assets.
     */
    public function init() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue']);
    }

    /**
     * Enqueue the assets.
     */
    public function enqueue() {
        wp_enqueue_script(
            'smart-ratings',
            SMART_RATINGS_URL . 'assets/js/smart-ratings.min.js',
            ['jquery'],
            '1.1',
            true
        );

        wp_enqueue_style(
            'smart-ratings',
            SMART_RATINGS_URL . 'assets/css/smart-ratings.min.css',
            [],
            '1.1'
        );

        wp_localize_script('smart-ratings', 'SmartRatings', [
            'ajax_url'  => admin_url('admin-ajax.php'),
            'isLoggedIn' => is_user_logged_in()
        ]);
    }
}
