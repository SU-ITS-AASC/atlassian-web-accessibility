define("confluence/attachments",["ajs","confluence/templates","confluence/api/ajax","confluence/api/constants"],function(e,t,n,o){var a,i={showOlderVersions:function(t){t(".attachment-history a").click(function(n){var o=t(this).parents("table.attachments"),a=t(this).parents("tr:first")[0].id.substr(11),i=t(".history-"+a,o);return t(this).hasClass("icon-section-opened")?t(this).toggleClass("icon-section-opened").attr("aria-expanded","false").toggleClass("icon-section-closed"):t(this).hasClass("icon-section-closed")&&t(this).toggleClass("icon-section-closed").attr("aria-expanded","true").toggleClass("icon-section-opened"),i.toggleClass("hidden"),e.stopEvent(n)})}},r=!1;function s(t){clearTimeout(a),r&&(e.log("Preventing submit due to recent form submission."),t.preventDefault()),r=!0,a=setTimeout(function(){r=!1},2e3)}return{component:i,initialiser:function(a){a("#upload-attachments").on("submit",s);var r=a("#more-attachments-link");r.click(function(t){return a(".more-attachments").removeClass("hidden"),r.addClass("hidden"),e.stopEvent(t)}),i.showOlderVersions(a);var c=t.Attachments;function l(e,t){return a(e).parents("["+t+"]").attr(t)}function m(e){return l(e,"data-attachment-filename")}function u(t){return e.ConfluenceDialog({width:600,height:200,id:t})}function d(t,o,i){var r=u("attachment-removal-confirm-dialog");r.addHeader(o),r.addPanel("",i),r.addSubmit(e.I18n.getText("ok"),function(){var o,i,s,l;o=t,s=function(e,t,n){location.reload(!0)},l=function(t,n,o){var i=null;if(t.responseText){var s=a.parseJSON(t.responseText);s.actionErrors&&(i=s.actionErrors)}var l=u("attachment-removal-error-dialog");l.addHeader(c.removalErrorTitle()),l.addPanel("",c.removalErrorBody({messages:i})),l.addButton(e.I18n.getText("close.name"),function(){location.reload(!0)}),l.show(),r.remove()},i=(i=null)||{},n.ajax({type:"POST",url:o,data:i,success:s,error:l})}),r.addCancel(e.I18n.getText("cancel.name"),function(){r.remove()}),r.show()}function h(e,t){return o.CONTEXT_PATH+e+t}a(".removeAttachmentLink").click(function(){return i.showRemoveAttachmentConfirmDialog(this),!1}),a(".removeAttachmentLinkVersion").click(function(e){var t;return d(h("/json/removeattachmentversion.action",this.search),c.versionRemovalConfirmationTitle(),c.versionRemovalConfirmationBody({filename:m(this),version:(t=this,l(t,"data-attachment-version"))})),!1}),i.showRemoveAttachmentConfirmDialog=function(e){d(h("/json/removeattachment.action",e.search),c.removalConfirmationTitle(),c.removalConfirmationBody({filename:m(e)}))}},submitHandler:s}}),require("confluence/module-exporter").safeRequire("confluence/attachments",function(e){var t=require("ajs");t.Attachments=e.component,t.toInit(e.initialiser)});