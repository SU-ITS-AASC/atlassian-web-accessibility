define("confluence-dashboard/modules/onboarding/onboarding-saved-for-later-view",["module","exports","./onboarding-tooltip-view"],function(e,o,t){"use strict";var i,s=((i=t)&&i.__esModule?i:{default:i}).default;o.default=s.extend({showNext:function(){},skipTooltips:function(){this.featureDiscovery.markDiscovered(this.tipId),this.close(),this.destroy()}}),e.exports=o.default});