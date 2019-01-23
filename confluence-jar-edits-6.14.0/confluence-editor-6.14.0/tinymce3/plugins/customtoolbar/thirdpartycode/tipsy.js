// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

// Modified by Atlassian

(function($) {

    // ATLASSIAN - CONF-30162 Improved version of autoBounds for automatic placement of chunky tips
    // The original autoBounds failed in two regards: 1. it would never return a 'w' or 'e', gravity even if they
    // were preferred and/or optimal, 2. it only respected the margin between the left hand side of an element and
    // left hand side of the viewport, and the top of an element and the top of the viewport. This version checks
    // to see if the bottom of an element is too close to the bottom of the screen, similarly for the right hand side
    $.fn.tipsy.autoBounds2 = function(margin, prefer) {
        return function() {
            var dir = {};
            var boundTop = $(document).scrollTop() + margin;
            var boundLeft = $(document).scrollLeft() + margin;
            var $this = $(this);

            // bi-directional string (ne, se, sw, etc...)
            if (prefer.length > 1) {
                dir.ns = prefer[0];
                dir.ew = prefer[1];
            } else {
                // single direction string (e, w, n or s)
                if (prefer[0] == 'e' || prefer[0] == 'w') {
                    dir.ew = prefer[0];
                } else {
                    dir.ns = prefer[0];
                }
            }

            if ($this.offset().top < boundTop) { dir.ns = 'n'; }
            if ($this.offset().left < boundLeft) { dir.ew = 'w'; }
            if ($(window).width() + $(document).scrollLeft() - ($this.offset().left + $this.width()) < margin) { dir.ew = 'e'; }
            if ($(window).height() + $(document).scrollTop() - ($this.offset().top + $this.height()) < margin) { dir.ns = 's'; }

            if (dir.ns) {
                return dir.ns + (dir.ew ? dir.ew : '');
            }
            return dir.ew;
        };
    };
})($);