'use strict';

var Criteria = require('app/model/criteria');
var uid = require('app/lib/uid');
var Errors = require('app/model/error');
/**
 * A timesheet rule which contains styles and conditions
 * 
 * Applies style information to {{#crossLink "TimesheetEntry"}}{{/crossLink}}, based
 * on {{#crossLink "Criteria"}}{{/crossLink}} matching
 * 
 * @class Rule
 * @param {Object} data Rule options
 * @param {String|null} data.color Row color
 * @param {String} data.ruleType Type of condition testing
 * @param {Array} data.conditions Array of individual conditions to test
 * @constructor
 */
var Rule = function(data) {
  data = data || {};
  
  /**
   * Raw rule data
   * 
   * @property data
   * @type {Object}
   */
  this.data = data;

  /**
   * Criteria instance for delegation
   * 
   * @property criteria
   * @type {Criteria}
   */
  this.criteria = new Criteria(this.data.ruleType, this.data.conditions);

  /**
   * Unique identifier for this rule
   * 
   * @property id
   * @type {Number}
   */
  this.id = uid();

  /**
   * Errors collection
   *
   * @property errors
   * @type {Error}
   */
  this.errors = new Errors(['color']);
};

var proto = Rule.prototype;

/**
 * Whether rule has any errors after validation
 *
 * @return {boolean}
 */
proto.hasErrors = function() {
  return this.errors.hasErrors();
};

/**
 * Fetch error messages
 * 
 * @method errorMessages
 * @returns {String[]}
 */
proto.errorMessages = function() {
  return this.errors.errorMessages();
};

/**
 * Convert rule data to simple object
 * 
 * @return {Object}
 */
proto.toJson = function() {
  return {
    color: this.data.color,
    ruleType: this.criteria.type,
    conditions: this.criteria.criteriaData()
  };
};

/**
 * Compare criteria to a {{#crossLink "TimesheetEntry"}}{{/crossLink}} instance
 * 
 * @method matches
 * @param {TimesheetEntry} row The entry to test against 
 * @return {Boolean} Whether row can be said to match this rule's criteria
 */
proto.matches = function(row) {
  return this.criteria.matches(row);
};

/**
 * Whether individual rule is valid
 * 
 * @method isValid
 * @return {boolean}
 */
proto.isValid = function() {
  this.errors.clear();

  if (! /^#[a-f0-9]{6}$/i.test(this.color())) {
    this.errors.add('color', 'rule_error_color_invalid');
  }
  
  if (this.criteria.activeCriteria().length === 0) {
    this.errors.add('base', 'criteria_error_criteria_required');
  }
  
  return this.criteria.isValid() && this.errors.empty();
};

/**
 * The row color
 * 
 * @return {String}
 */
proto.color = function() {
  return this.data.color;
};

module.exports = Rule;
