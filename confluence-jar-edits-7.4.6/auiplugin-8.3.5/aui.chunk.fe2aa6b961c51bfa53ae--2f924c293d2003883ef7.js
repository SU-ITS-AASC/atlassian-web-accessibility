(window.__auiJsonp=window.__auiJsonp||[]).push([["aui.splitchunk.036a05e5ff"],{"C/C5":function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.NavigationEl=void 0;var i=o(a("HH5i")),n=o(a("+x/D")),r=o(a("4dFR")),l=o(a("KloK")),s=o(a("6RZY"));function o(e){return e&&e.__esModule?e:{default:e}}function u(e){if(this.$el=(0,n.default)(e).closest(".aui-nav"),this.$el.length>1)return this.$el.map(function(e,t){return new u(t)})[0];if(this.$el.data("aui-navigation"))return this.$el.data("aui-navigation");this.$el.data("aui-navigation",this),this.$treeParent=this.$el.parent("li[aria-expanded]"),this.$subtreeToggleIcon=this.$treeParent.children(".aui-nav-subtree-toggle").children("span.aui-icon"),this.hideMoreItems(),this.$el.children("li:has(.aui-nav-selected)").addClass("aui-nav-child-selected");var t=this.$el.children(".aui-nav-selected");return t.parents(".aui-nav > [aria-expanded=false]").add(t.filter("[aria-expanded=false]")).each(function(){d((0,n.default)(this).children(".aui-nav")).expand()}),this.$el.find("> li[aria-expanded] > .aui-nav-subtree-toggle").on("click",function(){d((0,n.default)(this).siblings(".aui-nav")).toggle()}),this}u.prototype.isNested=function(){return 1===this.$treeParent.length},u.prototype.isCollapsed=function(){return"false"===this.$treeParent.attr("aria-expanded")},u.prototype.expand=function(){return this.$treeParent.attr("aria-expanded","true"),this.$subtreeToggleIcon.removeClass("aui-iconfont-collapsed").addClass("aui-iconfont-expanded"),this.hideMoreItems(),this},u.prototype.collapse=function(){return this.$treeParent.attr("aria-expanded","false"),this.$subtreeToggleIcon.removeClass("aui-iconfont-expanded").addClass("aui-iconfont-collapsed"),this},u.prototype.toggle=function(){return this.isCollapsed()?this.expand():this.collapse(),this},u.prototype.hideMoreItems=function(){if(this.$el.is(".aui-nav:not([aria-expanded=false]) [data-more]")){var e=this.$el.attr("data-more")||i.default.getText("aui.words.moreitem"),t=Math.abs(parseInt(this.$el.attr("data-more-limit")))||5,a=this.$el.children("li"),r=a.length<=t+1,l=a.filter(".aui-nav-selected").length,s=a.filter(".aui-nav-more").length;if(r||l||s)return this;(0,n.default)("<li>",{class:"aui-nav-more","aria-hidden":"true"}).append((0,n.default)("<a>",{href:"#",class:"aui-nav-item",text:e,click:function(e){e.preventDefault(),(0,n.default)(this).parent().remove()}})).insertAfter(a.eq(t-1))}return this};var d=(0,s.default)("navigation",u),h=(0,r.default)("aui-nav",{type:r.default.type.CLASSNAME,attached:function(e){new u(e)},detached:function(e){(0,n.default)(e).removeData()}});(0,l.default)("navigation",d),t.default=d,t.NavigationEl=h},"eC/R":function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.NavigationEl=t.navigation=void 0;var i=a("C/C5");Object.defineProperty(t,"navigation",{enumerable:!0,get:function(){return function(e){return e&&e.__esModule?e:{default:e}}(i).default}}),Object.defineProperty(t,"NavigationEl",{enumerable:!0,get:function(){return i.NavigationEl}}),a("pDZt")}}]);