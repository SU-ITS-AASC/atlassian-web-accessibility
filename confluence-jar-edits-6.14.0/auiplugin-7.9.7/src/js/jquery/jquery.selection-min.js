(function(e){document.selection?(e.fn.selection=function(d){var a=this[0];this.focus();if(!a)return!1;if(null==d)return document.selection.createRange().text;var c=a.scrollTop,b=document.selection.createRange();b.text=d;b.select();a.focus();a.scrollTop=c},e.fn.selectionRange=function(d,a){var c=this[0];this.focus();var b=document.selection.createRange();if(null==d){var e=this.val(),g=e.length,f=b.duplicate();f.moveToElementText(c);f.setEndPoint("StartToEnd",b);c=g-f.text.replace(/\u000D/g,"").length;
f.setEndPoint("StartToStart",b);b=g-f.text.replace(/\u000D/g,"").length;c!=b&&"\n"==e.charAt(c+1)&&(c+=1);return{end:c,start:b,text:e.substring(b,c),textBefore:e.substring(0,b),textAfter:e.substring(c)}}b.moveToElementText(c);b.collapse(!0);b.moveStart("character",d);b.moveEnd("character",a-d);b.select()}):(e.fn.selection=function(d){var a=this[0];if(!a)return!1;if(null==d)return a.setSelectionRange?a.value.substring(a.selectionStart,a.selectionEnd):!1;var c=a.scrollTop;if(a.setSelectionRange){var b=
a.selectionStart;a.value=a.value.substring(0,b)+d+a.value.substring(a.selectionEnd);a.selectionStart=b;a.selectionEnd=b+d.length}a.focus();a.scrollTop=c},e.fn.selectionRange=function(d,a){if(null==d){var c={start:this[0].selectionStart,end:this[0].selectionEnd},b=this.val();c.text=b.substring(c.start,c.end);c.textBefore=b.substring(0,c.start);c.textAfter=b.substring(c.end);return c}this[0].selectionStart=d;this[0].selectionEnd=a});e.fn.wrapSelection=function(d,a){this.selection(d+this.selection()+
(a||""))}})(jQuery);