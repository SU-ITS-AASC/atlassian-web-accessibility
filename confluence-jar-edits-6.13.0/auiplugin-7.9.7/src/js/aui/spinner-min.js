("undefined"===typeof window?global:window).__6c1bd26c14066cf537a86a0966c2d4fc=function(){function j(a){var d=f.MEDIUM.name;"string"===typeof a&&(a=a.toLowerCase(),-1<Object.keys(f).map(function(a){return a.toLowerCase()}).indexOf(a)&&(d=a));return d}function g(a){var d=k.default.find(f,function(b){return b.name===a._data.size})||f.MEDIUM,e=d.px,d=d.radius,b=a.querySelector("svg"),c=a.querySelector("circle");b.setAttribute("size",e);b.setAttribute("height",e);b.setAttribute("width",e);b.setAttribute("viewBox",
"0 0 "+e+" "+e);b=e/2;c.setAttribute("cx",b);c.setAttribute("cy",b);c.setAttribute("r",d);if(a._data.filled){if((c=a.parentNode)&&1===c.nodeType)d=a.getBoundingClientRect(),c=c.getBoundingClientRect(),c=c.top+c.height/2,e=d.top+e/2,a.querySelector("svg").style.top=c-e+"px"}else delete a.querySelector("svg").style.top}var h={};"use strict";Object.defineProperty(h,"__esModule",{value:!0});h.SIZE=void 0;var b=__8548ccf5d6767d1d4e6633309de41309,b=b&&b.__esModule?b:{"default":b},l=__921ad9514d56376fef992861d9ec0f51,
i=__59c1c30030f41c99b6757d449d9a3a7b,k=i&&i.__esModule?i:{"default":i},f={SMALL:{name:"small",px:20,radius:9},MEDIUM:{name:"medium",px:30,radius:13.5},LARGE:{name:"large",px:50,radius:22.5}},m={filled:!1,size:f.MEDIUM.name},n=(0,l.getMessageLogger)("<aui-spinner> filled attribute",{sinceVersion:"7.9.4",removeInVersion:"9",extraInfo:"Add CSS to the parent element of the <aui-spinner>.\nUse CSS flexbox or grid to vertically align it.\nSee https://css-tricks.com/centering-css-complete-guide/ for techniques."}),
o=(0,l.getMessageLogger)("<aui-spinner> filled property",{sinceVersion:"7.9.4",removeInVersion:"9",extraInfo:"Add CSS to the parent element of the <aui-spinner>.\nUse CSS flexbox or grid to vertically align it.\nSee https://css-tricks.com/centering-css-complete-guide/ for techniques."}),b=(0,b.default)("aui-spinner",{template:function(a){a.innerHTML='<div class="aui-spinner spinner"><svg focusable="false"><circle></circle></svg></div>';g(a)},attached:function(a){g(a)},attributes:{filled:{created:function(a){n();
a._data.filled=!0;g(a)},removed:function(a){a._data.filled=!1;g(a)}},size:function(a,b){a._data.size=j(b.newValue);g(a)}},prototype:{get _data(){return this.__data||(this._data=k.default.defaults({},m))},set _data(a){return this.__data=a},set filled(a){o();a?this.setAttribute("filled",""):this.removeAttribute("filled")},set size(a){a=j(a);this.setAttribute("size",a)}}});h.default=b;h.SIZE=f;return h}.call(this);