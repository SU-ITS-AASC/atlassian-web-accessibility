!function(e){void 0===e.fn.each2&&e.fn.extend({each2:function(t){for(var s=e([0]),i=-1,n=this.length;++i<n&&(s.context=s[0]=this[i])&&!1!==t.call(s[0],i,s););return this}})}(jQuery),function(e,t){"use strict";var s,i,n,o,l,a,c;window.Select2===t&&(s={TAB:9,ENTER:13,ESC:27,SPACE:32,LEFT:37,UP:38,RIGHT:39,DOWN:40,SHIFT:16,CTRL:17,ALT:18,PAGE_UP:33,PAGE_DOWN:34,HOME:36,END:35,BACKSPACE:8,DELETE:46,isArrow:function(e){switch(e=e.which?e.which:e){case s.LEFT:case s.RIGHT:case s.UP:case s.DOWN:return!0}return!1},isControl:function(e){switch(e.which){case s.SHIFT:case s.CTRL:case s.ALT:return!0}return!!e.metaKey},isFunctionKey:function(e){return(e=e.which?e.which:e)>=112&&e<=123}},c=1,l=function(){return c++},e(document).delegate("body","mousemove",function(t){e.data(document,"select2-lastpos",{x:t.pageX,y:t.pageY})}),e(document).ready(function(){e(document).delegate("body","mousedown touchend",function(s){var i,n=e(s.target).closest("div.select2-container").get(0);n?e(document).find("div.select2-container-active").each(function(){this!==n&&e(this).data("select2").blur()}):(n=e(s.target).closest("div.select2-drop").get(0),e(document).find("div.select2-drop-active").each(function(){this!==n&&e(this).data("select2").blur()})),i=(n=e(s.target)).attr("for"),"LABEL"===s.target.tagName&&i&&i.length>0&&(n=(n=e("#"+i)).data("select2"))!==t&&(n.focus(),s.preventDefault())})}),i=C(Object,{bind:function(e){var t=this;return function(){e.apply(t,arguments)}},init:function(s){var i,n,o,a,c,h,d,f,m,g,v=".select2-results";this.opts=s=this.prepareOpts(s),this.id=s.id,s.element.data("select2")!==t&&null!==s.element.data("select2")&&this.destroy(),this.enabled=!0,this.container=this.createContainer(),this.containerId="s2id_"+(s.element.attr("id")||"autogen"+l()),this.containerSelector="#"+this.containerId.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g,"\\$1"),this.container.attr("id",this.containerId),this.body=(o=function(){return s.element.closest("body")},c=!1,function(){return!1===c&&(a=o(),c=!0),a}),s.element.attr("class")!==t&&this.container.addClass(s.element.attr("class").replace(/validate\[[\S ]+] ?/,"")),this.container.css(w(s.containerCss)),this.container.addClass(w(s.containerCssClass)),this.opts.element.data("select2",this).hide().before(this.container),this.container.data("select2",this),this.dropdown=this.container.find(".select2-drop"),this.dropdown.addClass(w(s.dropdownCssClass)),this.dropdown.data("select2",this),this.results=i=this.container.find(v),this.search=n=this.container.find("input.select2-input"),n.attr("tabIndex",this.opts.element.attr("tabIndex")),this.resultsPage=0,this.context=null,this.initContainer(),this.initContainerWidth(),this.results.bind("mousemove",function(s){var i=e.data(document,"select2-lastpos");i!==t&&i.x===s.pageX&&i.y===s.pageY||e(s.target).trigger("mousemove-filtered",s)}),this.dropdown.delegate(v,"mousemove-filtered",this.bind(this.highlightUnderEvent)),h=80,d=this.results,f=u(h,function(e){d.trigger("scroll-debounced",e)}),d.bind("scroll",function(e){r(e.target,d.get())>=0&&f(e)}),this.dropdown.delegate(v,"scroll-debounced",this.bind(this.loadMoreIfNeeded)),e.fn.mousewheel&&i.mousewheel(function(e,t,s,n){var o=i.scrollTop();n>0&&o-n<=0?(i.scrollTop(0),p(e)):n<0&&i.get(0).scrollHeight-i.scrollTop()+n<=i.height()&&(i.scrollTop(i.get(0).scrollHeight-i.height()),p(e))}),g="keyup-change-value",(m=n).bind("keydown",function(){e.data(m,g)===t&&e.data(m,g,m.val())}),m.bind("keyup",function(){var s=e.data(m,g);s!==t&&m.val()!==s&&(e.removeData(m,g),m.trigger("keyup-change"))}),n.bind("keyup-change",this.bind(this.updateResults)),n.bind("focus",function(){n.addClass("select2-focused")," "===n.val()&&n.val("")}),n.bind("blur",function(){n.removeClass("select2-focused")}),this.dropdown.delegate(v,"mouseup",this.bind(function(t){e(t.target).closest(".select2-result-selectable:not(.select2-disabled)").length>0?(this.highlightUnderEvent(t),this.selectHighlighted(t)):this.focusSearch(),p(t)})),this.dropdown.bind("click mouseup mousedown",function(e){e.stopPropagation()}),e.isFunction(this.opts.initSelection)&&(this.initSelection(),this.monitorSource()),(s.element.is(":disabled")||s.element.is("[readonly='readonly']"))&&this.disable()},destroy:function(){var e=this.opts.element.data("select2");e!==t&&(e.container.remove(),e.dropdown.remove(),e.opts.element.removeData("select2").unbind(".select2").show())},prepareOpts:function(s){var i,n,o,l;if("select"===(i=s.element).get(0).tagName.toLowerCase()&&(this.select=n=s.element),n&&e.each(["id","multiple","ajax","query","createSearchChoice","initSelection","data","tags"],function(){if(this in s)throw new Error("Option '"+this+"' is not allowed for Select2 when attached to a <select> element.")}),"function"!=typeof(s=e.extend({},{populateResults:function(i,n,o){var l,a=this.opts.id,c=this;(l=function(i,n,r){var h,d,u,p,f,m,g,v,b;for(h=0,d=i.length;h<d;h+=1)u=i[h],p=a(u)!==t,f=u.children&&u.children.length>0,(m=e("<li></li>")).addClass("select2-results-dept-"+r),m.addClass("select2-result"),m.addClass(p?"select2-result-selectable":"select2-result-unselectable"),f&&m.addClass("select2-result-with-children"),m.addClass(c.opts.formatResultCssClass(u)),(g=e("<div></div>")).addClass("select2-result-label"),(b=s.formatResult(u,g,o))!==t&&g.html(c.opts.escapeMarkup(b)),m.append(g),f&&((v=e("<ul></ul>")).addClass("select2-result-sub"),l(u.children,v,r+1),m.append(v)),m.data("select2-data",u),n.append(m)})(n,i,0)}},e.fn.select2.defaults,s)).id&&(o=s.id,s.id=function(e){return e[o]}),n?(s.query=this.bind(function(s){var n,o,l,a={results:[],more:!1},c=s.term;l=function(e,t){var i;e.is("option")?s.matcher(c,e.text(),e)&&t.push({id:e.attr("value"),text:e.text(),element:e.get(),css:e.attr("class")}):e.is("optgroup")&&(i={text:e.attr("label"),children:[],element:e.get(),css:e.attr("class")},e.children().each2(function(e,t){l(t,i.children)}),i.children.length>0&&t.push(i))},n=i.children(),this.getPlaceholder()!==t&&n.length>0&&(o=n[0],""===e(o).text()&&(n=n.not(o))),n.each2(function(e,t){l(t,a.results)}),s.callback(a)}),s.id=function(e){return e.id},s.formatResultCssClass=function(e){return e.css}):"query"in s||("ajax"in s?((l=s.element.data("ajax-url"))&&l.length>0&&(s.ajax.url=l),s.query=m(s.ajax)):"data"in s?s.query=g(s.data):"tags"in s&&(s.query=v(s.tags),s.createSearchChoice=function(e){return{id:e,text:e}},s.initSelection=function(t,i){var n=[];e(d(t.val(),s.separator)).each(function(){var t=this,i=this,o=s.tags;e.isFunction(o)&&(o=o()),e(o).each(function(){if(h(this.id,t))return i=this.text,!1}),n.push({id:t,text:i})}),i(n)})),"function"!=typeof s.query)throw"query function not defined for Select2 "+s.element.attr("id");return s},monitorSource:function(){this.opts.element.bind("change.select2",this.bind(function(e){!0!==this.opts.element.data("select2-change-triggered")&&this.initSelection()}))},triggerChange:function(t){t=t||{},t=e.extend({},t,{type:"change",val:this.val()}),this.opts.element.data("select2-change-triggered",!0),this.opts.element.trigger(t),this.opts.element.data("select2-change-triggered",!1),this.opts.element.click(),this.opts.blurOnChange&&this.opts.element.blur()},enable:function(){this.enabled||(this.enabled=!0,this.container.removeClass("select2-container-disabled"))},disable:function(){this.enabled&&(this.close(),this.enabled=!1,this.container.addClass("select2-container-disabled"))},opened:function(){return this.container.hasClass("select2-dropdown-open")},positionDropdown:function(){var t,s,i,n=this.container.offset(),o=this.container.outerHeight(),l=this.container.outerWidth(),a=this.dropdown.outerHeight(),c=e(window).scrollTop()+document.documentElement.clientHeight,r=n.top+o,h=n.left,d=r+a<=c,u=n.top-a>=this.body().scrollTop(),p=this.dropdown.hasClass("select2-drop-above");"static"!==this.body().css("position")&&(r-=(t=this.body().offset()).top,h-=t.left),p?(s=!0,!u&&d&&(s=!1)):(s=!1,!d&&u&&(s=!0)),s?(r=n.top-a,this.container.addClass("select2-drop-above"),this.dropdown.addClass("select2-drop-above")):(this.container.removeClass("select2-drop-above"),this.dropdown.removeClass("select2-drop-above")),i=e.extend({top:r,left:h,width:l},w(this.opts.dropdownCss)),this.dropdown.css(i)},shouldOpen:function(){var t;return!this.opened()&&(t=e.Event("open"),this.opts.element.trigger(t),!t.isDefaultPrevented())},clearDropdownAlignmentPreference:function(){this.container.removeClass("select2-drop-above"),this.dropdown.removeClass("select2-drop-above")},open:function(){return!!this.shouldOpen()&&(window.setTimeout(this.bind(this.opening),1),!0)},opening:function(){var t=this.containerId,s=this.containerSelector,i="scroll."+t,n="resize."+t;this.container.parents().each(function(){e(this).bind(i,function(){var t=e(s);0==t.length&&e(this).unbind(i),t.select2("close")})}),e(window).bind(n,function(){var t=e(s);0==t.length&&e(window).unbind(n),t.select2("close")}),this.clearDropdownAlignmentPreference()," "===this.search.val()&&this.search.val(""),this.container.addClass("select2-dropdown-open").addClass("select2-container-active"),this.updateResults(!0),this.dropdown[0]!==this.body().children().last()[0]&&this.dropdown.detach().appendTo(this.body()),this.dropdown.show(),this.positionDropdown(),this.dropdown.addClass("select2-drop-active"),this.ensureHighlightVisible(),this.focusSearch()},close:function(){if(this.opened()){var t=this;this.container.parents().each(function(){e(this).unbind("scroll."+t.containerId)}),e(window).unbind("resize."+this.containerId),this.clearDropdownAlignmentPreference(),this.dropdown.hide(),this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active"),this.results.empty(),this.clearSearch(),this.opts.element.trigger(e.Event("close"))}},clearSearch:function(){},ensureHighlightVisible:function(){var t,s,i,n,o,l,a,c=this.results;(s=this.highlight())<0||(0!=s?(t=c.find(".select2-result-selectable"),n=(i=e(t[s])).offset().top+i.outerHeight(),s===t.length-1&&(a=c.find("li.select2-more-results")).length>0&&(n=a.offset().top+a.outerHeight()),n>(o=c.offset().top+c.outerHeight())&&c.scrollTop(c.scrollTop()+(n-o)),(l=i.offset().top-c.offset().top)<0&&c.scrollTop(c.scrollTop()+l)):c.scrollTop(0))},moveHighlight:function(t){for(var s=this.results.find(".select2-result-selectable"),i=this.highlight();i>-1&&i<s.length;){var n=e(s[i+=t]);if(n.hasClass("select2-result-selectable")&&!n.hasClass("select2-disabled")){this.highlight(i);break}}},highlight:function(t){var s=this.results.find(".select2-result-selectable").not(".select2-disabled");if(0===arguments.length)return r(s.filter(".select2-highlighted")[0],s.get());t>=s.length&&(t=s.length-1),t<0&&(t=0),s.removeClass("select2-highlighted"),e(s[t]).addClass("select2-highlighted"),this.ensureHighlightVisible()},countSelectableResults:function(){return this.results.find(".select2-result-selectable").not(".select2-disabled").length},highlightUnderEvent:function(t){var s=e(t.target).closest(".select2-result-selectable");if(s.length>0&&!s.is(".select2-highlighted")){var i=this.results.find(".select2-result-selectable");this.highlight(i.index(s))}else 0==s.length&&this.results.find(".select2-highlighted").removeClass("select2-highlighted")},loadMoreIfNeeded:function(){var e=this.results,t=e.find("li.select2-more-results"),s=this.resultsPage+1,i=this,n=this.search.val(),o=this.context;0!==t.length&&t.offset().top-e.offset().top-e.height()<=0&&(t.addClass("select2-active"),this.opts.query({term:n,page:s,context:o,matcher:this.opts.matcher,callback:this.bind(function(l){i.opened()&&(i.opts.populateResults.call(this,e,l.results,{term:n,page:s,context:o}),!0===l.more?(t.detach().appendTo(e).text(i.opts.formatLoadMore(s+1)),window.setTimeout(function(){i.loadMoreIfNeeded()},10)):t.remove(),i.positionDropdown(),i.resultsPage=s)})}))},tokenize:function(){},updateResults:function(s){var i,n,o=this.search,l=this.results,a=this.opts,c=this;function r(){l.scrollTop(0),o.removeClass("select2-active"),c.positionDropdown()}function d(e){l.html(c.opts.escapeMarkup(e)),r()}(!0===s||!1!==this.showSearchInput&&this.opened())&&(o.addClass("select2-active"),a.maximumSelectionSize>=1&&(i=this.data(),e.isArray(i)&&i.length>=a.maximumSelectionSize&&b(a.formatSelectionTooBig))?d("<li class='select2-selection-limit'>"+a.formatSelectionTooBig(a.maximumSelectionSize)+"</li>"):o.val().length<a.minimumInputLength&&b(a.formatInputTooShort)?d("<li class='select2-no-results'>"+a.formatInputTooShort(o.val(),a.minimumInputLength)+"</li>"):(d("<li class='select2-searching'>"+a.formatSearching()+"</li>"),(n=this.tokenize())!=t&&null!=n&&o.val(n),this.resultsPage=1,a.query({term:o.val(),page:this.resultsPage,context:null,matcher:a.matcher,callback:this.bind(function(i){var n;this.opened()&&(this.context=i.context===t?null:i.context,this.opts.createSearchChoice&&""!==o.val()&&(n=this.opts.createSearchChoice.call(null,o.val(),i.results))!==t&&null!==n&&c.id(n)!==t&&null!==c.id(n)&&0===e(i.results).filter(function(){return h(c.id(this),c.id(n))}).length&&i.results.unshift(n),0===i.results.length&&b(a.formatNoMatches)?d("<li class='select2-no-results'>"+a.formatNoMatches(o.val())+"</li>"):(l.empty(),c.opts.populateResults.call(this,l,i.results,{term:o.val(),page:this.resultsPage,context:null}),!0===i.more&&b(a.formatLoadMore)&&(l.append("<li class='select2-more-results'>"+c.opts.escapeMarkup(a.formatLoadMore(this.resultsPage))+"</li>"),window.setTimeout(function(){c.loadMoreIfNeeded()},10)),this.postprocessResults(i,s),r()))})})))},cancel:function(){this.close()},blur:function(){this.close(),this.container.removeClass("select2-container-active"),this.dropdown.removeClass("select2-drop-active"),this.search[0]===document.activeElement&&this.search.blur(),this.clearSearch(),this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus")},focusSearch:function(){this.search.show(),this.search.focus(),window.setTimeout(this.bind(function(){this.search.show(),this.search.focus(),this.search.val(this.search.val())}),10)},selectHighlighted:function(){var e=this.highlight(),t=this.results.find(".select2-highlighted").not(".select2-disabled"),s=t.closest(".select2-result-selectable").data("select2-data");s&&(t.addClass("select2-disabled"),this.highlight(e),this.onSelect(s))},getPlaceholder:function(){return this.opts.element.attr("placeholder")||this.opts.element.attr("data-placeholder")||this.opts.element.data("placeholder")||this.opts.placeholder},initContainerWidth:function(){var s=function(){var s,i,n,o,l;if("off"===this.opts.width)return null;if("element"===this.opts.width)return 0===this.opts.element.outerWidth()?"auto":this.opts.element.outerWidth()+"px";if("copy"===this.opts.width||"resolve"===this.opts.width){if((s=this.opts.element.attr("style"))!==t)for(o=0,l=(i=s.split(";")).length;o<l;o+=1)if(null!==(n=i[o].replace(/\s/g,"").match(/width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/))&&n.length>=1)return n[1];return"resolve"===this.opts.width?(s=this.opts.element.css("width")).indexOf("%")>0?s:0===this.opts.element.outerWidth()?"auto":this.opts.element.outerWidth()+"px":null}return e.isFunction(this.opts.width)?this.opts.width():this.opts.width}.call(this);null!==s&&this.container.attr("style","width: "+s)}}),n=C(i,{createContainer:function(){return e("<div></div>",{class:"select2-container"}).html(["    <a href='#' onclick='return false;' class='select2-choice'>","   <span></span><abbr class='select2-search-choice-close' style='display:none;'><span class='assistive'>Remove Filter</span></abbr>","   <div><b></b></div>","</a>","    <div class='select2-drop select2-offscreen'>","   <div class='select2-search'>","       <input type='text' autocomplete='off' class='select2-input'/>","   </div>","   <ul class='select2-results'>","   </ul>","</div>"].join(""))},opening:function(){this.search.show(),this.parent.opening.apply(this,arguments),this.dropdown.removeClass("select2-offscreen")},close:function(){this.opened()&&(this.parent.close.apply(this,arguments),this.dropdown.removeAttr("style").addClass("select2-offscreen").insertAfter(this.selection).show())},focus:function(){this.close(),this.selection.focus()},isFocused:function(){return this.selection[0]===document.activeElement},cancel:function(){this.parent.cancel.apply(this,arguments),this.selection.focus()},initContainer:function(){var e,t=this.container,i=this.dropdown;this.selection=e=t.find(".select2-choice"),this.search.bind("keydown",this.bind(function(e){if(this.enabled)if(e.which!==s.PAGE_UP&&e.which!==s.PAGE_DOWN)if(this.opened())switch(e.which){case s.UP:case s.DOWN:return this.moveHighlight(e.which===s.UP?-1:1),void p(e);case s.TAB:case s.ENTER:return this.selectHighlighted(),void p(e);case s.ESC:return this.cancel(e),void p(e)}else{if(e.which===s.TAB||s.isControl(e)||s.isFunctionKey(e)||e.which===s.ESC)return;if(!1===this.opts.openOnEnter&&e.which===s.ENTER)return;if(this.open(),e.which===s.ENTER)return}else p(e)})),this.search.bind("focus",this.bind(function(){this.selection.attr("tabIndex","-1")})),this.search.bind("blur",this.bind(function(){this.opened()||this.container.removeClass("select2-container-active"),window.setTimeout(this.bind(function(){this.selection.attr("tabIndex",this.opts.element.attr("tabIndex"))}),10)})),e.bind("mousedown",this.bind(function(e){!0,this.opened()?(this.close(),this.selection.focus()):this.enabled&&this.open(),!1})),i.bind("mousedown",this.bind(function(){this.search.focus()})),e.bind("focus",this.bind(function(){this.container.addClass("select2-container-active"),this.search.attr("tabIndex","-1")})),e.bind("blur",this.bind(function(){this.opened()||this.container.removeClass("select2-container-active"),window.setTimeout(this.bind(function(){this.search.attr("tabIndex",this.opts.element.attr("tabIndex"))}),10)})),e.bind("keydown",this.bind(function(e){if(this.enabled)if(e.which!==s.PAGE_UP&&e.which!==s.PAGE_DOWN){if(!(e.which===s.TAB||s.isControl(e)||s.isFunctionKey(e)||e.which===s.ESC||!1===this.opts.openOnEnter&&e.which===s.ENTER))if(e.which!=s.DELETE)if(this.open(),e.which!==s.ENTER)if(e.which<48)p(e);else{var t=String.fromCharCode(e.which).toLowerCase();e.shiftKey&&(t=t.toUpperCase()),this.search.focus(),this.search.val(t),p(e)}else p(e);else this.opts.allowClear&&this.clear()}else p(e)})),e.delegate("abbr","mousedown",this.bind(function(e){this.enabled&&(this.clear(),p(e),this.close(),this.triggerChange(),this.selection.focus())})),this.setPlaceholder(),this.search.bind("focus",this.bind(function(){this.container.addClass("select2-container-active")}))},clear:function(){this.opts.element.val(""),this.selection.find("span").empty(),this.selection.removeData("select2-data"),this.setPlaceholder()},initSelection:function(){if(""===this.opts.element.val())this.close(),this.setPlaceholder();else{var e=this;this.opts.initSelection.call(null,this.opts.element,function(s){s!==t&&null!==s&&(e.updateSelection(s),e.close(),e.setPlaceholder())})}},prepareOpts:function(){var t=this.parent.prepareOpts.apply(this,arguments);return"select"===t.element.get(0).tagName.toLowerCase()&&(t.initSelection=function(t,s){var i=t.find(":selected");e.isFunction(s)&&s({id:i.attr("value"),text:i.text()})}),t},setPlaceholder:function(){var e=this.getPlaceholder();if(""===this.opts.element.val()&&e!==t){if(this.select&&""!==this.select.find("option:first").text())return;this.selection.find("span").html(this.opts.escapeMarkup(e)),this.selection.addClass("select2-default"),this.selection.find("abbr").hide()}},postprocessResults:function(t,s){var i=0,n=this,o=!0;this.results.find(".select2-result-selectable").each2(function(e,t){if(h(n.id(t.data("select2-data")),n.opts.element.val()))return i=e,!1}),this.highlight(i),!0===s&&(o=this.showSearchInput=function t(s){var i=0;return e.each(s,function(e,s){s.children?i+=t(s.children):i++}),i}(t.results)>=this.opts.minimumResultsForSearch,this.dropdown.find(".select2-search")[o?"removeClass":"addClass"]("select2-search-hidden"),e(this.dropdown,this.container)[o?"addClass":"removeClass"]("select2-with-searchbox"))},onSelect:function(e){var t=this.opts.element.val();this.opts.element.val(this.id(e)),this.updateSelection(e),this.close(),this.selection.focus(),h(t,this.id(e))||this.triggerChange()},updateSelection:function(e){var s,i=this.selection.find("span");this.selection.data("select2-data",e),i.empty(),(s=this.opts.formatSelection(e,i))!==t&&i.append(this.opts.escapeMarkup(s)),this.selection.removeClass("select2-default"),this.opts.allowClear&&this.getPlaceholder()!==t&&this.selection.find("abbr").show()},val:function(){var e,s=null,i=this;if(0===arguments.length)return this.opts.element.val();if(e=arguments[0],this.select)this.select.val(e).find(":selected").each2(function(e,t){return s={id:t.attr("value"),text:t.text()},!1}),this.updateSelection(s),this.setPlaceholder();else{if(this.opts.initSelection===t)throw new Error("cannot call val() if initSelection() is not defined");if(!e)return void this.clear();this.opts.element.val(e),this.opts.initSelection(this.opts.element,function(e){i.opts.element.val(e?i.id(e):""),i.updateSelection(e),i.setPlaceholder()})}},clearSearch:function(){this.search.val("")},data:function(e){var s;if(0===arguments.length)return(s=this.selection.data("select2-data"))==t&&(s=null),s;e&&""!==e?(this.opts.element.val(e?this.id(e):""),this.updateSelection(e)):this.clear()}}),o=C(i,{createContainer:function(){return e("<div></div>",{class:"select2-container select2-container-multi"}).html(["    <ul class='select2-choices'>","  <li class='select2-search-field'>","    <input type='text' autocomplete='off' class='select2-input'>","  </li>","</ul>","<div class='select2-drop select2-drop-multi' style='display:none;'>","   <ul class='select2-results'>","   </ul>","</div>"].join(""))},prepareOpts:function(){var t=this.parent.prepareOpts.apply(this,arguments);return"select"===t.element.get(0).tagName.toLowerCase()&&(t.initSelection=function(t,s){var i=[];t.find(":selected").each2(function(e,t){i.push({id:t.attr("value"),text:t.text()})}),e.isFunction(s)&&s(i)}),t},initContainer:function(){var t,i=".select2-choices";this.searchContainer=this.container.find(".select2-search-field"),this.selection=t=this.container.find(i),this.search.bind("keydown",this.bind(function(e){if(this.enabled){if(e.which===s.BACKSPACE&&""===this.search.val()){this.close();var i,n=t.find(".select2-search-choice-focus");if(n.length>0)return this.unselect(n.first()),this.search.width(10),void p(e);(i=t.find(".select2-search-choice")).length>0&&i.last().addClass("select2-search-choice-focus")}else t.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");if(this.opened())switch(e.which){case s.UP:case s.DOWN:return this.moveHighlight(e.which===s.UP?-1:1),void p(e);case s.ENTER:case s.TAB:return this.selectHighlighted(),void p(e);case s.ESC:return this.cancel(e),void p(e)}e.which===s.TAB||s.isControl(e)||s.isFunctionKey(e)||e.which===s.BACKSPACE||e.which===s.ESC||!1===this.opts.openOnEnter&&e.which===s.ENTER||(this.open(),e.which!==s.PAGE_UP&&e.which!==s.PAGE_DOWN||p(e))}})),this.search.bind("keyup",this.bind(this.resizeSearch)),this.search.bind("blur",this.bind(function(e){this.container.removeClass("select2-container-active"),this.search.removeClass("select2-focused"),this.clearSearch(),e.stopImmediatePropagation()})),this.container.delegate(i,"mousedown",this.bind(function(t){this.enabled&&(e(t.target).closest(".select2-search-choice").length>0||(this.clearPlaceholder(),this.open(),this.focusSearch(),t.preventDefault()))})),this.container.delegate(i,"focus",this.bind(function(){this.enabled&&(this.container.addClass("select2-container-active"),this.dropdown.addClass("select2-drop-active"),this.clearPlaceholder())})),this.clearSearch()},enable:function(){this.enabled||(this.parent.enable.apply(this,arguments),this.search.removeAttr("disabled"))},disable:function(){this.enabled&&(this.parent.disable.apply(this,arguments),this.search.attr("disabled",!0))},initSelection:function(){if(""===this.opts.element.val()&&(this.updateSelection([]),this.close(),this.clearSearch()),this.select||""!==this.opts.element.val()){var e=this;this.opts.initSelection.call(null,this.opts.element,function(s){s!==t&&null!==s&&(e.updateSelection(s),e.close(),e.clearSearch())})}},clearSearch:function(){var e=this.getPlaceholder();e!==t&&0===this.getVal().length&&!1===this.search.hasClass("select2-focused")?(this.search.val(e).addClass("select2-default"),this.resizeSearch()):this.search.val(" ").width(10)},clearPlaceholder:function(){this.search.hasClass("select2-default")?this.search.val("").removeClass("select2-default"):" "===this.search.val()&&this.search.val("")},opening:function(){this.parent.opening.apply(this,arguments),this.clearPlaceholder(),this.resizeSearch(),this.focusSearch()},close:function(){this.opened()&&this.parent.close.apply(this,arguments)},focus:function(){this.close(),this.search.focus()},isFocused:function(){return this.search.hasClass("select2-focused")},updateSelection:function(t){var s=[],i=[],n=this;e(t).each(function(){r(n.id(this),s)<0&&(s.push(n.id(this)),i.push(this))}),t=i,this.selection.find(".select2-search-choice").remove(),e(t).each(function(){n.addSelectedChoice(this)}),n.postprocessResults()},tokenize:function(){var e=this.search.val();null!=(e=this.opts.tokenizer(e,this.data(),this.bind(this.onSelect),this.opts))&&e!=t&&(this.search.val(e),e.length>0&&this.open())},onSelect:function(e){this.addSelectedChoice(e),this.select&&this.postprocessResults(),this.opts.closeOnSelect?(this.close(),this.search.width(10)):this.countSelectableResults()>0?(this.search.width(10),this.resizeSearch(),this.positionDropdown()):this.close(),this.triggerChange({added:e}),this.focusSearch()},cancel:function(){this.close(),this.focusSearch()},addSelectedChoice:function(t){var s,i=e("<li class='select2-search-choice'>    <div></div>    <a href='#' onclick='return false;' class='select2-search-choice-close' tabindex='0'><span class='assistive'>Remove Filter</span></a></li>"),n=this.id(t),o=this.getVal();s=this.opts.formatSelection(t,i),i.find("div").replaceWith("<div>"+this.opts.escapeMarkup(s)+"</div>"),i.find("a span").replaceWith("<span class='assistive'>Remove "+this.opts.escapeMarkup(s)+" Filter</div>"),i.find(".select2-search-choice-close").bind("mousedown",p).bind("click dblclick",this.bind(function(t){this.enabled&&(e(t.target).closest(".select2-search-choice").fadeOut("fast",this.bind(function(){this.unselect(e(t.target)),this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus"),this.close(),this.focusSearch()})).dequeue(),p(t))})).bind("focus",this.bind(function(){this.enabled&&(this.container.addClass("select2-container-active"),this.dropdown.addClass("select2-drop-active"))})),i.data("select2-data",t),i.insertBefore(this.searchContainer),o.push(n),this.setVal(o)},unselect:function(e){var t,s,i=this.getVal();if(0===(e=e.closest(".select2-search-choice")).length)throw"Invalid argument: "+e+". Must be .select2-search-choice";t=e.data("select2-data"),(s=r(this.id(t),i))>=0&&(i.splice(s,1),this.setVal(i),this.select&&this.postprocessResults()),e.remove(),this.triggerChange({removed:t})},postprocessResults:function(){var e=this.getVal(),t=this.results.find(".select2-result-selectable"),s=this.results.find(".select2-result-with-children"),i=this;t.each2(function(t,s){r(i.id(s.data("select2-data")),e)>=0?s.addClass("select2-disabled").removeClass("select2-result-selectable"):s.removeClass("select2-disabled").addClass("select2-result-selectable")}),s.each2(function(e,t){0==t.find(".select2-result-selectable").length?t.addClass("select2-disabled"):t.removeClass("select2-disabled")}),t.each2(function(e,t){if(!t.hasClass("select2-disabled")&&t.hasClass("select2-result-selectable"))return i.highlight(0),!1})},resizeSearch:function(){var t,s,i,n,o,l=(o=this.search).outerWidth()-o.width();t=function(t){if(!a){var s=t[0].currentStyle||window.getComputedStyle(t[0],null);a=e("<div></div>").css({position:"absolute",left:"-10000px",top:"-10000px",display:"none",fontSize:s.fontSize,fontFamily:s.fontFamily,fontStyle:s.fontStyle,fontWeight:s.fontWeight,letterSpacing:s.letterSpacing,textTransform:s.textTransform,whiteSpace:"nowrap"}),e("body").append(a)}return a.text(t.val()),a.width()}(this.search)+10,s=this.search.offset().left,(n=(i=this.selection.width())-(s-this.selection.offset().left)-l)<t&&(n=i-l),n<40&&(n=i-l),this.search.width(n)},getVal:function(){var e;return this.select?null===(e=this.select.val())?[]:e:d(e=this.opts.element.val(),this.opts.separator)},setVal:function(t){var s;this.select?this.select.val(t):(s=[],e(t).each(function(){r(this,s)<0&&s.push(this)}),this.opts.element.val(0===s.length?"":s.join(this.opts.separator)))},val:function(){var s,i=[],n=this;if(0===arguments.length)return this.getVal();if(!(s=arguments[0]))return this.opts.element.val(""),this.updateSelection([]),void this.clearSearch();if(this.setVal(s),this.select)this.select.find(":selected").each(function(){i.push({id:e(this).attr("value"),text:e(this).text()})}),this.updateSelection(i);else{if(this.opts.initSelection===t)throw new Error("val() cannot be called if initSelection() is not defined");this.opts.initSelection(this.opts.element,function(t){var s=e(t).map(n.id);n.setVal(s),n.updateSelection(t),n.clearSearch()})}this.clearSearch()},onSortStart:function(){if(this.select)throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");this.search.width(0),this.searchContainer.hide()},onSortEnd:function(){var t=[],s=this;this.searchContainer.show(),this.searchContainer.appendTo(this.searchContainer.parent()),this.resizeSearch(),this.selection.find(".select2-search-choice").each(function(){t.push(s.opts.id(e(this).data("select2-data")))}),this.setVal(t),this.triggerChange()},data:function(t){var s,i=this;if(0===arguments.length)return this.selection.find(".select2-search-choice").map(function(){return e(this).data("select2-data")}).get();t||(t=[]),s=e.map(t,function(e){return i.opts.id(e)}),this.setVal(s),this.updateSelection(t),this.clearSearch()}}),e.fn.select2=function(){var s,i,l,a,c=Array.prototype.slice.call(arguments,0),h=["val","destroy","opened","open","close","focus","isFocused","container","onSortStart","onSortEnd","enable","disable","positionDropdown","data"];return this.each(function(){if(0===c.length||"object"==typeof c[0])(s=0===c.length?{}:e.extend({},c[0])).element=e(this),"select"===s.element.get(0).tagName.toLowerCase()?a=s.element.attr("multiple"):(a=s.multiple||!1,"tags"in s&&(s.multiple=a=!0)),(i=a?new o:new n).init(s);else{if("string"!=typeof c[0])throw"Invalid arguments to select2 plugin: "+c;if(r(c[0],h)<0)throw"Unknown method: "+c[0];if(l=t,(i=e(this).data("select2"))===t)return;if((l="container"===c[0]?i.container:i[c[0]].apply(i,c.slice(1)))!==t)return!1}}),l===t?this:l},e.fn.select2.defaults={width:"copy",closeOnSelect:!0,openOnEnter:!0,containerCss:{},dropdownCss:{},containerCssClass:"",dropdownCssClass:"",formatResult:function(e,t,s){var i=[];return f(e.text,s.term,i),i.join("")},formatSelection:function(e,s){return e?e.text:t},formatResultCssClass:function(e){return t},formatNoMatches:function(){return"No matches found"},formatInputTooShort:function(e,t){return"Please enter "+(t-e.length)+" more characters"},formatSelectionTooBig:function(e){return"You can only select "+e+" item"+(1==e?"":"s")},formatLoadMore:function(e){return"Loading more results..."},formatSearching:function(){return"Searching..."},minimumResultsForSearch:0,minimumInputLength:0,maximumSelectionSize:0,id:function(e){return e.id},matcher:function(e,t){return t.toUpperCase().indexOf(e.toUpperCase())>=0},separator:",",tokenSeparators:[],tokenizer:function(e,s,i,n){var o,l,a,c,r,d=e,u=!1;if(!n.createSearchChoice||!n.tokenSeparators||n.tokenSeparators.length<1)return t;for(;;){for(l=-1,a=0,c=n.tokenSeparators.length;a<c&&(r=n.tokenSeparators[a],!((l=e.indexOf(r))>=0));a++);if(l<0)break;if(o=e.substring(0,l),e=e.substring(l+r.length),o.length>0&&(o=n.createSearchChoice(o,s))!==t&&null!==o&&n.id(o)!==t&&null!==n.id(o)){for(u=!1,a=0,c=s.length;a<c;a++)if(h(n.id(o),n.id(s[a]))){u=!0;break}u||i(o)}}return 0!=d.localeCompare(e)?e:void 0},escapeMarkup:function(e){return e&&"string"==typeof e?e.replace(/&/g,"&amp;"):e},blurOnChange:!1},window.Select2={query:{ajax:m,local:g,tags:v},util:{debounce:u,markMatch:f},class:{abstract:i,single:n,multi:o}});function r(e,t){var s,i=0,n=t.length;if(void 0===e)return-1;if(e.constructor===String){for(;i<n;i+=1)if(0===e.localeCompare(t[i]))return i}else for(;i<n;i+=1)if((s=t[i]).constructor===String){if(0===s.localeCompare(e))return i}else if(s===e)return i;return-1}function h(e,s){return e===s||e!==t&&s!==t&&(null!==e&&null!==s&&(e.constructor===String?0===e.localeCompare(s):s.constructor===String&&0===s.localeCompare(e)))}function d(t,s){var i,n,o;if(null===t||t.length<1)return[];for(n=0,o=(i=t.split(s)).length;n<o;n+=1)i[n]=e.trim(i[n]);return i}function u(e,s,i){var n;return i=i||t,function(){var t=arguments;window.clearTimeout(n),n=window.setTimeout(function(){s.apply(i,t)},e)}}function p(e){e.preventDefault(),e.stopPropagation()}function f(e,t,s){var i=e.toUpperCase().indexOf(t.toUpperCase()),n=t.length;i<0?s.push(e):(s.push(e.substring(0,i)),s.push("<span class='select2-match'>"),s.push(e.substring(i,i+n)),s.push("</span>"),s.push(e.substring(i+n,e.length)))}function m(t){var s,i=0,n=null,o=t.quietMillis||100;return function(l){window.clearTimeout(s),s=window.setTimeout(function(){var s=i+=1,o=t.data,a=t.transport||e.ajax,c=t.traditional||!1,r=t.type||"GET";o=o.call(this,l.term,l.page,l.context),null!==n&&n.abort(),n=a.call(null,{url:t.url,dataType:t.dataType,data:o,type:r,traditional:c,success:function(e){if(!(s<i)){var n=t.results(e,l.page);l.callback(n)}}})},o)}}function g(t){var s,i=t,n=function(e){return""+e.text};return e.isArray(i)||(n=i.text,e.isFunction(n)||(s=i.text,n=function(e){return e[s]}),i=i.results),function(t){var s,o=t.term,l={results:[]};""!==o?(s=function(i,l){var a,c;if((i=i[0]).children){a={};for(c in i)i.hasOwnProperty(c)&&(a[c]=i[c]);a.children=[],e(i.children).each2(function(e,t){s(t,a.children)}),a.children.length&&l.push(a)}else t.matcher(o,n(i))&&l.push(i)},e(i).each2(function(e,t){s(t,l.results)}),t.callback(l)):t.callback({results:i})}}function v(s){return e.isFunction(s)?s:function(i){var n=i.term,o={results:[]};e(s).each(function(){var e=this.text!==t,s=e?this.text:this;(""===n||i.matcher(n,s))&&o.results.push(e?this:{id:this,text:this})}),i.callback(o)}}function b(t,s){if(e.isFunction(t))return!0;if(!t)return!1;throw new Error("formatterName must be a function or a falsy value")}function w(t){return e.isFunction(t)?t():t}function C(t,s){var i=function(){};return(i.prototype=new t).constructor=i,i.prototype.parent=t.prototype,i.prototype=e.extend(i.prototype,s),i}}(jQuery);