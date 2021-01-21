define("confluence-ui-components/js/cql/internal/cql-filter-select",["jquery","underscore","ajs","confluence-ui-components/js/cql/internal/cql-ajax","confluence-ui-components/js/cql/internal/cql-field-model","confluence-ui-components/js/cql/internal/cql-soy-templates"],function(g,d,b,f,c,a){var e=a.FilterSelect;function h(u){var s=u.cqlContainer;var n=s.find(".cql-fields");var j=u.onSelection;if(!j){throw Error("An onSelection callback must be provided to the FilterSelect.")}var t=g(e().container());var o=t.children("button");var r=t.find(".input-wrapper");var q=t.find("input");function k(v){v.preventDefault();r.removeClass("hidden");o.hide();t.find(".select2-choice").mousedown()}o.click(k);function i(){r.addClass("hidden");o.show()}q.bind("select2-close",function(){b.debug("CQL Field selector closed");i();setTimeout(function(){b.log("Checking CQL Field selector focus");if(!g(document.activeElement).closest(".cql-filter").length){b.debug("Setting CQL Field selector focus");o.focus()}},1)});s.append(t);function p(v){if(!v.added){return}q.auiSelect2("val","");j(v.added);b.debug("CQL Field selection made");i()}function l(v){if(u.context.environment!=="search-screen"&&!b.DarkFeatures.isEnabled("cql.search.screen")){v=d.reject(v,function(x){return x.type==="date"})}v=d.reject(v,function(x){return d.contains(u.ignoredFields,x.fieldName)});function w(){if(!n[0]){throw new Error("Why no cql-container?")}var y=n.find(".cql-filter").map(function(){return g(this).data("fieldName")});var x=d.reject(v,function(z){return d.contains(y,z.fieldName)&&!d.contains(["label"],z.fieldName)});return{results:x,text:c.getLabel}}q.auiSelect2({id:"fieldName",data:w,formatResult:c.getLabel,formatSelection:c.getLabel,placeholder:b.I18n.getText("confluence-ui-components.cql-filter-select.link")}).change(p)}function m(){b.log("Couldn't fetch CQL fields - unable to initialise CQL field picker")}f.getFields().done(l).fail(m);return q}return{build:h}});