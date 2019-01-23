/**
 * @module jQuery
 * @namespace jQuery.fn
 */

/**
 * A jQuery plugin that detects if form fields have been modified before navigating away from the page. If fields have
 * been modified the user will be confronted with a dialog that will give him the option to leave the page and
 * lose his/her changes or to cancel.
 *
 * The plugin makes use of jQuery "live" events, which enables the plugin to include fields that are added to the DOM
 * by JavaScript.
 *
 * Please note that modified hidden fields will NOT be detected.
 *
 * @class isDirty
 * @param {Object}
 * <dl>
 *      <dt>ignoreUnloadFromElems</dt>
 *      <dd>{String} Selector of links to invalidate dirty filter</dd>
 * </dl>
 *
 * @use
 * <pre>
 *      jQuery("form[name=jiraform], #jqlform, form[name=filterform]").isDirty({
 *          ignoreUnloadFromElems: "#switchnavtype, #refresh-dependant-fields"
 *      });
 * </pre>
 */
jQuery.fn.isDirty = function () {
    var pageModified;
    var fields = [];

    window.onbeforeunload = function () {

        var onunload = window.onbeforeunload;

        if (pageModified !== false) {
            jQuery.each(fields, function () {
                if (this.initVal !== $(this).val()) {
                    pageModified = true;
                    return false;
                }
            });
        }

        if (pageModified) {
            // dirty dirty hack to stop firefox from calling event twice
            window.onbeforeunload = null;
            window.setTimeout(function () {
                jQuery(document).bind('mousemove', function () {
                    window.onbeforeunload = onunload;
                    jQuery(document).unbind('mousemove', arguments.callee);
                });
            }, 1000);
            pageModified = void(0);
            return AJS.params.dirtyMessage || '';
        }
    };

    return function (options) {

        if (this.length === 0) {
            return;
        }

        function storeField (e) {
            var $this = jQuery(this);
            jQuery.fn.isDirty.fieldInFocus = $this;
            if (jQuery.inArray(this, fields) === -1) {
                this.initVal = $this.val();
                fields.push(this);
                $this.die(e.type, storeField);
            }
        }

        jQuery(':not(:input)').live('click', function () {
            delete jQuery.fn.isDirty.fieldInFocus;
        });

        jQuery(':input[type != hidden]', this.selector)
            .bind('keydown', storeField)
            .bind('keypress', storeField)
            .bind('click', storeField);

        jQuery(options.ignoreUnloadFromElems).live('mousedown', function () {
            pageModified = false;
        });

        this.each(function () {
            this.onsubmit = function (onsubmit) {
                return function () {
                    pageModified = false;
                    if (onsubmit) {
                        return onsubmit.apply(this, arguments);
                    }
                };
            }(this.onsubmit);
            $(this).submit(function () {
                pageModified = false;
            });
        });
        return this;
    };
}();
