/**
 * Tests for cookie-based star preselection
 */

describe('Cookie Preselection', () => {
    let $;

    beforeEach(() => {
        $ = require('../mocks/jquery');
        
        // Create test HTML
        document.body.innerHTML = `
            <div class="smart-rating" data-post-id="123">
                <div class="stars">
                    <span class="star" data-rating="1">★</span>
                    <span class="star" data-rating="2">★</span>
                    <span class="star" data-rating="3">★</span>
                    <span class="star" data-rating="4">★</span>
                    <span class="star" data-rating="5">★</span>
                </div>
            </div>
        `;
    });

    test('should preselect stars from cookie on page load', () => {
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

        // Set cookie
        document.cookie = 'smart_rated_123=4; path=/';

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

        const stars = document.querySelectorAll('.star');
        expect($(stars[0]).hasClass('active')).toBe(true);
        expect($(stars[1]).hasClass('active')).toBe(true);
        expect($(stars[2]).hasClass('active')).toBe(true);
        expect($(stars[3]).hasClass('active')).toBe(true);
        expect($(stars[4]).hasClass('active')).toBe(false);
    });

    test('should not preselect stars when no cookie exists', () => {
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

        // No cookie set

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

        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            expect($(star).hasClass('active')).toBe(false);
        });
    });

    test('should handle multiple rating widgets with different cookies', () => {
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

        // Create multiple widgets
        document.body.innerHTML = `
            <div class="smart-rating" data-post-id="123">
                <div class="stars">
                    <span class="star" data-rating="1">★</span>
                    <span class="star" data-rating="2">★</span>
                    <span class="star" data-rating="3">★</span>
                    <span class="star" data-rating="4">★</span>
                    <span class="star" data-rating="5">★</span>
                </div>
            </div>
            <div class="smart-rating" data-post-id="456">
                <div class="stars">
                    <span class="star" data-rating="1">★</span>
                    <span class="star" data-rating="2">★</span>
                    <span class="star" data-rating="3">★</span>
                    <span class="star" data-rating="4">★</span>
                    <span class="star" data-rating="5">★</span>
                </div>
            </div>
        `;

        // Set different cookies
        document.cookie = 'smart_rated_123=3; path=/';
        document.cookie = 'smart_rated_456=5; path=/';

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

        const widgets = document.querySelectorAll('.smart-rating');
        const stars1 = widgets[0].querySelectorAll('.star');
        const stars2 = widgets[1].querySelectorAll('.star');

        // First widget should have 3 stars active
        expect($(stars1[0]).hasClass('active')).toBe(true);
        expect($(stars1[1]).hasClass('active')).toBe(true);
        expect($(stars1[2]).hasClass('active')).toBe(true);
        expect($(stars1[3]).hasClass('active')).toBe(false);

        // Second widget should have all 5 stars active
        stars2.forEach(star => {
            expect($(star).hasClass('active')).toBe(true);
        });
    });
});

