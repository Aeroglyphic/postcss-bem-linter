'use strict';

/**
 * Module dependencies
 */

var isValid = require('./is-valid-selector');

/**
 * Module exports
 */

module.exports = validateSelectors;

/**
 * @param {Object} styles
 * @param {String} componentName
 * @param {Boolean} strict
 * @param {Object} pattern
 * @param {Object} [opts]
 */
function validateSelectors(styles, componentName, strict, pattern, opts) {
  styles.eachRule(function (rule) {
    if (rule.parent && rule.parent.name == 'keyframes') {
      return;
    }
    var selectors = rule.selectors;

    selectors.forEach(function (selector) {
      // selectors must start with the componentName class, or be `:root`
      if (!isValid(selector, componentName, strict, pattern, opts)) {
        throw rule.error('Invalid selector "' + selector + '". ');
      }
    });
  });
}
