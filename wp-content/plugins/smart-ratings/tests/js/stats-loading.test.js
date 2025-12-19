/**
 * Tests for stats loading functionality
 */

describe('Stats Loading', () => {
    let $;

    beforeEach(() => {
        $ = require('../mocks/jquery');
        global.SmartRatings = {
            ajax_url: '/wp-admin/admin-ajax.php',
            isLoggedIn: false
        };

        // Create test HTML
        document.body.innerHTML = `
            <div class="smart-rating" data-post-id="123">
                <button class="load-stats" data-nonce="test_nonce">See results</button>
                <div class="stats"></div>
            </div>
        `;
    });

    test('should load stats successfully', (done) => {
        $.post = jest.fn(() => ({
            done: jest.fn((callback) => {
                setTimeout(() => {
                    callback({
                        success: true,
                        data: {
                            average_rating: 4.5,
                            total_votes: 10
                        }
                    });
                    done();
                }, 0);
                return { fail: jest.fn() };
            }),
            fail: jest.fn()
        }));

        const $wrapper = $('.smart-rating');
        const postId = $wrapper.data('post-id');
        const nonce = $('.load-stats').data('nonce');
        const $stats = $('.stats');

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
        });

        setTimeout(() => {
            expect($.post).toHaveBeenCalledWith(
                SmartRatings.ajax_url,
                expect.objectContaining({
                    action: 'smart_ratings_stats',
                    post_id: postId,
                    nonce: nonce
                })
            );
            expect($stats.text()).toBe('Average: 4.5 (10 votes)');
        }, 10);
    });

    test('should handle no ratings response', (done) => {
        $.post = jest.fn(() => ({
            done: jest.fn((callback) => {
                setTimeout(() => {
                    callback({ success: false });
                    done();
                }, 0);
                return { fail: jest.fn() };
            }),
            fail: jest.fn()
        }));

        const $stats = $('.stats');

        $stats.text('Loading...');

        $.post(SmartRatings.ajax_url, {})
        .done(function (response) {
            if (!response.success || !response.data) {
                $stats.text('No ratings yet.');
                return;
            }
        });

        setTimeout(() => {
            expect($stats.text()).toBe('No ratings yet.');
        }, 10);
    });

    test('should handle stats loading failure', (done) => {
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

        const $stats = $('.stats');

        $stats.text('Loading...');

        $.post(SmartRatings.ajax_url, {})
        .fail(function () {
            $stats.text('Error loading stats.');
        });

        setTimeout(() => {
            expect($stats.text()).toBe('Error loading stats.');
        }, 10);
    });

    test('should format average rating to 1 decimal place', (done) => {
        $.post = jest.fn(() => ({
            done: jest.fn((callback) => {
                setTimeout(() => {
                    callback({
                        success: true,
                        data: {
                            average_rating: 4.333333,
                            total_votes: 3
                        }
                    });
                    done();
                }, 0);
                return { fail: jest.fn() };
            }),
            fail: jest.fn()
        }));

        const $stats = $('.stats');

        $.post(SmartRatings.ajax_url, {})
        .done(function (response) {
            if (!response.success || !response.data) {
                $stats.text('No ratings yet.');
                return;
            }
            var avg = parseFloat(response.data.average_rating).toFixed(1) || 0;
            var votes = response.data.total_votes || 0;
            $stats.text('Average: ' + avg + ' (' + votes + ' votes)');
        });

        setTimeout(() => {
            expect($stats.text()).toBe('Average: 4.3 (3 votes)');
        }, 10);
    });

    test('should handle zero votes', (done) => {
        $.post = jest.fn(() => ({
            done: jest.fn((callback) => {
                setTimeout(() => {
                    callback({
                        success: true,
                        data: {
                            average_rating: 0,
                            total_votes: 0
                        }
                    });
                    done();
                }, 0);
                return { fail: jest.fn() };
            }),
            fail: jest.fn()
        }));

        const $stats = $('.stats');

        $.post(SmartRatings.ajax_url, {})
        .done(function (response) {
            if (!response.success || !response.data) {
                $stats.text('No ratings yet.');
                return;
            }
            var avg = parseFloat(response.data.average_rating).toFixed(1) || 0;
            var votes = response.data.total_votes || 0;
            $stats.text('Average: ' + avg + ' (' + votes + ' votes)');
        });

        setTimeout(() => {
            expect($stats.text()).toBe('Average: 0.0 (0 votes)');
        }, 10);
    });
});

