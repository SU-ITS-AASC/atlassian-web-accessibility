!function(e,t,n,r){var a,o={};function s(n,i,r,a){var s,d,f,g,c=this;!function(t,n){var i;if(!("FileReader"in e))return n(t.getAsDataURL());(i=new FileReader).readAsDataURL(t),i.onload=function(){n(i.result)}}(o[n.id],function(e){(s=t.createElement("canvas")).style.display="none",t.body.appendChild(s),d=s.getContext("2d"),(f=new Image).onerror=f.onabort=function(){a({success:!1})},f.onload=function(){var t,o,p,h;if(i.width||(i.width=f.width),i.height||(i.height=f.height),(g=Math.min(i.width/f.width,i.height/f.height))<1||1===g&&"image/jpeg"===r){if(t=Math.round(f.width*g),o=Math.round(f.height*g),s.width=t,s.height=o,d.drawImage(f,0,0,t,o),"image/jpeg"===r){if((p=new l(atob(e.substring(e.indexOf("base64,")+7)))).headers&&p.headers.length&&(h=new u).init(p.get("exif")[0])&&(h.setExif("PixelXDimension",t),h.setExif("PixelYDimension",o),p.set("exif",h.getBinary()),c.hasEventListener("ExifData")&&c.trigger("ExifData",n,h.EXIF()),c.hasEventListener("GpsData")&&c.trigger("GpsData",n,h.GPS())),i.quality)try{e=s.toDataURL(r,i.quality/100)}catch(t){e=s.toDataURL(r)}}else e=s.toDataURL(r);e=e.substring(e.indexOf("base64,")+7),e=atob(e),p&&p.headers&&p.headers.length&&(e=p.restore(e),p.purge()),s.parentNode.removeChild(s),a({success:!0,data:e})}else a({success:!1})},f.src=e})}function d(){var e,t=!1;function n(n,i){var r,a=t?0:-8*(i-1),o=0;for(r=0;r<i;r++)o|=e.charCodeAt(n+r)<<Math.abs(a+8*r);return o}function i(t,n,i){i=3===arguments.length?i:e.length-n-1;e=e.substr(0,n)+t+e.substr(i+n)}return{II:function(e){if(e===r)return t;t=e},init:function(n){t=!1,e=n},SEGMENT:function(t,n,r){switch(arguments.length){case 1:return e.substr(t,e.length-t-1);case 2:return e.substr(t,n);case 3:i(r,t,n);break;default:return e}},BYTE:function(e){return n(e,1)},SHORT:function(e){return n(e,2)},LONG:function(e,a){if(a===r)return n(e,4);!function(e,n,r){var a,o="",s=t?0:-8*(r-1);for(a=0;a<r;a++)o+=String.fromCharCode(n>>Math.abs(s+8*a)&255);i(o,e,r)}(e,a,4)},SLONG:function(e){var t=n(e,4);return t>2147483647?t-4294967296:t},STRING:function(e,t){var i="";for(t+=e;e<t;e++)i+=String.fromCharCode(n(e,1));return i}}}function l(e){var t,n,i,a={65505:{app:"EXIF",name:"APP1",signature:"Exif\0"},65506:{app:"ICC",name:"APP2",signature:"ICC_PROFILE\0"},65517:{app:"IPTC",name:"APP13",signature:"Photoshop 3.0\0"}},o=[],s=r,u=0;if((t=new d).init(e),65496===t.SHORT(0)){for(n=2,i=Math.min(1048576,e.length);n<=i;)if((s=t.SHORT(n))>=65488&&s<=65495)n+=2;else{if(65498===s||65497===s)break;u=t.SHORT(n+2)+2,a[s]&&t.STRING(n+4,a[s].signature.length)===a[s].signature&&o.push({hex:s,app:a[s].app.toUpperCase(),name:a[s].name.toUpperCase(),start:n,length:u,segment:t.SEGMENT(n,u)}),n+=u}return t.init(null),{headers:o,restore:function(e){t.init(e);var i=new l(e);if(!i.headers)return!1;for(var r=i.headers.length;r>0;r--){var a=i.headers[r-1];t.SEGMENT(a.start,a.length,"")}i.purge(),n=65504==t.SHORT(2)?4+t.SHORT(4):2;r=0;for(var s=o.length;r<s;r++)t.SEGMENT(n,0,o[r].segment),n+=o[r].length;return t.SEGMENT()},get:function(e){for(var t=[],n=0,i=o.length;n<i;n++)o[n].app===e.toUpperCase()&&t.push(o[n].segment);return t},set:function(e,t){var n=[];"string"==typeof t?n.push(t):n=t;for(var i=ii=0,r=o.length;i<r&&(o[i].app===e.toUpperCase()&&(o[i].segment=n[ii],o[i].length=n[ii].length,ii++),!(ii>=n.length));i++);},purge:function(){o=[],t.init(null)}}}}function u(){var e,t,n,a={};function o(t,i){var o,s,d,l,u,f,g,c=e.SHORT(t),p=[],h={};for(o=0;o<c;o++)if(f=t+12*o+2,(d=i[e.SHORT(f)])!==r){switch(l=e.SHORT(f+=2),u=e.LONG(f+=2),f+=4,p=[],l){case 1:case 7:for(u>4&&(f=e.LONG(f)+a.tiffHeader),s=0;s<u;s++)p[s]=e.BYTE(f+s);break;case 2:u>4&&(f=e.LONG(f)+a.tiffHeader),h[d]=e.STRING(f,u-1);continue;case 3:for(u>2&&(f=e.LONG(f)+a.tiffHeader),s=0;s<u;s++)p[s]=e.SHORT(f+2*s);break;case 4:for(u>1&&(f=e.LONG(f)+a.tiffHeader),s=0;s<u;s++)p[s]=e.LONG(f+4*s);break;case 5:for(f=e.LONG(f)+a.tiffHeader,s=0;s<u;s++)p[s]=e.LONG(f+4*s)/e.LONG(f+4*s+4);break;case 9:for(f=e.LONG(f)+a.tiffHeader,s=0;s<u;s++)p[s]=e.SLONG(f+4*s);break;case 10:for(f=e.LONG(f)+a.tiffHeader,s=0;s<u;s++)p[s]=e.SLONG(f+4*s)/e.SLONG(f+4*s+4);break;default:continue}g=1==u?p[0]:p,n.hasOwnProperty(d)&&"object"!=typeof g?h[d]=n[d][g]:h[d]=g}return h}return e=new d,t={tiff:{274:"Orientation",34665:"ExifIFDPointer",34853:"GPSInfoIFDPointer"},exif:{36864:"ExifVersion",40961:"ColorSpace",40962:"PixelXDimension",40963:"PixelYDimension",36867:"DateTimeOriginal",33434:"ExposureTime",33437:"FNumber",34855:"ISOSpeedRatings",37377:"ShutterSpeedValue",37378:"ApertureValue",37383:"MeteringMode",37384:"LightSource",37385:"Flash",41986:"ExposureMode",41987:"WhiteBalance",41990:"SceneCaptureType",41988:"DigitalZoomRatio",41992:"Contrast",41993:"Saturation",41994:"Sharpness"},gps:{0:"GPSVersionID",1:"GPSLatitudeRef",2:"GPSLatitude",3:"GPSLongitudeRef",4:"GPSLongitude"}},n={ColorSpace:{1:"sRGB",0:"Uncalibrated"},MeteringMode:{0:"Unknown",1:"Average",2:"CenterWeightedAverage",3:"Spot",4:"MultiSpot",5:"Pattern",6:"Partial",255:"Other"},LightSource:{1:"Daylight",2:"Fliorescent",3:"Tungsten",4:"Flash",9:"Fine weather",10:"Cloudy weather",11:"Shade",12:"Daylight fluorescent (D 5700 - 7100K)",13:"Day white fluorescent (N 4600 -5400K)",14:"Cool white fluorescent (W 3900 - 4500K)",15:"White fluorescent (WW 3200 - 3700K)",17:"Standard light A",18:"Standard light B",19:"Standard light C",20:"D55",21:"D65",22:"D75",23:"D50",24:"ISO studio tungsten",255:"Other"},Flash:{0:"Flash did not fire.",1:"Flash fired.",5:"Strobe return light not detected.",7:"Strobe return light detected.",9:"Flash fired, compulsory flash mode",13:"Flash fired, compulsory flash mode, return light not detected",15:"Flash fired, compulsory flash mode, return light detected",16:"Flash did not fire, compulsory flash mode",24:"Flash did not fire, auto mode",25:"Flash fired, auto mode",29:"Flash fired, auto mode, return light not detected",31:"Flash fired, auto mode, return light detected",32:"No flash function",65:"Flash fired, red-eye reduction mode",69:"Flash fired, red-eye reduction mode, return light not detected",71:"Flash fired, red-eye reduction mode, return light detected",73:"Flash fired, compulsory flash mode, red-eye reduction mode",77:"Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",79:"Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",89:"Flash fired, auto mode, red-eye reduction mode",93:"Flash fired, auto mode, return light not detected, red-eye reduction mode",95:"Flash fired, auto mode, return light detected, red-eye reduction mode"},ExposureMode:{0:"Auto exposure",1:"Manual exposure",2:"Auto bracket"},WhiteBalance:{0:"Auto white balance",1:"Manual white balance"},SceneCaptureType:{0:"Standard",1:"Landscape",2:"Portrait",3:"Night scene"},Contrast:{0:"Normal",1:"Soft",2:"Hard"},Saturation:{0:"Normal",1:"Low saturation",2:"High saturation"},Sharpness:{0:"Normal",1:"Soft",2:"Hard"},GPSLatitudeRef:{N:"North latitude",S:"South latitude"},GPSLongitudeRef:{E:"East longitude",W:"West longitude"}},{init:function(n){return a={tiffHeader:10},!(n===r||!n.length)&&(e.init(n),65505===e.SHORT(0)&&"EXIF\0"===e.STRING(4,5).toUpperCase()&&(s=a.tiffHeader,e.II(18761==e.SHORT(s)),42===e.SHORT(s+=2)&&(a.IFD0=a.tiffHeader+e.LONG(s+=2),i=o(a.IFD0,t.tiff),a.exifIFD="ExifIFDPointer"in i?a.tiffHeader+i.ExifIFDPointer:r,a.gpsIFD="GPSInfoIFDPointer"in i?a.tiffHeader+i.GPSInfoIFDPointer:r,!0)));var i,s},EXIF:function(){var e;return(e=o(a.exifIFD,t.exif)).ExifVersion&&(e.ExifVersion=String.fromCharCode(e.ExifVersion[0],e.ExifVersion[1],e.ExifVersion[2],e.ExifVersion[3])),e},GPS:function(){var e;return(e=o(a.gpsIFD,t.gps)).GPSVersionID&&(e.GPSVersionID=e.GPSVersionID.join(".")),e},setExif:function(n,r){return("PixelXDimension"===n||"PixelYDimension"===n)&&function(n,r,o){var s,d,l,u=0;if("string"==typeof r){var f=t[n.toLowerCase()];for(hex in f)if(f[hex]===r){r=hex;break}}for(s=a[n.toLowerCase()+"IFD"],d=e.SHORT(s),i=0;i<d;i++)if(l=s+12*i+2,e.SHORT(l)==r){u=l+8;break}return!!u&&(e.LONG(u,o),!0)}("exif",n,r)},getBinary:function(){return e.SEGMENT()}}}n.runtimes.Html5=n.addRuntime("html5",{getFeatures:function(){var i,r,o,s,d,l,u;return r=o=d=l=!1,e.XMLHttpRequest&&(o=!!(i=new XMLHttpRequest).upload,r=!(!i.sendAsBinary&&!i.upload)),r&&(s=!!(i.sendAsBinary||e.Uint8Array&&e.ArrayBuffer),d=!(!File||!File.prototype.getAsDataURL&&!e.FileReader||!s),l=!(!File||!(File.prototype.mozSlice||File.prototype.webkitSlice||File.prototype.slice))),a=n.ua.safari&&n.ua.windows&&navigator.userAgent&&navigator.userAgent.indexOf("Version/4")>0,{html5:r,dragdrop:(u=t.createElement("div"),"draggable"in u||"ondragstart"in u&&"ondrop"in u),jpgresize:d,pngresize:d,multipart:d||!!e.FileReader||!!e.FormData,canSendBinary:s,cantSendBlobInFormData:!(!(n.ua.gecko&&e.FormData&&e.FileReader)||FileReader.prototype.readAsArrayBuffer),progress:o,chunks:l,multi_selection:!(n.ua.safari&&n.ua.windows),triggerDialog:n.ua.gecko&&e.FormData||n.ua.webkit||n.ua.windows}},init:function(i,r){var d,l;function u(e){var t,r,a,s=[],d={};for(r=0;r<e.length;r++)if(!d[(t=e[r]).name]){d[t.name]=!0,a=n.guid(),o[a]=t;var l=new n.File(a,t.fileName||t.name,t.fileSize||t.size);l.nativeFile=t,s.push(l)}s.length&&i.trigger("FilesAdded",s)}(d=this.getFeatures()).html5?(i.upload=function(e){u(e)},i.bind("Init",function(e){var r,a,o,s,d,l,f,g=[],c=e.settings.filters,p=t.body;(r=t.createElement("div")).id=e.id+"_html5_container",n.extend(r.style,{position:"absolute",background:i.settings.shim_bgcolor||"transparent",width:"100px",height:"100px",overflow:"hidden",zIndex:99999,opacity:i.settings.shim_bgcolor?"":0}),r.className="plupload html5",i.settings.container&&(p=t.getElementById(i.settings.container),"static"===n.getStyle(p,"position")&&(p.style.position="relative")),p.appendChild(r);e:for(o=0;o<c.length;o++)for(d=c[o].extensions.split(/,/),s=0;s<d.length;s++){if("*"===d[s]){g=[];break e}(l=n.mimeTypes[d[s]])&&g.push(l)}r.innerHTML='<input id="'+i.id+'_html5"  style="font-size:999px" type="file" accept="'+g.join(",")+'" '+(i.settings.multi_selection&&i.features.multi_selection?'multiple="multiple" aria-label="Upload Multiple Files"':"")+" />",r.scrollTop=100,f=t.getElementById(i.id+"_html5"),i.settings.inputFileClazz&&(f.className+=" "+i.settings.inputFileClazz),e.features.triggerDialog?n.extend(f.style,{position:"absolute",width:"100%",height:"100%"}):n.extend(f.style,{cssFloat:"right",styleFloat:"right"});var h=function(){u(this.files),-1===navigator.appVersion.indexOf("MSIE10")?((f=this.cloneNode(!0)).onchange=h,this.parentNode.replaceChild(f,this)):this.value=""};if(f.onchange=h,a="string"==typeof e.settings.browse_button?t.getElementById(e.settings.browse_button):e.settings.browse_button){var m=e.settings.browse_button_hover,y=e.settings.browse_button_active,S=e.features.triggerDialog?a:r;m&&(n.addEvent(S,"mouseover",function(){n.addClass(a,m)},e.id),n.addEvent(S,"mouseout",function(){n.removeClass(a,m)},e.id)),y&&(n.addEvent(S,"mousedown",function(){n.addClass(a,y)},e.id),n.addEvent(t.body,"mouseup",function(){n.removeClass(a,y)},e.id)),e.features.triggerDialog&&n.addEvent(a,"click",function(n){t.getElementById(e.id+"_html5").click(),n.preventDefault()},e.id)}}),i.bind("PostInit",function(){var e,r=n.getElement(i.settings.drop_element),o=!1;if(r){if(a)return n.addEvent(r,"dragenter",function(e){var a,s;(a=t.getElementById(i.id+"_drop"))||((a=t.createElement("input")).setAttribute("type","file"),a.setAttribute("id",i.id+"_drop"),a.setAttribute("multiple","multiple"),n.addEvent(a,"change",function(){u(this.files),n.removeEvent(a,"change",i.id),a.parentNode.removeChild(a)},i.id),r.appendChild(a),o=!0),n.getPos(r,t.getElementById(i.settings.container)),s=n.getSize(r),"static"===n.getStyle(r,"position")&&n.extend(r.style,{position:"relative"}),n.extend(a.style,{position:"absolute",display:"block",top:0,left:0,width:s.w+"px",height:s.h+"px",opacity:0})},i.id),void n.addEvent(r,"dragleave",function(t){o||(e&&e.parentElement.removeChild(e),e=null),o=!1});n.addEvent(r,"dragover",function(e){e.preventDefault()},i.id),n.addEvent(r,"drop",function(t){if(!$(".disable-attachment-uploader").length){var n=t.dataTransfer;n&&n.files&&u(n.files)}e&&e.parentElement.removeChild(e),e=null,t.preventDefault(),i.settings.stop_propagation&&(t.cancelBubble?t.cancelBubble=!0:t.stopPropagation())},i.id)}}),i.bind("Refresh",function(e){var r,a,o,s,d;(r=t.getElementById(i.settings.browse_button))&&(a=n.getPos(r,t.getElementById(e.settings.container)),o=n.getSize(r),s=t.getElementById(i.id+"_html5_container"),n.extend(s.style,{top:a.y+"px",left:a.x+"px",width:o.w+"px",height:o.h+"px"}),i.features.triggerDialog&&("static"===n.getStyle(r,"position")&&n.extend(r.style,{position:"relative"}),d=parseInt(n.getStyle(r,"z-index"),10),isNaN(d)&&(d=0),n.extend(r.style,{zIndex:d}),n.extend(s.style,{zIndex:d-1})))}),i.bind("CancelUpload",function(){l&&l.abort&&l.abort()}),i.bind("UploadFile",function(t,i){var r,a=t.settings;function u(r){var o=0,s=0,u="FileReader"in e?new FileReader:null;!function f(){var g,c,p,h,m,y,S=t.settings.url;function v(r){var a,u=0,v="----pluploadboundary"+n.guid(),b="\r\n",E="";if((l=new XMLHttpRequest).upload&&(l.upload.onprogress=function(e){i.loaded=Math.min(i.size,s+e.loaded-u),t.trigger("UploadProgress",i)}),l.onreadystatechange=function(){var e,d;if(4==l.readyState){try{e=l.status}catch(t){e=0}if(e>=400)t.trigger("Error",{code:n.HTTP_ERROR,message:n.translate("HTTP Error."),file:i,status:e,xhr:l,response:l.responseText||""});else{if(c){if(d={chunk:o,chunks:c,response:l.responseText,status:e},t.trigger("ChunkUploaded",i,d),s+=m,d.cancelled)return void(i.status=n.FAILED);i.loaded=Math.min(i.size,(o+1)*h)}else i.loaded=i.size;t.trigger("UploadProgress",i),r=g=a=E=null,!c||++o>=c?(i.status=n.DONE,t.trigger("FileUploaded",i,{response:l.responseText,status:e})):f()}}},t.settings.multipart&&d.multipart){if(p.name=i.target_name||i.name,l.open("post",S,!0),n.each(t.settings.headers,function(e,t){l.setRequestHeader(t,e)}),"string"!=typeof r&&e.FormData)return a=new FormData,n.each(n.extend(p,t.settings.multipart_params),function(e,t){a.append(t,e)}),a.append(t.settings.file_data_name,r),void l.send(a);if("string"==typeof r){if(l.setRequestHeader("Content-Type","multipart/form-data; boundary="+v),n.each(n.extend(p,t.settings.multipart_params),function(e,t){E+="--"+v+b+'Content-Disposition: form-data; name="'+t+'"'+b+b,E+=unescape(encodeURIComponent(e))+b}),y=n.mimeTypes[i.name.replace(/^.+\.([^.]+)/,"$1").toLowerCase()]||"application/octet-stream",E+="--"+v+b+'Content-Disposition: form-data; name="'+t.settings.file_data_name+'"; filename="'+unescape(encodeURIComponent(i.name))+'"'+b+"Content-Type: "+y+b+b+r+b+"--"+v+"--"+b,u=E.length-r.length,r=E,l.sendAsBinary)l.sendAsBinary(r);else if(d.canSendBinary){for(var F=new Uint8Array(r.length),x=0;x<r.length;x++)F[x]=255&r.charCodeAt(x);l.send(F.buffer)}return}}S=n.buildUrl(t.settings.url,n.extend(p,t.settings.multipart_params)),l.open("post",S,!0),l.setRequestHeader("Content-Type","application/octet-stream"),r.encoding&&l.setRequestHeader("Content-Encoding",r.encoding),n.each(t.settings.headers,function(e,t){l.setRequestHeader(t,e)}),l.send(r.getData?r.getData():r)}i.status!=n.DONE&&i.status!=n.FAILED&&t.state!=n.STOPPED&&(p={name:i.target_name||i.name},a.chunk_size&&i.size>a.chunk_size&&(d.chunks||"string"==typeof r)?(h=a.chunk_size,c=Math.ceil(i.size/h),m=Math.min(h,i.size-o*h),g="string"==typeof r?r.substring(o*h,o*h+m):function(e,t,n){var i;if(!File.prototype.slice)return(i=File.prototype.webkitSlice||File.prototype.mozSlice)?i.call(e,t,n):null;try{return e.slice(),e.slice(t,n)}catch(i){return e.slice(t,n-t)}}(r,o*h,o*h+m),p.chunk=o,p.chunks=c):(m=i.size,g=r),"string"!=typeof g&&u&&d.cantSendBlobInFormData&&d.chunks&&t.settings.chunk_size?(u.onload=function(){v(u.result)},u.readAsBinaryString(g)):v(g))}()}r=o[i.id],d.jpgresize&&t.settings.resize&&/\.(png|jpg|jpeg)$/i.test(i.name)?s.call(t,i,t.settings.resize,/\.png$/i.test(i.name)?"image/png":"image/jpeg",function(e){e.success?(i.size=e.data.length,u(e.data)):u(r)}):u(r)}),i.bind("Destroy",function(e){var i,r,a=t.body,o={inputContainer:e.id+"_html5_container",inputFile:e.id+"_html5",browseButton:e.settings.browse_button,dropElm:e.settings.drop_element};for(i in o)(r=t.getElementById(o[i]))&&n.removeAllEvents(r,e.id);n.removeAllEvents(t.body,e.id),e.settings.container&&(a=t.getElementById(e.settings.container)),a.removeChild(t.getElementById(o.inputContainer))}),r({success:!0})):r({success:!1})}})}(window,document,plupload);