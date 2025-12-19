/**
 * Tests for star highlighting functionality
 */

describe('Star Highlighting', () => {
    let $, container;

    beforeEach(() => {
        $ = require('../mocks/jquery');
        
        // Create test HTML structure
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
        
        container = document.querySelector('.stars');
    });

    test('highlightStars should add active class to stars up to rating', () => {
        function highlightStars($container, rating) {
            $container.find('.star').each(function () {
                $(this).toggleClass(
                    'active',
                    $(this).data('rating') <= rating
                );
            });
        }

        const $container = $(container);
        highlightStars($container, 3);

        const stars = container.querySelectorAll('.star');
        expect($(stars[0]).hasClass('active')).toBe(true);
        expect($(stars[1]).hasClass('active')).toBe(true);
        expect($(stars[2]).hasClass('active')).toBe(true);
        expect($(stars[3]).hasClass('active')).toBe(false);
        expect($(stars[4]).hasClass('active')).toBe(false);
    });

    test('highlightStars should remove active class from stars above rating', () => {
        function highlightStars($container, rating) {
            $container.find('.star').each(function () {
                $(this).toggleClass(
                    'active',
                    $(this).data('rating') <= rating
                );
            });
        }

        const $container = $(container);
        
        // First highlight all stars
        highlightStars($container, 5);
        
        // Then highlight only first 2
        highlightStars($container, 2);

        const stars = container.querySelectorAll('.star');
        expect($(stars[0]).hasClass('active')).toBe(true);
        expect($(stars[1]).hasClass('active')).toBe(true);
        expect($(stars[2]).hasClass('active')).toBe(false);
        expect($(stars[3]).hasClass('active')).toBe(false);
        expect($(stars[4]).hasClass('active')).toBe(false);
    });

    test('highlightStars should handle rating 0 (no stars active)', () => {
        function highlightStars($container, rating) {
            $container.find('.star').each(function () {
                $(this).toggleClass(
                    'active',
                    $(this).data('rating') <= rating
                );
            });
        }

        const $container = $(container);
        highlightStars($container, 0);

        const stars = container.querySelectorAll('.star');
        stars.forEach(star => {
            expect($(star).hasClass('active')).toBe(false);
        });
    });

    test('highlightStars should handle rating 5 (all stars active)', () => {
        function highlightStars($container, rating) {
            $container.find('.star').each(function () {
                $(this).toggleClass(
                    'active',
                    $(this).data('rating') <= rating
                );
            });
        }

        const $container = $(container);
        highlightStars($container, 5);

        const stars = container.querySelectorAll('.star');
        stars.forEach(star => {
            expect($(star).hasClass('active')).toBe(true);
        });
    });
});

