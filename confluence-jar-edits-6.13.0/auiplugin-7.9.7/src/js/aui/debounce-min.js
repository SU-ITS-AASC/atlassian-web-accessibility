("undefined"===typeof window?global:window).__ee62e24d4acb40214d4f9e21b1a58bfc=function(){function g(a,b){var c,d;return function(){var e=arguments,f=this;clearTimeout(c);c=setTimeout(function(){d=a.apply(f,e);f=e=null},b);return d}}function h(a,b){var c=null,d;return function(){var e=this,f=arguments;null===c&&(d=a.apply(e,f));clearTimeout(c);c=setTimeout(function(){c=e=f=null},b);return d}}var b={};"use strict";Object.defineProperty(b,"__esModule",{value:!0});b.default=g;b.debounceImmediate=h;var a=
__28c84e7bb75f6c3b0ba124d57bd69571,a=a&&a.__esModule?a:{"default":a};(0,a.default)("debounce",g);(0,a.default)("debounceImmediate",h);return b}.call(this);