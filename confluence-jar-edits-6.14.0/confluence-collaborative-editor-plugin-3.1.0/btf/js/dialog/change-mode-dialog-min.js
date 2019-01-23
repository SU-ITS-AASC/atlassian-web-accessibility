define("confluence-collaborative-editor-plugin/btf/dialog/change-mode-dialog",["ajs","confluence/legacy","confluence-collaborative-editor-plugin/btf/action/change-mode-action","confluence-collaborative-editor-plugin/btf/event/event","confluence-collaborative-editor-plugin/btf/service/task-service","confluence-collaborative-editor-plugin/btf/state/state","confluence-collaborative-editor-plugin/btf/static/constants","confluence-collaborative-editor-plugin/btf/util/option-selector","confluence-collaborative-editor-plugin/btf/static/collab-editing-message-options"],function(m,s,p,H,z,j,h,E,i){var F="#change-collab-mode-dialog";var y="#dialog-submit-button";var f="#dialog-close-button";var c=".radio.enabled";var b=".radio.limited";var k=".radio.disabled";var x="#mode-enabled";var r="#mode-limited";var D="#mode-disabled";function u(){m.$(F).remove();var I={options:n()};m.$("body").append(s.Templates.CollaborativeEditor.Admin.BTF.Config.actionDialog(I));m.dialog2(F).show();G()}function G(){t();C();o()}function n(){var K=e(h.COLLAB_STATUS_ENABLED);var J=e(h.COLLAB_STATUS_LIMITED);var I=e(h.COLLAB_STATUS_DISABLED);return[{name:"enabled",id:"mode-enabled",label:m.I18n.getText("collab.admin.btf.configure.on"),descriptionHtml:K.body,icon:K.type},{name:"limited",id:"mode-limited",label:m.I18n.getText("collab.admin.btf.configure.limited"),descriptionHtml:J.body,icon:J.type},{name:"disabled",id:"mode-disabled",label:m.I18n.getText("collab.admin.btf.configure.off"),descriptionHtml:I.body,icon:I.type}]}function e(J){var I=j.getCollabStatus();var K=j.getSynchronyStatus();return E(i.COLLAB_MODE_DESCRIPTORS,{collabStatus:I,synchronyStatus:K,newCollabStatus:J},{body:"",icon:""})}function o(){var N=m.$(F);var I=N.find(c);var M=N.find(b);var J=N.find(k);var O=N.find(x);var L=N.find(r);var K=N.find(D);E([{option:function(){O.prop("checked",true).focus();L.prop("checked",false);K.prop("checked",false);g(I);j.setNewCollabMode(h.COLLAB_STATUS_ENABLED)},conditions:{currentMode:h.COLLAB_STATUS_ENABLED}},{option:function(){O.prop("checked",false);L.prop("checked",true).focus();K.prop("checked",false);g(M);j.setNewCollabMode(h.COLLAB_STATUS_LIMITED)},conditions:{currentMode:h.COLLAB_STATUS_LIMITED}},{option:function(){M.hide();O.prop("checked",false);L.prop("checked",false);K.prop("checked",true).focus();g(J);j.setNewCollabMode(h.COLLAB_STATUS_DISABLED)},conditions:{currentMode:h.COLLAB_STATUS_DISABLED}}],{currentMode:j.getCollabStatus()})();B()}function g(J){var I='<span class="current-mode">'+m.I18n.getText("collab.admin.btf.configure.current.mode")+"</span> ";J.find("label").after(I)}function C(){var K=m.$(F);var L=K.find(x);var J=K.find(r);var I=K.find(D);L.change(function(){if(L.prop("checked")){j.setNewCollabMode(h.COLLAB_STATUS_ENABLED)}B()});J.change(function(){if(J.prop("checked")){j.setNewCollabMode(h.COLLAB_STATUS_LIMITED)}B()});I.change(function(){if(I.prop("checked")){j.setNewCollabMode(h.COLLAB_STATUS_DISABLED)}B()})}function B(){if(j.getNewCollabMode()===j.getCollabStatus()){q()}else{l()}}function t(){var J=m.$(F);var I=J.find(y);var K=J.find(f);K.click(function(){m.dialog2(F).remove()});I.click(A)}function A(){d();v();var I;switch(j.getNewCollabMode()){case h.COLLAB_STATUS_ENABLED:I=p.enable;break;case h.COLLAB_STATUS_DISABLED:I=p.disable;break;case h.COLLAB_STATUS_LIMITED:I=p.limited;break}I().done(function(K){var J=K.taskId;z.processTask(J,undefined,function(){m.trigger(H.CHANGE_COLLAB_MODE_EVENT);m.dialog2(F).remove()})})}function v(){var I=m.$(F);var J=I.find(f);J.prop("disabled",true);q()}function a(){var I=m.$(F);var J=I.find(f);J.prop("disabled",false);l()}function l(){var J=m.$(F);var I=J.find(y);I.prop("disabled",false)}function q(){var J=m.$(F);var I=J.find(y);I.prop("disabled",true)}function d(){m.$(F).find(".button-spinner").spin()}function w(){m.$(F).find(".button-spinner").spinStop()}return{popDialog:u}});