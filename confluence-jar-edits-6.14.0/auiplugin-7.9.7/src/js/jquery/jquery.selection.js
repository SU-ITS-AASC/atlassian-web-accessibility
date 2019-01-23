(function ($) {
    if (document.selection) {
        var fixCaretReturn = function (S) {
            return S.replace(/\u000D/g, '');
        };
        $.fn.selection = function (value) {
            var element = this[0];
            this.focus();
            if (!element) {
                return false;
            }
            if (value == null) {
                return document.selection.createRange().text;
            } else {
                var scroll_top = element.scrollTop;
                var range = document.selection.createRange();
                range.text = value;
                range.select();
                element.focus();
                element.scrollTop = scroll_top;
            }
        };
        $.fn.selectionRange = function (start, end) {
            var element = this[0];
            this.focus();
            var range = document.selection.createRange();

            if (start == null) {
                var textAreaVal = this.val();
                var len = textAreaVal.length;
                var dup = range.duplicate();
                dup.moveToElementText(element);

                dup.setEndPoint('StartToEnd', range); // move the start of dup to end of range
                var tEnd = len - fixCaretReturn(dup.text).length;
                dup.setEndPoint('StartToStart', range); // move to start of dup to start of range
                var tStart = len - fixCaretReturn(dup.text).length;

                // IE swallows the newline at the end of the selection
                if (tEnd != tStart && textAreaVal.charAt(tEnd + 1) == '\n') {
                    tEnd += 1;
                }
                return {
                    end: tEnd,
                    start: tStart,
                    text: textAreaVal.substring(tStart, tEnd),
                    textBefore: textAreaVal.substring(0, tStart),
                    textAfter: textAreaVal.substring(tEnd)
                };
            } else {
                // first reset range to beginning of text area
                range.moveToElementText(element);
                range.collapse(true);

                range.moveStart('character', start);
                range.moveEnd('character', end - start);
                range.select();
            }
        };
    } else {
        $.fn.selection = function (value) {
            var element = this[0];
            if (!element) {
                return false;
            }
            if (value == null) {
                if (element.setSelectionRange) {
                    return element.value.substring(element.selectionStart, element.selectionEnd);
                } else {
                    return false;
                }
            } else {
                var scroll_top = element.scrollTop;
                if (!!element.setSelectionRange) {
                    var selection_start = element.selectionStart;
                    element.value = element.value.substring(0, selection_start) + value + element.value.substring(element.selectionEnd);
                    element.selectionStart = selection_start;
                    element.selectionEnd = selection_start + value.length;
                }
                element.focus();
                element.scrollTop = scroll_top;
            }
        };
        $.fn.selectionRange = function (start, end) {
            if (start == null) {
                var res = {
                    start: this[0].selectionStart,
                    end: this[0].selectionEnd
                };
                var elementValue = this.val();
                res.text = elementValue.substring(res.start, res.end);
                res.textBefore = elementValue.substring(0, res.start);
                res.textAfter = elementValue.substring(res.end);
                return res;
            } else {
                this[0].selectionStart = start;
                this[0].selectionEnd = end;
            }
        };
    }
    $.fn.wrapSelection = function (before, after) {
        this.selection(before + this.selection() + (after || ''));
    };
})(jQuery);
