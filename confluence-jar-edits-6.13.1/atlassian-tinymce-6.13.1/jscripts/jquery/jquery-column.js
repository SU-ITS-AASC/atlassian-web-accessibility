/**
 * @preserve jQuery Column cell selector v1.0
 *
 * Licensed under the new BSD License.
 * Copyright 2009-2012, Bram Stein
 * All rights reserved.
 *
 * ATLASSIAN modified: Removed all extensions,modifications to jQuery expression internals (jQuery.expr)
 * now creates pseudo selector via jQuery/Sizzle preferred method
 *
 * @module atlassian-tinymce/jquery/jquery-column
 */
define('atlassian-tinymce/jquery/jquery-column', [
    'jquery'
], function(
    $
) {
    "use strict";

    var equationRegExp = /([\+\-]?\d*)[nN]([\+\-]?\d*)/;
    var cache;
    var equation;
    var pseudoSelector = $.expr.filter.PSEUDO;

    function parseEquation(str) {
        var tmp = [];
        var result = {
            multiplier: 0,
            offset: 0
        };

        if (str === 'even') {
            str = '2n';
        } else if (str === 'odd') {
            str = '2n+1';
        } else if (/^\d*$/.test(str)) {
            str = '0n+' + str;
        }

        tmp = equationRegExp.exec(str);

        if (tmp !== null) {
            result.multiplier = tmp[1] - 0;
            result.offset = tmp[2] - 0;
        }
        return result;
    }

    function generateCache(cells, equation) {
        var currentRow;
        var currentSection;
        var matrix = [];
        var first = 0;
        var lookup = [];

        $.each(cells, function (k, cell) {
            var i = 0;
            var j = 0;
            var rowSpan = cell.rowSpan || 1;
            var colSpan = cell.colSpan || 1;

            if (cell.parentNode !== currentRow) {
                currentRow = cell.parentNode;

                if (currentRow.parentNode !== currentSection) {
                    currentSection = currentRow.parentNode;
                    matrix = [];
                }

                first = 0;

                if (matrix[currentRow.rowIndex] === undefined) {
                    matrix[currentRow.rowIndex] = [];
                }

            }

            for (i = 0; i < matrix[currentRow.rowIndex].length + 1; i += 1) {
                if (matrix[currentRow.rowIndex][i] === undefined) {
                    first = i;
                    break;
                }
            }

            lookup[k] = first;

            for (i = currentRow.rowIndex; i < currentRow.rowIndex + rowSpan; i += 1) {
                if (matrix[i] === undefined) {
                    matrix[i] = [];
                }

                for (j = first; j < first + colSpan; j += 1) {
                    matrix[i][j] = true;
                }
            }
        });
        return lookup;
    }

    function nthCol(element, match, index) {
        var difference = cache[index] - (equation.offset - 1);
        if (equation.multiplier === 0) {
            return difference === 0;
        } else {
            return (difference % equation.multiplier === 0 && difference / equation.multiplier >= 0);
        }
    }

    return {
        nthCol: function (e) {
            equation = parseEquation(e);
            cache = generateCache(this);
            return $(this).filter(function (i) {
                return nthCol(this, undefined, i);
            });
        }
    };
});

require('confluence/module-exporter').safeRequire('atlassian-tinymce/jquery/jquery-column', function(Column) {
    var $ = require('jquery');
    $.extend($.fn, Column);
});
