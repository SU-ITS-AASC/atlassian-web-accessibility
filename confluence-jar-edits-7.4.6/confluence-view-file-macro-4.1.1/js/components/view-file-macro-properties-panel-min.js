define("vfm/components/view-file-macro-properties-panel",["jquery","underscore","ajs","confluence/legacy","confluence/jsUri","tinymce","vfm/view-file-macro-utils"],function(d,x,f,l,m,b,r){var t="view-file";var a="macro-placeholder-property-panel-edit-button";var y="macro-placeholder-property-panel-remove-button";var c="placeholder/unknown-attachment";var i="data-macro-parameters";var q={"view-file-size-small":"150","view-file-size-medium":"250","view-file-size-large":"400"};var h=[{className:"macro-property-panel-view-file-size-small editor-resize resize-small",text:"",tooltip:f.I18n.getText("propertypanel.view.file.macro.button.size.small.tooltip"),iconClass:"aui-icon aui-icon-small aui-iconfont-image-resize",click:j},{className:"macro-property-panel-view-file-size-medium editor-resize resize-medium",text:"",tooltip:f.I18n.getText("propertypanel.view.file.macro.button.size.medium.tooltip"),iconClass:"aui-icon aui-icon-small aui-iconfont-image-resize",click:j},{className:"macro-property-panel-view-file-size-large editor-resize resize-large",text:"",tooltip:f.I18n.getText("propertypanel.view.file.macro.button.size.large.tooltip"),iconClass:"aui-icon aui-icon-small aui-iconfont-image-resize",click:j},null,{className:"macro-property-panel-view-file-convert-to-link",text:f.I18n.getText("propertypanel.view.file.macro.button.convert.to.link"),tooltip:f.I18n.getText("propertypanel.view.file.macro.button.convert.to.link.tooltip"),click:g}];function u(E,B){var F=x.find(Object.keys(q),function(G){return q[G]===B});if(F){for(var A=0,D=E.length;A<D;A++){var z=E[A];var C=z.className.replace(" active","");if(C.indexOf("macro-property-panel-"+F)!==-1){C+=" active"}z.className=C}}}function s(A){var B=x.reject(A,function(C){return C.className.indexOf(a)>-1||C.className.indexOf(y)>-1});A.splice(0,A.length);for(var z=0;z<B.length;z++){A.push(B[z])}}function k(A,z){var B=d(A);B.attr("height",z);var C=B.attr("src");if(o(C)){B.attr("src",p(B.attr("src"),z));B.attr("data-mce-src",p(B.attr("data-mce-src"),z));if(b.isGecko){f.Rte.getEditor().execCommand("mceRepaint",false)}}v(B,z);b.activeEditor.undoManager.add()}function o(z){return(z!=null&&z.indexOf("/servlet/view-file-macro/placeholder")>=0)}function p(B,z){var A=new m(B);if(A.getQueryParamValue("height")!==""){A.replaceQueryParam("height",z)}return A.toString()}function w(C){var z=C.attr(i);var D=[];var A="";for(var B=0;B<z.length;B++){var E=z[B];if(E==="\\"){A+=E;if(B+1!==z.length){A+=z[++B]}}else{if(E==="|"){D.push(A);A=""}else{A+=E}}}D.push(A);return D}function v(C,A){var B="height="+A;var E=w(C);var D=e(C,"height");if(D){var z=x.indexOf(E,"height="+D);E[z]=B}else{E.push(B)}C.attr(i,E.join("|"))}function e(B,z){var C=w(B);var A=x.find(C,function(D){return(D.indexOf(z+"=")>=0)});return A?A.split("=")[1]:null}function j(B,z){if(d(B).attr("class").indexOf("active")!==-1){return}f.Confluence.PropertyPanel.destroy();var C=Object.keys(q);var D=d(B).attr("class");for(var A=0;A<C.length;A++){if(D.indexOf(C[A])!==-1){k(z,q[C[A]]);d(z).click();f.trigger("analyticsEvent",{name:"confluence.view-file.resize."+C[A].substring(C[A].lastIndexOf("-")+1,C[A].length)});return}}}function g(B,z){f.trigger("analyticsEvent",{name:"confluence.view-file.convert.to-link-trigger"});f.Confluence.PropertyPanel.destroy();A(z);function A(C){var E=r.getParameterByName(d(C).attr("src"),"attachmentId");var D=f.REST.makeUrl("attachment/"+E+".json");d.ajax({type:"GET",url:D,contentType:"application/json; charset=utf-8",dataType:"json"}).success(function(H){var F=l.Link.fromREST(H);var G=F.insert();b.activeEditor.undoManager.add();b.activeEditor.focus();G.click()})}}function n(){f.bind("created.property-panel",function(G,F){var H=d(F.anchor);var C=H.attr("data-macro-name");if(C!==t){return}var D=l.ViewFileMacro.Templates.Editor.viewFilePropertyPanelHeader;var E=e(H,"name");var B=r.getParameterByName(H.attr("src"),"mimeType");var A=f.Confluence.FileTypesUtils.getAUIIconFromMime(B);var z=d(D({fileName:E,fileIcon:A}));F.panel.find(".aui-property-panel").prepend(z);if(F.shouldFlip){F.tip.css({top:F.panel.outerHeight()})}})}return{init:function(){f.Confluence.PropertyPanel.Macro.registerInitHandler(function(G,D,z){s(D);var E=d(G);var B=E.attr("data-mce-src");if(B&&B.indexOf(c)>-1){return}for(var A=0,C=h.length;A<C;A++){D.push(h[A])}var F=E.attr("height");if(!F){F=(f.Meta.get("content-type")==="comment")?r.DEFAULT_HEIGHT_IN_COMMENT:r.DEFAULT_HEIGHT}u(D,F)},t);n()}}});