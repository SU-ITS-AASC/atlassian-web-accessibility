/**
 * @module confluence-quick-edit/captcha-manager
 */
define('confluence-quick-edit/captcha-manager', [
    'jquery',
    'ajs'
], function(
    $,
    AJS
) {
    "use strict";

    /**
     * Handles common captcha operations
     * @constructor
     */
    return function (container) {

        var CAPTCHA_ID_SELECTOR = 'input[name="captchaId"]';
        var CAPTCHA_RESPONSE_SELECTOR = 'input[name="captchaResponse"]';
        var CAPTCHA_IMAGE_SELECTOR = 'img.captcha-image';

        function findInContainer(selector){
            return $(container || 'body').find(selector);
        }

        function setCaptchaID(id){
            findInContainer(CAPTCHA_ID_SELECTOR).val(id);
        }

        function setCaptchaImg($img, id){
            $img.attr("src", AJS.contextPath() + "/jcaptcha?id=" + id);
        }

        function cleanCaptchaResponseInput() {
            findInContainer(CAPTCHA_RESPONSE_SELECTOR).val('');
        }

        return {
            /**
             * If captcha is enabled, it generates a random new captcha, sets the right ID
             * and fetches the corresponding image for it from the server
             */
            refreshCaptcha: function () {
                var $img = findInContainer(CAPTCHA_IMAGE_SELECTOR);
                if ($img.length > 0) { // captcha enabled
                    var newCaptchaId = Math.random();
                    setCaptchaImg($img, newCaptchaId);
                    setCaptchaID(newCaptchaId);
                    cleanCaptchaResponseInput();
                }
            },

            /**
             * Returns an object encapsulating the captcha challenge information
             * (image id and user response)
             *
             * @returns {{id: *, response: *}}
             */
            getCaptchaData: function () {
                return {
                    id: findInContainer(CAPTCHA_ID_SELECTOR).val(),
                    response: findInContainer(CAPTCHA_RESPONSE_SELECTOR).val()
                };
            }
        };
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/captcha-manager', 'AJS.Confluence.QuickEditCaptchaManager');