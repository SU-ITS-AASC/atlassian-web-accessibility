AJS.toInit(function(a){function b(d){var c="highlighter_";return d.indexOf(c)==0?d:c+d}a(".codeHeader .collapse-source").click(function(){var g=a(this);var d=g.parent().parent().children(".codeContent");var f=d.children().children(".syntaxhighlighter").attr("id");var e=g.children(".expand-control-icon");var c=a(document.getElementById(b(f)));if(c.hasClass("collapsed")){c.removeClass("collapsed");c.addClass("expanded");d.addClass("show-border-top");a(".expand-control-text",g).text(AJS.I18n.getText("newcode.config.collapse.source"));e.addClass("expanded")}else{if(c.hasClass("expanded")){c.removeClass("expanded");c.addClass("collapsed");d.removeClass("show-border-top");a(".expand-control-text",g).text(AJS.I18n.getText("newcode.config.expand.source"));e.removeClass("expanded")}}})});