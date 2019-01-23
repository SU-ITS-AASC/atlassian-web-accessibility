// src/js/jquery/jquery.moveto.js
(typeof window === 'undefined' ? global : window).__25e29eb27170014b389726db2d540673 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  /**
   *
   * @module Controls
   * @requires AJS, jQuery
   */
  
  /**
   * If not visible, moves the scroll position of the screen to the element
   *
   * <pre>
   * <strong>Usage:</strong>
   * jQuery("li.item").moveTo();
   * </pre>
   *
   * This plugin also supports options as an argument.  The options
   * that can be defined are:
   * <ul>
   * <li>transition - if set to true will cause a smooth scrolling transition (false by default)</li>
   * <li>scrollOffset - defines an offset to scroll past the element to view in pixels such that
   * all of it can be viewed (35 pixels by default)</li>
   * </ul>
   *
   * @class moveTo
   * @constuctor moveTo
   * @namespace jQuery.fn
   * @param {Object} options
   */
  jQuery.fn.moveTo = function (options) {
      var defaults = {
          transition: false,
          scrollOffset: 35
      };
  
      var opts = jQuery.extend(defaults, options);
      var instance = this;
      var topOffset = instance.offset().top;
      var scrollTarget;
  
      if ((jQuery(window).scrollTop() + jQuery(window).height() - this.outerHeight() < topOffset || jQuery(window).scrollTop() + opts.scrollOffset > topOffset) && jQuery(window).height() > opts.scrollOffset) {
  
          if (jQuery(window).scrollTop() + opts.scrollOffset > topOffset) {
              //move up
              scrollTarget = topOffset - (jQuery(window).height() - this.outerHeight()) + opts.scrollOffset;
          } else {
              //move down
              scrollTarget = topOffset - opts.scrollOffset;
          }
  
          if (!jQuery.fn.moveTo.animating && opts.transition) {
              jQuery(document).trigger('moveToStarted', this);
              jQuery.fn.moveTo.animating = true;
              jQuery('html,body').animate({
                  scrollTop: scrollTarget
              }, 1000, function () {
                  jQuery(document).trigger('moveToFinished', instance);
                  delete jQuery.fn.moveTo.animating;
              });
              return this;
          } else {
              var jQueryCache = jQuery('html, body');
              if (jQueryCache.is(':animated')) {
                  jQueryCache.stop();
                  delete jQuery.fn.moveTo.animating;
              }
  
              jQuery(document).trigger('moveToStarted');
              jQuery(window).scrollTop(scrollTarget);
              //need to put a slight timeout for the moveToFinished event such that recipients of this event
              //have time to act on it.
              setTimeout(function () {
                  jQuery(document).trigger('moveToFinished', instance);
              }, 100);
              return this;
          }
      }
      jQuery(document).trigger('moveToFinished', this);
      return this;
  };
  
  return module.exports;
}).call(this);