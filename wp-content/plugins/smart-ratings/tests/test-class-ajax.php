<?php
/**
 * Tests for SmartRatings_Ajax class
 */

class Test_SmartRatings_Ajax extends WP_UnitTestCase {

    protected $ajax;
    protected $table;

    public function setUp() {
        parent::setUp();
        
        global $wpdb;
        $this->ajax = new SmartRatings_Ajax();
        $this->table = $wpdb->prefix . 'smart_ratings';
        
        // Create test post
        $this->post_id = $this->factory->post->create();
    }

    public function tearDown() {
        parent::tearDown();
    }

    /**
     * Test that AJAX actions are registered
     */
    public function test_ajax_actions_registered() {
        $this->ajax->init();
        
        $this->assertTrue(has_action('wp_ajax_smart_ratings_submit'));
        $this->assertTrue(has_action('wp_ajax_nopriv_smart_ratings_submit'));
        $this->assertTrue(has_action('wp_ajax_smart_ratings_stats'));
        $this->assertTrue(has_action('wp_ajax_nopriv_smart_ratings_stats'));
    }

    /**
     * Test submitting a valid rating as guest
     */
    public function test_submit_rating_guest_valid() {
        global $wpdb;
        
        // Set up POST data
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 5;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        // Mock wp_send_json_success to capture response
        add_filter('wp_die_ajax_handler', function() {
            return function($message) {
                throw new Exception($message);
            };
        });
        
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {
            // Check that rating was inserted
            $count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table} WHERE post_id = %d AND rating = %d",
                $this->post_id,
                5
            ));
            $this->assertEquals(1, $count);
        }
    }

    /**
     * Test submitting invalid rating (too low)
     */
    public function test_submit_rating_invalid_low() {
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 0;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        $this->expectException('WPDieException');
        $this->ajax->submit_rating();
    }

    /**
     * Test submitting invalid rating (too high)
     */
    public function test_submit_rating_invalid_high() {
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 6;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        $this->expectException('WPDieException');
        $this->ajax->submit_rating();
    }

    /**
     * Test submitting rating for invalid post
     */
    public function test_submit_rating_invalid_post() {
        $_POST['post_id'] = 99999;
        $_POST['rating'] = 5;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        $this->expectException('WPDieException');
        $this->ajax->submit_rating();
    }

    /**
     * Test submitting rating as logged-in user
     */
    public function test_submit_rating_logged_in() {
        global $wpdb;
        
        $user_id = $this->factory->user->create();
        wp_set_current_user($user_id);
        
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 4;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {
            // Check that rating was inserted with user_id
            $rating = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM {$this->table} WHERE post_id = %d AND user_id = %d",
                $this->post_id,
                $user_id
            ));
            $this->assertNotNull($rating);
            $this->assertEquals(4, $rating->rating);
        }
    }

    /**
     * Test updating existing rating for logged-in user
     */
    public function test_update_rating_logged_in() {
        global $wpdb;
        
        $user_id = $this->factory->user->create();
        wp_set_current_user($user_id);
        
        // Insert initial rating
        $wpdb->insert(
            $this->table,
            [
                'post_id' => $this->post_id,
                'user_id' => $user_id,
                'rating' => 3
            ],
            ['%d', '%d', '%d']
        );
        
        // Update rating
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 5;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {
            // Check that rating was updated, not duplicated
            $count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table} WHERE post_id = %d AND user_id = %d",
                $this->post_id,
                $user_id
            ));
            $this->assertEquals(1, $count);
            
            $rating = $wpdb->get_row($wpdb->prepare(
                "SELECT rating FROM {$this->table} WHERE post_id = %d AND user_id = %d",
                $this->post_id,
                $user_id
            ));
            $this->assertEquals(5, $rating->rating);
        }
    }

    /**
     * Test getting stats
     */
    public function test_get_stats() {
        global $wpdb;
        
        // Insert test ratings
        $wpdb->insert($this->table, ['post_id' => $this->post_id, 'rating' => 5], ['%d', '%d']);
        $wpdb->insert($this->table, ['post_id' => $this->post_id, 'rating' => 4], ['%d', '%d']);
        $wpdb->insert($this->table, ['post_id' => $this->post_id, 'rating' => 3], ['%d', '%d']);
        
        $_POST['post_id'] = $this->post_id;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        try {
            $this->ajax->get_stats();
        } catch (Exception $e) {
            // Stats should be calculated via stored procedure
            // Average should be (5+4+3)/3 = 4.0
            $result = $wpdb->get_row($wpdb->prepare("CALL get_ratings_summary(%d)", $this->post_id));
            $this->assertNotNull($result);
            $this->assertEquals(3, $result->total_votes);
        }
    }

    /**
     * Test nonce verification
     */
    public function test_nonce_verification() {
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 5;
        $_POST['nonce'] = 'invalid_nonce';
        
        $this->expectException('WPDieException');
        $this->ajax->submit_rating();
    }

    /**
     * Test getting stats for post with no ratings
     */
    public function test_get_stats_no_ratings() {
        global $wpdb;
        
        $_POST['post_id'] = $this->post_id;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        try {
            $this->ajax->get_stats();
        } catch (Exception $e) {
            $result = $wpdb->get_row($wpdb->prepare("CALL get_ratings_summary(%d)", $this->post_id));
            $this->assertNotNull($result);
            $this->assertEquals(0, $result->total_votes);
        }
    }

    /**
     * Test multiple guest ratings for same post (should allow)
     */
    public function test_multiple_guest_ratings() {
        global $wpdb;
        
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 3;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {
            // First rating
        }
        
        $_POST['rating'] = 5;
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {
            // Second rating (guest users can rate multiple times from backend perspective)
            $count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table} WHERE post_id = %d",
                $this->post_id
            ));
            $this->assertEquals(2, $count);
        }
    }

    /**
     * Test stats calculation accuracy
     */
    public function test_stats_calculation_accuracy() {
        global $wpdb;
        
        // Insert ratings: 5, 5, 4, 4, 3
        $ratings = [5, 5, 4, 4, 3];
        foreach ($ratings as $rating) {
            $wpdb->insert($this->table, ['post_id' => $this->post_id, 'rating' => $rating], ['%d', '%d']);
        }
        
        $_POST['post_id'] = $this->post_id;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        try {
            $this->ajax->get_stats();
        } catch (Exception $e) {
            $result = $wpdb->get_row($wpdb->prepare("CALL get_ratings_summary(%d)", $this->post_id));
            $this->assertNotNull($result);
            $this->assertEquals(5, $result->total_votes);
            // Average should be (5+5+4+4+3)/5 = 4.2
            $this->assertEquals(4.2, round($result->average_rating, 1));
        }
    }

    /**
     * Test rating boundary values (1 and 5)
     */
    public function test_rating_boundary_values() {
        global $wpdb;
        
        // Test minimum rating (1)
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 1;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {
            $rating = $wpdb->get_var($wpdb->prepare(
                "SELECT rating FROM {$this->table} WHERE post_id = %d",
                $this->post_id
            ));
            $this->assertEquals(1, $rating);
        }
        
        // Test maximum rating (5)
        $wpdb->delete($this->table, ['post_id' => $this->post_id], ['%d']);
        
        $_POST['rating'] = 5;
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {
            $rating = $wpdb->get_var($wpdb->prepare(
                "SELECT rating FROM {$this->table} WHERE post_id = %d",
                $this->post_id
            ));
            $this->assertEquals(5, $rating);
        }
    }

    /**
     * Test stats nonce verification
     */
    public function test_stats_nonce_verification() {
        $_POST['post_id'] = $this->post_id;
        $_POST['nonce'] = 'invalid_nonce';
        
        $this->expectException('WPDieException');
        $this->ajax->get_stats();
    }

    /**
     * Test multiple users rating same post
     */
    public function test_multiple_users_rating_same_post() {
        global $wpdb;
        
        $user1 = $this->factory->user->create();
        $user2 = $this->factory->user->create();
        $user3 = $this->factory->user->create();
        
        // User 1 rates
        wp_set_current_user($user1);
        $_POST['post_id'] = $this->post_id;
        $_POST['rating'] = 5;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {}
        
        // User 2 rates
        wp_set_current_user($user2);
        $_POST['rating'] = 4;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {}
        
        // User 3 rates
        wp_set_current_user($user3);
        $_POST['rating'] = 3;
        $_POST['nonce'] = wp_create_nonce('smart_ratings_nonce');
        try {
            $this->ajax->submit_rating();
        } catch (Exception $e) {}
        
        // Check all ratings exist
        $count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE post_id = %d AND user_id IS NOT NULL",
            $this->post_id
        ));
        $this->assertEquals(3, $count);
    }
}

