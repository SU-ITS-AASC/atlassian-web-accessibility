define("vfm/components/view-file-macro-link-properties-panel",["jquery","ajs","tinymce","vfm/view-file-macro-utils"],function(g,b,e,a){var c="view-file";function f(h){if(h){var k=g(h);var i=k.attr("data-linked-resource-type");var j=k.attr("data-linked-resource-content-type");return b.MacroBrowser.getMacroMetadata(c)&&i==="attachment"&&!(j&&j.indexOf("image")===0)}return false}function d(h){var i=b.REST.makeUrl("attachment/"+g(h).attr("data-linked-resource-id")+".json");g.ajax({type:"GET",url:i,contentType:"application/json; charset=utf-8",dataType:"json"}).success(function(k){var n={name:k.fileName};if(b.Data.get("content-id")!==k.ownerId){n.page=k.parentTitle;n.space=k.space.key;if(k.parentContentType==="blogpost"){var l=k.createdDate.date.split("-");n.date=l[0]+"/"+l[1]+"/"+l[2].substring(0,2)+"/"}}n.height=(b.Meta.get("content-type")==="comment")?a.DEFAULT_HEIGHT_IN_COMMENT:a.DEFAULT_HEIGHT;var j={contentId:b.Meta.get("content-id")||"0",macro:{name:c,params:n}};var m=e.confluence.MacroUtils.insertMacro(j,h);m.done(function(o){g(o).click()})})}return{init:function(){b.bind("link-property-panel-buttons.created",function(j,k){var i=k.buttons;var h=k.link;if(f(h)){i.push({className:"link-property-panel-convert-to-thumbnail-button",text:b.I18n.getText("propertypanel.link.button.convert.to.thumbnail"),tooltip:b.I18n.getText("propertypanel.link.button.convert.to.thumbnail.tooltip"),click:function(){b.Confluence.PropertyPanel.destroy();d(h);b.trigger("analyticsEvent",{name:"confluence.view-file.convert.to-thumbnail-trigger"})}})}})}}});