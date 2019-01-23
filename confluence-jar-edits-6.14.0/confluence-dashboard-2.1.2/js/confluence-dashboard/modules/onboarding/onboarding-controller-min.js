define("confluence-dashboard/modules/onboarding/onboarding-view",["module","exports","../../core/shared/base-dialog","confluence-dashboard/soy-templates","configuration","../../utils/feature-discovery","underscore"],function(e,o,i,n,a,r,t){"use strict";function s(e){return e&&e.__esModule?e:{default:e}}var u=s(i).default,d=s(n).default,l=a.pluginKey,c=(a.staticResourceUrl,s(r).default),f=s(t).default;o.default=u.extend({className:"aui-layer aui-dialog2 aui-dialog2-medium confluence-dialog-no-chrome confluence-dialog-centered simple-onboarding",attributes:{id:"dashboard-onboarding-dialog","aria-hidden":!0},ui:{btnShow:".show-onboarding",btnSkip:".skip-onboarding"},events:{"click @ui.btnShow":"showOnboarding","click @ui.btnSkip":"skipOnboarding"},initialize:function(){this.featureDiscovery=c.forPlugin(l),this.featureDiscovery.canShow("dialog")?this.openDialog():this.remove()},onDestroy:function(){this.markAsSkipOnBoarding(),this.featureDiscovery=null},serializeData:function(){return{fullUsername:this.options.currentUserFullName}},getTemplate:function(){return d.Onboarding.newSimplifyOnboarding},showOnboarding:function(){this.featureDiscovery.markDiscoveredSafe("dialog"),this.closeDialog(),this.options.onConfirm&&f.isFunction(this.options.onConfirm)&&this.options.onConfirm()},markAsSkipOnBoarding:function(){this.featureDiscovery&&(this.featureDiscovery.markDiscoveredSafe("dialog"),this.featureDiscovery.markDiscoveredSafe("tips"))},skipOnboarding:function(){this.markAsSkipOnBoarding(),this.closeDialog()}}),e.exports=o.default}),define("confluence-dashboard/modules/onboarding/onboarding-controller",["../../utils/event-manager","./onboarding-view","../../utils/module-starter","confluence/meta","../../utils/conditions","ajs","configuration","../../utils/feature-discovery"],function(e,o,i,n,a,r,t,s){"use strict";function u(e){return e&&e.__esModule?e:{default:e}}var d=e.Commands,l=u(o).default,c=u(i).default,f=u(n).default,g=u(a).default,h=u(r).default,m=t.pluginKey,b=u(s).default,p=function(){var e=f.getBoolean("is-confluence-admin"),o=f.getBoolean("is-new-user"),i=f.getBoolean("show-dashboard-onboarding-dialog"),n=(f.getBoolean("show-dashboard-onboarding-tips"),f.get("current-user-fullname")),a={isNew:o};if(i&&!e){var r=new l({currentUserFullName:n,isNewUser:o,isAdmin:e,onConfirm:function(){showTips(a)}});d.execute("main-app:showDialog",r)}o&&b.forPlugin(m).markDiscovered("transition-saved-for-later")};h.toInit(function(){g.canShowDashboard()&&c.register(p)})}),require(["confluence-dashboard/modules/onboarding/onboarding-controller"]);