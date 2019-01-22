/**
 * @module confluence-drag-and-drop/observable-array-list
 */
define('confluence-drag-and-drop/observable-array-list', [
    'ajs',
    'jquery'
], function(
    AJS,
    $
) {
    "use strict";

    /**
     */
    var ObservableArrayList = function() {
        this._data = [];
        this._pushObservers = [];
    };

    ObservableArrayList.prototype = {
        push: function (e) {
            this._data.push(e);
            this._notifyPushObservers(e);
        },
        length: function () {
            return this._data.length;
        },
        remove: function (from, to) {
            return this._remove.call(this._data, from, to);
        },
        // Array Remove - By John Resig (MIT Licensed)
        _remove: function (from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        },
        shift: function () {
            return this._data.shift();
        },
        /**
         * Removes according to the specified predicate function
         * @param predicate a function that will take as argument an element of this array. If the result is true, the element will be removed.
         * @return the number of elements removed
         */
        removeByPredicate: function (predicate) {
            var res = [];
            var len = this._data.length;
            for (var i = 0; i < len; i++) {
                if (!predicate(this._data[i])) {
                    res.push(this._data[i]);
                }
            }
            this._data = res;
            return len - this._data.length;
        },
        addPushObserver: function (observer) {
            if ($.isFunction(observer)) {
                this._pushObservers.push(observer);
            } else {
                throw new Error("Attempting to add an observer that is not a function: " + observer);
            }
        },
        _notifyPushObservers: function (o) {
            for (var i = 0, ii = this._pushObservers.length; i < ii; i++) {
                this._pushObservers[i](o);
            }
        }
    };

    return ObservableArrayList;
});

require('confluence/module-exporter')
    .exportModuleAsGlobal('confluence-drag-and-drop/observable-array-list', 'AJS.ObservableArrayList');