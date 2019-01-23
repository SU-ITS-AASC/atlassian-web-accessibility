(function ($) {
    //DEPRECATED. DO NOT USE!
    //Atlassian jQuery plugin for user autocomplete. This is ancient code accidentally  put in by Confluence.
    $.fn.autocomplete = function (url, minlength, callback) {
        callback = typeof minlength == 'function' ? minlength : (typeof callback == 'function' ? callback : function () {});
        minlength = !isNaN(Number(minlength)) ? minlength : 3;
        var input = this;
        input[0].lastSelectedValue = input.val();
        // add autocomplete results
        var ol = $(document.createElement('ol'));
        var offSet = input.offset();

        // In Confluence, our body element has a border left width that needs to be accounted for in offset calculations
        var confluencesBodyBorderLeftWidth = parseInt($('body').css('border-left-width')); // border-left-width returns a "px" value so we need parseInt to extract out the value
        ol.css({
            position: 'absolute',
            width: input.outerWidth() - 2 + 'px'
        });
        ol.addClass('autocompleter');
        this.after(ol);
        ol.css({
            margin: (Math.abs(this.offset().left - ol.offset().left) >= Math.abs(this.offset().top - ol.offset().top)) ?
                        input.outerHeight() + 'px 0 0 -' + input.outerWidth() + 'px' :
                        '-1px 0 0 0'
        });
        ol.hide();
        function hideDropDown() {
            ol.hide();
            $(document).unbind('click', hideDropDown);
        }
        function suggest() {
            var currentTextfieldValue = input.val();

            if (currentTextfieldValue.length >= minlength && currentTextfieldValue != input[0].lastQuery && currentTextfieldValue != input[0].lastSelectedValue) {
                $.getJSON(url + encodeURI(currentTextfieldValue), function (data) {
                    var html = '';
                    currentTextfieldValue = currentTextfieldValue.toLowerCase();
                    var vSplit = currentTextfieldValue.split(' ');
                    for (var i = 0, ii = data.length; i < ii; i++) {
                        var highlightedFlag = false;
                        if (data[i].fullName && data[i].username) {
                            var value = data[i].fullName + ' (' + data[i].username + ')'; // for 'hiding' in the menu so we can populate the text box correctly when it is chosen
                            var name = data[i].fullName.split(' ');
                            for (var j = 0, jj = name.length; j < jj; j++) {
                                for (var k = 0; k < vSplit.length; k++) {
                                    if (name[j].toLowerCase().indexOf(vSplit[k]) == 0) {
                                        name[j] = '<strong>' + name[j].substring(0, vSplit[k].length) + '</strong>' + name[j].substring(vSplit[k].length);
                                        highlightedFlag = true;
                                    }
                                }
                            }

                            // only highlight username match if there was no match in the name parts
                            if (!highlightedFlag) {
                                for (var k = 0; k < vSplit.length; k++) {
                                    if (data[i].username && data[i].username.toLowerCase().indexOf(vSplit[k]) == 0) {
                                        data[i].username = '<strong>' + data[i].username.substring(0, vSplit[k].length) + '</strong>' + data[i].username.substring(vSplit[k].length);
                                    }
                                }
                            }

                            // create full name again from sub parts (for display)
                            data[i].fullName = name.join(' ');

                            html += '<li>' +
                                          '<span>' + data[i].fullName + "</span> <span class='username-in-autocomplete-list'>(" + data[i].username + ')</span>' +
                                          "<i class='fullDetails'>" + value + '</i>' +
                                          "<i class='username'>" + data[i].username + '</i>' +
                                          "<i class='fullName'>" + data[i].fullName + '</i>' +
                                          '</li>';
                        }
                        if (data[i].status) {
                            html += '<li>' + data[i].status + '</li>';
                        }
                    }
                    ol.html(html);
                    $('li', ol).click(function (e) {
                        e.stopPropagation();
                        var value = $('i.fullDetails', this).html();
                        select(value);
                    }).hover(function () {
                        $('.focused').removeClass('focused');
                        $(this).addClass('focused');
                    }, function () {});

                    $(document).click(hideDropDown);

                    ol.show();
                });

                // store the last successfully run query
                // this is outside of the asynchronous block intentionally (so are we not at the mercy of async requests coming back out of order)
                input[0].lastQuery = currentTextfieldValue;
            } else if (currentTextfieldValue.length < minlength) {
                hideDropDown();
            }
        };
        input.keydown(function (e) {
            var that = this;
            if (this.timer) {
                clearTimeout(this.timer);
            }
            var actions = {
                '40': function () { // down key
                    var li = $('.focused').removeClass('focused').next();
                    if (li.length) {
                        li.addClass('focused');
                    } else {
                        $('.autocompleter li:first').addClass('focused');
                    }
                },
                '38': function () { // up key
                    var li = $('.focused').removeClass('focused').prev();
                    if (li.length) {
                        li.addClass('focused');
                    } else {
                        $('li:last', ol).addClass('focused');
                    }
                },
                '27': function () { // escape key
                    hideDropDown();
                },
                '13': function () { // enter key
                    var value = $('.focused i.fullDetails').html();
                    select(value);
                },
                '9': function () { // tab key
                    this[13]();
                    // workaround firefox2/MacOSX issue where tabbing moves to next element (do it by refocusing on the element we have tabbed away from)
                    // call to focus() must reside in a timeout, as the focus moves after this block is exited (so we actually want to schedule a refocus when we leave this block)
                    setTimeout(function () {
                        that.focus();
                    }, 0);
                }
            };
            if (ol.css('display') != 'none' && e.keyCode in actions) {
                e.preventDefault();
                actions[e.keyCode]();
            }
            this.timer = setTimeout(suggest, 300);
        });

        // value has been introduced as a parameter due to inexplicable behaviour using the same value
        // selecting logic in click handling versus enter handling.
        function select(value) {
            var originalValue = input.val();

            if (value) {
                input[0].lastSelectedValue = value;
                input.val(value);
                var callbackData = {input: input, originalValue: originalValue, value: value, fullName: $('.focused i.fullName').text(), username: $('.focused i.username').text()};
                callback(callbackData);
                hideDropDown();
            }
        }
    };

    AJS.deprecate.prop($.fn, 'autocomplete', {
        displayName: 'jquery.autocomplete.js',
        extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-393.'
    });

})(jQuery);
