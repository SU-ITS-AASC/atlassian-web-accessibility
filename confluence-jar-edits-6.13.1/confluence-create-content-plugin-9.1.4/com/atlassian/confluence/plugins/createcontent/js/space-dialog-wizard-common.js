AJS.toInit(function ($) {

    var $keyField, $nameField, $submitButton, keyErrors, nameErrors,
            keyValidationRequest, keygenTimeout = 100,
            deferreds = {
                name: $.Deferred().reject(),
                spaceKey: $.Deferred().reject()
            };

    var validationFunctions = {
        spaceKey: function() {
            var deferred = $.Deferred();
            var value = $.trim($keyField.val());
            if (!value) {
                deferred.reject(AJS.I18n.getText('space.key.empty'));
                deferreds.spaceKey = deferred;
                return deferred.promise();
            }

            if (keyValidationRequest) {
                AJS.log('Aborting previous space key validation request.');
                keyValidationRequest.abort();
            }
            keyValidationRequest = $.getJSON(AJS.Confluence.getContextPath() + "/ajax/spaceavailable.action", {key: value}).done(function(data) {
                if (!data.available && data.message)
                    deferred.reject(data.message);
                else
                    deferred.resolve();

                keyValidationRequest = false;
            });

            deferreds.spaceKey = deferred;
            return deferred.promise();
        },

        name: function () {
            var deferred = $.Deferred();
            if (!$.trim($nameField.val())) {
                deferred.reject(AJS.I18n.getText('space.name.empty'));
            } else {
                deferred.resolve();
            }
            deferreds.name = deferred;
            return deferred.promise();
        }
    };

    /**
     *  A utility function for IE and Firefox specifically that will select all text in the supplied textbox control.
     *
     * Webkit has a more sensible behaviour on focus so doesn't need this.
     */
    function selectAll($textbox) {
        var textElem = $textbox[0];
        if (textElem.setSelectionRange) {
            var length = $textbox.val().length;
            textElem.setSelectionRange(0, length);
        } else if (textElem.createTextRange) {
            var range = textElem.createTextRange();
            range.execCommand("SelectAll");
            range.select();
        }
    }

    function enableSubmit(enabled) {
        if (enabled) {
            $submitButton.removeAttr('disabled');
        } else {
            $submitButton.attr('disabled', 'disabled');
        }
    }

    function validateField(field) {
        var fieldKey = field.attr('name');
        var errorContainer = field.siblings('.error');

        // We use a deferred so that sync and async Validation can be treated the same.
        var promise = validationFunctions[fieldKey]();
        promise.done(function () {
            // Validation OK
            errorContainer.text('').addClass('hidden');
        });
        promise.fail(function (message, canceled) {
            if(!canceled) {
                // Validation BAD
                errorContainer.text(message).removeClass('hidden');
            }
        });
        promise.always(function () {
            // For testability
            field.attr("data-validated-value", field.val());
        });
        return promise;
    }

    /**
     * Wires up a form with the Key Generator, Key description URL updater and AJAX validation.
     */
    function bindToForm($createSpaceForm) {
        enableSubmit(false);

        $keyField = $createSpaceForm.find("input[name='spaceKey']").first();
        $nameField = $createSpaceForm.find("input[name='name']").first();
        keyErrors = $keyField.parent().find('.error');
        nameErrors = $nameField.parent().find('.error');

        // validate generated keys ...
        $keyField.generateFrom($nameField, {
            uppercase: false,
            maxNameLength: 255,
            maxKeyLength: 255,
            timeoutMS: keygenTimeout,
            validationCallback: function () {
                // Called when the key is changed
                $keyField.trigger("input");
            }
        });

        function cancelIfNotResolved(deferred) {
            if (deferred.state() === "pending") {
                deferred.reject("", true);
            }
        }

        /**
         * since validation is deferred based, on 'input' the following must be done:
         * 1) Rejects all unresolved deferreds with a cancel flag (to prevent error messages from displaying)
         * 2) Create new validation deferreds for the current input (and register it in a deferreds object)
         * 3) Create an aggregate promise to control the state of the "Create" button
         */
        function onInput() {
            validateField($(this));

            $.when.apply($, _.values(deferreds)).done(function() {
                enableSubmit(true);
            }).fail(function(message, canceled) {
                if(!canceled) {
                    enableSubmit(false);
                }
            });
        }

        // ... and hand crafted keys and names...
        var throttledName = $.debounce(onInput, 250);
        var throttledKey = $.debounce(onInput, 250);
        $nameField.on("change input", function () {
            throttledName.apply(this, arguments);
        });
        $keyField.on("change input", function () {
            _.each(deferreds, cancelIfNotResolved);
            keyValidationRequest && keyValidationRequest.abort();
            throttledKey.apply(this, arguments);
        });

        // ensure selection works correctly in IE
        $keyField.focus(function () {
            selectAll($keyField);
        });

        // Toggle the 'Locked' padlock icon when the checkbox is changed.
        $createSpaceForm.find('#permission-private').change(function() {
            $('#permissions-group').toggleClass('aui-iconfont-unlocked');
            $('#permissions-group').toggleClass('aui-iconfont-locked');
        });
    }

    // Space key icon help tooltip
    var defaultOptions = {
        live: true, // Created links are handled automatically
        gravity: 'w', // Point the arrow to the left
        title: 'data-tooltip',
        delayIn: 250,
        delayOut: 0
    };
    $(".common-space-form .aui-iconfont-help").tooltip(defaultOptions);

    /**
     * Exposes methods for rendering and validating a Create Space form in the Space Blueprint dialog.
     *
     * @type {{preRender: Function, postRender: Function, submit: Function}}
     */
    Confluence.SpaceBlueprint.CommonWizardBindings = {

        preRender: function (e, state) {
            state.soyRenderContext['atlToken'] = AJS.Meta.get('atl-token');
            state.soyRenderContext['showSpacePermission'] = true;
        },

        postRender: function (e, state) {
            $submitButton = $('.create-dialog-create-button:visible');
            bindToForm(state.$container);
        },

        submit: function (e, state) {
            // We do it after a delay of keygenTimeout + 1 so that the keygen has a chance to update the key field first.
            setTimeout(function() {
                // Validation on submit is required because there can be cases where a key and then enter is pressed so fast
                // that the keydown event that calls submit is called before the keyup event that validates the form. This
                // would make the form think it is in a valid state and try to submit, causing it to end up on the create
                // space page if the key being pressed with enter causes the key/name to be invalid.
                var keyDeferred = validateField($keyField);
                var nameDeferred = validateField($nameField);

                $.when(keyDeferred, nameDeferred).done(
                        state.validationDeferred.resolve   // both key and name ok    :)
                    ).fail(function () {
                        state.validationDeferred.reject.apply(this, arguments);     // key and/or name no good :(
                        enableSubmit(false);
                    }
                );
            }, keygenTimeout + 1);

            var $inputForm = $('form.common-space-form');
            var blueprintKey = 'unknown';
            if($inputForm.length) {
                //this assumes that all blueprints with forms will have an id (which all our current ones abide by), however may
                //incorrectly post as blank-space for a custom user created blueprint without an id...
                blueprintKey = $inputForm.attr('id') || 'blank-space';
            }

            AJS.Analytics ? AJS.Analytics.triggerPrivacyPolicySafeEvent("confluence-spaces.blueprint-created", {blueprint: blueprintKey }) :
                AJS.trigger('analyticsEvent', {name: 'confluence-spaces.blueprint-created', data : {blueprint: blueprintKey}});

            // Submission shouldn't continue until the validation is complete.
            state.async = true;
            return false;
        }
    };
});
