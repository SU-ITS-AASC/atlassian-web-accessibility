define("confluence-ui-components/js/cql/internal/filterfields/cql-label-filter-field",["jquery","ajs","confluence-ui-components/js/label-picker","confluence-ui-components/js/include-exclude-picker","confluence-ui-components/js/cql/internal/cql-set-value-helper"],function(d,c,a,e,b){function f(){var g;return{setupInput:function(h){g=h;h.auiSelect2(e.build(a.build({noMatches:c.I18n.getText("confluence-ui-components.label-picker.no-matches")})))},setValues:function(h){return b.setValues(g,h.values)}}}return{build:f}});