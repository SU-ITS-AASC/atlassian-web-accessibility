/**
 * The components that can be used on a custom toolbar.
 *
 * These objects are made available in the Confluence.Editor.Toolbar.Components namespace.
 * @module confluence-editor/tinymce3/plugins/customtoolbar/custom-toolbar-components
 */
define('confluence-editor/tinymce3/plugins/customtoolbar/custom-toolbar-components', [
    'jquery'
], function(
    $
) {
    "use strict";

    var CustomToolbarComponents = {};

    /**
     * options:
     *  @param text the text for the button
     *  @param iconClass the CSS class for the icon on the button
     *  @param click the click function for the button
     *  @param disabled true if the button should default to disabled.
     */
    CustomToolbarComponents.Button = function (options) {
        var text = options.text;
        var tooltip = options.tooltip;
        var triggerText = options.triggerText;
        var iconClass = options.iconClass;
        var click = options.click;
        var disabled = !!options.disabled;
        var id = options.id;

        /**
         * Create and return a visual representation of this component.
         */
        this.render = function() {

            var button = $('<button type="button"></button>').addClass("aui-button aui-button-subtle").attr('data-tooltip', tooltip || text);
            if (id) {
                button.attr("id", id);
            }

            if (disabled) {
                button.prop("disabled", true).attr("aria-disabled", "true");
            }

            button.click(function(e) {
                if (!button.prop("disabled")) {
                    click();
                }
            });

            if (iconClass) {
                var span = $("<span />");
                span.addClass("icon " + iconClass);
                span.text(text);
                button.append(span);
            }

            if(triggerText) {
                var triggerSpan = $("<span />");
                triggerSpan.addClass('trigger-text');
                triggerSpan.text(triggerText);
                button.append(triggerSpan);
            }

            return button[0];
        };
    };

    /**
     * options:
     *  @param id id of the control
     *  @param text the text for the button
     *  @param iconClass the CSS class for the icon on the button
     *  @param disabled true if the button should default to disabled.
     *  @param dropDownContent markup or element for inserting into the dropDownContainer;
     */
    CustomToolbarComponents.DropDownButton = function (options) {
        var id = options.id;
        var tooltip = options.tooltip;
        var text = options.text || "";
        var iconClass = options.iconClass;
        var disabled = !!options.disabled;
        var dropDownContent = options.dropDownContent;

        var dropDownContainer;

        /**
         * Create and return a visual representation of this component.
         */
        this.render = function() {

            var li = $("<div></div>").addClass("toolbar-item").addClass("toolbar-dropdown").attr('data-tooltip', tooltip);
            li.attr('id', id);
            var parent = $("<div/>").addClass("aui-dd-parent");
            var a = $("<a href='#'></a>");
            a.addClass("toolbar-trigger").addClass("aui-dd-trigger").addClass("aui-button");
            text && a.append("<span class='dropdown-text'>" + text + "</span>");

            if (disabled) {
                li.addClass("disabled");
                a.addClass("disabled");
            }

            if (iconClass) {
                var span = $("<span />");
                span.addClass("icon " + iconClass);
                span.text(text);
                a.append(span);
            }

            var dropDownIcon = $("<span/>");
            dropDownIcon.addClass("icon").addClass("icon-dropdown");
            a.append(dropDownIcon);

            dropDownContainer = $("<div/>").addClass("hidden").addClass("aui-dropdown");
            if(dropDownContent) {
                dropDownContainer.append(dropDownContent);
            }

            parent.append(a);
            parent.append(dropDownContainer);
            li.append(parent);

            return li[0];
        };
    };

    /**
     * options:
     *  @param text the text for the button
     *  @param click the click function for the button
     *  @param disabled true if the button should default to disabled.
     *  @param textClass the css class for the button text
     */
    CustomToolbarComponents.TextButton = function (options) {
        var text = options.text;
        var textClass = options.textClass;
        var click = options.click;
        var disabled = !!options.disabled;
        var tooltip = options.tooltip;

        /**
         * Create and return a visual representation of this component.
         */
        this.render = function() {

            var button = $('<button type="button"></button>').addClass("aui-button aui-button-subtle").addClass(textClass).text(text);
            if(tooltip) {
                button.attr('data-tooltip', tooltip);
            }

            if (disabled) {
                button.prop("disabled", true).attr("aria-disabled", "true");
            }

            button.click(function(e) {
                if (!button.prop("disabled")) {
                    click();
                }
            });

            return button[0];
        };
    };

    /**
     * options:
     * @param id the id for the text box (should be unique)
     * @param text the title for the text box (should be i18n)
     * @param name the name for the text box (should not be i18n)
     * @param keydown the keydown function
     * @param cssClass the css class
     */
    CustomToolbarComponents.TextBox = function (options) {
        var id = options.id;
        var text = options.text;
        var name = options.name;
        var keydown = options.keydown;
        var cssClass = options.cssClass;

        this.render = function()
        {
            var div = $("<div></div>").addClass("toolbar-item");
            div.append($("<label for='" + id + "'>" + text + "</label>"));
            var input = $("<input id='" + id + "' type='text' name='" + name + "' class='" + cssClass + " text' autocomplete='off'>");
            input.keydown(function(e) {
                keydown(e);
            });

            div.append(input);
            return div[0];
        };
    };

    /**
     * Create a group of other controls. This group will be visually separate from other groups.
     *
     * @param contents an array of other components that should be in this group. (Don't nest groups.)
     * @param options optional parameters for the group:
     *   @param id the id for the group
     *   @param groupClass the class for the group
     */
    CustomToolbarComponents.Group = function (contents, options) {

        var components = contents;

        /**
         * Create and return the visual representation of the spacer.
         */
        this.render = function() {
            var group = $("<div></div>");
            group.addClass("aui-buttons");

            if(options) {
                options.id && group.attr('id', options.id);
                options.groupClass && group.addClass(options.groupClass);
            }

            for (var i = 0, length = components.length; i < length; i++) {
                group.append(components[i].render());
            }

            return group[0];
        };
    };

    /**
     * Create a group of other controls. This group will be visually separate from other groups.
     *
     * @param contents an array of other components that should be in this group. (Don't nest groups.)
     * @param options optional parameters for the group:
     *   @param id the id for the group
     *   @param groupClass the class for the group
     */
    CustomToolbarComponents.SplitGroup = function (contents, options) {

        var components = contents;
        var dropDownOptions = (options && options.dropDownOptions) || {};

        function renderDropDown() {

            var id = dropDownOptions.id;
            var disabled = dropDownOptions.disabled;
            var dropDownContent = dropDownOptions.dropDownContent;
            var title = dropDownOptions.title;
            var alignment = dropDownOptions.alignment;

            var dropDownContainer;

            var li = $("<div></div>").addClass("toolbar-item").addClass("toolbar-dropdown").addClass("toolbar-splitbutton");
            id && li.attr('id', id);
            title && li.attr({'data-tooltip' : title });
            alignment && li.data('dropdown-alignment', alignment);
            var parent = $("<div/>").addClass("aui-dd-parent");
            var a = $("<a href='#'></a>");
            a.addClass("toolbar-trigger aui-dd-trigger aui-button");

            if (disabled) {
                li.addClass("disabled");
                a.addClass("disabled");
            }

            var dropDownIcon = $("<span/>");
            dropDownIcon.addClass("icon").addClass("icon-dropdown");
            a.append(dropDownIcon);

            dropDownContainer = $("<div/>").addClass("hidden").addClass("aui-dropdown");
            if(dropDownContent) {
                dropDownContainer.append(dropDownContent);
            }

            parent.append(a);
            parent.append(dropDownContainer);
            li.append(parent);

            return li[0];
        }

        /**
         * Create and return the visual representation of the spacer.
         */
        this.render = function() {
            var group = $("<div></div>");
            group.addClass("aui-buttons");

            if(options) {
                options.id && group.attr('id', options.id);
                options.groupClass && group.addClass(options.groupClass);
            }

            for (var i = 0, length = components.length; i < length; i++) {
                group.append(components[i].render());
            }

            // Add dropdown
            group.append(renderDropDown(options));

            options && options.postProcess && options.postProcess(group);

            return group[0];
        };
    };

    return CustomToolbarComponents;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/customtoolbar/custom-toolbar-components', 'Confluence.Editor.Toolbar.Components');