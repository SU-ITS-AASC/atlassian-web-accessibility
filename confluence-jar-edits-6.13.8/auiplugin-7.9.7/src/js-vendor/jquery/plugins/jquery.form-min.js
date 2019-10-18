(function(b){function m(){if(b.fn.ajaxSubmit.debug){var a="[jquery.form] "+Array.prototype.join.call(arguments,"");window.console&&window.console.log?window.console.log(a):window.opera&&window.opera.postError&&window.opera.postError(a)}}b.fn.ajaxSubmit=function(a){function f(){function d(){var a=j.attr("target"),k=j.attr("action");c.setAttribute("target",f);"POST"!=c.getAttribute("method")&&c.setAttribute("method","POST");c.getAttribute("action")!=e.url&&c.setAttribute("action",e.url);e.skipEncodingOverride||
j.attr({encoding:"multipart/form-data",enctype:"multipart/form-data"});e.timeout&&setTimeout(function(){s=!0;g()},e.timeout);var l=[];try{if(e.extraData)for(var m in e.extraData)l.push(b('<input type="hidden" name="'+m+'" value="'+e.extraData[m]+'" />').appendTo(c)[0]);i.appendTo("body");h.attachEvent?h.attachEvent("onload",g):h.addEventListener("load",g,!1);c.submit()}finally{c.setAttribute("action",k),a?c.setAttribute("target",a):j.removeAttr("target"),b(l).remove()}}function g(){if(!k.aborted){var a=
h.contentWindow?h.contentWindow.document:h.contentDocument?h.contentDocument:h.document;if(a&&a.location.href!=e.iframeSrc){h.detachEvent?h.detachEvent("onload",g):h.removeEventListener("load",g,!1);var d=!0;try{if(s)throw"timeout";var c="xml"==e.dataType||a.XMLDocument||b.isXMLDoc(a);m("isXml="+c);if(!c&&(window.opera&&(null==a.body||""==a.body.innerHTML))&&--w){m("requeing onLoad callback, DOM not available");setTimeout(g,250);return}k.responseText=a.body?a.body.innerHTML:a.documentElement?a.documentElement.innerHTML:
null;k.responseXML=a.XMLDocument?a.XMLDocument:a;k.getResponseHeader=function(a){return{"content-type":e.dataType}[a]};var f=/(json|script)/.test(e.dataType);if(f||e.textarea){var j=a.getElementsByTagName("textarea")[0];if(j)k.responseText=j.value;else if(f){var o=a.getElementsByTagName("pre")[0],q=a.getElementsByTagName("body")[0];o?k.responseText=o.textContent:q&&(k.responseText=q.innerHTML)}}else"xml"==e.dataType&&(!k.responseXML&&null!=k.responseText)&&(k.responseXML=x(k.responseText));var a=
k,p=e.dataType,c=e,t=a.getResponseHeader("content-type")||"",u="xml"===p||!p&&0<=t.indexOf("xml"),n=u?a.responseXML:a.responseText;u&&"parsererror"===n.documentElement.nodeName&&b.error&&b.error("parsererror");c&&c.dataFilter&&(n=c.dataFilter(n,p));"string"===typeof n&&("json"===p||!p&&0<=t.indexOf("json")?n=y(n):("script"===p||!p&&0<=t.indexOf("javascript"))&&b.globalEval(n));v=n}catch(r){m("error caught:",r),d=!1,k.error=r,e.error&&e.error.call(e.context,k,"error",r),l&&b.event.trigger("ajaxError",
[k,e,r])}k.aborted&&(m("upload aborted"),d=!1);d&&(e.success&&e.success.call(e.context,v,"success",k),l&&b.event.trigger("ajaxSuccess",[k,e]));l&&b.event.trigger("ajaxComplete",[k,e]);l&&!--b.active&&b.event.trigger("ajaxStop");e.complete&&e.complete.call(e.context,k,d?"success":"error");setTimeout(function(){i.removeData("form-plugin-onload");i.remove();k.responseXML=null},100)}}}var c=j[0];if(b(":input[name=submit],:input[id=submit]",c).length)alert('Error: Form elements must not have name or id of "submit".');
else{var e=b.extend(!0,{},b.ajaxSettings,a);e.context=e.context||e;var f="jqFormIO"+(new Date).getTime(),i=b('<iframe id="'+f+'" name="'+f+'" src="'+e.iframeSrc+'" />'),h=i[0];i.css({position:"absolute",top:"-1000px",left:"-1000px"});var k={aborted:0,responseText:null,responseXML:null,status:0,statusText:"n/a",getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(){m("aborting upload...");this.aborted=1;i.attr("src",e.iframeSrc);k.error="aborted";
e.error&&e.error.call(e.context,k,"error","aborted");l&&b.event.trigger("ajaxError",[k,e,"aborted"]);e.complete&&e.complete.call(e.context,k,"error")}},l=e.global;l&&!b.active++&&b.event.trigger("ajaxStart");l&&b.event.trigger("ajaxSend",[k,e]);if(e.beforeSend&&!1===e.beforeSend.call(e.context,k,e))e.global&&b.active--;else if(!k.aborted){var s=0,o=c.clk;if(o){var q=o.name;q&&!o.disabled&&(e.extraData=e.extraData||{},e.extraData[q]=o.value,"image"==o.type&&(e.extraData[q+".x"]=c.clk_x,e.extraData[q+
".y"]=c.clk_y))}e.forceSync?d():setTimeout(d,10);var v,w=50,x=b.parseXML||function(a,b){window.ActiveXObject?(b=new ActiveXObject("Microsoft.XMLDOM"),b.async="false",b.loadXML(a)):b=(new DOMParser).parseFromString(a,"text/xml");return b&&b.documentElement&&"parsererror"!=b.documentElement.nodeName?b:null},y=b.parseJSON||function(a){return window.eval("("+a+")")}}}}if(!this.length)return m("ajaxSubmit: skipping submit process - no element selected"),this;"function"==typeof a&&(a={success:a});var c=
this.attr("action");(c="string"===typeof c?b.trim(c):"")&&(c=(c.match(/^([^#]+)/)||[])[1]);c=c||window.location.href||"";a=b.extend(!0,{url:c,type:this[0].getAttribute("method")||"GET",iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank"},a);c={};this.trigger("form-pre-serialize",[this,a,c]);if(c.veto)return m("ajaxSubmit: submit vetoed via form-pre-serialize trigger"),this;if(a.beforeSerialize&&!1===a.beforeSerialize(this,a))return m("ajaxSubmit: submit aborted via beforeSerialize callback"),
this;var d,g,i=this.formToArray(a.semantic);if(a.data)for(d in a.extraData=a.data,a.data)if(a.data[d]instanceof Array)for(var h in a.data[d])i.push({name:d,value:a.data[d][h]});else g=a.data[d],g=b.isFunction(g)?g():g,i.push({name:d,value:g});if(a.beforeSubmit&&!1===a.beforeSubmit(i,this,a))return m("ajaxSubmit: submit aborted via beforeSubmit callback"),this;this.trigger("form-submit-validate",[i,this,a,c]);if(c.veto)return m("ajaxSubmit: submit vetoed via form-submit-validate trigger"),this;d=b.param(i);
"GET"==a.type.toUpperCase()?(a.url+=(0<=a.url.indexOf("?")?"&":"?")+d,a.data=null):a.data=d;var j=this,l=[];a.resetForm&&l.push(function(){j.resetForm()});a.clearForm&&l.push(function(){j.clearForm()});if(!a.dataType&&a.target){var s=a.success||function(){};l.push(function(d){var c=a.replaceTarget?"replaceWith":"html";b(a.target)[c](d).each(s,arguments)})}else a.success&&l.push(a.success);a.success=function(b,d,c){for(var e=a.context||a,g=0,f=l.length;g<f;g++)l[g].apply(e,[b,d,c||j,j])};d=0<b("input:file",
this).length;h="multipart/form-data"==j.attr("enctype")||"multipart/form-data"==j.attr("encoding");!1!==a.iframe&&(d||a.iframe||h)?a.closeKeepAlive?b.get(a.closeKeepAlive,f):f():b.ajax(a);this.trigger("form-submit-notify",[this,a]);return this};b.fn.ajaxForm=function(a){if(0===this.length){var f=this.selector,c=this.context;if(!b.isReady&&f)return m("DOM not ready, queuing ajaxForm"),b(function(){b(f,c).ajaxForm(a)}),this;m("terminating; zero elements found by selector"+(b.isReady?"":" (DOM not ready)"));
return this}return this.ajaxFormUnbind().bind("submit.form-plugin",function(d){d.isDefaultPrevented()||(d.preventDefault(),b(this).ajaxSubmit(a))}).bind("click.form-plugin",function(a){var c=a.target,f=b(c);if(!f.is(":submit,input:image")){c=f.closest(":submit");if(0==c.length)return;c=c[0]}var h=this;h.clk=c;"image"==c.type&&(void 0!=a.offsetX?(h.clk_x=a.offsetX,h.clk_y=a.offsetY):"function"==typeof b.fn.offset?(f=f.offset(),h.clk_x=a.pageX-f.left,h.clk_y=a.pageY-f.top):(h.clk_x=a.pageX-c.offsetLeft,
h.clk_y=a.pageY-c.offsetTop));setTimeout(function(){h.clk=h.clk_x=h.clk_y=null},100)})};b.fn.ajaxFormUnbind=function(){return this.unbind("submit.form-plugin click.form-plugin")};b.fn.formToArray=function(a){var f=[];if(0===this.length)return f;var c=this[0],d=a?c.getElementsByTagName("*"):c.elements;if(!d)return f;var g,i,h,j,l,m;g=0;for(l=d.length;g<l;g++)if(i=d[g],h=i.name)if(a&&c.clk&&"image"==i.type)!i.disabled&&c.clk==i&&(f.push({name:h,value:b(i).val()}),f.push({name:h+".x",value:c.clk_x},
{name:h+".y",value:c.clk_y}));else if((j=b.fieldValue(i,!0))&&j.constructor==Array){i=0;for(m=j.length;i<m;i++)f.push({name:h,value:j[i]})}else null!==j&&"undefined"!=typeof j&&f.push({name:h,value:j});if(!a&&c.clk&&(a=b(c.clk),d=a[0],(h=d.name)&&!d.disabled&&"image"==d.type))f.push({name:h,value:a.val()}),f.push({name:h+".x",value:c.clk_x},{name:h+".y",value:c.clk_y});return f};b.fn.formSerialize=function(a){return b.param(this.formToArray(a))};b.fn.fieldSerialize=function(a){var f=[];this.each(function(){var c=
this.name;if(c){var d=b.fieldValue(this,a);if(d&&d.constructor==Array)for(var g=0,i=d.length;g<i;g++)f.push({name:c,value:d[g]});else null!==d&&"undefined"!=typeof d&&f.push({name:this.name,value:d})}});return b.param(f)};b.fn.fieldValue=function(a){for(var f=[],c=0,d=this.length;c<d;c++){var g=b.fieldValue(this[c],a);null===g||("undefined"==typeof g||g.constructor==Array&&!g.length)||(g.constructor==Array?b.merge(f,g):f.push(g))}return f};b.fieldValue=function(a,f){var c=a.name,d=a.type,g=a.tagName.toLowerCase();
void 0===f&&(f=!0);if(f&&(!c||a.disabled||"reset"==d||"button"==d||("checkbox"==d||"radio"==d)&&!a.checked||("submit"==d||"image"==d)&&a.form&&a.form.clk!=a||"select"==g&&-1==a.selectedIndex))return null;if("select"==g){var i=a.selectedIndex;if(0>i)return null;for(var c=[],g=a.options,h=(d="select-one"==d)?i+1:g.length,i=d?i:0;i<h;i++){var j=g[i];if(j.selected){var l=j.value;l||(l=j.attributes&&j.attributes.value&&!j.attributes.value.specified?j.text:j.value);if(d)return l;c.push(l)}}return c}return b(a).val()};
b.fn.clearForm=function(){return this.each(function(){b("input,select,textarea",this).clearFields()})};b.fn.clearFields=b.fn.clearInputs=function(){return this.each(function(){var a=this.type,b=this.tagName.toLowerCase();"text"==a||"password"==a||"textarea"==b?this.value="":"checkbox"==a||"radio"==a?this.checked=!1:"select"==b&&(this.selectedIndex=-1)})};b.fn.resetForm=function(){return this.each(function(){("function"==typeof this.reset||"object"==typeof this.reset&&!this.reset.nodeType)&&this.reset()})};
b.fn.enable=function(a){void 0===a&&(a=!0);return this.each(function(){this.disabled=!a})};b.fn.selected=function(a){void 0===a&&(a=!0);return this.each(function(){var f=this.type;"checkbox"==f||"radio"==f?this.checked=a:"option"==this.tagName.toLowerCase()&&(f=b(this).parent("select"),a&&(f[0]&&"select-one"==f[0].type)&&f.find("option").selected(!1),this.selected=a)})}})(jQuery);