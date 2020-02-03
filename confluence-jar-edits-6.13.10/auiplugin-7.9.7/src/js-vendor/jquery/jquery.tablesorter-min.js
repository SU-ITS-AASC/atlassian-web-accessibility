("undefined"===typeof window?global:window).__bcb3bf48343222097ceddcaac01ec182=function(){var h=jQuery;h.extend({tablesorter:new function(){function e(){var a=arguments[0],b=1<arguments.length?Array.prototype.slice.call(arguments):a;if("undefined"!==typeof console&&"undefined"!==typeof console.log)console[/error/i.test(a)?"error":/warn/i.test(a)?"warn":"log"](b);else alert(b)}function o(a,b){e(a+" ("+((new Date).getTime()-b.getTime())+"ms)")}function p(a){for(var b in a)return!1;return!0}function m(a,
b,c){if(!b)return"";var g,d=a.config,j=d.textExtraction||"",e="",e="basic"===j?h(b).attr(d.textAttribute)||b.textContent||b.innerText||h(b).text()||"":"function"===typeof j?j(b,a,c):"function"===typeof(g=f.getColumnData(a,j,c))?g(b,a,c):b.textContent||b.innerText||h(b).text()||"";return h.trim(e)}function t(a){var b,c,g=a.config,d=g.$tbodies=g.$table.children("tbody:not(."+g.cssInfoBlock+")"),j,u,i,l,k,h,r,n,q,p=0,B="",t=d.length;if(0===t)return g.debug?e("Warning: *Empty table!* Not building a parser cache"):
"";g.debug&&(q=new Date,e("Detecting parsers for each column"));b=[];for(c=[];p<t;){j=d[p].rows;if(j[p]){u=g.columns;for(i=0;i<u;i++){l=g.$headers.filter('[data-column="'+i+'"]:last');k=f.getColumnData(a,g.headers,i);n=f.getParserById(f.getData(l,k,"extractor"));r=f.getParserById(f.getData(l,k,"sorter"));h="false"===f.getData(l,k,"parser");g.empties[i]=f.getData(l,k,"empty")||g.emptyTo||(g.emptyToBottom?"bottom":"top");g.strings[i]=f.getData(l,k,"string")||g.stringTo||"max";h&&(r=f.getParserById("no-parser"));
n||(n=!1);if(!r)a:{l=a;k=j;h=-1;r=i;for(var s=void 0,F=f.parsers.length,C=!1,w="",s=!0;""===w&&s;)h++,k[h]?(C=k[h].cells[r],w=m(l,C,r),l.config.debug&&e("Checking if value was empty on row "+h+", column: "+r+': "'+w+'"')):s=!1;for(;0<=--F;)if((s=f.parsers[F])&&"text"!==s.id&&s.is&&s.is(w,l,C)){r=s;break a}r=f.getParserById("text")}g.debug&&(B+="column:"+i+"; extractor:"+n.id+"; parser:"+r.id+"; string:"+g.strings[i]+"; empty: "+g.empties[i]+"\n");c[i]=r;b[i]=n}}p+=c.length?t:1}g.debug&&(e(B?B:"No parsers detected"),
o("Completed detecting parsers",q));g.parsers=c;g.extractors=b}function s(a){var b,c,g,d,j,u,i,l,k,p,r,n=a.config,q=n.$table.children("tbody"),t=n.extractors,s=n.parsers;n.cache={};n.totalRows=0;if(!s)return n.debug?e("Warning: *Empty table!* Not building a cache"):"";n.debug&&(l=new Date);n.showProcessing&&f.isProcessing(a,!0);for(j=0;j<q.length;j++)if(r=[],b=n.cache[j]={normalized:[]},!q.eq(j).hasClass(n.cssInfoBlock)){k=q[j]&&q[j].rows.length||0;for(g=0;g<k;++g)if(p={child:[]},u=h(q[j].rows[g]),
i=[],u.hasClass(n.cssChildRow)&&0!==g)c=b.normalized.length-1,b.normalized[c][n.columns].$row=b.normalized[c][n.columns].$row.add(u),u.prev().hasClass(n.cssChildRow)||u.prev().addClass(f.css.cssHasChild),p.child[c]=h.trim(u[0].textContent||u[0].innerText||u.text()||"");else{p.$row=u;p.order=g;for(d=0;d<n.columns;++d)if("undefined"===typeof s[d])n.debug&&e("No parser found for cell:",u[0].cells[d],"does it have a header?");else if(c=m(a,u[0].cells[d],d),c="undefined"===typeof t[d].id?c:t[d].format(c,
a,u[0].cells[d],d),c="no-parser"===s[d].id?"":s[d].format(c,a,u[0].cells[d],d),i.push(n.ignoreCase&&"string"===typeof c?c.toLowerCase():c),"numeric"===(s[d].type||"").toLowerCase())r[d]=Math.max(Math.abs(c)||0,r[d]||0);i[n.columns]=p;b.normalized.push(i)}b.colMax=r;n.totalRows+=b.normalized.length}n.showProcessing&&f.isProcessing(a);n.debug&&o("Building cache for "+k+" rows",l)}function w(a,b){var c=a.config,g=c.widgetOptions,d=a.tBodies,j=[],e=c.cache,i,l,k,m,r,n;if(p(e))return c.appender?c.appender(a,
j):a.isUpdating?c.$table.trigger("updateComplete",a):"";c.debug&&(n=new Date);for(r=0;r<d.length;r++)if(i=h(d[r]),i.length&&!i.hasClass(c.cssInfoBlock)){k=f.processTbody(a,i,!0);i=e[r].normalized;l=i.length;for(m=0;m<l;m++)j.push(i[m][c.columns].$row),(!c.appender||c.pager&&(!c.pager.removeRows||!g.pager_removeRows)&&!c.pager.ajax)&&k.append(i[m][c.columns].$row);f.processTbody(a,k,!1)}c.appender&&c.appender(a,j);c.debug&&o("Rebuilt table",n);!b&&!c.appender&&f.applyWidget(a);a.isUpdating&&c.$table.trigger("updateComplete",
a)}function z(a){var b,c,g,d,j,u,i,l=a.config;l.headerList=[];l.headerContent=[];l.debug&&(i=new Date);l.columns=f.computeColumnIndex(l.$table.children("thead, tfoot").children("tr"));d=l.cssIcon?'<i class="'+(l.cssIcon===f.css.icon?f.css.icon:l.cssIcon+" "+f.css.icon)+'"></i>':"";l.$headers=h(a).find(l.selectorHeaders).each(function(i){c=h(this);b=f.getColumnData(a,l.headers,i,!0);l.headerContent[i]=h(this).html();j=l.headerTemplate.replace(/\{content\}/g,h(this).html()).replace(/\{icon\}/g,d);l.onRenderTemplate&&
(g=l.onRenderTemplate.apply(c,[i,j]))&&"string"===typeof g&&(j=g);h(this).html('<div class="'+f.css.headerIn+'">'+j+"</div>");l.onRenderHeader&&l.onRenderHeader.apply(c,[i]);this.column=parseInt(h(this).attr("data-column"),10);var e=f.getData(c,b,"sortInitialOrder")||l.sortInitialOrder;this.order=/^d/i.test(e)||1===e?[1,0,2]:[0,1,2];this.count=-1;this.lockedOrder=!1;u=f.getData(c,b,"lockedOrder")||!1;"undefined"!==typeof u&&!1!==u&&(this.order=this.lockedOrder=/^d/i.test(u)||1===u?[1,1,1]:[0,0,0]);
c.addClass(f.css.header+" "+l.cssHeader);l.headerList[i]=this;c.parent().addClass(f.css.headerRow+" "+l.cssHeaderRow).attr("role","row");l.tabIndex&&c.attr("tabindex",0)}).attr({scope:"col",role:"columnheader"});A(a);l.debug&&(o("Built headers:",i),e(l.$headers))}function y(a,b,c){var g=a.config;g.$table.find(g.selectorRemove).remove();t(a);s(a);D(g.$table,b,c)}function A(a){var b,c,g,d=a.config;d.$headers.each(function(j,e){c=h(e);g=f.getColumnData(a,d.headers,j,!0);b="false"===f.getData(e,g,"sorter")||
"false"===f.getData(e,g,"parser");e.sortDisabled=b;c[b?"addClass":"removeClass"]("sorter-false").attr("aria-disabled",""+b);a.id&&(b?c.removeAttr("aria-controls"):c.attr("aria-controls",a.id))})}function x(a){var b,c,g=a.config,d=g.sortList,j=d.length,e=f.css.sortNone+" "+g.cssNone,i=[f.css.sortAsc+" "+g.cssAsc,f.css.sortDesc+" "+g.cssDesc],l=["ascending","descending"],k=h(a).find("tfoot tr").children().add(g.$extraHeaders).removeClass(i.join(" "));g.$headers.removeClass(i.join(" ")).addClass(e).attr("aria-sort",
"none");for(b=0;b<j;b++)if(2!==d[b][1]&&(a=g.$headers.not(".sorter-false").filter('[data-column="'+d[b][0]+'"]'+(1===j?":last":"")),a.length)){for(c=0;c<a.length;c++)a[c].sortDisabled||a.eq(c).removeClass(e).addClass(i[d[b][1]]).attr("aria-sort",l[d[b][1]]);k.length&&k.filter('[data-column="'+d[b][0]+'"]').removeClass(e).addClass(i[d[b][1]])}g.$headers.not(".sorter-false").each(function(){var a=h(this),b=this.order[(this.count+1)%(g.sortReset?3:2)],b=a.text()+": "+f.language[a.hasClass(f.css.sortAsc)?
"sortAsc":a.hasClass(f.css.sortDesc)?"sortDesc":"sortNone"]+f.language[0===b?"nextAsc":1===b?"nextDesc":"nextNone"];a.attr("aria-label",b)})}function G(a,b,c){if(a.isUpdating)return setTimeout(function(){G(a,b,c)},50);var g,d,j,e,i=a.config,l=!c[i.sortMultiSortKey],k=i.$table;k.trigger("sortStart",a);b.count=c[i.sortResetKey]?2:(b.count+1)%(i.sortReset?3:2);i.sortRestart&&(d=b,i.$headers.each(function(){if(this!==d&&(l||!h(this).is("."+f.css.sortDesc+",."+f.css.sortAsc)))this.count=-1}));d=b.column;
if(l){i.sortList=[];if(null!==i.sortForce){g=i.sortForce;for(j=0;j<g.length;j++)g[j][0]!==d&&i.sortList.push(g[j])}g=b.order[b.count];if(2>g&&(i.sortList.push([d,g]),1<b.colSpan))for(j=1;j<b.colSpan;j++)i.sortList.push([d+j,g])}else{if(i.sortAppend&&1<i.sortList.length)for(j=0;j<i.sortAppend.length;j++)e=f.isValueInArray(i.sortAppend[j][0],i.sortList),0<=e&&i.sortList.splice(e,1);if(0<=f.isValueInArray(d,i.sortList))for(j=0;j<i.sortList.length;j++)e=i.sortList[j],g=i.$headers.filter('[data-column="'+
e[0]+'"]:last')[0],e[0]===d&&(e[1]=g.order[b.count],2===e[1]&&(i.sortList.splice(j,1),g.count=-1));else if(g=b.order[b.count],2>g&&(i.sortList.push([d,g]),1<b.colSpan))for(j=1;j<b.colSpan;j++)i.sortList.push([d+j,g])}if(null!==i.sortAppend){g=i.sortAppend;for(j=0;j<g.length;j++)g[j][0]!==d&&i.sortList.push(g[j])}k.trigger("sortBegin",a);setTimeout(function(){x(a);E(a);w(a);k.trigger("sortEnd",a)},1)}function E(a){var b,c,g,d,j,e,i,h,k,m,r,n=0,q=a.config,s=q.textSorter||"",t=q.sortList,v=t.length,
w=a.tBodies.length;if(!q.serverSideSorting&&!p(q.cache)){q.debug&&(j=new Date);for(c=0;c<w;c++)e=q.cache[c].colMax,i=q.cache[c].normalized,i.sort(function(c,j){for(b=0;b<v;b++){d=t[b][0];h=t[b][1];n=0===h;if(q.sortStable&&c[d]===j[d]&&1===v)break;(g=/n/i.test(q.parsers&&q.parsers[d]?q.parsers[d].type||"":""))&&q.strings[d]?(g="boolean"===typeof q.string[q.strings[d]]?(n?1:-1)*(q.string[q.strings[d]]?-1:1):q.strings[d]?q.string[q.strings[d]]||0:0,k=q.numberSorter?q.numberSorter(c[d],j[d],n,e[d],a):
f["sortNumeric"+(n?"Asc":"Desc")](c[d],j[d],g,e[d],d,a)):(m=n?c:j,r=n?j:c,k="function"===typeof s?s(m[d],r[d],n,d,a):"object"===typeof s&&s.hasOwnProperty(d)?s[d](m[d],r[d],n,d,a):f["sortNatural"+(n?"Asc":"Desc")](c[d],j[d],d,a,q));if(k)return k}return c[q.columns].order-j[q.columns].order});q.debug&&o("Sorting on "+t.toString()+" and dir "+h+" time",j)}}function H(a,b){a[0].isUpdating&&a.trigger("updateComplete");h.isFunction(b)&&b(a[0])}function D(a,b,c){var g=a[0].config.sortList;!1!==b&&!a[0].isProcessing&&
g.length?a.trigger("sorton",[g,function(){H(a,c)},!0]):(H(a,c),f.applyWidget(a[0],!1))}function I(a){var b=a.config,c=b.$table;c.unbind("sortReset update updateRows updateCell updateAll addRows updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave".split(" ").join(b.namespace+" ")).bind("sortReset"+b.namespace,function(g,d){g.stopPropagation();b.sortList=[];x(a);E(a);w(a);h.isFunction(d)&&d(a)}).bind("updateAll"+b.namespace,function(g,d,
c){g.stopPropagation();a.isUpdating=!0;f.refreshWidgets(a,!0,!0);f.restoreHeaders(a);z(a);f.bindEvents(a,b.$headers,!0);I(a);y(a,d,c)}).bind("update"+b.namespace+" updateRows"+b.namespace,function(b,d,c){b.stopPropagation();a.isUpdating=!0;A(a);y(a,d,c)}).bind("updateCell"+b.namespace,function(g,d,j,f){g.stopPropagation();a.isUpdating=!0;c.find(b.selectorRemove).remove();var e,l,k;l=c.find("tbody");k=h(d);g=l.index(h.fn.closest?k.closest("tbody"):k.parents("tbody").filter(":first"));e=h.fn.closest?
k.closest("tr"):k.parents("tr").filter(":first");d=k[0];if(l.length&&0<=g){l=l.eq(g).find("tr").index(e);k=k.index();b.cache[g].normalized[l][b.columns].$row=e;e="undefined"===typeof b.extractors[k].id?m(a,d,k):b.extractors[k].format(m(a,d,k),a,d,k);d="no-parser"===b.parsers[k].id?"":b.parsers[k].format(e,a,d,k);b.cache[g].normalized[l][k]=b.ignoreCase&&"string"===typeof d?d.toLowerCase():d;if("numeric"===(b.parsers[k].type||"").toLowerCase())b.cache[g].colMax[k]=Math.max(Math.abs(d)||0,b.cache[g].colMax[k]||
0);D(c,j,f)}}).bind("addRows"+b.namespace,function(g,d,j,e){g.stopPropagation();a.isUpdating=!0;if(p(b.cache))A(a),y(a,j,e);else{var d=h(d).attr("role","row"),f,l,k,o,r,n=d.filter("tr").length,q=c.find("tbody").index(d.parents("tbody").filter(":first"));(!b.parsers||!b.parsers.length)&&t(a);for(g=0;g<n;g++){l=d[g].cells.length;r=[];o={child:[],$row:d.eq(g),order:b.cache[q].normalized.length};for(f=0;f<l;f++)if(k="undefined"===typeof b.extractors[f].id?m(a,d[g].cells[f],f):b.extractors[f].format(m(a,
d[g].cells[f],f),a,d[g].cells[f],f),k="no-parser"===b.parsers[f].id?"":b.parsers[f].format(k,a,d[g].cells[f],f),r[f]=b.ignoreCase&&"string"===typeof k?k.toLowerCase():k,"numeric"===(b.parsers[f].type||"").toLowerCase())b.cache[q].colMax[f]=Math.max(Math.abs(r[f])||0,b.cache[q].colMax[f]||0);r.push(o);b.cache[q].normalized.push(r)}D(c,j,e)}}).bind("updateComplete"+b.namespace,function(){a.isUpdating=!1}).bind("sorton"+b.namespace,function(b,d,j,e){var i=a.config;b.stopPropagation();c.trigger("sortStart",
this);var l,k,o,m,n,q=a.config,b=d||q.sortList;q.sortList=[];h.each(b,function(a,b){m=parseInt(b[0],10);if(o=q.$headers.filter('[data-column="'+m+'"]:last')[0]){k=(k=(""+b[1]).match(/^(1|d|s|o|n)/))?k[0]:"";switch(k){case "1":case "d":k=1;break;case "s":k=n||0;break;case "o":l=o.order[(n||0)%(q.sortReset?3:2)];k=0===l?1:1===l?0:2;break;case "n":o.count+=1;k=o.order[o.count%(q.sortReset?3:2)];break;default:k=0}n=0===a?k:n;l=[m,parseInt(k,10)||0];q.sortList.push(l);k=h.inArray(l[1],o.order);o.count=
0<=k?k:l[1]%(q.sortReset?3:2)}});x(a);i.delayInit&&p(i.cache)&&s(a);c.trigger("sortBegin",this);E(a);w(a,e);c.trigger("sortEnd",this);f.applyWidget(a);h.isFunction(j)&&j(a)}).bind("appendCache"+b.namespace,function(b,d,c){b.stopPropagation();w(a,c);h.isFunction(d)&&d(a)}).bind("updateCache"+b.namespace,function(c,d){(!b.parsers||!b.parsers.length)&&t(a);s(a);h.isFunction(d)&&d(a)}).bind("applyWidgetId"+b.namespace,function(c,d){c.stopPropagation();f.getWidgetById(d).format(a,b,b.widgetOptions)}).bind("applyWidgets"+
b.namespace,function(b,d){b.stopPropagation();f.applyWidget(a,d)}).bind("refreshWidgets"+b.namespace,function(b,d,c){b.stopPropagation();f.refreshWidgets(a,d,c)}).bind("destroy"+b.namespace,function(b,d,c){b.stopPropagation();f.destroy(a,d,c)}).bind("resetToLoadState"+b.namespace,function(){f.refreshWidgets(a,!0,!0);b=h.extend(!0,f.defaults,b.originalSettings);a.hasInitialized=!1;f.setup(a,b)})}var f=this;f.version="2.17.7";f.parsers=[];f.widgets=[];f.defaults={theme:"default",widthFixed:!1,showProcessing:!1,
headerTemplate:"{content}",onRenderTemplate:null,onRenderHeader:null,cancelSelection:!0,tabIndex:!0,dateFormat:"mmddyyyy",sortMultiSortKey:"shiftKey",sortResetKey:"ctrlKey",usNumberFormat:!0,delayInit:!1,serverSideSorting:!1,headers:{},ignoreCase:!0,sortForce:null,sortList:[],sortAppend:null,sortStable:!1,sortInitialOrder:"asc",sortLocaleCompare:!1,sortReset:!1,sortRestart:!1,emptyTo:"bottom",stringTo:"max",textExtraction:"basic",textAttribute:"data-text",textSorter:null,numberSorter:null,widgets:[],
widgetOptions:{zebra:["even","odd"]},initWidgets:!0,initialized:null,tableClass:"",cssAsc:"",cssDesc:"",cssNone:"",cssHeader:"",cssHeaderRow:"",cssProcessing:"",cssChildRow:"tablesorter-childRow",cssIcon:"tablesorter-icon",cssInfoBlock:"tablesorter-infoOnly",selectorHeaders:"> thead th, > thead td",selectorSort:"th, td",selectorRemove:".remove-me",debug:!1,headerList:[],empties:{},strings:{},parsers:[]};f.css={table:"tablesorter",cssHasChild:"tablesorter-hasChildRow",childRow:"tablesorter-childRow",
header:"tablesorter-header",headerRow:"tablesorter-headerRow",headerIn:"tablesorter-header-inner",icon:"tablesorter-icon",info:"tablesorter-infoOnly",processing:"tablesorter-processing",sortAsc:"tablesorter-headerAsc",sortDesc:"tablesorter-headerDesc",sortNone:"tablesorter-headerUnSorted"};f.language={sortAsc:"Ascending sort applied, ",sortDesc:"Descending sort applied, ",sortNone:"No sort applied, ",nextAsc:"activate to apply an ascending sort",nextDesc:"activate to apply a descending sort",nextNone:"activate to remove the sort"};
f.log=e;f.benchmark=o;f.construct=function(a){return this.each(function(){var b=h.extend(!0,{},f.defaults,a);b.originalSettings=a;!this.hasInitialized&&f.buildTable&&"TABLE"!==this.tagName?f.buildTable(this,b):f.setup(this,b)})};f.setup=function(a,b){if(!a||!a.tHead||0===a.tBodies.length||!0===a.hasInitialized)return b.debug?e("ERROR: stopping initialization! No table, thead, tbody or tablesorter has already been initialized"):"";var c="",g=h(a),d=h.metadata;a.hasInitialized=!1;a.isProcessing=!0;
a.config=b;h.data(a,"tablesorter",b);b.debug&&h.data(a,"startoveralltimer",new Date);var j;j=h.fn.jquery.split(".");j[0]=parseInt(j[0],10);j=1<j[0]||1===j[0]&&4<=parseInt(j[1],10);b.supportsDataObject=j;b.string={max:1,min:-1,emptyMin:1,emptyMax:-1,zero:0,none:0,"null":0,top:!0,bottom:!1};/tablesorter\-/.test(g.attr("class"))||(c=""!==b.theme?" tablesorter-"+b.theme:"");b.table=a;b.$table=g.addClass(f.css.table+" "+b.tableClass+c).attr("role","grid");b.$headers=g.find(b.selectorHeaders);b.namespace=
b.namespace?"."+b.namespace.replace(/\W/g,""):".tablesorter"+Math.random().toString(16).slice(2);b.$table.children().children("tr").attr("role","row");b.$tbodies=g.children("tbody:not(."+b.cssInfoBlock+")").attr({"aria-live":"polite","aria-relevant":"all"});b.$table.find("caption").length&&b.$table.attr("aria-labelledby","theCaption");b.widgetInit={};b.textExtraction=b.$table.attr("data-text-extraction")||b.textExtraction||"basic";z(a);if(a.config.widthFixed&&0===h(a).find("colgroup").length){var u=
h("<colgroup>"),i=h(a).width();h(a.tBodies[0]).find("tr:first").children(":visible").each(function(){u.append(h("<col>").css("width",parseInt(1E3*(h(this).width()/i),10)/10+"%"))});h(a).prepend(u)}t(a);b.totalRows=0;b.delayInit||s(a);f.bindEvents(a,b.$headers,!0);I(a);b.supportsDataObject&&"undefined"!==typeof g.data().sortlist?b.sortList=g.data().sortlist:d&&(g.metadata()&&g.metadata().sortlist)&&(b.sortList=g.metadata().sortlist);f.applyWidget(a,!0);0<b.sortList.length?g.trigger("sorton",[b.sortList,
{},!b.initWidgets,!0]):(x(a),b.initWidgets&&f.applyWidget(a,!1));b.showProcessing&&g.unbind("sortBegin"+b.namespace+" sortEnd"+b.namespace).bind("sortBegin"+b.namespace+" sortEnd"+b.namespace,function(d){clearTimeout(b.processTimer);f.isProcessing(a);if(d.type==="sortBegin")b.processTimer=setTimeout(function(){f.isProcessing(a,true)},500)});a.hasInitialized=!0;a.isProcessing=!1;b.debug&&f.benchmark("Overall initialization time",h.data(a,"startoveralltimer"));g.trigger("tablesorter-initialized",a);
"function"===typeof b.initialized&&b.initialized(a)};f.getColumnData=function(a,b,c,g){if(!("undefined"===typeof b||null===b)){var a=h(a)[0],d,f=a.config;if(b[c])return g?b[c]:b[f.$headers.index(f.$headers.filter('[data-column="'+c+'"]:last'))];for(d in b)if("string"===typeof d&&(a=g?f.$headers.eq(c).filter(d):f.$headers.filter('[data-column="'+c+'"]:last').filter(d),a.length))return b[d]}};f.computeColumnIndex=function(a){var b=[],c=0,g,d,f,e,i,l,k,o,m,n;for(g=0;g<a.length;g++){i=a[g].cells;for(d=
0;d<i.length;d++){f=i[d];e=h(f);l=f.parentNode.rowIndex;e.index();k=f.rowSpan||1;o=f.colSpan||1;"undefined"===typeof b[l]&&(b[l]=[]);for(f=0;f<b[l].length+1;f++)if("undefined"===typeof b[l][f]){m=f;break}c=Math.max(m,c);e.attr({"data-column":m});for(f=l;f<l+k;f++){"undefined"===typeof b[f]&&(b[f]=[]);n=b[f];for(e=m;e<m+o;e++)n[e]="x"}}}return c+1};f.isProcessing=function(a,b,c){var a=h(a),g=a[0].config,d=c||a.find("."+f.css.header);b?("undefined"!==typeof c&&0<g.sortList.length&&(d=d.filter(function(){return this.sortDisabled?
!1:0<=f.isValueInArray(parseFloat(h(this).attr("data-column")),g.sortList)})),a.add(d).addClass(f.css.processing+" "+g.cssProcessing)):a.add(d).removeClass(f.css.processing+" "+g.cssProcessing)};f.processTbody=function(a,b,c){a=h(a)[0];if(c)return a.isProcessing=!0,b.before('<span class="tablesorter-savemyplace"/>'),c=h.fn.detach?b.detach():b.remove();c=h(a).find("span.tablesorter-savemyplace");b.insertAfter(c);c.remove();a.isProcessing=!1};f.clearTableBody=function(a){h(a)[0].config.$tbodies.children().detach()};
f.bindEvents=function(a,b,c){var a=h(a)[0],g,d=a.config;!0!==c&&(d.$extraHeaders=d.$extraHeaders?d.$extraHeaders.add(b):b);b.find(d.selectorSort).add(b.filter(d.selectorSort)).unbind(["mousedown","mouseup","sort","keyup"].join(d.namespace+" ")).bind(["mousedown","mouseup","sort","keyup"].join(d.namespace+" "),function(c,f){var e;e=c.type;if(!((c.which||c.button)!==1&&!/sort|keyup/.test(e)||e==="keyup"&&c.which!==13)&&!(e==="mouseup"&&f!==true&&(new Date).getTime()-g>250)){if(e==="mousedown"){g=(new Date).getTime();
return/(input|select|button|textarea)/i.test(c.target.tagName)?"":!d.cancelSelection}d.delayInit&&p(d.cache)&&s(a);e=h.fn.closest?h(this).closest("th, td")[0]:/TH|TD/.test(this.tagName)?this:h(this).parents("th, td")[0];e=d.$headers[b.index(e)];e.sortDisabled||G(a,e,c)}});d.cancelSelection&&b.attr("unselectable","on").bind("selectstart",!1).css({"user-select":"none",MozUserSelect:"none"})};f.restoreHeaders=function(a){var b=h(a)[0].config;b.$table.find(b.selectorHeaders).each(function(a){h(this).find("."+
f.css.headerIn).length&&h(this).html(b.headerContent[a])})};f.destroy=function(a,b,c){a=h(a)[0];if(a.hasInitialized){f.refreshWidgets(a,!0,!0);var g=h(a),d=a.config,e=g.find("thead:first"),o=e.find("tr."+f.css.headerRow).removeClass(f.css.headerRow+" "+d.cssHeaderRow),i=g.find("tfoot:first > tr").children("th, td");!1===b&&0<=h.inArray("uitheme",d.widgets)&&(g.trigger("applyWidgetId",["uitheme"]),g.trigger("applyWidgetId",["zebra"]));e.find("tr").not(o).remove();g.removeData("tablesorter").unbind("sortReset update updateAll updateRows updateCell addRows updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave keypress sortBegin sortEnd resetToLoadState".split(" ").join(d.namespace+
" "));d.$headers.add(i).removeClass([f.css.header,d.cssHeader,d.cssAsc,d.cssDesc,f.css.sortAsc,f.css.sortDesc,f.css.sortNone].join(" ")).removeAttr("data-column").removeAttr("aria-label").attr("aria-disabled","true");o.find(d.selectorSort).unbind(["mousedown","mouseup","keypress"].join(d.namespace+" "));f.restoreHeaders(a);g.toggleClass(f.css.table+" "+d.tableClass+" tablesorter-"+d.theme,!1===b);a.hasInitialized=!1;delete a.config.cache;"function"===typeof c&&c(a)}};f.regex={chunk:/(^([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi,
chunks:/(^\\0|\\0$)/,hex:/^0x[0-9a-f]+$/i};f.sortNatural=function(a,b){if(a===b)return 0;var c,g,d,e,h,i;g=f.regex;if(g.hex.test(b)){c=parseInt(a.match(g.hex),16);d=parseInt(b.match(g.hex),16);if(c<d)return-1;if(c>d)return 1}c=a.replace(g.chunk,"\\0$1\\0").replace(g.chunks,"").split("\\0");g=b.replace(g.chunk,"\\0$1\\0").replace(g.chunks,"").split("\\0");i=Math.max(c.length,g.length);for(h=0;h<i;h++){d=isNaN(c[h])?c[h]||0:parseFloat(c[h])||0;e=isNaN(g[h])?g[h]||0:parseFloat(g[h])||0;if(isNaN(d)!==
isNaN(e))return isNaN(d)?1:-1;typeof d!==typeof e&&(d+="",e+="");if(d<e)return-1;if(d>e)return 1}return 0};f.sortNaturalAsc=function(a,b,c,g,d){if(a===b)return 0;c=d.string[d.empties[c]||d.emptyTo];return""===a&&0!==c?"boolean"===typeof c?c?-1:1:-c||-1:""===b&&0!==c?"boolean"===typeof c?c?1:-1:c||1:f.sortNatural(a,b)};f.sortNaturalDesc=function(a,b,c,g,d){if(a===b)return 0;c=d.string[d.empties[c]||d.emptyTo];return""===a&&0!==c?"boolean"===typeof c?c?-1:1:c||1:""===b&&0!==c?"boolean"===typeof c?c?
1:-1:-c||-1:f.sortNatural(b,a)};f.sortText=function(a,b){return a>b?1:a<b?-1:0};f.getTextValue=function(a,b,c){if(c){for(var g=a?a.length:0,d=c+b,c=0;c<g;c++)d+=a.charCodeAt(c);return b*d}return 0};f.sortNumericAsc=function(a,b,c,g,d,e){if(a===b)return 0;e=e.config;d=e.string[e.empties[d]||e.emptyTo];if(""===a&&0!==d)return"boolean"===typeof d?d?-1:1:-d||-1;if(""===b&&0!==d)return"boolean"===typeof d?d?1:-1:d||1;isNaN(a)&&(a=f.getTextValue(a,c,g));isNaN(b)&&(b=f.getTextValue(b,c,g));return a-b};f.sortNumericDesc=
function(a,b,c,g,d,e){if(a===b)return 0;e=e.config;d=e.string[e.empties[d]||e.emptyTo];if(""===a&&0!==d)return"boolean"===typeof d?d?-1:1:d||1;if(""===b&&0!==d)return"boolean"===typeof d?d?1:-1:-d||-1;isNaN(a)&&(a=f.getTextValue(a,c,g));isNaN(b)&&(b=f.getTextValue(b,c,g));return b-a};f.sortNumeric=function(a,b){return a-b};f.characterEquivalents={a:"\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5",A:"\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5",c:"\u00e7\u0107\u010d",C:"\u00c7\u0106\u010c",e:"\u00e9\u00e8\u00ea\u00eb\u011b\u0119",
E:"\u00c9\u00c8\u00ca\u00cb\u011a\u0118",i:"\u00ed\u00ec\u0130\u00ee\u00ef\u0131",I:"\u00cd\u00cc\u0130\u00ce\u00cf",o:"\u00f3\u00f2\u00f4\u00f5\u00f6",O:"\u00d3\u00d2\u00d4\u00d5\u00d6",ss:"\u00df",SS:"\u1e9e",u:"\u00fa\u00f9\u00fb\u00fc\u016f",U:"\u00da\u00d9\u00db\u00dc\u016e"};f.replaceAccents=function(a){var b,c="[",g=f.characterEquivalents;if(!f.characterRegex){f.characterRegexArray={};for(b in g)"string"===typeof b&&(c+=g[b],f.characterRegexArray[b]=RegExp("["+g[b]+"]","g"));f.characterRegex=
RegExp(c+"]")}if(f.characterRegex.test(a))for(b in g)"string"===typeof b&&(a=a.replace(f.characterRegexArray[b],b));return a};f.isValueInArray=function(a,b){var c,g=b.length;for(c=0;c<g;c++)if(b[c][0]===a)return c;return-1};f.addParser=function(a){var b,c=f.parsers.length,g=!0;for(b=0;b<c;b++)f.parsers[b].id.toLowerCase()===a.id.toLowerCase()&&(g=!1);g&&f.parsers.push(a)};f.getParserById=function(a){if("false"==a)return!1;var b,c=f.parsers.length;for(b=0;b<c;b++)if(f.parsers[b].id.toLowerCase()===
a.toString().toLowerCase())return f.parsers[b];return!1};f.addWidget=function(a){f.widgets.push(a)};f.hasWidget=function(a,b){a=h(a);return a.length&&a[0].config&&a[0].config.widgetInit[b]||!1};f.getWidgetById=function(a){var b,c,g=f.widgets.length;for(b=0;b<g;b++)if((c=f.widgets[b])&&c.hasOwnProperty("id")&&c.id.toLowerCase()===a.toLowerCase())return c};f.applyWidget=function(a,b){var a=h(a)[0],c=a.config,g=c.widgetOptions,d=[],e,m,i;if(!(!1!==b&&a.hasInitialized&&(a.isApplyingWidgets||a.isUpdating)))if(c.debug&&
(e=new Date),c.widgets.length&&(a.isApplyingWidgets=!0,c.widgets=h.grep(c.widgets,function(a,b){return h.inArray(a,c.widgets)===b}),h.each(c.widgets||[],function(a,b){if((i=f.getWidgetById(b))&&i.id)i.priority||(i.priority=10),d[a]=i}),d.sort(function(a,b){return a.priority<b.priority?-1:a.priority===b.priority?0:1}),h.each(d,function(d,e){if(e){if(b||!c.widgetInit[e.id])c.widgetInit[e.id]=!0,e.hasOwnProperty("options")&&(g=a.config.widgetOptions=h.extend(!0,{},e.options,g)),e.hasOwnProperty("init")&&
e.init(a,e,c,g);!b&&e.hasOwnProperty("format")&&e.format(a,c,g,!1)}})),setTimeout(function(){a.isApplyingWidgets=false},0),c.debug)m=c.widgets.length,o("Completed "+(!0===b?"initializing ":"applying ")+m+" widget"+(1!==m?"s":""),e)};f.refreshWidgets=function(a,b,c){var a=h(a)[0],g,d=a.config,j=d.widgets,o=f.widgets,i=o.length;for(g=0;g<i;g++)if(o[g]&&o[g].id&&(b||0>h.inArray(o[g].id,j)))d.debug&&e('Refeshing widgets: Removing "'+o[g].id+'"'),o[g].hasOwnProperty("remove")&&d.widgetInit[o[g].id]&&(o[g].remove(a,
d,d.widgetOptions),d.widgetInit[o[g].id]=!1);!0!==c&&f.applyWidget(a,b)};f.getData=function(a,b,c){var e="",a=h(a),d,f;if(!a.length)return"";d=h.metadata?a.metadata():!1;f=" "+(a.attr("class")||"");"undefined"!==typeof a.data(c)||"undefined"!==typeof a.data(c.toLowerCase())?e+=a.data(c)||a.data(c.toLowerCase()):d&&"undefined"!==typeof d[c]?e+=d[c]:b&&"undefined"!==typeof b[c]?e+=b[c]:" "!==f&&f.match(" "+c+"-")&&(e=f.match(RegExp("\\s"+c+"-([\\w-]+)"))[1]||"");return h.trim(e)};f.formatFloat=function(a,
b){if("string"!==typeof a||""===a)return a;var c,a=(b&&b.config?!1!==b.config.usNumberFormat:"undefined"!==typeof b?b:1)?a.replace(/,/g,""):a.replace(/[\s|\.]/g,"").replace(/,/g,".");/^\s*\([.\d]+\)/.test(a)&&(a=a.replace(/^\s*\(([.\d]+)\)/,"-$1"));c=parseFloat(a);return isNaN(c)?h.trim(a):c};f.isDigit=function(a){return isNaN(a)?/^[\-+(]?\d+[)]?$/.test(a.toString().replace(/[,.'"\s]/g,"")):!0}}});var m=h.tablesorter;h.fn.extend({tablesorter:m.construct});m.addParser({id:"no-parser",is:function(){return!1},
format:function(){return""},type:"text"});m.addParser({id:"text",is:function(){return!0},format:function(e,o){var p=o.config;e&&(e=h.trim(p.ignoreCase?e.toLocaleLowerCase():e),e=p.sortLocaleCompare?m.replaceAccents(e):e);return e},type:"text"});m.addParser({id:"digit",is:function(e){return m.isDigit(e)},format:function(e,o){var p=m.formatFloat((e||"").replace(/[^\w,. \-()]/g,""),o);return e&&"number"===typeof p?p:e?h.trim(e&&o.config.ignoreCase?e.toLocaleLowerCase():e):e},type:"numeric"});m.addParser({id:"currency",
is:function(e){return/^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/.test((e||"").replace(/[+\-,. ]/g,""))},format:function(e,o){var p=m.formatFloat((e||"").replace(/[^\w,. \-()]/g,""),o);return e&&"number"===typeof p?p:e?h.trim(e&&o.config.ignoreCase?e.toLocaleLowerCase():e):e},type:"numeric"});m.addParser({id:"ipAddress",is:function(e){return/^\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}$/.test(e)},format:function(e,h){var p,v=e?e.split("."):"",t="",s=v.length;
for(p=0;p<s;p++)t+=("00"+v[p]).slice(-3);return e?m.formatFloat(t,h):e},type:"numeric"});m.addParser({id:"url",is:function(e){return/^(https?|ftp|file):\/\//.test(e)},format:function(e){return e?h.trim(e.replace(/(https?|ftp|file):\/\//,"")):e},type:"text"});m.addParser({id:"isoDate",is:function(e){return/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(e)},format:function(e,h){return e?m.formatFloat(""!==e?(new Date(e.replace(/-/g,"/"))).getTime()||e:"",h):e},type:"numeric"});m.addParser({id:"percent",is:function(e){return/(\d\s*?%|%\s*?\d)/.test(e)&&
15>e.length},format:function(e,h){return e?m.formatFloat(e.replace(/%/g,""),h):e},type:"numeric"});m.addParser({id:"usLongDate",is:function(e){return/^[A-Z]{3,10}\.?\s+\d{1,2},?\s+(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?(\s+[AP]M)?)?$/i.test(e)||/^\d{1,2}\s+[A-Z]{3,10}\s+\d{4}/i.test(e)},format:function(e,h){return e?m.formatFloat((new Date(e.replace(/(\S)([AP]M)$/i,"$1 $2"))).getTime()||e,h):e},type:"numeric"});m.addParser({id:"shortDate",is:function(e){return/(^\d{1,2}[\/\s]\d{1,2}[\/\s]\d{4})|(^\d{4}[\/\s]\d{1,2}[\/\s]\d{1,2})/.test((e||
"").replace(/\s+/g," ").replace(/[\-.,]/g,"/"))},format:function(e,h,p,v){if(e){var p=h.config,t=p.$headers.filter("[data-column="+v+"]:last"),v=t.length&&t[0].dateFormat||m.getData(t,m.getColumnData(h,p.headers,v),"dateFormat")||p.dateFormat,e=e.replace(/\s+/g," ").replace(/[\-.,]/g,"/");"mmddyyyy"===v?e=e.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/,"$3/$1/$2"):"ddmmyyyy"===v?e=e.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/,"$3/$2/$1"):"yyyymmdd"===v&&(e=e.replace(/(\d{4})[\/\s](\d{1,2})[\/\s](\d{1,2})/,
"$1/$2/$3"))}return e?m.formatFloat((new Date(e)).getTime()||e,h):e},type:"numeric"});m.addParser({id:"time",is:function(e){return/^(([0-2]?\d:[0-5]\d)|([0-1]?\d:[0-5]\d\s?([AP]M)))$/i.test(e)},format:function(e,h){return e?m.formatFloat((new Date("2000/01/01 "+e.replace(/(\S)([AP]M)$/i,"$1 $2"))).getTime()||e,h):e},type:"numeric"});m.addParser({id:"metadata",is:function(){return!1},format:function(e,m,p){e=m.config;e=!e.parserMetadataName?"sortValue":e.parserMetadataName;return h(p).metadata()[e]},
type:"numeric"});m.addWidget({id:"zebra",priority:90,format:function(e,o,p){var v,t,s,w,z,y,A=RegExp(o.cssChildRow,"i"),x=o.$tbodies;o.debug&&(z=new Date);for(e=0;e<x.length;e++)v=x.eq(e),y=v.children("tr").length,1<y&&(s=0,v=v.children("tr:visible").not(o.selectorRemove),v.each(function(){t=h(this);A.test(this.className)||s++;w=0===s%2;t.removeClass(p.zebra[w?1:0]).addClass(p.zebra[w?0:1])}));o.debug&&m.benchmark("Applying Zebra widget",z)},remove:function(e,m,p){for(var v,m=m.$tbodies,t=(p.zebra||
["even","odd"]).join(" "),p=0;p<m.length;p++)v=h.tablesorter.processTbody(e,m.eq(p),!0),v.children().removeClass(t),h.tablesorter.processTbody(e,v,!1)}});!0;return{}}.call(this);