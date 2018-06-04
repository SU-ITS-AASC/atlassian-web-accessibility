define("confluence-ui-components/js/cql/internal/filterfields/cql-date-filter-field",["ajs","underscore","confluence-ui-components/js/cql/internal/cql-date-picker"],function(b,c,a){function d(g){var h=g.fieldName;var f;function e(){var j=f.getFromDate();var i=f.getToDate();var l,k;if(j){l=h+' >= "'+j+'"'}if(i){k=h+' <= "'+i+'"'}if(l&&k){return l+" and "+k}return l||k||""}return{setupInput:function(i){f=a.build.call(this,i)},setValues:function(k){if(!f){b.warn("DatePicker not set yet, can't set values");return}var j=k.expressions;if(j.length<1||j.length>2){b.warn("Can't set date value with expressions.length: "+j.length);return}if(j.length===1&&j[0].functionValues.length===1&&j[0].functionValues[0].functionName==="now"){if(j[0].operator!==">="){b.warn("Unsupported date picker relative date operator: "+j[0].operator);return}var i=j[0].functionValues[0].parameters[0];f.selectOption("now('"+i+"')")}else{c.each(j,function(m){if(m.values.length===1){var l=m.values[0];if(m.operator===">="){f.setFromDate(l)}else{if(m.operator==="<="){f.setToDate(l)}}}})}},asCqlFunc:function(){if(!f){b.warn("DatePicker not set yet, can't get CQL");return}var i=f.getSelectedOption();if(!i){return""}if(i==="custom"){return e()}return h+" >= "+i}}}return{build:d}});