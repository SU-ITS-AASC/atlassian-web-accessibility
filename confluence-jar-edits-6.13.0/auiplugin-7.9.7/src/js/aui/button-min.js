("undefined"===typeof window?global:window).__eaacbdad8b92ceca9114dc3be870abe7=function(){function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){return a.hasAttribute("aria-busy")&&"true"===a.getAttribute("aria-busy")}"use strict";var c;var a=__c1e961001275c079e48525ad3a48c8c2;if(a&&a.__esModule)c=a;else{var b={};if(null!=a)for(var f in a)Object.prototype.hasOwnProperty.call(a,f)&&(b[f]=a[f]);b.default=a;c=b}var a=d(__65ca28a9d6b0f244027266ff8e6a6d1c),b=d(__0ac9a2c09f995a9c0a478af8742f59b7),
g=__6c1bd26c14066cf537a86a0966c2d4fc,h=d(g);(0,b.default)("aui-button",{type:b.default.type.CLASSNAME,created:function(a){a._spinner=new h.default;a._spinner.setAttribute("size",g.SIZE.SMALL.name)},prototype:{busy:function(){if("INPUT"===this.nodeName||e(this))return c.warn("It is not valid to call busy() on an input button."),this;this.appendChild(this._spinner);this.setAttribute("aria-busy",!0);this.setAttribute("busy","");return this},idle:function(){if("INPUT"===this.nodeName||!e(this))return c.warn("It is not valid to call idle() on an input button."),
this;this.removeChild(this._spinner);this.removeAttribute("aria-busy");this.removeAttribute("busy");return this},isBusy:function(){return"INPUT"===this.nodeName?(c.warn("It is not valid to call isBusy() on an input button."),!1):e(this)}}});(0,a.default)("aui/button");return{}}.call(this);