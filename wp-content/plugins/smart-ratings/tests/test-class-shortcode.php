<?php
/**
 * Tests for SmartRatings_Shortcode class
 */

class Test_SmartRatings_Shortcode extends WP_UnitTestCase {

    protected $shortcode;

    public function setUp() {
        parent::setUp();
        $this->shortcode = new SmartRatings_Shortcode();
    }

    /**
     * Test that shortcode is registered
     */
    public function test_shortcode_registered() {
        $this->shortcode->init();
        $this->assertTrue(shortcode_exists('smart_rating'));
    }

    /**
     * Test shortcode renders on singular page
     */
    public function test_shortcode_renders_on_singular() {
        $post_id = $this->factory->post->create();
        
        // Set up singular context
        global $wp_query;
        $wp_query->is_singular = true;
        $this->go_to(get_permalink($post_id));
        
        $this->shortcode->init();
        $output = do_shortcode('[smart_rating]');
        
        $this->assertNotEmpty($output);
        $this->assertContains('smart-rating', $output);
        $this->assertContains('data-post-id', $output);
        $this->assertContains('star', $output);
    }

    /**
     * Test shortcode doesn't render on non-singular page
     */
    public function test_shortcode_does_not_render_on_archive() {
        // Set up archive context
        global $wp_query;
        $wp_query->is_singular = false;
        
        $this->shortcode->init();
        $output = do_shortcode('[smart_rating]');
        
        $this->assertEmpty($output);
    }

    /**
     * Test shortcode contains all required elements
     */
    public function test_shortcode_contains_required_elements() {
        $post_id = $this->factory->post->create();
        
        global $wp_query;
        $wp_query->is_singular = true;
        $this->go_to(get_permalink($post_id));
        
        $this->shortcode->init();
        $output = do_shortcode('[smart_rating]');
        
        // Check for heading
        $this->assertContains('<h3>', $output);
        
        // Check for 5 stars
        $star_count = substr_count($output, 'data-rating');
        $this->assertEquals(5, $star_count);
        
        // Check for load-stats button
        $this->assertContains('load-stats', $output);
        
        // Check for stats div
        $this->assertContains('stats', $output);
        
        // Check for nonce
        $this->assertContains('data-nonce', $output);
    }

    /**
     * Test shortcode uses custom title from settings
     */
    public function test_shortcode_uses_custom_title() {
        $post_id = $this->factory->post->create();
        update_option('smart_ratings_title', 'Custom Rating Title');
        
        global $wp_query;
        $wp_query->is_singular = true;
        $this->go_to(get_permalink($post_id));
        
        $this->shortcode->init();
        $output = do_shortcode('[smart_rating]');
        
        $this->assertContains('Custom Rating Title', $output);
    }

    /**
     * Test shortcode uses custom star color from settings
     */
    public function test_shortcode_uses_custom_star_color() {
        $post_id = $this->factory->post->create();
        update_option('smart_ratings_star_colour', '#ff0000');
        
        global $wp_query;
        $wp_query->is_singular = true;
        $this->go_to(get_permalink($post_id));
        
        $this->shortcode->init();
        $output = do_shortcode('[smart_rating]');
        
        $this->assertContains('--star-active-color: #ff0000', $output);
    }

    /**
     * Test shortcode uses default values when settings not set
     */
    public function test_shortcode_uses_defaults() {
        $post_id = $this->factory->post->create();
        delete_option('smart_ratings_title');
        delete_option('smart_ratings_star_colour');
        
        global $wp_query;
        $wp_query->is_singular = true;
        $this->go_to(get_permalink($post_id));
        
        $this->shortcode->init();
        $output = do_shortcode('[smart_rating]');
        
        $this->assertContains('Rate this post', $output);
        $this->assertContains('--star-active-color: #ffcc00', $output);
    }
}

