define("confluence-collaborative-editor-plugin/util/url-parser",["window"],function(a){return{parseUrl:function(c){var b=a.document.createElement("a");b.href=c;return{protocol:b.protocol.replace(":",""),hostname:b.hostname,port:b.port,pathname:b.pathname==="/"?"":b.pathname,search:b.search,hash:b.hash.substr(b.hash.indexOf("#")+1,b.hash.length),host:b.host}}}});