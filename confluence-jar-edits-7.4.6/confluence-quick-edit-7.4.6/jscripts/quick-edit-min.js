define("confluence-quick-edit/quick-edit",["ajs","confluence-editor-loader/block-and-buffer-keys","confluence/legacy","confluence/templates","confluence/meta","jquery","window","document","confluence-editor-loader/editor-loader","confluence/api/event","confluence/api/logger","confluence-quick-edit/captcha-manager","confluence-quick-edit/util","wrm"],function(e,t,n,r,o,i,a,d,c,l,u,s,f,m){"use strict";var g={enableShortcut:function(){i("#editPageLink").addClass("full-load")},disableShortcut:function(){i("#editPageLink").removeClass("full-load")}};function p(e){var t,n,a,d=c.getPreloadContainer();i(".quick-comment-prompt",e.$container).hide(),i(".quick-comment-body",e.$container).addClass("comment-body"),e.content&&e.content.title&&function(e,t){e.find("#content-title").val(t)}(d,e.content.title),e.$form.append(d.children()),d.show(),i("#editor-precursor").hide(),i("#rte-savebar").find(".toolbar-split-left").hide(),"comment"===o.get("content-type")&&(i("#pluggable-status").hide(),t=r.Editor.Page.cancelButton({contentType:o.get("content-type"),sharedDraftsEnabled:o.getBoolean("shared-drafts")}),n=i("#rte-button-cancel"),(a=n.parent(".rte-toolbar-group-done")).length?(a.remove(),i("#rte-button-discard").remove()):n.remove(),i("#rte-savebar").find(".toolbar-split-right").append(t),function(){var e=r.Editor.Page.previewButton({});i("#rte-button-ellipsis").parent().remove(),i("#rte-savebar").find(".toolbar-group-preview").empty().append(e)}())}function v(e){e.$container.find(".quick-comment-loading-container").hide(),e.$form.show(),e.$form.addClass("fadeIn");var t,n,r,o=e.content?e.content.editorContent:"";t=e.editor,n=o,r=e.replayBufferedKeys,n&&(u.debug("Initial Editor Content from quick edit: ",n),t.setContent(n),t.startContent=t.getContent({format:"raw",no_events:1}),t.undoManager.clear()),r()&&t.undoManager.add(),l.trigger("quickedit.success"),l.trigger("quickedit.visible"),l.trigger("add-bindings.keyboardshortcuts"),l.trigger("active.dynamic.rte")}var b=[];var y={loadingContentTimeout:4e3,register:function(e){b.push(e)},disableHandlers:function(){i.each(b,function(e,t){return t.disable()})},enableHandlers:function(){i.each(b,function(e,t){return t.enable()})},SaveBarBinder:{bind:function(e,t){e&&n.Editor.addSaveHandler(e),t&&n.Editor.addCancelHandler(t)}},activateEditor:function(n){function r(){var r,s=new i.Deferred;if("READ_ONLY"===o.get("access-mode"))return u.logError("activateEditor could not be initialised: Read-only mode is enabled"),s.reject("READ_ONLY");if(e.Rte&&e.Rte.getEditor())return u.debug("there is already an editor open"),s.reject("EDITOR_OPEN");if(!n.$container||!n.$form)return u.logError("activateEditor could not be initialised: bad arguments",n),s.reject("BAD_ARGS");r=t.block(i(d)),n.preActivate&&n.preActivate(),g.disableShortcut();var b=n.timeoutResources||c.loadingTimeout,h=y.loadingContentTimeout;var E,k,C,q=f.timeoutDeferred;return i.when(q("resources",(C=new i.Deferred,c.load(function(){setTimeout(function(){C.resolve()},0)},function(){C.reject()}),C),b),q("fetch content",n.fetchContent||i.Deferred().resolve(),h),q("additional resources",n.additionalResources?(E=n.additionalResources,k=new i.Deferred,m.require(E).done(function(e){k.resolve(e)}).fail(function(e){k.reject(e)}),k):i.Deferred().resolve(),b)).done(function(t,a){var d={$container:n.$container,content:a,$form:n.$form,replayBufferedKeys:r};n.preInitialise&&n.preInitialise(d),p(d);var c=function(){var t;d.editor=e.Rte.getEditor(),v(d),n.postInitialise&&n.postInitialise(d),y.SaveBarBinder.bind(n.saveHandler,n.cancelHandler),l.trigger("rte-quick-edit-ready"),t=o.get("content-type"),!o.get("collaborative-content")||"page"!==t&&"blogpost"!==t||l.trigger("rte-collab-editor-loaded"),l.unbind("rte-ready",c),s.resolve()};l.bind("rte-ready",c),l.bind("rte-destroyed",n.postDeactivate||function(){}),e.Rte.BootstrapManager.initialise({plugins:n.plugins,toolbar:n.toolbar,excludePlugins:n.excludePlugins,isQuickEdit:!0,onInitialise:n.onInitialise}),i("#rte-toolbar, #comments-section .aui-button").attr("tabindex","0")}).fail(function(e,t){s.reject(e,t),u.logError("Error loading page quick edit. Falling back to normal edit URL..."),l.trigger("analytics",{name:"rte.quick-edit.activate-editor.failed"}),n.fallbackUrl&&(u.log("This parameter is deprecated. To be removed in the next major version (5.8 or 6.0). Please use the promise returned to bind custom action if the editor fails to load instead."),a.location=n.fallbackUrl)}),s.promise()}if(n.closeAnyExistingEditor&&e.Rte&&e.Rte.getEditor()){var s=new i.Deferred;return this.deactivateEditor().done(function(){r().done(function(){s.resolve()}).fail(function(e){s.reject(e)})}).fail(function(){u.debug("Could not deactivate current editor."),s.reject("Could not deactivate current editor.")}),s.promise()}return r()},deactivateEditor:function(){require("tinymce").majorVersion>=4?require("tinymce").execCommand("mceRemoveEditor",!0,"wysiwygTextarea"):require("tinymce").execCommand("mceRemoveControl",!0,"wysiwygTextarea"),n.Editor.UI.toggleSavebarBusy(!1);var e=c.getPreloadContainer().empty();return i(".editor-container").remove(),i("#editor-precursor").remove(),i("#anonymous-warning").remove(),i(".quick-comment-prompt").show(),i(".bottom-comment-panels").show(),i("#editor-notification-container").empty(),i(".action-reply-comment").removeAttr("reply-disabled"),g.enableShortcut(),n.Editor.removeAllSaveHandlers(),n.Editor.removeAllCancelHandlers(),c.getEditorPreloadMarkup().done(function(t){e.append(t),e.hide(),new s(e).refreshCaptcha(),l.trigger("rte-destroyed"),l.unbind("rte-destroyed")})}};return y}),require("confluence/module-exporter").exportModuleAsGlobal("confluence-quick-edit/quick-edit","AJS.Confluence.QuickEdit");