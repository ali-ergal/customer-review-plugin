jQuery(function ($) {

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + value + expires + '; path=/';
    }
    
    function getCookie(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length);
            }
        }
        return null;
    }
    

    function highlightStars($container, rating) {
        $container.find('.star').each(function () {
            $(this).toggleClass(
                'active',
                $(this).data('rating') <= rating
            );
        });
    }

    // Hover effect
    $(document).on('mouseenter', '.smart-rating .star', function () {
        highlightStars($(this).closest('.stars'), $(this).data('rating'));
    });

    // Remove hover effect
    $(document).on('mouseleave', '.smart-rating .stars', function () {
        var selected = $(this).data('selected') || 0;
        highlightStars($(this), selected);
    });

    // Submit rating on button click to the AJAX handler.
    $(document).on('click', '.smart-rating .star', function () {

        var $wrapper = $(this).closest('.smart-rating');
        var postId   = $wrapper.data('post-id');
        var rating   = $(this).data('rating');
        var nonce    = $wrapper.find('.load-stats').data('nonce');
        var $stats   = $wrapper.find('.stats');
    
        var cookieName = 'smart_rated_' + postId;

        console.log(cookieName);
    
        // Allow guest users to vote only once.
        if (!SmartRatings.isLoggedIn && getCookie(cookieName)) {
            $stats.text('You already rated this. You can change it.');
            return;
        }
    
        $stats.text('Saving rating...');
    
        $.post(SmartRatings.ajax_url, {
            action: 'smart_ratings_submit',
            post_id: postId,
            rating: rating,
            nonce: nonce
        })
        .done(function (response) {
    
            if (!response.success) {
                $stats.text(response.data || 'Error saving rating.');
                return;
            }
    
            setCookie(cookieName, rating, 365);
            $wrapper.find('.stars').data('selected', rating);
            $stats.text('Rating saved');
        })
        .fail(function () {
            $stats.text('Something went wrong.');
        });
    });

    // Preselect stars from cookie on page load
    $('.smart-rating').each(function () {
        var postId = $(this).data('post-id');
        var cookieName = 'smart_rated_' + postId;
        var previousRating = getCookie(cookieName);
        if (previousRating) {
            var $stars = $(this).find('.stars');
            $stars.data('selected', parseInt(previousRating));
            highlightStars($stars, parseInt(previousRating));
        }
    });

    // Load stats
    $(document).on('click', '.smart-rating .load-stats', function () {
        var $wrapper = $(this).closest('.smart-rating');
        var postId   = $wrapper.data('post-id');
        var nonce    = $(this).data('nonce');
        var $stats   = $wrapper.find('.stats');

        $stats.text('Loading...');

        $.post(SmartRatings.ajax_url, {
            action: 'smart_ratings_stats',
            post_id: postId,
            nonce: nonce
        })
        .done(function (response) {
            if (!response.success || !response.data) {
                $stats.text('No ratings yet.');
                return;
            }
            var avg = parseFloat(response.data.average_rating).toFixed(1) || 0;
            var votes = response.data.total_votes || 0;
            $stats.text('Average: ' + avg + ' (' + votes + ' votes)');
        })
        .fail(function () {
            $stats.text('Error loading stats.');
        });
    });

});
