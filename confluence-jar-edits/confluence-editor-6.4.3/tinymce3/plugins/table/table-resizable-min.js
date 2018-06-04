define("confluence-editor/tinymce3/plugins/table/table-resizable",["jquery","ajs","tinymce"],function(c,k,u){function E(b){var g=0;b.find(">tbody >tr").each(function(){var a=0;c(this).find(">th,>td").each(function(){var b=c(this);b.attr("colspan")?a+=parseInt(b.attr("colspan")):a++});a>g&&(g=a)});var a=b.find(">colgroup"),d=a.find("col"),f=d.length;if(f!==g){var h=0<a.length;h||(a=c("<colgroup>"));if(g>f)for(d=0;d<g-f;d++){var i=c("<col>");a.append(i)}else for(i=0;i<f-g;i++)d.last().remove();h||b.prepend(a);
return a}}function x(b,g,a){var d=b.find(">colgroup>col");0===d.length&&(E(b),d=b.find(">colgroup>col"));for(var f=d.length,h,i,j,l=b.find(">thead>tr,>tbody>tr,>tr"),e=0;e<l.length;e++)if(f===l.eq(e).find(">th, >td").length){h=l.eq(e);break}if(h)i=h.find(">th, >td");else{h=c("<tr>");j=c("<tfoot>");j.append(h);for(e=0;e<f;e++)h.append(c("<td>"));b.append(j);i=h.find(">td")}h=b.outerWidth()-1;for(var l=[],k=[],e=0;e<f;e++){var p=i.eq(e),q=p[0].getBoundingClientRect(),p=g?100*(q.width/h)+"%":p.outerWidth();
l[e]=p;k[e]=q}g=0;u.activeEditor&&(g=u.activeEditor.getWin().pageXOffset);for(e=0;e<f;e++)d.eq(e).attr("data-resize-pixel",k[e].width).attr("data-resize-percent",100*(k[e].width/h)).attr("data-offset-left",k[e].left+g).attr("data-offset-right",k[e].right+g).removeAttr("data-mce-style"),(!a||!(e!==a.index()||e!==a.next().index()))&&d.eq(e).css({width:l[e]});j&&j.remove();b.removeAttr("data-mce-style")}function F(b){b.find(".resize-alignment-bar").remove()}var L=function(b){var g={$doc:c(document)},
a=this,d=a.data("uuid");if(!a.data("initialized")){if(!d){var f=function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)},d=f()+f()+"-"+f()+"-"+f()+"-"+f()+"-"+f()+f()+f();a.data("uuid",d)}var b=c.extend(g,b||{}),h=b.$doc,i=b.editor,j=h.find("body"),l=!1,e,u,p,q,y,m=-1,z=!1,G,A,B,H,v=c('<div contenteditable="false" class="synchrony-exclude" id="resize-indicator">'),D=c('<div contenteditable="false" class="synchrony-exclude resize-width-holder" unselectable="on">'),I,r=!1,s=
function(){v.remove();a.removeClass("active-resizable");r=!1;A=void 0;y=q=null;j.attr("data-table-resizing",!1)},J=function(b){0<h.find("#resize-indicator").length?v=h.find("#resize-indicator"):v.appendTo(j);a.addClass("active-resizable");v.css({top:parseInt(a.offset().top),left:b,height:a.height()});r=!0},K=function(b){j.outerWidth(!0)!==j[0].scrollWidth&&(b&&C(a),j.find("#"+d+"-holder").length||(D.css("width",a.width()+parseInt(c(i.getBody()).css("margin-right"))),D.attr("id",d+"-holder"),a.after(D)))};
a.on("mousemove.table-resizable"+d,"th, td",function(b){if(!l&&!(1<c(this).parents("table.confluenceTable").length)&&(w(a)||t(a)||!k.DarkFeatures.isEnabled("confluence.table.resizable.hide-indicator-on-fluid"))){E(a);var d=c(this),o=d.offset().left,g=Math.round(v.outerWidth()/2),f=d.index(),h=d.parent().children();m=-1;var j=d.closest("tr").index();d.closest("table.confluenceTable tr").prevAll("tr").each(function(){var a=c(this),b=a.index();a.children("td, th").each(function(){if(d.offset().left>
c(this).offset().left){var a=parseInt(c(this).attr("colspan")),e=parseInt(c(this).attr("rowspan"));a&&e?b+e>j&&(f+=a):e&&b+e>j&&(f+=1)}})});z=!1;if(b.pageX-d.offset().left<d.outerWidth()/2){f-=1;if(0===f&&d.prev().hasClass("numberingColumn"))return;if(0>f){z=!0;var i=h.eq(0);i.attr("colspan")?m+=parseInt(i.attr("colspan")):m++}else for(var n=0;n<=f;n++)i=h.eq(n),i.attr("colspan")?m+=parseInt(i.attr("colspan")):m++;o=z?o+d.outerWidth()-g:o-g}else{if(0===f&&d.hasClass("numberingColumn"))return;for(n=
0;n<=f;n++)i=h.eq(n),i.attr("colspan")?m+=parseInt(i.attr("colspan")):m++;o=o+d.outerWidth()-g}e=d.closest("table").find("col").eq(m);1>=Math.abs(G-o)?r?4>=Math.abs(b.pageX-o-g)||s():4>=Math.abs(b.pageX-o-g)&&J(o):4>=Math.abs(b.pageX-o-g)?J(o):s();G=o;t(a)&&K()}});a.on("mousedown.table-resizable"+d,function(b){if(e&&r){I=t(a)?"fixed":w(a)?"relative":"fluid";l=!0;x(a);a.updateTableModeInToolbar();k.DarkFeatures.isEnabled("confluence.table.resizable.relative.keep.width")?e.next().length||a.css({width:""}):
a.css({width:""});u=b.pageX;a[0].setCapture&&a[0].setCapture();h.find("body").attr("data-table-resizing",!0);p=parseInt(e.width(),10);parseInt(e.next().width(),10);parseInt(v.css("left"));var d=a.nextAll(".confluenceTable").first(),f=a.prevAll(".confluenceTable").first();H=c.merge(f,d);b.preventDefault()}});a.on("mouseout.table-resizable"+d,function(){l||s()});h.on("keypress.table-resizable"+d,function(){r&&s()});h.on("mousemove.table-resizable"+d,function(b){if(l){k.trigger("synchrony.stop",{id:"confluence.table-resize-plugin"});
a:{var d=b.pageX-u;p||(p=e.width());e.attr("data-mce-style")&&e.removeAttr("data-mce-style");var f=!1;if(B){var g=d-B,i=a.parent().width(),i=100*(a.width()/i);w(a)&&(99.9<i&&1<g)&&(f=!0,!y&&(y=e.width()+e.next().width()));g=Math.abs(Math.abs(d)-Math.abs(B));7<=g&&(A=!1);if(A&&7>g)break a}g=p+d;29>g&&(g=29);e.width(g);if(f||q)e.next().width(y-g),!q&&(q=b.pageX);q&&q>b.pageX&&(q=null);x(a,!1,e);if(!z&&(v.css({display:"block",top:parseInt(a.offset().top),left:parseInt(e.attr("data-offset-right"))-1,
height:a.height()}),t(a))){var m=e,r={},s=!1;H.each(function(){var a=c(this);t(a)&&a.find("th, td").each(function(){if(!r[a]){var b=c(this),b=b.offset().left+b.innerWidth();0>=Math.abs(b-parseInt(m.attr("data-offset-right")))&&(s=r[a]=!0,c('<div contenteditable="false" class="resize-alignment-bar">').css({top:parseInt(a.offset().top),left:b,height:a.height()}).appendTo(h.find("body")))}})});if(!(f=s)){var f=e,n;1>=Math.abs(parseInt(f.next().attr("data-resize-pixel"))-parseInt(f.attr("data-resize-pixel")))&&
(n=!0,j.find(".resizable-align-right").remove(),c('<div contenteditable="false" class="resize-alignment-bar resizable-align-right">').css({height:a.height(),top:parseInt(a.offset().top),left:parseInt(f.next().attr("data-offset-right"))-1}).appendTo(j).clone().css({left:parseInt(f.attr("data-offset-left"))-1}).appendTo(j));1>=Math.abs(parseInt(f.prev().attr("data-resize-pixel"))-parseInt(f.attr("data-resize-pixel")))&&(n=!0,c('<div contenteditable="false" class="resize-alignment-bar">').css({height:a.height(),
top:parseInt(a.offset().top),left:parseInt(f.prev().attr("data-offset-right"))-1}).appendTo(j).clone().css({left:parseInt(f.prev().attr("data-offset-left"))-1}).appendTo(j));f=n}(n=f)&&(A=!0);!n&&F(j)}B=Math.abs(d)}b.preventDefault()}});h.on("mouseup.table-resizable"+d,function(){if(l){a[0].releaseCapture&&a[0].releaseCapture();l=!1;s();F(h);C(a);e&&e.width()!==p&&(!w(a)&&!t(a)&&a.addClass("relative-table"),k.Confluence.Analytics.publish("confluence.table.resize.from."+I,{pageId:k.Meta.get("page-id")}));
if(w(a)){var b=a.parent().width(),b=100*(a.width()/b);100<b&&(b=100);a.css({width:b+"%"}).attr("data-resize-percent",b);x(a,!0)}t(a)&&K(!0);i&&(i.undoManager.add(),k.trigger("synchrony.start",{id:"confluence.table-resize-plugin"}))}});a.data("initialized",!0);return this}},C=function(b){b.parent("body").find("#"+b.data("uuid")+"-holder").remove();return b},w=function(b){return b.hasClass("relative-table")},t=function(b){return b.hasClass("fixed-table")},M=function(b){var g={$doc:c(document)},b=c.extend(g,
b||{}),b=b.$doc,g=this.data("uuid");b.find("#resize-indicator").remove();this.off("mousemove.table-resizable"+g);this.off("mouseout.table-resizable"+g);this.off("mousedown.table-resizable"+g);b.off("keypress.table-resizable"+g);b.off("mousemove.table-resizable"+g);b.off("mouseup.table-resizable"+g);this.data("initialized",!1);return this},N=function(){C(c(this)).removeClass("relative-table fixed-table").removeAttr("style").find(">colgroup").remove();return this},O=function(){var b=c(this);C(b);x(b);
b.css("width","").removeClass("relative-table").addClass("fixed-table");return this},P=function(){var b=require("confluence-editor/i18n/translations.i18n");this.parent().closest("table.confluenceTable").length?(c("#table-mode-picker .dropdown-text").text(b.table.responsive),c("#table-mode-picker .aui-dd-parent").addClass("disabled")):(c("#table-mode-picker .aui-dd-parent").removeClass("disabled"),t(this)?c("#table-mode-picker .dropdown-text").text(b.table.fixed_width):c("#table-mode-picker .dropdown-text").text(b.table.responsive))},
Q=function(b,g,a){a.content&&(b=c("<div/>").append(a.content),b.find("table.confluenceTable.relative-table, table.confluenceTable.relative-table > colgroup > col").each(function(){var a=c(this);a.data("resize-percent")?a.css({width:a.data("resize-percent")+"%"}):a.attr("style",a.data("mce-style"))}),a.content=b.html())};return{createJQueryPlugin:function(){c.fn.tableResizable=L;c.fn.removeTableResizable=M;c.fn.toggleFluidColumnWidth=N;c.fn.toggleFixedColumnWidth=O;c.fn.updateTableModeInToolbar=P},
initTableResize:function(b,g){var a=c(g.editor.getWin().document),d=g.editor;d.onChange.add(function(){var b=d.selection.getNode(),b=c(b).parent().closest("table.confluenceTable").not("table.confluenceTable table.confluenceTable");b.is(".confluenceTable")&&b.removeTableResizable({$doc:a}).tableResizable({$doc:a,editor:d,force:!0})});k.bind("confluence.editor.on.save",function(){a.find("table.confluenceTable").each(function(){c(this).removeTableResizable({$doc:a})});a.find("#resize-indicator").remove();
a.find(".resize-width-holder").remove();c(d.getBody()).removeAttr("data-table-resizing")});a.on("mousemove","table.confluenceTable",function(){var b=c(this);b.parents("table.confluenceTable").length||b.data("initialized")||b.tableResizable({$doc:a,editor:d})});u.isWebKit&&c(document).bind("prePaste",Q);u.isIE&&c('<style type="text/css"></style>').html(".confluenceTable td, .confluenceTable th {overflow: hidden !important;}.confluenceTable .content-wrapper {overflow-x : visible !important}").appendTo(a.find("head"));
return this}}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/table/table-resizable",function(c){var k=require("ajs");k.DarkFeatures.isEnabled("confluence.table.resizable")&&(c.createJQueryPlugin(),k.bind("init.rte",c.initTableResize))});