define("confluence-space-directory/pagination",["jquery","ajs","confluence/legacy"],function(g,l,j){function q(b,j){b.empty();b.addClass("hidden");g(">:not(.list-header)",j).remove();j.addClass("hidden")}return function(b){var m=g(this);l.bind("update-list."+b.nameSpace,function(s,r){var n={},h=g("ol.aui-nav-pagination",m),k=g(".list-container",m);m.addClass("updating-container");b.preprocess&&"function"===typeof b.preprocess&&b.preprocess(k);b.getParams&&"function"===typeof b.getParams&&(n=b.getParams());
var o=g("<div></div>").addClass("list-loading");g(".loading-throbber").append(o);var p=Raphael.spinner(o[0],10,"#666");p.throbber=o;n.pageSize=b.pageSize?b.pageSize:10;n.startIndex=r.startIndex;g.ajax({type:"GET",dataType:"json",cache:!!b.cache,data:n,url:b.url}).done(function(a){q(h,k);b.insertResults(a,k);if(a.totalSize){for(var c=a.totalSize,e=b.pageSize,f=r.startIndex,d=[],a=Math.floor((f+e-1)/e),i=0;i<a;i++)d[i]=i*e;a=[];f=f+e>=c?-1:f+e;c=Math.floor((c-f+e-1)/e);if(0<f)for(i=0;i<c;i++)a[i]=i*
e+f;if(d.length||a.length){h.removeClass("hidden");e=b.pageUrl;d.length?(c=d[d.length-1],h.append(j.Templates.Pagination.previous({startIndex:c,url:e+"?startIndex="+c}))):h.append(j.Templates.Pagination.previousDisabled());c=1;f=0;for(i=d.length;f<i;f++)h.append(j.Templates.Pagination.item({startIndex:d[f],pageNumber:c,url:e+"?startIndex="+d[f]})),c++;d=c;h.append(j.Templates.Pagination.current({pageNumber:d}));d++;e=d;d=b.pageUrl;c=0;for(f=a.length;c<f;c++)h.append(j.Templates.Pagination.item({startIndex:a[c],
pageNumber:e,url:d+"?startIndex="+a[c]})),e++;a.length?(a=a[0],h.append(j.Templates.Pagination.next({startIndex:a,url:d+"?startIndex="+a}))):h.append(j.Templates.Pagination.nextDisabled());g("a",h).click(function(a){var c=parseInt(g(this).attr("data-index"),10);l.trigger("update-list."+b.nameSpace,{startIndex:c});l.trigger("analytics",{name:"confluence.space-directory.pagination.click",data:{page:c,text:g.trim(g(this).text())}});return a.preventDefault()})}}}).fail(function(a){q(h,k);b.handleError(a,
k)}).always(function(){var a=b.nameSpace;p();p.throbber.remove();k.removeClass("hidden");m.removeClass("updating-container");l.trigger("update-list-complete."+a)})})}});require("confluence/module-exporter").exportModuleAsGlobal("confluence-space-directory/pagination","$.fn.paginate");