(window.__auiJsonp=window.__auiJsonp||[]).push([["aui.component.sidebar"],{"5njU":function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n(i("+x/D"));function n(e){return e&&e.__esModule?e:{default:e}}function a(e){return(0,o.default)(e).clone().removeAttr("id")}(0,n(i("KloK")).default)("clone",a),t.default=a,e.exports=t.default},"6wVx":function(e,t,i){},Wzva:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=g(i("+x/D"));i("XphB"),i("C/C5");var n=g(i("HH5i")),a=g(i("5njU")),s=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t.default=e,t}(i("bPPT")),r=g(i("KloK")),u=g(i("h2ur")),l=g(i("kV0L")),d=g(i("+ay7")),p=g(i("XxUV")),c=g(i("4dFR")),f=g(i("OEua")),h=g(i("6RZY")),v=g(i("mMNQ"));function g(e){return e&&e.__esModule?e:{default:e}}function b(e){return e.offset().top}function m(e){this.$el=(0,o.default)(e),this.$el.length&&(this.$body=(0,o.default)("body"),this.$wrapper=this.$el.children(".aui-sidebar-wrapper"),this.$body.addClass("aui-page-sidebar"),this._previousScrollTop=null,this._previousViewportHeight=null,this._previousViewportWidth=null,this._previousOffsetTop=null,this.submenus=new _,function(e){if(!(0,o.default)(".aui-sidebar").length)return;(function(e){e.$el.on("mouseenter mouseleave click focus",e.collapsedTriggersSelector,function(t){var i=(0,o.default)(t.target);T(e,i)})})(e),u.default&&(0,p.default)("only screen and (max-device-width:1024px)")&&(0,o.default)("body").addClass("aui-page-sidebar-touch");var t=null,i=function(){null===t&&(t=requestAnimationFrame(function(){e.reflow(),t=null}))};(0,o.default)(window).on("scroll resize",i),i(),e.isAnimated()&&e.$el.on("transitionend webkitTransitionEnd",function(){e.$el.trigger(o.default.Event(y+(e.isCollapsed()?"collapse-end":"expand-end")))});e.$el.on("click",".aui-sidebar-toggle",function(t){t.preventDefault(),e.toggle()}),(0,o.default)(".aui-page-panel").on("click",function(){!e.isCollapsed()&&e.isViewportNarrow()&&e.collapse()});var a=function(t){(function(e){return!(e.which!==d.default.LEFT_SQUARE_BRACKET||e.shiftKey||e.ctrlKey||e.metaKey||(0,l.default)(e.target))})(t)&&e.toggle()};function s(e){return e.keyCode===d.default.TAB&&!e.shiftKey&&!e.altKey}(0,o.default)(document).on("keypress",a),e._remove=function(){this._removeAllTooltips(),(0,o.default)(this.inlineDialogSelector).remove(),this.$el.off(),this.$el.remove(),(0,o.default)(document).off("keypress",a),(0,o.default)(window).off("scroll resize",i)},e.$el.on("touchend",function(t){e.isCollapsed()&&(e.expand(),t.preventDefault())}),e.$el.on("mouseenter focus",e.collapsedTriggersSelector,function(){if(e.isCollapsed()){var t=(0,o.default)(this);$(t)||D(t)}}),e.$el.on("click blur mouseleave",e.collapsedTriggersSelector,function(){e.isCollapsed()&&P((0,o.default)(this))}),e.$el.on("mouseenter focus",e.toggleSelector,function(){var t=(0,o.default)(this);e.isCollapsed()?t.data("tooltip",n.default.getText("aui.sidebar.expand.tooltip")):t.data("tooltip",n.default.getText("aui.sidebar.collapse.tooltip")),D(t)}),e.$el.on("click blur mouseleave",e.toggleSelector,function(){P((0,o.default)(this))}),e.$el.on("keydown",e.collapsedTriggersSelector,function(t){if(e.isCollapsed()){var i=t.target,n=x(i);if(!n)return;var a=(0,o.default)(n);s(t)&&n.open&&(t.preventDefault(),function(e){e.attr("persistent",""),e.find(":aui-tabbable").first().focus(),setTimeout(function(){e.removeAttr("persistent")},100)}(a),a.on("keydown",function(e){((function(e){return e.keyCode===d.default.TAB&&e.shiftKey})(e)&&function(e,t){return e===t.find(":aui-tabbable")[0]}(e.target,a)||s(e)&&function(e,t){return e===t.find(":aui-tabbable").last()[0]}(e.target,a))&&(i.focus(),(0,o.default)(this).off("keydown"),S())}))}})}(this),function(e){(0,o.default)(e.collapsedTriggersSelector).each(function(){var t=(0,o.default)(this);T(e,t)})}(this))}var y="_aui-internal-sidebar-";function w(e){return o.default.map(e.split(" "),function(e){return y+e}).join(" ")}function k(){return document.querySelectorAll(m.prototype.inlineDialogSelector)}function _(){this.inlineDialog=null}function C(e){return e.is("a")?e.next(".aui-nav"):e.children(".aui-nav, hr")}function x(e){var t=e.getAttribute("aria-controls");return document.getElementById(t)}function $(e){return 0!==C(e).length}function S(){var e=k();Array.prototype.forEach.call(e,function(e){e.open=!1})}function T(e,t){if(!t.data("_aui-sidebar-submenu-constructed")&&(t.data("_aui-sidebar-submenu-constructed",!0),$(t))){var i=document.createElement("aui-inline-dialog"),n=(0,f.default)("sidebar-submenu");return t.attr("aria-controls",n),t.attr("data-aui-trigger",""),c.default.init(t),i.setAttribute("id",n),i.setAttribute("alignment","right top"),i.setAttribute("aria-hidden","true"),i.setAttribute("contained-by","viewport"),e.isCollapsed()&&i.setAttribute("responds-to","hover"),(0,o.default)(i).addClass(m.prototype.inlineDialogClass),document.body.appendChild(i),c.default.init(i),function(e,t,i){i.addEventListener("aui-layer-show",function(n){if(e.isCollapsed()){if(!function(e){return"AUI-INLINE-DIALOG"!==e.target.tagName}(n)&&!function(e){return!e.target.classList.contains("aui-sidebar-submenu-dialog")}(n)){var s=o.default.Event("aui-sidebar-submenu-before-show");t.trigger(s,i),s.isDefaultPrevented()?n.preventDefault():function(e,t){e.addClass("active"),t.innerHTML=V;var i=e.is("a")?e.text():e.children(".aui-nav-heading").text(),n=(0,o.default)(t).find(".aui-navgroup-inner");n.children(".aui-nav-heading").attr("title",i).children("strong").text(i),function(e){var t=(0,a.default)(e);(0,v.default)(t,f.default),t.hasClass("aui-expander-content")&&(t.find(".aui-expander-cutoff").remove(),t.removeClass("aui-expander-content"));return t}(C(e)).appendTo(n)}(t,i)}}else n.preventDefault()}),i.addEventListener("aui-layer-hide",function(){!function(e){e.removeClass("active")}(t)})}(e,t,i),i}}m.prototype.on=function(){var e=arguments[0],t=Array.prototype.slice.call(arguments,1),i=w(e);return this.$el.on.apply(this.$el,[i].concat(t)),this},m.prototype.off=function(){var e=arguments[0],t=Array.prototype.slice.call(arguments,1),i=w(e);return this.$el.off.apply(this.$el,[i].concat(t)),this},m.prototype.setHeight=function(e,t,i){var o=Math.max(0,i-e);return this.$wrapper.height(t-o),this},m.prototype.setTopPosition=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.pageYOffset;return this.$wrapper.toggleClass("aui-is-docked",e>b(this.$el)),this},m.prototype.setPosition=s.fn(m.prototype.setTopPosition,"Sidebar.setPosition",{removeInVersion:"9.0.0",sinceVersion:"7.6.1",alternativeName:"Sidebar.setTopPosition"}),m.prototype.setLeftPosition=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.pageXOffset;return this.$wrapper.hasClass("aui-is-docked")&&this.$wrapper.css({left:-e}),this},m.prototype.setCollapsedState=function(e){var t={collapsed:{},expanded:{}};t.collapsed.narrow={narrow:o.default.noop,wide:function(t){t._expand(e,!0)}},t.collapsed.wide={narrow:o.default.noop,wide:o.default.noop},t.expanded.narrow={narrow:o.default.noop,wide:function(e){e.$body.removeClass("aui-sidebar-collapsed"),e.$el.removeClass("aui-sidebar-fly-out")}},t.expanded.wide={narrow:function(e){e._collapse(!0)},wide:o.default.noop};var i=this.isCollapsed()?"collapsed":"expanded",n=this.isViewportNarrow(this._previousViewportWidth)?"narrow":"wide",a=this.isViewportNarrow(e)?"narrow":"wide";return t[i][n][a](this),this},m.prototype._collapse=function(e){if(this.isCollapsed())return this;var t=o.default.Event(y+"collapse-start",{isResponsive:e});return this.$el.trigger(t),t.isDefaultPrevented()?this:(this.$body.addClass("aui-sidebar-collapsed"),this.$el.attr("aria-expanded","false"),this.$el.removeClass("aui-sidebar-fly-out"),this.$el.find(this.submenuTriggersSelector).attr("tabindex",0),(0,o.default)(this.inlineDialogSelector).attr("responds-to","hover"),this.isAnimated()||this.$el.trigger(o.default.Event(y+"collapse-end",{isResponsive:e})),this)},m.prototype.collapse=function(){return this._collapse(!1)},m.prototype._expand=function(e,t){var i=o.default.Event(y+"expand-start",{isResponsive:t});if(this.$el.trigger(i),i.isDefaultPrevented())return this;var n=this.isViewportNarrow(e);return this.$el.attr("aria-expanded","true"),this.$body.toggleClass("aui-sidebar-collapsed",n),this.$el.toggleClass("aui-sidebar-fly-out",n),this.$el.find(this.submenuTriggersSelector).removeAttr("tabindex"),(0,o.default)(this.inlineDialogSelector).removeAttr("responds-to"),this.isAnimated()||this.$el.trigger(o.default.Event(y+"expand-end",{isResponsive:t})),this},m.prototype.expand=function(){return this.isCollapsed()&&this._expand(this._previousViewportWidth,!1),this},m.prototype.isAnimated=function(){return this.$el.hasClass("aui-is-animated")},m.prototype.isCollapsed=function(){return"false"===this.$el.attr("aria-expanded")},m.prototype.isViewportNarrow=function(e){return(e=void 0===e?this._previousViewportWidth:e)<1240},m.prototype._removeAllTooltips=function(){(0,o.default)(this.tooltipSelector).remove()},m.prototype.responsiveReflow=function(e,t){if(e){if(!this.isCollapsed()&&this.isViewportNarrow(t)){var i=this.isAnimated();i&&this.$el.removeClass("aui-is-animated"),this.collapse(),i&&(this.$el[0].offsetHeight,this.$el.addClass("aui-is-animated"))}}else t!==this._previousViewportWidth&&this.setCollapsedState(t)},m.prototype.reflow=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.pageYOffset,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document.documentElement.clientHeight,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:window.innerWidth,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:document.documentElement.scrollHeight,n=arguments.length>4&&void 0!==arguments[4]?arguments[4]:window.pageXOffset,a=b(this.$el),s=null===this._previousViewportWidth;if(e!==this._previousScrollTop||t!==this._previousViewportHeight||a!==this._previousOffsetTop){this.isCollapsed()&&!s&&e!==this._previousScrollTop&&this._removeAllTooltips();var r=this.$body.hasClass("aui-page-sidebar-touch"),u=e!==this._previousScrollTop&&(e<0||e+t>o);r||!s&&u||(this.setHeight(e,t,a),this.setTopPosition(e))}if(n!==this._previousScrollLeft&&this.setLeftPosition(n),"false"!==this.$el.attr("data-aui-responsive"))this.responsiveReflow(s,i);else{var l=!this.isCollapsed()&&this.isViewportNarrow(i);this.$el.toggleClass("aui-sidebar-fly-out",l)}return this._previousScrollTop=e,this._previousViewportHeight=t,this._previousViewportWidth=i,this._previousOffsetTop=a,this._previousScrollLeft=n,this},m.prototype.toggle=function(){return this.isCollapsed()?(this.expand(),this._removeAllTooltips()):this.collapse(),this},m.prototype.submenuTriggersSelector=".aui-sidebar-group:not(.aui-sidebar-group-tier-one)",m.prototype.collapsedTriggersSelector=[m.prototype.submenuTriggersSelector,".aui-sidebar-group.aui-sidebar-group-tier-one > .aui-nav > li > a",".aui-sidebar-footer > .aui-sidebar-settings-button"].join(", "),m.prototype.toggleSelector=".aui-sidebar-footer > .aui-sidebar-toggle",m.prototype.tooltipSelector=".aui-sidebar-section-tooltip",m.prototype.inlineDialogClass="aui-sidebar-submenu-dialog",m.prototype.inlineDialogSelector="."+m.prototype.inlineDialogClass,_.prototype.submenu=function(e){return M(),C(e)},_.prototype.hasSubmenu=function(e){return M(),$(e)},_.prototype.submenuHeadingHeight=function(){return M(),34},_.prototype.isShowing=function(){return M(),m.prototype.isSubmenuVisible()},_.prototype.show=function(e,t){M(),function(e){x(e).open=!0}(t)},_.prototype.hide=function(){M(),S()},_.prototype.inlineDialogShowHandler=function(){M()},_.prototype.inlineDialogHideHandler=function(){M()},_.prototype.moveSubmenuToInlineDialog=function(){M()},_.prototype.restoreSubmenu=function(){M()},m.prototype.getVisibleSubmenus=function(){return Array.prototype.filter.call(k(),function(e){return e.open})},m.prototype.isSubmenuVisible=function(){return this.getVisibleSubmenus().length>0};var V='<div class="aui-inline-dialog-contents"><div class="aui-sidebar-submenu" ><div class="aui-navgroup aui-navgroup-vertical"><div class="aui-navgroup-inner"><div class="aui-nav-heading"><strong></strong></div></div></div></div></div>';var A={trigger:"manual",gravity:"w",className:"aui-sidebar-section-tooltip",title:function(){var e=(0,o.default)(this);return e.is("a")?e.attr("title")||e.find(".aui-nav-item-label").text()||e.data("tooltip"):e.children(".aui-nav").attr("title")||e.children(".aui-nav-heading").text()}};function D(e){e.tooltip(A).tooltip("show");var t=e.data("tipsy")&&e.data("tipsy").$tip;t&&t.css({opacity:""}).addClass("tooltip-shown")}function P(e){var t=e.data("tipsy")&&e.data("tipsy").$tip;if(t){var i=t.css("transition-duration");if(i){var o=i.indexOf("ms")>=0?parseInt(i.substring(0,i.length-2),10):1e3*parseInt(i.substring(0,i.length-1),10);setTimeout(function(){t.hasClass("tooltip-shown")&&(e.tooltip("hide"),t.removeClass("tooltip-shown"))},o)}else t.removeClass("tooltip-shown")}}var E=(0,h.default)("sidebar",m);(0,o.default)(function(){E(".aui-sidebar")});var M=s.getMessageLogger("Sidebar.submenus",{removeInVersion:"9.0.0",sinceVersion:"5.8.0"});(0,r.default)("sidebar",E),t.default=E,e.exports=t.default},XxUV:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){if(window.matchMedia)return window.matchMedia(e).matches;var t=document.createElement("style");t.type="text/css",t.id="testMedia",t.innerText="@media "+e+" { #testMedia { width: 1px; } }",document.head.appendChild(t);var i="1px"===window.getComputedStyle(t,null).width;return t.parentNode.removeChild(t),i},e.exports=t.default},h2ur:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=window.DocumentTouch,n="ontouchstart"in window||o&&document instanceof o;t.default=n,e.exports=t.default},kV0L:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return"value"in e||e.isContentEditable},e.exports=t.default},mMNQ:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var i=(0,o.default)("<div></div>");i.append(e),i.find("[id]").each(function(e,o){var a=t(o.id+"-");!function(e,t,i){n(e,t,i,"aria-controls"),n(e,t,i,"aria-owns")}(i,o.id,a),o.id=a})};var o=function(e){return e&&e.__esModule?e:{default:e}}(i("+x/D"));function n(e,t,i,o){e.find("["+o+"]").attr(o,function(e,o){return t===o?i:void 0})}e.exports=t.default},pju7:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.sidebar=void 0;var o=i("Wzva");Object.defineProperty(t,"sidebar",{enumerable:!0,get:function(){return function(e){return e&&e.__esModule?e:{default:e}}(o).default}}),i("FStl"),i("Q0fs"),i("rSV2"),i("nqD9"),i("iQXk"),i("IxCr"),i("S3ao"),i("YQ7q"),i("pDZt"),i("eC/R"),i("Rvtc"),i("Nu/Z"),i("6wVx")}},[["pju7","runtime","aui.splitchunk.vendors--e54c7c7304","aui.splitchunk.vendors--b47d4b691d","aui.splitchunk.vendors--084821f40b","aui.splitchunk.vendors--be1eb78c1a","aui.splitchunk.vendors--23f50a6f00","aui.splitchunk.172ffb6da7","aui.splitchunk.b0831cc7d0","aui.splitchunk.572a8bf5cd","aui.splitchunk.087aba7911","aui.splitchunk.fbd1a5ab27","aui.splitchunk.d49cf794d2","aui.splitchunk.54d3f16c20","aui.splitchunk.e54c7c7304","aui.splitchunk.336ae4f9e7","aui.splitchunk.1659111a3c","aui.splitchunk.f5828f5ab9","aui.splitchunk.fb15cffa72","aui.splitchunk.56dfb54d0c","aui.splitchunk.f673ef53ac","aui.splitchunk.8659b532c1","aui.splitchunk.908fe798b4","aui.splitchunk.792781e698","aui.splitchunk.d0110a864f","aui.splitchunk.afa5039e04","aui.splitchunk.bff3715233","aui.splitchunk.c750721820","aui.splitchunk.6d6f245ed3","aui.splitchunk.ed80e00f15","aui.splitchunk.382c9b559f","aui.splitchunk.084821f40b","aui.splitchunk.5b8c290363","aui.splitchunk.baa83dbaf9","aui.splitchunk.b2ecdd4179","aui.splitchunk.36cd9d521c","aui.splitchunk.be1eb78c1a","aui.splitchunk.d925afe2c0","aui.splitchunk.b652d2668a","aui.splitchunk.5b7fdbd666","aui.splitchunk.8a641c03a4","aui.splitchunk.23f50a6f00","aui.splitchunk.e6408ec84b","aui.splitchunk.d727dd207f","aui.splitchunk.543254b237","aui.splitchunk.141abf7fb1","aui.splitchunk.036a05e5ff","aui.splitchunk.a2b2c71491"]]]);