(window.__auiJsonp=window.__auiJsonp||[]).push([["aui.component.form-validation"],{"0+Cw":function(a,e,t){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=u(t("+x/D")),n=function(a){if(a&&a.__esModule)return a;var e={};if(null!=a)for(var t in a)Object.prototype.hasOwnProperty.call(a,t)&&(e[t]=a[t]);return e.default=a,e}(t("JFi+"));function u(a){return a&&a.__esModule?a:{default:a}}var r=["displayfield","watchfield","when","novalidate","state"],l=[];var d={register:function(a,e){var t;if("string"==typeof a)t=a;else{var u=function(a){var e=!1;return a.some(function(a){var t=-1!==i.default.inArray(a,r);return t&&(e=a),t}),e}(a);if(u)return n.warn('Validators cannot be registered with the argument "'+u+'", as it is a reserved argument.'),!1;t="[data-aui-validation-"+a.join("],[data-aui-validation-")+"]"}var d={validatorFunction:e,validatorTrigger:t};return l.push(d),d},validators:function(){return l}};(0,u(t("TmQU")).default)("aui/form-validation/validator-register",d),e.default=d,a.exports=e.default},"6rRy":function(a,e,t){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=f(t("+x/D"));t("U8Ze"),t("Ikcz");var n=f(t("TmQU")),u=function(a){if(a&&a.__esModule)return a;var e={};if(null!=a)for(var t in a)Object.prototype.hasOwnProperty.call(a,t)&&(e[t]=a[t]);return e.default=a,e}(t("bPPT")),r=f(t("KloK")),l=f(t("4dFR")),d=f(t("0+Cw"));function f(a){return a&&a.__esModule?a:{default:a}}var o="aui-validation-",c="data-aui-notification-",s="aui-validation-state",v="invalid",g="valid",m="validating",h="unvalidated",p="_aui-form-validation-initialised",k="_aui-internal-field-state-changed";function x(a){(function(a){return a.hasClass(p)})(a)||(!function(a){M(a).attr("data-aui-notification-field","")}(a),function(a){a.addClass(p)}(a),function(a){(function(a){var e,t=function(){a.trigger("aui-stop-typing")};a.on("keyup",function(){clearTimeout(e),e=setTimeout(t,1500)})})(a),function(a){var e=y(a,"when"),t=y(a,"watchfield");(t?a.add("#"+t):a).on(e,function(){b(a)})}(a)}(a),w(a,h))}function b(a){if(!y(a,"novalidate"))return function(a){!function(a){_(M(a),"none")}(a);var e=function(a){var e=[];return T().forEach(function(t,i){var n=t.validatorTrigger;a.is(n)&&e.push(i)}),e}(a);w(a,m);var t=function(a,e){var t=[];return e.forEach(function(e){var n=T()[e].validatorFunction,r=new i.default.Deferred;n(function(a,e){var t={validate:function(){e.resolve()},invalidate:function(t){w(a,v,t),e.reject()},args:function(a){return function(e){return a.attr("data-"+o+e)||a.attr(e)}}(a),el:a[0],$el:a};return u.prop(t,"$el",{sinceVersion:"5.9.0",removeInVersion:"9.0.0",alternativeName:"el",extraInfo:"See https://ecosystem.atlassian.net/browse/AUI-3263."}),t}(a,r)),t.push(r)}),t}(a,e),n=i.default.when.apply(i.default,t);return n.done(function(){w(a,g)}),n}(a);w(a,g)}function y(a,e){var t=a.attr("data-"+o+e);return t||(t={when:"change"}[e]),t}function T(){return d.default.validators()}function w(a,e,t){if(a.attr("data-"+s,e),e!==h){a.trigger(i.default.Event(k));var n=M(a),u={};u[m]="wait",u[v]="error",u[g]="success";var r=u[e];e===m?function(a){setTimeout(function(){var e=D(a)===m;e&&_(a,"wait")},500)}(a):_(n,r,t)}}function _(a,e,t){var i=function(a){return a.is("["+c+"wait]")}(a);if(function(a){O(a,"wait"),O(a,"success")}(a),!("success"===e&&!i))if("none"===e)O(a,"error");else{var n=a.attr(c+e)||"[]",u=t?function(a,e){var t=JSON.parse(e).concat([a]);return JSON.stringify(t)}(t,n):"";a.attr(c+e,u)}}function O(a,e){a.removeAttr(c+e)}function M(a){var e=y(a,"displayfield");return void 0===e?a:(0,i.default)("#"+e)}function D(a){return a.attr("data-"+s)}function I(a,e){e.preventDefault(),a.one(k,function(){a.trigger("submit")})}function A(a,e){var t="[data-"+s+"="+e+"]";return a.find(t)}(0,i.default)(document).on("submit",function(a){var e=a.target,t=(0,i.default)(e),n=function(a){return function(a){var e=-1!==a.indexOf(v),t=-1!==a.indexOf(h),i=-1!==a.indexOf(m);return e?v:t?h:i?m:g}(function(a){return i.default.map(a,function(a){return D((0,i.default)(a))})}(a.find("."+p)))}(t);if(n===h)I(t,a),function(a){A(a,h).each(function(a,e){E.validate((0,i.default)(e))})}(t);else if(n===m)I(t,a);else if(n===v)a.preventDefault(),function(a){A(a,v).first().focus()}(t);else if(n===g){var u=i.default.Event("aui-valid-submit");t.trigger(u),u.isDefaultPrevented()&&a.preventDefault()}});var E={register:d.default.register,validate:function(a){b(a=(0,i.default)(a))}};(0,l.default)("data-aui-validation-field",{attached:function(a){a.form&&a.form.setAttribute("novalidate","novalidate"),x((0,i.default)(a)),l.default.init(a)},type:l.default.type.ATTRIBUTE}),(0,n.default)("aui/form-validation",E),(0,r.default)("formValidation",E),e.default=E,a.exports=e.default},Ikcz:function(a,e,t){"use strict";var i=l(t("+x/D")),n=l(t("TmQU")),u=(l(t("uDDF")),l(t("HH5i"))),r=l(t("0+Cw"));function l(a){return a&&a.__esModule?a:{default:a}}function d(a){var e=a.el.value.length,t=0===e,i=parseInt(a.args("minlength"),10),n=parseInt(a.args("maxlength"),10);if(i&&n&&i===n&&!t&&e!==i){var u=g("exactlength",a.args,[i]);a.invalidate(u)}else if(i&&e<i&&!t){var r=g("minlength",a.args);a.invalidate(r)}else if(n&&e>n){var l=g("maxlength",a.args);a.invalidate(l)}else a.validate()}function f(a){return"password"===a.getAttribute("type")}function o(a,e){var t=a.match(e);return!!t&&a===t[0]}function c(a){var e=g("pattern",a.args);o(a.el.value,new RegExp(a.args("pattern")))?a.validate():a.invalidate(e)}function s(a){var e=g("required",a.args);a.el.value?a.validate():a.invalidate(e)}function v(a){var e=g("validnumber",a.args),t=parseInt(a.el.value,10);if(isNaN(t))a.invalidate(e);else{var i=a.args("min"),n=a.args("max");i&&t<parseInt(i,10)?a.invalidate(g("min",a.args)):n&&t>parseInt(n,10)?a.invalidate(g("max",a.args)):a.validate()}}function g(a,e,t){var i;i=void 0!==u.default.keys?u.default.keys["aui.validation.message."+a]:m[a];var n=t;t||(n=[e(a)]);var r,l=e(a+"-msg");return r=l?[l].concat(n):[i].concat(n),AJS.format.apply(null,r)}r.default.register(["maxlength","minlength"],d),r.default.register("[maxlength],[minlength]",d),r.default.register(["matchingfield"],function(a){var e=a.el.value,t=document.getElementById(a.args("matchingfield")),i=t.value,n=g("matchingfield",a.args,[e,i]);(f(a.el)||f(t))&&(n=g("matchingfield-novalue",a.args)),e&&i&&i!==e?a.invalidate(n):a.validate()}),r.default.register(["doesnotcontain"],function(a){var e=g("doesnotcontain",a.args);-1===a.el.value.indexOf(a.args("doesnotcontain"))?a.validate():a.invalidate(e)}),r.default.register(["pattern"],c),r.default.register("[pattern]",c),r.default.register(["required"],s),r.default.register("[required]",s),r.default.register(["min","max"],v),r.default.register("[min],[max]",v),r.default.register(["dateformat"],function(a){var e=a.args("dateformat"),t=g("dateformat",a.args),i={Y:"[0-9]{4}",y:"[0-9]{2}",m:"(0?[1-9]|10|11|12)",M:"[Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec]",D:"[Mon|Tue|Wed|Thu|Fri|Sat|Sun]",d:"([0-2]?[1-9]|10|20|30|31)"},n="";e.split("").forEach(function(a){var e=i.hasOwnProperty(a);n+=e?i[a]:a});var u=new RegExp(n+"$","i");o(a.el.value,u)?a.validate():a.invalidate(t)}),r.default.register(["minchecked","maxchecked"],function(a){var e=(0,i.default)(a.el).find(":checked").length,t=!a.args("minchecked")||e>=a.args("minchecked"),n=!a.args("maxchecked")||e<=a.args("maxchecked"),u=g("minchecked",a.args),r=g("maxchecked",a.args);t&&n?a.validate():t?n||a.invalidate(r):a.invalidate(u)});var m={minlength:u.default.getText("aui.validation.message.minlength"),maxlength:u.default.getText("aui.validation.message.maxlength"),exactlength:u.default.getText("aui.validation.message.exactlength"),matchingfield:u.default.getText("aui.validation.message.matchingfield"),"matchingfield-novalue":u.default.getText("aui.validation.message.matchingfield-novalue"),doesnotcontain:u.default.getText("aui.validation.message.doesnotcontain"),pattern:u.default.getText("aui.validation.message.pattern"),required:u.default.getText("aui.validation.message.required"),validnumber:u.default.getText("aui.validation.message.validnumber"),min:u.default.getText("aui.validation.message.min"),max:u.default.getText("aui.validation.message.max"),dateformat:u.default.getText("aui.validation.message.dateformat"),minchecked:u.default.getText("aui.validation.message.minchecked"),maxchecked:u.default.getText("aui.validation.message.maxchecked")};(0,n.default)("aui/form-validation/basic-validators")},defA:function(a,e,t){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),t("3vMk"),t("6rRy")}},[["defA","runtime","aui.splitchunk.vendors--e54c7c7304","aui.splitchunk.vendors--b47d4b691d","aui.splitchunk.vendors--9c48cc20a9","aui.splitchunk.vendors--be1eb78c1a","aui.splitchunk.vendors--23f50a6f00","aui.splitchunk.172ffb6da7","aui.splitchunk.b0831cc7d0","aui.splitchunk.572a8bf5cd","aui.splitchunk.087aba7911","aui.splitchunk.fbd1a5ab27","aui.splitchunk.d49cf794d2","aui.splitchunk.54d3f16c20","aui.splitchunk.e54c7c7304","aui.splitchunk.336ae4f9e7","aui.splitchunk.1659111a3c","aui.splitchunk.f5828f5ab9","aui.splitchunk.fb15cffa72","aui.splitchunk.56dfb54d0c","aui.splitchunk.f673ef53ac","aui.splitchunk.9c48cc20a9","aui.splitchunk.908fe798b4","aui.splitchunk.792781e698","aui.splitchunk.462ee5f9ef","aui.splitchunk.382c9b559f","aui.splitchunk.ed86a19e01","aui.splitchunk.50dca3e042","aui.splitchunk.be1eb78c1a","aui.splitchunk.23f50a6f00","aui.splitchunk.e8173e0382"]]]);