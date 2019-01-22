/*
 jQuery Column cell selector v1.0

 Licensed under the new BSD License.
 Copyright 2009-2012, Bram Stein
 All rights reserved.

 ATLASSIAN modified: Removed all extensions,modifications to jQuery expression internals (jQuery.expr)
 now creates pseudo selector via jQuery/Sizzle preferred method

 @module atlassian-tinymce/jquery/jquery-column
*/
define("atlassian-tinymce/jquery/jquery-column",["jquery"],function(f){var g=/([\+\-]?\d*)[nN]([\+\-]?\d*)/,k,c;return{nthCol:function(a){var i=[],j={multiplier:0,offset:0};"even"===a?a="2n":"odd"===a?a="2n+1":/^\d*$/.test(a)&&(a="0n+"+a);i=g.exec(a);null!==i&&(j.multiplier=i[1]-0,j.offset=i[2]-0);c=j;var d,l,e=[],h=0,m=[];f.each(this,function(n,a){var b=0,c=0,f=a.rowSpan||1,g=a.colSpan||1;if(a.parentNode!==d){d=a.parentNode;if(d.parentNode!==l){l=d.parentNode;e=[]}h=0;e[d.rowIndex]===void 0&&(e[d.rowIndex]=
[])}for(b=0;b<e[d.rowIndex].length+1;b=b+1)if(e[d.rowIndex][b]===void 0){h=b;break}m[n]=h;for(b=d.rowIndex;b<d.rowIndex+f;b=b+1){e[b]===void 0&&(e[b]=[]);for(c=h;c<h+g;c=c+1)e[b][c]=true}});k=m;return f(this).filter(function(a){a=k[a]-(c.offset-1);a=c.multiplier===0?a===0:a%c.multiplier===0&&a/c.multiplier>=0;return a})}}});require("confluence/module-exporter").safeRequire("atlassian-tinymce/jquery/jquery-column",function(f){var g=require("jquery");g.extend(g.fn,f)});