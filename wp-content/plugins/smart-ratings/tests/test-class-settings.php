<?php
/**
 * Tests for SmartRatings_Settings class
 */

class Test_SmartRatings_Settings extends WP_UnitTestCase {

    protected $settings;

    public function setUp() {
        parent::setUp();
        $this->settings = new SmartRatings_Settings();
    }

    /**
     * Test that settings actions are registered
     */
    public function test_settings_actions_registered() {
        $this->settings->init();
        
        $this->assertTrue(has_action('admin_menu'));
        $this->assertTrue(has_action('admin_init'));
    }

    /**
     * Test that settings are registered
     */
    public function test_settings_registered() {
        $this->settings->register_settings();
        
        global $wp_registered_settings;
        $this->assertArrayHasKey('smart_ratings_star_colour', $wp_registered_settings);
        $this->assertArrayHasKey('smart_ratings_title', $wp_registered_settings);
    }

    /**
     * Test default options are set
     */
    public function test_default_options_set() {
        delete_option('smart_ratings_star_colour');
        delete_option('smart_ratings_title');
        
        $this->settings->register_settings();
        
        $this->assertEquals('#ffcc00', get_option('smart_ratings_star_colour'));
        $this->assertEquals('Rate this post', get_option('smart_ratings_title'));
    }

    /**
     * Test settings page renders
     */
    public function test_settings_page_renders() {
        // Set current user as admin
        $admin_id = $this->factory->user->create(['role' => 'administrator']);
        wp_set_current_user($admin_id);
        
        $this->settings->init();
        
        // Capture output
        ob_start();
        $this->settings->render_page();
        $output = ob_get_clean();
        
        $this->assertContains('Smart Ratings', $output);
        $this->assertContains('smart_ratings_title', $output);
        $this->assertContains('smart_ratings_star_colour', $output);
    }
}

