("undefined"===typeof window?global:window).__e8e9fc435c352b74c65e5f8d64ed692c=function(){function f(a,b,c){a.tipsy(c);"destroy"===c&&(b.live?(0,d.default)(a.context).off(".tipsy",a.selector):a.unbind(".tipsy"));return a}function g(a,b){a.tipsy(b);if(b&&b.hideOnClick&&("hover"===b.trigger||!b.trigger&&"hover"===a.tipsy.defaults.trigger)){var c=function(){(0,d.default)(this).tipsy("hide")};if(b.live)(0,d.default)(a.context).on("click.tipsy",a.selector,c);else a.bind("click.tipsy",c)}return a}"use strict";
var e=__700a145ba3db9966cc95664c892049f8,d=e&&e.__esModule?e:{"default":e};__8c05d85e3d7fb791ad5071fea16ddb09;d.default.fn.tooltip=function(a){var b=d.default.extend({},d.default.fn.tooltip.defaults,a);return b.live?("string"===typeof a?f(this,b,a):g(this,b),this):this.each(function(){var c=(0,d.default)(this);"string"===typeof a?f(c,b,a):g(c,b);return c})};d.default.fn.tooltip.defaults={opacity:1,offset:1,delayIn:500,hoverable:!0,hideOnClick:!0,aria:!0};return{}}.call(this);