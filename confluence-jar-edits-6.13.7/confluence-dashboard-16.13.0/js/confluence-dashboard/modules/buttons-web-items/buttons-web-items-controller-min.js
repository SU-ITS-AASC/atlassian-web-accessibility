define("confluence-dashboard/modules/buttons-web-items/buttons-web-items-view",["module","exports","backbone","jquery","ajs","aui/templates"],function(t,e,o,n,i,s){"use strict";function u(t){return t&&t.__esModule?t:{default:t}}var r=o.View,d=u(n).default,a=u(i).default,h=u(s).default;e.default=r.extend({el:".aui-buttons",initialize:function(t){var e=this;this.$buttonGroup=t.target,this.buttons=this.getButtons(!!t.hideLastElementsFirst&&t.hideLastElementsFirst),this.totalButtonWidth=0,this.buttons.forEach(function(t){return e.totalButtonWidth+=t.outerWidth}),this.moreMenuWidth=0,this.lastButtonVisibleIndex=this.buttons.length-1,this.handleResize(),d(window).on("resize.aui-responsive-header",a.debounce(function(){e.handleResize()},100))},getAvailableWidth:function(){return this.$buttonGroup.parent().width()},getButtons:function(t){var e=[];return this.$buttonGroup.find(".aui-button").each(function(o,n){var i=d(n),s={$element:i,outerWidth:i.outerWidth(!0)};t?e.unshift(s):e.push(s)}),e},showResponsiveDropdown:function(){void 0===this.$moreMenu?this.$moreMenu=this.createResponsiveDropdownTrigger():this.$moreMenu.appendTo(this.$buttonGroup)},createResponsiveDropdownTrigger:function(){var t=this.$buttonGroup[0].id,e=d(h.dropdown2.trigger({menu:{id:"aui-responsive-button-group-dropdown-content-"+t},content:'<span class="aui-icon aui-icon-small aui-iconfont-more"></span>',extraAttributes:{href:"#"},extraClasses:"aui-button aui-dropdown2-trigger-arrowless",id:"aui-responsive-button-group-dropdown-trigger-"+t}));return e.append(h.dropdown2.contents({id:"aui-responsive-button-group-dropdown-content-"+t,extraClasses:"aui-style-default",content:h.dropdown2.section({content:'<ul id="aui-responsive-button-group-dropdown-list-'+t+'"></ul>'})})),e.appendTo(this.$buttonGroup),this.moreMenuWidth=e.outerWidth(!0),e},handleResize:function(){if(this.buttons.length){var t=this.getAvailableWidth();if(t>this.totalButtonWidth)this.showAllButtons();else{this.showResponsiveDropdown();for(var e=t-this.moreMenuWidth,o=-1;e-this.buttons[o+1].outerWidth>=0;)e-=this.buttons[o+1].outerWidth,o++;o<this.lastButtonVisibleIndex?this.moveToResponsiveDropdown(this.lastButtonVisibleIndex-o):o>this.lastButtonVisibleIndex&&this.moveOutOfResponsiveDropdown(o-this.lastButtonVisibleIndex)}}},moveOutOfResponsiveDropdown:function(t){if(!(t<=0)){this.$buttonGroup[0].id;var e=this.$moreMenu.children(".aui-dropdown2-trigger");e.hasClass("active")&&e.trigger("aui-button-invoke");for(var o=this.lastButtonVisibleIndex+1,n=this.lastButtonVisibleIndex+t,i=o;i<=n;i++){var s=this.buttons[i].$element;s.addClass("aui-button"),s.appendTo(this.$buttonGroup)}this.lastButtonVisibleIndex+=t}},moveToResponsiveDropdown:function(t){if(!(t<=0)){for(var e=this.$buttonGroup[0].id,o=document.querySelector("#aui-responsive-button-group-dropdown-list-"+e),n=this.lastButtonVisibleIndex,i=this.lastButtonVisibleIndex-t+1,s=n;s>=i;s--){var u=this.buttons[s].$element;u.removeClass("aui-button"),o.insertBefore(u[0],o.firstChild)}this.lastButtonVisibleIndex-=t}},hideResponsiveDropdown:function(){void 0!==this.$moreMenu&&this.$moreMenu.detach()},showAllButtons:function(){this.hideResponsiveDropdown(),this.moveOutOfResponsiveDropdown(this.buttons.length-1-this.lastButtonVisibleIndex)}}),t.exports=e.default}),define("confluence-dashboard/modules/buttons-web-items/buttons-web-items-controller",["./buttons-web-items-view","jquery","../../utils/module-starter"],function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}var i=n(t).default,s=n(e).default;n(o).default.register(function(){new i({target:s(".dashboard-buttons .aui-buttons")})})}),require(["confluence-dashboard/modules/buttons-web-items/buttons-web-items-controller"]);