define("confluence-ui-components/js/cql/internal/cql-negation-converter",["underscore"],function(a){function b(d){d.values=a.map(d.values,function(e){return"-"+e})}function c(e){var d=$.extend({},e);if(d.field.type==="equality"){if(d.operator==="!="){d.operator="=";b(d)}else{if(d.operator==="notin"){d.operator="in";b(d)}}}return d}return{convert:c}});