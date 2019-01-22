/**
 * @module confluence-editor/i18n/translations.i18n
 */
define('confluence-editor/i18n/translations.i18n', [
    'ajs'
], function (AJS) {
    "use strict";

    return {
        popup_blocked: AJS.I18n.getText("tinymce.popup_blocked"),
        ctrl_key: AJS.I18n.getText("keyboard.shortcut.ctrl"),
        shift_key: AJS.I18n.getText("keyboard.shortcut.shift"),

        "searchreplace": {
            search_desc: AJS.I18n.getText("tinymce.searchreplace.search_desc"),
            replace_desc: AJS.I18n.getText("tinymce.searchreplace.replace_desc")
        },
        "searchreplace_dlg": {
            allreplacedplural: AJS.I18n.getText("tinymce.searchreplace_dlg.allreplaced.plural"),
            allreplacedsingular: AJS.I18n.getText("tinymce.searchreplace_dlg.allreplaced.singular"),
            notfound: AJS.I18n.getText("tinymce.searchreplace_dlg.notfound"),
            findlabel: AJS.I18n.getText("tinymce.searchreplace_dlg.findlabel"),
            replacelabel: AJS.I18n.getText("tinymce.searchreplace_dlg.replacelabel"),
            findnext: AJS.I18n.getText("tinymce.searchreplace_dlg.findnext"),
            findprevious: AJS.I18n.getText("tinymce.searchreplace_dlg.findprevious"),
            replace: AJS.I18n.getText("tinymce.searchreplace_dlg.replace"),
            replaceall: AJS.I18n.getText("tinymce.searchreplace_dlg.replaceall"),
            close: AJS.I18n.getText("tinymce.searchreplace_dlg.close")
        },

        "advhr": {
            advhr_desc: AJS.I18n.getText("tinymce.advhr.advhr_desc")
        },
        "emotions": {
            emotions_desc: AJS.I18n.getText("tinymce.emotions.emotions_desc")
        },
        "emotions_dlg": {
            title: AJS.I18n.getText("tinymce.emotions_dlg.title"),
            desc: AJS.I18n.getText("tinymce.emotions_dlg.desc"),
            smile: AJS.I18n.getText("tinymce.emotions_dlg.smile"),
            sad: AJS.I18n.getText("tinymce.emotions_dlg.sad"),
            tongue: AJS.I18n.getText("tinymce.emotions_dlg.tongue"),
            biggrin: AJS.I18n.getText("tinymce.emotions_dlg.biggrin"),
            wink: AJS.I18n.getText("tinymce.emotions_dlg.wink"),
            thumbs_up: AJS.I18n.getText("tinymce.emotions_dlg.thumbs_up"),
            thumbs_down: AJS.I18n.getText("tinymce.emotions_dlg.thumbs_down"),
            information: AJS.I18n.getText("tinymce.emotions_dlg.information"),
            check: AJS.I18n.getText("tinymce.emotions_dlg.check"),
            error: AJS.I18n.getText("tinymce.emotions_dlg.error"),
            warning: AJS.I18n.getText("tinymce.emotions_dlg.warning"),
            add: AJS.I18n.getText("tinymce.emotions_dlg.add"),
            forbidden: AJS.I18n.getText("tinymce.emotions_dlg.forbidden"),
            help_16: AJS.I18n.getText("tinymce.emotions_dlg.help_16"),
            lightbulb_on: AJS.I18n.getText("tinymce.emotions_dlg.lightbulb_on"),
            lightbulb: AJS.I18n.getText("tinymce.emotions_dlg.lightbulb"),
            star_yellow: AJS.I18n.getText("tinymce.emotions_dlg.star_yellow"),
            star_red: AJS.I18n.getText("tinymce.emotions_dlg.star_red"),
            star_green: AJS.I18n.getText("tinymce.emotions_dlg.star_green"),
            star_blue: AJS.I18n.getText("tinymce.emotions_dlg.star_blue"),
            heart: AJS.I18n.getText("tinymce.emotions_dlg.heart"),
            broken_heart: AJS.I18n.getText("tinymce.emotions_dlg.broken_heart")
        },
        "confluence": {
            conf_macro_browser: AJS.I18n.getText("tinymce.confluence.conf_macro_browser"),
            conf_macro_browser_desc: AJS.I18n.getText("tinymce.confluence.conf_macro_browser_desc"),

            conf_image: AJS.I18n.getText("tinymce.confluence.conf_image"),
            confimage_desc: AJS.I18n.getText("tinymce.confluence.conf_image_desc"),

            conf_file: AJS.I18n.getText("tinymce.confluence.conf_file"),
            confifile_desc: AJS.I18n.getText("tinymce.confluence.conf_file_desc"),

            conf_link: AJS.I18n.getText("tinymce.confluence.conf_link"),
            conflink_desc: AJS.I18n.getText("tinymce.confluence.conf_link_desc"),

            conf_table: AJS.I18n.getText("tinymce.table"),

            conf_wikimarkup: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup"),
            conf_wikimarkup_desc: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_desc"),
            conf_wikimarkup_errors: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_conversion_errors"),
            conf_wikimarkup_timeout: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_timeout"),
            conf_wikimarkup_hint: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_hint"),

            conf_wikimarkup_markdown_label: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_markdown_label"),
            conf_wikimarkup_confluence_label: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_confluence_label"),

            conf_shortcuts_help_desc: AJS.I18n.getText("tinymce.confluence.conf_shortcuts_help"),
            conf_insert_button_title: AJS.I18n.getText("tinymce.confluence_dlg.insertbutton.title")
        },
        "table": {
            desc: AJS.I18n.getText("tinymce.table.desc"),
            row_before_desc: AJS.I18n.getText("tinymce.table.row_before_desc"),
            row_after_desc: AJS.I18n.getText("tinymce.table.row_after_desc"),
            delete_row_desc: AJS.I18n.getText("tinymce.table.delete_row_desc"),
            numbering_column_desc: AJS.I18n.getText("tinymce.table.numbering_column_desc"),
            responsive: AJS.I18n.getText("tinymce.table.responsive"),
            responsive_tooltip: AJS.I18n.getText("tinymce.table.responsive_tooltip"),
            fixed_width: AJS.I18n.getText("tinymce.table.fixed_width"),
            fixed_width_tooltip: AJS.I18n.getText("tinymce.table.fixed_width_tooltip"),
            col_before_desc: AJS.I18n.getText("tinymce.table.col_before_desc"),
            col_after_desc: AJS.I18n.getText("tinymce.table.col_after_desc"),
            col_copy_desc: AJS.I18n.getText("tinymce.table.col_copy_desc"),
            col_paste_desc: AJS.I18n.getText("tinymce.table.col_paste_desc"),
            col_cut_desc: AJS.I18n.getText("tinymce.table.col_cut_desc"),
            delete_col_desc: AJS.I18n.getText("tinymce.table.delete_col_desc"),
            split_cells_desc: AJS.I18n.getText("tinymce.table.split_cells_desc"),
            merge_cells_desc: AJS.I18n.getText("tinymce.table.merge_cells_desc"),
            row_desc: AJS.I18n.getText("tinymce.table.row_desc"),
            cell_desc: AJS.I18n.getText("tinymce.table.cell_desc"),
            props_desc: AJS.I18n.getText("tinymce.table.props_desc"),
            paste_row_before_desc: AJS.I18n.getText("tinymce.table.paste_row_before_desc"),
            paste_row_after_desc: AJS.I18n.getText("tinymce.table.paste_row_after_desc"),
            cut_row_desc: AJS.I18n.getText("tinymce.table.cut_row_desc"),
            copy_row_desc: AJS.I18n.getText("tinymce.table.copy_row_desc"),
            del: AJS.I18n.getText("tinymce.table.del"),
            row: AJS.I18n.getText("tinymce.table.row"),
            col: AJS.I18n.getText("tinymce.table.col"),
            cell: AJS.I18n.getText("tinymce.table.cell"),
            row_highlight: AJS.I18n.getText("tinymce.table.row_highlight"),
            col_highlight: AJS.I18n.getText("tinymce.table.col_highlight"),
            selection_highlight: AJS.I18n.getText("tinymce.table.selection_highlight"),
            invalid_table_field: AJS.I18n.getText("tinymce.table_dlg.invalid_table_field"),
            table_more_heading: AJS.I18n.getText("tinymce.table.more.heading"),

            cell_background_color: AJS.I18n.getText('tinymce.table.cell_background_color'),

            cell_color_grey: AJS.I18n.getText('tinymce.table.cell_color.grey'),
            cell_color_yellow: AJS.I18n.getText('tinymce.table.cell_color.yellow'),
            cell_color_red: AJS.I18n.getText('tinymce.table.cell_color.red'),
            cell_color_green: AJS.I18n.getText('tinymce.table.cell_color.green'),
            cell_color_blue: AJS.I18n.getText('tinymce.table.cell_color.blue'),
            cell_color_clear: AJS.I18n.getText('tinymce.table.cell_color.clear'),

            //shortcuts
            cut_row_desc_shortcut: AJS.I18n.getText("tinymce.table.cut_row_shortcut"),
            copy_row_desc_shortcut: AJS.I18n.getText("tinymce.table.copy_row_shortcut"),
            paste_row_before_desc_shortcut: AJS.I18n.getText("tinymce.table.paste_row_before_shortcut"),
            row_before_desc_shortcut: AJS.I18n.getText("tinymce.table.row_before_shortcut"),
            row_after_desc_shortcut: AJS.I18n.getText("tinymce.table.row_after_shortcut")
        },
        'advanced': {
            style_select: AJS.I18n.getText("tinymce.advanced.style_select"),
            font_size: AJS.I18n.getText("tinymce.advanced.font_size"),
            fontdefault: AJS.I18n.getText("tinymce.advanced.fontdefault"),
            block: AJS.I18n.getText("tinymce.advanced.block"),
            paragraph: AJS.I18n.getText("tinymce.advanced.paragraph"),
            pre: AJS.I18n.getText("tinymce.advanced.pre"),
            h1: AJS.I18n.getText("tinymce.advanced.h1"),
            h2: AJS.I18n.getText("tinymce.advanced.h2"),
            h3: AJS.I18n.getText("tinymce.advanced.h3"),
            h4: AJS.I18n.getText("tinymce.advanced.h4"),
            h5: AJS.I18n.getText("tinymce.advanced.h5"),
            h6: AJS.I18n.getText("tinymce.advanced.h6"),
            blockquote: AJS.I18n.getText("tinymce.advanced.blockquote"),
            code: AJS.I18n.getText("tinymce.advanced.code"),
            samp: AJS.I18n.getText("tinymce.advanced.samp"),
            dt: AJS.I18n.getText("tinymce.advanced.dt"),
            dd: AJS.I18n.getText("tinymce.advanced.dd"),
            bold_desc: AJS.I18n.getText("tinymce.advanced.bold_desc"),
            italic_desc: AJS.I18n.getText("tinymce.advanced.italic_desc"),
            underline_desc: AJS.I18n.getText("tinymce.advanced.underline_desc"),
            striketrough_desc: AJS.I18n.getText("tinymce.advanced.striketrough_desc"),
            justifyleft_desc: AJS.I18n.getText("tinymce.advanced.justifyleft_desc"),
            justifycenter_desc: AJS.I18n.getText("tinymce.advanced.justifycenter_desc"),
            justifyright_desc: AJS.I18n.getText("tinymce.advanced.justifyright_desc"),
            justifyfull_desc: AJS.I18n.getText("tinymce.advanced.justifyfull_desc"),
            bullist_desc: AJS.I18n.getText("tinymce.advanced.bullist_desc"),
            numlist_desc: AJS.I18n.getText("tinymce.advanced.numlist_desc"),
            tasklist_desc: AJS.I18n.getText("tinymce.advanced.tasklist_desc"),
            outdent_desc: AJS.I18n.getText("tinymce.advanced.outdent_desc"),
            indent_desc: AJS.I18n.getText("tinymce.advanced.indent_desc"),
            undo_desc: AJS.I18n.getText("tinymce.advanced.undo_desc"),
            redo_desc: AJS.I18n.getText("tinymce.advanced.redo_desc"),
            link_desc: AJS.I18n.getText("tinymce.advanced.link_desc"),
            unlink_desc: AJS.I18n.getText("tinymce.advanced.unlink_desc"),
            image_desc: AJS.I18n.getText("tinymce.advanced.image_desc"),
            cleanup_desc: AJS.I18n.getText("tinymce.advanced.cleanup_desc"),
            code_desc: AJS.I18n.getText("tinymce.advanced.code_desc"),
            sub_desc: AJS.I18n.getText("tinymce.advanced.sub_desc"),
            sup_desc: AJS.I18n.getText("tinymce.advanced.sup_desc"),
            hr_desc: AJS.I18n.getText("tinymce.advanced.hr_desc"),
            removeformat_desc: AJS.I18n.getText("tinymce.advanced.removeformat_desc"),
            custom1_desc: AJS.I18n.getText("tinymce.advanced.custom1_desc"),
            forecolor_desc: AJS.I18n.getText("tinymce.advanced.forecolor_desc"),
            backcolor_desc: AJS.I18n.getText("tinymce.advanced.backcolor_desc"),
            charmap_desc: AJS.I18n.getText("tinymce.advanced.charmap_desc"),
            visualaid_desc: AJS.I18n.getText("tinymce.advanced.visualaid_desc"),
            anchor_desc: AJS.I18n.getText("tinymce.advanced.anchor_desc"),
            cut_desc: AJS.I18n.getText("tinymce.advanced.cut_desc"),
            copy_desc: AJS.I18n.getText("tinymce.advanced.copy_desc"),
            paste_desc: AJS.I18n.getText("tinymce.advanced.paste_desc"),
            image_props_desc: AJS.I18n.getText("tinymce.advanced.image_props_desc"),
            newdocument_desc: AJS.I18n.getText("tinymce.advanced.newdocument_desc"),
            help_desc: AJS.I18n.getText("tinymce.confluence.help_desc"),
            blockquote_desc: AJS.I18n.getText("tinymce.advanced.blockquote_desc"),
            path: AJS.I18n.getText("tinymce.advanced.path"),
            newdocument: AJS.I18n.getText("tinymce.advanced.newdocument"),
            toolbar_focus: AJS.I18n.getText("tinymce.advanced.toolbar_focus"),
            more_colors: AJS.I18n.getText("tinymce.advanced.more_colors"),

            //shortcuts
            paragraph_shortcut: AJS.I18n.getText("tinymce.advanced.paragraph_shortcut"),
            pre_shortcut: AJS.I18n.getText("tinymce.advanced.pre_shortcut"),
            h1_shortcut: AJS.I18n.getText("tinymce.advanced.h1_shortcut"),
            h2_shortcut: AJS.I18n.getText("tinymce.advanced.h2_shortcut"),
            h3_shortcut: AJS.I18n.getText("tinymce.advanced.h3_shortcut"),
            h4_shortcut: AJS.I18n.getText("tinymce.advanced.h4_shortcut"),
            h5_shortcut: AJS.I18n.getText("tinymce.advanced.h5_shortcut"),
            h6_shortcut: AJS.I18n.getText("tinymce.advanced.h6_shortcut"),
            blockquote_shortcut: AJS.I18n.getText("tinymce.advanced.blockquote_shortcut"),
            bullist_shortcut: AJS.I18n.getText("tinymce.advanced.bullist_shortcut"),
            numlist_shortcut: AJS.I18n.getText("tinymce.advanced.numlist_shortcut"),
            tasklist_shortcut: AJS.I18n.getText("tinymce.advanced.tasklist_shortcut"),
            undo_shortcut: AJS.I18n.getText("tinymce.advanced.undo_shortcut"),
            redo_shortcut: AJS.I18n.getText("tinymce.advanced.redo_shortcut")
        },

        "colorpicker": {
            more_colors: AJS.I18n.getText("tinymce.colorpicker.more_colors"),
            title: AJS.I18n.getText("tinymce.colorpicker.title"),
            picker_tab: AJS.I18n.getText("tinymce.colorpicker.picker_tab"),
            picker_title: AJS.I18n.getText("tinymce.colorpicker.picker_title"),
            palette_title: AJS.I18n.getText("tinymce.colorpicker.palette_title"),
            named_tab: AJS.I18n.getText("tinymce.colorpicker.named_tab"),
            named_title: AJS.I18n.getText("tinymce.colorpicker.named_title"),
            color: AJS.I18n.getText("tinymce.colorpicker.color"),
            name: AJS.I18n.getText("tinymce.colorpicker.name"),
            apply: AJS.I18n.getText("tinymce.colorpicker.apply")
        },

        "hints": {
            drafts: AJS.I18n.getText("tinymce.hints.drafts"),
            dnd: AJS.I18n.getText("tinymce.hints.dnd"),

            insert_link_recently_viewed: AJS.I18n.getText("tinymce.hints.insert.link.recently.viewed"),
            insert_link_search: AJS.I18n.getText("tinymce.hints.insert.link.search"),
            insert_link_end: AJS.I18n.getText("tinymce.hints.insert.link.end"),
            insert_link_newpage: AJS.I18n.getText("tinymce.hints.insert.link.newpage"),
            insert_link_user_mention: AJS.I18n.getText("tinymce.hints.insert.link.user.mention"),

            insert_image_on_page: AJS.I18n.getText("tinymce.hints.insert.image.on.page"),
            insert_image_search: AJS.I18n.getText("tinymce.hints.insert.image.search"),
            insert_image_end: AJS.I18n.getText("tinymce.hints.insert.image.end"),

            insert_wikimarkup: AJS.I18n.getText("tinymce.hints.insert.wikimarkup"),
            insert_wikimarkup_dialog: AJS.I18n.getText("tinymce.hints.insert.wikimarkup.dialog"),

            insert_link: AJS.I18n.getText("tinymce.hints.insert.link"),
            insert_image: AJS.I18n.getText("tinymce.hints.insert.image"),

            insert_macro: AJS.I18n.getText("tinymce.hints.insert.macro"),
            insert_macro_toc: AJS.I18n.getText("tinymce.hints.insert.macro.toc"),

            insert_bullet_list: AJS.I18n.getText("tinymce.hints.insert.bullet.list"),
            insert_numbered_list: AJS.I18n.getText("tinymce.hints.insert.numbered.list"),
            insert_heading: AJS.I18n.getText("tinymce.hints.insert.heading"),
            insert_table: AJS.I18n.getText("tinymce.hints.insert.table"),
            table_rows_copy: AJS.I18n.getText("tinymce.hints.table.rows.copy"),
            table_rows_cut: AJS.I18n.getText("tinymce.hints.table.rows.cut"),
            insert_newline: AJS.I18n.getText("tinymce.hints.insert.newline"),

            autoformat_heading1: AJS.I18n.getText("tinymce.hints.autoformat.heading1"),
            autoformat_heading3: AJS.I18n.getText("tinymce.hints.autoformat.heading3"),
            autoformat_code: AJS.I18n.getText("tinymce.hints.autoformat.code")
        },

        "auiwindowmanager": {
            cancel: AJS.I18n.getText("tinymce.auiwindowmanager.cancel"),
            ok: AJS.I18n.getText("tinymce.auiwindowmanager.ok")
        },

        "propertypanel": {
            links_goto: AJS.I18n.getText("tinymce.propertypanel.links.goto"),
            links_edit: AJS.I18n.getText("tinymce.propertypanel.links.edit"),
            links_unlink: AJS.I18n.getText("tinymce.propertypanel.links.unlink"),

            links_goto_disabled_tooltip: AJS.I18n.getText("tinymce.propertypanel.links.goto.disabled.tooltip"),
            links_edit_tooltip: AJS.I18n.getText("tinymce.propertypanel.links.edit.tooltip"),
            links_unlink_tooltip: AJS.I18n.getText("tinymce.propertypanel.links.unlink.tooltip"),

            images_small: AJS.I18n.getText("tinymce.propertypanel.images.small"),
            images_medium: AJS.I18n.getText("tinymce.propertypanel.images.medium"),
            images_large: AJS.I18n.getText("tinymce.propertypanel.images.large"),
            images_original: AJS.I18n.getText("tinymce.propertypanel.images.original"),
            images_border: AJS.I18n.getText("tinymce.propertypanel.images.border"),

            images_link_create: AJS.I18n.getText("tinymce.propertypanel.images.link.create"),
            images_link_edit: AJS.I18n.getText("tinymce.propertypanel.images.link.edit"),
            images_link_remove: AJS.I18n.getText("tinymce.propertypanel.images.link.remove"),
            images_link_create_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.link.create.tooltip"),
            images_link_edit_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.link.edit.tooltip"),
            images_link_remove_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.link.remove.tooltip"),

            images_sizing_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.sizing.tooltip"),
            images_small_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.small.tooltip"),
            images_medium_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.medium.tooltip"),
            images_large_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.large.tooltip"),
            images_original_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.original.tooltip"),
            images_thumbnail_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.thumbnail.tooltip"),
            images_border_tooltip: AJS.I18n.getText("tinymce.propertypanel.images.border.tooltip")
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/i18n/translations.i18n', 'TinyMCELang');
