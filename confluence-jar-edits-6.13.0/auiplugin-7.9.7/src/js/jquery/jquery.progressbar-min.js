(function(a){a.fn.progressBar=function(e,h){var f=a.extend({height:"1em",showPercentage:!0},h),b=this.attr("id")+"-incomplete-bar",c=this.attr("id")+"-complete-bar",g=this.attr("id")+"-percent-complete-text";if(0==a("#"+b).length){var d=a(document.createElement("div"));d.attr("id",b);d.css({width:"90%",border:"solid 1px #ccc","float":"left","margin-right":"0.5em"});d.addClass("progress-background-color");b=a(document.createElement("div"));b.attr("id",c);b.addClass("progress-fill-color");b.css({height:f.height,
width:e+"%"});c=a(document.createElement("span"));c.attr("id",g);c.addClass("percent-complete-text");c.html(e+"%");d.append(b);this.append(d);f.showPercentage&&this.append(c)}else a("#"+c).css("width",e+"%"),a("#"+g).html(e+"%")}})(jQuery);