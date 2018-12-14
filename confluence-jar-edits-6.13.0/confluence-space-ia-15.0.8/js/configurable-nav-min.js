!function(e){AJS.Confluence.ConfigurableNav=AJS.RestfulTable.extend({initialize:function(t){var a=this;a.options=e.extend(!0,t,{model:AJS.RestfulTable.EntryModel,Collection:Backbone.Collection.extend({url:t.resources.self,model:AJS.RestfulTable.EntryModel}),columns:[{id:"title"}]}),a._events=a._events||AJS.RestfulTable.Events,a._event=a._event||AJS.RestfulTable.Events,a.classNames=AJS.RestfulTable.ClassNames,a.dataKeys=AJS.RestfulTable.DataKeys,a.$table=t.$el.addClass(this.classNames.RESTFUL_TABLE).addClass(this.classNames.ALLOW_HOVER).addClass("aui").addClass(a.classNames.LOADING),a.$table.prepend('<colgroup><col span="1" class="aui-restfultable-order"><col span="1"><col span="1" class="aui-restfultable-operations"></colgroup>'),a.$tbody=e("<tbody/>"),a._models=this._createCollection(),a._rowClass=AJS.Confluence.ConfigurableNav.Row,a.editRows=[],a.enableReordering(),a._models.bind("remove",function(t){e.each(a.getRows(),function(e,s){s.model===t&&(s.hasFocus()&&a._createRow&&a._createRow.trigger(a._event.FOCUS),a.removeRow(s))})}),e.get(a.options.resources.all,function(e){a.populate(e)}),Confluence.Sidebar.applyTooltip(".aui-iconfont-add-circle, .aui-iconfont-cross-circle, .aui-iconfont-plan-disabled",{gravity:"ne"})},enableReordering:function(){var t=this;this.$tbody.sortable({handle:"."+this.classNames.DRAG_HANDLE,helper:function(a,s){var n=s.clone(!0).addClass(t.classNames.MOVEABLE);return n.children().each(function(t){e(this).width(s.children().eq(t).width())}),n},start:function(a,s){var n=s.placeholder.find("td");s.item.addClass(t.classNames.MOVEABLE).children().each(function(t){e(this).width(n.eq(t).width())}),s.placeholder.html('<td colspan="'+t.getColumnCount()+'">&nbsp;</td>').css("visibility","visible"),t.getRowFromElement(s.item[0]).trigger(t._event.MODAL)},stop:function(e,a){jQuery(a.item[0]).is(":visible")&&(a.item.removeClass(t.classNames.MOVEABLE).children().attr("style",""),a.placeholder.removeClass(t.classNames.ROW),t.getRowFromElement(a.item[0]).trigger(t._event.MODELESS))},update:function(a,s){var n,i,l={},o=t.getRowFromElement(s.item[0]);o&&(t.options.reverseOrder?(i=s.item.next()).length?(n=t.getRowFromElement(i).model,l.after=n.url()):l.position="First":(i=s.item.prev()).length?(n=t.getRowFromElement(i).model,l.after=n.url()):l.position="First",l.spaceKey=AJS.Meta.get("space-key"),e.ajax({url:o.model.url()+"/move",type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(l),complete:function(){o.hideLoading()},success:function(e){AJS.triggerEvtForInst(t._event.REORDER_SUCCESS,t,[e])},error:function(a){var s=e.parseJSON(a.responseText||a.data);AJS.triggerEvtForInst(t._event.SERVER_ERROR,t,[s,a])}}),o.showLoading())},axis:"y",delay:0,containment:"document",cursor:"move",scroll:!0,zIndex:8e3}),this.$tbody.bind("selectstart mousedown",function(a){return!e(a.target).is("."+t.classNames.DRAG_HANDLE)})}}),AJS.Confluence.ConfigurableNav.ReadView=AJS.RestfulTable.CustomReadView.extend({render:function(e){var t="pinned_attachment"==e.styleClass?"aui-icon aui-icon-small aui-iconfont-attachment":"icon";return _.template('<span class="acs-nav-item-link" title="<%=title%>"><span class="'+t+'"></span><span class="acs-nav-item-label"><%=title%></span></span>',{title:AJS.escapeHtml(e.title)})}}),AJS.Confluence.ConfigurableNav.Row=AJS.RestfulTable.Row.extend({render:function(){var t=this,a=this.model.toJSON(),s=e("<td class='aui-restfultable-operations' />").append(this.renderOperations(a.canHide,a.hidden)),n=e('<td class="'+this.classNames.ORDER+'"/>').append(this.renderDragHandle());return t._event=t._event||t._events,t.$el.attr("data-id",this.model.id),t.$el.append(n),e.each(t.columns,function(s,n){var i,l=e("<td />"),o=a[n.id];o&&t.$el.attr("data-"+n.id,o),i=(new AJS.Confluence.ConfigurableNav.ReadView).render(a),l.append(i),t.$el.append(l)}),t.$el.append(s),a.canHide&&a.hidden&&t.$el.addClass("hidden-link"),t.$el.addClass(this.classNames.ROW+" "+t.classNames.READ_ONLY+" acs-nav-item "+a.styleClass),t.trigger(this._event.RENDER,this.$el,a),t.$el.trigger(this._event.CONTENT_REFRESHED,[t.$el]),t},renderOperations:function(t,a){var s=this,n=e('<a href="#" class="aui-icon aui-icon-small"/>');if(t){function i(e){e.hasClass("aui-iconfont-plan-disabled")?e.attr("data-tooltip",AJS.I18n.getText("sidebar.main.configure.hide.help")).attr("aria-label",AJS.I18n.getText("sidebar.main.configure.hide.help")):e.attr("data-tooltip",AJS.I18n.getText("sidebar.main.configure.show.help")).attr("aria-label",AJS.I18n.getText("sidebar.main.configure.show.help"))}n.addClass(a?"aui-iconfont-add-circle show-link":"aui-iconfont-plan-disabled hide-link").click(function(t){t.preventDefault(),e.ajax({url:s.model.url()+(a?"/show":"/hide"),type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify({spaceKey:AJS.Meta.get("space-key")})}).done(function(){n.closest(".acs-nav-item").toggleClass("hidden-link"),n.toggleClass("aui-iconfont-plan-disabled").toggleClass("aui-iconfont-add-circle"),n.toggleClass("hide-link").toggleClass("show-link"),i(n)})}),i(n)}else n.addClass("aui-iconfont-cross-circle delete-link tipsy-enabled").click(function(t){t.preventDefault(),"hide"!=e(".acs-nav").data("quick-links-state")&&(AJS.trigger("sidebar.disable-tooltip",this),s.destroy())}).attr("data-tooltip",AJS.I18n.getText("sidebar.main.configure.delete.help"));return n},destroy:function(){this.model.destroy({data:{spaceKey:AJS.Meta.get("space-key")}})}})}(AJS.$);