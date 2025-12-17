<?php

class SmartRatings_Settings {

    /**
     * Initialize the settings.
     */
    public function init() {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    /**
     * Add the menu.
     */
    public function add_menu() {
        add_options_page(
            'Smart Ratings',
            'Smart Ratings',
            'manage_options',
            'smart-ratings',
            [$this, 'render_page']
        );
    }

    /**
     * Register the settings.
     */
    public function register_settings() {
        register_setting('smart_ratings', 'smart_ratings_star_colour');
        register_setting('smart_ratings', 'smart_ratings_title');

        add_option('smart_ratings_star_colour', '#ffcc00');
        add_option('smart_ratings_title', 'Rate this post');
    }

    /**
     * Render the settings page.
     */
    public function render_page() {
        ?>
        <div class="wrap">
            <h1>Smart Ratings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('smart_ratings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">Title</th>
                        <td>
                            <input type="text"
                                   name="smart_ratings_title"
                                   value="<?php echo esc_attr(get_option('smart_ratings_title')); ?>">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Star colour</th>
                        <td>
                            <input type="color"
                                   name="smart_ratings_star_colour"
                                   value="<?php echo esc_attr(get_option('smart_ratings_star_colour')); ?>">
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
