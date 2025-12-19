<?php
/**
 * Tests for SmartRatings_Installer class
 */

class Test_SmartRatings_Installer extends WP_UnitTestCase {

    /**
     * Test that table is created on install
     */
    public function test_table_created() {
        global $wpdb;
        
        SmartRatings_Installer::install();
        
        $table = $wpdb->prefix . 'smart_ratings';
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table'");
        
        $this->assertEquals($table, $table_exists);
    }

    /**
     * Test table structure
     */
    public function test_table_structure() {
        global $wpdb;
        
        SmartRatings_Installer::install();
        
        $table = $wpdb->prefix . 'smart_ratings';
        $columns = $wpdb->get_results("DESCRIBE $table");
        
        $column_names = array_column($columns, 'Field');
        
        $this->assertContains('id', $column_names);
        $this->assertContains('post_id', $column_names);
        $this->assertContains('user_id', $column_names);
        $this->assertContains('rating', $column_names);
        $this->assertContains('created_at', $column_names);
    }

    /**
     * Test stored procedure is created
     */
    public function test_stored_procedure_created() {
        global $wpdb;
        
        SmartRatings_Installer::install();
        
        $procedure_exists = $wpdb->get_var(
            "SELECT COUNT(*) FROM information_schema.ROUTINES 
             WHERE ROUTINE_NAME = 'get_ratings_summary' 
             AND ROUTINE_SCHEMA = DATABASE()"
        );
        
        $this->assertEquals(1, $procedure_exists);
    }

    /**
     * Test stored procedure returns correct data
     */
    public function test_stored_procedure_returns_data() {
        global $wpdb;
        
        SmartRatings_Installer::install();
        
        $table = $wpdb->prefix . 'smart_ratings';
        $post_id = $this->factory->post->create();
        
        // Insert test ratings
        $wpdb->insert($table, ['post_id' => $post_id, 'rating' => 5], ['%d', '%d']);
        $wpdb->insert($table, ['post_id' => $post_id, 'rating' => 4], ['%d', '%d']);
        $wpdb->insert($table, ['post_id' => $post_id, 'rating' => 3], ['%d', '%d']);
        
        // Call stored procedure
        $result = $wpdb->get_row($wpdb->prepare("CALL get_ratings_summary(%d)", $post_id));
        
        $this->assertNotNull($result);
        $this->assertEquals(3, $result->total_votes);
        $this->assertEquals(4.0, round($result->average_rating, 1));
    }
}

