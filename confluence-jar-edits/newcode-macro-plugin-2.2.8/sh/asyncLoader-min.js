define("confluence/code-macro/async-loader",["jquery","wrm","underscore"],function(c,a,b){return function(){b.defer(function(){var h=c(".codeHeader .collapse-source");d(h);var i=c("#content").find("pre.syntaxhighlighter-pre");if(i.length>0){var g="wr!com.atlassian.confluence.ext.newcode-macro-plugin:sh-theme-";var f=["wrc!code-macro"];i.each(function(){f.push(g+c(this).data("theme").toLowerCase());var j=c(this).data("custom-language-resource");if(typeof j!=="undefined"&&f.indexOf(j)===-1){f.push("wr!"+j)}});a.require(f).done(function(){window.SyntaxHighlighter.highlight();e(h)})}});function d(f){f.hide();b.forEach(f,function(g){c(g).next(".collapse-spinner-wrapper").spin()})}function e(f){f.show();f.next(".collapse-spinner-wrapper").remove()}}});require("confluence/module-exporter").safeRequire("confluence/code-macro/async-loader",function(a){AJS.toInit(a)});