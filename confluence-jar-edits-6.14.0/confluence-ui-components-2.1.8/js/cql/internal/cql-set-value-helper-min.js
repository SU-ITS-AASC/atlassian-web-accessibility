define("confluence-ui-components/js/cql/internal/cql-set-value-helper",["jquery"],function(b){function a(f,c){var e=b.Deferred();f.on("change",function(){e.resolve()});var d=true;f.select2("val",c,d);return e}return{setValues:a}});