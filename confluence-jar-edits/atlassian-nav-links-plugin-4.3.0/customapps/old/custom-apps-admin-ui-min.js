AJS.$(document).ready(function(){var a=AJS.$("#custom-app-admin-content");var b=new AJS.RestfulTable({autoFocus:true,el:a,allowReorder:false,createPosition:"bottom",resources:{all:AJS.contextPath()+"/rest/custom-apps/1.0/customapps/list",self:AJS.contextPath()+"/rest/custom-apps/1.0/customapps"},columns:[{id:"displayName",header:AJS.I18n.getText("common.words.displayName")},{id:"url",header:AJS.I18n.getText("common.words.url")}]})});