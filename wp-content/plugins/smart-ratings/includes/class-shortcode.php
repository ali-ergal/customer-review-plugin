<?php

class SmartRatings_Shortcode {

    /**
     * Initialize the shortcode.
     */
    public function init() {
        add_shortcode('smart_rating', [$this, 'render']);
    }

    /**
     * Render the shortcode.
     */
    public function render() {
        if ( ! is_singular() ) {
            return '';
        }

        $post_id    = get_the_ID();
        $nonce      = wp_create_nonce('smart_ratings_nonce');
        $star_colour = get_option('smart_ratings_star_colour', '#ffcc00');
        $title       = get_option('smart_ratings_title', 'Rate this post');

        ob_start(); ?>
        <div class="smart-rating" data-post-id="<?php echo esc_attr($post_id); ?>" style="--star-active-color: <?php echo esc_attr($star_colour); ?>">
            <div class="heading">
                <h3><?php echo esc_html($title); ?></h3>
            </div>
            <div class="stars">
                <?php for ($i = 1; $i <= 5; $i++) : ?>
                    <span class="star" data-rating="<?php echo $i; ?>">★</span>
                <?php endfor; ?>
            </div>
            <button class="load-stats" data-nonce="<?php echo esc_attr($nonce); ?>">
                See results
            </button>
            <div class="stats"></div>
        </div>
        <?php
        return ob_get_clean();
    }
}
