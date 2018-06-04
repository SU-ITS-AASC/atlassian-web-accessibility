define("confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-macros","ajs tinymce jquery confluence/legacy document confluence/macro-js-overrides underscore".split(" "),function(b,m,d,s,n,t,u){var o=[],p=[],l={},k="__PROPERTY_PANEL_SPACER",v=[{key:k}];return{name:"macro",registeredEvents:o,canHandleElement:function(a){return a.hasClass("editor-inline-macro")||a.hasClass("wysiwyg-macro")},handle:function(a){function i(){var c="macro-placeholder-property-panel-remove-button";e.length>
0&&e[e.length-1].key==k&&(c=c+" first");h.push({className:c,text:b.I18n.getText("property.panel.macro.remove"),click:function(){b.Confluence.PropertyPanel.destroy();b.Rte.getEditor().execCommand("mceConfRemoveMacro",j)}});if(g.attr("data-macro-parameters")){var a=s.MacroParameterSerializer.deserialize(g.attr("data-macro-parameters"));if("atlassian-macro-output-type"in a){c=function(c){return function(b){a["atlassian-macro-output-type"]=c;g.attr("data-macro-parameters",s.MacroParameterSerializer.serialize(a));
c=="INLINE"?d(".macro-placeholder-property-panel-display-newline-button").removeClass("selected"):d(".macro-placeholder-property-panel-display-inline-button").removeClass("selected");d(b).addClass("selected")}};h.push(null);h.push({className:"macro-placeholder-property-panel-display-newline-button",tooltip:b.I18n.getText("property.panel.macro.display.newline"),selected:a["atlassian-macro-output-type"]=="BLOCK",click:c("BLOCK")});h.push({className:"macro-placeholder-property-panel-display-inline-button",
tooltip:b.I18n.getText("property.panel.macro.display.inline"),selected:a["atlassian-macro-output-type"]=="INLINE",click:c("INLINE")})}}d.each(o,function(){(!this.macroName||this.macroName==f)&&d(n).bind(q(this.id,this.macroName),this.handler)});c=p;f&&l[f]&&(c=c.concat(l[f]));d.each(c,function(){try{this(j,h,w)}catch(c){b.debug("Property panel init handler failed for : "+f+".  Is global handler : "+(d.inArray(this,p)>-1),c)}});if(h.length>0){var c=b.Confluence.PropertyPanel.createFromButtonModel("macro",
j,h,w),x=t.getFunction(f,"propertyPanelIFrameInjector");x&&x(c)}}if(!(a.e.type!=="click"&&a.e.type!=="mouseup")){var j=a.containerEl,g=d(j),f,e=[],a=!g.hasClass("editor-inline-macro"),y=!g.hasClass("wysiwyg-unknown-macro"),h=[],w={originalHeight:a&&g.height(),anchorIframe:b.Rte.getEditorFrame()},q=function(c,a){return c+"-button-click"+(a?a+".macro":"")+".property-panel"};if(y){var r=d.Deferred();f=g.attr("data-macro-name");if(b.MacroBrowser.getMacroMetadata(f))e=b.MacroBrowser.getMacroMetadata(f).buttons;
(a=t.getFunction(f,"getControls"))?a(function(a){var b=e,a=u.filter(a,function(a){return a.type==="button"}),a=u.map(a,function(a){return{key:a.key,label:a.name.value}});e=b.concat(v).concat(a).concat(v);r.resolve()}):r.resolve();r.done(function(){var a="macro-placeholder-property-panel-edit-button";e.length>0&&e[0].key==k&&(a=a+" last");h.push({className:a,text:b.I18n.getText("property.panel.macro.edit"),click:function(){b.Confluence.PropertyPanel.destroy();m.confluence.macrobrowser.editMacro(g)}});
d.each(e,function(a,c){if(c.key!=k){var i="macro-property-panel-"+c.key;a>0&&e[a-1].key==k&&(i=i+" first");a<e.length-1&&e[a+1].key==k&&(i=i+" last");h.push({className:i,text:c.label,parameterName:c.key,click:function(){d(n).trigger(q(c.key),g);d(n).trigger(q(c.key,f),g);b.Confluence.PropertyPanel.destroy()}})}})}).then(i())}else i()}},registerButtonHandler:function(a,b,d){Array.isArray(a)||(a=[a]);a.forEach(function(a){o.push({id:a,handler:b,macroName:d})})},registerInitHandler:function(a,b){if(b){l[b]=
l[b]||[];l[b].push(a)}else p.push(a)},yieldButtonFor:function(a,b){var j;d.each(a,function(){this.parameterName&&this.parameterName==b&&(j=this)});return j}}});require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-macros","AJS.Confluence.PropertyPanel.Macro",function(b){var m=require("ajs");m.bind("init.rte",function(){m.trigger("add-handler.property-panel",b)})});