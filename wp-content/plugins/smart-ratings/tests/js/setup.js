/**
 * Jest setup file for Smart Ratings JavaScript tests
 */

// Setup DOM
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    referrer: 'http://localhost',
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock document.cookie
let cookies = {};
Object.defineProperty(document, 'cookie', {
    get: function() {
        return Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join('; ');
    },
    set: function(cookie) {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
            cookies[name.trim()] = value.trim();
        }
    },
    configurable: true
});

// Mock jQuery
global.$ = global.jQuery = require('./mocks/jquery');

// Mock WordPress AJAX URL
global.SmartRatings = {
    ajax_url: '/wp-admin/admin-ajax.php',
    isLoggedIn: false
};

// Reset cookies and jQuery mocks before each test
beforeEach(() => {
    cookies = {};
    jest.clearAllMocks();
});

