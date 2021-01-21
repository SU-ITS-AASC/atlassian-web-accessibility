(window.__auiJsonp=window.__auiJsonp||[]).push([["aui.component.form.single-select"],{"/XCG":function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=a(i("+x/D")),u=a(i("HH5i")),s=a(i("vbuG")),l=a(i("jEnx"));function a(e){return e&&e.__esModule?e:{default:e}}function o(e,t){return e+"-"+t}function r(e,t){this.el=e,this.anchor=t}function c(e){(0,n.default)(e).find(".aui-select-active").removeClass("aui-select-active")}r.prototype={render:function(e,t,i){this.currListId=i;var n="";if(e.length){var s=t;e.forEach(function(e){var t=e.getLabel(),l=e.get("img-src"),a=l?'<img src="'+l+'"/>':"",r=e.get("new-value")?" (<em>"+u.default.getText("aui.select.new.value")+"</em>)":"";n+='<li role="option" class="aui-select-suggestion" id="'+o(i,s)+'">'+a+t+r+"</li>",s++}),t?this.el.querySelector("ul").innerHTML+=n:this.el.querySelector("ul").innerHTML=n}else t||(this.el.querySelector("ul").innerHTML='<li role="option" class="aui-select-no-suggestions">'+u.default.getText("aui.select.no.suggestions")+"</li>");return this},setActive:function(e){c(this.el),(0,n.default)(this.el).find("#"+o(this.currListId,e)).addClass("aui-select-active")},getActive:function(){return this.el.querySelector(".aui-select-active")},show:function(){!function(e){(0,n.default)(e.el).css("min-width",(0,n.default)(e.anchor).outerWidth())}(this),(0,l.default)(this.el).show(),function(e){e.anchor&&!e._auiAlignment&&(e._auiAlignment=new s.default(e.el,e.anchor,{flipContainer:"scrollParent",positionFixed:!1,preventOverflow:!1})),e._auiAlignment&&(e._auiAlignment.enable(),e._auiAlignment.scheduleUpdate())}(this)},hide:function(){c(this.el),(0,l.default)(this.el).hide(),function(e){e._auiAlignment&&e._auiAlignment.disable()}(this)},destroy:function(){this.hide(),function(e){e._auiAlignment&&(e._auiAlignment.destroy(),delete e._auiAlignment)}(this),delete this.currListId},isVisible:function(){return(0,n.default)(this.el).is(":visible")}},t.default=r,e.exports=t.default},Jxuy:function(e,t,i){},Myh4:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){return e&&e.__esModule?e:{default:e}}(i("qT0E"));t.default=n.default.Model.extend({idAttribute:"label",getLabel:function(){return this.get("label")||this.get("value")}}),e.exports=t.default},cv7j:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=s(i("4dFR")),u=s(i("l3AF"));function s(e){return e&&e.__esModule?e:{default:e}}t.default=(0,n.default)("aui-option",{created:function(e){Object.defineProperty(e,"value",{get:function(){return e.getAttribute("value")||(0,u.default)(this.textContent)},set:function(t){e.setAttribute("value",t)}})},prototype:{serialize:function(){var e={};return this.hasAttribute("img-src")&&(e["img-src"]=(0,u.default)(this.getAttribute("img-src"))),e.value=this.value,e.label=(0,u.default)(this.textContent),e}}}),e.exports=t.default},fmxa:function(e,t,i){"use strict";function n(){this._suggestions=[],this._activeIndex=-1}Object.defineProperty(t,"__esModule",{value:!0}),n.prototype={onChange:function(){},onHighlightChange:function(){},get:function(e){return this._suggestions[e]},set:function(e){var t=this._suggestions;return this._suggestions=e||[],this.onChange(t),this},getNumberOfResults:function(){return this._suggestions.length},setHighlighted:function(e){if(e)for(var t=0;t<this._suggestions.length;t++)this._suggestions[t].id===e.id&&this.highlight(t);return this},highlight:function(e){return this._activeIndex=e,this.onHighlightChange(),this},highlightPrevious:function(){var e=this._activeIndex,t=0===e?e:e-1;return this.highlight(t),this},highlightNext:function(){var e=this._activeIndex,t=e===this._suggestions.length-1?e:e+1;return this.highlight(t),this},highlighted:function(){return this.get(this._activeIndex)},highlightedIndex:function(){return this._activeIndex}},t.default=n,e.exports=t.default},lotK:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.SelectEl=void 0;var n=i("ucjH");Object.defineProperty(t,"SelectEl",{enumerable:!0,get:function(){return function(e){return e&&e.__esModule?e:{default:e}}(n).default}}),i("6fSn"),i("Jxuy")},tDSu:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){return e&&e.__esModule?e:{default:e}}(i("gjsO"));t.default=(0,n.default)('\n    <input type="text" class="text" autocomplete="off" role="combobox" aria-autocomplete="list" aria-haspopup="true" aria-expanded="false">\n    <select></select>\n    <datalist>\n        <content select="aui-option"></content>\n    </datalist>\n    <button class="aui-button" role="button" tabindex="-1" type="button"></button>\n    <div class="aui-popover" role="listbox" data-aui-alignment="bottom left">\n        <ul class="aui-optionlist" role="presentation"></ul>\n    </div>\n    <div class="aui-select-status assistive" aria-live="polite" role="status"></div>\n'),e.exports=t.default},ucjH:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.bindSelectMousedown=N;var n=k(i("+x/D"));i("aGv7"),i("oSOL");var u=k(i("HH5i")),s=k(i("cv7j")),l=k(i("TmQU")),a=k(i("P3rJ")),o=k(i("KloK")),r=k(i("+ay7")),c=k(i("Jqxc")),d=k(i("4dFR")),f=k(i("TK3y")),h=k(i("Myh4")),g=k(i("fmxa")),p=k(i("/XCG")),_=k(i("tDSu")),v=k(i("OEua")),b=i("LTUc"),y=i("I7um");function k(e){return e&&e.__esModule?e:{default:e}}var m=-1,w=-1,x=20;function A(e){e._select.selectedIndex=m,function(e){e._input.removeAttribute("style"),(0,n.default)(e._input).removeClass("aui-select-has-inline-image")}(e)}function M(e){return e._suggestionModel.getNumberOfResults()}function S(e){setTimeout(e,50)}function C(e,t){return 0===e.get("label").toLowerCase().indexOf(t.toLowerCase())}function q(e){e._suggestionsView.hide(),e._input.setAttribute("aria-expanded","false")}function I(e){var t=M(e)?0:w;e._suggestionModel.highlight(t),q(e)}function H(e,t,i){e._autoHighlight=t,void 0===i&&(i=e._input.value),e._progressiveDataSet.query(i)}function D(e){var t=e._suggestionModel.highlighted()&&e._suggestionModel.highlighted().get("img-src");t&&function(e,t){(0,n.default)(e._input).addClass("aui-select-has-inline-image"),e._input.setAttribute("style","background-image: url("+t+")")}(e,t)}function E(e,t){if(t){var i=document.createElement("option"),n=e._select,u=t.get("value")||t.get("label");i.setAttribute("selected",""),i.setAttribute("value",u),i.textContent=t.getLabel(),e._input.value=i.textContent,n.innerHTML="",n.options.add(i),n.dispatchEvent(new a.default("change",{bubbles:!0}))}}function O(e){E(e,e._suggestionModel.highlighted()),D(e),I(e)}function P(e){return new h.default(e.serialize())}function T(e){for(var t=[],i=0;i<e._datalist.children.length;i++){var n=e._datalist.children[i];t.push(P(n))}return t}function V(e){var t=e._dropdown.querySelector(".aui-select-active");return t&&t.id}function L(e,t){return n.default.map(t,function(e){return e.id}).indexOf(e)}function j(e){e._progressiveDataSet=new c.default(T(e),{model:h.default,matcher:C,queryEndpoint:e._queryEndpoint,maxResults:x}),e._isSync=!e._queryEndpoint,e._progressiveDataSet.on("activity",function(){e._progressiveDataSet.activeQueryCount&&!e._isSync?(!function(e){e._button.isBusy()||(e._button.busy(),e._input.setAttribute("aria-busy","true"),e._dropdown.setAttribute("aria-busy","true"))}(e),(0,f.default)(e).set("should-flag-new-suggestions",!1)):(!function(e){e._button.idle(),e._input.setAttribute("aria-busy","false"),e._dropdown.setAttribute("aria-busy","false")}(e),(0,f.default)(e).set("should-flag-new-suggestions",!0))}),e._progressiveDataSet.on("respond",function(t){var i;if(!t.query||e._input.value)if((0,f.default)(e).get("should-cancel-response"))e._progressiveDataSet.activeQueryCount||(0,f.default)(e).set("should-cancel-response",!1);else{t.query||(t.results=T(e));var n=-1!==L(e._input.value,t.results),l=!e._input.value;if(!e.hasAttribute("can-create-values")||n||l||t.results.push(function(e){var t=new s.default;t.setAttribute("value",e._input.value);var i=P(t);return i.set("new-value",!0),i}(e)),!(0,f.default)(e).get("should-include-selected")){var a=L(e.value,t.results);a>=0&&t.results.splice(a,1)}!function(e,t){e._suggestionModel.set(),e._suggestionModel.set(t.results)}(e,t),i=e._suggestionModel.highlighted()||t.results[0],e._autoHighlight&&(e._suggestionModel.setHighlighted(i),S(function(){e._input.setAttribute("aria-activedescendant",V(e))})),e._input.setAttribute("aria-expanded","true"),!e._isSync&&e._suggestionsView.getActive()&&(0,f.default)(e).get("should-flag-new-suggestions")&&(e.querySelector(".aui-select-status").innerHTML=u.default.getText("aui.select.new.suggestions")),e._suggestionsView.show(),e._autoHighlight&&S(function(){e._input.setAttribute("aria-activedescendant",V(e))})}})}function N(e){var t=!1;(0,n.default)(document).on("aui-close-layers-on-outer-click.single-select",function(e){t&&(e.preventDefault(),t=!1)}),(0,n.default)(e._dropdown).on("mousedown","li",function(i){if(!M(e))return!1;e._suggestionModel.highlight((0,n.default)(i.target).index()),O(e),e._suggestionsView.hide(),(0,n.default)(e).closest(".aui-layer").length>0&&(t=!0),e._input.removeAttribute("aria-activedescendant")})}function U(e){var t=e.value?"":e._input.value,i=""===e._input.value;(0,f.default)(e).set("should-include-selected",i),H(e,!0,t)}function F(e){(function(e){return e._progressiveDataSet.activeQueryCount>0})(e)&&(0,f.default)(e).set("should-cancel-response",!0)}function J(e){if(e._select.selectedIndex>=0)return e._select.options[e._select.selectedIndex].textContent}function R(e){F(e),function(e){var t=!e.hasAttribute("no-empty-values"),i=!e._input.value,n=e._input.value!==J(e);if(i||n)if(t)A(e);else{var u=J(e);void 0===u?A(e):e._input.value=u}}(e),function(e){e._suggestionModel.highlight(w)}(e),q(e)}var G=(0,d.default)("aui-select",{template:_.default,created:function(e){e._listId=(0,v.default)(),e._input=e.querySelector("input"),e._select=e.querySelector("select"),e._dropdown=e.querySelector(".aui-popover"),e._datalist=e.querySelector("datalist"),e._button=e.querySelector("button"),e._suggestionsView=new p.default(e._dropdown,e._input),e._suggestionModel=new g.default,e._suggestionModel.onChange=function(t){var i=[];e._suggestionModel._suggestions.forEach(function(e){t.some(function(t){return e.id===t.id})||i.push(e)}),e._suggestionsView.render(i,t.length,e._listId)},e._suggestionModel.onHighlightChange=function(){var t=e._suggestionModel.highlightedIndex();e._suggestionsView.setActive(t),e._input.setAttribute("aria-activedescendant",V(e))}},attached:function(e){d.default.init(e),j(e),function(e){e._dropdown.id=e._listId,e.querySelector("button").setAttribute("aria-controls",e._listId)}(e),e._input.setAttribute("aria-controls",e._listId),e.setAttribute("tabindex","-1"),function(e){(0,n.default)(e._dropdown).on("mouseover","li",function(t){M(e)&&e._suggestionModel.highlight((0,n.default)(t.target).index())})}(e),N(e),function(e){var t=e._datalist.querySelector("aui-option[selected]");t&&E(e,P(t))}(e),I(e),D(e)},detached:function(e){(0,n.default)(document).off("aui-close-layers-on-outer-click"),(0,y.ifGone)(e).then(function(){q(e),e._suggestionsView.destroy()})},attributes:{id:function(e,t){e.id&&(e.querySelector("input").id=t.newValue+b.INPUT_SUFFIX)},name:function(e,t){e.querySelector("select").setAttribute("name",t.newValue)},placeholder:function(e,t){e.querySelector("input").setAttribute("placeholder",t.newValue)},src:function(e,t){e._queryEndpoint=t.newValue}},events:{"blur input":function(e){R(e)},"mousedown button":function(e){document.activeElement===e._input&&"false"===e._dropdown.getAttribute("aria-hidden")&&(0,f.default)(e).set("prevent-open-on-button-click",!0)},"click input":function(e){U(e)},"click button":function(e){var t=(0,f.default)(e);t.get("prevent-open-on-button-click")?t.set("prevent-open-on-button-click",!1):((0,f.default)(e).set("button-clicked-prevent-dropdown-hide",!0),e.focus())},input:function(e){e._input.value?((0,f.default)(e).set("should-include-selected",!0),H(e,!0)):(0,f.default)(e).get("button-clicked-prevent-dropdown-hide")?(0,f.default)(e).set("button-clicked-prevent-dropdown-hide",!1):q(e)},"keydown input":function(e,t){var i=e._input.value,n=!1;if(t.keyCode===r.default.ESCAPE)return F(e),void q(e);e._suggestionsView.isVisible()&&M(e)?t.keyCode===r.default.ENTER?(F(e),O(e),t.preventDefault()):t.keyCode===r.default.TAB?(!function(e){e._suggestionsView.isVisible()&&O(e)}(e),n=!0):t.keyCode===r.default.UP?(e._suggestionModel.highlightPrevious(),t.preventDefault()):t.keyCode===r.default.DOWN&&(e._suggestionModel.highlightNext(),t.preventDefault()):t.keyCode!==r.default.UP&&t.keyCode!==r.default.DOWN||(U(e),t.preventDefault()),n=n||t.defaultPrevented,setTimeout(function(){e._input.value===i||n||e.dispatchEvent(new a.default("input",{bubbles:!0}))},0)}},prototype:{get value(){var e=this._select.options[this._select.selectedIndex];return e?e.value:""},set value(e){if(""===e)!function(e){e._input.value="",e._select.innerHTML=""}(this);else if(e){var t=this._progressiveDataSet,i=t.findWhere({value:e})||t.findWhere({label:e});!i&&this.hasAttribute("can-create-values")&&(i=new h.default({value:e,label:e})),E(this,i)}return this},get displayValue(){return this._input.value},blur:function(){return this._input.blur(),R(this),this},focus:function(){return this._input.focus(),U(this),this}}});(0,l.default)("aui/select",G),(0,o.default)("select",G),t.default=G}},[["lotK","runtime","aui.splitchunk.vendors--e54c7c7304","aui.splitchunk.vendors--b47d4b691d","aui.splitchunk.vendors--9c48cc20a9","aui.splitchunk.vendors--084821f40b","aui.splitchunk.vendors--d2297af84a","aui.splitchunk.vendors--20e849aab3","aui.splitchunk.172ffb6da7","aui.splitchunk.b0831cc7d0","aui.splitchunk.572a8bf5cd","aui.splitchunk.087aba7911","aui.splitchunk.fbd1a5ab27","aui.splitchunk.d49cf794d2","aui.splitchunk.54d3f16c20","aui.splitchunk.e54c7c7304","aui.splitchunk.336ae4f9e7","aui.splitchunk.1659111a3c","aui.splitchunk.f5828f5ab9","aui.splitchunk.fb15cffa72","aui.splitchunk.56dfb54d0c","aui.splitchunk.f673ef53ac","aui.splitchunk.8659b532c1","aui.splitchunk.9c48cc20a9","aui.splitchunk.908fe798b4","aui.splitchunk.792781e698","aui.splitchunk.462ee5f9ef","aui.splitchunk.d0110a864f","aui.splitchunk.afa5039e04","aui.splitchunk.bff3715233","aui.splitchunk.c750721820","aui.splitchunk.6d6f245ed3","aui.splitchunk.382c9b559f","aui.splitchunk.ed86a19e01","aui.splitchunk.50dca3e042","aui.splitchunk.084821f40b","aui.splitchunk.baa83dbaf9","aui.splitchunk.e7c127e2cc","aui.splitchunk.e6408ec84b","aui.splitchunk.20e849aab3","aui.splitchunk.86ad04cc86","aui.splitchunk.4331a05956","aui.splitchunk.489a76bc13","aui.splitchunk.af1935061c"]]]);