<?php

class SmartRatings_Ajax {

    /**
     * Initialize the AJAX actions.
     */
    public function init() {
        add_action('wp_ajax_smart_ratings_submit', [$this, 'submit_rating']);
        add_action('wp_ajax_nopriv_smart_ratings_submit', [$this, 'submit_rating']);

        add_action('wp_ajax_smart_ratings_stats', [$this, 'get_stats']);
        add_action('wp_ajax_nopriv_smart_ratings_stats', [$this, 'get_stats']);
    }
    
    /**
     * Submit the rating.
     */
    public function submit_rating() {
        check_ajax_referer('smart_ratings_nonce', 'nonce');
    
        global $wpdb;
    
        // Get the post ID, rating, user ID and table name.
        $post_id = intval($_POST['post_id']);
        $rating  = intval($_POST['rating']);
        $user_id = get_current_user_id();
        $table   = $wpdb->prefix . 'smart_ratings';
        
        // Validate the rating.
        if ($rating < 1 || $rating > 5) {
            wp_send_json_error('Invalid rating.');
        }
    
        // Validate the post.
        if (!get_post($post_id)) {
            wp_send_json_error('Invalid post.');
        }
    
        // Check and update the rating for the logged-in user.  
        // If the rating already exists, update it.
        // If the rating does not exist, insert it.
        if ($user_id) {
    
            $existing_id = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT id FROM $table WHERE post_id = %d AND user_id = %d",
                    $post_id,
                    $user_id
                )
            );
    
            if ($existing_id) {
                $wpdb->update(
                    $table,
                    ['rating' => $rating],
                    ['id' => $existing_id],
                    ['%d'],
                    ['%d']
                );
            } else {
                $wpdb->insert(
                    $table,
                    [
                        'post_id' => $post_id,
                        'user_id' => $user_id,
                        'rating'  => $rating
                    ],
                    ['%d', '%d', '%d']
                );
            }
    
            wp_send_json_success();
        }
    
        // Browser cookies handles the duplicates for the guest users.
        $wpdb->insert(
            $table,
            [
                'post_id' => $post_id,
                'rating'  => $rating
            ],
            ['%d', '%d']
        );
    
        wp_send_json_success();
    }
    
    /**
     * Get the stats.
     */
    public function get_stats() {
        check_ajax_referer('smart_ratings_nonce', 'nonce');

        global $wpdb;

        $post_id = intval($_POST['post_id']);
        $table   = $wpdb->prefix . 'smart_ratings';

        $result = $wpdb->get_row(
            $wpdb->prepare("CALL get_ratings_summary(%d)", $post_id)
        );

        wp_send_json_success($result);
    }
}
