AJS.toInit(function ($) {
    Confluence.OfficeConnector = Confluence.OfficeConnector || {};

    Confluence.OfficeConnector.Analytics = (function ($, _) {
        function triggerEvent(name, data) {
            AJS.trigger('analytics', {name: name, data: data});
        }

        function importWord(data) {
            triggerEvent('confluence.office.connector.word.import.submit', data);

        }

        return {
            importWord: importWord
        }

    })(AJS.$, window._);
});
