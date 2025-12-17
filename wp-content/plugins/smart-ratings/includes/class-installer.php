<?php

class SmartRatings_Installer {
    
    /**
     * Install the plugin and load database tables
     */
    public static function install() {
        global $wpdb;

        $table = $wpdb->prefix . 'smart_ratings';
        $charset = $wpdb->get_charset_collate();

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        // Create the main table
        $sql = "CREATE TABLE $table (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            post_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NULL,
            rating TINYINT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY user_id (user_id)
        ) $charset;";

        dbDelta($sql);

        // Stored procedure
        $wpdb->query("DROP PROCEDURE IF EXISTS get_ratings_summary");
        $wpdb->query("
            CREATE PROCEDURE get_ratings_summary(IN postId BIGINT)
            SELECT AVG(rating) AS average_rating, COUNT(*) AS total_votes
            FROM $table WHERE post_id = postId;
        ");
    }
}
