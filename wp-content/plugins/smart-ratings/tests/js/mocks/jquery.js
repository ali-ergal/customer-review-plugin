/**
 * jQuery mock for Jest tests
 */

class jQueryMock {
    constructor(selector) {
        this.selector = selector;
        this.elements = [];
        this.length = 0;
        
        if (typeof selector === 'string') {
            this.elements = Array.from(document.querySelectorAll(selector));
            this.length = this.elements.length;
        } else if (selector && selector.nodeType) {
            this.elements = [selector];
            this.length = 1;
        } else if (Array.isArray(selector)) {
            this.elements = selector;
            this.length = selector.length;
        }
    }

    find(selector) {
        const found = [];
        this.elements.forEach(el => {
            found.push(...Array.from(el.querySelectorAll(selector)));
        });
        return new jQueryMock(found);
    }

    closest(selector) {
        if (this.elements.length === 0) return new jQueryMock([]);
        let element = this.elements[0];
        while (element && element.parentElement) {
            if (element.matches && element.matches(selector)) {
                return new jQueryMock([element]);
            }
            element = element.parentElement;
        }
        return new jQueryMock([]);
    }

    data(key, value) {
        if (this.elements.length === 0) return value === undefined ? undefined : this;
        
        if (value !== undefined) {
            this.elements.forEach(el => {
                el.dataset[key] = value;
            });
            return this;
        }
        
        // Get data attribute, convert to number if it's a numeric string
        const attr = this.elements[0]?.dataset[key];
        if (attr === undefined) return undefined;
        
        // Try to parse as number if it looks like a number
        const numValue = parseFloat(attr);
        if (!isNaN(numValue) && isFinite(attr)) {
            return numValue;
        }
        
        return attr;
    }

    text(content) {
        if (this.elements.length === 0) return content === undefined ? '' : this;
        
        if (content !== undefined) {
            this.elements.forEach(el => {
                el.textContent = content;
            });
            return this;
        }
        
        return this.elements[0]?.textContent || '';
    }

    toggleClass(className, condition) {
        this.elements.forEach(el => {
            if (condition !== undefined) {
                if (condition) {
                    el.classList.add(className);
                } else {
                    el.classList.remove(className);
                }
            } else {
                el.classList.toggle(className);
            }
        });
        return this;
    }

    addClass(className) {
        this.elements.forEach(el => el.classList.add(className));
        return this;
    }

    removeClass(className) {
        this.elements.forEach(el => el.classList.remove(className));
        return this;
    }

    hasClass(className) {
        return this.elements.some(el => el.classList.contains(className));
    }

    each(callback) {
        this.elements.forEach((el, index) => {
            callback.call(el, index, el);
        });
        return this;
    }

    on(event, selector, handler) {
        if (typeof selector === 'function') {
            handler = selector;
            selector = null;
        }
        
        this.elements.forEach(el => {
            if (selector) {
                el.addEventListener(event, (e) => {
                    if (e.target.matches(selector)) {
                        handler.call(e.target, e);
                    }
                });
            } else {
                el.addEventListener(event, handler);
            }
        });
        return this;
    }

    trigger(eventName) {
        this.elements.forEach(el => {
            const event = new Event(eventName, { bubbles: true });
            el.dispatchEvent(event);
        });
        return this;
    }
}

// Create jQuery function
function jQuery(selector) {
    if (typeof selector === 'function') {
        // Document ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', selector);
        } else {
            selector();
        }
        return new jQueryMock([]);
    }
    return new jQueryMock(selector);
}

// Add methods to jQuery
jQuery.post = jest.fn(() => {
    const promise = {
        done: jest.fn((callback) => {
            promise._doneCallback = callback;
            return promise;
        }),
        fail: jest.fn((callback) => {
            promise._failCallback = callback;
            return promise;
        })
    };
    return promise;
});

jQuery.ajax = jest.fn();

module.exports = jQuery;

