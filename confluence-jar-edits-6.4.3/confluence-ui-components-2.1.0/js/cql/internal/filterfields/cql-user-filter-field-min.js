define("confluence-ui-components/js/cql/internal/filterfields/cql-user-filter-field",["jquery","ajs","confluence-ui-components/js/user-group-select2"],function(c,b,a){function d(){var f;function e(h){var g=h[0].result[0];return{id:g.username,text:g.title,imgSrc:g.thumbnailLink.href}}return{setupInput:function(g){f=g;g.addClass("select2-input autocomplete-multiusergroup");a.bind(g.parent())},setValues:function(j){var h=j.values;if(!h||!h[0]){return}var i=h.map(function(k){return c.getJSON(b.contextPath()+"/rest/prototype/1/search/user.json?query="+encodeURI(k))});function g(){var l=i.length>1?arguments:[arguments];var k=l.map(e);f.auiSelect2("data",k)}return c.when.apply(c,i).done(g)}}}return{build:d}});