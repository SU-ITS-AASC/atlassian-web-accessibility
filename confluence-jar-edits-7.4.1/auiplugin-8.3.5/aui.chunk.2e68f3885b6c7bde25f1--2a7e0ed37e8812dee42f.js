(window.__auiJsonp=window.__auiJsonp||[]).push([["aui.splitchunk.be1eb78c1a"],{XphB:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.maybeTooltip=e.findAllTooltips=void 0;var n=function(t){return t&&t.__esModule?t:{default:t}}(i("+x/D"));i("jIBM");var o="aui-tooltip";n.default.fn.tooltip=function(t){var e=n.default.extend({},n.default.fn.tooltip.defaults,"string"==typeof t?{}:t),i=e.className;function a(){var i=(0,n.default)(this);return"string"==typeof t?function(t,e){t.tipsy(e)}(i,t):function(t,e){t.tipsy(e);var i="hover"===e.trigger||!e.trigger&&"hover"===t.tipsy.defaults.trigger;if(e&&e.hideOnClick&&i){var o=function(){(0,n.default)(this).tipsy("hide")};e.live?t.on("click.tipsy",e.live,o):t.on("click.tipsy",o)}}(i,e),i}return e.className="string"==typeof i?o+" "+i:"function"==typeof i?function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];return o+" "+i.apply(void 0,e)}:o,e.live?a.call(this):this.each(a)},n.default.fn.tooltip.defaults={opacity:1,offset:1,delayIn:500,hoverable:!0,hideOnClick:!0,aria:!0},e.default=n.default,e.findAllTooltips=function(){return(0,n.default)(document.getElementsByClassName(o))},e.maybeTooltip=function(t){var e=function(t){return(0,n.default)(t).data("tipsy")}(t);return e?e.$tip:(0,n.default)()}}}]);