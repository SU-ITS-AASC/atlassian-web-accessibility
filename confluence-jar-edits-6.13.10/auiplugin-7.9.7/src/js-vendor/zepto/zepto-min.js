(function(b){String.prototype.trim===b&&(String.prototype.trim=function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")});Array.prototype.reduce===b&&(Array.prototype.reduce=function(h){if(this===void 0||this===null)throw new TypeError;var k=Object(this),d=k.length>>>0,o=0,m;if(typeof h!="function")throw new TypeError;if(d==0&&arguments.length==1)throw new TypeError;if(arguments.length>=2)m=arguments[1];else{do{if(o in k){m=k[o++];break}if(++o>=d)throw new TypeError;}while(1)}for(;o<d;){o in k&&
(m=h.call(b,m,k[o],o,k));o++}return m})})();
var Zepto=function(){function b(a){return"[object Function]"==E.call(a)}function h(a){return a instanceof Object}function k(a){var n,g;if("[object Object]"!==E.call(a))return!1;g=b(a.constructor)&&a.constructor.prototype;if(!g||!hasOwnProperty.call(g,"isPrototypeOf"))return!1;for(n in a);return n===i||hasOwnProperty.call(a,n)}function d(a){return a instanceof Array}function o(a){return"number"==typeof a.length}function m(a){return a.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,
"$1_$2").replace(/_/g,"-").toLowerCase()}function s(a){return a in y?y[a]:y[a]=RegExp("(^|\\s)"+a+"(\\s|$)")}function u(a,n){return n===i?c(a):c(a).filter(n)}function f(a,n,g,e){return b(n)?n.call(a,g,e):n}function v(a,n){n(a);for(var g in a.childNodes)v(a.childNodes[g],n)}var i,j,c,q,e=[],l=e.slice,p=window.document,z={},y={},A=p.defaultView.getComputedStyle,B={"column-count":1,columns:1,"font-weight":1,"line-height":1,opacity:1,"z-index":1,zoom:1},x=/^\s*<(\w+|!)[^>]*>/,r=[1,3,8,9,11],w=p.createElement("table"),
F=p.createElement("tr"),G={tr:p.createElement("tbody"),tbody:w,thead:w,tfoot:w,td:F,th:F,"*":p.createElement("div")},I=/complete|loaded|interactive/,J=/^\.([\w-]+)$/,K=/^#([\w-]+)$/,L=/^[\w-]+$/,E={}.toString,t={},D,C,H=p.createElement("div");t.matches=function(a,n){if(!a||1!==a.nodeType)return!1;var g=a.webkitMatchesSelector||a.mozMatchesSelector||a.oMatchesSelector||a.matchesSelector;if(g)return g.call(a,n);var b;b=a.parentNode;(g=!b)&&(b=H).appendChild(a);b=~t.qsa(b,n).indexOf(a);g&&H.removeChild(a);
return b};D=function(a){return a.replace(/-+(.)?/g,function(a,g){return g?g.toUpperCase():""})};C=function(a){return a.filter(function(n,g){return a.indexOf(n)==g})};t.fragment=function(a,n){n===i&&(n=x.test(a)&&RegExp.$1);n in G||(n="*");var g=G[n];g.innerHTML=""+a;return c.each(l.call(g.childNodes),function(){g.removeChild(this)})};t.Z=function(a,n){a=a||[];a.__proto__=arguments.callee.prototype;a.selector=n||"";return a};t.isZ=function(a){return a instanceof t.Z};t.init=function(a,n){if(a){if(b(a))return c(p).ready(a);
if(t.isZ(a))return a;var g;if(d(a))g=a.filter(function(a){return a!==i&&null!==a});else if(k(a))g=[c.extend({},a)],a=null;else if(0<=r.indexOf(a.nodeType)||a===window)g=[a],a=null;else if(x.test(a))g=t.fragment(a.trim(),RegExp.$1),a=null;else{if(n!==i)return c(n).find(a);g=t.qsa(p,a)}return t.Z(g,a)}return t.Z()};c=function(a,n){return t.init(a,n)};c.extend=function(a){l.call(arguments,1).forEach(function(n){for(j in n)n[j]!==i&&(a[j]=n[j])});return a};t.qsa=function(a,n){var g;return a===p&&K.test(n)?
(g=a.getElementById(RegExp.$1))?[g]:e:1!==a.nodeType&&9!==a.nodeType?e:l.call(J.test(n)?a.getElementsByClassName(RegExp.$1):L.test(n)?a.getElementsByTagName(n):a.querySelectorAll(n))};c.isFunction=b;c.isObject=h;c.isArray=d;c.isPlainObject=k;c.inArray=function(a,n,g){return e.indexOf.call(n,a,g)};c.trim=function(a){return a.trim()};c.uuid=0;c.map=function(a,n){var g,b=[],e;if(o(a))for(e=0;e<a.length;e++)g=n(a[e],e),null!=g&&b.push(g);else for(e in a)g=n(a[e],e),null!=g&&b.push(g);return 0<b.length?
[].concat.apply([],b):b};c.each=function(a,b){var g;if(o(a))for(g=0;g<a.length&&!1!==b.call(a[g],g,a[g]);g++);else for(g in a)if(!1===b.call(a[g],g,a[g]))break;return a};c.fn={forEach:e.forEach,reduce:e.reduce,push:e.push,indexOf:e.indexOf,concat:e.concat,map:function(a){return c.map(this,function(b,g){return a.call(b,g,b)})},slice:function(){return c(l.apply(this,arguments))},ready:function(a){I.test(p.readyState)?a(c):p.addEventListener("DOMContentLoaded",function(){a(c)},!1);return this},get:function(a){return a===
i?l.call(this):this[a]},toArray:function(){return this.get()},size:function(){return this.length},remove:function(){return this.each(function(){null!=this.parentNode&&this.parentNode.removeChild(this)})},each:function(a){this.forEach(function(b,g){a.call(b,g,b)});return this},filter:function(a){return c([].filter.call(this,function(b){return t.matches(b,a)}))},add:function(a,b){return c(C(this.concat(c(a,b))))},is:function(a){return 0<this.length&&t.matches(this[0],a)},not:function(a){var e=[];if(b(a)&&
a.call!==i)this.each(function(b){a.call(this,b)||e.push(this)});else{var g="string"==typeof a?this.filter(a):o(a)&&b(a.item)?l.call(a):c(a);this.forEach(function(a){0>g.indexOf(a)&&e.push(a)})}return c(e)},eq:function(a){return-1===a?this.slice(a):this.slice(a,+a+1)},first:function(){var a=this[0];return a&&!h(a)?a:c(a)},last:function(){var a=this[this.length-1];return a&&!h(a)?a:c(a)},find:function(a){var b;b=1==this.length?t.qsa(this[0],a):this.map(function(){return t.qsa(this,a)});return c(b)},
closest:function(a,b){for(var g=this[0];g&&!t.matches(g,a);)g=g!==b&&g!==p&&g.parentNode;return c(g)},parents:function(a){for(var b=[],g=this;0<g.length;)g=c.map(g,function(a){if((a=a.parentNode)&&a!==p&&0>b.indexOf(a))return b.push(a),a});return u(b,a)},parent:function(a){return u(C(this.pluck("parentNode")),a)},children:function(a){return u(this.map(function(){return l.call(this.children)}),a)},siblings:function(a){return u(this.map(function(a,b){return l.call(b.parentNode.children).filter(function(a){return a!==
b})}),a)},empty:function(){return this.each(function(){this.innerHTML=""})},pluck:function(a){return this.map(function(){return this[a]})},show:function(){return this.each(function(){"none"==this.style.display&&(this.style.display=null);if("none"==A(this,"").getPropertyValue("display")){var a=this.style,b=this.nodeName,g,e;z[b]||(g=p.createElement(b),p.body.appendChild(g),e=A(g,"").getPropertyValue("display"),g.parentNode.removeChild(g),"none"==e&&(e="block"),z[b]=e);a.display=z[b]}})},replaceWith:function(a){return this.before(a).remove()},
wrap:function(a){return this.each(function(){c(this).wrapAll(c(a)[0].cloneNode(!1))})},wrapAll:function(a){this[0]&&(c(this[0]).before(a=c(a)),a.append(this));return this},unwrap:function(){this.parent().each(function(){c(this).replaceWith(c(this).children())});return this},clone:function(){return c(this.map(function(){return this.cloneNode(!0)}))},hide:function(){return this.css("display","none")},toggle:function(a){return(a===i?"none"==this.css("display"):a)?this.show():this.hide()},prev:function(){return c(this.pluck("previousElementSibling"))},
next:function(){return c(this.pluck("nextElementSibling"))},html:function(a){return a===i?0<this.length?this[0].innerHTML:null:this.each(function(b){var e=this.innerHTML;c(this).empty().append(f(this,a,b,e))})},text:function(a){return a===i?0<this.length?this[0].textContent:null:this.each(function(){this.textContent=a})},attr:function(a,b){var e;return"string"==typeof a&&b===i?0==this.length||1!==this[0].nodeType?i:"value"==a&&"INPUT"==this[0].nodeName?this.val():!(e=this[0].getAttribute(a))&&a in
this[0]?this[0][a]:e:this.each(function(e){if(1===this.nodeType)if(h(a))for(j in a)this.setAttribute(j,a[j]);else this.setAttribute(a,f(this,b,e,this.getAttribute(a)))})},removeAttr:function(a){return this.each(function(){1===this.nodeType&&this.removeAttribute(a)})},prop:function(a,b){return b===i?this[0]?this[0][a]:i:this.each(function(e){this[a]=f(this,b,e,this[a])})},data:function(a,b){var e=this.attr("data-"+m(a),b);return null!==e?e:i},val:function(a){return a===i?0<this.length?this[0].value:
i:this.each(function(b){this.value=f(this,a,b,this.value)})},offset:function(){if(0==this.length)return null;var a=this[0].getBoundingClientRect();return{left:a.left+window.pageXOffset,top:a.top+window.pageYOffset,width:a.width,height:a.height}},css:function(a,b){if(b===i&&"string"==typeof a)return 0==this.length?i:this[0].style[D(a)]||A(this[0],"").getPropertyValue(a);var e="";for(j in a)"string"==typeof a[j]&&""==a[j]?this.each(function(){this.style.removeProperty(m(j))}):e+=m(j)+":"+("number"==
typeof a[j]&&!B[m(j)]?a[j]+"px":a[j])+";";"string"==typeof a&&(""==b?this.each(function(){this.style.removeProperty(m(a))}):e=m(a)+":"+("number"==typeof b&&!B[m(a)]?b+"px":b));return this.each(function(){this.style.cssText+=";"+e})},index:function(a){return a?this.indexOf(c(a)[0]):this.parent().children().indexOf(this[0])},hasClass:function(a){return 1>this.length?!1:s(a).test(this[0].className)},addClass:function(a){return this.each(function(b){q=[];var e=this.className;f(this,a,b,e).split(/\s+/g).forEach(function(a){c(this).hasClass(a)||
q.push(a)},this);q.length&&(this.className+=(e?" ":"")+q.join(" "))})},removeClass:function(a){return this.each(function(b){if(a===i)return this.className="";q=this.className;f(this,a,b,q).split(/\s+/g).forEach(function(a){q=q.replace(s(a)," ")});this.className=q.trim()})},toggleClass:function(a,b){return this.each(function(e){e=f(this,a,e,this.className);(b===i?!c(this).hasClass(e):b)?c(this).addClass(e):c(this).removeClass(e)})}};["width","height"].forEach(function(a){c.fn[a]=function(b){var e,
r=a.replace(/./,function(a){return a[0].toUpperCase()});return b===i?this[0]==window?window["inner"+r]:this[0]==p?p.documentElement["offset"+r]:(e=this.offset())&&e[a]:this.each(function(e){var r=c(this);r.css(a,f(this,b,e,r[a]()))})}});["after","prepend","before","append"].forEach(function(a,b){c.fn[a]=function(){var a=c.map(arguments,function(a){return h(a)?a:t.fragment(a)});if(1>a.length)return this;var e=this.length,r=1<e,x=2>b;return this.each(function(l,d){for(var p=0;p<a.length;p++){var w=
a[x?a.length-p-1:p];v(w,function(a){null!=a.nodeName&&("SCRIPT"===a.nodeName.toUpperCase()&&(!a.type||"text/javascript"===a.type))&&window.eval.call(window,a.innerHTML)});r&&l<e-1&&(w=w.cloneNode(!0));var f=b%2?d:d.parentNode;f?f.insertBefore(w,!b?d.nextSibling:1==b?f.firstChild:2==b?d:null):c(w).remove()}})};c.fn[b%2?a+"To":"insert"+(b?"Before":"After")]=function(b){c(b)[a](this);return this}});t.Z.prototype=c.fn;t.camelize=D;t.uniq=C;c.zepto=t;return c}();window.Zepto=Zepto;
"$"in window||(window.$=Zepto);
(function(b){function h(b){return b._zid||(b._zid=v++)}function k(b,l,c,k){l=d(l);if(l.ns)var m=RegExp("(?:^| )"+l.ns.replace(" "," .* ?")+"(?: |$)");return(f[h(b)]||[]).filter(function(b){return b&&(!l.e||b.e==l.e)&&(!l.ns||m.test(b.ns))&&(!c||h(b.fn)===h(c))&&(!k||b.sel==k)})}function d(b){b=(""+b).split(".");return{e:b[0],ns:b.slice(1).sort().join(" ")}}function o(e,l,d){b.isObject(e)?b.each(e,d):e.split(/\s/).forEach(function(b){d(b,l)})}function m(e,l,c,k,m,i){var i=!!i,u=h(e),x=f[u]||(f[u]=
[]);o(l,c,function(r,c){var l=m&&m(c,r),p=l||c,f=function(b){var r=p.apply(e,[b].concat(b.data));!1===r&&b.preventDefault();return r},l=b.extend(d(r),{fn:c,proxy:f,sel:k,del:l,i:x.length});x.push(l);e.addEventListener(l.e,f,i)})}function s(b,l,c,d){var m=h(b);o(l||"",c,function(c,l){k(b,c,l,d).forEach(function(c){delete f[m][c.i];b.removeEventListener(c.e,c.proxy,!1)})})}function u(e){var l=b.extend({originalEvent:e},e);b.each(q,function(b,d){l[b]=function(){this[d]=j;return e[b].apply(e,arguments)};
l[d]=c});return l}var f={},v=1,i={};i.click=i.mousedown=i.mouseup=i.mousemove="MouseEvents";b.event={add:m,remove:s};b.proxy=function(e,c){if(b.isFunction(e)){var d=function(){return e.apply(c,arguments)};d._zid=h(e);return d}if("string"==typeof c)return b.proxy(e[c],e);throw new TypeError("expected function");};b.fn.bind=function(b,c){return this.each(function(){m(this,b,c)})};b.fn.unbind=function(b,c){return this.each(function(){s(this,b,c)})};b.fn.one=function(b,c){return this.each(function(d,
f){m(this,b,c,null,function(b,e){return function(){var c=b.apply(f,arguments);s(f,e,b);return c}})})};var j=function(){return!0},c=function(){return!1},q={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};b.fn.delegate=function(e,c,d){var f=!1;if("blur"==c||"focus"==c)b.iswebkit?c="blur"==c?"focusout":"focus"==c?"focusin":c:f=!0;return this.each(function(k,i){m(i,c,d,e,function(c){return function(d){var r,l=b(d.target).closest(e,
i).get(0);if(l)return r=b.extend(u(d),{currentTarget:l,liveFired:i}),c.apply(l,[r].concat([].slice.call(arguments,1)))}},f)})};b.fn.undelegate=function(b,c,d){return this.each(function(){s(this,c,d,b)})};b.fn.live=function(e,c){b(document.body).delegate(this.selector,e,c);return this};b.fn.die=function(e,c){b(document.body).undelegate(this.selector,e,c);return this};b.fn.on=function(e,c,d){return void 0==c||b.isFunction(c)?this.bind(e,c):this.delegate(c,e,d)};b.fn.off=function(c,d,f){return void 0==
d||b.isFunction(d)?this.unbind(c,d):this.undelegate(d,c,f)};b.fn.trigger=function(c,d){"string"==typeof c&&(c=b.Event(c));var f=c;if(!("defaultPrevented"in f)){f.defaultPrevented=!1;var k=f.preventDefault;f.preventDefault=function(){this.defaultPrevented=!0;k.call(this)}}c.data=d;return this.each(function(){"dispatchEvent"in this&&this.dispatchEvent(c)})};b.fn.triggerHandler=function(c,d){var f,i;this.each(function(m,h){f=u("string"==typeof c?b.Event(c):c);f.data=d;f.target=h;b.each(k(h,c.type||c),
function(b,c){i=c.proxy(f);if(f.isImmediatePropagationStopped())return!1})});return i};"focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout change select keydown keypress keyup error".split(" ").forEach(function(c){b.fn[c]=function(b){return this.bind(c,b)}});["focus","blur"].forEach(function(c){b.fn[c]=function(b){if(b)this.bind(c,b);else if(this.length)try{this.get(0)[c]()}catch(d){}return this}});b.Event=function(b,c){var d=document.createEvent(i[b]||
"Events"),f=!0;if(c)for(var k in c)"bubbles"==k?f=!!c[k]:d[k]=c[k];d.initEvent(b,f,!0,null,null,null,null,null,null,null,null,null,null,null,null);return d}})(Zepto);
(function(b){function h(b){var d=this.os={},h=this.browser={},m=b.match(/WebKit\/([\d.]+)/),s=b.match(/(Android)\s+([\d.]+)/),u=b.match(/(iPad).*OS\s([\d_]+)/),f=!u&&b.match(/(iPhone\sOS)\s([\d_]+)/),v=b.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),i=v&&b.match(/TouchPad/),j=b.match(/Kindle\/([\d.]+)/),c=b.match(/Silk\/([\d._]+)/),q=b.match(/(BlackBerry).*Version\/([\d.]+)/);if(h.webkit=!!m)h.version=m[1];s&&(d.android=!0,d.version=s[2]);f&&(d.ios=d.iphone=!0,d.version=f[2].replace(/_/g,"."));u&&(d.ios=d.ipad=
!0,d.version=u[2].replace(/_/g,"."));v&&(d.webos=!0,d.version=v[2]);i&&(d.touchpad=!0);q&&(d.blackberry=!0,d.version=q[2]);j&&(d.kindle=!0,d.version=j[1]);c&&(h.silk=!0,h.version=c[1]);!c&&(d.android&&b.match(/Kindle Fire/))&&(h.silk=!0)}h.call(b,navigator.userAgent);b.__detect=h})(Zepto);
(function(b,h){var k="",d,o=window.document.createElement("div"),m=/^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,s={};b.each({Webkit:"webkit",Moz:"",O:"o",ms:"MS"},function(b,f){if(o.style[b+"TransitionProperty"]!==h)return k="-"+b.toLowerCase()+"-",d=f,!1});s[k+"transition-property"]=s[k+"transition-duration"]=s[k+"transition-timing-function"]=s[k+"animation-name"]=s[k+"animation-duration"]="";b.fx={off:d===h&&o.style.transitionProperty===h,cssPrefix:k,transitionEnd:d?
d+"TransitionEnd":"transitionend",animationEnd:d?d+"AnimationEnd":"animationend"};b.fn.animate=function(d,f,h,i){b.isObject(f)&&(h=f.easing,i=f.complete,f=f.duration);f&&(f/=1E3);return this.anim(d,f,h,i)};b.fn.anim=function(d,f,o,i){var j,c={},q,e=this,l,p=b.fx.transitionEnd;f===h&&(f=0.4);b.fx.off&&(f=0);if("string"==typeof d)c[k+"animation-name"]=d,c[k+"animation-duration"]=f+"s",p=b.fx.animationEnd;else{for(q in d)m.test(q)?(j||(j=[]),j.push(q+"("+d[q]+")")):c[q]=d[q];j&&(c[k+"transform"]=j.join(" "));
!b.fx.off&&"object"===typeof d&&(c[k+"transition-property"]=Object.keys(d).join(", "),c[k+"transition-duration"]=f+"s",c[k+"transition-timing-function"]=o||"linear")}l=function(c){if("undefined"!==typeof c){if(c.target!==c.currentTarget)return;b(c.target).unbind(p,arguments.callee)}b(this).css(s);i&&i.call(this)};0<f&&this.bind(p,l);setTimeout(function(){e.css(c);0>=f&&setTimeout(function(){e.each(function(){l.call(this)})},0)},0);return this};o=null})(Zepto);
(function(b){function h(c,d,e,f){if(c.global)return c=d||j,e=b.Event(e),b(c).trigger(e,f),!e.defaultPrevented}function k(b,c,d){var e=d.context;d.success.call(e,b,"success",c);h(d,e,"ajaxSuccess",[c,d,b]);o("success",c,d)}function d(b,c,d,e){var f=e.context;e.error.call(f,d,c,b);h(e,f,"ajaxError",[d,e,b]);o(c,d,e)}function o(c,d,e){var f=e.context;e.complete.call(f,d,c);h(e,f,"ajaxComplete",[d,e]);e.global&&!--b.active&&h(e,null,"ajaxStop")}function m(){}function s(b){return b&&(b==y?"html":b==z?
"json":l.test(b)?"script":p.test(b)&&"xml")||"text"}function u(c){i(c.data)&&(c.data=b.param(c.data));if(c.data&&(!c.type||"GET"==c.type.toUpperCase()))c.url=(c.url+"&"+c.data).replace(/[&?]{1,2}/,"?")}function f(c,d,e,h){var k=b.isArray(d);b.each(d,function(d,r){h&&(d=e?h:h+"["+(k?"":d)+"]");!h&&k?c.add(r.name,r.value):(e?b.isArray(r):i(r))?f(c,r,e,d):c.add(d,r)})}var v=0,i=b.isObject,j=window.document,c,q,e=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,l=/^(?:text|application)\/javascript/i,
p=/^(?:text|application)\/xml/i,z="application/json",y="text/html",A=/^\s*$/;b.active=0;b.ajaxJSONP=function(c){var d="jsonp"+ ++v,e=j.createElement("script"),f={abort:function(){b(e).remove();d in window&&(window[d]=m);o("abort",f,c)}},h;c.error&&(e.onerror=function(){f.abort();c.error()});window[d]=function(i){clearTimeout(h);b(e).remove();delete window[d];k(i,f,c)};u(c);e.src=c.url.replace(/=\?/,"="+d);b("head").append(e);0<c.timeout&&(h=setTimeout(function(){f.abort();o("timeout",f,c)},c.timeout));
return f};b.ajaxSettings={type:"GET",beforeSend:m,success:m,error:m,complete:m,context:null,global:!0,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript",json:z,xml:"application/xml, text/xml",html:y,text:"text/plain"},crossDomain:!1,timeout:0};b.ajax=function(e){var f=b.extend({},e||{});for(c in b.ajaxSettings)void 0===f[c]&&(f[c]=b.ajaxSettings[c]);f.global&&0===b.active++&&h(f,null,"ajaxStart");f.crossDomain||(f.crossDomain=/^([\w-]+:)?\/\/([^\/]+)/.test(f.url)&&
RegExp.$2!=window.location.host);var i=f.dataType,e=/=\?/.test(f.url);if("jsonp"==i||e)return e||(f.url=(f.url+"&callback=?").replace(/[&?]{1,2}/,"?")),b.ajaxJSONP(f);f.url||(f.url=window.location.toString());u(f);var e=f.accepts[i],l={},o=/^([\w-]+:)\/\//.test(f.url)?RegExp.$1:window.location.protocol,j=b.ajaxSettings.xhr(),p;f.crossDomain||(l["X-Requested-With"]="XMLHttpRequest");e&&(l.Accept=e,-1<e.indexOf(",")&&(e=e.split(",",2)[0]),j.overrideMimeType&&j.overrideMimeType(e));if(f.contentType||
f.data&&"GET"!=f.type.toUpperCase())l["Content-Type"]=f.contentType||"application/x-www-form-urlencoded";f.headers=b.extend(l,f.headers||{});j.onreadystatechange=function(){if(j.readyState==4){clearTimeout(p);var b,c=false;if(j.status>=200&&j.status<300||j.status==304||j.status==0&&o=="file:"){i=i||s(j.getResponseHeader("content-type"));b=j.responseText;try{i=="script"?(0,eval)(b):i=="xml"?b=j.responseXML:i=="json"&&(b=A.test(b)?null:JSON.parse(b))}catch(e){c=e}c?d(c,"parsererror",j,f):k(b,j,f)}else d(null,
"error",j,f)}};j.open(f.type,f.url,"async"in f?f.async:!0);for(q in f.headers)j.setRequestHeader(q,f.headers[q]);e=f.context;!1===f.beforeSend.call(e,j,f)||!1===h(f,e,"ajaxBeforeSend",[j,f])?e=!1:(h(f,e,"ajaxSend",[j,f]),e=void 0);if(!1===e)return j.abort(),!1;0<f.timeout&&(p=setTimeout(function(){j.onreadystatechange=m;j.abort();d(null,"timeout",j,f)},f.timeout));j.send(f.data?f.data:null);return j};b.get=function(c,d){return b.ajax({url:c,success:d})};b.post=function(c,d,e,f){b.isFunction(d)&&(f=
f||e,e=d,d=null);return b.ajax({type:"POST",url:c,data:d,success:e,dataType:f})};b.getJSON=function(c,d){return b.ajax({url:c,success:d,dataType:"json"})};b.fn.load=function(c,d){if(!this.length)return this;var f=this,h=c.split(/\s/),i;1<h.length&&(c=h[0],i=h[1]);b.get(c,function(c){f.html(i?b(j.createElement("div")).html(c.replace(e,"")).find(i).html():c);d&&d.call(f)});return this};var B=encodeURIComponent;b.param=function(b,c){var d=[];d.add=function(b,c){this.push(B(b)+"="+B(c))};f(d,b,c);return d.join("&").replace("%20",
"+")}})(Zepto);
(function(b){b.fn.serializeArray=function(){var h=[],k;b(Array.prototype.slice.call(this.get(0).elements)).each(function(){k=b(this);var d=k.attr("type");"fieldset"!=this.nodeName.toLowerCase()&&(!this.disabled&&"submit"!=d&&"reset"!=d&&"button"!=d&&("radio"!=d&&"checkbox"!=d||this.checked))&&h.push({name:k.attr("name"),value:k.val()})});return h};b.fn.serialize=function(){var b=[];this.serializeArray().forEach(function(k){b.push(encodeURIComponent(k.name)+"="+encodeURIComponent(k.value))});return b.join("&")};
b.fn.submit=function(h){h?this.bind("submit",h):this.length&&(h=b.Event("submit"),this.eq(0).trigger(h),h.defaultPrevented||this.get(0).submit());return this}})(Zepto);
(function(b){function h(b,d,f,h){var i=Math.abs(b-d),j=Math.abs(f-h);return i>=j?0<b-d?"Left":"Right":0<f-h?"Up":"Down"}function k(){m=null;d.last&&(d.el.trigger("longTap"),d={})}var d={},o,m;b(document).ready(function(){var s,u;b(document.body).bind("touchstart",function(f){s=Date.now();u=s-(d.last||s);d.el=b("tagName"in f.touches[0].target?f.touches[0].target:f.touches[0].target.parentNode);o&&clearTimeout(o);d.x1=f.touches[0].pageX;d.y1=f.touches[0].pageY;0<u&&250>=u&&(d.isDoubleTap=!0);d.last=
s;m=setTimeout(k,750)}).bind("touchmove",function(b){m&&clearTimeout(m);m=null;d.x2=b.touches[0].pageX;d.y2=b.touches[0].pageY}).bind("touchend",function(){m&&clearTimeout(m);m=null;d.isDoubleTap?(d.el.trigger("doubleTap"),d={}):d.x2&&30<Math.abs(d.x1-d.x2)||d.y2&&30<Math.abs(d.y1-d.y2)?(d.el.trigger("swipe")&&d.el.trigger("swipe"+h(d.x1,d.x2,d.y1,d.y2)),d={}):"last"in d&&(d.el.trigger("tap"),o=setTimeout(function(){o=null;d.el.trigger("singleTap");d={}},250))}).bind("touchcancel",function(){o&&clearTimeout(o);
m&&clearTimeout(m);m=o=null;d={}})});"swipe swipeLeft swipeRight swipeUp swipeDown doubleTap tap singleTap longTap".split(" ").forEach(function(d){b.fn[d]=function(b){return this.bind(d,b)}})})(Zepto);