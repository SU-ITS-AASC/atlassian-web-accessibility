define("confluence-dashboard/modules/onboarding/onboarding-saved-for-later-view",["module","exports","./onboarding-tooltip-view"],function(e,o,t){"use strict";var i=function(e){return e&&e.__esModule?e:{default:e}}(t).default;o.default=i.extend({showNext:function(){},skipTooltips:function(){this.featureDiscovery.markDiscovered(this.tipId),this.close(),this.destroy()}}),e.exports=o.default});