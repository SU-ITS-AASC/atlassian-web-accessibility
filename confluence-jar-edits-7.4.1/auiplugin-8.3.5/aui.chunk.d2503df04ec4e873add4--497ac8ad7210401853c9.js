(window.__auiJsonp=window.__auiJsonp||[]).push([["aui.component.flag"],{"0TVX":function(e,t,a){},"t/aK":function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.flag=void 0;var u=a("xVOd");Object.defineProperty(t,"flag",{enumerable:!0,get:function(){return function(e){return e&&e.__esModule?e:{default:e}}(u).default}}),a("e8H2"),a("0TVX")},xVOd:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var u=f(a("+x/D")),i=a("Ioyv"),n=f(a("TmQU")),l=f(a("KloK")),c=f(a("+ay7")),d=f(a("P3rJ")),s=f(a("l3AF"));function f(e){return e&&e.__esModule?e:{default:e}}var o=5e3,r="aui-flag-container",p={body:"",close:"manual",title:"",type:"info"};function h(e){(e=u.default.extend({},p,e)).title=(e.title||"").toString().trim();var t=function(e){var t=e.body,a=e.title,i=e.close,n=e.type,l='<div class="aui-message">'+(a?'<p class="title"><strong>'+(0,s.default)(a)+"</strong></p>":"")+"</div>",c=(0,u.default)(l).append(u.default.parseHTML(t||"")).addClass("never"===i?"":"closeable").addClass("aui-message-"+n);return(0,u.default)('<div class="aui-flag"></div>').append(c)}(e);return function(e){e[0].close=function(){v(e)}}(t),"auto"===e.close?(b(t),function(e){e.find(".aui-message").addClass("aui-will-close"),setTimeout(function(){e[0].close()},o)}(t)):"manual"===e.close&&b(t),g().find(".aui-flag").get().forEach(function(e){var t="true"===e.getAttribute("aria-hidden");t&&(0,u.default)(e).remove()}),function(e){var t=g();t.length||(t=(0,u.default)('<div id="'+r+'"></div>'),(0,u.default)("body").prepend(t));return e.appendTo(t),(0,i.recomputeStyle)(e),e.attr("aria-hidden","false")[0]}(t)}function b(e){var t=(0,u.default)('<span class="aui-icon icon-close" role="button" tabindex="0"></span>');return t.on("click",function(){v(e)}),t.on("keypress",function(t){t.which!==c.default.ENTER&&t.which!==c.default.SPACE||(v(e),t.preventDefault())}),e.find(".aui-message").append(t)[0]}function v(e){var t=e.get(0);return t.setAttribute("aria-hidden","true"),t.dispatchEvent(new d.default("aui-flag-close",{bubbles:!0})),t}function g(){return(0,u.default)("#"+r)}(0,n.default)("aui/flag",h),(0,l.default)("flag",h),t.default=h,e.exports=t.default}},[["t/aK","runtime","aui.splitchunk.vendors--e54c7c7304","aui.splitchunk.172ffb6da7","aui.splitchunk.b0831cc7d0","aui.splitchunk.572a8bf5cd","aui.splitchunk.087aba7911","aui.splitchunk.fbd1a5ab27","aui.splitchunk.d49cf794d2","aui.splitchunk.54d3f16c20","aui.splitchunk.e54c7c7304","aui.splitchunk.1659111a3c","aui.splitchunk.f5828f5ab9","aui.splitchunk.56dfb54d0c","aui.splitchunk.f673ef53ac","aui.splitchunk.8659b532c1","aui.splitchunk.462ee5f9ef","aui.splitchunk.afa5039e04","aui.splitchunk.e7c127e2cc","aui.splitchunk.ec75f48bb8"]]]);