(function ($) {
    AJS.Confluence.ConfigurableNav = AJS.RestfulTable.extend({
        initialize: function (options) {
            var instance = this;

            instance.options = $.extend(true, options, {
                model: AJS.RestfulTable.EntryModel,
                Collection: Backbone.Collection.extend({
                    url: options.resources.self,
                    model: AJS.RestfulTable.EntryModel
                }),
                columns: [{ id: "title" }]
            });

            // faster lookup
            // Versions of RESTful table prior to Confluence 5.5 use _events property
            // Versions of RESTful table from Confluence 5.5 and up use _event property
            // Aliasing both here to support current version and backwards compatibility
            instance._events = instance._events || AJS.RestfulTable.Events;
            instance._event = instance._event || AJS.RestfulTable.Events;
            instance.classNames = AJS.RestfulTable.ClassNames;
            instance.dataKeys = AJS.RestfulTable.DataKeys;

            instance.$table = options.$el
                .addClass(this.classNames.RESTFUL_TABLE)
                .addClass(this.classNames.ALLOW_HOVER)
                .addClass("aui")
                .addClass(instance.classNames.LOADING);
            instance.$table.prepend('<colgroup><col span="1" class="aui-restfultable-order"><col span="1"><col span="1" class="aui-restfultable-operations"></colgroup>');
            instance.$tbody = $("<tbody/>");

            // create a new Backbone collection to represent rows (http://documentcloud.github.com/backbone/#Collection)
            instance._models = this._createCollection();
            instance._rowClass = AJS.Confluence.ConfigurableNav.Row;
            instance.editRows = []; // keep track of rows that are being edited concurrently (e.g. during reorder)

            instance.enableReordering();

            // when a model is removed from the collection, remove it from the viewport also
            instance._models.bind("remove", function (model) {
                $.each(instance.getRows(), function (i, row) {
                    if (row.model === model) {
                        if (row.hasFocus() && instance._createRow) {
                            instance._createRow.trigger(instance._event.FOCUS);
                        }
                        instance.removeRow(row);
                    }
                });
            });

            $.get(instance.options.resources.all, function (entries) {
                instance.populate(entries);
            });

            Confluence.Sidebar.applyTooltip('.aui-iconfont-add-circle, .aui-iconfont-cross-circle, .aui-iconfont-plan-disabled', {gravity: 'ne'});
        },
        // AUI implementation for reordering rows (extracted out of initialize function and mostly left alone)
        enableReordering: function() {
            var instance = this;
            this.$tbody.sortable({
                handle: "." + this.classNames.DRAG_HANDLE,
                helper: function(e, elt) {
                    var helper =  elt.clone(true).addClass(instance.classNames.MOVEABLE);
                    helper.children().each(function (i) {
                        $(this).width(elt.children().eq(i).width());
                    });
                    return helper;
                },
                start: function (event, ui) {
                    var $this = ui.placeholder.find("td");
                    // Make sure that when we start dragging widths do not change
                    ui.item
                        .addClass(instance.classNames.MOVEABLE)
                        .children().each(function (i) {
                            $(this).width($this.eq(i).width());
                        });

                    // Add a <td> to the placeholder <tr> to inherit CSS styles.
                    ui.placeholder
                        .html('<td colspan="' + instance.getColumnCount() + '">&nbsp;</td>')
                        .css("visibility", "visible");

                    // Stop hover effects etc from occuring as we move the mouse (while dragging) over other rows
                    instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODAL);
                },
                stop: function (event, ui) {
                    if (jQuery(ui.item[0]).is(":visible")) {
                        ui.item
                            .removeClass(instance.classNames.MOVEABLE)
                            .children().attr("style", "");

                        ui.placeholder.removeClass(instance.classNames.ROW);

                        // Return table to a normal state
                        instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODELESS);
                    }
                },
                update: function (event, ui) {
                    var nextModel,
                        nextRow,
                        data = {},
                        row = instance.getRowFromElement(ui.item[0]);

                    if (row) {
                        if (instance.options.reverseOrder) {
                            // Everything is backwards here because on the client we are in reverse order.
                            nextRow = ui.item.next();
                            if (!nextRow.length) {
                                data.position = "First";
                            } else {
                                nextModel = instance.getRowFromElement(nextRow).model;
                                data.after = nextModel.url();
                            }
                        } else {
                            nextRow = ui.item.prev();
                            if (!nextRow.length) {
                                data.position = "First";
                            } else {
                                nextModel = instance.getRowFromElement(nextRow).model;
                                data.after = nextModel.url();
                            }
                        }
                        data.spaceKey = AJS.Meta.get('space-key');

                        $.ajax({
                            url: row.model.url() + "/move",
                            type: "POST",
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            complete: function () {
                                // hides loading indicator (spinner)
                                row.hideLoading();
                            },
                            success: function (xhr) {
                                AJS.triggerEvtForInst(instance._event.REORDER_SUCCESS, instance, [xhr]);
                            },
                            error: function (xhr) {
                                var responseData = $.parseJSON(xhr.responseText || xhr.data);
                                AJS.triggerEvtForInst(instance._event.SERVER_ERROR, instance, [responseData, xhr]);
                            }
                        });

                        // shows loading indicator (spinner)
                        row.showLoading();
                    }
                },
                axis: "y",
                delay: 0,
                containment: "document",
                cursor: "move",
                scroll: true,
                zIndex: 8000
            });

            // Prevent text selection while reordering.
            this.$tbody.bind("selectstart mousedown", function (event) {
                return !$(event.target).is("." + instance.classNames.DRAG_HANDLE);
            });
        }
    });

    AJS.Confluence.ConfigurableNav.ReadView = AJS.RestfulTable.CustomReadView.extend({
        render: function (link) {
            var iconClass = link.styleClass == 'pinned_attachment' ? 'aui-icon aui-icon-small aui-iconfont-attachment' : 'icon';
            return _.template(
                '<span class="acs-nav-item-link" title="<%=title%>">' +
                    '<span class="' + iconClass + '"></span>' +
                    '<span class="acs-nav-item-label"><%=title%></span>' +
                '</span>'
            , { title: AJS.escapeHtml(link.title)});
        }
    });

    AJS.Confluence.ConfigurableNav.Row = AJS.RestfulTable.Row.extend({
        render: function () {
            var instance = this,
                renderData = this.model.toJSON(),
                $opsCell = $("<td class='aui-restfultable-operations' />").append(this.renderOperations(renderData.canHide, renderData.hidden)),
                $reorderCell = $('<td class="' + this.classNames.ORDER + '"/>').append(this.renderDragHandle());

            // Versions of RESTful table prior to Confluence 5.5 use _events property
            // Versions of RESTful table from Confluence 5.5 and up use _event property
            // Aliasing both here to support current version and backwards compability
            instance._event = instance._event || instance._events;

            instance.$el.attr("data-id", this.model.id); // helper for webdriver testing
            instance.$el.append($reorderCell);

            $.each(instance.columns, function (i, column) {
                var contents,
                    $cell = $("<td />"),
                    value = renderData[column.id];

                if (value) {
                    instance.$el.attr("data-" + column.id, value); // helper for webdriver testing
                }

                contents = new AJS.Confluence.ConfigurableNav.ReadView().render(renderData);

                $cell.append(contents);
                instance.$el.append($cell);
            });

            instance.$el.append($opsCell);
            renderData.canHide && renderData.hidden && instance.$el.addClass('hidden-link');
            instance.$el.addClass(this.classNames.ROW + " " + instance.classNames.READ_ONLY + " acs-nav-item " + renderData.styleClass);

            instance.trigger(this._event.RENDER, this.$el, renderData);
            instance.$el.trigger(this._event.CONTENT_REFRESHED, [instance.$el]);
            return instance;
        },
        renderOperations: function (canHide, hidden) {
            var instance = this,
                $operations = $('<a href="#" class="aui-icon aui-icon-small"/>');

            if (canHide) {
                function setTooltip($link) {
                    if ($link.hasClass('aui-iconfont-plan-disabled')) {
                        $link.attr('data-tooltip', AJS.I18n.getText('sidebar.main.configure.hide.help'));
                    } else {
                        $link.attr('data-tooltip', AJS.I18n.getText('sidebar.main.configure.show.help'));
                    }
                }

                $operations.addClass(hidden ? 'aui-iconfont-add-circle show-link' : 'aui-iconfont-plan-disabled hide-link').click(function(e) {
                    e.preventDefault();
                    $.ajax({
                        url: instance.model.url() + (hidden ? '/show' : '/hide'),
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify({spaceKey: AJS.Meta.get('space-key')})
                    }).done(function() {
                        $operations.closest('.acs-nav-item').toggleClass('hidden-link');
                        $operations.toggleClass('aui-iconfont-plan-disabled').toggleClass('aui-iconfont-add-circle');
                        $operations.toggleClass('hide-link').toggleClass('show-link');
                        setTooltip($operations);
                    });
                });
                setTooltip($operations);
            } else {
                $operations.addClass('aui-iconfont-cross-circle delete-link tipsy-enabled').click(function(e) {
                    e.preventDefault();
                   if ($('.acs-nav').data('quick-links-state') != "hide") {
                       AJS.trigger('sidebar.disable-tooltip', this);
                       instance.destroy();
                   }
                }).attr('data-tooltip', AJS.I18n.getText('sidebar.main.configure.delete.help'));
            }

            return $operations;
        },
        destroy: function() {
            this.model.destroy({
                data: {spaceKey: AJS.Meta.get('space-key')}
            });
        }
    });

})(AJS.$);