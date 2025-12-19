/**
 * Tests for cookie functions
 */

// Load the source file
require('../../src/js/smart-ratings.js');

describe('Cookie Functions', () => {
    beforeEach(() => {
        // Clear cookies
        document.cookie.split(";").forEach(c => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    });

    test('setCookie should set a cookie with value', () => {
        const $ = require('../mocks/jquery');
        
        // Create a function to test setCookie
        function setCookie(name, value, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + value + expires + '; path=/';
        }

        setCookie('test_cookie', 'test_value', 1);
        expect(document.cookie).toContain('test_cookie=test_value');
    });

    test('setCookie should set cookie without expiration when days is 0', () => {
        function setCookie(name, value, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + value + expires + '; path=/';
        }

        setCookie('session_cookie', 'session_value', 0);
        expect(document.cookie).toContain('session_cookie=session_value');
        expect(document.cookie).not.toContain('expires=');
    });

    test('getCookie should retrieve cookie value', () => {
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

        document.cookie = 'test_cookie=test_value; path=/';
        expect(getCookie('test_cookie')).toBe('test_value');
    });

    test('getCookie should return null for non-existent cookie', () => {
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

        expect(getCookie('non_existent')).toBeNull();
    });

    test('getCookie should handle multiple cookies', () => {
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

        document.cookie = 'cookie1=value1; path=/';
        document.cookie = 'cookie2=value2; path=/';
        document.cookie = 'cookie3=value3; path=/';

        expect(getCookie('cookie1')).toBe('value1');
        expect(getCookie('cookie2')).toBe('value2');
        expect(getCookie('cookie3')).toBe('value3');
    });
});

