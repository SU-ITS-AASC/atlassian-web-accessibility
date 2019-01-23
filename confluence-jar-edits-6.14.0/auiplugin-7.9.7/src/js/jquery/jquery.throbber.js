
/**
 * @function {Public}
 * @param {Object} target - jQuery object we will be applying the loadingClass to.
 * @param {Object} settings
 * @.. {String} isLatentThreshold (ms) - will wait for this amount of time, after which if the request has not come back, will add the loadingClass
 * @.. {String} minThrobberDisplay (ms) - minimum amount of time to display throbber, avoids flicker.
 * @.. {String} loadingClass - className applied to target element
 * @return {Object} jQuery object that has new hideThrobber & showThrobber methods
 */
jQuery.fn.throbber = function ($) {

    return function () {
        // private

        var instances = [];
        var defaults = {isLatentThreshold: 100, minThrobberDisplay: 200, loadingClass: 'loading'};

        // global definition
        $(document).ajaxComplete(function (jObj, response) {
            $(instances).each(function (idx) {
                // make sure we are dealing with the right request
                if (response === this.get(0)) {
                    this.hideThrobber();
                    // cleanup
                    instances.splice(idx,1);
                }
            });
        });

        return function (settings) {
            /** {Function} - defined by hideThrobber but run by either showThrobber or hideThrobber depending if the request is latent */
            var hide;
            var target;

            /**
             * Runs a callback after specified delay
             * @method {private} delay
             * @param {Integer} l - length of delay (ms)
             * @param {Function} callback - function to run after delay
             */
            var delay = function (callback, l) {
                delay.t = setTimeout(function () {
                    clearTimeout(delay.t);
                    delay.t = undefined;
                    callback();
                }, l);
            };

            settings = $.extend(defaults, settings || {});

            if (!settings.target) {
                return this;
            }

            // make sure we are dealing with a jquery object
            target = jQuery(settings.target);

            instances.push($.extend(this, {
                /**
                 * Adds loadingClass to target htmlElement after the request appears to be latent
                 * @function {Public} showThrobber
                 */
                showThrobber: function () {
                    delay(function () {
                        if (!hide) {
                            target.addClass(settings.loadingClass);
                            delay(function () {
                                if (hide) {
                                    hide();
                                }
                            }, settings.minThrobberDisplay);
                        }
                    }, settings.isLatentThreshold);
                },

                /**
                 * removes loadingClass from target htmlElement
                 * @function {Public} showThrobber
                 */
                hideThrobber: function () {
                    hide = function () {
                        target.removeClass(settings.loadingClass);
                        if (settings.end) {
                            settings.end();
                        }
                    };
                    if (!delay.t) {
                        hide();
                    }
                }
            }));

            // lets initiate this instance
            this.showThrobber();
            return this;
        };
    }();
}(jQuery);
