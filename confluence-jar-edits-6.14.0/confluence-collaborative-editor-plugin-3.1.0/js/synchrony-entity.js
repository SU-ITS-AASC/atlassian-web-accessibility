define('confluence-collaborative-editor-plugin/synchrony-entity', [
    'jquery',
    'ajs',
    'confluence-collaborative-editor-plugin/synchrony-auth',
    'confluence-collaborative-editor-plugin/synchrony-util',
    'confluence-collaborative-editor-plugin/unsupported-extension',
    'confluence-collaborative-editor-plugin/util/is-valid-uri'
], function ($,
             AJS,
             Auth,
             Util,
             UnsupportedExtension,
             isValidUri) {
    'use strict';

    function rxTest(rx) {
        return function (value) {
            // deletes are always allowed
            return null === value || rx.test(value);
        };
    }

    /**
     * !! WARNING !!
     *
     * Modifying this whitelist can introduce XSS attack vectors!
     *
     * Do not modify the whitelist unless you are 100% sure you know
     * what you are doing. Never do this
     *
     *   'some-attribute': true,
     *
     * Or this
     *
     *   'some-style': true
     *
     * Use restrictive regexes to whitelist the individual characters
     * that are allowed in the attribute or style instead:
     *
     *   var numbers = function (value) { return null == value || (/^[0-9]$/).test(value); }
     *
     *   'some-attribute': numbers,
     *   'some-style': numbers
     *
     * TODO: change all the true values in this whitelist to a restrictive regex.
     */
    function makeWhitelist(Synchrony) {
        var cssQuiteSafeValueTest = rxTest(/^[\w\.\-\+\%]+$/i);
        return $.extend({}, Synchrony.whitelists.tinymce, {
            'styles': $.extend({}, Synchrony.whitelists.tinymce.styles, {
                // Syncing the padding-top on the body element will
                // cause an infinite sync loop (WD-170). Other
                // padding-* styles are blacklisted for
                // completeness.
                'padding-top': false,
                'padding-right': false,
                'padding-bottom': false,
                'padding-left': false,
                'padding': false,
                'display': cssQuiteSafeValueTest,
                'list-style-type': cssQuiteSafeValueTest
            }),
            'attributes': $.extend({}, Synchrony.whitelists.tinymce.attributes, {
                // ** Image effects support
                'confluence-query-params': true,
                'data-element-title': true,
                // --end image effects support
                // ** inline comments support
                'data-ref': true,
                // -- end inline comments support
                //Extra HTML attributes CONF uses
                'accesskey': true,
                'datetime': true,
                'data-anchor': true,
                'data-encoded-xml': true,
                'data-highlight-class': true,
                'data-highlight-colour': true,
                'data-space-key': true,
                'data-username': true,
                // ** space-list macro
                'data-entity-id': true,
                'data-entity-type': true,
                'data-favourites-bound': true,
                // -- end space-list macro
                // ** macro placeholder support
                'data-macro-id': true,
                'data-macro-name': true,
                'data-macro-schema-version': true,
                'data-macro-body-type': true,
                'data-macro-parameters': true,
                'data-macro-default-parameter': true,
                // -- end macro placeholder support
                // ** page layout support
                'data-atlassian-layout': true,
                'data-placeholder-type': true,
                'data-layout': true,
                'data-title': true,
                'data-type': true,
                // -- end page layout support
                // ** inline task support
                'data-inline-task-id': true,
                'data-inline-tasks-content-id': true,
                // -- end inline task support
                // ** WD-323
                'data-base-url': true,
                'data-linked-resource-id': true,
                'data-linked-resource-type': true,
                'data-linked-resource-version': true,
                'data-linked-resource-default-alias': true,
                'data-linked-resource-container-version': true,
                'data-linked-resource-content-type': true,
                // -- end WD-323
                'data-unresolved-comment-count': true,
                'data-location': true,
                'data-image-height': true,
                'data-image-width': true,
                'data-attachment-copy': true,
                // -- end WD-323
                'data-content-title': true,
                //CONFSERVER-51998
                'data-filename' : true ,
                href: isValidUri
            }),
            'classes': function (className) {
                switch (className) {
                    case 'mceSelected':
                    case 'active-resizable':
                        return false;
                        break;

                    default:
                        return true;
                }
            },
            'elements': $.extend({}, Synchrony.whitelists.tinymce.elements, {
                // ** date lozenge support
                'time': true,
                // -- end date lozenge support
                'mark': true,
                'label': true,
                'form': true
            })
        });
    }

    function makeBindArgs(Synchrony, editor, htmlDoc) {
        var whitelist = makeWhitelist(Synchrony);
        return {
            'profile': 'tinymce',
            'selectionCorrections': false,
            'telepointer': {
                'refreshOnResize': true,
                'label': {
                    'hover': true,
                    'movement': 1000,
                    'text': function (session) {
                        try {
                            var name = session.fullname || AJS.I18n.getText("anonymous.name");
                            return name.charAt(0).toUpperCase();
                        } catch (e) {
                            AJS.log(e);
                        }
                        return '&#9786;';
                    }
                }
            },
            'tinymce': {
                'monkeyPatchUndoManager': true,
                'instance': editor
            },
            whitelist: function (validationProps) {
                var isBody = validationProps.domNode === htmlDoc;
                var isElement = validationProps.type === 'node';
                var isDataTitleAttr = validationProps.type === 'attribute' && validationProps.name === 'data-title';

                //For the body, we only want to whitelist the element itself and the data-title attribute
                //The rest should stay as it is (i.e. not sycnhronised or removed)
                if (isBody) {
                    return isElement || isDataTitleAttr;
                }

                return Synchrony.isWhitelisted(whitelist, validationProps);
            },
            domReadHook: function () {
                AJS.trigger("cursor-target-refresh");
                UnsupportedExtension.check();
            }
        };
    }

    function bind(Synchrony, editor, htmlDoc, history, content) {
        return Synchrony.entity({
            url: Util.getServiceUrl(),
            entityId: Util.getEntityId(),
            jwt: Auth.getTokenPromise,
            initRev: content.confRev,
            history: history,
            presence: true,
            useFallback: Util.getXhrFallbackFlag()
        }).bind(
            htmlDoc,
            makeBindArgs(Synchrony, editor, htmlDoc)
        );
    }

    return {
        bind: bind,
        makeWhitelist: makeWhitelist
    };
});
