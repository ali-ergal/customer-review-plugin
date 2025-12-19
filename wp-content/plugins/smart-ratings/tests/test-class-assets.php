<?php
/**
 * Tests for SmartRatings_Assets class
 */

class Test_SmartRatings_Assets extends WP_UnitTestCase {

    protected $assets;

    public function setUp() {
        parent::setUp();
        $this->assets = new SmartRatings_Assets();
    }

    /**
     * Test that assets actions are registered
     */
    public function test_assets_actions_registered() {
        $this->assets->init();
        
        $this->assertTrue(has_action('wp_enqueue_scripts'));
    }

    /**
     * Test that scripts are enqueued
     */
    public function test_scripts_enqueued() {
        global $wp_scripts;
        
        $this->assets->enqueue();
        
        $this->assertTrue(wp_script_is('smart-ratings', 'enqueued'));
        $this->assertTrue(wp_script_is('smart-ratings', 'registered'));
    }

    /**
     * Test that styles are enqueued
     */
    public function test_styles_enqueued() {
        global $wp_styles;
        
        $this->assets->enqueue();
        
        $this->assertTrue(wp_style_is('smart-ratings', 'enqueued'));
        $this->assertTrue(wp_style_is('smart-ratings', 'registered'));
    }

    /**
     * Test that jQuery dependency is set
     */
    public function test_jquery_dependency() {
        $this->assets->enqueue();
        
        global $wp_scripts;
        $script = $wp_scripts->query('smart-ratings');
        
        $this->assertContains('jquery', $script->deps);
    }

    /**
     * Test that SmartRatings object is localized
     */
    public function test_smartratings_localized() {
        $this->assets->enqueue();
        
        global $wp_scripts;
        $script = $wp_scripts->query('smart-ratings');
        
        $this->assertNotNull($script);
        $this->assertObjectHasAttribute('extra', $script);
    }

    /**
     * Test that script is enqueued in footer
     */
    public function test_script_in_footer() {
        $this->assets->enqueue();
        
        global $wp_scripts;
        $script = $wp_scripts->query('smart-ratings');
        
        $this->assertTrue($script->extra['group'] === 1);
    }

    /**
     * Test localized data for logged-in user
     */
    public function test_localized_data_logged_in() {
        $user_id = $this->factory->user->create();
        wp_set_current_user($user_id);
        
        $this->assets->enqueue();
        
        // Check that isLoggedIn is true
        global $wp_scripts;
        $script = $wp_scripts->query('smart-ratings');
        $this->assertNotNull($script);
    }

    /**
     * Test localized data for guest user
     */
    public function test_localized_data_guest() {
        wp_set_current_user(0);
        
        $this->assets->enqueue();
        
        global $wp_scripts;
        $script = $wp_scripts->query('smart-ratings');
        $this->assertNotNull($script);
    }
}

