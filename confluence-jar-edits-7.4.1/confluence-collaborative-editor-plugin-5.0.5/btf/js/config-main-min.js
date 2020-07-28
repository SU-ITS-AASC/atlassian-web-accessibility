require(["ajs","confluence/legacy","confluence-collaborative-editor-plugin/btf/dialog/change-mode-dialog","confluence-collaborative-editor-plugin/btf/dialog/restart-synchrony-dialog","confluence-collaborative-editor-plugin/btf/event/event","confluence-collaborative-editor-plugin/btf/fetch/fetch-collab-status","confluence-collaborative-editor-plugin/btf/fetch/fetch-synchrony-configuration","confluence-collaborative-editor-plugin/btf/fetch/fetch-synchrony-status","confluence-collaborative-editor-plugin/btf/state/state","confluence-collaborative-editor-plugin/btf/static/constants","confluence-collaborative-editor-plugin/btf/static/collab-editing-message-options","confluence-collaborative-editor-plugin/btf/util/option-selector"],function(q,s,n,u,D,b,x,c,k,f,h,B){var t=5000;var i="change";q.toInit(function(){var E=!WRM.data.claim("com.atlassian.confluence.plugins.confluence-collaborative-editor-plugin:btf-config-resources.synchrony-self-managed-cluster");k.setExternalSynchrony(E);C();setInterval(function(){C(true)},t)});q.bind(D.CHANGE_COLLAB_MODE_EVENT,C.bind(this,true));q.bind(D.SYNCHRONY_RESTARTED_EVENT,C.bind(this,true));function C(E){if(!E){q.$(f.COLLAB_STATUS_SPINNER_SELECTOR).spin();q.$(f.SYNCHRONY_STATUS_SPINNER_SELECTOR).spin()}a();j()}function a(){q.$.when(b(),c()).done(function(F,E){q.$(f.COLLAB_STATUS_SPINNER_SELECTOR).spinStop();q.$(f.SYNCHRONY_STATUS_SPINNER_SELECTOR).spinStop();var G=y(F);var H=r(E);k.setCollabStatus(G);k.setSynchronyStatus(H);k.setTaskId(F.longRunningTaskId);k.setTaskName(F.longRunningTaskName);g(G);l(H,G);A(G,H);m();d();p()})}function p(){q.$(f.COLLAB_CONFIG_SELECTOR).find(f.STATUS_LOZENGE_SELECTOR).css("opacity",w()?0.5:1)}function j(){x().done(function(J){var I={name:q.I18n.getText("collab.admin.btf.configure.synchrony.configuration.property.port"),value:J.port};var E={name:q.I18n.getText("collab.admin.btf.configure.synchrony.configuration.property.memory"),value:J.memory.toUpperCase()+"B"};var H={name:q.I18n.getText("collab.admin.btf.configure.synchrony.configuration.property.driver"),value:J.driver};var G={name:q.I18n.getText("collab.admin.btf.configure.synchrony.configuration.property.serviceUrl"),value:J.serviceUrl};var F=k.isExternalSynchrony()?[G,H]:[I,E,H];q.$(f.SYNCHRONY_PROPERTIES_SELECTOR).html(s.Templates.CollaborativeEditor.Admin.BTF.Config.synchronyConfig({properties:F}))})}function m(){var F=q.$(f.COLLAB_STATUS_SELECTOR);var E=F.find(f.ACTION_BUTTON_SELECTOR);E.click(function(){n.popDialog()});E.prop("disabled",w())}function d(){var F=q.$(f.SYNCHRONY_STATUS_SELECTOR);var E=F.find(f.ACTION_BUTTON_SELECTOR);if(k.isExternalSynchrony()||k.getCollabStatus()===f.COLLAB_STATUS_DISABLED){return E.remove()}E.click(function(){u.popDialog()});E.prop("disabled",w())}function A(H,G){var F=q.$(f.COLLAB_MESSAGE_SELECTOR);F.find(".aui-message").remove();F.hide();var E=z(H,G);if(!E||!E.body){return}q.messages[E.type||"generic"](f.COLLAB_MESSAGE_SELECTOR,{title:E.title,body:"<p>"+E.body+"</p>"+(E.action?e(E.action):""),closeable:false});F.show();v(F,E.action)}function e(E){return s.Templates.CollaborativeEditor.Admin.BTF.Config.actionLink({action:E})}function v(G,F){var E=G.find(".action-link").first();switch(F){case i:E.click(function(){n.popDialog()})}}function z(F,E){return B(h.COLLAB_STATUS_MESSAGE,{collabStatus:F,synchronyStatus:E,externalSynchrony:k.isExternalSynchrony(),synchronyRestarting:w()})}function w(){var F=k.getTaskName()===f.ENABLE_TASK_NAME||k.getTaskName()===f.RESTART_SYNCHRONY_TASK_NAME;var E=k.getSynchronyStatus()!==f.SYNCHRONY_STATUS_RUNNING&&k.getTaskId()&&F;return !!E}function g(F){var E=q.$(f.COLLAB_STATUS_SELECTOR);E.html(s.Templates.CollaborativeEditor.Admin.BTF.Config.collabStatus({mode:F}))}function l(E,G){var F=q.$(f.SYNCHRONY_STATUS_SELECTOR);F.html(s.Templates.CollaborativeEditor.Admin.BTF.Config.synchronyStatus({status:E,collabMode:G}));o()}function o(){var G=q.$(f.SYNCHRONY_STATUS_SELECTOR);var F=G.find(f.SYNCHRONY_DESCRIPTION_MANAGED_SELECTOR);var E=G.find(f.SYNCHRONY_DESCRIPTION_EXTERNAL_SELECTOR);if(k.isExternalSynchrony()){E.show();F.remove()}else{E.remove();F.show()}}function y(E){if(E.synchronyEnabled&&E.sharedDraftsEnabled){return f.COLLAB_STATUS_ENABLED}if(!E.synchronyEnabled&&E.sharedDraftsEnabled){return f.COLLAB_STATUS_LIMITED}return f.COLLAB_STATUS_DISABLED}function r(E){if(E.status==="running"){return f.SYNCHRONY_STATUS_RUNNING}if(E.status==="stopped"){return f.SYNCHRONY_STATUS_STOPPED}return f.SYNCHRONY_STATUS_ERROR}});