# Smart Ratings Test Suite

This directory contains the test suite for the Smart Ratings plugin, including both PHP and JavaScript tests.

## PHP Tests

The PHP tests use WordPress's built-in testing framework (`WP_UnitTestCase`).

### Running PHP Tests

1. Install WordPress test dependencies:
   ```bash
   # From WordPress root directory
   bin/install-wp-tests.sh db_name db_user db_password localhost latest
   ```

2. Run tests from the plugin directory:
   ```bash
   phpunit
   ```

   Or from WordPress root:
   ```bash
   phpunit --bootstrap tests/bootstrap.php tests/
   ```

### PHP Test Files

- `test-class-ajax.php` - Tests for AJAX handlers (rating submission, stats retrieval)
- `test-class-assets.php` - Tests for asset enqueuing
- `test-class-installer.php` - Tests for database installation
- `test-class-settings.php` - Tests for admin settings
- `test-class-shortcode.php` - Tests for shortcode rendering

### PHP Test Coverage

- AJAX action registration
- Rating submission (guest and logged-in users)
- Rating validation (boundary values, invalid inputs)
- Rating updates for logged-in users
- Statistics calculation via stored procedure
- Nonce verification
- Multiple users rating same post
- Shortcode rendering and configuration
- Settings registration and defaults
- Database table creation and structure
- Stored procedure functionality

## JavaScript Tests

The JavaScript tests use Jest with jsdom for DOM simulation.

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

4. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

### JavaScript Test Files

- `cookie.test.js` - Tests for cookie set/get functions
- `star-highlighting.test.js` - Tests for star highlighting functionality
- `rating-submission.test.js` - Tests for AJAX rating submission
- `stats-loading.test.js` - Tests for statistics loading
- `cookie-preselection.test.js` - Tests for cookie-based star preselection

### JavaScript Test Coverage

- Cookie management (set, get, multiple cookies)
- Star highlighting (active class toggling)
- Rating submission AJAX calls
- Duplicate rating prevention for guests
- Success/error handling for AJAX requests
- Statistics loading and formatting
- Cookie-based preselection on page load
- Multiple widget handling

## Test Configuration

### Jest Configuration

The Jest configuration is in `jest.config.js` at the plugin root. It:
- Uses jsdom environment for DOM simulation
- Sets up jQuery mocks
- Configures Babel for ES6+ support
- Sets up test file patterns

### PHPUnit Configuration

The PHPUnit configuration should be set up in your WordPress test environment. The `bootstrap.php` file loads WordPress test framework.

## Writing New Tests

### PHP Tests

1. Create a new test class extending `WP_UnitTestCase`
2. Use `setUp()` and `tearDown()` for test fixtures
3. Follow WordPress testing conventions

Example:
```php
class Test_My_Class extends WP_UnitTestCase {
    public function setUp() {
        parent::setUp();
        // Setup code
    }
    
    public function test_something() {
        // Test code
        $this->assertTrue(true);
    }
}
```

### JavaScript Tests

1. Create a new test file in `tests/js/`
2. Use Jest's `describe` and `test` functions
3. Mock jQuery and DOM as needed

Example:
```javascript
describe('My Feature', () => {
    test('should do something', () => {
        expect(true).toBe(true);
    });
});
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

- **PHP Tests**: Run via PHPUnit in your CI environment
- **JavaScript Tests**: Run via `npm test` in your CI environment

## Notes

- JavaScript tests use mocked jQuery to simulate WordPress's jQuery
- Cookie functionality is mocked using jsdom's document.cookie
- AJAX calls are mocked to avoid actual HTTP requests
- All tests should be independent and not rely on execution order

