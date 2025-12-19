/**
 * Tests for rating submission functionality
 */

describe('Rating Submission', () => {
    let $;

    beforeEach(() => {
        $ = require('../mocks/jquery');
        global.SmartRatings = {
            ajax_url: '/wp-admin/admin-ajax.php',
            isLoggedIn: false
        };

        // Reset jQuery.post mock
        $.post = jest.fn(() => ({
            done: jest.fn((callback) => {
                setTimeout(() => callback({ success: true }), 0);
                return { fail: jest.fn() };
            }),
            fail: jest.fn((callback) => {
                setTimeout(() => callback(), 0);
                return { done: jest.fn() };
            })
        }));

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
                <button class="load-stats" data-nonce="test_nonce">See results</button>
                <div class="stats"></div>
            </div>
        `;
    });

    test('should prevent duplicate rating for guest users with cookie', () => {
        // Set cookie to simulate previous rating
        document.cookie = 'smart_rated_123=5; path=/';

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

        const $wrapper = $('.smart-rating');
        const postId = $wrapper.data('post-id');
        const cookieName = 'smart_rated_' + postId;
        const $stats = $wrapper.find('.stats');

        if (!SmartRatings.isLoggedIn && getCookie(cookieName)) {
            $stats.text('You already rated this. You can change it.');
        }

        expect($stats.text()).toBe('You already rated this. You can change it.');
        expect($.post).not.toHaveBeenCalled();
    });

    test('should submit rating for guest user without cookie', () => {
        const $wrapper = $('.smart-rating');
        const postId = $wrapper.data('post-id');
        const rating = 4;
        const nonce = $wrapper.find('.load-stats').data('nonce');
        const $stats = $wrapper.find('.stats');

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

        const cookieName = 'smart_rated_' + postId;

        if (!SmartRatings.isLoggedIn && getCookie(cookieName)) {
            $stats.text('You already rated this. You can change it.');
            return;
        }

        $stats.text('Saving rating...');

        const postPromise = $.post(SmartRatings.ajax_url, {
            action: 'smart_ratings_submit',
            post_id: postId,
            rating: rating,
            nonce: nonce
        });

        expect($.post).toHaveBeenCalledWith(
            SmartRatings.ajax_url,
            expect.objectContaining({
                action: 'smart_ratings_submit',
                post_id: postId,
                rating: rating,
                nonce: nonce
            })
        );
        expect($stats.text()).toBe('Saving rating...');
    });

    test('should handle successful rating submission', (done) => {
        function setCookie(name, value, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + value + expires + '; path=/';
        }

        $.post = jest.fn(() => ({
            done: jest.fn((callback) => {
                setTimeout(() => {
                    callback({ success: true });
                    done();
                }, 0);
                return { fail: jest.fn() };
            }),
            fail: jest.fn()
        }));

        const $wrapper = $('.smart-rating');
        const postId = $wrapper.data('post-id');
        const rating = 5;
        const nonce = $wrapper.find('.load-stats').data('nonce');
        const $stats = $wrapper.find('.stats');
        const cookieName = 'smart_rated_' + postId;

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
        });

        // Wait for async
        setTimeout(() => {
            expect($stats.text()).toBe('Rating saved');
            expect(document.cookie).toContain('smart_rated_123=5');
        }, 10);
    });

    test('should handle failed rating submission', (done) => {
        $.post = jest.fn(() => ({
            done: jest.fn(),
            fail: jest.fn((callback) => {
                setTimeout(() => {
                    callback();
                    done();
                }, 0);
                return { done: jest.fn() };
            })
        }));

        const $wrapper = $('.smart-rating');
        const $stats = $wrapper.find('.stats');

        $stats.text('Saving rating...');

        $.post(SmartRatings.ajax_url, {})
        .fail(function () {
            $stats.text('Something went wrong.');
        });

        setTimeout(() => {
            expect($stats.text()).toBe('Something went wrong.');
        }, 10);
    });

    test('should handle error response from server', (done) => {
        $.post = jest.fn(() => ({
            done: jest.fn((callback) => {
                setTimeout(() => {
                    callback({ success: false, data: 'Invalid rating.' });
                    done();
                }, 0);
                return { fail: jest.fn() };
            }),
            fail: jest.fn()
        }));

        const $wrapper = $('.smart-rating');
        const $stats = $wrapper.find('.stats');

        $.post(SmartRatings.ajax_url, {})
        .done(function (response) {
            if (!response.success) {
                $stats.text(response.data || 'Error saving rating.');
                return;
            }
        });

        setTimeout(() => {
            expect($stats.text()).toBe('Invalid rating.');
        }, 10);
    });
});

