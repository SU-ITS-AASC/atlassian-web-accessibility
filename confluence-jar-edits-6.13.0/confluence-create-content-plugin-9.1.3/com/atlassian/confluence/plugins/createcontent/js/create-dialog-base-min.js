Confluence.Dialogs=Confluence.Dialogs||{},function(e){Confluence.Dialogs.CreateDialogBase=function(t){var n,i,a,o=t.dialogId,l=t.webItemsPath,r=[],c=!1,s=Confluence.storageManager("confluence-create-content-plugin");function d(){if(!i.find(".button-panel-cancel-link:visible").is(".disabled"))return Confluence.Blueprint.HowToUse&&Confluence.Blueprint.HowToUse.notifyCancel(n),AJS.trigger("analytics",{name:o+".cancel"+a}),n.remove(),e(".tipsy").remove(),n=null,i=null,!1}function u(){return e(".create-dialog-create-button:visible")}function f(){return e(".create-dialog-body .template:visible").length}function p(e){return e.data("content-blueprint-id")}function g(e){var t=p(e),n=e.data("template-id"),i=t||n;return i?h(t?"contentBlueprintId":"templateId",i):h("itemModuleCompleteKey",e.data("item-module-complete-key"))}function m(t){if(!f())return!1;if("disabled"===e(this).attr("disabled"))return!1;e(this).attr("disabled","disabled").before('<div class="create-dialog-button-spinner"></div>'),e(".create-dialog-button-spinner").spin("small");var i=P.getSpaceKey(),a=g(e(".template.selected"));if(!a)throw new Error("Expected at least one template to be selected");a.spaceKey=i,Confluence.Blueprint.fireWizard(t,a,n)}function b(){f()?u().removeAttr("disabled"):u().attr("disabled","disabled")}function h(e,t){return _.find(P.loadedWebitems[P.getSpaceKey()],function(n){return n[e]==t})}function v(e){var t=h("contentBlueprintId",e),n=D(!(t&&t.wizard));u().text(n)}function C(e){e.addClass("selected").siblings().removeClass("selected"),v(p(e)),AJS.trigger(Confluence.Dialogs.Events.ITEM_SELECTED,{item:e})}function S(e){e.bind("keydown",function(t){var n=function(e){switch(e){case 37:return-1;case 39:return 1;case 38:return-2;case 40:return 2}return 0}(t.which);if(n)return function(e,t){var n=e.find(".template"),i=n.filter(".selected"),a=n.index(i)+t;a%=n.length;var o=n.eq(a);C(o),o.focus(),e.simpleScrollTo(o)}(e,n),AJS.stopEvent(t)})}function y(){var t=e(".templates");t.css("height",t.outerHeight(!1)-e("#discover-new-banner").outerHeight())}function I(){e(".template").click(function(){C(e(this))}).dblclick(function(){u().click()}).focus(function(){e(this).click()}),e(".template:visible:first").click()}function k(){return e.parseJSON(s.getItem("dismissed"))||[]}function w(){var t=e("#discover-new-banner");t.length&&t.remove()}function x(){if(0==r.length||c)return!1;var t=k();if(0==t.length)return!0;for(var n=0;n<r.length;++n)if(-1==e.inArray(r[n].itemModuleCompleteKey,t))return!0;return!1}function D(e){return e?AJS.I18n.getText("create.content.plugin.create-dialog.submit-button.label"):AJS.I18n.getText("create.content.plugin.create-dialog.next-button.label")}function A(e){return function(t,n,i){var a=e&&e.call(this,t,n);if(!0===a||!i)return a;i.preventDefault()}}function J(e,t,n,i){var a=D(n);e.addButton(AJS.I18n.getText(a),null,"create-dialog-create-button"),e.buttonpanel.find(".button-panel-button").removeClass("button-panel-button").addClass("aui-button"),e.buttonpanel.find(".create-dialog-create-button").addClass("aui-button-primary").click(t),i&&e.buttonpanel.addClass(i),this.addCancel(AJS.I18n.getText("close.name"),A(d))}function T(e,t,n,i){return this.addBackButton(e,n),this.addButtonPanel(e,A(t),i),e.buttonpanel}function B(t,n){t.addButton(AJS.I18n.getText("create.content.plugin.create-dialog.prev-button.label"),A(function(i){n&&n(),1==i.curpage&&i.fillWebItemsInDialog(),i.prevPage(),0==i.curpage&&y(),t.remove(),i.page.pop(),f()&&!e(".template.selected").length&&e(".template:visible:first").click()}),"button-panel-back")}function E(){this.getPage(this.curpage).buttonpanel.find(".button-panel-back").remove()}var P={openDialog:function(l){a=(l=l||{}).triggerSrc?"."+l.triggerSrc:"";var r={width:840,height:449,id:o,closeOnOutsideClick:!1,keypressListener:function(e){if(n)if(27===e.keyCode)d();else if(13===e.keyCode){if("textarea"==(e.target.nodeName&&e.target.nodeName.toLowerCase()))return;u().click()}},focusSelector:".templates"};n=e.extend(new AJS.Dialog(r),P),i=n.popup.element,n.addHeader(t.headingText),n.initContext=l.initContext;var c=i.searcher=Confluence.DomFilterField({items:"#create-dialog .templates .template",inputId:"createDialogFilter",placeholderText:AJS.I18n.getText("create.content.plugin.filter.name"),postSearch:function(e){0==e.length?AJS.trigger(Confluence.Dialogs.Events.ITEM_SELECTED,{noVisibleItem:!0}):e.eq(0).click(),l.showStepOne||b()},submitCallback:function(e,t){e.eq(0).dblclick()}});return c.form.find("input").attr("tabindex",100).parent().prepend('<label for="createDialogFilter" class="assistive">AJS.I18n.getText("create.content.plugin.filter.name")</label>'),i.find(".dialog-title").prepend(t.helpLinkTemplate(),c.form),i.find(".dialog-help-link > a").attr("tabindex",100),n.addPanel("SinglePanel",Confluence.Templates.Blueprints.createDialogBody(),"loading"),e.extend(n,{addButtonPanel:J,addFullButtonPanel:T,addBackButton:B,removeBackButton:E}),n.addButtonPanel(n.getPage(0),m),n.prevPage=function(){return i.find(".create-dialog-button-spinner").remove(),i.find(".create-dialog-create-button").removeAttr("disabled"),AJS.Dialog.prototype.prevPage.apply(n,arguments)},i.find(".dialog-button-panel").find("button, .button-panel-link").attr("tabindex",100),i.options=l=e.extend({showDialog:!0,updateHeight:!0},l),n.getPanel(0).setPadding(0),n.gotoPanel(0),e("#create-dialog").find(".wait-icon").spin("medium"),l.showDialog&&n.show(),Confluence.sessionCheck(),n},closeDialog:d,requestWebItems:function(t,n){var i=this;n=!!_.isUndefined(n)||n,i.loadedWebitems=i.loadedWebitems||{};var a=this.loadedWebitems[t];return a?AJS.$.Deferred().resolveWith(a):e.ajax({url:Confluence.getContextPath()+l,dataType:"json",data:{spaceKey:t},async:n}).done(function(e){i.loadedWebitems[t]=e})},requestSpaces:function(){var e=this;return AJS.$.getJSON(Confluence.getContextPath()+"/rest/create-dialog/1.0/spaces",{promotedSpaceKey:AJS.params.spaceKey,promotedSpacesLimit:10,otherSpacesLimit:1e3}).done(function(t){e.loadedSpaces=t,AJS.trigger("create-dialog.data-ready")})},loadedWebitems:{},loadedSpaces:{},fillWebItemsInDialog:function(t,a){var o=P.getSpaceKey(),l=P.loadedWebitems[o];l=P.filterWebItems(l),c=l&&l.length>0&&l[0].isPromoted,r=function(t){for(var n=[],i=[],a=0,o=t.length;a<o;a++)t[a].isNew&&(l=e.parseJSON(s.getItem("used")),i=l||[],-1!=e.inArray(t[a].itemModuleCompleteKey,i)?t[a].isNew=!1:n.push(t[a]));var l;return n}(l),!c&&t&&(l=r);var d=Confluence.Templates.Blueprints.templates({webItems:l,spaceKey:o}),u=e(d),f=function(e){if(n.initContext)for(var t,i,a=Confluence.Blueprint.Selector.getSelectors(),o=0,l=a.length;o<l;o++)if((t=a[o](n.initContext))&&t.length){if((i=e.find('.template[data-item-module-complete-key="'+t+'"]')).length)return i;AJS.log("Attempted to select a blueprint that could not be found in the create dialog: "+t)}}(u);if(c&&void 0===f){o=P.getSpaceKey();var p=e.parseJSON(s.getItem("showMore"))||{},m=p[o];if(!m||m<3){var h=u.find(".template");_.each(h,function(t){var n=e(t);g(n).isPromoted||n.hide()});var v=u.append(Confluence.Templates.Blueprints.Promoted.showMore())[0];e("#promoted-link",v).click(function(){p[o]=(m||0)+1,s.setItemQuietly("showMore",JSON.stringify(p)),e(this).closest(".templates").find(".template").css("display",""),e(this).closest("li").remove(),b()})}}var C=i.find(".templates");if(C.length?a?C.fadeOut(150,function(){C.replaceWith(u.fadeIn(150)),y(),I(),S(u)}):C.replaceWith(u):e(".template-select-container-body").append(u),x()){var D=!t;!function(t,n){w();var i=Confluence.Templates.Blueprints.discoverNewBanner({newItemsNo:t,showLinkToNew:n}),a=e(".template-select-container-body");a.prepend(i),a.find(".aui-button-link").click(function(){var t=!e(this).data("is-filtered");P.fillWebItemsInDialog(t,!0)}),e("#discover-new-banner .icon-close").click(function(){e("#discover-new-banner").slideUp(150);var t,n,i=k();for(t=0,max=r.length;t<max;t++)n=r[t].itemModuleCompleteKey,-1==e.inArray(n,i)&&i.push(n);s.setItemQuietly("dismissed",JSON.stringify(i)),P.fillWebItemsInDialog(!1)})}(r.length,D)}else w();i.searcher&&(i.searcher.refreshItems(),i.searcher.filter()),i.find(".loading").removeClass("loading"),i.trigger("create-content.loaded"),I(),S(u),x()&&y(),void 0!==f&&i.find(".templates").simpleScrollTo(f.first().click()),b()},filterWebItems:function(e){return e},getSpaceKey:function(){return null},setDialogError:function(e){AJS.messages.error(".create-dialog-body",{body:e,id:"create-dialog-error-message",closeable:!1}),i.find(".loading").removeClass("loading"),i.find(".create-dialog-create-button").remove(),i.find("#createDialogFilter").remove()}};return P}}(AJS.$),Confluence.Dialogs.Events={},Confluence.Dialogs.Events.ITEM_SELECTED="create-dialog.item-selected";