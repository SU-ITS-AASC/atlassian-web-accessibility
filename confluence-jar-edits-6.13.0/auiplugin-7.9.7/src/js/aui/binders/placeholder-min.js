("undefined"===typeof window?global:window).__4aa3faf3e1a039ca7e641017624fd4d6=function(){"use strict";var a=__700a145ba3db9966cc95664c892049f8,c=a&&a.__esModule?a:{"default":a},a=(a=__0bbb661b86f4b304c81cc691259d70c9)&&a.__esModule?a:{"default":a};"placeholder"in document.createElement("input")||a.default.register("placeholder",{selector:"input[placeholder]",run:function(a){var b=(0,c.default)(a),a=function(){c.default.trim(b.val()).length||b.val(b.attr("placeholder")).addClass("placeholder-shown").trigger("reset.placeholder")};
a();b.blur(a).focus(function(){b.hasClass("placeholder-shown")&&b.val("").removeClass("placeholder-shown")})}});return{}}.call(this);