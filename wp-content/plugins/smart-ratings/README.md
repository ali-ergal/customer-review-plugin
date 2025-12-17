# Smart Ratings

A simple WordPress plugin for adding star ratings to the posts.

## Brief Description

Create a WordPress plugin called “Smart Ratings” that allows users to submit ratings for posts.  Data must be stored in a custom SQL table related via a foreign key to the native wp_posts.ID.  The plugin must render a configurable rating widget using a Shortcode. A button inside the  widget will fetch aggregated rating results dynamically via AJAX (with nonce security), calling  a stored procedure. 

## Deliverables

- Plugin folder with: 
    - Object-oriented architecture with dependency injection
- Custom database table wp_smart_ratings
    - Fields: id, post_id, user_id, rating, created_at 
    - post_id must be a FK → wp_posts(ID) 
    - Stored procedure get_ratings_summary(postId) 
- Admin settings page where rating widget style can be configured 
- Shortcode: [smart_rating]
- Template rendering: 
    - Stars UI
    - "Load stats" button triggering AJAX fetch 
- Frontend
    - jQuery AJAX call to load summary:
        - average rating 
        - total votes
- Back-end
    - AJAX endpoint pulling data only from stored procedure

- Other Requirements
    - Store the plugin’s code in a GitHub repository
    - Plugin is installed on a WP instance; ideally, it would be run in a Docker container


## Installation

1. Upload the `smart-ratings` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. The plugin will automatically create the necessary database table on activation

## Usage

### Basic Usage

Add the rating widget to any post or page using the shortcode:

```
[smart_rating]
```

**Note:** The shortcode only works on singular post pages (single posts, pages, etc.). It will not display on archive pages.

### Where to Add the Shortcode

You can add the shortcode in several ways:

1. **In the post editor**: Simply paste `[smart_rating]` anywhere in your post content
2. **In your theme template**: Use `<?php echo do_shortcode('[smart_rating]'); ?>`
3. **In widgets**: Add a text widget and include the shortcode

## Configuration

Navigate to **Settings → Smart Ratings** in your WordPress admin to configure:

### Settings Options

- **Title**: Customize the heading text above the rating stars (default: "Rate this post")
- **Star Colour**: Choose the color for active/selected stars using a color picker (default: #ffcc00)

## How It Works

### For Guest Users

- Guest users can rate posts once per browser (tracked via cookies)
- Cookies are set for 365 days
- If a guest tries to rate again, they'll see a message that they've already rated

### For Logged-In Users

- Logged-in users can rate posts and update their ratings
- Each user can have one rating per post
- If a user rates the same post again, their previous rating is updated

### Statistics

Click the "See results" button to view:
- Average rating (rounded to 1 decimal place)
- Total number of votes

Statistics are loaded via AJAX without page refresh.

## Technical Details

### Database Structure

The plugin creates a custom table `wp_smart_ratings` with the following structure:

- `id` - Primary key
- `post_id` - The ID of the rated post
- `user_id` - The ID of the user (NULL for guest users)
- `rating` - The rating value (1-5)
- `created_at` - Timestamp of when the rating was created

### Database Procedure

The plugin uses a MySQL stored procedure `get_ratings_summary` to efficiently calculate:
- Average rating
- Total vote count

### File Structure

```
smart-ratings/
├── assets/              # Compiled assets (CSS/JS)
├── dist/                # Build output directory
├── includes/            # PHP classes
│   ├── class-ajax.php   # AJAX handlers
│   ├── class-assets.php # Asset enqueuing
│   ├── class-installer.php # Database setup
│   ├── class-settings.php  # Admin settings
│   └── class-shortcode.php # Shortcode handler
├── src/                 # Source files
│   ├── js/              # JavaScript source
│   └── sass/            # SCSS source
├── gulpfile.js          # Build configuration
├── package.json         # Node dependencies
└── smart-ratings.php    # Main plugin file
```

### Development

The plugin uses Gulp for building assets. To set up development:

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Run the build process:
   ```bash
   npm run build
   ```

3. Watch for changes:
   ```bash
   npm run watch
   ```

## Requirements

- WordPress 5.0 or higher
- PHP 7.0 or higher
- MySQL 5.0 or higher (for stored procedure support)
- Node 16.14

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- Cookies must be enabled for guest user tracking

## Security

- All AJAX requests are protected with WordPress nonces
- SQL queries use prepared statements
- Output is escaped using WordPress functions

## Changelog

### Version 1.0.0
- Initial release
- 5-star rating system
- Admin settings for customization
- AJAX statistics
- Cookie-based guest tracking
- User-based rating tracking

## Author

**Ali Ergal**

