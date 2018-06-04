define("confluence-dashboard/modules/onboarding/onboarding-view",["module","exports","../../core/shared/base-dialog","confluence-dashboard/soy-templates","configuration","../../utils/feature-discovery","underscore"],function(e,i,t,o,n,s,r){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}var d=a(t).default,l=a(o).default,u=n.pluginKey,c=(n.staticResourceUrl,a(s).default),f=a(r).default;i.default=d.extend({attributes:{id:"dashboard-onboarding-dialog","aria-hidden":!0},ui:{btnShow:".show-onboarding",btnSkip:".skip-onboarding"},events:{"click @ui.btnShow":"showOnboarding","click @ui.btnSkip":"skipOnboarding"},initialize:function(){this.featureDiscovery=c.forPlugin(u),this.featureDiscovery.canShow("dialog")?this.openDialog():this.remove()},onDestroy:function(){this.featureDiscovery=null},getTemplate:function(){return this.options.isNewUser?l.Onboarding.newUser:l.Onboarding.existingUser},showOnboarding:function(){this.featureDiscovery.markDiscoveredSafe("dialog"),this.closeDialog(),this.options.onConfirm&&f.isFunction(this.options.onConfirm)&&this.options.onConfirm()},skipOnboarding:function(){this.featureDiscovery.markDiscoveredSafe("dialog"),this.featureDiscovery.markDiscoveredSafe("tips"),this.closeDialog()}}),e.exports=i.default}),define("confluence-dashboard/modules/onboarding/onboarding-tooltip-view",["module","exports","marionette","configuration","jquery","../../utils/feature-discovery","../../utils/ensure-component","../../utils/event-manager"],function(e,i,t,o,n,s,r,a){"use strict";function d(e){return e&&e.__esModule?e:{default:e}}var l=t.ItemView,u=o.pluginKey,c=d(n).default,f=d(s).default,p=d(r).default,h=a.EventManager;i.default=l.extend({className:"onboarding-tooltip-wrapper",initialize:function(){this.featureDiscovery=f.forPlugin(u),this.target=this.options.placedNextTo,this.tipId=this.options.tipId,this.addToScreen()},addToScreen:function(){var e=this;if(this.featureDiscovery.canShow(this.tipId)){c(this.target).append(this.render().el);var i=this.$(".onboarding-tooltips");p(i[0]).then(function(){i.find(".btn-next").on("click",e.showNext.bind(e)),i.find(".btn-skip").on("click",e.skipTooltips.bind(e))}),this.listenTo(h,"sidebar:collapse",this.close.bind(this)),this.listenTo(h,"window:scroll",this.close.bind(this)),this.inlineDialog=i[0]}else this.destroy()},open:function(){var e=this;p(this.inlineDialog).then(function(){e.inlineDialog.open=!0})},close:function(){var e=this;p(this.inlineDialog).then(function(){e.inlineDialog.open=!1})},showNext:function(){this.featureDiscovery.markDiscovered(this.tipId),this.close(),this.trigger("next",this),this.destroy()},skipTooltips:function(){this.trigger("skip",this)},onDestroy:function(){var e=this;this.inlineDialog&&p(this.inlineDialog).then(function(){return e.inlineDialog.remove()})}}),e.exports=i.default}),define("confluence-dashboard/modules/onboarding/onboarding-tooltips-manager",["module","exports","marionette","confluence-dashboard/soy-templates","./onboarding-tooltip-view","underscore","ajs","configuration","../../utils/feature-discovery","window"],function(e,i,t,o,n,s,r,a,d,l){"use strict";function u(e){return e&&e.__esModule?e:{default:e}}var c=t.Object,f=u(o).default,p=u(n).default,h=u(s).default,g=(u(r).default,a.pluginKey),v=u(d).default,b=u(l).default;i.default=c.extend({initialize:function(){b.require(["aui/inline-dialog2"]),this.featureDiscovery=v.forPlugin(g)},getTooltipDefinitions:function(e){return[{element:".sidebar-discover",tipId:"tour-step-sidebar",template:f.Onboarding[e.isNew?"newUserStep1":"existingUserStep1"]},{element:".sidebar-spaces",tipId:"tour-step-favourite-spaces",template:f.Onboarding[e.isNew?"newUserStep2":"existingUserStep2"]}]},showTips:function(e){var i=this.getTooltipDefinitions(e);this.createSteps(i)},createSteps:function(e){var i=this;return!!e&&(!!this.featureDiscovery.canShow("tips")&&(this.steps=[],h.each(e,function(e){i.featureDiscovery.canShow(e.tipId)&&i.steps.push(i.createTooltip(e))}),void this.openFirst()))},createTooltip:function(e){var i=new p({tipId:e.tipId,placedNextTo:e.element,template:e.template,templateHelpers:{id:e.tipId}});return this.listenTo(i,"skip",this.onSkip),this.listenTo(i,"next",this.onNext),i},openFirst:function(){this.steps.length>0&&this.steps[0].open()},onSkip:function(){this.featureDiscovery.markDiscovered("tips"),h.invoke(this.steps,"destroy"),this.destroy()},onNext:function(e){var i=this.steps.indexOf(e);this.steps.splice(i,1),this.openFirst()}}),e.exports=i.default}),define("confluence-dashboard/modules/onboarding/onboarding-saved-for-later-view",["module","exports","./onboarding-tooltip-view"],function(e,i,t){"use strict";var o=function(e){return e&&e.__esModule?e:{default:e}}(t).default;i.default=o.extend({showNext:function(){},skipTooltips:function(){this.featureDiscovery.markDiscovered(this.tipId),this.close(),this.destroy()}}),e.exports=i.default}),define("confluence-dashboard/modules/onboarding/onboarding-controller",["../../utils/event-manager","./onboarding-view","./onboarding-tooltips-manager","../../utils/module-starter","confluence/meta","../../utils/conditions","ajs","confluence-dashboard/soy-templates","./onboarding-saved-for-later-view","configuration","../../utils/feature-discovery"],function(e,i,t,o,n,s,r,a,d,l,u){"use strict";function c(e){return e&&e.__esModule?e:{default:e}}function f(e){(new g).showTips(e)}var p=e.Commands,h=c(i).default,g=c(t).default,v=c(o).default,b=c(n).default,m=c(s).default,w=c(r).default,D=c(a).default,y=c(d).default,x=l.pluginKey,k=c(u).default,S=function(){var e=b.getBoolean("is-new-user"),i=b.getBoolean("show-dashboard-onboarding-dialog"),t=b.getBoolean("show-dashboard-onboarding-tips"),o={isNew:e};if(i){var n=new h({isNewUser:e,onConfirm:function(){f(o)}});p.execute("main-app:showDialog",n)}else if(t)f(o);else if(!e)new y({tipId:"transition-saved-for-later",placedNextTo:".nav-item-container-starred",template:D.Onboarding.transitionSavedForLater,templateHelpers:{id:"transition-saved-for-later"}});e&&k.forPlugin(x).markDiscovered("transition-saved-for-later")};w.toInit(function(){m.canShowDashboard()&&v.register(S)})}),require(["confluence-dashboard/modules/onboarding/onboarding-controller"]);