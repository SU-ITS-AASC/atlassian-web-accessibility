(function(l,t){function n(b,a,c,d){AJS.trigger("blueprint.before-create");var g=Confluence.storageManager("confluence-create-content-plugin"),e=l.parseJSON(g.getItem("used"));null==e&&(e=[]);e.push(p.itemModuleCompleteKey);g.setItemQuietly("used",JSON.stringify(e));g="";_.isString(b)&&(g=b);e=p.createResult;if(d&&d.getSubmissionRestPath)b=d.getSubmissionRestPath();else{a:switch(e){case "view":b="content-blueprint/create-content";break a;case "space":b="space-blueprint/create-space";break a;default:b=
"content-blueprint/create-draft"}b="/rest/create-dialog/1.0/"+b}b=Confluence.getContextPath()+b;c=c?c.getParentPageId():"";var f=!!a.goToIndexPage;delete a.goToIndexPage;a=d&&d.assembleSubmissionObject?d.assembleSubmissionObject(a):"space"==e?u(a):v(g,a,c);a=JSON.stringify(a);var h=AJS.$(".create-dialog-button-spinner");d=AJS.$("#create-dialog .dialog-button-panel");var k=d.find(".create-dialog-create-button");0===h.length&&(d.prepend('\x3cdiv class\x3d"create-dialog-button-spinner"\x3e\x3c/div\x3e'),
h=AJS.$(".create-dialog-button-spinner").spin("small"));l.ajax({url:b,type:"POST",dataType:"json",contentType:"application/json",data:a}).done(function(a){window.location=f?a.indexPage.createSuccessRedirectUrl||a.indexPage.url:a.createSuccessRedirectUrl||a.url}).fail(function(a,b,c){a=JSON.parse(a.responseText).errorMessage||"";b=AJS.I18n.getText("create.content.plugin.plugin.templates.error-message.title");t("aui/flag")({type:"error",title:b,body:a});k.length&&k.prop("disabled")&&k.prop("disabled",
!1)}).always(function(){h.spinStop();h.remove()});AJS.trigger("blueprint.after-create")}function u(b){var a={spaceKey:b.spaceKey,name:b.name,description:b.description,permissions:b.spacePermission,spaceBlueprintId:p.contentBlueprintId};a.context=b;return a}function v(b,a,c){a=a||{};b=a.title||b||"";var d=a.viewPermissionsUsers||"",g=a.contentTemplateId||"",e=a.contentTemplateKey||"";c=a.parentPageId||c;var f={};f.spaceKey=k;f.contentBlueprintId=p.contentBlueprintId;f.contentTemplateId=g;f.contentTemplateKey=
e;f.title=b;f.viewPermissionsUsers=d;f.context=a;f.parentPageId=c;return f}function w(b){var a=Confluence.storageManager("confluence-create-content-plugin"),c=l.parseJSON(a.getItem("used"));null==c&&(c=[]);-1==l.inArray(b,c)&&c.push(b);a.setItemQuietly("used",JSON.stringify(c))}function x(b){var a=t("confluence/api/url");b=a.parse(b);var c=b.queryParams;b.queryParams=Object.keys(c).reduce(function(a,b){var d=c[b].filter(function(a){return!!a});d.length&&(a[b]=d);return a},{});return a.format(b)}var r=
{},p,k,m={},q={};Confluence.Blueprint=AJS.$.extend(Confluence.Blueprint,{register:function(b,a){r[b]=a},validateTitle:function(b,a,c,d){var g=l.trim(b.val()),e;c||(c=AJS.I18n.getText("create.content.plugin.create-dialog.page.title.emtpy"));d||(d=AJS.I18n.getText("create.content.plugin.create-dialog.page.title.conflict"));g?Confluence.Blueprint.canCreatePage(a,g)||(e=d):e=c;return e?(b.focus().siblings(".error").html(e),!1):!0},canCreatePage:function(b,a){var c=!1;l.ajax({url:Confluence.getContextPath()+
"/rest/create-dialog/1.0/blueprints/can-create-page",dataType:"json",data:{spaceKey:b,pageTitle:a},async:!1,success:function(a){c=a},error:function(a){AJS.error("Failed to call 'can-create-page' - "+a.responseText)}});return c},hasWizard:function(b,a){return(q[b]||a&&a.wizard)&&!m[b]},setWizard:function(b,a){var c=l({});a(c);q[b]=c},getWizard:function(b){return q[b]||l({})},setDirectCallback:function(b,a){m[b]=a},getDirectCallback:function(b){return m[b]},fireWizard:function(b,a,c){var d=c.initContext||
{};k=a.spaceKey;p=a;var g=a.itemModuleCompleteKey,e=c.getParentPageId();w(g);if(g){var f=g.replace(/\.|:/g,"_");AJS.trigger("analytics",{name:c.id+".submit."+f,data:{spaceKey:k}});if(a.directLink){e={templateId:a.templateId,spaceKey:k,title:a.title||"",newSpaceKey:k,fromPageId:e&&k===AJS.Meta.get("space-key")?e:""};l.extend(e,d);f=a.directLink;for(var h in e)f=f.replace(new RegExp("{"+h.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")+"}","g"),e[h]);window.location=Confluence.getContextPath()+x(f)}else{var m=
this.getDirectCallback(g);if(m)h=function(){var a={spaceKey:k,pageData:{},initContext:d};m(b,a);var e=l.extend(d,{pageData:a.pageData});(new Confluence.DialogWizard(c,n)).doFinalAction(b,a,e,n)};else if(a.wizard){var q=a.wizard.pages[0].id;h=function(){var b=Confluence.Blueprint.getWizard(g);Confluence.DialogWizard(c,n).newPage(a,q,{},l.extend(d,{spaceKey:k,pages:{},parentPageId:c.getParentPageId(),title:a.title}),b)}}else if(r[g])h=function(){r[g](c,k,n)};else if(a.contentBlueprintId)h=function(){n(null,
l.extend(d,a),c)};else throw Error("No way to process item: "+g);a.howToUseTemplate?Confluence.Blueprint.HowToUse.check(c,a,h):h()}}else if(a.templateId){AJS.trigger("analytics",{name:c.id+".submit.template",data:{spaceKey:k,templateId:a.templateId}});h=Confluence.getContextPath()+"/pages/createpage-entervariables.action?templateId\x3d"+encodeURIComponent(a.templateId)+"\x26spaceKey\x3d"+encodeURIComponent(k)+"\x26title\x3d"+encodeURIComponent(a.title||"")+"\x26newSpaceKey\x3d"+encodeURIComponent(k);
for(f in d)h+="\x26"+encodeURIComponent(f)+"\x3d"+encodeURIComponent(d[f]);e&&k==AJS.Meta.get("space-key")&&(h+="\x26fromPageId\x3d"+encodeURIComponent(e));window.location=h}else throw Error("Unknown item: "+a);}});Confluence.Blueprint.Util={};Confluence.Blueprint.Util.getParentPageLocation=function(){var b={};AJS.Meta.get("page-title")?(b.parentPageId=AJS.Meta.get("page-id"),b.parentPageTitle=AJS.Meta.get("page-title")):(b.parentPageId=AJS.Meta.get("parent-page-id"),b.parentPageTitle=AJS.Meta.get("from-page-title"));
return b}})(AJS.$,require);