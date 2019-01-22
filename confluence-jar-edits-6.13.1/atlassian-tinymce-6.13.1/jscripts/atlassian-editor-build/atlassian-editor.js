/**
 * tinymce.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(win) {
    var whiteSpaceRe = /^\s*|\s*$/g,
        undefined, isRegExpBroken = 'B'.replace(/A(.)|B/, '$1') === '$1';

    /**
     * Core namespace with core functionality for the TinyMCE API all sub classes will be added to this namespace/object.
     *
     * @static
     * @class tinymce
     * @example
     * // Using each method
     * tinymce.each([1, 2, 3], function(v, i) {
     *   console.log(i + '=' + v);
     * });
     *
     * // Checking for a specific browser
     * if (tinymce.isIE)
     *   console.log("IE");
     */
    var tinymce = {
        /**
         * Major version of TinyMCE build.
         *
         * @property majorVersion
         * @type String
         */
        majorVersion : '3',

        /**
         * Major version of TinyMCE build.
         *
         * @property minorVersion
         * @type String
         */
        minorVersion : '4.9-atlassian-11',

        /**
         * Release date of TinyMCE build.
         *
         * @property releaseDate
         * @type String
         */
        releaseDate : '2012-03-06',

        /**
         * Initializes the TinyMCE global namespace this will setup browser detection and figure out where TinyMCE is running from.
         */
        _init : function() {
            var t = this, d = document, na = navigator, ua = na.userAgent, i, nl, n, base, p, v;

            /**
             * Constant that is true if the browser is Opera.
             *
             * @property isOpera
             * @type Boolean
             * @final
             */
            t.isOpera = win.opera && opera.buildNumber;

            /**
             * Constant that is true if the browser is WebKit (Safari/Chrome).
             *
             * @property isWebKit
             * @type Boolean
             * @final
             */
            t.isWebKit = /WebKit/.test(ua);

            /**
             * Constant that is true if the browser is Chrome
             *
             * @property isChrome
             * @type Boolean
             * @final
             */
            t.isChrome = t.isWebKit && /Chrome/.test(ua);

            /**
             * Constant that is true if the browser is IE11.
             *
             * @property isIE11
             * @type Boolean
             * @final
             */
            // ATLASSIAN - CONFDEV-21295 - User agent check for post ie11 based on tinyMCE 4
            t.isIE11 = !!(ua.indexOf('Trident/') != -1 && (ua.indexOf('rv:') != -1 || na.appName.indexOf('Netscape') != -1));

            /**
             * Constant that is true if the browser is IE.
             *
             * @property isIE
             * @type Boolean
             * @final
             */
            // ATLASSIAN - CONFDEV-21295 - User agent check for post ie11 based on tinyMCE 4
            t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName);
            t.isIE = t.isIE && /MSIE (\w+)\./.exec(ua)[1];
            t.isIE = t.isIE || t.isIE11;

            /**
             * Constant that is true if the browser is IE 6 or older.
             *
             * @property isIE6
             * @type Boolean
             * @final
             */
            t.isIE6 = t.isIE && /MSIE [56]/.test(ua);

            /**
             * Constant that is true if the browser is IE 7.
             *
             * @property isIE7
             * @type Boolean
             * @final
             */
            t.isIE7 = t.isIE && /MSIE [7]/.test(ua);

            /**
             * Constant that is true if the browser is IE 8.
             *
             * @property isIE8
             * @type Boolean
             * @final
             */
            t.isIE8 = t.isIE && /MSIE [8]/.test(ua);

            /**
             * Constant that is true if the browser is IE 9.
             *
             * @property isIE9
             * @type Boolean
             * @final
             */
            t.isIE9 = t.isIE && /MSIE [9]/.test(ua);

            /**
             * Constant that is true if the browser is IE 10.
             *
             * @property isIE10
             * @type Boolean
             * @final
             */
            t.isIE10 = t.isIE && /MSIE \d\d/.test(ua);

            /**
             * Constant that is true if the browser is IE 10 or above.
             *
             * @property isIE10up
             * @type Boolean
             * @final
             */
            // ATLASSIAN - CONFDEV-21295 - User agent check for post ie11 based on tinyMCE 4
            t.isIE10up = t.isIE && /MSIE \d\d/.test(ua) || t.isIE11;

            /**
             * Constant that is true if the browser is Gecko.
             *
             * @property isGecko
             * @type Boolean
             * @final
             */
            // ATLASSIAN - CONFDEV-21295 - User agent check for post ie11 based on tinyMCE 4
            t.isGecko = !t.isWebKit && !t.isIE11 && /Gecko/.test(ua);

            /**
             * Constant that is true if the os is Mac OS.
             *
             * @property isMac
             * @type Boolean
             * @final
             */
            t.isMac = ua.indexOf('Mac') != -1;

            /**
             * Constant that is true if the runtime is Adobe Air.
             *
             * @property isAir
             * @type Boolean
             * @final
             */
            t.isAir = /adobeair/i.test(ua);

            /**
             * Constant that tells if the current browser is an iPhone or iPad.
             *
             * @property isIDevice
             * @type Boolean
             * @final
             */
            t.isIDevice = /(iPad|iPhone)/.test(ua);

            /**
             * Constant that is true if the current browser is running on iOS 5 or greater.
             *
             * @property isIOS5
             * @type Boolean
             * @final
             */
            t.isIOS5 = t.isIDevice && ua.match(/AppleWebKit\/(\d*)/)[1]>=534;

            // TinyMCE .NET webcontrol might be setting the values for TinyMCE
            if (win.tinyMCEPreInit) {
                t.suffix = tinyMCEPreInit.suffix;
                t.baseURL = tinyMCEPreInit.base;
                t.query = tinyMCEPreInit.query;
                return;
            }

            // Get suffix and base
            t.suffix = '';

            // If base element found, add that infront of baseURL
            nl = d.getElementsByTagName('base');
            for (i=0; i<nl.length; i++) {
                if (v = nl[i].href) {
                    // Host only value like http://site.com or http://site.com:8008
                    if (/^https?:\/\/[^\/]+$/.test(v))
                        v += '/';

                    base = v ? v.match(/.*\//)[0] : ''; // Get only directory
                }
            }
            // ATLASSIAN - get base from document.location and our webresource called tinymce-resources
            if (!base) {
                var l = document.location;
                base = l.protocol + "//" + l.hostname + (l.port ? ":" + l.port : "");
            }

            // ATLASSIAN - changed to take a String representing a url (instead of a SCRIPT node)
            //           - so basically all 'n.src' usages were changed to 'url'
            function getBase(url) {
                //ATLASSIAN
                var isAtlassian = /editor/.test(url);
                if (url && /tiny_mce(|_gzip|_jquery|_prototype|_full)(_dev|_src)?.js/.test(url) || isAtlassian) {
                    if (/_(src|dev)\.js/g.test(url))
                        t.suffix = '_src';

                    if ((p = url.indexOf('?')) != -1)
                        t.query = url.substring(p + 1);

                    //ATLASSIAN
                    if(isAtlassian) {
                        t.baseURL = url.substring(0, url.indexOf('/download/'));
                    } else {
                        t.baseURL = url.substring(0, url.lastIndexOf('/'));
                    }

                    // If path to script is relative and a base href was found add that one infront
                    // the src property will always be an absolute one on non IE browsers and IE 8
                    // so this logic will basically only be executed on older IE versions
                    if (base && t.baseURL.indexOf('://') == -1 && t.baseURL.indexOf('/') !== 0)
                        t.baseURL = base + t.baseURL;

                    // ATLASSIAN - we need to change the base to this plugin resource, not the edit page url
                    // t.baseURL += "/download/resources/com.atlassian.plugins.editor/tinymcesource";
                    if(isAtlassian)
                        t.baseURL += "/download/resources/com.atlassian.plugins.editor/tinymcesource";

                    return t.baseURL;
                }

                return null;
            };

            // ATLASSIAN: CONFDEV-7079 - For dynamic editor loading
            // check if base relative URL was explicitly set
            var metaBaseUrl = AJS.Meta.get("rte.src.url");
            if (metaBaseUrl) {
                getBase(metaBaseUrl);
            } else {
                // Check document
                nl = d.getElementsByTagName('script');
                for (i=0; i<nl.length; i++) {
                    if (getBase(nl[i].src))
                        return;
                }

                // Check head
                n = d.getElementsByTagName('head')[0];
                if (n) {
                    nl = n.getElementsByTagName('script');
                    for (i=0; i<nl.length; i++) {
                        if (getBase(nl[i].src))
                            return;
                    }
                }
            }

            return;
        },

        /**
         * Checks if a object is of a specific type for example an array.
         *
         * @method is
         * @param {Object} o Object to check type of.
         * @param {string} t Optional type to check for.
         * @return {Boolean} true/false if the object is of the specified type.
         */
        is : function(o, t) {
            if (!t)
                return o !== undefined;

            if (t == 'array' && (o.hasOwnProperty && o instanceof Array))
                return true;

            return typeof(o) == t;
        },

        /**
         * Makes a name/object map out of an array with names.
         *
         * @method makeMap
         * @param {Array/String} items Items to make map out of.
         * @param {String} delim Optional delimiter to split string by.
         * @param {Object} map Optional map to add items to.
         * @return {Object} Name/value map of items.
         */
        makeMap : function(items, delim, map) {
            var i;

            items = items || [];
            delim = delim || ',';

            if (typeof(items) == "string")
                items = items.split(delim);

            map = map || {};

            i = items.length;
            while (i--)
                map[items[i]] = {};

            return map;
        },

        /**
         * Performs an iteration of all items in a collection such as an object or array. This method will execure the
         * callback function for each item in the collection, if the callback returns false the iteration will terminate.
         * The callback has the following format: cb(value, key_or_index).
         *
         * @method each
         * @param {Object} o Collection to iterate.
         * @param {function} cb Callback function to execute for each item.
         * @param {Object} s Optional scope to execute the callback in.
         * @example
         * // Iterate an array
         * tinymce.each([1,2,3], function(v, i) {
         *     console.debug("Value: " + v + ", Index: " + i);
         * });
         *
         * // Iterate an object
         * tinymce.each({a : 1, b : 2, c: 3], function(v, k) {
         *     console.debug("Value: " + v + ", Key: " + k);
         * });
         */
        each : function(o, cb, s) {
            var n, l;

            if (!o)
                return 0;

            s = s || o;

            if (o.length !== undefined) {
                // Indexed arrays, needed for Safari
                for (n=0, l = o.length; n < l; n++) {
                    if (cb.call(s, o[n], n, o) === false)
                        return 0;
                }
            } else {
                // Hashtables
                for (n in o) {
                    if (o.hasOwnProperty(n)) {
                        if (cb.call(s, o[n], n, o) === false)
                            return 0;
                    }
                }
            }

            return 1;
        },

        // #ifndef jquery

        /**
         * Creates a new array by the return value of each iteration function call. This enables you to convert
         * one array list into another.
         *
         * @method map
         * @param {Array} a Array of items to iterate.
         * @param {function} f Function to call for each item. It's return value will be the new value.
         * @return {Array} Array with new values based on function return values.
         */
        map : function(a, f) {
            var o = [];

            tinymce.each(a, function(v) {
                o.push(f(v));
            });

            return o;
        },

        /**
         * Filters out items from the input array by calling the specified function for each item.
         * If the function returns false the item will be excluded if it returns true it will be included.
         *
         * @method grep
         * @param {Array} a Array of items to loop though.
         * @param {function} f Function to call for each item. Include/exclude depends on it's return value.
         * @return {Array} New array with values imported and filtered based in input.
         * @example
         * // Filter out some items, this will return an array with 4 and 5
         * var items = tinymce.grep([1,2,3,4,5], function(v) {return v > 3;});
         */
        grep : function(a, f) {
            var o = [];

            tinymce.each(a, function(v) {
                if (!f || f(v))
                    o.push(v);
            });

            return o;
        },

        /**
         * Returns the index of a value in an array, this method will return -1 if the item wasn't found.
         *
         * @method inArray
         * @param {Array} a Array/Object to search for value in.
         * @param {Object} v Value to check for inside the array.
         * @return {Number/String} Index of item inside the array inside an object. Or -1 if it wasn't found.
         * @example
         * // Get index of value in array this will alert 1 since 2 is at that index
         * alert(tinymce.inArray([1,2,3], 2));
         */
        inArray : function(a, v) {
            var i, l;

            if (a) {
                for (i = 0, l = a.length; i < l; i++) {
                    if (a[i] === v)
                        return i;
                }
            }

            return -1;
        },

        /**
         * Extends an object with the specified other object(s).
         *
         * @method extend
         * @param {Object} o Object to extend with new items.
         * @param {Object} e..n Object(s) to extend the specified object with.
         * @return {Object} o New extended object, same reference as the input object.
         * @example
         * // Extends obj1 with two new fields
         * var obj = tinymce.extend(obj1, {
         *     somefield1 : 'a',
         *     somefield2 : 'a'
         * });
         *
         * // Extends obj with obj2 and obj3
         * tinymce.extend(obj, obj2, obj3);
         */
        extend : function(o, e) {
            var i, l, a = arguments;

            for (i = 1, l = a.length; i < l; i++) {
                e = a[i];

                tinymce.each(e, function(v, n) {
                    if (v !== undefined)
                        o[n] = v;
                });
            }

            return o;
        },

        // #endif

        /**
         * Removes whitespace from the beginning and end of a string.
         *
         * @method trim
         * @param {String} s String to remove whitespace from.
         * @return {String} New string with removed whitespace.
         */
        trim : function(s) {
            return (s ? '' + s : '').replace(whiteSpaceRe, '');
        },

        /**
         * Creates a class, subclass or static singleton.
         * More details on this method can be found in the Wiki.
         *
         * @method create
         * @param {String} s Class name, inheritage and prefix.
         * @param {Object} p Collection of methods to add to the class.
         * @param {Object} root Optional root object defaults to the global window object.
         * @example
         * // Creates a basic class
         * tinymce.create('tinymce.somepackage.SomeClass', {
         *     SomeClass : function() {
         *         // Class constructor
         *     },
         *
         *     method : function() {
         *         // Some method
         *     }
         * });
         *
         * // Creates a basic subclass class
         * tinymce.create('tinymce.somepackage.SomeSubClass:tinymce.somepackage.SomeClass', {
         *     SomeSubClass: function() {
         *         // Class constructor
         *         this.parent(); // Call parent constructor
         *     },
         *
         *     method : function() {
         *         // Some method
         *         this.parent(); // Call parent method
         *     },
         *
         *     'static' : {
         *         staticMethod : function() {
         *             // Static method
         *         }
         *     }
         * });
         *
         * // Creates a singleton/static class
         * tinymce.create('static tinymce.somepackage.SomeSingletonClass', {
         *     method : function() {
         *         // Some method
         *     }
         * });
         */
        create : function(s, p, root) {
            var t = this, sp, ns, cn, scn, c, de = 0;

            // Parse : <prefix> <class>:<super class>
            s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
            cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

            // Create namespace for new class
            ns = t.createNS(s[3].replace(/\.\w+$/, ''), root);

            // Class already exists
            if (ns[cn])
                return;

            // Make pure static class
            if (s[2] == 'static') {
                ns[cn] = p;

                if (this.onCreate)
                    this.onCreate(s[2], s[3], ns[cn]);

                return;
            }

            // Create default constructor
            if (!p[cn]) {
                p[cn] = function() {};
                de = 1;
            }

            // Add constructor and methods
            ns[cn] = p[cn];
            t.extend(ns[cn].prototype, p);

            // Extend
            if (s[5]) {
                sp = t.resolve(s[5]).prototype;
                scn = s[5].match(/\.(\w+)$/i)[1]; // Class name

                // Extend constructor
                c = ns[cn];
                if (de) {
                    // Add passthrough constructor
                    ns[cn] = function() {
                        return sp[scn].apply(this, arguments);
                    };
                } else {
                    // Add inherit constructor
                    ns[cn] = function() {
                        this.parent = sp[scn];
                        return c.apply(this, arguments);
                    };
                }
                ns[cn].prototype[cn] = ns[cn];

                // Add super methods
                t.each(sp, function(f, n) {
                    ns[cn].prototype[n] = sp[n];
                });

                // Add overridden methods
                t.each(p, function(f, n) {
                    // Extend methods if needed
                    if (sp[n]) {
                        ns[cn].prototype[n] = function() {
                            this.parent = sp[n];
                            return f.apply(this, arguments);
                        };
                    } else {
                        if (n != cn)
                            ns[cn].prototype[n] = f;
                    }
                });
            }

            // Add static methods
            t.each(p['static'], function(f, n) {
                ns[cn][n] = f;
            });

            if (this.onCreate)
                this.onCreate(s[2], s[3], ns[cn].prototype);
        },

        /**
         * Executed the specified function for each item in a object tree.
         *
         * @method walk
         * @param {Object} o Object tree to walk though.
         * @param {function} f Function to call for each item.
         * @param {String} n Optional name of collection inside the objects to walk for example childNodes.
         * @param {String} s Optional scope to execute the function in.
         */
        walk : function(o, f, n, s) {
            s = s || this;

            if (o) {
                if (n)
                    o = o[n];

                tinymce.each(o, function(o, i) {
                    if (f.call(s, o, i, n) === false)
                        return false;

                    tinymce.walk(o, f, n, s);
                });
            }
        },

        /**
         * Creates a namespace on a specific object.
         *
         * @method createNS
         * @param {String} n Namespace to create for example a.b.c.d.
         * @param {Object} o Optional object to add namespace to, defaults to window.
         * @return {Object} New namespace object the last item in path.
         * @example
         * // Create some namespace
         * tinymce.createNS('tinymce.somepackage.subpackage');
         *
         * // Add a singleton
         * var tinymce.somepackage.subpackage.SomeSingleton = {
         *     method : function() {
         *         // Some method
         *     }
         * };
         */
        createNS : function(n, o) {
            var i, v;

            o = o || win;

            n = n.split('.');
            for (i=0; i<n.length; i++) {
                v = n[i];

                if (!o[v])
                    o[v] = {};

                o = o[v];
            }

            return o;
        },

        /**
         * Resolves a string and returns the object from a specific structure.
         *
         * @method resolve
         * @param {String} n Path to resolve for example a.b.c.d.
         * @param {Object} o Optional object to search though, defaults to window.
         * @return {Object} Last object in path or null if it couldn't be resolved.
         * @example
         * // Resolve a path into an object reference
         * var obj = tinymce.resolve('a.b.c.d');
         */
        resolve : function(n, o) {
            var i, l;

            o = o || win;

            n = n.split('.');
            for (i = 0, l = n.length; i < l; i++) {
                o = o[n[i]];

                if (!o)
                    break;
            }

            return o;
        },

        /**
         * Adds an unload handler to the document. This handler will be executed when the document gets unloaded.
         * This method is useful for dealing with browser memory leaks where it might be vital to remove DOM references etc.
         *
         * @method addUnload
         * @param {function} f Function to execute before the document gets unloaded.
         * @param {Object} s Optional scope to execute the function in.
         * @return {function} Returns the specified unload handler function.
         * @example
         * // Fixes a leak with a DOM element that was palces in the someObject
         * tinymce.addUnload(function() {
         *     // Null DOM element to reduce IE memory leak
         *     someObject.someElement = null;
         * });
         */
        addUnload : function(f, s) {
            var t = this;

            f = {func : f, scope : s || this};

            if (!t.unloads) {
                function unload() {
                    var li = t.unloads, o, n;

                    if (li) {
                        // Call unload handlers
                        for (n in li) {
                            o = li[n];

                            if (o && o.func)
                                o.func.call(o.scope, 1); // Send in one arg to distinct unload and user destroy
                        }

                        // Detach unload function
                        if (win.detachEvent) {
                            win.detachEvent('onbeforeunload', fakeUnload);
                            win.detachEvent('onunload', unload);
                        } else if (win.removeEventListener)
                            win.removeEventListener('unload', unload, false);

                        // Destroy references
                        t.unloads = o = li = w = unload = 0;

                        // Run garbarge collector on IE
                        if (win.CollectGarbage)
                            CollectGarbage();
                    }
                };

                function fakeUnload() {
                    var d = document;

                    // Is there things still loading, then do some magic
                    if (d.readyState == 'interactive') {
                        function stop() {
                            // Prevent memory leak
                            d.detachEvent('onstop', stop);

                            // Call unload handler
                            if (unload)
                                unload();

                            d = 0;
                        };

                        // Fire unload when the currently loading page is stopped
                        if (d)
                            d.attachEvent('onstop', stop);

                        // Remove onstop listener after a while to prevent the unload function
                        // to execute if the user presses cancel in an onbeforeunload
                        // confirm dialog and then presses the browser stop button
                        win.setTimeout(function() {
                            if (d)
                                d.detachEvent('onstop', stop);
                        }, 0);
                    }
                };

                // Attach unload handler
                if (win.attachEvent) {
                    win.attachEvent('onunload', unload);
                    win.attachEvent('onbeforeunload', fakeUnload);
                } else if (win.addEventListener)
                    win.addEventListener('unload', unload, false);

                // Setup initial unload handler array
                t.unloads = [f];
            } else
                t.unloads.push(f);

            return f;
        },

        /**
         * Removes the specified function form the unload handler list.
         *
         * @method removeUnload
         * @param {function} f Function to remove from unload handler list.
         * @return {function} Removed function name or null if it wasn't found.
         */
        removeUnload : function(f) {
            var u = this.unloads, r = null;

            tinymce.each(u, function(o, i) {
                if (o && o.func == f) {
                    u.splice(i, 1);
                    r = f;
                    return false;
                }
            });

            return r;
        },

        /**
         * Splits a string but removes the whitespace before and after each value.
         *
         * @method explode
         * @param {string} s String to split.
         * @param {string} d Delimiter to split by.
         * @example
         * // Split a string into an array with a,b,c
         * var arr = tinymce.explode('a, b,   c');
         */
        explode : function(s, d) {
            return s ? tinymce.map(s.split(d || ','), tinymce.trim) : s;
        },

        _addVer : function(u) {
            var v;

            if (!this.query)
                return u;

            v = (u.indexOf('?') == -1 ? '?' : '&') + this.query;

            if (u.indexOf('#') == -1)
                return u + v;

            return u.replace('#', v + '#');
        },

        // Fix function for IE 9 where regexps isn't working correctly
        // Todo: remove me once MS fixes the bug
        _replace : function(find, replace, str) {
            // On IE9 we have to fake $x replacement
            if (isRegExpBroken) {
                return str.replace(find, function() {
                    var val = replace, args = arguments, i;

                    for (i = 0; i < args.length - 2; i++) {
                        if (args[i] === undefined) {
                            val = val.replace(new RegExp('\\$' + i, 'g'), '');
                        } else {
                            val = val.replace(new RegExp('\\$' + i, 'g'), args[i]);
                        }
                    }

                    return val;
                });
            }

            return str.replace(find, replace);
        }

        /**#@-*/
    };

    // Initialize the API
    tinymce._init();

    //assign to global object
    win.tinyMCE = win.tinymce = tinymce;

    // Describe the different namespaces

    /**
     * Root level namespace this contains classes directly releated to the TinyMCE editor.
     *
     * @namespace tinymce
     */

    /**
     * Contains classes for handling the browsers DOM.
     *
     * @namespace tinymce.dom
     */

    /**
     * Contains html parser and serializer logic.
     *
     * @namespace tinymce.html
     */

    /**
     * Contains the different UI types such as buttons, listboxes etc.
     *
     * @namespace tinymce.ui
     */

    /**
     * Contains various utility classes such as json parser, cookies etc.
     *
     * @namespace tinymce.util
     */

    /**
     * Contains plugin classes.
     *
     * @namespace tinymce.plugins
     */
})(window);
/**
 * Dispatcher.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class is used to dispatch event to observers/listeners.
 * All internal events inside TinyMCE uses this class.
 *
 * @class tinymce.util.Dispatcher
 * @example
 * // Creates a custom event
 * this.onSomething = new tinymce.util.Dispatcher(this);
 * 
 * // Dispatch/fire the event
 * this.onSomething.dispatch('some string');
 */
tinymce.create('tinymce.util.Dispatcher', {
	scope : null,
	listeners : null,

	/**
	 * Constructs a new event dispatcher object.
	 *
	 * @constructor
	 * @method Dispatcher
	 * @param {Object} s Optional default execution scope for all observer functions.
	 */
	Dispatcher : function(s) {
		this.scope = s || this;
		this.listeners = [];
	},

	/**
	 * Add an observer function to be executed when a dispatch call is done.
	 *
	 * @method add
	 * @param {function} cb Callback function to execute when a dispatch event occurs.
	 * @param {Object} s Optional execution scope, defaults to the one specified in the class constructor.
	 * @return {function} Returns the same function as the one passed on.
	 */
	add : function(cb, s) {
		this.listeners.push({cb : cb, scope : s || this.scope});

		return cb;
	},

	/**
	 * Add an observer function to be executed to the top of the list of observers.
	 *
	 * @method addToTop
	 * @param {function} cb Callback function to execute when a dispatch event occurs.
	 * @param {Object} s Optional execution scope, defaults to the one specified in the class constructor.
	 * @return {function} Returns the same function as the one passed on.
	 */
	addToTop : function(cb, s) {
		this.listeners.unshift({cb : cb, scope : s || this.scope});

		return cb;
	},

	/**
	 * Removes an observer function.
	 *
	 * @method remove
	 * @param {function} cb Observer function to remove.
	 * @return {function} The same function that got passed in or null if it wasn't found.
	 */
	remove : function(cb) {
		var l = this.listeners, o = null;

		tinymce.each(l, function(c, i) {
			if (cb == c.cb) {
				o = cb;
				l.splice(i, 1);
				return false;
			}
		});

		return o;
	},

	/**
	 * Dispatches an event to all observers/listeners.
	 *
	 * @method dispatch
	 * @param {Object} .. Any number of arguments to dispatch.
	 * @return {Object} Last observer functions return value.
	 */
	dispatch : function() {
		var s, a = arguments, i, li = this.listeners, c;

		// Needs to be a real loop since the listener count might change while looping
		// And this is also more efficient
		for (i = 0; i<li.length; i++) {
			c = li[i];
			s = c.cb.apply(c.scope, a.length > 0 ? a : [c.scope]);

			if (s === false)
				break;
		}

		return s;
	}

	/**#@-*/
});

/**
 * URI.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var each = tinymce.each;

	/**
	 * This class handles parsing, modification and serialization of URI/URL strings.
	 * @class tinymce.util.URI
	 */
	tinymce.create('tinymce.util.URI', {
		/**
		 * Constucts a new URI instance.
		 *
		 * @constructor
		 * @method URI
		 * @param {String} u URI string to parse.
		 * @param {Object} s Optional settings object.
		 */
		URI : function(u, s) {
			var t = this, o, a, b, base_url;

			// Trim whitespace
			u = tinymce.trim(u);

			// Default settings
			s = t.settings = s || {};

			// Strange app protocol that isn't http/https or local anchor
			// For example: mailto,skype,tel etc.
			if (/^([\w\-]+):([^\/]{2})/i.test(u) || /^\s*#/.test(u)) {
				t.source = u;
				return;
			}

			// Absolute path with no host, fake host and protocol
			if (u.indexOf('/') === 0 && u.indexOf('//') !== 0)
				u = (s.base_uri ? s.base_uri.protocol || 'http' : 'http') + '://mce_host' + u;

			// Relative path http:// or protocol relative //path
			if (!/^[\w-]*:?\/\//.test(u)) {
				base_url = s.base_uri ? s.base_uri.path : new tinymce.util.URI(location.href).directory;
				u = ((s.base_uri && s.base_uri.protocol) || 'http') + '://mce_host' + t.toAbsPath(base_url, u);
			}

			// Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
			u = u.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something
			u = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(u);
			each(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"], function(v, i) {
				var s = u[i];

				// Zope 3 workaround, they use @@something
				if (s)
					s = s.replace(/\(mce_at\)/g, '@@');

				t[v] = s;
			});

			if (b = s.base_uri) {
				if (!t.protocol)
					t.protocol = b.protocol;

				if (!t.userInfo)
					t.userInfo = b.userInfo;

				if (!t.port && t.host == 'mce_host')
					t.port = b.port;

				if (!t.host || t.host == 'mce_host')
					t.host = b.host;

				t.source = '';
			}

			//t.path = t.path || '/';
		},

		/**
		 * Sets the internal path part of the URI.
		 *
		 * @method setPath
		 * @param {string} p Path string to set.
		 */
		setPath : function(p) {
			var t = this;

			p = /^(.*?)\/?(\w+)?$/.exec(p);

			// Update path parts
			t.path = p[0];
			t.directory = p[1];
			t.file = p[2];

			// Rebuild source
			t.source = '';
			t.getURI();
		},

		/**
		 * Converts the specified URI into a relative URI based on the current URI instance location.
		 *
		 * @method toRelative
		 * @param {String} u URI to convert into a relative path/URI.
		 * @return {String} Relative URI from the point specified in the current URI instance.
		 * @example
		 * // Converts an absolute URL to an relative URL url will be somedir/somefile.htm
		 * var url = new tinymce.util.URI('http://www.site.com/dir/').toRelative('http://www.site.com/dir/somedir/somefile.htm');
		 */
		toRelative : function(u) {
			var t = this, o;

			if (u === "./")
				return u;

			u = new tinymce.util.URI(u, {base_uri : t});

			// Not on same domain/port or protocol
			if ((u.host != 'mce_host' && t.host != u.host && u.host) || t.port != u.port || t.protocol != u.protocol)
				return u.getURI();

			o = t.toRelPath(t.path, u.path);

			// Add query
			if (u.query)
				o += '?' + u.query;

			// Add anchor
			if (u.anchor)
				o += '#' + u.anchor;

			return o;
		},
	
		/**
		 * Converts the specified URI into a absolute URI based on the current URI instance location.
		 *
		 * @method toAbsolute
		 * @param {String} u URI to convert into a relative path/URI.
		 * @param {Boolean} nh No host and protocol prefix.
		 * @return {String} Absolute URI from the point specified in the current URI instance.
		 * @example
		 * // Converts an relative URL to an absolute URL url will be http://www.site.com/dir/somedir/somefile.htm
		 * var url = new tinymce.util.URI('http://www.site.com/dir/').toAbsolute('somedir/somefile.htm');
		 */
		toAbsolute : function(u, nh) {
			var u = new tinymce.util.URI(u, {base_uri : this});

			return u.getURI(this.host == u.host && this.protocol == u.protocol ? nh : 0);
		},

		/**
		 * Converts a absolute path into a relative path.
		 *
		 * @method toRelPath
		 * @param {String} base Base point to convert the path from.
		 * @param {String} path Absolute path to convert into a relative path.
		 */
		toRelPath : function(base, path) {
			var items, bp = 0, out = '', i, l;

			// Split the paths
			base = base.substring(0, base.lastIndexOf('/'));
			base = base.split('/');
			items = path.split('/');

			if (base.length >= items.length) {
				for (i = 0, l = base.length; i < l; i++) {
					if (i >= items.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (base.length < items.length) {
				for (i = 0, l = items.length; i < l; i++) {
					if (i >= base.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (bp == 1)
				return path;

			for (i = 0, l = base.length - (bp - 1); i < l; i++)
				out += "../";

			for (i = bp - 1, l = items.length; i < l; i++) {
				if (i != bp - 1)
					out += "/" + items[i];
				else
					out += items[i];
			}

			return out;
		},

		/**
		 * Converts a relative path into a absolute path.
		 *
		 * @method toAbsPath
		 * @param {String} base Base point to convert the path from.
		 * @param {String} path Relative path to convert into an absolute path.
		 */
		toAbsPath : function(base, path) {
			var i, nb = 0, o = [], tr, outPath;

			// Split paths
			tr = /\/$/.test(path) ? '/' : '';
			base = base.split('/');
			path = path.split('/');

			// Remove empty chunks
			each(base, function(k) {
				if (k)
					o.push(k);
			});

			base = o;

			// Merge relURLParts chunks
			for (i = path.length - 1, o = []; i >= 0; i--) {
				// Ignore empty or .
				if (path[i].length == 0 || path[i] == ".")
					continue;

				// Is parent
				if (path[i] == '..') {
					nb++;
					continue;
				}

				// Move up
				if (nb > 0) {
					nb--;
					continue;
				}

				o.push(path[i]);
			}

			i = base.length - nb;

			// If /a/b/c or /
			if (i <= 0)
				outPath = o.reverse().join('/');
			else
				outPath = base.slice(0, i).join('/') + '/' + o.reverse().join('/');

			// Add front / if it's needed
			if (outPath.indexOf('/') !== 0)
				outPath = '/' + outPath;

			// Add traling / if it's needed
			if (tr && outPath.lastIndexOf('/') !== outPath.length - 1)
				outPath += tr;

			return outPath;
		},

		/**
		 * Returns the full URI of the internal structure.
		 *
		 * @method getURI
		 * @param {Boolean} nh Optional no host and protocol part. Defaults to false.
		 */
		getURI : function(nh) {
			var s, t = this;

			// Rebuild source
			if (!t.source || nh) {
				s = '';

				if (!nh) {
					if (t.protocol)
						s += t.protocol + '://';

					if (t.userInfo)
						s += t.userInfo + '@';

					if (t.host)
						s += t.host;

					if (t.port)
						s += ':' + t.port;
				}

				if (t.path)
					s += t.path;

				if (t.query)
					s += '?' + t.query;

				if (t.anchor)
					s += '#' + t.anchor;

				t.source = s;
			}

			return t.source;
		}
	});
})();

/**
 * Cookie.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var each = tinymce.each;

	/**
	 * This class contains simple cookie manangement functions.
	 *
	 * @class tinymce.util.Cookie
	 * @static
	 * @example
	 * // Gets a cookie from the browser
	 * console.debug(tinymce.util.Cookie.get('mycookie'));
	 * 
	 * // Gets a hash table cookie from the browser and takes out the x parameter from it
	 * console.debug(tinymce.util.Cookie.getHash('mycookie').x);
	 * 
	 * // Sets a hash table cookie to the browser
	 * tinymce.util.Cookie.setHash({x : '1', y : '2'});
	 */
	tinymce.create('static tinymce.util.Cookie', {
		/**
		 * Parses the specified query string into an name/value object.
		 *
		 * @method getHash
		 * @param {String} n String to parse into a n Hashtable object.
		 * @return {Object} Name/Value object with items parsed from querystring.
		 */
		getHash : function(n) {
			var v = this.get(n), h;

			if (v) {
				each(v.split('&'), function(v) {
					v = v.split('=');
					h = h || {};
					h[unescape(v[0])] = unescape(v[1]);
				});
			}

			return h;
		},

		/**
		 * Sets a hashtable name/value object to a cookie.
		 *
		 * @method setHash
		 * @param {String} n Name of the cookie.
		 * @param {Object} v Hashtable object to set as cookie.
		 * @param {Date} e Optional date object for the expiration of the cookie.
		 * @param {String} p Optional path to restrict the cookie to.
		 * @param {String} d Optional domain to restrict the cookie to.
		 * @param {String} s Is the cookie secure or not.
		 */
		setHash : function(n, v, e, p, d, s) {
			var o = '';

			each(v, function(v, k) {
				o += (!o ? '' : '&') + escape(k) + '=' + escape(v);
			});

			this.set(n, o, e, p, d, s);
		},

		/**
		 * Gets the raw data of a cookie by name.
		 *
		 * @method get
		 * @param {String} n Name of cookie to retrive.
		 * @return {String} Cookie data string.
		 */
		get : function(n) {
			var c = document.cookie, e, p = n + "=", b;

			// Strict mode
			if (!c)
				return;

			b = c.indexOf("; " + p);

			if (b == -1) {
				b = c.indexOf(p);

				if (b != 0)
					return null;
			} else
				b += 2;

			e = c.indexOf(";", b);

			if (e == -1)
				e = c.length;

			return unescape(c.substring(b + p.length, e));
		},

		/**
		 * Sets a raw cookie string.
		 *
		 * @method set
		 * @param {String} n Name of the cookie.
		 * @param {String} v Raw cookie data.
		 * @param {Date} e Optional date object for the expiration of the cookie.
		 * @param {String} p Optional path to restrict the cookie to.
		 * @param {String} d Optional domain to restrict the cookie to.
		 * @param {String} s Is the cookie secure or not.
		 */
		set : function(n, v, e, p, d, s) {
			document.cookie = n + "=" + escape(v) +
				((e) ? "; expires=" + e.toGMTString() : "") +
				((p) ? "; path=" + escape(p) : "") +
				((d) ? "; domain=" + d : "") +
				((s) ? "; secure" : "");
		},

		/**
		 * Removes/deletes a cookie by name.
		 *
		 * @method remove
		 * @param {String} n Cookie name to remove/delete.
		 * @param {Strong} p Optional path to remove the cookie from.
		 */
		remove : function(n, p) {
			var d = new Date();

			d.setTime(d.getTime() - 1000);

			this.set(n, '', d, p, d);
		}
	});
})();

/**
 * JSON.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	function serialize(o, quote) {
		var i, v, t;

		quote = quote || '"';

		if (o == null)
			return 'null';

		t = typeof o;

		if (t == 'string') {
			v = '\bb\tt\nn\ff\rr\""\'\'\\\\';

			return quote + o.replace(/([\u0080-\uFFFF\x00-\x1f\"\'\\])/g, function(a, b) {
				// Make sure single quotes never get encoded inside double quotes for JSON compatibility
				if (quote === '"' && a === "'")
					return a;

				i = v.indexOf(b);

				if (i + 1)
					return '\\' + v.charAt(i + 1);

				a = b.charCodeAt().toString(16);

				return '\\u' + '0000'.substring(a.length) + a;
			}) + quote;
		}

		if (t == 'object') {
			if (o.hasOwnProperty && o instanceof Array) {
					for (i=0, v = '['; i<o.length; i++)
						v += (i > 0 ? ',' : '') + serialize(o[i], quote);

					return v + ']';
				}

				v = '{';

				for (i in o) {
					if (o.hasOwnProperty(i)) {
						v += typeof o[i] != 'function' ? (v.length > 1 ? ',' + quote : quote) + i + quote +':' + serialize(o[i], quote) : '';
					}
				}

				return v + '}';
		}

		return '' + o;
	};

	/**
	 * JSON parser and serializer class.
	 *
	 * @class tinymce.util.JSON
	 * @static
	 * @example
	 * // JSON parse a string into an object
	 * var obj = tinymce.util.JSON.parse(somestring);
	 * 
	 * // JSON serialize a object into an string
	 * var str = tinymce.util.JSON.serialize(obj);
	 */
	tinymce.util.JSON = {
		/**
		 * Serializes the specified object as a JSON string.
		 *
		 * @method serialize
		 * @param {Object} obj Object to serialize as a JSON string.
		 * @param {String} quote Optional quote string defaults to ".
		 * @return {string} JSON string serialized from input.
		 */
		serialize: serialize,

		/**
		 * Unserializes/parses the specified JSON string into a object.
		 *
		 * @method parse
		 * @param {string} s JSON String to parse into a JavaScript object.
		 * @return {Object} Object from input JSON string or undefined if it failed.
		 */
		parse: function(s) {
			try {
				return eval('(' + s + ')');
			} catch (ex) {
				// Ignore
			}
		}

		/**#@-*/
	};
})();

/**
 * XHR.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class enables you to send XMLHTTPRequests cross browser.
 * @class tinymce.util.XHR
 * @static
 * @example
 * // Sends a low level Ajax request
 * tinymce.util.XHR.send({
 *    url : 'someurl',
 *    success : function(text) {
 *       console.debug(text);
 *    }
 * });
 */
tinymce.create('static tinymce.util.XHR', {
	/**
	 * Sends a XMLHTTPRequest.
	 * Consult the Wiki for details on what settings this method takes.
	 *
	 * @method send
	 * @param {Object} o Object will target URL, callbacks and other info needed to make the request.
	 */
	send : function(o) {
		var x, t, w = window, c = 0;

		// Default settings
		o.scope = o.scope || this;
		o.success_scope = o.success_scope || o.scope;
		o.error_scope = o.error_scope || o.scope;
		o.async = o.async === false ? false : true;
		o.data = o.data || '';

		function get(s) {
			x = 0;

			try {
				x = new ActiveXObject(s);
			} catch (ex) {
			}

			return x;
		};

		x = w.XMLHttpRequest ? new XMLHttpRequest() : get('Microsoft.XMLHTTP') || get('Msxml2.XMLHTTP');

		if (x) {
			if (x.overrideMimeType)
				x.overrideMimeType(o.content_type);

			x.open(o.type || (o.data ? 'POST' : 'GET'), o.url, o.async);

			if (o.content_type)
				x.setRequestHeader('Content-Type', o.content_type);

			x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

			x.send(o.data);

			function ready() {
				if (!o.async || x.readyState == 4 || c++ > 10000) {
					if (o.success && c < 10000 && x.status == 200)
						o.success.call(o.success_scope, '' + x.responseText, x, o);
					else if (o.error)
						o.error.call(o.error_scope, c > 10000 ? 'TIMED_OUT' : 'GENERAL', x, o);

					x = null;
				} else
					w.setTimeout(ready, 10);
			};

			// Syncronous request
			if (!o.async)
				return ready();

			// Wait for response, onReadyStateChange can not be used since it leaks memory in IE
			t = w.setTimeout(ready, 10);
		}
	}
});

/**
 * JSONRequest.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var extend = tinymce.extend, JSON = tinymce.util.JSON, XHR = tinymce.util.XHR;

	/**
	 * This class enables you to use JSON-RPC to call backend methods.
	 *
	 * @class tinymce.util.JSONRequest
	 * @example
	 * var json = new tinymce.util.JSONRequest({
	 *     url : 'somebackend.php'
	 * });
	 * 
	 * // Send RPC call 1
	 * json.send({
	 *     method : 'someMethod1',
	 *     params : ['a', 'b'],
	 *     success : function(result) {
	 *         console.dir(result);
	 *     }
	 * });
	 * 
	 * // Send RPC call 2
	 * json.send({
	 *     method : 'someMethod2',
	 *     params : ['a', 'b'],
	 *     success : function(result) {
	 *         console.dir(result);
	 *     }
	 * });
	 */
	tinymce.create('tinymce.util.JSONRequest', {
		/**
		 * Constructs a new JSONRequest instance.
		 *
		 * @constructor
		 * @method JSONRequest
		 * @param {Object} s Optional settings object.
		 */
		JSONRequest : function(s) {
			this.settings = extend({
			}, s);
			this.count = 0;
		},

		/**
		 * Sends a JSON-RPC call. Consult the Wiki API documentation for more details on what you can pass to this function.
		 *
		 * @method send
		 * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
		 */
		send : function(o) {
			var ecb = o.error, scb = o.success;

			o = extend(this.settings, o);

			o.success = function(c, x) {
				c = JSON.parse(c);

				if (typeof(c) == 'undefined') {
					c = {
						error : 'JSON Parse error.'
					};
				}

				if (c.error)
					ecb.call(o.error_scope || o.scope, c.error, x);
				else
					scb.call(o.success_scope || o.scope, c.result);
			};

			o.error = function(ty, x) {
				if (ecb)
					ecb.call(o.error_scope || o.scope, ty, x);
			};

			o.data = JSON.serialize({
				id : o.id || 'c' + (this.count++),
				method : o.method,
				params : o.params
			});

			// JSON content type for Ruby on rails. Bug: #1883287
			o.content_type = 'application/json';

			XHR.send(o);
		},

		'static' : {
			/**
			 * Simple helper function to send a JSON-RPC request without the need to initialize an object.
			 * Consult the Wiki API documentation for more details on what you can pass to this function.
			 *
			 * @method sendRPC
			 * @static
			 * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
			 */
			sendRPC : function(o) {
				return new tinymce.util.JSONRequest().send(o);
			}
		}
	});
}());
/**
 * This file exposes a set of the common KeyCodes for use.  Please grow it as needed.
 */

(function(tinymce){
	tinymce.VK = {
		DELETE: 46,
		BACKSPACE: 8,
		ENTER: 13,
		TAB: 9,
        SPACEBAR: 32,
		UP: 38,
		DOWN: 40,
		modifierPressed: function (e) {
			return e.shiftKey || e.ctrlKey || e.altKey;
		}
	}
})(tinymce);

(function(tinymce) {
	var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;

	/**
	 * Fixes a WebKit bug when deleting contents using backspace or delete key.
	 * WebKit will produce a span element if you delete across two block elements.
	 *
	 * Example:
	 * <h1>a</h1><p>|b</p>
	 *
	 * Will produce this on backspace:
	 * <h1>a<span class="Apple-style-span" style="<all runtime styles>">b</span></p>
	 *
	 * This fixes the backspace to produce:
	 * <h1>a|b</p>
	 *
	 * See bug: https://bugs.webkit.org/show_bug.cgi?id=45784
	 *
	 * This code is a bit of a hack and hopefully it will be fixed soon in WebKit.
	 */
	function cleanupStylesWhenDeleting(ed) {
		var dom = ed.dom, selection = ed.selection;

        function findBlocks(rng, isDelete) {
            var blockElm;
            blockElm = dom.getParent(rng.startContainer, dom.isBlock);

            // On delete clone the root span of the next block element
            if (isDelete) {
                return [blockElm, dom.getNext(blockElm, dom.isBlock)];
            }
            return [dom.getPrev(blockElm, dom.isBlock), blockElm];

            //  ATLASSIAN - this is code from the original implementation which no longer applies since CONFDEV-16789.
            //  The new hack is more refined and safer than the old hack.
//				// Locate root span element and clone it since it would otherwise get merged by the "apple-style-span" on delete/backspace
//				if (blockElm) {
//					node = blockElm.firstChild;
//
//					// Ignore empty text nodes
//					while (node && node.nodeType == 3 && node.nodeValue.length == 0)
//						node = node.nextSibling;
//
//					if (node && node.nodeName === 'SPAN') {
//						clonedSpan = node.cloneNode(false);
//					}
//				}
        }

        /**
         * ATLASSIAN
         * @param container is DOM node
         * @param bool is value of attribute 'contenteditable'
         */
        function toggleEditablesInsideBlock(container, bool) {
            if (toString.call(container) === '[object Array]') {
                tinymce.each(container, function (elem) {
                    if (elem) {
                        dom.setAttrib(dom.select('.non-editable', elem), 'contenteditable', bool);
                    } else {
                        //when elem == null, select span inside parent of tiny frame
                        dom.setAttrib(tinymce.DOM.select('.non-editable'), 'contenteditable', bool);
                    }
                });
            } else {
                dom.setAttrib(dom.select('.non-editable', container), 'contenteditable', bool);
            }
        }

        ed.onKeyDown.add(function(ed, e) {
			var rng, blocks, isDelete;

            //ATLASSIAN
            var findSpans = function () {
                var spans = [];
                //CONFDEV-36340: avoid selecting all spans 2 times b/c element will be duplicated
                var ignoreNull = false;
                //blocks returned by 'findBlocks' is always array
                tinymce.each(blocks, function (elem) {
                    if (elem) {
                        spans = spans.concat(dom.select('span', elem));
                    } else if (!ignoreNull) {
                        //when elem == null, select span inside parent of tiny frame
                        spans = spans.concat(tinymce.DOM.select("span"));
                        ignoreNull = true;
                    }
                });
                return spans;
            };

			isDelete = e.keyCode == DELETE;
			if ((isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
				e.preventDefault();
				rng = selection.getRng();
                blocks = findBlocks(rng, isDelete);

				// ATLASSIAN
				// Extracted manually from tinymce commit 8e6422aefa9b6cc526a218559eaf036f1d2868cf to prevent CONFDEV-16789
				// Mark all the existent spans in the parent element, and delete any extra one that gets created
				// after the delete operation, since that one has been added by the browser.

                tinymce.each(
                    findSpans(),
                    function (span) {
                        span.setAttribute('data-mce-mark', '1');
                    }
                );

                // ATLASSIAN CONFDEV-23240
                // in Chrome, pressing DELETE or BACKSPACE to join lines doesn't work well with content un-editable.
                // all texts in the second line, from the un-editable element and forward just disappears
                // solution: make the elements editable before joining lines, and change back after
                var isJoiningAdjacentBlocks = !isDelete && blocks[1] && AJS.EditorUtils.isCursorAtStartOf(blocks[1], rng) ||
                                              isDelete && blocks[0] && AJS.EditorUtils.isCursorAtEndOf(blocks[0], rng);

                isJoiningAdjacentBlocks && toggleEditablesInsideBlock(blocks[1], true);
                // Do the backspace/delete action
                ed.getDoc().execCommand(isDelete ? 'ForwardDelete' : 'Delete', false, null);
                isJoiningAdjacentBlocks && toggleEditablesInsideBlock(blocks, false);

                tinymce.each(
                    findSpans(),
                    function (span) {
                        // ATLASSIAN see above.  No longer meaninful.
                        //                    var bm = selection.getBookmark();

                        //					if (clonedSpan) {
                        //						dom.replace(clonedSpan.cloneNode(false), span, true);
                        //					} else
                        if (!span.getAttribute('data-mce-mark')) {
                            if (span.style.color) {
                                // chrome removed the data mark or it is not data mark.
                                dom.setAttrib(span, 'style', "color: " + span.style.color);
                            } else {
                                // not data mark, no important style (added by chrome)
                                dom.remove(span, true);
                            }
                        } else {
                            span.removeAttribute('data-mce-mark');
                        }

                        //                    // Restore the selection
                        //                    selection.moveToBookmark(bm);
                    }
                );
			}
		});
	};


	/**
	 * WebKit and IE doesn't empty the editor if you select all contents and hit backspace or delete. This fix will check if the body is empty
	 * like a <h1></h1> or <p></p> and then forcefully remove all contents.
	 */
	function emptyEditorWhenDeleting(ed) {

		function serializeRng(rng) {
			var body = ed.dom.create("body");
			var contents = rng.cloneContents();
			body.appendChild(contents);
			return ed.selection.serializer.serialize(body, {format: 'html'});
		}

		function allContentsSelected(rng) {
			var selection = serializeRng(rng);

			var allRng = ed.dom.createRng();
			allRng.selectNode(ed.getBody());

			var allSelection = serializeRng(allRng);
			return selection === allSelection;
		}

		ed.onKeyDown.addToTop(function(ed, e) {
			var keyCode = e.keyCode;
			if (keyCode == DELETE || keyCode == BACKSPACE) {
				var rng = ed.selection.getRng(true);
				if (!rng.collapsed && allContentsSelected(rng)) {
					ed.setContent('', {format : 'raw'});
					ed.nodeChanged();
					e.preventDefault();
				}
			}
		});

	};

	/**
	 * WebKit on MacOS X has a weird issue where it some times fails to properly convert keypresses to input method keystrokes.
	 * So a fix where we just get the range and set the range back seems to do the trick.
	 */
	function inputMethodFocus(ed) {
		ed.dom.bind(ed.getDoc(), 'focusin', function() {
			//ATLASSIAN - Enables pagelayouts (without this the function triggers itself recursively putting focus into the header)
			setTimeout(function(){
				if (ed && !ed.destroyed) { // since we defer, make sure the editor is still there
					ed.selection.setRng(ed.selection.getRng());
				}
			}, 0);
		});
	};

	/**
	 * Backspacing in FireFox/IE from a paragraph into a horizontal rule results in a floating text node because the
	 * browser just deletes the paragraph - the browser fails to merge the text node with a horizontal rule so it is
	 * left there. TinyMCE sees a floating text node and wraps it in a paragraph on the key up event (ForceBlocks.js
	 * addRootBlocks), meaning the action does nothing. With this code, FireFox/IE matche the behaviour of other
     * browsers
	 */
	function removeHrOnBackspace(ed) {
		ed.onKeyDown.add(function(ed, e) {
			if (e.keyCode === BACKSPACE) {
				if (ed.selection.isCollapsed() && ed.selection.getRng(true).startOffset === 0) {
					var node = ed.selection.getNode();
					var previousSibling = node.previousSibling;
					if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "hr") {
						ed.dom.remove(previousSibling);
						tinymce.dom.Event.cancel(e);
					}
				}
			}
		})
	}

    /* ATLASSIAN CONFDEV-6693 Making deleting into a blank line not suck. */
    function removeEmptyParagraphsWhenDeleting(ed) {
        function getSiblings(element) {
            return element.parentNode ? element.parentNode.childNodes || [] : [];
        }

        //A node is valid if it's not part of a table, but we only need to check current/previous/next nodes.
        function validate(node) {
            var isValid = true,
                invalid = /TABLE|TH|TD/;

            isValid = !invalid.test(node.nodeName);
            isValid = (isValid && node.previousSibling) ? !invalid.test(node.previousSibling.nodeName) : isValid;
            isValid = (isValid && node.nextSibling) ? !invalid.test(node.nextSibling.nodeName) : isValid;

            return isValid;
        }

        function shouldBeRemoved(selectionHTML, node, nodeToRemove) {
            var empty = /^&nbsp;$|^<br>$/,
                siblings;

            nodeToRemove = nodeToRemove || node;
            siblings = getSiblings(nodeToRemove);

            return validate(node) && (empty.test(selectionHTML) || (siblings.length > 1 && siblings[0].nodeName == 'BR'));
        }

        function removeNode(ed, node) {
            ed.dom.remove(node);
        }

        function focusNode(ed, node) {
            var sel = ed.selection,
                rng = sel.getRng(true);

            ed.focus();
            node.focus();
            rng.setStart(node, 0);
            rng.setEnd(node, 0);
            sel.setRng(rng);
        }

        function getHTML(node) {
            return node && node.innerHTML && (node.innerHTML.replace(/\uFEFF|\u200B/g, '') || '&nbsp;');
        }

        ed.onKeyDown.add(function(ed, e) {
            var node = ed.selection.getNode(),
                nextSibling = node.nextSibling,
                isCollapsed = ed.selection.isCollapsed(),
                previousNode,
                nodeHTML,
                textContent;

            if(isCollapsed && node != ed.dom.getRoot()) {
                if(e.keyCode === BACKSPACE) {
                    if (ed.selection.getRng(true).startOffset === 0) {
                        previousNode = node.previousSibling;
                        nodeHTML = getHTML(previousNode);

                        if(previousNode && shouldBeRemoved(nodeHTML, node, previousNode)) {
                            removeNode(ed, previousNode);
                            tinymce.dom.Event.cancel(e);
                        }
                    }
                } else if(e.keyCode == DELETE) {
                    nodeHTML = getHTML(node);
                    textContent = node.innerText || node.textContent || '';

                    if(getSiblings(node).length <= 1 || node.childNodes.length > 1) {
                        return;
                    }

                    if(nextSibling && shouldBeRemoved(nodeHTML, node, nextSibling)) {
                        removeNode(ed, node);
                        tinymce.dom.Event.cancel(e);
                        focusNode(ed, nextSibling);
                    }
                }
            }
        });
    }
    //ATLASSIAN CONFDEV-6693 END

	/**
	 * Firefox 3.x has an issue where the body element won't get proper focus if you click out
	 * side it's rectangle.
	 */
	function focusBody(ed) {
		// Fix for a focus bug in FF 3.x where the body element
		// wouldn't get proper focus if the user clicked on the HTML element
		if (!Range.prototype.getClientRects) { // Detect getClientRects got introduced in FF 4
			ed.onMouseDown.add(function(ed, e) {
				if (e.target.nodeName === "HTML") {
					var body = ed.getBody();

					// Blur the body it's focused but not correctly focused
					body.blur();

					// Refocus the body after a little while
					setTimeout(function() {
						body.focus();
					}, 0);
				}
			});
		}
	};

	/**
	 * WebKit has a bug where it isn't possible to select image, hr or anchor elements
	 * by clicking on them so we need to fake that.
	 */
	function selectControlElements(ed) {
		ed.onClick.add(function(ed, e) {
			e = e.target;

			// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
			// WebKit can't even do simple things like selecting an image
			// Needs tobe the setBaseAndExtend or it will fail to select floated images
			if (/^(IMG|HR)$/.test(e.nodeName))
				ed.selection.getSel().setBaseAndExtent(e, 0, e, 1);

			if (e.nodeName == 'A' && ed.dom.hasClass(e, 'mceItemAnchor'))
				ed.selection.select(e);

			ed.nodeChanged();
		});
	};

	/**
	 * If you hit enter from a heading in IE, the resulting P tag below it shares the style property (bad)
	 * */
	function removeStylesOnPTagsInheritedFromHeadingTag(ed) {
		ed.onKeyDown.add(function(ed, event) {
			function checkInHeadingTag(ed) {
				var currentNode = ed.selection.getNode();
				var headingTags = 'h1,h2,h3,h4,h5,h6';
				return ed.dom.is(currentNode, headingTags) || ed.dom.getParent(currentNode, headingTags) !== null;
			}

			if (event.keyCode === VK.ENTER && !VK.modifierPressed(event) && checkInHeadingTag(ed)) {
				setTimeout(function() {
					var currentNode = ed.selection.getNode();
					if (ed.dom.is(currentNode, 'p')) {
						ed.dom.setAttrib(currentNode, 'style', null);
						// While tiny's content is correct after this method call, the content shown is not representative of it and needs to be 'repainted'
						ed.execCommand('mceCleanup');
					}
				}, 0);
			}
		});
	};

	/**
	 * WebKit has a bug where it isn't possible to select image, hr or anchor elements
	 * by clicking on them so we need to fake that.
	 */
	function selectControlElements(ed) {
		ed.onClick.add(function(ed, e) {
			e = e.target;

			// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
			// WebKit can't even do simple things like selecting an image
			// Needs tobe the setBaseAndExtend or it will fail to select floated images
			if (/^(IMG|HR)$/.test(e.nodeName))
				ed.selection.getSel().setBaseAndExtent(e, 0, e, 1);

			if (e.nodeName == 'A' && ed.dom.hasClass(e, 'mceItemAnchor'))
				ed.selection.select(e);

			ed.nodeChanged();
		});
	};

	function ensureBodyHasRoleApplication(ed) {
		document.body.setAttribute("role", "application");
	}
	/**
	 * Fire a nodeChanged when the selection is changed on WebKit this fixes selection issues on iOS5. It only fires the nodeChange
	 * event every 50ms since it would other wise update the UI when you type and it hogs the CPU.
	 */
	function selectionChangeNodeChanged(ed) {
		var lastRng, selectionTimer;

		ed.dom.bind(ed.getDoc(), 'selectionchange', function() {
			if (selectionTimer) {
				clearTimeout(selectionTimer);
				selectionTimer = 0;
			}

			selectionTimer = window.setTimeout(function() {
				var rng = ed.selection.getRng();

				// Compare the ranges to see if it was a real change or not
				if (!lastRng || !tinymce.dom.RangeUtils.compareRanges(rng, lastRng)) {
					ed.nodeChanged();
					lastRng = rng;
				}
			}, 50);
		});
	}

	/**
	 * Screen readers on IE needs to have the role application set on the body.
	 */
	function ensureBodyHasRoleApplication(ed) {
		document.body.setAttribute("role", "application");
	}

	tinymce.create('tinymce.util.Quirks', {
		Quirks: function(ed) {
			// WebKit
			if (tinymce.isWebKit) {
				// Atlassian - CONFDEV-6693 We already have a fix for this in the Confluence cleanup plugin.
				// Needs to be enable for Chrome though: CONFDEV-16789 and CONF-29193
				if (tinymce.isChrome){
					cleanupStylesWhenDeleting(ed);
				}
				emptyEditorWhenDeleting(ed);
				inputMethodFocus(ed);
				selectControlElements(ed);

				// iOS
				if (tinymce.isIDevice) {
					selectionChangeNodeChanged(ed);
				}

                //ATLASSIAN CONFDEV-6693
                removeEmptyParagraphsWhenDeleting(ed);
			}

			// IE
			if (tinymce.isIE) {
				removeHrOnBackspace(ed);
				emptyEditorWhenDeleting(ed);
				ensureBodyHasRoleApplication(ed);
				removeStylesOnPTagsInheritedFromHeadingTag(ed);

				//ATLASSIAN CONFDEV-6693
				removeEmptyParagraphsWhenDeleting(ed);
			}

			// Gecko
			if (tinymce.isGecko) {
				removeHrOnBackspace(ed);

				//ATLASSIAN CONFDEV-6693
                removeEmptyParagraphsWhenDeleting(ed);

				focusBody(ed);
			}
		}
	});
})(tinymce);

/**
 * Entities.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var namedEntities, baseEntities, reverseEntities,
		attrsCharsRegExp = /[&<>\"\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		textCharsRegExp = /[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		rawCharsRegExp = /[<>&\"\']/g,
		entityRegExp = /&(#x|#)?([\w]+);/g,
		asciiMap = {
				128 : "\u20AC", 130 : "\u201A", 131 : "\u0192", 132 : "\u201E", 133 : "\u2026", 134 : "\u2020",
				135 : "\u2021", 136 : "\u02C6", 137 : "\u2030", 138 : "\u0160", 139 : "\u2039", 140 : "\u0152",
				142 : "\u017D", 145 : "\u2018", 146 : "\u2019", 147 : "\u201C", 148 : "\u201D", 149 : "\u2022",
				150 : "\u2013", 151 : "\u2014", 152 : "\u02DC", 153 : "\u2122", 154 : "\u0161", 155 : "\u203A",
				156 : "\u0153", 158 : "\u017E", 159 : "\u0178"
		};

	// Raw entities
	baseEntities = {
		'\"' : '&quot;', // Needs to be escaped since the YUI compressor would otherwise break the code
		"'" : '&#39;',
		'<' : '&lt;',
		'>' : '&gt;',
		'&' : '&amp;'
	};

	// Reverse lookup table for raw entities
	reverseEntities = {
		'&lt;' : '<',
		'&gt;' : '>',
		'&amp;' : '&',
		'&quot;' : '"',
		'&apos;' : "'"
	};

	// Decodes text by using the browser
	function nativeDecode(text) {
		var elm;

		elm = document.createElement("div");
		elm.innerHTML = text;

		return elm.textContent || elm.innerText || text;
	};

	// Build a two way lookup table for the entities
	function buildEntitiesLookup(items, radix) {
		var i, chr, entity, lookup = {};

		if (items) {
			items = items.split(',');
			radix = radix || 10;

			// Build entities lookup table
			for (i = 0; i < items.length; i += 2) {
				chr = String.fromCharCode(parseInt(items[i], radix));

				// Only add non base entities
				if (!baseEntities[chr]) {
					entity = '&' + items[i + 1] + ';';
					lookup[chr] = entity;
					lookup[entity] = chr;
				}
			}

			return lookup;
		}
	};

	// Unpack entities lookup where the numbers are in radix 32 to reduce the size
	namedEntities = buildEntitiesLookup(
		'50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' +
		'5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' +
		'5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' +
		'5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' +
		'68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' +
		'6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' +
		'6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' +
		'75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' +
		'7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' +
		'7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' +
		'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' +
		'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' +
		't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' +
		'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' +
		'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' +
		'81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' +
		'8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' +
		'8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' +
		'8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' +
		'8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' +
		'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' +
		'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' +
		'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' +
		'80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' +
		'811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro'
	, 32);

	tinymce.html = tinymce.html || {};

	/**
	 * Entity encoder class.
	 *
	 * @class tinymce.html.SaxParser
	 * @static
	 * @version 3.4
	 */
	tinymce.html.Entities = {
		/**
		 * Encodes the specified string using raw entities. This means only the required XML base entities will be endoded.
		 *
		 * @method encodeRaw
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @return {String} Entity encoded text.
		 */
		encodeRaw : function(text, attr) {
			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				return baseEntities[chr] || chr;
			});
		},

		/**
		 * Encoded the specified text with both the attributes and text entities. This function will produce larger text contents
		 * since it doesn't know if the context is within a attribute or text node. This was added for compatibility
		 * and is exposed as the DOMUtils.encode function.
		 *
		 * @method encodeAllRaw
		 * @param {String} text Text to encode.
		 * @return {String} Entity encoded text.
		 */
		encodeAllRaw : function(text) {
			return ('' + text).replace(rawCharsRegExp, function(chr) {
				return baseEntities[chr] || chr;
			});
		},

		/**
		 * Encodes the specified string using numeric entities. The core entities will be encoded as named ones but all non lower ascii characters
		 * will be encoded into numeric entities.
		 *
		 * @method encodeNumeric
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @return {String} Entity encoded text.
		 */
		encodeNumeric : function(text, attr) {
			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				// Multi byte sequence convert it to a single entity
				if (chr.length > 1)
					return '&#' + (((chr.charCodeAt(0) - 0xD800) * 0x400) + (chr.charCodeAt(1) - 0xDC00) + 0x10000) + ';';

				return baseEntities[chr] || '&#' + chr.charCodeAt(0) + ';';
			});
		},

		/**
		 * Encodes the specified string using named entities. The core entities will be encoded as named ones but all non lower ascii characters
		 * will be encoded into named entities.
		 *
		 * @method encodeNamed
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @param {Object} entities Optional parameter with entities to use.
		 * @return {String} Entity encoded text.
		 */
		encodeNamed : function(text, attr, entities) {
			entities = entities || namedEntities;

			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				return baseEntities[chr] || entities[chr] || chr;
			});
		},

		/**
		 * Returns an encode function based on the name(s) and it's optional entities.
		 *
		 * @method getEncodeFunc
		 * @param {String} name Comma separated list of encoders for example named,numeric.
		 * @param {String} entities Optional parameter with entities to use instead of the built in set.
		 * @return {function} Encode function to be used.
		 */
		getEncodeFunc : function(name, entities) {
			var Entities = tinymce.html.Entities;

			entities = buildEntitiesLookup(entities) || namedEntities;

			function encodeNamedAndNumeric(text, attr) {
				return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
					return baseEntities[chr] || entities[chr] || '&#' + chr.charCodeAt(0) + ';' || chr;
				});
			};

			function encodeCustomNamed(text, attr) {
				return Entities.encodeNamed(text, attr, entities);
			};

			// Replace + with , to be compatible with previous TinyMCE versions
			name = tinymce.makeMap(name.replace(/\+/g, ','));

			// Named and numeric encoder
			if (name.named && name.numeric)
				return encodeNamedAndNumeric;

			// Named encoder
			if (name.named) {
				// Custom names
				if (entities)
					return encodeCustomNamed;

				return Entities.encodeNamed;
			}

			// Numeric
			if (name.numeric)
				return Entities.encodeNumeric;

			// Raw encoder
			return Entities.encodeRaw;
		},

		/**
		 * Decodes the specified string, this will replace entities with raw UTF characters.
		 *
		 * @param {String} text Text to entity decode.
		 * @return {String} Entity decoded string.
		 */
		decode : function(text) {
			return text.replace(entityRegExp, function(all, numeric, value) {
				if (numeric) {
					value = parseInt(value, numeric.length === 2 ? 16 : 10);

					// Support upper UTF
					if (value > 0xFFFF) {
						value -= 0x10000;

						return String.fromCharCode(0xD800 + (value >> 10), 0xDC00 + (value & 0x3FF));
					} else
						return asciiMap[value] || String.fromCharCode(value);
				}

				return reverseEntities[all] || namedEntities[all] || nativeDecode(all);
			});
		}
	};
})(tinymce);

/**
 * Styles.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class is used to parse CSS styles it also compresses styles to reduce the output size.
 *
 * @example
 * var Styles = new tinymce.html.Styles({
 *    url_converter: function(url) {
 *       return url;
 *    }
 * });
 *
 * styles = Styles.parse('border: 1px solid red');
 * styles.color = 'red';
 *
 * console.log(new tinymce.html.StyleSerializer().serialize(styles));
 *
 * @class tinymce.html.Styles
 * @version 3.4
 */
tinymce.html.Styles = function(settings, schema) {
	var rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi,
		urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi,
		styleRegExp = /\s*([^:]+):\s*([^;]+);?/g,
		trimRightRegExp = /\s+$/,
		urlColorRegExp = /rgb/,
		undef, i, encodingLookup = {}, encodingItems;

	settings = settings || {};

	encodingItems = '\\" \\\' \\; \\: ; : \uFEFF'.split(' ');
	for (i = 0; i < encodingItems.length; i++) {
		encodingLookup[encodingItems[i]] = '\uFEFF' + i;
		encodingLookup['\uFEFF' + i] = encodingItems[i];
	}

	function toHex(match, r, g, b) {
		function hex(val) {
			val = parseInt(val).toString(16);

			return val.length > 1 ? val : '0' + val; // 0 -> 00
		};

		return '#' + hex(r) + hex(g) + hex(b);
	};

	return {
		/**
		 * Parses the specified RGB color value and returns a hex version of that color.
		 *
		 * @method toHex
		 * @param {String} color RGB string value like rgb(1,2,3)
		 * @return {String} Hex version of that RGB value like #FF00FF.
		 */
		toHex : function(color) {
			return color.replace(rgbRegExp, toHex);
		},

		/**
		 * Parses the specified style value into an object collection. This parser will also
		 * merge and remove any redundant items that browsers might have added. It will also convert non hex
		 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
		 *
		 * @method parse
		 * @param {String} css Style value to parse for example: border:1px solid red;.
		 * @return {Object} Object representation of that style like {border : '1px solid red'}
		 */
		parse : function(css) {
			var styles = {}, matches, name, value, isEncoded, urlConverter = settings.url_converter, urlConverterScope = settings.url_converter_scope || this;

			function compress(prefix, suffix) {
				var top, right, bottom, left;

				// Get values and check it it needs compressing
				top = styles[prefix + '-top' + suffix];
				if (!top)
					return;

				right = styles[prefix + '-right' + suffix];
				if (top != right)
					return;

				bottom = styles[prefix + '-bottom' + suffix];
				if (right != bottom)
					return;

				left = styles[prefix + '-left' + suffix];
				if (bottom != left)
					return;

				// Compress
				styles[prefix + suffix] = left;
				delete styles[prefix + '-top' + suffix];
				delete styles[prefix + '-right' + suffix];
				delete styles[prefix + '-bottom' + suffix];
				delete styles[prefix + '-left' + suffix];
			};

			/**
			 * Checks if the specific style can be compressed in other words if all border-width are equal.
			 */
			function canCompress(key) {
				var value = styles[key], i;

				if (!value || value.indexOf(' ') < 0)
					return;

				value = value.split(' ');
				i = value.length;
				while (i--) {
					if (value[i] !== value[0])
						return false;
				}

				styles[key] = value[0];

				return true;
			};

			/**
			 * Compresses multiple styles into one style.
			 */
			function compress2(target, a, b, c) {
				if (!canCompress(a))
					return;

				if (!canCompress(b))
					return;

				if (!canCompress(c))
					return;

				// Compress
				styles[target] = styles[a] + ' ' + styles[b] + ' ' + styles[c];
				delete styles[a];
				delete styles[b];
				delete styles[c];
			};

			// Encodes the specified string by replacing all \" \' ; : with _<num>
			function encode(str) {
				isEncoded = true;

				return encodingLookup[str];
			};

			// Decodes the specified string by replacing all _<num> with it's original value \" \' etc
			// It will also decode the \" \' if keep_slashes is set to fale or omitted
			function decode(str, keep_slashes) {
				if (isEncoded) {
					str = str.replace(/\uFEFF[0-9]/g, function(str) {
						return encodingLookup[str];
					});
				}

				if (!keep_slashes)
					str = str.replace(/\\([\'\";:])/g, "$1");

				return str;
			}

			if (css) {
				// Encode \" \' % and ; and : inside strings so they don't interfere with the style parsing
				css = css.replace(/\\[\"\';:\uFEFF]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, function(str) {
					return str.replace(/[;:]/g, encode);
				});

				// Parse styles
				while (matches = styleRegExp.exec(css)) {
					name = matches[1].replace(trimRightRegExp, '').toLowerCase();
					value = matches[2].replace(trimRightRegExp, '');

					if (name && value.length > 0) {
						// Opera will produce 700 instead of bold in their style values
						if (name === 'font-weight' && value === '700')
							value = 'bold';
						else if (name === 'color' || name === 'background-color') // Lowercase colors like RED
							value = value.toLowerCase();		

						// Convert RGB colors to HEX
						value = value.replace(rgbRegExp, toHex);

						// Convert URLs and force them into url('value') format
						value = value.replace(urlOrStrRegExp, function(match, url, url2, url3, str, str2) {
							str = str || str2;

							if (str) {
								str = decode(str);

								// Force strings into single quote format
								return "'" + str.replace(/\'/g, "\\'") + "'";
							}

							url = decode(url || url2 || url3);

							// Convert the URL to relative/absolute depending on config
							if (urlConverter)
								url = urlConverter.call(urlConverterScope, url, 'style');

							// Output new URL format
							return "url('" + url.replace(/\'/g, "\\'") + "')";
						});

						styles[name] = isEncoded ? decode(value, true) : value;
					}

					styleRegExp.lastIndex = matches.index + matches[0].length;
				}

				// Compress the styles to reduce it's size for example IE will expand styles
				compress("border", "");
				compress("border", "-width");
				compress("border", "-color");
				compress("border", "-style");
				compress("padding", "");
				compress("margin", "");
				compress2('border', 'border-width', 'border-style', 'border-color');

				// Remove pointless border, IE produces these
				if (styles.border === 'medium none')
					delete styles.border;
			}

			return styles;
		},

		/**
		 * Serializes the specified style object into a string.
		 *
		 * @method serialize
		 * @param {Object} styles Object to serialize as string for example: {border : '1px solid red'}
		 * @param {String} element_name Optional element name, if specified only the styles that matches the schema will be serialized.
		 * @return {String} String representation of the style object for example: border: 1px solid red.
		 */
		serialize : function(styles, element_name) {
			var css = '', name, value;

			function serializeStyles(name) {
				var styleList, i, l, value;

				styleList = schema.styles[name];
				if (styleList) {
					for (i = 0, l = styleList.length; i < l; i++) {
						name = styleList[i];
						value = styles[name];

						if (value !== undef && value.length > 0)
							css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
					}
				}
			};

			// Serialize styles according to schema
			if (element_name && schema && schema.styles) {
				// Serialize global styles and element specific styles
				serializeStyles('*');
				serializeStyles(element_name);
			} else {
				// Output the styles in the order they are inside the object
				for (name in styles) {
					value = styles[name];

					if (value !== undef && value.length > 0)
						css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
				}
			}

			return css;
		}
	};
};

/**
 * Schema.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var transitional = {}, boolAttrMap, blockElementsMap, shortEndedElementsMap, nonEmptyElementsMap, customElementsMap = {},
		defaultWhiteSpaceElementsMap, selfClosingElementsMap, makeMap = tinymce.makeMap, each = tinymce.each;

	function split(str, delim) {
		return str.split(delim || ',');
	};

	/**
	 * Unpacks the specified lookup and string data it will also parse it into an object
	 * map with sub object for it's children. This will later also include the attributes.
	 */
	function unpack(lookup, data) {
		var key, elements = {};

		function replace(value) {
			return value.replace(/[A-Z]+/g, function(key) {
				return replace(lookup[key]);
			});
		};

		// Unpack lookup
		for (key in lookup) {
			if (lookup.hasOwnProperty(key))
				lookup[key] = replace(lookup[key]);
		}

		// Unpack and parse data into object map
		replace(data).replace(/#/g, '#text').replace(/(\w+)\[([^\]]+)\]\[([^\]]*)\]/g, function(str, name, attributes, children) {
			attributes = split(attributes, '|');

			elements[name] = {
				attributes : makeMap(attributes),
				attributesOrder : attributes,
				children : makeMap(children, '|', {'#comment' : {}})
			}
		});

		return elements;
	};

	// Build a lookup table for block elements both lowercase and uppercase
	blockElementsMap = 'h1,h2,h3,h4,h5,h6,hr,p,div,address,pre,form,table,tbody,thead,tfoot,' + 
						'th,tr,td,li,ol,ul,caption,blockquote,center,dl,dt,dd,dir,fieldset,' + 
						'noscript,menu,isindex,samp,header,footer,article,section,hgroup';
	blockElementsMap = makeMap(blockElementsMap, ',', makeMap(blockElementsMap.toUpperCase()));

	// This is the XHTML 1.0 transitional elements with it's attributes and children packed to reduce it's size
	transitional = unpack({
		Z : 'H|K|N|O|P',
		Y : 'X|form|R|Q',
		ZG : 'E|span|width|align|char|charoff|valign',
		X : 'p|T|div|U|W|isindex|fieldset|table',
		ZF : 'E|align|char|charoff|valign',
		W : 'pre|hr|blockquote|address|center|noframes',
		ZE : 'abbr|axis|headers|scope|rowspan|colspan|align|char|charoff|valign|nowrap|bgcolor|width|height',
		ZD : '[E][S]',
		U : 'ul|ol|dl|menu|dir',
		ZC : 'p|Y|div|U|W|table|br|span|bdo|object|applet|img|map|K|N|Q',
		T : 'h1|h2|h3|h4|h5|h6',
		ZB : 'X|S|Q',
		S : 'R|P',
		ZA : 'a|G|J|M|O|P',
		R : 'a|H|K|N|O',
		Q : 'noscript|P',
		P : 'ins|del|script',
		O : 'input|select|textarea|label|button',
		N : 'M|L',
		M : 'em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym',
		L : 'sub|sup',
		K : 'J|I',
		J : 'tt|i|b|u|s|strike',
		I : 'big|small|font|basefont',
		H : 'G|F',
		G : 'br|span|bdo',
		F : 'object|applet|img|map|iframe',
		E : 'A|B|C',
		D : 'accesskey|tabindex|onfocus|onblur',
		C : 'onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup',
		B : 'lang|xml:lang|dir',
		A : 'id|class|style|title'
	}, 'script[id|charset|type|language|src|defer|xml:space][]' + 
		'style[B|id|type|media|title|xml:space][]' + 
		'object[E|declare|classid|codebase|data|type|codetype|archive|standby|width|height|usemap|name|tabindex|align|border|hspace|vspace][#|param|Y]' + 
		'param[id|name|value|valuetype|type][]' + 
		'p[E|align][#|S]' + 
		'a[E|D|charset|type|name|href|hreflang|rel|rev|shape|coords|target][#|Z]' + 
		'br[A|clear][]' + 
		'span[E][#|S]' + 
		'bdo[A|C|B][#|S]' + 
		'applet[A|codebase|archive|code|object|alt|name|width|height|align|hspace|vspace][#|param|Y]' + 
		'h1[E|align][#|S]' + 
		'img[E|src|alt|name|longdesc|width|height|usemap|ismap|align|border|hspace|vspace][]' + 
		'map[B|C|A|name][X|form|Q|area]' + 
		'h2[E|align][#|S]' + 
		'iframe[A|longdesc|name|src|frameborder|marginwidth|marginheight|scrolling|align|width|height][#|Y]' + 
		'h3[E|align][#|S]' + 
		'tt[E][#|S]' + 
		'i[E][#|S]' + 
		'b[E][#|S]' + 
		'u[E][#|S]' + 
		's[E][#|S]' + 
		'strike[E][#|S]' + 
		'big[E][#|S]' + 
		'small[E][#|S]' + 
		'font[A|B|size|color|face][#|S]' + 
		'basefont[id|size|color|face][]' + 
		'em[E][#|S]' + 
		'strong[E][#|S]' + 
		'dfn[E][#|S]' + 
		'code[E][#|S]' + 
		'q[E|cite][#|S]' + 
		'samp[E][#|S]' + 
		'kbd[E][#|S]' + 
		'var[E][#|S]' + 
		'cite[E][#|S]' + 
		'abbr[E][#|S]' + 
		'acronym[E][#|S]' + 
		'sub[E][#|S]' + 
		'sup[E][#|S]' + 
		'input[E|D|type|name|value|checked|disabled|readonly|size|maxlength|src|alt|usemap|onselect|onchange|accept|align][]' + 
		'select[E|name|size|multiple|disabled|tabindex|onfocus|onblur|onchange][optgroup|option]' + 
		'optgroup[E|disabled|label][option]' + 
		'option[E|selected|disabled|label|value][]' + 
		'textarea[E|D|name|rows|cols|disabled|readonly|onselect|onchange][]' + 
		'label[E|for|accesskey|onfocus|onblur][#|S]' + 
		'button[E|D|name|value|type|disabled][#|p|T|div|U|W|table|G|object|applet|img|map|K|N|Q]' + 
		'h4[E|align][#|S]' + 
		'ins[E|cite|datetime][#|Y]' + 
		'h5[E|align][#|S]' + 
		'del[E|cite|datetime][#|Y]' + 
		'h6[E|align][#|S]' + 
		'div[E|align][#|Y]' + 
		'ul[E|type|compact][li]' + 
		'li[E|type|value][#|Y]' + 
		'ol[E|type|compact|start][li]' + 
		'dl[E|compact][dt|dd]' + 
		'dt[E][#|S]' + 
		'dd[E][#|Y]' + 
		'menu[E|compact][li]' + 
		'dir[E|compact][li]' + 
		'pre[E|width|xml:space][#|ZA]' + 
		'hr[E|align|noshade|size|width][]' + 
		'blockquote[E|cite][#|Y]' + 
		'address[E][#|S|p]' + 
		'center[E][#|Y]' + 
		'noframes[E][#|Y]' + 
		'isindex[A|B|prompt][]' + 
		'fieldset[E][#|legend|Y]' + 
		'legend[E|accesskey|align][#|S]' + 
		'table[E|summary|width|border|frame|rules|cellspacing|cellpadding|align|bgcolor][caption|col|colgroup|thead|tfoot|tbody|tr]' + 
		'caption[E|align][#|S]' + 
		'col[ZG][]' + 
		'colgroup[ZG][col]' + 
		'thead[ZF][tr]' + 
		'tr[ZF|bgcolor][th|td]' + 
		'th[E|ZE][#|Y]' + 
		'form[E|action|method|name|enctype|onsubmit|onreset|accept|accept-charset|target][#|X|R|Q]' + 
		'noscript[E][#|Y]' + 
		'td[E|ZE][#|Y]' + 
		'tfoot[ZF][tr]' + 
		'tbody[ZF][tr]' + 
		'area[E|D|shape|coords|href|nohref|alt|target][]' + 
		'base[id|href|target][]' + 
		'body[E|onload|onunload|background|bgcolor|text|link|vlink|alink][#|Y]'
	);

	boolAttrMap = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected,autoplay,loop,controls');
	shortEndedElementsMap = makeMap('area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed,source');
	nonEmptyElementsMap = tinymce.extend(makeMap('td,th,iframe,video,audio,object'), shortEndedElementsMap);
	defaultWhiteSpaceElementsMap = makeMap('pre,script,style,textarea,code');
	selfClosingElementsMap = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');

	/**
	 * Schema validator class.
	 *
	 * @class tinymce.html.Schema
	 * @example
	 *  if (tinymce.activeEditor.schema.isValidChild('p', 'span'))
	 *    alert('span is valid child of p.');
	 *
	 *  if (tinymce.activeEditor.schema.getElementRule('p'))
	 *    alert('P is a valid element.');
	 *
	 * @class tinymce.html.Schema
	 * @version 3.4
	 */

	/**
	 * Constructs a new Schema instance.
	 *
	 * @constructor
	 * @method Schema
	 * @param {Object} settings Name/value settings object.
	 */
	tinymce.html.Schema = function(settings) {
		var self = this, elements = {}, children = {}, patternElements = [], validStyles, whiteSpaceElementsMap;

		settings = settings || {};

		// Allow all elements and attributes if verify_html is set to false
		if (settings.verify_html === false)
			settings.valid_elements = '*[*]';

		// Build styles list
		if (settings.valid_styles) {
			validStyles = {};

			// Convert styles into a rule list
			each(settings.valid_styles, function(value, key) {
				validStyles[key] = tinymce.explode(value);
			});
		}

		whiteSpaceElementsMap = settings.whitespace_elements ? makeMap(settings.whitespace_elements) : defaultWhiteSpaceElementsMap;

		// Converts a wildcard expression string to a regexp for example *a will become /.*a/.
		function patternToRegExp(str) {
			return new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');
		};

		// Parses the specified valid_elements string and adds to the current rules
		// This function is a bit hard to read since it's heavily optimized for speed
		function addValidElements(valid_elements) {
			var ei, el, ai, al, yl, matches, element, attr, attrData, elementName, attrName, attrType, attributes, attributesOrder,
				prefix, outputName, globalAttributes, globalAttributesOrder, transElement, key, childKey, value,
				elementRuleRegExp = /^([#+-])?([^\[\/]+)(?:\/([^\[]+))?(?:\[([^\]]+)\])?$/,
				attrRuleRegExp = /^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,
				hasPatternsRegExp = /[*?+]/;

			if (valid_elements) {
				// Split valid elements into an array with rules
				valid_elements = split(valid_elements);

				if (elements['@']) {
					globalAttributes = elements['@'].attributes;
					globalAttributesOrder = elements['@'].attributesOrder;
				}

				// Loop all rules
				for (ei = 0, el = valid_elements.length; ei < el; ei++) {
					// Parse element rule
					matches = elementRuleRegExp.exec(valid_elements[ei]);
					if (matches) {
						// Setup local names for matches
						prefix = matches[1];
						elementName = matches[2];
						outputName = matches[3];
						attrData = matches[4];

						// Create new attributes and attributesOrder
						attributes = {};
						attributesOrder = [];

						// Create the new element
						element = {
							attributes : attributes,
							attributesOrder : attributesOrder
						};

						// Padd empty elements prefix
						if (prefix === '#')
							element.paddEmpty = true;

						// Remove empty elements prefix
						if (prefix === '-')
							element.removeEmpty = true;

						// Copy attributes from global rule into current rule
						if (globalAttributes) {
							for (key in globalAttributes)
								attributes[key] = globalAttributes[key];

							attributesOrder.push.apply(attributesOrder, globalAttributesOrder);
						}

						// Attributes defined
						if (attrData) {
							attrData = split(attrData, '|');
							for (ai = 0, al = attrData.length; ai < al; ai++) {
								matches = attrRuleRegExp.exec(attrData[ai]);
								if (matches) {
									attr = {};
									attrType = matches[1];
									attrName = matches[2].replace(/::/g, ':');
									prefix = matches[3];
									value = matches[4];

									// Required
									if (attrType === '!') {
										element.attributesRequired = element.attributesRequired || [];
										element.attributesRequired.push(attrName);
										attr.required = true;
									}

									// Denied from global
									if (attrType === '-') {
										delete attributes[attrName];
										attributesOrder.splice(tinymce.inArray(attributesOrder, attrName), 1);
										continue;
									}

									// Default value
									if (prefix) {
										// Default value
										if (prefix === '=') {
											element.attributesDefault = element.attributesDefault || [];
											element.attributesDefault.push({name: attrName, value: value});
											attr.defaultValue = value;
										}

										// Forced value
										if (prefix === ':') {
											element.attributesForced = element.attributesForced || [];
											element.attributesForced.push({name: attrName, value: value});
											attr.forcedValue = value;
										}

										// Required values
										if (prefix === '<')
											attr.validValues = makeMap(value, '?');
									}

									// Check for attribute patterns
									if (hasPatternsRegExp.test(attrName)) {
										element.attributePatterns = element.attributePatterns || [];
										attr.pattern = patternToRegExp(attrName);
										element.attributePatterns.push(attr);
									} else {
										// Add attribute to order list if it doesn't already exist
										if (!attributes[attrName])
											attributesOrder.push(attrName);

										attributes[attrName] = attr;
									}
								}
							}
						}

						// Global rule, store away these for later usage
						if (!globalAttributes && elementName == '@') {
							globalAttributes = attributes;
							globalAttributesOrder = attributesOrder;
						}

						// Handle substitute elements such as b/strong
						if (outputName) {
							element.outputName = elementName;
							elements[outputName] = element;
						}

						// Add pattern or exact element
						if (hasPatternsRegExp.test(elementName)) {
							element.pattern = patternToRegExp(elementName);
							patternElements.push(element);
						} else
							elements[elementName] = element;
					}
				}
			}
		};

		function setValidElements(valid_elements) {
			elements = {};
			patternElements = [];

			addValidElements(valid_elements);

			each(transitional, function(element, name) {
				children[name] = element.children;
			});
		};

		// Adds custom non HTML elements to the schema
		function addCustomElements(custom_elements) {
			var customElementRegExp = /^(~)?(.+)$/;

			if (custom_elements) {
				each(split(custom_elements), function(rule) {
					var matches = customElementRegExp.exec(rule),
						inline = matches[1] === '~',
						cloneName = inline ? 'span' : 'div',
						name = matches[2];

					children[name] = children[cloneName];
					customElementsMap[name] = cloneName;

					// If it's not marked as inline then add it to valid block elements
					if (!inline)
						blockElementsMap[name] = {};

					// Add custom elements at span/div positions
					each(children, function(element, child) {
						if (element[cloneName])
							element[name] = element[cloneName];
					});
				});
			}
		};

		// Adds valid children to the schema object
		function addValidChildren(valid_children) {
			var childRuleRegExp = /^([+\-]?)(\w+)\[([^\]]+)\]$/;

			if (valid_children) {
				each(split(valid_children), function(rule) {
					var matches = childRuleRegExp.exec(rule), parent, prefix;

					if (matches) {
						prefix = matches[1];

						// Add/remove items from default
						if (prefix)
							parent = children[matches[2]];
						else
							parent = children[matches[2]] = {'#comment' : {}};

						parent = children[matches[2]];

						each(split(matches[3], '|'), function(child) {
							if (prefix === '-')
								delete parent[child];
							else
								parent[child] = {};
						});
					}
				});
			}
		};

		function getElementRule(name) {
			var element = elements[name], i;

			// Exact match found
			if (element)
				return element;

			// No exact match then try the patterns
			i = patternElements.length;
			while (i--) {
				element = patternElements[i];

				if (element.pattern.test(name))
					return element;
			}
		};

		if (!settings.valid_elements) {
			// No valid elements defined then clone the elements from the transitional spec
			each(transitional, function(element, name) {
				elements[name] = {
					attributes : element.attributes,
					attributesOrder : element.attributesOrder
				};

				children[name] = element.children;
			});

			// Switch these
			each(split('strong/b,em/i'), function(item) {
				item = split(item, '/');
				elements[item[1]].outputName = item[0];
			});

			// Add default alt attribute for images
			elements.img.attributesDefault = [{name: 'alt', value: ''}];

			// Remove these if they are empty by default
			each(split('ol,ul,sub,sup,blockquote,span,font,a,table,tbody,tr'), function(name) {
				elements[name].removeEmpty = true;
			});

			// Padd these by default
			each(split('p,h1,h2,h3,h4,h5,h6,th,td,pre,div,address,caption'), function(name) {
				elements[name].paddEmpty = true;
			});
		} else
			setValidElements(settings.valid_elements);

		addCustomElements(settings.custom_elements);
		addValidChildren(settings.valid_children);
		addValidElements(settings.extended_valid_elements);

		// Todo: Remove this when we fix list handling to be valid
		addValidChildren('+ol[ul|ol],+ul[ul|ol]');

		// If the user didn't allow span only allow internal spans
		if (!getElementRule('span'))
			addValidElements('span[!data-mce-type|*]');

		// Delete invalid elements
		if (settings.invalid_elements) {
			tinymce.each(tinymce.explode(settings.invalid_elements), function(item) {
				if (elements[item])
					delete elements[item];
			});
		}

		/**
		 * Name/value map object with valid parents and children to those parents.
		 *
		 * @example
		 * children = {
		 *    div:{p:{}, h1:{}}
		 * };
		 * @field children
		 * @type {Object}
		 */
		self.children = children;

		/**
		 * Name/value map object with valid styles for each element.
		 *
		 * @field styles
		 * @type {Object}
		 */
		self.styles = validStyles;

		/**
		 * Returns a map with boolean attributes.
		 *
		 * @method getBoolAttrs
		 * @return {Object} Name/value lookup map for boolean attributes.
		 */
		self.getBoolAttrs = function() {
			return boolAttrMap;
		};

		/**
		 * Returns a map with block elements.
		 *
		 * @method getBoolAttrs
		 * @return {Object} Name/value lookup map for block elements.
		 */
		self.getBlockElements = function() {
			return blockElementsMap;
		};

		/**
		 * Returns a map with short ended elements such as BR or IMG.
		 *
		 * @method getShortEndedElements
		 * @return {Object} Name/value lookup map for short ended elements.
		 */
		self.getShortEndedElements = function() {
			return shortEndedElementsMap;
		};

		/**
		 * Returns a map with self closing tags such as <li>.
		 *
		 * @method getSelfClosingElements
		 * @return {Object} Name/value lookup map for self closing tags elements.
		 */
		self.getSelfClosingElements = function() {
			return selfClosingElementsMap;
		};

		/**
		 * Returns a map with elements that should be treated as contents regardless if it has text
		 * content in them or not such as TD, VIDEO or IMG.
		 *
		 * @method getNonEmptyElements
		 * @return {Object} Name/value lookup map for non empty elements.
		 */
		self.getNonEmptyElements = function() {
			return nonEmptyElementsMap;
		};

		/**
		 * Returns a map with elements where white space is to be preserved like PRE or SCRIPT.
		 *
		 * @method getWhiteSpaceElements
		 * @return {Object} Name/value lookup map for white space elements.
		 */
		self.getWhiteSpaceElements = function() {
			return whiteSpaceElementsMap;
		};

		/**
		 * Returns true/false if the specified element and it's child is valid or not
		 * according to the schema.
		 *
		 * @method isValidChild
		 * @param {String} name Element name to check for.
		 * @param {String} child Element child to verify.
		 * @return {Boolean} True/false if the element is a valid child of the specified parent.
		 */
		self.isValidChild = function(name, child) {
			var parent = children[name];

			return !!(parent && parent[child]);
		};

		/**
		 * Returns true/false if the specified element is valid or not
		 * according to the schema.
		 *
		 * @method getElementRule
		 * @param {String} name Element name to check for.
		 * @return {Object} Element object or undefined if the element isn't valid.
		 */
		self.getElementRule = getElementRule;

		/**
		 * Returns an map object of all custom elements.
		 *
		 * @method getCustomElements
		 * @return {Object} Name/value map object of all custom elements.
		 */
		self.getCustomElements = function() {
			return customElementsMap;
		};

		/**
		 * Parses a valid elements string and adds it to the schema. The valid elements format is for example "element[attr=default|otherattr]".
		 * Existing rules will be replaced with the ones specified, so this extends the schema.
		 *
		 * @method addValidElements
		 * @param {String} valid_elements String in the valid elements format to be parsed.
		 */
		self.addValidElements = addValidElements;

		/**
		 * Parses a valid elements string and sets it to the schema. The valid elements format is for example "element[attr=default|otherattr]".
		 * Existing rules will be replaced with the ones specified, so this extends the schema.
		 *
		 * @method setValidElements
		 * @param {String} valid_elements String in the valid elements format to be parsed.
		 */
		self.setValidElements = setValidElements;

		/**
		 * Adds custom non HTML elements to the schema.
		 *
		 * @method addCustomElements
		 * @param {String} custom_elements Comma separated list of custom elements to add.
		 */
		self.addCustomElements = addCustomElements;

		/**
		 * Parses a valid children string and adds them to the schema structure. The valid children format is for example: "element[child1|child2]".
		 *
		 * @method addValidChildren
		 * @param {String} valid_children Valid children elements string to parse
		 */
		self.addValidChildren = addValidChildren;
	};

	// Expose boolMap and blockElementMap as static properties for usage in DOMUtils
	tinymce.html.Schema.boolAttrMap = boolAttrMap;
	tinymce.html.Schema.blockElementsMap = blockElementsMap;
})(tinymce);

/**
 * SaxParser.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class parses HTML code using pure JavaScript and executes various events for each item it finds. It will
	 * always execute the events in the right order for tag soup code like <b><p></b></p>. It will also remove elements
	 * and attributes that doesn't fit the schema if the validate setting is enabled.
	 *
	 * @example
	 * var parser = new tinymce.html.SaxParser({
	 *     validate: true,
	 *
	 *     comment: function(text) {
	 *         console.log('Comment:', text);
	 *     },
	 *
	 *     cdata: function(text) {
	 *         console.log('CDATA:', text);
	 *     },
	 *
	 *     text: function(text, raw) {
	 *         console.log('Text:', text, 'Raw:', raw);
	 *     },
	 *
	 *     start: function(name, attrs, empty) {
	 *         console.log('Start:', name, attrs, empty);
	 *     },
	 *
	 *     end: function(name) {
	 *         console.log('End:', name);
	 *     },
	 *
	 *     pi: function(name, text) {
	 *         console.log('PI:', name, text);
	 *     },
	 *
	 *     doctype: function(text) {
	 *         console.log('DocType:', text);
	 *     }
	 * }, schema);
	 * @class tinymce.html.SaxParser
	 * @version 3.4
	 */

	/**
	 * Constructs a new SaxParser instance.
	 *
	 * @constructor
	 * @method SaxParser
	 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
	 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
	 */
	tinymce.html.SaxParser = function(settings, schema) {
		var self = this, noop = function() {};

		settings = settings || {};
		self.schema = schema = schema || new tinymce.html.Schema();

		if (settings.fix_self_closing !== false)
			settings.fix_self_closing = true;

		// Add handler functions from settings and setup default handlers
		tinymce.each('comment cdata text start end pi doctype'.split(' '), function(name) {
			if (name)
				self[name] = settings[name] || noop;
		});

		/**
		 * Parses the specified HTML string and executes the callbacks for each item it finds.
		 *
		 * @example
		 * new SaxParser({...}).parse('<b>text</b>');
		 * @method parse
		 * @param {String} html Html string to sax parse.
		 */
		self.parse = function(html) {
			var self = this, matches, index = 0, value, endRegExp, stack = [], attrList, i, text, name, isInternalElement, removeInternalElements,
				shortEndedElements, fillAttrsMap, isShortEnded, validate, elementRule, isValidElement, attr, attribsValue, invalidPrefixRegExp,
				validAttributesMap, validAttributePatterns, attributesRequired, attributesDefault, attributesForced, selfClosing,
				tokenRegExp, attrRegExp, specialElements, attrValue, idCount = 0, decode = tinymce.html.Entities.decode, fixSelfClosing, isIE;

			function processEndTag(name) {
				var pos, i;

				// Find position of parent of the same type
				pos = stack.length;
				while (pos--) {
					if (stack[pos].name === name)
						break;						
				}

				// Found parent
				if (pos >= 0) {
					// Close all the open elements
					for (i = stack.length - 1; i >= pos; i--) {
						name = stack[i];

						if (name.valid)
							self.end(name.name);
					}

					// Remove the open elements from the stack
					stack.length = pos;
				}
			};

			// Precompile RegExps and map objects
			tokenRegExp = new RegExp('<(?:' +
				'(?:!--([\\w\\W]*?)-->)|' + // Comment
				'(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + // CDATA
				'(?:!DOCTYPE([\\w\\W]*?)>)|' + // DOCTYPE
				'(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|' + // PI
				'(?:\\/([^>]+)>)|' + // End element
				'(?:([^\\s\\/<>]+)((?:\\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\\/)>)' + // Start element
			')', 'g');

			attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:\\.|[^\"])*)\")|(?:\'((?:\\.|[^\'])*)\')|([^>\s]+)))?/g;
			specialElements = {
				'script' : /<\/script[^>]*>/gi,
				'style' : /<\/style[^>]*>/gi,
				'noscript' : /<\/noscript[^>]*>/gi
			};

			// Setup lookup tables for empty elements and boolean attributes
			shortEndedElements = schema.getShortEndedElements();
			selfClosing = schema.getSelfClosingElements();
			fillAttrsMap = schema.getBoolAttrs();
			validate = settings.validate;
			removeInternalElements = settings.remove_internals;
			fixSelfClosing = settings.fix_self_closing;
			isIE = tinymce.isIE;
			invalidPrefixRegExp = /^:/;

			while (matches = tokenRegExp.exec(html)) {
				// Text
				if (index < matches.index)
					self.text(decode(html.substr(index, matches.index - index)));

				if (value = matches[6]) { // End element
					value = value.toLowerCase();

					// IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
					if (isIE && invalidPrefixRegExp.test(value))
						value = value.substr(1);

					processEndTag(value);
				} else if (value = matches[7]) { // Start element
					value = value.toLowerCase();

					// IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
					if (isIE && invalidPrefixRegExp.test(value))
						value = value.substr(1);

					isShortEnded = value in shortEndedElements;

					// Is self closing tag for example an <li> after an open <li>
					if (fixSelfClosing && selfClosing[value] && stack.length > 0 && stack[stack.length - 1].name === value)
						processEndTag(value);

					// Validate element
					if (!validate || (elementRule = schema.getElementRule(value))) {
						isValidElement = true;

						// Grab attributes map and patters when validation is enabled
						if (validate) {
							validAttributesMap = elementRule.attributes;
							validAttributePatterns = elementRule.attributePatterns;
						}

						// Parse attributes
						if (attribsValue = matches[8]) {
							isInternalElement = attribsValue.indexOf('data-mce-type') !== -1; // Check if the element is an internal element

							// If the element has internal attributes then remove it if we are told to do so
							if (isInternalElement && removeInternalElements)
								isValidElement = false;

							attrList = [];
							attrList.map = {};

							attribsValue.replace(attrRegExp, function(match, name, value, val2, val3) {
								var attrRule, i;

								name = name.toLowerCase();
								value = name in fillAttrsMap ? name : decode(value || val2 || val3 || ''); // Handle boolean attribute than value attribute

								// Validate name and value
								if (validate && !isInternalElement && name.indexOf('data-') !== 0) {
									attrRule = validAttributesMap[name];

									// Find rule by pattern matching
									if (!attrRule && validAttributePatterns) {
										i = validAttributePatterns.length;
										while (i--) {
											attrRule = validAttributePatterns[i];
											if (attrRule.pattern.test(name))
												break;
										}

										// No rule matched
										if (i === -1)
											attrRule = null;
									}

									// No attribute rule found
									if (!attrRule)
										return;

									// Validate value
									if (attrRule.validValues && !(value in attrRule.validValues))
										return;
								}

								// Add attribute to list and map
								attrList.map[name] = value;
								attrList.push({
									name: name,
									value: value
								});
							});
						} else {
							attrList = [];
							attrList.map = {};
						}

						// Process attributes if validation is enabled
						if (validate && !isInternalElement) {
							attributesRequired = elementRule.attributesRequired;
							attributesDefault = elementRule.attributesDefault;
							attributesForced = elementRule.attributesForced;

							// Handle forced attributes
							if (attributesForced) {
								i = attributesForced.length;
								while (i--) {
									attr = attributesForced[i];
									name = attr.name;
									attrValue = attr.value;

									if (attrValue === '{$uid}')
										attrValue = 'mce_' + idCount++;

									attrList.map[name] = attrValue;
									attrList.push({name: name, value: attrValue});
								}
							}

							// Handle default attributes
							if (attributesDefault) {
								i = attributesDefault.length;
								while (i--) {
									attr = attributesDefault[i];
									name = attr.name;

									if (!(name in attrList.map)) {
										attrValue = attr.value;

										if (attrValue === '{$uid}')
											attrValue = 'mce_' + idCount++;

										attrList.map[name] = attrValue;
										attrList.push({name: name, value: attrValue});
									}
								}
							}

							// Handle required attributes
							if (attributesRequired) {
								i = attributesRequired.length;
								while (i--) {
									if (attributesRequired[i] in attrList.map)
										break;
								}

								// None of the required attributes where found
								if (i === -1)
									isValidElement = false;
							}

							// Invalidate element if it's marked as bogus
							if (attrList.map['data-mce-bogus'])
								isValidElement = false;
						}

						if (isValidElement)
							self.start(value, attrList, isShortEnded);
					} else
						isValidElement = false;

					// Treat script, noscript and style a bit different since they may include code that looks like elements
					if (endRegExp = specialElements[value]) {
						endRegExp.lastIndex = index = matches.index + matches[0].length;

						if (matches = endRegExp.exec(html)) {
							if (isValidElement)
								text = html.substr(index, matches.index - index);

							index = matches.index + matches[0].length;
						} else {
							text = html.substr(index);
							index = html.length;
						}

						if (isValidElement && text.length > 0)
							self.text(text, true);

						if (isValidElement)
							self.end(value);

						tokenRegExp.lastIndex = index;
						continue;
					}

					// Push value on to stack
					if (!isShortEnded) {
						if (!attribsValue || attribsValue.indexOf('/') != attribsValue.length - 1)
							stack.push({name: value, valid: isValidElement});
						else if (isValidElement)
							self.end(value);
					}
				} else if (value = matches[1]) { // Comment
					self.comment(value);
				} else if (value = matches[2]) { // CDATA
					self.cdata(value);
				} else if (value = matches[3]) { // DOCTYPE
					self.doctype(value);
				} else if (value = matches[4]) { // PI
					self.pi(value, matches[5]);
				}

				index = matches.index + matches[0].length;
			}

			// Text
			if (index < html.length)
				self.text(decode(html.substr(index)));

			// Close any open elements
			for (i = stack.length - 1; i >= 0; i--) {
				value = stack[i];

				if (value.valid)
					self.end(value.name);
			}
		};
	}
})(tinymce);

/**
 * Node.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var whiteSpaceRegExp = /^[ \t\r\n]*$/, typeLookup = {
		'#text' : 3,
		'#comment' : 8,
		'#cdata' : 4,
		'#pi' : 7,
		'#doctype' : 10,
		'#document-fragment' : 11
	};

	// Walks the tree left/right
	function walk(node, root_node, prev) {
		var sibling, parent, startName = prev ? 'lastChild' : 'firstChild', siblingName = prev ? 'prev' : 'next';

		// Walk into nodes if it has a start
		if (node[startName])
			return node[startName];

		// Return the sibling if it has one
		if (node !== root_node) {
			sibling = node[siblingName];

			if (sibling)
				return sibling;

			// Walk up the parents to look for siblings
			for (parent = node.parent; parent && parent !== root_node; parent = parent.parent) {
				sibling = parent[siblingName];

				if (sibling)
					return sibling;
			}
		}
	};

	/**
	 * This class is a minimalistic implementation of a DOM like node used by the DomParser class.
	 *
	 * @example
	 * var node = new tinymce.html.Node('strong', 1);
	 * someRoot.append(node);
	 *
	 * @class tinymce.html.Node
	 * @version 3.4
	 */

	/**
	 * Constructs a new Node instance.
	 *
	 * @constructor
	 * @method Node
	 * @param {String} name Name of the node type.
	 * @param {Number} type Numeric type representing the node.
	 */
	function Node(name, type) {
		this.name = name;
		this.type = type;

		if (type === 1) {
			this.attributes = [];
			this.attributes.map = {};
		}
	}

	tinymce.extend(Node.prototype, {
		/**
		 * Replaces the current node with the specified one.
		 *
		 * @example
		 * someNode.replace(someNewNode);
		 *
		 * @method replace
		 * @param {tinymce.html.Node} node Node to replace the current node with.
		 * @return {tinymce.html.Node} The old node that got replaced.
		 */
		replace : function(node) {
			var self = this;

			if (node.parent)
				node.remove();

			self.insert(node, self);
			self.remove();

			return self;
		},

		/**
		 * Gets/sets or removes an attribute by name.
		 *
		 * @example
		 * someNode.attr("name", "value"); // Sets an attribute
		 * console.log(someNode.attr("name")); // Gets an attribute
		 * someNode.attr("name", null); // Removes an attribute
		 *
		 * @method attr
		 * @param {String} name Attribute name to set or get.
		 * @param {String} value Optional value to set.
		 * @return {String/tinymce.html.Node} String or undefined on a get operation or the current node on a set operation.
		 */
		attr : function(name, value) {
			var self = this, attrs, i, undef;

			if (typeof name !== "string") {
				for (i in name)
					self.attr(i, name[i]);

				return self;
			}

			if (attrs = self.attributes) {
				if (value !== undef) {
					// Remove attribute
					if (value === null) {
						if (name in attrs.map) {
							delete attrs.map[name];

							i = attrs.length;
							while (i--) {
								if (attrs[i].name === name) {
									attrs = attrs.splice(i, 1);
									return self;
								}
							}
						}

						return self;
					}

					// Set attribute
					if (name in attrs.map) {
						// Set attribute
						i = attrs.length;
						while (i--) {
							if (attrs[i].name === name) {
								attrs[i].value = value;
								break;
							}
						}
					} else
						attrs.push({name: name, value: value});

					attrs.map[name] = value;

					return self;
				} else {
					return attrs.map[name];
				}
			}
		},

		/**
		 * Does a shallow clones the node into a new node. It will also exclude id attributes since
		 * there should only be one id per document.
		 *
		 * @example
		 * var clonedNode = node.clone();
		 *
		 * @method clone
		 * @return {tinymce.html.Node} New copy of the original node.
		 */
		clone : function() {
			var self = this, clone = new Node(self.name, self.type), i, l, selfAttrs, selfAttr, cloneAttrs;

			// Clone element attributes
			if (selfAttrs = self.attributes) {
				cloneAttrs = [];
				cloneAttrs.map = {};

				for (i = 0, l = selfAttrs.length; i < l; i++) {
					selfAttr = selfAttrs[i];

					// Clone everything except id
					if (selfAttr.name !== 'id') {
						cloneAttrs[cloneAttrs.length] = {name: selfAttr.name, value: selfAttr.value};
						cloneAttrs.map[selfAttr.name] = selfAttr.value;
					}
				}

				clone.attributes = cloneAttrs;
			}

			clone.value = self.value;
			clone.shortEnded = self.shortEnded;

			return clone;
		},

		/**
		 * Wraps the node in in another node.
		 *
		 * @example
		 * node.wrap(wrapperNode);
		 *
		 * @method wrap
		 */
		wrap : function(wrapper) {
			var self = this;

			self.parent.insert(wrapper, self);
			wrapper.append(self);

			return self;
		},

		/**
		 * Unwraps the node in other words it removes the node but keeps the children.
		 *
		 * @example
		 * node.unwrap();
		 *
		 * @method unwrap
		 */
		unwrap : function() {
			var self = this, node, next;

			for (node = self.firstChild; node; ) {
				next = node.next;
				self.insert(node, self, true);
				node = next;
			}

			self.remove();
		},

		/**
		 * Removes the node from it's parent.
		 *
		 * @example
		 * node.remove();
		 *
		 * @method remove
		 * @return {tinymce.html.Node} Current node that got removed.
		 */
		remove : function() {
			var self = this, parent = self.parent, next = self.next, prev = self.prev;

			if (parent) {
				if (parent.firstChild === self) {
					parent.firstChild = next;

					if (next)
						next.prev = null;
				} else {
					prev.next = next;
				}

				if (parent.lastChild === self) {
					parent.lastChild = prev;

					if (prev)
						prev.next = null;
				} else {
					next.prev = prev;
				}

				self.parent = self.next = self.prev = null;
			}

			return self;
		},

		/**
		 * Appends a new node as a child of the current node.
		 *
		 * @example
		 * node.append(someNode);
		 *
		 * @method append
		 * @param {tinymce.html.Node} node Node to append as a child of the current one.
		 * @return {tinymce.html.Node} The node that got appended.
		 */
		append : function(node) {
			var self = this, last;

			if (node.parent)
				node.remove();

			last = self.lastChild;
			if (last) {
				last.next = node;
				node.prev = last;
				self.lastChild = node;
			} else
				self.lastChild = self.firstChild = node;

			node.parent = self;

			return node;
		},

		/**
		 * Inserts a node at a specific position as a child of the current node.
		 *
		 * @example
		 * parentNode.insert(newChildNode, oldChildNode);
		 *
		 * @method insert
		 * @param {tinymce.html.Node} node Node to insert as a child of the current node.
		 * @param {tinymce.html.Node} ref_node Reference node to set node before/after.
		 * @param {Boolean} before Optional state to insert the node before the reference node.
		 * @return {tinymce.html.Node} The node that got inserted.
		 */
		insert : function(node, ref_node, before) {
			var parent;

			if (node.parent)
				node.remove();

			parent = ref_node.parent || this;

			if (before) {
				if (ref_node === parent.firstChild)
					parent.firstChild = node;
				else
					ref_node.prev.next = node;

				node.prev = ref_node.prev;
				node.next = ref_node;
				ref_node.prev = node;
			} else {
				if (ref_node === parent.lastChild)
					parent.lastChild = node;
				else
					ref_node.next.prev = node;

				node.next = ref_node.next;
				node.prev = ref_node;
				ref_node.next = node;
			}

			node.parent = parent;

			return node;
		},

		/**
		 * Get all children by name.
		 *
		 * @method getAll
		 * @param {String} name Name of the child nodes to collect.
		 * @return {Array} Array with child nodes matchin the specified name.
		 */
		getAll : function(name) {
			var self = this, node, collection = [];

			for (node = self.firstChild; node; node = walk(node, self)) {
				if (node.name === name)
					collection.push(node);
			}

			return collection;
		},

		/**
		 * Removes all children of the current node.
		 *
		 * @method empty
		 * @return {tinymce.html.Node} The current node that got cleared.
		 */
		empty : function() {
			var self = this, nodes, i, node;

			// Remove all children
			if (self.firstChild) {
				nodes = [];

				// Collect the children
				for (node = self.firstChild; node; node = walk(node, self))
					nodes.push(node);

				// Remove the children
				i = nodes.length;
				while (i--) {
					node = nodes[i];
					node.parent = node.firstChild = node.lastChild = node.next = node.prev = null;
				}
			}

			self.firstChild = self.lastChild = null;

			return self;
		},

        // ATLASSIAN - CONF-24365
		/**
		 * Returns true/false if the node is to be considered empty or not.
		 *
		 * @example
		 * node.isEmpty({img : true});
		 * @method isEmpty
		 * @param {Object} elements Name/value object with elements that are automatically treated as non empty elements.
		 * @return {Boolean} true/false if the node is empty or not.
		 */
 		isEmpty : function(schema) {
             schema = schema || new tinymce.html.Schema();

 			var self = this, node = self.firstChild, i, name,
                 nonEmptyElements = schema.getNonEmptyElements(),
                 whiteSpaceElements = schema.getWhiteSpaceElements();

 			if (node) {
 				do {
 					if (node.type === 1) {
 						// Ignore bogus elements
 						if (node.attributes.map['data-mce-bogus'])
 							continue;

 						// Keep empty elements like <img />
 						if (nonEmptyElements[node.name])
 							return false;

 						// Keep elements with data attributes or name attribute like <a name="1"></a>
 						i = node.attributes.length;
 						while (i--) {
 							name = node.attributes[i].name;
 							if (name === "name" || name.indexOf('data-') === 0)
 								return false;
 						}
 					}

					// Keep comments
					if (node.type === 8)
						return false;

					// Keep non whitespace text nodes / ATLASSIAN
 					if (node.type === 3 && (!whiteSpaceRegExp.test(node.value) // this is a non-white-space text node that we want to keep
                             || (whiteSpaceElements[self.name] && node.value && node.value.length > 0 && whiteSpaceRegExp.test(node.value)))) // this is a white space element containing a text node with one or more spaces that we want to keep
						return false;
				} while (node = walk(node, self));
			}

 			return true;
 		},

		/**
		 * Walks to the next or previous node and returns that node or null if it wasn't found.
		 *
		 * @method walk
		 * @param {Boolean} prev Optional previous node state defaults to false.
		 * @return {tinymce.html.Node} Node that is next to or previous of the current node.
		 */
		walk : function(prev) {
			return walk(this, null, prev);
		}
	});

	tinymce.extend(Node, {
		/**
		 * Creates a node of a specific type.
		 *
		 * @static
		 * @method create
		 * @param {String} name Name of the node type to create for example "b" or "#text".
		 * @param {Object} attrs Name/value collection of attributes that will be applied to elements.
		 */
		create : function(name, attrs) {
			var node, attrName;

			// Create node
			node = new Node(name, typeLookup[name] || 1);

			// Add attributes if needed
			if (attrs) {
				for (attrName in attrs)
					node.attr(attrName, attrs[attrName]);
			}

			return node;
		}
	});

	tinymce.html.Node = Node;
})(tinymce);

/**
 * DomParser.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var Node = tinymce.html.Node;

	/**
	 * This class parses HTML code into a DOM like structure of nodes it will remove redundant whitespace and make
	 * sure that the node tree is valid according to the specified schema. So for example: <p>a<p>b</p>c</p> will become <p>a</p><p>b</p><p>c</p>
	 *
	 * @example
	 * var parser = new tinymce.html.DomParser({validate: true}, schema);
	 * var rootNode = parser.parse('<h1>content</h1>');
	 *
	 * @class tinymce.html.DomParser
	 * @version 3.4
	 */

	/**
	 * Constructs a new DomParser instance.
	 *
	 * @constructor
	 * @method DomParser
	 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
	 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
	 */
	tinymce.html.DomParser = function(settings, schema) {
		var self = this, nodeFilters = {}, attributeFilters = [], matchedNodes = {}, matchedAttributes = {};

		settings = settings || {};
		settings.validate = "validate" in settings ? settings.validate : true;
		settings.root_name = settings.root_name || 'body';
		self.schema = schema = schema || new tinymce.html.Schema();

		function fixInvalidChildren(nodes) {
			var ni, node, parent, parents, newParent, currentNode, tempNode, childNode, i,
				childClone, nonEmptyElements, nonSplitableElements, sibling, nextNode;

			nonSplitableElements = tinymce.makeMap('tr,td,th,tbody,thead,tfoot,table');
			nonEmptyElements = schema.getNonEmptyElements();

			for (ni = 0; ni < nodes.length; ni++) {
				node = nodes[ni];

				// Already removed
				if (!node.parent)
					continue;

				// Get list of all parent nodes until we find a valid parent to stick the child into
				parents = [node];
				for (parent = node.parent; parent && !schema.isValidChild(parent.name, node.name) && !nonSplitableElements[parent.name]; parent = parent.parent)
					parents.push(parent);

				// Found a suitable parent
				if (parent && parents.length > 1) {
					// Reverse the array since it makes looping easier
					parents.reverse();

					// Clone the related parent and insert that after the moved node
					newParent = currentNode = self.filterNode(parents[0].clone());

					// Start cloning and moving children on the left side of the target node
					for (i = 0; i < parents.length - 1; i++) {
						if (schema.isValidChild(currentNode.name, parents[i].name)) {
							tempNode = self.filterNode(parents[i].clone());
							currentNode.append(tempNode);
						} else
							tempNode = currentNode;

						for (childNode = parents[i].firstChild; childNode && childNode != parents[i + 1]; ) {
							nextNode = childNode.next;
							tempNode.append(childNode);
							childNode = nextNode;
						}

						currentNode = tempNode;
					}

					if (!newParent.isEmpty(schema)) { // ATLASSIAN: CONF-24365
						parent.insert(newParent, parents[0], true);
						parent.insert(node, newParent);
					} else {
						parent.insert(node, parents[0], true);
					}

					// Check if the element is empty by looking through it's contents and special treatment for <p><br /></p>
					parent = parents[0];
					if (parent.isEmpty(schema) /* ATLASSIAN: CONF-24365 */ || parent.firstChild === parent.lastChild && parent.firstChild.name === 'br') {
						parent.empty().remove();
					}
				} else if (node.parent) {
					// If it's an LI try to find a UL/OL for it or wrap it
					if (node.name === 'li') {
						sibling = node.prev;
						if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
							sibling.append(node);
							continue;
						}

						sibling = node.next;
						if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
							sibling.insert(node, sibling.firstChild, true);
							continue;
						}

						node.wrap(self.filterNode(new Node('ul', 1)));
						continue;
					}

					// Try wrapping the element in a DIV
					if (schema.isValidChild(node.parent.name, 'div') && schema.isValidChild('div', node.name)) {
						node.wrap(self.filterNode(new Node('div', 1)));
					} else {
						// We failed wrapping it, then remove or unwrap it
						if (node.name === 'style' || node.name === 'script')
							node.empty().remove();
						else
							node.unwrap();
					}
				}
			}
		};

		/**
		 * Runs the specified node though the element and attributes filters.
		 *
		 * @param {tinymce.html.Node} Node the node to run filters on.
		 * @return {tinymce.html.Node} The passed in node.
		 */
		self.filterNode = function(node) {
			var i, name, list;

			// Run element filters
			if (name in nodeFilters) {
				list = matchedNodes[name];

				if (list)
					list.push(node);
				else
					matchedNodes[name] = [node];
			}

			// Run attribute filters
			i = attributeFilters.length;
			while (i--) {
				name = attributeFilters[i].name;

				if (name in node.attributes.map) {
					list = matchedAttributes[name];

					if (list)
						list.push(node);
					else
						matchedAttributes[name] = [node];
				}
			}

			return node;
		};

		/**
		 * Adds a node filter function to the parser, the parser will collect the specified nodes by name
		 * and then execute the callback ones it has finished parsing the document.
		 *
		 * @example
		 * parser.addNodeFilter('p,h1', function(nodes, name) {
		 *		for (var i = 0; i < nodes.length; i++) {
		 *			console.log(nodes[i].name);
		 *		}
		 * });
		 * @method addNodeFilter
		 * @method {String} name Comma separated list of nodes to collect.
		 * @param {function} callback Callback function to execute once it has collected nodes.
		 */
		self.addNodeFilter = function(name, callback) {
			tinymce.each(tinymce.explode(name), function(name) {
				var list = nodeFilters[name];

				if (!list)
					nodeFilters[name] = list = [];

				list.push(callback);
			});
		};

		/**
		 * Adds a attribute filter function to the parser, the parser will collect nodes that has the specified attributes
		 * and then execute the callback ones it has finished parsing the document.
		 *
		 * @example
		 * parser.addAttributeFilter('src,href', function(nodes, name) {
		 *		for (var i = 0; i < nodes.length; i++) {
		 *			console.log(nodes[i].name);
		 *		}
		 * });
		 * @method addAttributeFilter
		 * @method {String} name Comma separated list of nodes to collect.
		 * @param {function} callback Callback function to execute once it has collected nodes.
		 */
		self.addAttributeFilter = function(name, callback) {
			tinymce.each(tinymce.explode(name), function(name) {
				var i;

				for (i = 0; i < attributeFilters.length; i++) {
					if (attributeFilters[i].name === name) {
						attributeFilters[i].callbacks.push(callback);
						return;
					}
				}

				attributeFilters.push({name: name, callbacks: [callback]});
			});
		};

		/**
		 * Parses the specified HTML string into a DOM like node tree and returns the result.
		 *
		 * @example
		 * var rootNode = new DomParser({...}).parse('<b>text</b>');
		 * @method parse
		 * @param {String} html Html string to sax parse.
		 * @param {Object} args Optional args object that gets passed to all filter functions.
		 * @return {tinymce.html.Node} Root node containing the tree.
		 */
		self.parse = function(html, args) {
			var parser, rootNode, node, nodes, i, l, fi, fl, list, name, validate,
				blockElements, startWhiteSpaceRegExp, invalidChildren = [],
				endWhiteSpaceRegExp, allWhiteSpaceRegExp, whiteSpaceElements, children, nonEmptyElements, rootBlockName;

			args = args || {};
			matchedNodes = {};
			matchedAttributes = {};
			blockElements = tinymce.extend(tinymce.makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
			nonEmptyElements = schema.getNonEmptyElements();
			children = schema.children;
			validate = settings.validate;
			rootBlockName = "forced_root_block" in args ? args.forced_root_block : settings.forced_root_block;

			whiteSpaceElements = schema.getWhiteSpaceElements();
			startWhiteSpaceRegExp = /^[ \t\r\n]+/;
			endWhiteSpaceRegExp = /[ \t\r\n]+$/;
			allWhiteSpaceRegExp = /[ \t\r\n]+/g;

			function addRootBlocks() {
				var node = rootNode.firstChild, next, rootBlockNode;

				while (node) {
					next = node.next;

					if (node.type == 3 || (node.type == 1 && node.name !== 'p' && !blockElements[node.name] && !node.attr('data-mce-type'))) {
						if (!rootBlockNode) {
							// Create a new root block element
							rootBlockNode = createNode(rootBlockName, 1);
							rootNode.insert(rootBlockNode, node);
							rootBlockNode.append(node);
						} else
							rootBlockNode.append(node);
					} else {
						rootBlockNode = null;
					}

					node = next;
				};
			};

			function createNode(name, type) {
				var node = new Node(name, type), list;

				if (name in nodeFilters) {
					list = matchedNodes[name];

					if (list)
						list.push(node);
					else
						matchedNodes[name] = [node];
				}

				return node;
			};

			function removeWhitespaceBefore(node) {
				var textNode, textVal, sibling;

				for (textNode = node.prev; textNode && textNode.type === 3; ) {
					textVal = textNode.value.replace(endWhiteSpaceRegExp, '');

					if (textVal.length > 0) {
						textNode.value = textVal;
						textNode = textNode.prev;
					} else {
						sibling = textNode.prev;
						textNode.remove();
						textNode = sibling;
					}
				}
			};

			parser = new tinymce.html.SaxParser({
				validate : validate,
				fix_self_closing : !validate, // Let the DOM parser handle <li> in <li> or <p> in <p> for better results

				cdata: function(text) {
					node.append(createNode('#cdata', 4)).value = text;
				},

				text: function(text, raw) {
					var textNode;

					// Trim all redundant whitespace on non white space elements
					if (!whiteSpaceElements[node.name]) {
						text = text.replace(allWhiteSpaceRegExp, ' ');

						if (node.lastChild && blockElements[node.lastChild.name])
							text = text.replace(startWhiteSpaceRegExp, '');
					}

					// Do we need to create the node
					if (text.length !== 0) {
						textNode = createNode('#text', 3);
						textNode.raw = !!raw;
						node.append(textNode).value = text;
					}
				},

				comment: function(text) {
					node.append(createNode('#comment', 8)).value = text;
				},

				pi: function(name, text) {
					node.append(createNode(name, 7)).value = text;
					removeWhitespaceBefore(node);
				},

				doctype: function(text) {
					var newNode;

					newNode = node.append(createNode('#doctype', 10));
					newNode.value = text;
					removeWhitespaceBefore(node);
				},

				start: function(name, attrs, empty) {
					var newNode, attrFiltersLen, elementRule, textNode, attrName, text, sibling, parent;

					elementRule = validate ? schema.getElementRule(name) : {};
					if (elementRule) {
						newNode = createNode(elementRule.outputName || name, 1);
						newNode.attributes = attrs;
						newNode.shortEnded = empty;

						node.append(newNode);

						// Check if node is valid child of the parent node is the child is
						// unknown we don't collect it since it's probably a custom element
						parent = children[node.name];
						if (parent && children[newNode.name] && !parent[newNode.name])
							invalidChildren.push(newNode);

						attrFiltersLen = attributeFilters.length;
						while (attrFiltersLen--) {
							attrName = attributeFilters[attrFiltersLen].name;

							if (attrName in attrs.map) {
								list = matchedAttributes[attrName];

								if (list)
									list.push(newNode);
								else
									matchedAttributes[attrName] = [newNode];
							}
						}

						// Trim whitespace before block
						if (blockElements[name])
							removeWhitespaceBefore(newNode);

						// Change current node if the element wasn't empty i.e not <br /> or <img />
						if (!empty)
							node = newNode;
					}
				},

				end: function(name) {
					var textNode, elementRule, text, sibling, tempNode;

					elementRule = validate ? schema.getElementRule(name) : {};
					if (elementRule) {
						if (blockElements[name]) {
							if (!whiteSpaceElements[node.name]) {
								// Trim whitespace at beginning of block
								for (textNode = node.firstChild; textNode && textNode.type === 3; ) {
									text = textNode.value.replace(startWhiteSpaceRegExp, '');

									if (text.length > 0) {
										textNode.value = text;
										textNode = textNode.next;
									} else {
										sibling = textNode.next;
										textNode.remove();
										textNode = sibling;
									}
								}

								// Trim whitespace at end of block
								for (textNode = node.lastChild; textNode && textNode.type === 3; ) {
									text = textNode.value.replace(endWhiteSpaceRegExp, '');

									if (text.length > 0) {
										textNode.value = text;
										textNode = textNode.prev;
									} else {
										sibling = textNode.prev;
										textNode.remove();
										textNode = sibling;
									}
								}
							}

							// Trim start white space
							// ATLASSIAN: CONFDEV-9932: Applied patch 4bec9d8b8 by Spoke
							// Removed due to: #5424
							/*textNode = node.prev;
							if (textNode && textNode.type === 3) {
								text = textNode.value.replace(startWhiteSpaceRegExp, '');

								if (text.length > 0)
									textNode.value = text;
								else
									textNode.remove();
							}*/
						}

						// Handle empty nodes
						if (elementRule.removeEmpty || elementRule.paddEmpty) {
							if (node.isEmpty(schema)) { // ATLASSIAN: CONF-24365
								if (elementRule.paddEmpty) {
                                    // ATLASSIAN: WD-567
                                    node.empty().append(new tinymce.html.Node('br', 1)).shortEnded = true;
                                } else {
									// Leave nodes that have a name like <a name="name">
									if (!node.attributes.map.name) {
										tempNode = node.parent;
										node.empty().remove();
										node = tempNode;
										return;
									}
								}
							}
						}

						node = node.parent;
					}
				}
			}, schema);

			rootNode = node = new Node(args.context || settings.root_name, 11);

			parser.parse(html);

			// Fix invalid children or report invalid children in a contextual parsing
			if (validate && invalidChildren.length) {
				if (!args.context)
					fixInvalidChildren(invalidChildren);
				else
					args.invalid = true;
			}

			// Wrap nodes in the root into block elements if the root is body
			if (rootBlockName && rootNode.name == 'body')
				addRootBlocks();

			// Run filters only when the contents is valid
			if (!args.invalid) {
				// Run node filters
				for (name in matchedNodes) {
					list = nodeFilters[name];
					nodes = matchedNodes[name];

					// Remove already removed children
					fi = nodes.length;
					while (fi--) {
						if (!nodes[fi].parent)
							nodes.splice(fi, 1);
					}

					for (i = 0, l = list.length; i < l; i++)
						list[i](nodes, name, args);
				}

				// Run attribute filters
				for (i = 0, l = attributeFilters.length; i < l; i++) {
					list = attributeFilters[i];

					if (list.name in matchedAttributes) {
						nodes = matchedAttributes[list.name];

						// Remove already removed children
						fi = nodes.length;
						while (fi--) {
							if (!nodes[fi].parent)
								nodes.splice(fi, 1);
						}

						for (fi = 0, fl = list.callbacks.length; fi < fl; fi++)
							list.callbacks[fi](nodes, list.name, args);
					}
				}
			}

			return rootNode;
		};

		// Remove <br> at end of block elements Gecko and WebKit injects BR elements to
		// make it possible to place the caret inside empty blocks. This logic tries to remove
		// these elements and keep br elements that where intended to be there intact
		if (settings.remove_trailing_brs) {
			self.addNodeFilter('br', function(nodes, name) {
				var i, l = nodes.length, node, blockElements = schema.getBlockElements(),
					nonEmptyElements = schema.getNonEmptyElements(), parent, prev, prevName;

				// Remove brs from body element as well
				blockElements.body = 1;

				// Must loop forwards since it will otherwise remove all brs in <p>a<br><br><br></p>
				for (i = 0; i < l; i++) {
					node = nodes[i];
					parent = node.parent;

					if (blockElements[node.parent.name] && node === parent.lastChild) {
						// Loop all nodes to the right of the current node and check for other BR elements
						// excluding bookmarks since they are invisible
						prev = node.prev;
						while (prev) {
							prevName = prev.name;

							// Ignore bookmarks
							if (prevName !== "span" || prev.attr('data-mce-type') !== 'bookmark') {
								// Found a non BR element
								if (prevName !== "br")
									break;

								// Found another br it's a <br><br> structure then don't remove anything
								if (prevName === 'br') {
									node = null;
									break;
								}
							}

							prev = prev.prev;
						}

						if (node) {
							node.remove();

							// Is the parent to be considered empty after we removed the BR
							if (parent.isEmpty(schema)) { // ATLASSIAN: CONF-24365
								elementRule = schema.getElementRule(parent.name);

								// Remove or padd the element depending on schema rule
								if (elementRule) {
                                    if (elementRule.removeEmpty) {
                                        parent.remove();
                                    } else if (elementRule.paddEmpty) {
                                        // ATLASSIAN: WD-567 and CONF-43264
                                        parent.empty().append(new tinymce.html.Node('br', 1)).shortEnded = true;
                                    }
							    }
							}
						}
					}
				}
			});
		}
	}
})(tinymce);

/**
 * Writer.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class is used to write HTML tags out it can be used with the Serializer or the SaxParser.
 *
 * @class tinymce.html.Writer
 * @example
 * var writer = new tinymce.html.Writer({indent : true});
 * var parser = new tinymce.html.SaxParser(writer).parse('<p><br></p>');
 * console.log(writer.getContent());
 *
 * @class tinymce.html.Writer
 * @version 3.4
 */

/**
 * Constructs a new Writer instance.
 *
 * @constructor
 * @method Writer
 * @param {Object} settings Name/value settings object.
 */
tinymce.html.Writer = function(settings) {
	var html = [], indent, indentBefore, indentAfter, encode, htmlOutput;

	settings = settings || {};
	indent = settings.indent;
	indentBefore = tinymce.makeMap(settings.indent_before || '');
	indentAfter = tinymce.makeMap(settings.indent_after || '');
	encode = tinymce.html.Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
	htmlOutput = settings.element_format == "html";

	return {
		/**
		 * Writes the a start element such as <p id="a">.
		 *
		 * @method start
		 * @param {String} name Name of the element.
		 * @param {Array} attrs Optional attribute array or undefined if it hasn't any.
		 * @param {Boolean} empty Optional empty state if the tag should end like <br />.
		 */
		start: function(name, attrs, empty) {
			var i, l, attr, value;

			if (indent && indentBefore[name] && html.length > 0) {
				value = html[html.length - 1];

				if (value.length > 0 && value !== '\n')
					html.push('\n');
			}

			html.push('<', name);

			if (attrs) {
				for (i = 0, l = attrs.length; i < l; i++) {
					attr = attrs[i];
					html.push(' ', attr.name, '="', encode(attr.value, true), '"');
				}
			}

			if (!empty || htmlOutput)
				html[html.length] = '>';
			else
				html[html.length] = ' />';

			if (empty && indent && indentAfter[name] && html.length > 0) {
				value = html[html.length - 1];

				if (value.length > 0 && value !== '\n')
					html.push('\n');
			}
		},

		/**
		 * Writes the a end element such as </p>.
		 *
		 * @method end
		 * @param {String} name Name of the element.
		 */
		end: function(name) {
			var value;
                
			/*if (indent && indentBefore[name] && html.length > 0) {
				value = html[html.length - 1];

				if (value.length > 0 && value !== '\n')
					html.push('\n');
			}*/

			html.push('</', name, '>');

			if (indent && indentAfter[name] && html.length > 0) {
				value = html[html.length - 1];

				if (value.length > 0 && value !== '\n')
					html.push('\n');
			}
		},

		/**
		 * Writes a text node.
		 *
		 * @method text
		 * @param {String} text String to write out.
		 * @param {Boolean} raw Optional raw state if true the contents wont get encoded.
		 */
		text: function(text, raw) {
			if (text.length > 0)
				html[html.length] = raw ? text : encode(text);
		},

		/**
		 * Writes a cdata node such as <![CDATA[data]]>.
		 *
		 * @method cdata
		 * @param {String} text String to write out inside the cdata.
		 */
		cdata: function(text) {
			html.push('<![CDATA[', text, ']]>');
		},

		/**
		 * Writes a comment node such as <!-- Comment -->.
		 *
		 * @method cdata
		 * @param {String} text String to write out inside the comment.
		 */
		comment: function(text) {
			html.push('<!--', text, '-->');
		},

		/**
		 * Writes a PI node such as <?xml attr="value" ?>.
		 *
		 * @method pi
		 * @param {String} name Name of the pi.
		 * @param {String} text String to write out inside the pi.
		 */
		pi: function(name, text) {
			if (text)
				html.push('<?', name, ' ', text, '?>');
			else
				html.push('<?', name, '?>');

			if (indent)
				html.push('\n');
		},

		/**
		 * Writes a doctype node such as <!DOCTYPE data>.
		 *
		 * @method doctype
		 * @param {String} text String to write out inside the doctype.
		 */
		doctype: function(text) {
			html.push('<!DOCTYPE', text, '>', indent ? '\n' : '');
		},

		/**
		 * Resets the internal buffer if one wants to reuse the writer.
		 *
		 * @method reset
		 */
		reset: function() {
			html.length = 0;
		},

		/**
		 * Returns the contents that got serialized.
		 *
		 * @method getContent
		 * @return {String} HTML contents that got written down.
		 */
		getContent: function() {
			return html.join('').replace(/\n$/, '');
		}
	};
};

/**
 * Serializer.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class is used to serialize down the DOM tree into a string using a Writer instance.
	 *
	 *
	 * @example
	 * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
	 * @class tinymce.html.Serializer
	 * @version 3.4
	 */

	/**
	 * Constructs a new Serializer instance.
	 *
	 * @constructor
	 * @method Serializer
	 * @param {Object} settings Name/value settings object.
	 * @param {tinymce.html.Schema} schema Schema instance to use.
	 */
	tinymce.html.Serializer = function(settings, schema) {
		var self = this, writer = new tinymce.html.Writer(settings);

		settings = settings || {};
		settings.validate = "validate" in settings ? settings.validate : true;

		self.schema = schema = schema || new tinymce.html.Schema();
		self.writer = writer;

		/**
		 * Serializes the specified node into a string.
		 *
		 * @example
		 * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
		 * @method serialize
		 * @param {tinymce.html.Node} node Node instance to serialize.
		 * @return {String} String with HTML based on DOM tree.
		 */
		self.serialize = function(node) {
			var handlers, validate;

			validate = settings.validate;

			handlers = {
				// #text
				3: function(node, raw) {
					writer.text(node.value, node.raw);
				},

				// #comment
				8: function(node) {
					writer.comment(node.value);
				},

				// Processing instruction
				7: function(node) {
					writer.pi(node.name, node.value);
				},

				// Doctype
				10: function(node) {
					writer.doctype(node.value);
				},

				// CDATA
				4: function(node) {
					writer.cdata(node.value);
				},

 				// Document fragment
				11: function(node) {
					if ((node = node.firstChild)) {
						do {
							walk(node);
						} while (node = node.next);
					}
				}
			};

			writer.reset();

			function walk(node) {
				var handler = handlers[node.type], name, isEmpty, attrs, attrName, attrValue, sortedAttrs, i, l, elementRule;

				if (!handler) {
					name = node.name;
					isEmpty = node.shortEnded;
					attrs = node.attributes;

					// Sort attributes
					if (validate && attrs && attrs.length > 1) {
						sortedAttrs = [];
						sortedAttrs.map = {};

						elementRule = schema.getElementRule(node.name);
						for (i = 0, l = elementRule.attributesOrder.length; i < l; i++) {
							attrName = elementRule.attributesOrder[i];

							if (attrName in attrs.map) {
								attrValue = attrs.map[attrName];
								sortedAttrs.map[attrName] = attrValue;
								sortedAttrs.push({name: attrName, value: attrValue});
							}
						}

						for (i = 0, l = attrs.length; i < l; i++) {
							attrName = attrs[i].name;

							if (!(attrName in sortedAttrs.map)) {
								attrValue = attrs.map[attrName];
								sortedAttrs.map[attrName] = attrValue;
								sortedAttrs.push({name: attrName, value: attrValue});
							}
						}

						attrs = sortedAttrs;
					}

					writer.start(node.name, attrs, isEmpty);

					if (!isEmpty) {
						if ((node = node.firstChild)) {
							do {
								walk(node);
							} while (node = node.next);
						}

						writer.end(name);
					}
				} else
					handler(node);
			}

			// Serialize element and treat all non elements as fragments
			if (node.type == 1 && !settings.inner)
				walk(node);
			else
				handlers[11](node);

			return writer.getContent();
		};
	}
})(tinymce);

/**
 * DOMUtils.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var each = tinymce.each,
		is = tinymce.is,
		isWebKit = tinymce.isWebKit,
		isIE = tinymce.isIE,
		Entities = tinymce.html.Entities,
		simpleSelectorRe = /^([a-z0-9],?)+$/i,
		blockElementsMap = tinymce.html.Schema.blockElementsMap,
		whiteSpaceRegExp = /^[ \t\r\n]*$/;

	/**
	 * Utility class for various DOM manipulation and retrival functions.
	 *
	 * @class tinymce.dom.DOMUtils
	 * @example
	 * // Add a class to an element by id in the page
	 * tinymce.DOM.addClass('someid', 'someclass');
	 *
	 * // Add a class to an element by id inside the editor
	 * tinyMCE.activeEditor.dom.addClass('someid', 'someclass');
	 */
	tinymce.create('tinymce.dom.DOMUtils', {
		doc : null,
		root : null,
		files : null,
		pixelStyles : /^(top|left|bottom|right|width|height|borderWidth)$/,
		props : {
			"for" : "htmlFor",
			"class" : "className",
			className : "className",
			checked : "checked",
			disabled : "disabled",
			maxlength : "maxLength",
			readonly : "readOnly",
			selected : "selected",
			value : "value",
			id : "id",
			name : "name",
			type : "type"
		},

		/**
		 * Constructs a new DOMUtils instance. Consult the Wiki for more details on settings etc for this class.
		 *
		 * @constructor
		 * @method DOMUtils
		 * @param {Document} d Document reference to bind the utility class to.
		 * @param {settings} s Optional settings collection.
		 */
		DOMUtils : function(d, s) {
			var t = this, globalStyle, name;

			t.doc = d;
			t.win = window;
			t.files = {};
			t.cssFlicker = false;
			t.counter = 0;
			t.stdMode = !tinymce.isIE || d.documentMode >= 8;
			t.boxModel = !tinymce.isIE || d.compatMode == "CSS1Compat" || t.stdMode;
			t.hasOuterHTML = "outerHTML" in d.createElement("a");

			t.settings = s = tinymce.extend({
				keep_values : false,
				hex_colors : 1
			}, s);
			
			t.schema = s.schema;
			t.styles = new tinymce.html.Styles({
				url_converter : s.url_converter,
				url_converter_scope : s.url_converter_scope
			}, s.schema);

			// Fix IE6SP2 flicker and check it failed for pre SP2
			if (tinymce.isIE6) {
				try {
					d.execCommand('BackgroundImageCache', false, true);
				} catch (e) {
					t.cssFlicker = true;
				}
			}

			if (isIE && s.schema) {
				// Add missing HTML 4/5 elements to IE
				('abbr article aside audio canvas ' +
				'details figcaption figure footer ' +
				'header hgroup mark menu meter nav ' +
				'output progress section summary ' +
				'time video').replace(/\w+/g, function(name) {
					d.createElement(name);
				});

				// Create all custom elements
				for (name in s.schema.getCustomElements()) {
					d.createElement(name);
				}
			}

			tinymce.addUnload(t.destroy, t);
		},

		/**
		 * Returns the root node of the document this is normally the body but might be a DIV. Parents like getParent will not
		 * go above the point of this root node.
		 *
		 * @method getRoot
		 * @return {Element} Root element for the utility class.
		 */
		getRoot : function() {
			var t = this, s = t.settings;

			return (s && t.get(s.root_element)) || t.doc.body;
		},

		/**
		 * Returns the viewport of the window.
		 *
		 * @method getViewPort
		 * @param {Window} w Optional window to get viewport of.
		 * @return {Object} Viewport object with fields x, y, w and h.
		 */
		getViewPort : function(w) {
			var d, b;

			w = !w ? this.win : w;
			d = w.document;
			b = this.boxModel ? d.documentElement : d.body;

			// Returns viewport size excluding scrollbars
			return {
				x : w.pageXOffset || b.scrollLeft,
				y : w.pageYOffset || b.scrollTop,
				w : w.innerWidth || b.clientWidth,
				h : w.innerHeight || b.clientHeight
			};
		},

		/**
		 * Returns the rectangle for a specific element.
		 *
		 * @method getRect
		 * @param {Element/String} e Element object or element ID to get rectange from.
		 * @return {object} Rectange for specified element object with x, y, w, h fields.
		 */
		getRect : function(e) {
			var p, t = this, sr;

			e = t.get(e);
			p = t.getPos(e);
			sr = t.getSize(e);

			return {
				x : p.x,
				y : p.y,
				w : sr.w,
				h : sr.h
			};
		},

		/**
		 * Returns the size dimensions of the specified element.
		 *
		 * @method getSize
		 * @param {Element/String} e Element object or element ID to get rectange from.
		 * @return {object} Rectange for specified element object with w, h fields.
		 */
		getSize : function(e) {
			var t = this, w, h;

			e = t.get(e);
			w = t.getStyle(e, 'width');
			h = t.getStyle(e, 'height');

			// Non pixel value, then force offset/clientWidth
			if (w.indexOf('px') === -1)
				w = 0;

			// Non pixel value, then force offset/clientWidth
			if (h.indexOf('px') === -1)
				h = 0;

			return {
				w : parseInt(w) || e.offsetWidth || e.clientWidth,
				h : parseInt(h) || e.offsetHeight || e.clientHeight
			};
		},

		/**
		 * Returns a node by the specified selector function. This function will
		 * loop through all parent nodes and call the specified function for each node.
		 * If the function then returns true indicating that it has found what it was looking for, the loop execution will then end
		 * and the node it found will be returned.
		 *
		 * @method getParent
		 * @param {Node/String} n DOM node to search parents on or ID string.
		 * @param {function} f Selection function to execute on each node or CSS pattern.
		 * @param {Node} r Optional root element, never go below this point.
		 * @return {Node} DOM Node or null if it wasn't found.
		 */
		getParent : function(n, f, r) {
			return this.getParents(n, f, r, false);
		},

		/**
		 * Returns a node list of all parents matching the specified selector function or pattern.
		 * If the function then returns true indicating that it has found what it was looking for and that node will be collected.
		 *
		 * @method getParents
		 * @param {Node/String} n DOM node to search parents on or ID string.
		 * @param {function} f Selection function to execute on each node or CSS pattern.
		 * @param {Node} r Optional root element, never go below this point.
		 * @return {Array} Array of nodes or null if it wasn't found.
		 */
		getParents : function(n, f, r, c) {
			var t = this, na, se = t.settings, o = [];

			n = t.get(n);
			c = c === undefined;

			if (se.strict_root)
				r = r || t.getRoot();

			// Wrap node name as func
			if (is(f, 'string')) {
				na = f;

				if (f === '*') {
					f = function(n) {return n.nodeType == 1;};
				} else {
					f = function(n) {
						return t.is(n, na);
					};
				}
			}

			while (n) {
				if (n == r || !n.nodeType || n.nodeType === 9)
					break;

				if (!f || f(n)) {
					if (c)
						o.push(n);
					else
						return n;
				}

				n = n.parentNode;
			}

			return c ? o : null;
		},

		/**
		 * Returns the specified element by ID or the input element if it isn't a string.
		 *
		 * @method get
		 * @param {String/Element} n Element id to look for or element to just pass though.
		 * @return {Element} Element matching the specified id or null if it wasn't found.
		 */
		get : function(e) {
			var n;

			if (e && this.doc && typeof(e) == 'string') {
				n = e;
				e = this.doc.getElementById(e);

				// IE and Opera returns meta elements when they match the specified input ID, but getElementsByName seems to do the trick
				if (e && e.id !== n)
					return this.doc.getElementsByName(n)[1];
			}

			return e;
		},

		/**
		 * Returns the next node that matches selector or function
		 *
		 * @method getNext
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Next node item matching the selector or null if it wasn't found.
		 */
		getNext : function(node, selector) {
			return this._findSib(node, selector, 'nextSibling');
		},

		/**
		 * Returns the previous node that matches selector or function
		 *
		 * @method getPrev
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Previous node item matching the selector or null if it wasn't found.
		 */
		getPrev : function(node, selector) {
			return this._findSib(node, selector, 'previousSibling');
		},

		// #ifndef jquery

		/**
		 * Selects specific elements by a CSS level 3 pattern. For example "div#a1 p.test".
		 * This function is optimized for the most common patterns needed in TinyMCE but it also performes good enough
		 * on more complex patterns.
		 *
		 * @method select
		 * @param {String} p CSS level 1 pattern to select/find elements by.
		 * @param {Object} s Optional root element/scope element to search in.
		 * @return {Array} Array with all matched elements.
		 * @example
		 * // Adds a class to all paragraphs in the currently active editor
		 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'someclass');
		 * 
		 * // Adds a class to all spans that has the test class in the currently active editor
		 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('span.test'), 'someclass')
		 */
		select : function(pa, s) {
			var t = this;

			return tinymce.dom.Sizzle(pa, t.get(s) || t.get(t.settings.root_element) || t.doc, []);
		},

		/**
		 * Returns true/false if the specified element matches the specified css pattern.
		 *
		 * @method is
		 * @param {Node/NodeList} n DOM node to match or an array of nodes to match.
		 * @param {String} selector CSS pattern to match the element agains.
		 */
		is : function(n, selector) {
			var i;

			// If it isn't an array then try to do some simple selectors instead of Sizzle for to boost performance
			if (n.length === undefined) {
				// Simple all selector
				if (selector === '*')
					return n.nodeType == 1;

				// Simple selector just elements
				if (simpleSelectorRe.test(selector)) {
					selector = selector.toLowerCase().split(/,/);
					n = n.nodeName.toLowerCase();

					for (i = selector.length - 1; i >= 0; i--) {
						if (selector[i] == n)
							return true;
					}

					return false;
				}
			}

			return tinymce.dom.Sizzle.matches(selector, n.nodeType ? [n] : n).length > 0;
		},

		// #endif

		/**
		 * Adds the specified element to another element or elements.
		 *
		 * @method add
		 * @param {String/Element/Array} Element id string, DOM node element or array of id's or elements to add to.
		 * @param {String/Element} n Name of new element to add or existing element to add.
		 * @param {Object} a Optional object collection with arguments to add to the new element(s).
		 * @param {String} h Optional inner HTML contents to add for each element.
		 * @param {Boolean} c Optional internal state to indicate if it should create or add.
		 * @return {Element/Array} Element that got created or array with elements if multiple elements where passed.
		 * @example
		 * // Adds a new paragraph to the end of the active editor
		 * tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.getBody(), 'p', {title : 'my title'}, 'Some content');
		 */
		add : function(p, n, a, h, c) {
			var t = this;

			return this.run(p, function(p) {
				var e, k;

				e = is(n, 'string') ? t.doc.createElement(n) : n;
				t.setAttribs(e, a);

				if (h) {
					if (h.nodeType)
						e.appendChild(h);
					else
						t.setHTML(e, h);
				}

				return !c ? p.appendChild(e) : e;
			});
		},

		/**
		 * Creates a new element.
		 *
		 * @method create
		 * @param {String} n Name of new element.
		 * @param {Object} a Optional object name/value collection with element attributes.
		 * @param {String} h Optional HTML string to set as inner HTML of the element.
		 * @return {Element} HTML DOM node element that got created.
		 * @example
		 * // Adds an element where the caret/selection is in the active editor
		 * var el = tinyMCE.activeEditor.dom.create('div', {id : 'test', 'class' : 'myclass'}, 'some content');
		 * tinyMCE.activeEditor.selection.setNode(el);
		 */
		create : function(n, a, h) {
			return this.add(this.doc.createElement(n), n, a, h, 1);
		},

		/**
		 * Create HTML string for element. The element will be closed unless an empty inner HTML string is passed.
		 *
		 * @method createHTML
		 * @param {String} n Name of new element.
		 * @param {Object} a Optional object name/value collection with element attributes.
		 * @param {String} h Optional HTML string to set as inner HTML of the element.
		 * @return {String} String with new HTML element like for example: <a href="#">test</a>.
		 * @example
		 * // Creates a html chunk and inserts it at the current selection/caret location
		 * tinyMCE.activeEditor.selection.setContent(tinyMCE.activeEditor.dom.createHTML('a', {href : 'test.html'}, 'some line'));
		 */
		createHTML : function(n, a, h) {
			var o = '', t = this, k;

			o += '<' + n;

			for (k in a) {
				if (a.hasOwnProperty(k))
					o += ' ' + k + '="' + t.encode(a[k]) + '"';
			}

			// A call to tinymce.is doesn't work for some odd reason on IE9 possible bug inside their JS runtime
			if (typeof(h) != "undefined")
				return o + '>' + h + '</' + n + '>';

			return o + ' />';
		},

		/**
		 * Removes/deletes the specified element(s) from the DOM.
		 *
		 * @method remove
		 * @param {String/Element/Array} node ID of element or DOM element object or array containing multiple elements/ids.
		 * @param {Boolean} keep_children Optional state to keep children or not. If set to true all children will be placed at the location of the removed element.
		 * @return {Element/Array} HTML DOM element that got removed or array of elements depending on input.
		 * @example
		 * // Removes all paragraphs in the active editor
		 * tinyMCE.activeEditor.dom.remove(tinyMCE.activeEditor.dom.select('p'));
		 * 
		 * // Removes a element by id in the document
		 * tinyMCE.DOM.remove('mydiv');
		 */
		remove : function(node, keep_children) {
			return this.run(node, function(node) {
				var child, parent = node.parentNode;

				if (!parent)
					return null;

				if (keep_children) {
					while (child = node.firstChild) {
						// IE 8 will crash if you don't remove completely empty text nodes
						if (!tinymce.isIE || child.nodeType !== 3 || child.nodeValue)
							parent.insertBefore(child, node);
						else
							node.removeChild(child);
					}
				}

				return parent.removeChild(node);
			});
		},

		/**
		 * Sets the CSS style value on a HTML element. The name can be a camelcase string
		 * or the CSS style name like background-color.
		 *
		 * @method setStyle
		 * @param {String/Element/Array} n HTML element/Element ID or Array of elements/ids to set CSS style value on.
		 * @param {String} na Name of the style value to set.
		 * @param {String} v Value to set on the style.
		 * @example
		 * // Sets a style value on all paragraphs in the currently active editor
		 * tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('p'), 'background-color', 'red');
		 * 
		 * // Sets a style value to an element by id in the current document
		 * tinyMCE.DOM.setStyle('mydiv', 'background-color', 'red');
		 */
		setStyle : function(n, na, v) {
			var t = this;

			return t.run(n, function(e) {
				var s, i;

				s = e.style;

				// Camelcase it, if needed
				na = na.replace(/-(\D)/g, function(a, b){
					return b.toUpperCase();
				});

				// Default px suffix on these
				if (t.pixelStyles.test(na) && (tinymce.is(v, 'number') || /^[\-0-9\.]+$/.test(v)))
					v += 'px';

				switch (na) {
					case 'opacity':
						// IE specific opacity
						if (isIE) {
							s.filter = v === '' ? '' : "alpha(opacity=" + (v * 100) + ")";

							if (!n.currentStyle || !n.currentStyle.hasLayout)
								s.display = 'inline-block';
						}

						// Fix for older browsers
						s[na] = s['-moz-opacity'] = s['-khtml-opacity'] = v || '';
						break;

					case 'float':
						isIE ? s.styleFloat = v : s.cssFloat = v;
						break;
					
					default:
						s[na] = v || '';
				}

				// Force update of the style data
				if (t.settings.update_styles)
					t.setAttrib(e, 'data-mce-style');
			});
		},

		/**
		 * Returns the current style or runtime/computed value of a element.
		 *
		 * @method getStyle
		 * @param {String/Element} n HTML element or element id string to get style from.
		 * @param {String} na Style name to return.
		 * @param {Boolean} c Computed style.
		 * @return {String} Current style or computed style value of a element.
		 */
		getStyle : function(n, na, c) {
			n = this.get(n);

			if (!n)
				return;

			// Gecko
			if (this.doc.defaultView && c) {
				// Remove camelcase
				na = na.replace(/[A-Z]/g, function(a){
					return '-' + a;
				});

				try {
					return this.doc.defaultView.getComputedStyle(n, null).getPropertyValue(na);
				} catch (ex) {
					// Old safari might fail
					return null;
				}
			}

			// Camelcase it, if needed
			na = na.replace(/-(\D)/g, function(a, b){
				return b.toUpperCase();
			});

			if (na == 'float')
				na = isIE ? 'styleFloat' : 'cssFloat';

			// IE & Opera
			if (n.currentStyle && c)
				return n.currentStyle[na];

			return n.style ? n.style[na] : undefined;
		},

		/**
		 * Sets multiple styles on the specified element(s).
		 *
		 * @method setStyles
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set styles on.
		 * @param {Object} o Name/Value collection of style items to add to the element(s).
		 * @example
		 * // Sets styles on all paragraphs in the currently active editor
		 * tinyMCE.activeEditor.dom.setStyles(tinyMCE.activeEditor.dom.select('p'), {'background-color' : 'red', 'color' : 'green'});
		 * 
		 * // Sets styles to an element by id in the current document
		 * tinyMCE.DOM.setStyles('mydiv', {'background-color' : 'red', 'color' : 'green'});
		 */
		setStyles : function(e, o) {
			var t = this, s = t.settings, ol;

			ol = s.update_styles;
			s.update_styles = 0;

			each(o, function(v, n) {
				t.setStyle(e, n, v);
			});

			// Update style info
			s.update_styles = ol;
			if (s.update_styles)
				t.setAttrib(e, s.cssText);
		},

		/**
		 * Removes all attributes from an element or elements.
		 * 
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to remove attributes from.
		 */
		removeAllAttribs: function(e) {
			return this.run(e, function(e) {
				var i, attrs = e.attributes;
				for (i = attrs.length - 1; i >= 0; i--) {
					e.removeAttributeNode(attrs.item(i));
				}
			});
		},

		/**
		 * Sets the specified attributes value of a element or elements.
		 *
		 * @method setAttrib
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attribute on.
		 * @param {String} n Name of attribute to set.
		 * @param {String} v Value to set on the attribute of this value is falsy like null 0 or '' it will remove the attribute instead.
		 * @example
		 * // Sets an attribute to all paragraphs in the active editor
		 * tinyMCE.activeEditor.dom.setAttrib(tinyMCE.activeEditor.dom.select('p'), 'class', 'myclass');
		 * 
		 * // Sets an attribute to a specific element in the current page
		 * tinyMCE.dom.setAttrib('mydiv', 'class', 'myclass');
		 */
		setAttrib : function(e, n, v) {
			var t = this;

			// Whats the point
			if (!e || !n)
				return;

			// Strict XML mode
			if (t.settings.strict)
				n = n.toLowerCase();

			return this.run(e, function(e) {
				var s = t.settings;
				var originalValue = e.getAttribute(n);
				if (v !== null) {
				switch (n) {
					case "style":
						if (!is(v, 'string')) {
							each(v, function(v, n) {
								t.setStyle(e, n, v);
							});

							return;
						}

						// No mce_style for elements with these since they might get resized by the user
						if (s.keep_values) {
							if (v && !t._isRes(v))
								e.setAttribute('data-mce-style', v, 2);
							else
								e.removeAttribute('data-mce-style', 2);
						}

						e.style.cssText = v;
						break;

					case "class":
						e.className = v || ''; // Fix IE null bug
						break;

					case "src":
					case "href":
						if (s.keep_values) {
							if (s.url_converter)
								v = s.url_converter.call(s.url_converter_scope || t, v, n, e);

							t.setAttrib(e, 'data-mce-' + n, v, 2);
						}

						break;

					case "shape":
						e.setAttribute('data-mce-style', v);
						break;
				}
				}
				if (is(v) && v !== null && v.length !== 0)
					e.setAttribute(n, '' + v, 2);
				else
					e.removeAttribute(n, 2);

				// fire onChangeAttrib event for attributes that have changed
				if (tinyMCE.activeEditor && originalValue != v) {
					var ed = tinyMCE.activeEditor;
					ed.onSetAttrib.dispatch(ed, e, n, v);
				}
			});
		},

		/**
		 * Sets the specified attributes of a element or elements.
		 *
		 * @method setAttribs
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attributes on.
		 * @param {Object} o Name/Value collection of attribute items to add to the element(s).
		 * @example
		 * // Sets some attributes to all paragraphs in the active editor
		 * tinyMCE.activeEditor.dom.setAttribs(tinyMCE.activeEditor.dom.select('p'), {'class' : 'myclass', title : 'some title'});
		 * 
		 * // Sets some attributes to a specific element in the current page
		 * tinyMCE.DOM.setAttribs('mydiv', {'class' : 'myclass', title : 'some title'});
		 */
		setAttribs : function(e, o) {
			var t = this;

			return this.run(e, function(e) {
				each(o, function(v, n) {
					t.setAttrib(e, n, v);
				});
			});
		},

		/**
		 * Returns the specified attribute by name.
		 *
		 * @method getAttrib
		 * @param {String/Element} e Element string id or DOM element to get attribute from.
		 * @param {String} n Name of attribute to get.
		 * @param {String} dv Optional default value to return if the attribute didn't exist.
		 * @return {String} Attribute value string, default value or null if the attribute wasn't found.
		 */
		getAttrib : function(e, n, dv) {
			var v, t = this, undef;

			e = t.get(e);

			if (!e || e.nodeType !== 1)
				return dv === undef ? false : dv;

			if (!is(dv))
				dv = '';

			// Try the mce variant for these
			if (/^(src|href|style|coords|shape)$/.test(n)) {
				v = e.getAttribute("data-mce-" + n);

				if (v)
					return v;
			}

			if (isIE && t.props[n]) {
				v = e[t.props[n]];
				v = v && v.nodeValue ? v.nodeValue : v;
			}

			if (!v)
				v = e.getAttribute(n, 2);

			// Check boolean attribs
			if (/^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noshade|nowrap|readonly|selected)$/.test(n)) {
				if (e[t.props[n]] === true && v === '')
					return n;

				return v ? n : '';
			}

			// Inner input elements will override attributes on form elements
			if (e.nodeName === "FORM" && e.getAttributeNode(n))
				return e.getAttributeNode(n).nodeValue;

			if (n === 'style') {
				v = v || e.style.cssText;

				if (v) {
					v = t.serializeStyle(t.parseStyle(v), e.nodeName);

					if (t.settings.keep_values && !t._isRes(v))
						e.setAttribute('data-mce-style', v);
				}
			}

			// Remove Apple and WebKit stuff
			if (isWebKit && n === "class" && v)
				v = v.replace(/(apple|webkit)\-[a-z\-]+/gi, '');

			// Handle IE issues
			if (isIE) {
				switch (n) {
					case 'rowspan':
					case 'colspan':
						// IE returns 1 as default value
						if (v === 1)
							v = '';

						break;

					case 'size':
						// IE returns +0 as default value for size
						if (v === '+0' || v === 20 || v === 0)
							v = '';

						break;

					case 'width':
					case 'height':
					case 'vspace':
					case 'checked':
					case 'disabled':
					case 'readonly':
						if (v === 0)
							v = '';

						break;

					case 'hspace':
						// IE returns -1 as default value
						if (v === -1)
							v = '';

						break;

					case 'maxlength':
					case 'tabindex':
						// IE returns default value
						if (v === 32768 || v === 2147483647 || v === '32768')
							v = '';

						break;

					case 'multiple':
					case 'compact':
					case 'noshade':
					case 'nowrap':
						if (v === 65535)
							return n;

						return dv;

					case 'shape':
						v = v.toLowerCase();
						break;

					default:
						// IE has odd anonymous function for event attributes
						if (n.indexOf('on') === 0 && v)
							v = tinymce._replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/, '$1', '' + v);
				}
			}

			return (v !== undef && v !== null && v !== '') ? '' + v : dv;
		},

		/**
		 * Returns the absolute x, y position of a node. The position will be returned in a object with x, y fields.
		 *
		 * @method getPos
		 * @param {Element/String} n HTML element or element id to get x, y position from.
		 * @param {Element} ro Optional root element to stop calculations at.
		 * @return {object} Absolute position of the specified element object with x, y fields.
		 */
		getPos : function(n, ro) {
			var t = this, x = 0, y = 0, e, d = t.doc, r;

			n = t.get(n);
			ro = ro || d.body;

			if (n) {
				// Use getBoundingClientRect if it exists since it's faster than looping offset nodes
				if (n.getBoundingClientRect) {
					n = n.getBoundingClientRect();
					e = t.boxModel ? d.documentElement : d.body;

					// Add scroll offsets from documentElement or body since IE with the wrong box model will use d.body and so do WebKit
					// Also remove the body/documentelement clientTop/clientLeft on IE 6, 7 since they offset the position
					x = n.left + (d.documentElement.scrollLeft || d.body.scrollLeft) - e.clientTop;
					y = n.top + (d.documentElement.scrollTop || d.body.scrollTop) - e.clientLeft;

					return {x : x, y : y};
				}

				r = n;
				while (r && r != ro && r.nodeType) {
					x += r.offsetLeft || 0;
					y += r.offsetTop || 0;
					r = r.offsetParent;
				}

				r = n.parentNode;
				while (r && r != ro && r.nodeType) {
					x -= r.scrollLeft || 0;
					y -= r.scrollTop || 0;
					r = r.parentNode;
				}
			}

			return {x : x, y : y};
		},

		/**
		 * Parses the specified style value into an object collection. This parser will also
		 * merge and remove any redundant items that browsers might have added. It will also convert non hex
		 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
		 *
		 * @method parseStyle
		 * @param {String} st Style value to parse for example: border:1px solid red;.
		 * @return {Object} Object representation of that style like {border : '1px solid red'}
		 */
		parseStyle : function(st) {
			return this.styles.parse(st);
		},

		/**
		 * Serializes the specified style object into a string.
		 *
		 * @method serializeStyle
		 * @param {Object} o Object to serialize as string for example: {border : '1px solid red'}
		 * @param {String} name Optional element name.
		 * @return {String} String representation of the style object for example: border: 1px solid red.
		 */
		serializeStyle : function(o, name) {
			return this.styles.serialize(o, name);
		},

		/**
		 * Imports/loads the specified CSS file into the document bound to the class.
		 *
		 * @method loadCSS
		 * @param {String} u URL to CSS file to load.
		 * @example
		 * // Loads a CSS file dynamically into the current document
		 * tinymce.DOM.loadCSS('somepath/some.css');
		 * 
		 * // Loads a CSS file into the currently active editor instance
		 * tinyMCE.activeEditor.dom.loadCSS('somepath/some.css');
		 * 
		 * // Loads a CSS file into an editor instance by id
		 * tinyMCE.get('someid').dom.loadCSS('somepath/some.css');
		 * 
		 * // Loads multiple CSS files into the current document
		 * tinymce.DOM.loadCSS('somepath/some.css,somepath/someother.css');
		 */
		loadCSS : function(u) {
			var t = this, d = t.doc, head;

			if (!u)
				u = '';

			head = t.select('head')[0];

			each(u.split(','), function(u) {
				var link;

				if (t.files[u])
					return;

				t.files[u] = true;
				link = t.create('link', {rel : 'stylesheet', href : tinymce._addVer(u)});

				// IE 8 has a bug where dynamically loading stylesheets would produce a 1 item remaining bug
				// This fix seems to resolve that issue by realcing the document ones a stylesheet finishes loading
				// It's ugly but it seems to work fine.
				if (isIE && d.documentMode && d.recalc) {
					link.onload = function() {
						if (d.recalc)
							d.recalc();

						link.onload = null;
					};
				}

				head.appendChild(link);
			});
		},

		/**
		 * Adds a class to the specified element or elements.
		 *
		 * @method addClass
		 * @param {String/Element/Array} Element ID string or DOM element or array with elements or IDs.
		 * @param {String} c Class name to add to each element.
		 * @return {String/Array} String with new class value or array with new class values for all elements.
		 * @example
		 * // Adds a class to all paragraphs in the active editor
		 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'myclass');
		 * 
		 * // Adds a class to a specific element in the current page
		 * tinyMCE.DOM.addClass('mydiv', 'myclass');
		 */
		addClass : function(e, c) {
			return this.run(e, function(e) {
				var o;

				if (!c)
					return 0;

				if (this.hasClass(e, c))
					return e.className;

				o = this.removeClass(e, c);

				return e.className = (o != '' ? (o + ' ') : '') + c;
			});
		},

		/**
		 * Removes a class from the specified element or elements.
		 *
		 * @method removeClass
		 * @param {String/Element/Array} Element ID string or DOM element or array with elements or IDs.
		 * @param {String} c Class name to remove to each element.
		 * @return {String/Array} String with new class value or array with new class values for all elements.
		 * @example
		 * // Removes a class from all paragraphs in the active editor
		 * tinyMCE.activeEditor.dom.removeClass(tinyMCE.activeEditor.dom.select('p'), 'myclass');
		 * 
		 * // Removes a class from a specific element in the current page
		 * tinyMCE.DOM.removeClass('mydiv', 'myclass');
		 */
		removeClass : function(e, c) {
			var t = this, re;

			return t.run(e, function(e) {
				var v;

				if (t.hasClass(e, c)) {
					if (!re)
						re = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");

					v = e.className.replace(re, ' ');
					v = tinymce.trim(v != ' ' ? v : '');

					e.className = v;

					// Empty class attr
					if (!v) {
						e.removeAttribute('class');
						e.removeAttribute('className');
					}

					return v;
				}

				return e.className;
			});
		},

		/**
		 * Returns true if the specified element has the specified class.
		 *
		 * @method hasClass
		 * @param {String/Element} n HTML element or element id string to check CSS class on.
		 * @param {String} c CSS class to check for.
		 * @return {Boolean} true/false if the specified element has the specified class.
		 */
		hasClass : function(n, c) {
			n = this.get(n);

			if (!n || !c)
				return false;

			return (' ' + n.className + ' ').indexOf(' ' + c + ' ') !== -1;
		},

		/**
		 * Shows the specified element(s) by ID by setting the "display" style.
		 *
		 * @method show
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to show.
		 */
		show : function(e) {
			return this.setStyle(e, 'display', 'block');
		},

		/**
		 * Hides the specified element(s) by ID by setting the "display" style.
		 *
		 * @method hide
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to hide.
		 * @example
		 * // Hides a element by id in the document
		 * tinymce.DOM.hide('myid');
		 */
		hide : function(e) {
			return this.setStyle(e, 'display', 'none');
		},

		/**
		 * Returns true/false if the element is hidden or not by checking the "display" style.
		 *
		 * @method isHidden
		 * @param {String/Element} e Id or element to check display state on.
		 * @return {Boolean} true/false if the element is hidden or not.
		 */
		isHidden : function(e) {
			e = this.get(e);

			return !e || e.style.display == 'none' || this.getStyle(e, 'display') == 'none';
		},

		/**
		 * Returns a unique id. This can be useful when generating elements on the fly.
		 * This method will not check if the element allready exists.
		 *
		 * @method uniqueId
		 * @param {String} p Optional prefix to add infront of all ids defaults to "mce_".
		 * @return {String} Unique id.
		 */
		uniqueId : function(p) {
			return (!p ? 'mce_' : p) + (this.counter++);
		},

		/**
		 * Sets the specified HTML content inside the element or elements. The HTML will first be processed this means
		 * URLs will get converted, hex color values fixed etc. Check processHTML for details.
		 *
		 * @method setHTML
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set HTML inside.
		 * @param {String} h HTML content to set as inner HTML of the element.
		 * @example
		 * // Sets the inner HTML of all paragraphs in the active editor
		 * tinyMCE.activeEditor.dom.setHTML(tinyMCE.activeEditor.dom.select('p'), 'some inner html');
		 * 
		 * // Sets the inner HTML of a element by id in the document
		 * tinyMCE.DOM.setHTML('mydiv', 'some inner html');
		 */
		setHTML : function(element, html) {
			var self = this;

			return self.run(element, function(element) {
				if (isIE) {
					// Remove all child nodes, IE keeps empty text nodes in DOM
					while (element.firstChild)
						element.removeChild(element.firstChild);

					try {
						// IE will remove comments from the beginning
						// unless you padd the contents with something
						element.innerHTML = '<br />' + html;
						element.removeChild(element.firstChild);
					} catch (ex) {
						// IE sometimes produces an unknown runtime error on innerHTML if it's an block element within a block element for example a div inside a p
						// This seems to fix this problem

						// Create new div with HTML contents and a BR infront to keep comments
						element = self.create('div');
						element.innerHTML = '<br />' + html;

						// Add all children from div to target
						each (element.childNodes, function(node, i) {
							// Skip br element
							if (i)
								element.appendChild(node);
						});
					}
				} else
					element.innerHTML = html;

				return html;
			});
		},

		/**
		 * Returns the outer HTML of an element.
		 *
		 * @method getOuterHTML
		 * @param {String/Element} elm Element ID or element object to get outer HTML from.
		 * @return {String} Outer HTML string.
		 * @example
		 * tinymce.DOM.getOuterHTML(editorElement);
		 * tinyMCE.activeEditor.getOuterHTML(tinyMCE.activeEditor.getBody());
		 */
		getOuterHTML : function(elm) {
			var doc, self = this;

			elm = self.get(elm);

			if (!elm)
				return null;

			if (elm.nodeType === 1 && self.hasOuterHTML)
				return elm.outerHTML;

			doc = (elm.ownerDocument || self.doc).createElement("body");
			doc.appendChild(elm.cloneNode(true));

			return doc.innerHTML;
		},

		/**
		 * Sets the specified outer HTML on a element or elements.
		 *
		 * @method setOuterHTML
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set outer HTML on.
		 * @param {Object} h HTML code to set as outer value for the element.
		 * @param {Document} d Optional document scope to use in this process defaults to the document of the DOM class.
		 * @example
		 * // Sets the outer HTML of all paragraphs in the active editor
		 * tinyMCE.activeEditor.dom.setOuterHTML(tinyMCE.activeEditor.dom.select('p'), '<div>some html</div>');
		 * 
		 * // Sets the outer HTML of a element by id in the document
		 * tinyMCE.DOM.setOuterHTML('mydiv', '<div>some html</div>');
		 */
		setOuterHTML : function(e, h, d) {
			var t = this;

			function setHTML(e, h, d) {
				var n, tp;

				tp = d.createElement("body");
				tp.innerHTML = h;

				n = tp.lastChild;
				while (n) {
					t.insertAfter(n.cloneNode(true), e);
					n = n.previousSibling;
				}

				t.remove(e);
			};

			return this.run(e, function(e) {
				e = t.get(e);

				// Only set HTML on elements
				if (e.nodeType == 1) {
					d = d || e.ownerDocument || t.doc;

					if (isIE) {
						try {
							// Try outerHTML for IE it sometimes produces an unknown runtime error
							if (isIE && e.nodeType == 1)
								e.outerHTML = h;
							else
								setHTML(e, h, d);
						} catch (ex) {
							// Fix for unknown runtime error
							setHTML(e, h, d);
						}
					} else
						setHTML(e, h, d);
				}
			});
		},

		/**
		 * Entity decode a string, resolves any HTML entities like &aring;.
		 *
		 * @method decode
		 * @param {String} s String to decode entities on.
		 * @return {String} Entity decoded string.
		 */
		decode : Entities.decode,

		/**
		 * Entity encodes a string, encodes the most common entities <>"& into entities.
		 *
		 * @method encode
		 * @param {String} text String to encode with entities.
		 * @return {String} Entity encoded string.
		 */
		encode : Entities.encodeAllRaw,

		/**
		 * Inserts a element after the reference element.
		 *
		 * @method insertAfter
		 * @param {Element} node Element to insert after the reference.
		 * @param {Element/String/Array} reference_node Reference element, element id or array of elements to insert after.
		 * @return {Element/Array} Element that got added or an array with elements. 
		 */
		insertAfter : function(node, reference_node) {
			reference_node = this.get(reference_node);

			return this.run(node, function(node) {
				var parent, nextSibling;

				parent = reference_node.parentNode;
				nextSibling = reference_node.nextSibling;

				if (nextSibling)
					parent.insertBefore(node, nextSibling);
				else
					parent.appendChild(node);

				return node;
			});
		},

		/**
		 * Returns true/false if the specified element is a block element or not.
		 *
		 * @method isBlock
		 * @param {Node/String} node Element/Node to check.
		 * @return {Boolean} True/False state if the node is a block element or not.
		 */
		isBlock : function(node) {
			var type = node.nodeType;

			// If it's a node then check the type and use the nodeName
			if (type)
				return !!(type === 1 && blockElementsMap[node.nodeName]);

			return !!blockElementsMap[node];
		},

		/**
		 * Replaces the specified element or elements with the specified element, the new element will
		 * be cloned if multiple inputs elements are passed.
		 *
		 * @method replace
		 * @param {Element} n New element to replace old ones with.
		 * @param {Element/String/Array} o Element DOM node, element id or array of elements or ids to replace.
		 * @param {Boolean} k Optional keep children state, if set to true child nodes from the old object will be added to new ones.
		 */
		replace : function(n, o, k) {
			var t = this;

			if (is(o, 'array'))
				n = n.cloneNode(true);

			return t.run(o, function(o) {
				if (k) {
					each(tinymce.grep(o.childNodes), function(c) {
						n.appendChild(c);
					});
				}

				return o.parentNode.replaceChild(n, o);
			});
		},

		/**
		 * Renames the specified element to a new name and keep it's attributes and children.
		 *
		 * @method rename
		 * @param {Element} elm Element to rename.
		 * @param {String} name Name of the new element.
		 * @return New element or the old element if it needed renaming.
		 */
		rename : function(elm, name) {
			var t = this, newElm;

			if (elm.nodeName != name.toUpperCase()) {
				// Rename block element
				newElm = t.create(name);

				// Copy attribs to new block
				each(t.getAttribs(elm), function(attr_node) {
					t.setAttrib(newElm, attr_node.nodeName, t.getAttrib(elm, attr_node.nodeName));
				});

				// Replace block
				t.replace(newElm, elm, 1);
			}

			return newElm || elm;
		},

		/**
		 * Find the common ancestor of two elements. This is a shorter method than using the DOM Range logic.
		 *
		 * @method findCommonAncestor
		 * @param {Element} a Element to find common ancestor of.
		 * @param {Element} b Element to find common ancestor of.
		 * @return {Element} Common ancestor element of the two input elements.
		 */
		findCommonAncestor : function(a, b) {
			var ps = a, pe;

			while (ps) {
				pe = b;

				while (pe && ps != pe)
					pe = pe.parentNode;

				if (ps == pe)
					break;

				ps = ps.parentNode;
			}

			if (!ps && a.ownerDocument)
				return a.ownerDocument.documentElement;

			return ps;
		},

		/**
		 * Parses the specified RGB color value and returns a hex version of that color.
		 *
		 * @method toHex
		 * @param {String} s RGB string value like rgb(1,2,3)
		 * @return {String} Hex version of that RGB value like #FF00FF.
		 */
		toHex : function(s) {
			var c = /^\s*rgb\s*?\(\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?\)\s*$/i.exec(s);

			function hex(s) {
				s = parseInt(s).toString(16);

				return s.length > 1 ? s : '0' + s; // 0 -> 00
			};

			if (c) {
				s = '#' + hex(c[1]) + hex(c[2]) + hex(c[3]);

				return s;
			}

			return s;
		},

		/**
		 * Returns a array of all single CSS classes in the document. A single CSS class is a simple
		 * rule like ".class" complex ones like "div td.class" will not be added to output.
		 *
		 * @method getClasses
		 * @return {Array} Array with class objects each object has a class field might be other fields in the future.
		 */
		getClasses : function() {
			var t = this, cl = [], i, lo = {}, f = t.settings.class_filter, ov;

			if (t.classes)
				return t.classes;

			function addClasses(s) {
				// IE style imports
				each(s.imports, function(r) {
					addClasses(r);
				});

				each(s.cssRules || s.rules, function(r) {
					// Real type or fake it on IE
					switch (r.type || 1) {
						// Rule
						case 1:
							if (r.selectorText) {
								each(r.selectorText.split(','), function(v) {
									v = v.replace(/^\s*|\s*$|^\s\./g, "");

									// Is internal or it doesn't contain a class
									if (/\.mce/.test(v) || !/\.[\w\-]+$/.test(v))
										return;

									// Remove everything but class name
									ov = v;
									v = tinymce._replace(/.*\.([a-z0-9_\-]+).*/i, '$1', v);

									// Filter classes
									if (f && !(v = f(v, ov)))
										return;

									if (!lo[v]) {
										cl.push({'class' : v});
										lo[v] = 1;
									}
								});
							}
							break;

						// Import
						case 3:
							addClasses(r.styleSheet);
							break;
					}
				});
			};

			try {
				each(t.doc.styleSheets, addClasses);
			} catch (ex) {
				// Ignore
			}

			if (cl.length > 0)
				t.classes = cl;

			return cl;
		},

		/**
		 * Executes the specified function on the element by id or dom element node or array of elements/id.
		 *
		 * @method run
		 * @param {String/Element/Array} Element ID or DOM element object or array with ids or elements.
		 * @param {function} f Function to execute for each item.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {Object/Array} Single object or array with objects depending on multiple input or not.
		 */
		run : function(e, f, s) {
			var t = this, o;

			if (t.doc && typeof(e) === 'string')
				e = t.get(e);

			if (!e)
				return false;

			s = s || this;
			if (!e.nodeType && (e.length || e.length === 0)) {
				o = [];

				each(e, function(e, i) {
					if (e) {
						if (typeof(e) == 'string')
							e = t.doc.getElementById(e);

						o.push(f.call(s, e, i));
					}
				});

				return o;
			}

			return f.call(s, e);
		},

		/**
		 * Returns an NodeList with attributes for the element.
		 *
		 * @method getAttribs
		 * @param {HTMLElement/string} n Element node or string id to get attributes from.
		 * @return {NodeList} NodeList with attributes.
		 */
		getAttribs : function(n) {
			var o;

			n = this.get(n);

			if (!n)
				return [];

			if (isIE) {
				o = [];

				// Object will throw exception in IE
				if (n.nodeName == 'OBJECT')
					return n.attributes;

				// IE doesn't keep the selected attribute if you clone option elements
				if (n.nodeName === 'OPTION' && this.getAttrib(n, 'selected'))
					o.push({specified : 1, nodeName : 'selected'});

				// It's crazy that this is faster in IE but it's because it returns all attributes all the time
				n.cloneNode(false).outerHTML.replace(/<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi, '').replace(/[\w:\-]+/gi, function(a) {
					o.push({specified : 1, nodeName : a});
				});

				return o;
			}

			return n.attributes;
		},

		/**
		 * Returns true/false if the specified node is to be considered empty or not.
		 *
		 * @example
		 * tinymce.DOM.isEmpty(node, {img : true});
		 * @method isEmpty
		 * @param {Object} elements Optional name/value object with elements that are automatically treated as non empty elements.
		 * @return {Boolean} true/false if the node is empty or not.
		 */
		isEmpty : function(node, elements) {
			var self = this, i, attributes, type, walker, name, parentNode;

			node = node.firstChild;
			if (node) {
				walker = new tinymce.dom.TreeWalker(node);
				elements = elements || self.schema ? self.schema.getNonEmptyElements() : null;

				do {
					type = node.nodeType;

					if (type === 1) {
						// Ignore bogus elements
						if (node.getAttribute('data-mce-bogus'))
							continue;

						// Keep empty elements like <img />
						name = node.nodeName.toLowerCase();

						if (elements && elements[name]) {
							// Ignore single BR elements in blocks like <p><br /></p>
							parentNode = node.parentNode;
							if (name === 'br' && self.isBlock(parentNode) && parentNode.firstChild === node && parentNode.lastChild === node) {
								continue;
							}

							return false;
						}

						// Keep elements with data-bookmark attributes or name attribute like <a name="1"></a>
						attributes = self.getAttribs(node);
						i = node.attributes.length;
						while (i--) {
							// ATLASSIAN - CONFDEV-6327 ensure we don't report a pagelayout as being empty
							name = node.attributes[i].nodeName.toLowerCase();
							if (name === "name" || name === 'data-mce-bookmark' || (name === 'contenteditable' && node.attributes[i].value === 'true'))
								return false;
						}
					}

					// Keep comment nodes
					if (type == 8)
						return false;

					// Keep non whitespace text nodes
					if ((type === 3 && !whiteSpaceRegExp.test(node.nodeValue)))
						return false;
				} while (node = walker.next());
			}

			return true;
		},

		/**
		 * Destroys all internal references to the DOM to solve IE leak issues.
		 *
		 * @method destroy
		 */
		destroy : function(s) {
			var t = this;

			if (t.events)
				t.events.destroy();

			t.win = t.doc = t.root = t.events = null;

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		},

		/**
		 * Created a new DOM Range object. This will use the native DOM Range API if it's
		 * available if it's not it will fallback to the custom TinyMCE implementation.
		 *
		 * @method createRng
		 * @return {DOMRange} DOM Range object.
		 * @example
		 * var rng = tinymce.DOM.createRng();
		 * alert(rng.startContainer + "," + rng.startOffset);
		 */
		createRng : function() {
			var d = this.doc;

			return d.createRange ? d.createRange() : new tinymce.dom.Range(this);
		},

		/**
		 * Returns the index of the specified node within it's parent.
		 *
		 * @param {Node} node Node to look for.
		 * @param {boolean} normalized Optional true/false state if the index is what it would be after a normalization.
		 * @return {Number} Index of the specified node.
		 */
		nodeIndex : function(node, normalized) {
			var idx = 0, lastNodeType, lastNode, nodeType;

			if (node) {
				for (lastNodeType = node.nodeType, node = node.previousSibling, lastNode = node; node; node = node.previousSibling) {
					nodeType = node.nodeType;

					// Normalize text nodes
					if (normalized && nodeType == 3) {
						if (nodeType == lastNodeType || !node.nodeValue.length)
							continue;
					}
					idx++;
					lastNodeType = nodeType;
				}
			}

			return idx;
		},

		/**
		 * Splits an element into two new elements and places the specified split
		 * element or element between the new ones. For example splitting the paragraph at the bold element in
		 * this example <p>abc<b>abc</b>123</p> would produce <p>abc</p><b>abc</b><p>123</p>. 
		 *
		 * @method split
		 * @param {Element} pe Parent element to split.
		 * @param {Element} e Element to split at.
		 * @param {Element} re Optional replacement element to replace the split element by.
		 * @return {Element} Returns the split element or the replacement element if that is specified.
		 */
		split : function(pe, e, re) {
			var t = this, r = t.createRng(), bef, aft, pa;

			// W3C valid browsers tend to leave empty nodes to the left/right side of the contents, this makes sense
			// but we don't want that in our code since it serves no purpose for the end user
			// For example if this is chopped:
			//   <p>text 1<span><b>CHOP</b></span>text 2</p>
			// would produce:
			//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
			// this function will then trim of empty edges and produce:
			//   <p>text 1</p><b>CHOP</b><p>text 2</p>
			function trim(node) {
				var i, children = node.childNodes, type = node.nodeType;

				function surroundedBySpans(node) {
					var previousIsSpan = node.previousSibling && node.previousSibling.nodeName == 'SPAN';
					var nextIsSpan = node.nextSibling && node.nextSibling.nodeName == 'SPAN';
					return previousIsSpan && nextIsSpan;
				}

				if (type == 1 && node.getAttribute('data-mce-type') == 'bookmark')
					return;

				for (i = children.length - 1; i >= 0; i--)
					trim(children[i]);

				if (type != 9) {
					// Keep non whitespace text nodes
					if (type == 3 && node.nodeValue.length > 0) {
						// If parent element isn't a block or there isn't any useful contents for example "<p>   </p>"
						// Also keep text nodes with only spaces if surrounded by spans.
						// eg. "<p><span>a</span> <span>b</span></p>" should keep space between a and b
						var trimmedLength = tinymce.trim(node.nodeValue).length;
						if (!t.isBlock(node.parentNode) || trimmedLength > 0 || trimmedLength == 0 && surroundedBySpans(node))
							return;
					} else if (type == 1) {
						// If the only child is a bookmark then move it up
						children = node.childNodes;
						if (children.length == 1 && children[0] && children[0].nodeType == 1 && children[0].getAttribute('data-mce-type') == 'bookmark')
							node.parentNode.insertBefore(children[0], node);

						// Keep non empty elements or img, hr etc
						if (children.length || /^(br|hr|input|img)$/i.test(node.nodeName))
							return;
					}

					t.remove(node);
				}

				return node;
			};

			if (pe && e) {
				// Get before chunk
				r.setStart(pe.parentNode, t.nodeIndex(pe));
				r.setEnd(e.parentNode, t.nodeIndex(e));
				bef = r.extractContents();

				// Get after chunk
				r = t.createRng();
				r.setStart(e.parentNode, t.nodeIndex(e) + 1);
				r.setEnd(pe.parentNode, t.nodeIndex(pe) + 1);
				aft = r.extractContents();

				// Insert before chunk
				pa = pe.parentNode;
				pa.insertBefore(trim(bef), pe);

				// Insert middle chunk
				if (re)
					pa.replaceChild(re, e);
				else
					pa.insertBefore(e, pe);

				// Insert after chunk
				pa.insertBefore(trim(aft), pe);
				t.remove(pe);

				return re || e;
			}
		},

		/**
		 * Adds an event handler to the specified object.
		 *
		 * @method bind
		 * @param {Element/Document/Window/Array/String} o Object or element id string to add event handler to or an array of elements/ids/documents.
		 * @param {String} n Name of event handler to add for example: click.
		 * @param {function} f Function to execute when the event occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {function} Function callback handler the same as the one passed in.
		 */
		bind : function(target, name, func, scope) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.add(target, name, func, scope || this);
		},

		/**
		 * Removes the specified event handler by name and function from a element or collection of elements.
		 *
		 * @method unbind
		 * @param {String/Element/Array} o Element ID string or HTML element or an array of elements or ids to remove handler from.
		 * @param {String} n Event handler name like for example: "click"
		 * @param {function} f Function to remove.
		 * @return {bool/Array} Bool state if true if the handler was removed or an array with states if multiple elements where passed in.
		 */
		unbind : function(target, name, func) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.remove(target, name, func);
		},

		// #ifdef debug

		dumpRng : function(r) {
			return 'startContainer: ' + r.startContainer.nodeName + ', startOffset: ' + r.startOffset + ', endContainer: ' + r.endContainer.nodeName + ', endOffset: ' + r.endOffset;
		},

		// #endif

		_findSib : function(node, selector, name) {
			var t = this, f = selector;

			if (node) {
				// If expression make a function of it using is
				if (is(f, 'string')) {
					f = function(node) {
						return t.is(node, selector);
					};
				}

				// Loop all siblings
				for (node = node[name]; node; node = node[name]) {
					if (f(node))
						return node;
				}
			}

			return null;
		},

		_isRes : function(c) {
			// Is live resizble element
			return /^(top|left|bottom|right|width|height)/i.test(c) || /;\s*(top|left|bottom|right|width|height)/i.test(c);
		}

		/*
		walk : function(n, f, s) {
			var d = this.doc, w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

				while ((n = w.nextNode()) != null)
					f.call(s || this, n);
			} else
				tinymce.walk(n, f, 'childNodes', s);
		}
		*/

		/*
		toRGB : function(s) {
			var c = /^\s*?#([0-9A-F]{2})([0-9A-F]{1,2})([0-9A-F]{2})?\s*?$/.exec(s);

			if (c) {
				// #FFF -> #FFFFFF
				if (!is(c[3]))
					c[3] = c[2] = c[1];

				return "rgb(" + parseInt(c[1], 16) + "," + parseInt(c[2], 16) + "," + parseInt(c[3], 16) + ")";
			}

			return s;
		}
		*/
	});

	/**
	 * Instance of DOMUtils for the current document.
	 *
	 * @property DOM
	 * @member tinymce
	 * @type tinymce.dom.DOMUtils
	 * @example
	 * // Example of how to add a class to some element by id
	 * tinymce.DOM.addClass('someid', 'someclass');
	 */
	tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
})(tinymce);

/**
 * Range.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(ns) {
	// Range constructor
	function Range(dom) {
		var t = this,
			doc = dom.doc,
			EXTRACT = 0,
			CLONE = 1,
			DELETE = 2,
			TRUE = true,
			FALSE = false,
			START_OFFSET = 'startOffset',
			START_CONTAINER = 'startContainer',
			END_CONTAINER = 'endContainer',
			END_OFFSET = 'endOffset',
			extend = tinymce.extend,
			nodeIndex = dom.nodeIndex;

		extend(t, {
			// Inital states
			startContainer : doc,
			startOffset : 0,
			endContainer : doc,
			endOffset : 0,
			collapsed : TRUE,
			commonAncestorContainer : doc,

			// Range constants
			START_TO_START : 0,
			START_TO_END : 1,
			END_TO_END : 2,
			END_TO_START : 3,

			// Public methods
			setStart : setStart,
			setEnd : setEnd,
			setStartBefore : setStartBefore,
			setStartAfter : setStartAfter,
			setEndBefore : setEndBefore,
			setEndAfter : setEndAfter,
			collapse : collapse,
			selectNode : selectNode,
			selectNodeContents : selectNodeContents,
			compareBoundaryPoints : compareBoundaryPoints,
			deleteContents : deleteContents,
			extractContents : extractContents,
			cloneContents : cloneContents,
			insertNode : insertNode,
			surroundContents : surroundContents,
			cloneRange : cloneRange
		});

		function setStart(n, o) {
			_setEndPoint(TRUE, n, o);
		};

		function setEnd(n, o) {
			_setEndPoint(FALSE, n, o);
		};

		function setStartBefore(n) {
			setStart(n.parentNode, nodeIndex(n));
		};

		function setStartAfter(n) {
			setStart(n.parentNode, nodeIndex(n) + 1);
		};

		function setEndBefore(n) {
			setEnd(n.parentNode, nodeIndex(n));
		};

		function setEndAfter(n) {
			setEnd(n.parentNode, nodeIndex(n) + 1);
		};

		function collapse(ts) {
			if (ts) {
				t[END_CONTAINER] = t[START_CONTAINER];
				t[END_OFFSET] = t[START_OFFSET];
			} else {
				t[START_CONTAINER] = t[END_CONTAINER];
				t[START_OFFSET] = t[END_OFFSET];
			}

			t.collapsed = TRUE;
		};

		function selectNode(n) {
			setStartBefore(n);
			setEndAfter(n);
		};

		function selectNodeContents(n) {
			setStart(n, 0);
			setEnd(n, n.nodeType === 1 ? n.childNodes.length : n.nodeValue.length);
		};

		function compareBoundaryPoints(h, r) {
			var sc = t[START_CONTAINER], so = t[START_OFFSET], ec = t[END_CONTAINER], eo = t[END_OFFSET],
			rsc = r.startContainer, rso = r.startOffset, rec = r.endContainer, reo = r.endOffset;

			// Check START_TO_START
			if (h === 0)
				return _compareBoundaryPoints(sc, so, rsc, rso);
	
			// Check START_TO_END
			if (h === 1)
				return _compareBoundaryPoints(ec, eo, rsc, rso);
	
			// Check END_TO_END
			if (h === 2)
				return _compareBoundaryPoints(ec, eo, rec, reo);
	
			// Check END_TO_START
			if (h === 3) 
				return _compareBoundaryPoints(sc, so, rec, reo);
		};

		function deleteContents() {
			_traverse(DELETE);
		};

		function extractContents() {
			return _traverse(EXTRACT);
		};

		function cloneContents() {
			return _traverse(CLONE);
		};

		function insertNode(n) {
			var startContainer = this[START_CONTAINER],
				startOffset = this[START_OFFSET], nn, o;

			// Node is TEXT_NODE or CDATA
			if ((startContainer.nodeType === 3 || startContainer.nodeType === 4) && startContainer.nodeValue) {
				if (!startOffset) {
					// At the start of text
					startContainer.parentNode.insertBefore(n, startContainer);
				} else if (startOffset >= startContainer.nodeValue.length) {
					// At the end of text
					dom.insertAfter(n, startContainer);
				} else {
					// Middle, need to split
					nn = startContainer.splitText(startOffset);
					startContainer.parentNode.insertBefore(n, nn);
				}
			} else {
				// Insert element node
				if (startContainer.childNodes.length > 0)
					o = startContainer.childNodes[startOffset];

				if (o)
					startContainer.insertBefore(n, o);
				else
					startContainer.appendChild(n);
			}
		};

		function surroundContents(n) {
			var f = t.extractContents();

			t.insertNode(n);
			n.appendChild(f);
			t.selectNode(n);
		};

		function cloneRange() {
			return extend(new Range(dom), {
				startContainer : t[START_CONTAINER],
				startOffset : t[START_OFFSET],
				endContainer : t[END_CONTAINER],
				endOffset : t[END_OFFSET],
				collapsed : t.collapsed,
				commonAncestorContainer : t.commonAncestorContainer
			});
		};

		// Private methods

		function _getSelectedNode(container, offset) {
			var child;

			if (container.nodeType == 3 /* TEXT_NODE */)
				return container;

			if (offset < 0)
				return container;

			child = container.firstChild;
			while (child && offset > 0) {
				--offset;
				child = child.nextSibling;
			}

			if (child)
				return child;

			return container;
		};

		function _isCollapsed() {
			return (t[START_CONTAINER] == t[END_CONTAINER] && t[START_OFFSET] == t[END_OFFSET]);
		};

		function _compareBoundaryPoints(containerA, offsetA, containerB, offsetB) {
			var c, offsetC, n, cmnRoot, childA, childB;
			
			// In the first case the boundary-points have the same container. A is before B
			// if its offset is less than the offset of B, A is equal to B if its offset is
			// equal to the offset of B, and A is after B if its offset is greater than the
			// offset of B.
			if (containerA == containerB) {
				if (offsetA == offsetB)
					return 0; // equal

				if (offsetA < offsetB)
					return -1; // before

				return 1; // after
			}

			// In the second case a child node C of the container of A is an ancestor
			// container of B. In this case, A is before B if the offset of A is less than or
			// equal to the index of the child node C and A is after B otherwise.
			c = containerB;
			while (c && c.parentNode != containerA)
				c = c.parentNode;

			if (c) {
				offsetC = 0;
				n = containerA.firstChild;

				while (n != c && offsetC < offsetA) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetA <= offsetC)
					return -1; // before

				return 1; // after
			}

			// In the third case a child node C of the container of B is an ancestor container
			// of A. In this case, A is before B if the index of the child node C is less than
			// the offset of B and A is after B otherwise.
			c = containerA;
			while (c && c.parentNode != containerB) {
				c = c.parentNode;
			}

			if (c) {
				offsetC = 0;
				n = containerB.firstChild;

				while (n != c && offsetC < offsetB) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetC < offsetB)
					return -1; // before

				return 1; // after
			}

			// In the fourth case, none of three other cases hold: the containers of A and B
			// are siblings or descendants of sibling nodes. In this case, A is before B if
			// the container of A is before the container of B in a pre-order traversal of the
			// Ranges' context tree and A is after B otherwise.
			cmnRoot = dom.findCommonAncestor(containerA, containerB);
			childA = containerA;

			while (childA && childA.parentNode != cmnRoot)
				childA = childA.parentNode;

			if (!childA)
				childA = cmnRoot;

			childB = containerB;
			while (childB && childB.parentNode != cmnRoot)
				childB = childB.parentNode;

			if (!childB)
				childB = cmnRoot;

			if (childA == childB)
				return 0; // equal

			n = cmnRoot.firstChild;
			while (n) {
				if (n == childA)
					return -1; // before

				if (n == childB)
					return 1; // after

				n = n.nextSibling;
			}
		};

		function _setEndPoint(st, n, o) {
			var ec, sc;

			if (st) {
				t[START_CONTAINER] = n;
				t[START_OFFSET] = o;
			} else {
				t[END_CONTAINER] = n;
				t[END_OFFSET] = o;
			}

			// If one boundary-point of a Range is set to have a root container
			// other than the current one for the Range, the Range is collapsed to
			// the new position. This enforces the restriction that both boundary-
			// points of a Range must have the same root container.
			ec = t[END_CONTAINER];
			while (ec.parentNode)
				ec = ec.parentNode;

			sc = t[START_CONTAINER];
			while (sc.parentNode)
				sc = sc.parentNode;

			if (sc == ec) {
				// The start position of a Range is guaranteed to never be after the
				// end position. To enforce this restriction, if the start is set to
				// be at a position after the end, the Range is collapsed to that
				// position.
				if (_compareBoundaryPoints(t[START_CONTAINER], t[START_OFFSET], t[END_CONTAINER], t[END_OFFSET]) > 0)
					t.collapse(st);
			} else
				t.collapse(st);

			t.collapsed = _isCollapsed();
			t.commonAncestorContainer = dom.findCommonAncestor(t[START_CONTAINER], t[END_CONTAINER]);
		};

		function _traverse(how) {
			var c, endContainerDepth = 0, startContainerDepth = 0, p, depthDiff, startNode, endNode, sp, ep;

			if (t[START_CONTAINER] == t[END_CONTAINER])
				return _traverseSameContainer(how);

			for (c = t[END_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == t[START_CONTAINER])
					return _traverseCommonStartContainer(c, how);

				++endContainerDepth;
			}

			for (c = t[START_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == t[END_CONTAINER])
					return _traverseCommonEndContainer(c, how);

				++startContainerDepth;
			}

			depthDiff = startContainerDepth - endContainerDepth;

			startNode = t[START_CONTAINER];
			while (depthDiff > 0) {
				startNode = startNode.parentNode;
				depthDiff--;
			}

			endNode = t[END_CONTAINER];
			while (depthDiff < 0) {
				endNode = endNode.parentNode;
				depthDiff++;
			}

			// ascend the ancestor hierarchy until we have a common parent.
			for (sp = startNode.parentNode, ep = endNode.parentNode; sp != ep; sp = sp.parentNode, ep = ep.parentNode) {
				startNode = sp;
				endNode = ep;
			}

			return _traverseCommonAncestors(startNode, endNode, how);
		};

		 function _traverseSameContainer(how) {
			var frag, s, sub, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			// If selection is empty, just return the fragment
			if (t[START_OFFSET] == t[END_OFFSET])
				return frag;

			// Text node needs special case handling
			if (t[START_CONTAINER].nodeType == 3 /* TEXT_NODE */) {
				// get the substring
				s = t[START_CONTAINER].nodeValue;
				sub = s.substring(t[START_OFFSET], t[END_OFFSET]);

				// set the original text node to its new value
				if (how != CLONE) {
					t[START_CONTAINER].deleteData(t[START_OFFSET], t[END_OFFSET] - t[START_OFFSET]);

					// Nothing is partially selected, so collapse to start point
					t.collapse(TRUE);
				}

				if (how == DELETE)
					return;

				frag.appendChild(doc.createTextNode(sub));
				return frag;
			}

			// Copy nodes between the start/end offsets.
			n = _getSelectedNode(t[START_CONTAINER], t[START_OFFSET]);
			cnt = t[END_OFFSET] - t[START_OFFSET];

			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag)
					frag.appendChild( xferNode );

				--cnt;
				n = sibling;
			}

			// Nothing is partially selected, so collapse to start point
			if (how != CLONE)
				t.collapse(TRUE);

			return frag;
		};

		function _traverseCommonStartContainer(endAncestor, how) {
			var frag, n, endIdx, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			n = _traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			endIdx = nodeIndex(endAncestor);
			cnt = endIdx - t[START_OFFSET];

			if (cnt <= 0) {
				// Collapse to just before the endAncestor, which
				// is partially selected.
				if (how != CLONE) {
					t.setEndBefore(endAncestor);
					t.collapse(FALSE);
				}

				return frag;
			}

			n = endAncestor.previousSibling;
			while (cnt > 0) {
				sibling = n.previousSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag)
					frag.insertBefore(xferNode, frag.firstChild);

				--cnt;
				n = sibling;
			}

			// Collapse to just before the endAncestor, which
			// is partially selected.
			if (how != CLONE) {
				t.setEndBefore(endAncestor);
				t.collapse(FALSE);
			}

			return frag;
		};

		function _traverseCommonEndContainer(startAncestor, how) {
			var frag, startIdx, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			startIdx = nodeIndex(startAncestor);
			++startIdx; // Because we already traversed it

			cnt = t[END_OFFSET] - startIdx;
			n = startAncestor.nextSibling;
			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag)
					frag.appendChild(xferNode);

				--cnt;
				n = sibling;
			}

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(TRUE);
			}

			return frag;
		};

		function _traverseCommonAncestors(startAncestor, endAncestor, how) {
			var n, frag, commonParent, startOffset, endOffset, cnt, sibling, nextSibling;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			commonParent = startAncestor.parentNode;
			startOffset = nodeIndex(startAncestor);
			endOffset = nodeIndex(endAncestor);
			++startOffset;

			cnt = endOffset - startOffset;
			sibling = startAncestor.nextSibling;

			while (cnt > 0) {
				nextSibling = sibling.nextSibling;
				n = _traverseFullySelected(sibling, how);

				if (frag)
					frag.appendChild(n);

				sibling = nextSibling;
				--cnt;
			}

			n = _traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(TRUE);
			}

			return frag;
		};

		function _traverseRightBoundary(root, how) {
			var next = _getSelectedNode(t[END_CONTAINER], t[END_OFFSET] - 1), parent, clonedParent, prevSibling, clonedChild, clonedGrandParent, isFullySelected = next != t[END_CONTAINER];

			if (next == root)
				return _traverseNode(next, isFullySelected, FALSE, how);

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, FALSE, how);

			while (parent) {
				while (next) {
					prevSibling = next.previousSibling;
					clonedChild = _traverseNode(next, isFullySelected, FALSE, how);

					if (how != DELETE)
						clonedParent.insertBefore(clonedChild, clonedParent.firstChild);

					isFullySelected = TRUE;
					next = prevSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.previousSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, FALSE, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}
		};

		function _traverseLeftBoundary(root, how) {
			var next = _getSelectedNode(t[START_CONTAINER], t[START_OFFSET]), isFullySelected = next != t[START_CONTAINER], parent, clonedParent, nextSibling, clonedChild, clonedGrandParent;

			if (next == root)
				return _traverseNode(next, isFullySelected, TRUE, how);

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, TRUE, how);

			while (parent) {
				while (next) {
					nextSibling = next.nextSibling;
					clonedChild = _traverseNode(next, isFullySelected, TRUE, how);

					if (how != DELETE)
						clonedParent.appendChild(clonedChild);

					isFullySelected = TRUE;
					next = nextSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.nextSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, TRUE, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}
		};

		function _traverseNode(n, isFullySelected, isLeft, how) {
			var txtValue, newNodeValue, oldNodeValue, offset, newNode;

			if (isFullySelected)
				return _traverseFullySelected(n, how);

			if (n.nodeType == 3 /* TEXT_NODE */) {
				txtValue = n.nodeValue;

				if (isLeft) {
					offset = t[START_OFFSET];
					newNodeValue = txtValue.substring(offset);
					oldNodeValue = txtValue.substring(0, offset);
				} else {
					offset = t[END_OFFSET];
					newNodeValue = txtValue.substring(0, offset);
					oldNodeValue = txtValue.substring(offset);
				}

				if (how != CLONE)
					n.nodeValue = oldNodeValue;

				if (how == DELETE)
					return;

				newNode = n.cloneNode(FALSE);
				newNode.nodeValue = newNodeValue;

				return newNode;
			}

			if (how == DELETE)
				return;

			return n.cloneNode(FALSE);
		};

		function _traverseFullySelected(n, how) {
			if (how != DELETE)
				return how == CLONE ? n.cloneNode(TRUE) : n;

			n.parentNode.removeChild(n);
		};
	};

	ns.Range = Range;
})(tinymce.dom);

/**
 * TridentSelection.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	function Selection(selection) {
		var self = this, dom = selection.dom, TRUE = true, FALSE = false;

		function getPosition(rng, start) {
			var checkRng, startIndex = 0, endIndex, inside,
				children, child, offset, index, position = -1, parent;

			// Setup test range, collapse it and get the parent
			checkRng = rng.duplicate();
			checkRng.collapse(start);
			parent = checkRng.parentElement();

			// Check if the selection is within the right document
			if (parent.ownerDocument !== selection.dom.doc)
				return;

			// IE will report non editable elements as it's parent so look for an editable one
			while (parent.contentEditable === "false") {
				parent = parent.parentNode;
			}

			// If parent doesn't have any children then return that we are inside the element
			if (!parent.hasChildNodes()) {
				return {node : parent, inside : 1};
			}

			// Setup node list and endIndex
			children = parent.children;
			endIndex = children.length - 1;

			// Perform a binary search for the position
			while (startIndex <= endIndex) {
				index = Math.floor((startIndex + endIndex) / 2);

				// Move selection to node and compare the ranges
				child = children[index];
				checkRng.moveToElementText(child);
				position = checkRng.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', rng);

				// Before/after or an exact match
				if (position > 0) {
					endIndex = index - 1;
				} else if (position < 0) {
					startIndex = index + 1;
				} else {
					return {node : child};
				}
			}

			// Check if child position is before or we didn't find a position
			if (position < 0) {
				// No element child was found use the parent element and the offset inside that
				if (!child) {
					checkRng.moveToElementText(parent);
					checkRng.collapse(true);
					child = parent;
					inside = true;
				} else
					checkRng.collapse(false);

				checkRng.setEndPoint(start ? 'EndToStart' : 'EndToEnd', rng);

				// Fix for edge case: <div style="width: 100px; height:100px;"><table>..</table>ab|c</div>
				if (checkRng.compareEndPoints(start ? 'StartToStart' : 'StartToEnd', rng) > 0) {
					checkRng = rng.duplicate();
					checkRng.collapse(start);

					offset = -1;
					while (parent == checkRng.parentElement()) {
						if (checkRng.move('character', -1) == 0)
							break;

						offset++;
					}
				}

				offset = offset || checkRng.text.replace('\r\n', ' ').length;
			} else {
				// Child position is after the selection endpoint
				checkRng.collapse(true);
				checkRng.setEndPoint(start ? 'StartToStart' : 'StartToEnd', rng);

				// Get the length of the text to find where the endpoint is relative to it's container
				offset = checkRng.text.replace('\r\n', ' ').length;
			}

			return {node : child, position : position, offset : offset, inside : inside};
		};

		// Returns a W3C DOM compatible range object by using the IE Range API
		function getRange() {
			var ieRange = selection.getRng(), domRange = dom.createRng(), element, collapsed, tmpRange, element2, bookmark, fail;

			// If selection is outside the current document just return an empty range
			element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
			if (element.ownerDocument != dom.doc)
				return domRange;

			collapsed = selection.isCollapsed();

			// Handle control selection
			if (ieRange.item) {
				domRange.setStart(element.parentNode, dom.nodeIndex(element));
				domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

				return domRange;
			}

			function findEndPoint(start) {
				var endPoint = getPosition(ieRange, start), container, offset, textNodeOffset = 0, sibling, undef, nodeValue;

				container = endPoint.node;
				offset = endPoint.offset;

				if (endPoint.inside && !container.hasChildNodes()) {
					domRange[start ? 'setStart' : 'setEnd'](container, 0);
					return;
				}

				if (offset === undef) {
					domRange[start ? 'setStartBefore' : 'setEndAfter'](container);
					return;
				}

				if (endPoint.position < 0) {
					sibling = endPoint.inside ? container.firstChild : container.nextSibling;

					if (!sibling) {
						domRange[start ? 'setStartAfter' : 'setEndAfter'](container);
						return;
					}

					if (!offset) {
						if (sibling.nodeType == 3)
							domRange[start ? 'setStart' : 'setEnd'](sibling, 0);
						else
							domRange[start ? 'setStartBefore' : 'setEndBefore'](sibling);

						return;
					}

					// Find the text node and offset
					while (sibling) {
						nodeValue = sibling.nodeValue;
						textNodeOffset += nodeValue.length;

						// We are at or passed the position we where looking for
						if (textNodeOffset >= offset) {
							container = sibling;
							textNodeOffset -= offset;
							textNodeOffset = nodeValue.length - textNodeOffset;
							break;
						}

						sibling = sibling.nextSibling;
					}
				} else {
					// Find the text node and offset
					sibling = container.previousSibling;

					if (!sibling)
						return domRange[start ? 'setStartBefore' : 'setEndBefore'](container);

					// If there isn't any text to loop then use the first position
					if (!offset) {
						if (container.nodeType == 3)
							domRange[start ? 'setStart' : 'setEnd'](sibling, container.nodeValue.length);
						else
							domRange[start ? 'setStartAfter' : 'setEndAfter'](sibling);

						return;
					}

					while (sibling) {
						textNodeOffset += sibling.nodeValue.length;

						// We are at or passed the position we where looking for
						if (textNodeOffset >= offset) {
							container = sibling;
							textNodeOffset -= offset;
							break;
						}

						sibling = sibling.previousSibling;
					}
				}

				domRange[start ? 'setStart' : 'setEnd'](container, textNodeOffset);
			};

			try {
				// Find start point
				findEndPoint(true);

				// Find end point if needed
				if (!collapsed)
					findEndPoint();
			} catch (ex) {
				// IE has a nasty bug where text nodes might throw "invalid argument" when you
				// access the nodeValue or other properties of text nodes. This seems to happend when
				// text nodes are split into two nodes by a delete/backspace call. So lets detect it and try to fix it.
				if (ex.number == -2147024809) {
					// Get the current selection
					bookmark = self.getBookmark(2);

					// Get start element
					tmpRange = ieRange.duplicate();
					tmpRange.collapse(true);
					element = tmpRange.parentElement();

					// Get end element
					if (!collapsed) {
						tmpRange = ieRange.duplicate();
						tmpRange.collapse(false);
						element2 = tmpRange.parentElement();
						element2.innerHTML = element2.innerHTML;
					}

					// Remove the broken elements
					element.innerHTML = element.innerHTML;

					// Restore the selection
					self.moveToBookmark(bookmark);

					// Since the range has moved we need to re-get it
					ieRange = selection.getRng();

					// Find start point
					findEndPoint(true);

					// Find end point if needed
					if (!collapsed)
						findEndPoint();
				} else
					throw ex; // Throw other errors
			}

			return domRange;
		};

		this.getBookmark = function(type) {
			var rng = selection.getRng(), start, end, bookmark = {};

			function getIndexes(node) {
				var node, parent, root, children, i, indexes = [];

				parent = node.parentNode;
				//CONFDEV-6472 Bookmark indexes should start from the body
				root = dom.doc.body.parentNode;

				while (parent != root && parent.nodeType !== 9) {
					children = parent.children;

					i = children.length;
					while (i--) {
						if (node === children[i]) {
							indexes.push(i);
							break;
						}
					}

					node = parent;
					parent = parent.parentNode;
				}

				return indexes;
			};

			function getBookmarkEndPoint(start) {
				var position;

				position = getPosition(rng, start);
				if (position) {
					return {
						position : position.position,
						offset : position.offset,
						indexes : getIndexes(position.node),
						inside : position.inside
					};
				}
			};

			// Non ubstructive bookmark
			if (type === 2) {
				// Handle text selection
				if (!rng.item) {
					bookmark.start = getBookmarkEndPoint(true);

					if (!selection.isCollapsed())
						bookmark.end = getBookmarkEndPoint();
				} else
					bookmark.start = {ctrl : true, indexes : getIndexes(rng.item(0))};
			}

			return bookmark;
		};

		this.moveToBookmark = function(bookmark) {
			var rng, body = dom.doc.body;

			function resolveIndexes(indexes) {
				var node, i, idx, children;

				//CONFDEV-6472 Bookmark indexes should start from the body
				node = dom.doc.body;
				for (i = indexes.length - 1; i >= 0; i--) {
					children = node.children;
					idx = indexes[i];

					if (idx <= children.length - 1) {
						node = children[idx];
					}
				}

				return node;
			};
			
			function setBookmarkEndPoint(start) {
				var endPoint = bookmark[start ? 'start' : 'end'], moveLeft, moveRng, undef;

				if (endPoint) {
					moveLeft = endPoint.position > 0;

					moveRng = body.createTextRange();
					moveRng.moveToElementText(resolveIndexes(endPoint.indexes));

					offset = endPoint.offset;
					if (offset !== undef) {
						moveRng.collapse(endPoint.inside || moveLeft);
						moveRng.moveStart('character', moveLeft ? -offset : offset);
					} else
						moveRng.collapse(start);

					rng.setEndPoint(start ? 'StartToStart' : 'EndToStart', moveRng);

					if (start)
						rng.collapse(true);
				}
			};

			if (bookmark.start) {
				if (bookmark.start.ctrl) {
					rng = body.createControlRange();
					rng.addElement(resolveIndexes(bookmark.start.indexes));
					rng.select();
				} else {
					rng = body.createTextRange();
					setBookmarkEndPoint(true);
					setBookmarkEndPoint();
					rng.select();
				}
			}
		};

		this.addRange = function(rng) {
			var ieRng, ctrlRng, startContainer, startOffset, endContainer, endOffset, doc = selection.dom.doc, body = doc.body;

			function setEndPoint(start) {
				var container, offset, marker, tmpRng, nodes;

				marker = dom.create('a');
				container = start ? startContainer : endContainer;
				offset = start ? startOffset : endOffset;
				tmpRng = ieRng.duplicate();

				if (container == doc || container == doc.documentElement) {
					container = body;
					offset = 0;
				}

				if (container.nodeType == 3) {
					container.parentNode.insertBefore(marker, container);
					tmpRng.moveToElementText(marker);
					tmpRng.moveStart('character', offset);
					dom.remove(marker);
					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
				} else {
					nodes = container.childNodes;

					if (nodes.length) {
						if (offset >= nodes.length) {
							dom.insertAfter(marker, nodes[nodes.length - 1]);
						} else {
							container.insertBefore(marker, nodes[offset]);
						}

						tmpRng.moveToElementText(marker);
					} else {
						// Empty node selection for example <div>|</div>
						marker = doc.createTextNode('\uFEFF');
						container.appendChild(marker);
						tmpRng.moveToElementText(marker.parentNode);
						tmpRng.collapse(TRUE);
					}

					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
					dom.remove(marker);
				}
			}

			// Setup some shorter versions
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;
			ieRng = body.createTextRange();

			// If single element selection then try making a control selection out of it
			if (startContainer == endContainer && startContainer.nodeType == 1 && startOffset == endOffset - 1) {
				if (startOffset == endOffset - 1) {
					try {
						ctrlRng = body.createControlRange();
						ctrlRng.addElement(startContainer.childNodes[startOffset]);
						ctrlRng.select();
						return;
					} catch (ex) {
						// Ignore
					}
				}
			}

			// Set start/end point of selection
			setEndPoint(true);
			setEndPoint();

			// Select the new range and scroll it into view
			ieRng.select();
		};

		// Expose range method
		this.getRangeAt = getRange;
	};

	// Expose the selection object
	tinymce.dom.TridentSelection = Selection;
})();

// #ifndef jquery

/*
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context),
		soFar = selector, ret, cur, pop, i;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec("");
		m = chunker.exec(soFar);

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string",
				elem, i = 0, l = checkSet.length;

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return (/h\d/i).test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return (/input|select|textarea|button/i).test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [], i = 0;

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.compareDocumentPosition ? -1 : 1;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.sourceIndex ? -1 : 1;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.ownerDocument ? -1 : 1;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !Sizzle.isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

Sizzle.contains = document.compareDocumentPosition ? function(a, b){
	return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

Sizzle.isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.tinymce.dom.Sizzle = Sizzle;

})();

// #endif

/**
 * EventUtils.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var each = tinymce.each, DOM = tinymce.DOM, isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, Event;

	/**
	 * This class handles DOM events in a cross platform fasion it also keeps track of element
	 * and handler references to be able to clean elements to reduce IE memory leaks.
	 *
	 * @class tinymce.dom.EventUtils
	 */
	tinymce.create('tinymce.dom.EventUtils', {
		/**
		 * Constructs a new EventUtils instance.
		 *
		 * @constructor
		 * @method EventUtils
		 */
		EventUtils : function() {
			this.inits = [];
			this.events = [];
		},

		/**
		 * Adds an event handler to the specified object.
		 *
		 * @method add
		 * @param {Element/Document/Window/Array/String} o Object or element id string to add event handler to or an array of elements/ids/documents.
		 * @param {String/Array} n Name of event handler to add for example: click.
		 * @param {function} f Function to execute when the event occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {function} Function callback handler the same as the one passed in.
		 * @example
		 * // Adds a click handler to the current document
		 * tinymce.dom.Event.add(document, 'click', function(e) {
		 *    console.debug(e.target);
		 * });
		 */
		add : function(o, n, f, s) {
			var cb, t = this, el = t.events, r;

			if (n instanceof Array) {
				r = [];

				each(n, function(n) {
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			o = DOM.get(o);

			if (!o)
				return;

			// Setup event callback
			cb = function(e) {
				// Is all events disabled
				if (t.disabled)
					return;

				/**
				 * CONFDEV-48196
				 * Whenever there is no selection and keydown/keypress event,
                 * stop dispatching event to avoid deleting body of editor
				 */
                if (tinymce.activeEditor && e
                    && (e.type === 'keydown' || e.type === 'keypress')
                    && tinymce.activeEditor.selection.getSel().rangeCount === 0
                    && !((tinymce.isMac ? e.metaKey : e.ctrlKey)
                        && ((e.keyCode === 83) //shortcut for Saving (ctrl+S)
                            || (e.keyCode === 69 && e.shiftKey) //shortcut for Previewing (ctrl+shift+E)
                    ))) {
                    //stop dispatching event unless it is allowed shortcut
                    return;
                }

				e = e || window.event;

				// Patch in target, preventDefault and stopPropagation in IE it's W3C valid
				if (e && isIE && !tinymce.isIE11) { // ATLASSIAN - added a check for IE 11 since preventing default was no longer working
					if (!e.target)
						e.target = e.srcElement;

					// Patch in preventDefault, stopPropagation methods for W3C compatibility
					tinymce.extend(e, t._stoppers);
				}

				if (!s)
					return f(e);

				return f.call(s, e);
			};

			if (n == 'unload') {
				tinymce.unloads.unshift({func : cb});
				return cb;
			}

			if (n == 'init') {
				if (t.domLoaded)
					cb();
				else
					t.inits.push(cb);

				return cb;
			}

			// Store away listener reference
			el.push({
				obj : o,
				name : n,
				func : f,
				cfunc : cb,
				scope : s
			});

			t._add(o, n, cb);

			return f;
		},

		/**
		 * Removes the specified event handler by name and function from a element or collection of elements.
		 *
		 * @method remove
		 * @param {String/Element/Array} o Element ID string or HTML element or an array of elements or ids to remove handler from.
		 * @param {String} n Event handler name like for example: "click"
		 * @param {function} f Function to remove.
		 * @return {bool/Array} Bool state if true if the handler was removed or an array with states if multiple elements where passed in.
		 * @example
		 * // Adds a click handler to the current document
		 * var func = tinymce.dom.Event.add(document, 'click', function(e) {
		 *    console.debug(e.target);
		 * });
		 * 
		 * // Removes the click handler from the document
		 * tinymce.dom.Event.remove(document, 'click', func);
		 */
		remove : function(o, n, f) {
			var t = this, a = t.events, s = false, r;

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.remove(o, n, f));
				});

				return r;
			}

			o = DOM.get(o);

			each(a, function(e, i) {
				if (e.obj == o && e.name == n && (!f || (e.func == f || e.cfunc == f))) {
					a.splice(i, 1);
					t._remove(o, n, e.cfunc);
					s = true;
					return false;
				}
			});

			return s;
		},

		/**
		 * Clears all events of a specific object.
		 *
		 * @method clear
		 * @param {Object} o DOM element or object to remove all events from.
		 * @example
		 * // Cancels all mousedown events in the active editor
		 * tinyMCE.activeEditor.onMouseDown.add(function(ed, e) {
		 *    return tinymce.dom.Event.cancel(e);
		 * });
		 */
		clear : function(o) {
			var t = this, a = t.events, i, e;

			if (o) {
				o = DOM.get(o);

				for (i = a.length - 1; i >= 0; i--) {
					e = a[i];

					if (e.obj === o) {
						t._remove(e.obj, e.name, e.cfunc);
						e.obj = e.cfunc = null;
						a.splice(i, 1);
					}
				}
			}
		},

		/**
		 * Cancels an event for both bubbeling and the default browser behavior.
		 *
		 * @method cancel
		 * @param {Event} e Event object to cancel.
		 * @return {Boolean} Always false.
		 */
		cancel : function(e) {
			if (!e)
				return false;

			this.stop(e);

			return this.prevent(e);
		},

		/**
		 * Stops propogation/bubbeling of an event.
		 *
		 * @method stop
		 * @param {Event} e Event to cancel bubbeling on.
		 * @return {Boolean} Always false.
		 */
		stop : function(e) {
			if (e.stopPropagation)
				e.stopPropagation();
			else
				e.cancelBubble = true;

			return false;
		},

		/**
		 * Prevent default browser behvaior of an event.
		 *
		 * @method prevent
		 * @param {Event} e Event to prevent default browser behvaior of an event.
		 * @return {Boolean} Always false.
		 */
		prevent : function(e) {
			if (e.preventDefault)
				e.preventDefault();
			else
				e.returnValue = false;

			return false;
		},

		/**
		 * Destroys the instance.
		 *
		 * @method destroy
		 */
		destroy : function() {
			var t = this;

			each(t.events, function(e, i) {
				t._remove(e.obj, e.name, e.cfunc);
				e.obj = e.cfunc = null;
			});

			t.events = [];
			t = null;
		},

		_add : function(o, n, f) {
			if (o.attachEvent)
				o.attachEvent('on' + n, f);
			else if (o.addEventListener)
				o.addEventListener(n, f, false);
			else
				o['on' + n] = f;
		},

		_remove : function(o, n, f) {
			if (o) {
				try {
					if (o.detachEvent)
						o.detachEvent('on' + n, f);
					else if (o.removeEventListener)
						o.removeEventListener(n, f, false);
					else
						o['on' + n] = null;
				} catch (ex) {
					// Might fail with permission denined on IE so we just ignore that
				}
			}
		},

		_pageInit : function(win) {
			var t = this;

			// Keep it from running more than once
			if (t.domLoaded)
				return;

			t.domLoaded = true;

			each(t.inits, function(c) {
				c();
			});

			t.inits = [];
		},

		_wait : function(win) {
			var t = this, doc = win.document;

			// No need since the document is already loaded
			if (win.tinyMCE_GZ && tinyMCE_GZ.loaded) {
				t.domLoaded = 1;
				return;
			}

			// When loaded asynchronously, the DOM Content may already be loaded
			if (doc.readyState === 'complete') {
				t._pageInit(win);
				return;
			}

			// Use IE method
			if (doc.attachEvent) {
				doc.attachEvent("onreadystatechange", function() {
					if (doc.readyState === "complete") {
						doc.detachEvent("onreadystatechange", arguments.callee);
						t._pageInit(win);
					}
				});

				if (doc.documentElement.doScroll && win == win.top) {
					(function() {
						if (t.domLoaded)
							return;

						try {
							// If IE is used, use the trick by Diego Perini licensed under MIT by request to the author.
							// http://javascript.nwbox.com/IEContentLoaded/
							doc.documentElement.doScroll("left");
						} catch (ex) {
							setTimeout(arguments.callee, 0);
							return;
						}

						t._pageInit(win);
					})();
				}
			} else if (doc.addEventListener) {
				t._add(win, 'DOMContentLoaded', function() {
					t._pageInit(win);
				});
			}

			t._add(win, 'load', function() {
				t._pageInit(win);
			});
		},

		_stoppers : {
			preventDefault : function() {
				this.returnValue = false;
			},

			stopPropagation : function() {
				this.cancelBubble = true;
			}
		}
	});

	/**
	 * Instance of EventUtils for the current document.
	 *
	 * @property Event
	 * @member tinymce.dom
	 * @type tinymce.dom.EventUtils
	 */
	Event = tinymce.dom.Event = new tinymce.dom.EventUtils();

	// Dispatch DOM content loaded event for IE and Safari
	Event._wait(window);

	tinymce.addUnload(function() {
		Event.destroy();
	});
})(tinymce);

/**
 * Element.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * Element class, this enables element blocking in IE. Element blocking is a method to block out select blockes that
	 * gets visible though DIVs on IE 6 it uses a iframe for this blocking. This class also shortens the length of some DOM API calls
	 * since it's bound to an element.
	 *
	 * @class tinymce.dom.Element
	 * @example
	 * // Creates an basic element for an existing element
	 * var elm = new tinymce.dom.Element('someid');
	 * 
	 * elm.setStyle('background-color', 'red');
	 * elm.moveTo(10, 10);
	 */

	/**
	 * Constructs a new Element instance. Consult the Wiki for more details on this class.
	 *
	 * @constructor
	 * @method Element
	 * @param {String} id Element ID to bind/execute methods on.
	 * @param {Object} settings Optional settings name/value collection.
	 */
	tinymce.dom.Element = function(id, settings) {
		var t = this, dom, el;

		t.settings = settings = settings || {};
		t.id = id;
		t.dom = dom = settings.dom || tinymce.DOM;

		// Only IE leaks DOM references, this is a lot faster
		if (!tinymce.isIE)
			el = dom.get(t.id);

		tinymce.each(
				('getPos,getRect,getParent,add,setStyle,getStyle,setStyles,' + 
				'setAttrib,setAttribs,getAttrib,addClass,removeClass,' + 
				'hasClass,getOuterHTML,setOuterHTML,remove,show,hide,' + 
				'isHidden,setHTML,get').split(/,/)
			, function(k) {
				t[k] = function() {
					var a = [id], i;

					for (i = 0; i < arguments.length; i++)
						a.push(arguments[i]);

					a = dom[k].apply(dom, a);
					t.update(k);

					return a;
				};
		});

		tinymce.extend(t, {
			/**
			 * Adds a event handler to the element.
			 *
			 * @method on
			 * @param {String} n Event name like for example "click".
			 * @param {function} f Function to execute on the specified event.
			 * @param {Object} s Optional scope to execute function on.
			 * @return {function} Event handler function the same as the input function.
			 */
			on : function(n, f, s) {
				return tinymce.dom.Event.add(t.id, n, f, s);
			},

			/**
			 * Returns the absolute X, Y cordinate of the element.
			 *
			 * @method getXY
			 * @return {Object} Objext with x, y cordinate fields.
			 */
			getXY : function() {
				return {
					x : parseInt(t.getStyle('left')),
					y : parseInt(t.getStyle('top'))
				};
			},

			/**
			 * Returns the size of the element by a object with w and h fields.
			 *
			 * @method getSize
			 * @return {Object} Object with element size with a w and h field.
			 */
			getSize : function() {
				var n = dom.get(t.id);

				return {
					w : parseInt(t.getStyle('width') || n.clientWidth),
					h : parseInt(t.getStyle('height') || n.clientHeight)
				};
			},

			/**
			 * Moves the element to a specific absolute position.
			 *
			 * @method moveTo
			 * @param {Number} x X cordinate of element position.
			 * @param {Number} y Y cordinate of element position.
			 */
			moveTo : function(x, y) {
				t.setStyles({left : x, top : y});
			},

			/**
			 * Moves the element relative to the current position.
			 *
			 * @method moveBy
			 * @param {Number} x Relative X cordinate of element position.
			 * @param {Number} y Relative Y cordinate of element position.
			 */
			moveBy : function(x, y) {
				var p = t.getXY();

				t.moveTo(p.x + x, p.y + y);
			},

			/**
			 * Resizes the element to a specific size.
			 *
			 * @method resizeTo
			 * @param {Number} w New width of element.
			 * @param {Numner} h New height of element.
			 */
			resizeTo : function(w, h) {
				t.setStyles({width : w, height : h});
			},

			/**
			 * Resizes the element relative to the current sizeto a specific size.
			 *
			 * @method resizeBy
			 * @param {Number} w Relative width of element.
			 * @param {Numner} h Relative height of element.
			 */
			resizeBy : function(w, h) {
				var s = t.getSize();

				t.resizeTo(s.w + w, s.h + h);
			},

			/**
			 * Updates the element blocker in IE6 based on the style information of the element.
			 *
			 * @method update
			 * @param {String} k Optional function key. Used internally.
			 */
			update : function(k) {
				var b;

				if (tinymce.isIE6 && settings.blocker) {
					k = k || '';

					// Ignore getters
					if (k.indexOf('get') === 0 || k.indexOf('has') === 0 || k.indexOf('is') === 0)
						return;

					// Remove blocker on remove
					if (k == 'remove') {
						dom.remove(t.blocker);
						return;
					}

					if (!t.blocker) {
						t.blocker = dom.uniqueId();
						b = dom.add(settings.container || dom.getRoot(), 'iframe', {id : t.blocker, style : 'position:absolute;', frameBorder : 0, src : 'javascript:""'});
						dom.setStyle(b, 'opacity', 0);
					} else
						b = dom.get(t.blocker);

					dom.setStyles(b, {
						left : t.getStyle('left', 1),
						top : t.getStyle('top', 1),
						width : t.getStyle('width', 1),
						height : t.getStyle('height', 1),
						display : t.getStyle('display', 1),
						zIndex : parseInt(t.getStyle('zIndex', 1) || 0) - 1
					});
				}
			}
		});
	};
})(tinymce);

/**
 * Selection.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	function trimNl(s) {
		return s.replace(/[\n\r]+/g, '');
	};

	// Shorten names
	var is = tinymce.is, isIE = tinymce.isIE, each = tinymce.each;

	/**
	 * This class handles text and control selection it's an crossbrowser utility class.
	 * Consult the TinyMCE Wiki API for more details and examples on how to use this class.
	 *
	 * @class tinymce.dom.Selection
	 * @example
	 * // Getting the currently selected node for the active editor
	 * alert(tinymce.activeEditor.selection.getNode().nodeName);
	 */
	tinymce.create('tinymce.dom.Selection', {
		/**
		 * Constructs a new selection instance.
		 *
		 * @constructor
		 * @method Selection
		 * @param {tinymce.dom.DOMUtils} dom DOMUtils object reference.
		 * @param {Window} win Window to bind the selection object to.
		 * @param {tinymce.dom.Serializer} serializer DOM serialization class to use for getContent.
		 */
		Selection : function(dom, win, serializer) {
			var t = this;

			t.dom = dom;
			t.win = win;
			t.serializer = serializer;

			// Add events
			each([
				/**
				 * This event gets executed before contents is extracted from the selection.
				 *
				 * @event onBeforeSetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be returned.
				 */
				'onBeforeSetContent',

				/**
				 * This event gets executed before contents is inserted into selection.
				 *
				 * @event onBeforeGetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be inserted.
				 */
				'onBeforeGetContent',

				/**
				 * This event gets executed when contents is inserted into selection.
				 *
				 * @event onSetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be inserted.
				 */
				'onSetContent',

				/**
				 * This event gets executed when contents is extracted from the selection.
				 *
				 * @event onGetContent
				 * @param {tinymce.dom.Selection} selection Selection object that fired the event.
				 * @param {Object} args Contains things like the contents that will be returned.
				 */
				'onGetContent'
			], function(e) {
				t[e] = new tinymce.util.Dispatcher(t);
			});

			// No W3C Range support
			if (!t.win.getSelection)
				t.tridentSel = new tinymce.dom.TridentSelection(t);

			if (tinymce.isIE && dom.boxModel)
				this._fixIESelection();

			// Prevent leaks
			tinymce.addUnload(t.destroy, t);
		},

		/**
		 * Move the selection cursor range to the specified node and offset.
		 * @param node Node to put the cursor in.
		 * @param offset Offset from the start of the node to put the cursor at.
		 */
		setCursorLocation: function(node, offset) {
			var t = this; var r = t.dom.createRng();
			r.setStart(node, offset);
			r.setEnd(node, offset);
			t.setRng(r);
			t.collapse(false);
		},
		/**
		 * Returns the selected contents using the DOM serializer passed in to this class.
		 *
		 * @method getContent
		 * @param {Object} s Optional settings class with for example output format text or html.
		 * @return {String} Selected contents in for example HTML format.
		 * @example
		 * // Alerts the currently selected contents
		 * alert(tinyMCE.activeEditor.selection.getContent());
		 *
		 * // Alerts the currently selected contents as plain text
		 * alert(tinyMCE.activeEditor.selection.getContent({format : 'text'}));
		 */
		getContent : function(s) {
			var t = this, r = t.getRng(), e = t.dom.create("body"), se = t.getSel(), wb, wa, n;

			s = s || {};
			wb = wa = '';
			s.get = true;
			s.format = s.format || 'html';
			s.forced_root_block = '';
			t.onBeforeGetContent.dispatch(t, s);

			if (s.format == 'text')
				return t.isCollapsed() ? '' : (r.text || (se.toString ? se.toString() : ''));

			if (r.cloneContents) {
				n = r.cloneContents();

				if (n)
					e.appendChild(n);
			} else if (is(r.item) || is(r.htmlText)) {
				// IE will produce invalid markup if elements are present that
				// it doesn't understand like custom elements or HTML5 elements.
				// Adding a BR in front of the contents and then remoiving it seems to fix it though.
				e.innerHTML = '<br>' + (r.item ? r.item(0).outerHTML : r.htmlText);
				e.removeChild(e.firstChild);
			} else
				e.innerHTML = r.toString();

			// Keep whitespace before and after
			if (/^\s/.test(e.innerHTML))
				wb = ' ';

			if (/\s+$/.test(e.innerHTML))
				wa = ' ';

			s.getInner = true;

			s.content = t.isCollapsed() ? '' : wb + t.serializer.serialize(e, s) + wa;
			t.onGetContent.dispatch(t, s);

			return s.content;
		},

		/**
		 * Sets the current selection to the specified content. If any contents is selected it will be replaced
		 * with the contents passed in to this function. If there is no selection the contents will be inserted
		 * where the caret is placed in the editor/page.
		 *
		 * @method setContent
		 * @param {String} content HTML contents to set could also be other formats depending on settings.
		 * @param {Object} args Optional settings object with for example data format.
		 * @example
		 * // Inserts some HTML contents at the current selection
		 * tinyMCE.activeEditor.selection.setContent('<strong>Some contents</strong>');
		 */
		setContent : function(content, args) {
			var self = this, rng = self.getRng(), caretNode, doc = self.win.document, frag, temp;

			args = args || {format : 'html'};
			args.set = true;
			content = args.content = content;

			// Dispatch before set content event
			if (!args.no_events)
				self.onBeforeSetContent.dispatch(self, args);

			content = args.content;

			if (rng.insertNode) {
				// Make caret marker since insertNode places the caret in the beginning of text after insert
				content += '<span id="__caret">_</span>';

				// Delete and insert new node
				if (rng.startContainer == doc && rng.endContainer == doc) {
					// WebKit will fail if the body is empty since the range is then invalid and it can't insert contents
					doc.body.innerHTML = content;
				} else {
					rng.deleteContents();

					if (doc.body.childNodes.length == 0) {
						doc.body.innerHTML = content;
					} else {
						// createContextualFragment doesn't exists in IE 9 DOMRanges
						if (rng.createContextualFragment) {
							try {
								rng.insertNode(rng.createContextualFragment(content));
							} catch (e) {
								// Atlassian - CONF-26019
								// Webkit can throw an exception that can be recovered from in some corner cases
								if (rng.startOffset === 0 && rng.endOffset === 0 && rng.startContainer.children.length === 0) {
									frag = doc.createDocumentFragment();
									temp = doc.createElement('div');

									//outerHTML doesn't work
									temp.innerHTML = content;
									temp = temp.children[0];
									frag.appendChild(temp.cloneNode());
									while(temp = temp.nextSibling) {
										frag.appendChild(temp.cloneNode());
									}

									rng.startContainer.parentNode.insertBefore(frag, rng.startContainer);
								} else {
									//something is actually wrong
									throw(e);
								}
							}
						} else {
							// Fake createContextualFragment call in IE 9
							frag = doc.createDocumentFragment();
							temp = doc.createElement('div');

							frag.appendChild(temp);
							temp.outerHTML = content;

							rng.insertNode(frag);
						}
					}
				}

				try {
					// Move to caret marker
					caretNode = self.dom.get('__caret');

					// Make sure we wrap it completely, Opera fails with a simple select call
					rng = doc.createRange();
					rng.setStartBefore(caretNode);
					rng.setEndBefore(caretNode);
					self.setRng(rng);

					// Remove the caret position
					self.dom.remove('__caret');


					self.setRng(rng);
				} catch (ex) {
					// Might fail on Chrome/Opera for some odd reason
					AJS.logError('Exception occurred at tinymce setContent(): ' + ex);

				}

			} else {
				if (rng.item) {
					// Delete content and get caret text selection
					doc.execCommand('Delete', false, null);
					rng = self.getRng();
				}

				// Explorer removes spaces from the beginning of pasted contents
				if (/^\s+/.test(content)) {
					rng.pasteHTML('<span id="__mce_tmp">_</span>' + content);
					self.dom.remove('__mce_tmp');
				} else
				rng.pasteHTML(content);
			}

			// Dispatch set content event
			if (!args.no_events)
				self.onSetContent.dispatch(self, args);
		},

		/**
		 * Returns the start element of a selection range. If the start is in a text
		 * node the parent element will be returned.
		 *
		 * @method getStart
		 * @return {Element} Start element of selection range.
		 */
		getStart : function() {
			var rng = this.getRng(), startElement, parentElement, checkRng, node;

			if (rng.duplicate || rng.item) {
				// Control selection, return first item
				if (rng.item)
					return rng.item(0);

				// Get start element
				checkRng = rng.duplicate();
				checkRng.collapse(1);
				startElement = checkRng.parentElement();

				// Check if range parent is inside the start element, then return the inner parent element
				// This will fix issues when a single element is selected, IE would otherwise return the wrong start element
				parentElement = node = rng.parentElement();
				while (node = node.parentNode) {
					if (node == startElement) {
						startElement = parentElement;
						break;
					}
				}

				return startElement;
			} else {
				startElement = rng.startContainer;

				if (startElement.nodeType == 1 && startElement.hasChildNodes())
					startElement = startElement.childNodes[Math.min(startElement.childNodes.length - 1, rng.startOffset)];

				if (startElement && startElement.nodeType == 3)
					return startElement.parentNode;

				return startElement;
			}
		},

		/**
		 * Returns the end element of a selection range. If the end is in a text
		 * node the parent element will be returned.
		 *
		 * @method getEnd
		 * @return {Element} End element of selection range.
		 */
		getEnd : function() {
			var t = this, r = t.getRng(), e, eo;

			if (r.duplicate || r.item) {
				if (r.item)
					return r.item(0);

				r = r.duplicate();
				r.collapse(0);
				e = r.parentElement();

				if (e && e.nodeName == 'BODY')
					return e.lastChild || e;

				return e;
			} else {
				e = r.endContainer;
				eo = r.endOffset;

				if (e.nodeType == 1 && e.hasChildNodes())
					e = e.childNodes[eo > 0 ? eo - 1 : eo];

				if (e && e.nodeType == 3)
					return e.parentNode;

				return e;
			}
		},

		/**
		 * Returns a bookmark location for the current selection. This bookmark object
		 * can then be used to restore the selection after some content modification to the document.
		 *
		 * @method getBookmark
		 * @param {Number} type Optional state if the bookmark should be simple or not. Default is complex.
		 * @param {Boolean} normalized Optional state that enables you to get a position that it would be after normalization.
		 * @return {Object} Bookmark object, use moveToBookmark with this object to restore the selection.
		 * @example
		 * // Stores a bookmark of the current selection
		 * var bm = tinyMCE.activeEditor.selection.getBookmark();
		 *
		 * tinyMCE.activeEditor.setContent(tinyMCE.activeEditor.getContent() + 'Some new content');
		 *
		 * // Restore the selection bookmark
		 * tinyMCE.activeEditor.selection.moveToBookmark(bm);
		 */
		getBookmark : function(type, normalized) {
			var t = this, dom = t.dom, rng, rng2, id, collapsed, name, element, index, chr = '\uFEFF', styles;

			function findIndex(name, element) {
				var index = 0;

				each(dom.select(name), function(node, i) {
					if (node == element)
						index = i;
				});

				return index;
			};

			if (type == 2) {
				function getLocation() {
					//CONFDEV-6472 Bookmark indexes should start from the body
					var rng = t.getRng(true), root = dom.doc.body, bookmark = {};

					function getPoint(rng, start) {
						var container = rng[start ? 'startContainer' : 'endContainer'],
							offset = rng[start ? 'startOffset' : 'endOffset'], point = [], node, childNodes, after = 0;

						if (container.nodeType == 3) {
							if (normalized) {
								for (node = container.previousSibling; node && node.nodeType == 3; node = node.previousSibling)
									offset += node.nodeValue.length;
							}

							point.push(offset);
						} else {
							childNodes = container.childNodes;

							if (offset >= childNodes.length && childNodes.length) {
								after = 1;
								offset = Math.max(0, childNodes.length - 1);
							}

							point.push(t.dom.nodeIndex(childNodes[offset], normalized) + after);
						}

						for (; container && container != root; container = container.parentNode)
							point.push(t.dom.nodeIndex(container, normalized));

						return point;
					};

					bookmark.start = getPoint(rng, true);

					if (!t.isCollapsed())
						bookmark.end = getPoint(rng);

					return bookmark;
				};

				if (t.tridentSel)
					return t.tridentSel.getBookmark(type);

				return getLocation();
			}

			// Handle simple range
			if (type)
				return {rng : t.getRng()};

			rng = t.getRng();
			id = dom.uniqueId();
			collapsed = tinyMCE.activeEditor.selection.isCollapsed();
			styles = 'overflow:hidden;line-height:0px';

			// Explorer method
			if (rng.duplicate || rng.item) {
				// Text selection
				if (!rng.item) {
					rng2 = rng.duplicate();

					try {
						// Insert start marker
						rng.collapse();
						rng.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_start" style="' + styles + '">' + chr + '</span>');

						// Insert end marker
						if (!collapsed) {
							rng2.collapse(false);

							// Detect the empty space after block elements in IE and move the end back one character <p></p>] becomes <p>]</p>
							rng.moveToElementText(rng2.parentElement());
							if (rng.compareEndPoints('StartToEnd', rng2) == 0)
								rng2.move('character', -1);

							rng2.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_end" style="' + styles + '">' + chr + '</span>');
						}
					} catch (ex) {
						// IE might throw unspecified error so lets ignore it
						return null;
					}
				} else {
					// Control selection
					element = rng.item(0);
					name = element.nodeName;

					return {name : name, index : findIndex(name, element)};
				}
			} else {
				element = t.getNode();
				name = element.nodeName;
				if (name == 'IMG')
					return {name : name, index : findIndex(name, element)};

				// W3C method
				rng2 = rng.cloneRange();

				// Insert end marker
				if (!collapsed) {
					rng2.collapse(false);
					rng2.insertNode(dom.create('span', {'data-mce-type' : "bookmark", id : id + '_end', style : styles}, chr));
				}

				rng.collapse(true);
				rng.insertNode(dom.create('span', {'data-mce-type' : "bookmark", id : id + '_start', style : styles}, chr));
			}

			t.moveToBookmark({id : id, keep : 1});

			return {id : id};
		},

		/**
		 * Restores the selection to the specified bookmark.
		 *
		 * @method moveToBookmark
		 * @param {Object} bookmark Bookmark to restore selection from.
		 * @return {Boolean} true/false if it was successful or not.
		 * @example
		 * // Stores a bookmark of the current selection
		 * var bm = tinyMCE.activeEditor.selection.getBookmark();
		 *
		 * tinyMCE.activeEditor.setContent(tinyMCE.activeEditor.getContent() + 'Some new content');
		 *
		 * // Restore the selection bookmark
		 * tinyMCE.activeEditor.selection.moveToBookmark(bm);
		 */
		moveToBookmark : function(bookmark) {
			var t = this, dom = t.dom, marker1, marker2, rng, root, startContainer, endContainer, startOffset, endOffset;

			if (bookmark) {
				if (bookmark.start) {
					rng = dom.createRng();
					//CONFDEV-6472 Bookmark indexes should start from the body
					root = dom.doc.body;

					function setEndPoint(start) {
						var point = bookmark[start ? 'start' : 'end'], i, node, offset, children;

						if (point) {
							offset = point[0];

							// Find container node
							for (node = root, i = point.length - 1; i >= 1; i--) {
								children = node.childNodes;

								if (point[i] > children.length - 1)
									return;

								node = children[point[i]];
							}

							// Move text offset to best suitable location
							if (node.nodeType === 3)
								offset = Math.min(point[0], node.nodeValue.length);

							// Move element offset to best suitable location
							if (node.nodeType === 1)
								offset = Math.min(point[0], node.childNodes.length);

							// Set offset within container node
							if (start)
								rng.setStart(node, offset);
							else
								rng.setEnd(node, offset);
						}

						return true;
					};

					if (t.tridentSel)
						return t.tridentSel.moveToBookmark(bookmark);

					if (setEndPoint(true) && setEndPoint()) {
						t.setRng(rng);
					}
				} else if (bookmark.id) {
					function restoreEndPoint(suffix) {
						var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev, keep = bookmark.keep;

						if (marker) {
							node = marker.parentNode;

							if (suffix == 'start') {
								if (!keep) {
									idx = dom.nodeIndex(marker);
								} else {
									node = marker.firstChild;
									idx = 1;
								}

								startContainer = endContainer = node;
								startOffset = endOffset = idx;
							} else {
								if (!keep) {
									idx = dom.nodeIndex(marker);
								} else {
									node = marker.firstChild;
									idx = 1;
								}

								endContainer = node;
								endOffset = idx;
							}

							if (!keep) {
								prev = marker.previousSibling;
								next = marker.nextSibling;

								// Remove all marker text nodes
								each(tinymce.grep(marker.childNodes), function(node) {
									if (node.nodeType == 3)
										node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
								});

								// Remove marker but keep children if for example contents where inserted into the marker
								// Also remove duplicated instances of the marker for example by a split operation or by WebKit auto split on paste feature
								while (marker = dom.get(bookmark.id + '_' + suffix))
									dom.remove(marker, 1);

								// If siblings are text nodes then merge them unless it's Opera since it some how removes the node
								// and we are sniffing since adding a lot of detection code for a browser with 3% of the market isn't worth the effort. Sorry, Opera but it's just a fact
								if (prev && next && prev.nodeType == next.nodeType && prev.nodeType == 3 && !tinymce.isOpera) {
									idx = prev.nodeValue.length;
									prev.appendData(next.nodeValue);
									dom.remove(next);

									if (suffix == 'start') {
										startContainer = endContainer = prev;
										startOffset = endOffset = idx;
									} else {
										endContainer = prev;
										endOffset = idx;
									}
								}
							}
						}
					};

					function addBogus(node) {
						// Adds a bogus BR element for empty block elements or just a space on IE since it renders BR elements incorrectly
						if (dom.isBlock(node) && !node.innerHTML)
							node.innerHTML = !isIE ? '<br data-mce-bogus="1" />' : ' ';

						return node;
					};

					// Restore start/end points
					restoreEndPoint('start');
					restoreEndPoint('end');

					if (startContainer) {
						rng = dom.createRng();
						rng.setStart(addBogus(startContainer), startOffset);
						rng.setEnd(addBogus(endContainer), endOffset);
						t.setRng(rng);
					}
				} else if (bookmark.name) {
					t.select(dom.select(bookmark.name)[bookmark.index]);
				} else if (bookmark.rng)
					t.setRng(bookmark.rng);
			}
		},

		/**
		 * Selects the specified element. This will place the start and end of the selection range around the element.
		 *
		 * @method select
		 * @param {Element} node HMTL DOM element to select.
		 * @param {Boolean} content Optional bool state if the contents should be selected or not on non IE browser.
		 * @return {Element} Selected element the same element as the one that got passed in.
		 * @example
		 * // Select the first paragraph in the active editor
		 * tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
		 */
		select : function(node, content) {
			var t = this, dom = t.dom, rng = dom.createRng(), idx;

			if (node) {
				idx = dom.nodeIndex(node);
				rng.setStart(node.parentNode, idx);
				rng.setEnd(node.parentNode, idx + 1);

				// Find first/last text node or BR element
				if (content) {
					function setPoint(node, start) {
						var walker = new tinymce.dom.TreeWalker(node, node);

						try {
							do {
								// Text node
								if (node.nodeType == 3 && tinymce.trim(node.nodeValue).length != 0) {
									if (start)
										rng.setStart(node, 0);
									else
										rng.setEnd(node, node.nodeValue.length);

									return;
								}

								// BR element
								if (node.nodeName == 'BR') {
									if (start)
										rng.setStartBefore(node);
									else
										rng.setEndBefore(node);

									return;
								}
							} while (node = (start ? walker.next() : walker.prev()));
						} catch (e) {
							AJS.log("Error in Selection.js: select : setPoint: " + e);
						}
					};

					setPoint(node, 1);
					setPoint(node);
				}

				t.setRng(rng);
			}

			return node;
		},

		/**
		 * Returns true/false if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.
		 *
		 * @method isCollapsed
		 * @return {Boolean} true/false state if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.
		 */
		isCollapsed : function() {
			var t = this, r = t.getRng(), s = t.getSel();

			if (!r || r.item)
				return false;

			if (r.compareEndPoints)
				return r.compareEndPoints('StartToEnd', r) === 0;

			return !s || r.collapsed;
		},

		/**
		 * Collapse the selection to start or end of range.
		 *
		 * @method collapse
		 * @param {Boolean} to_start Optional boolean state if to collapse to end or not. Defaults to start.
		 */
		collapse : function(to_start) {
			var self = this, rng = self.getRng(), node;

			// Control range on IE
			if (rng.item) {
				node = rng.item(0);
				rng = self.win.document.body.createTextRange();
				rng.moveToElementText(node);
			}

			rng.collapse(!!to_start);
			self.setRng(rng);
		},

		/**
		 * Returns the browsers internal selection object.
		 *
		 * @method getSel
		 * @return {Selection} Internal browser selection object.
		 */
		getSel : function() {
			var t = this, w = this.win;

			return w.getSelection ? w.getSelection() : w.document.selection;
		},

		/**
		 * Returns the browsers internal range object.
		 *
		 * @method getRng
		 * @param {Boolean} w3c Forces a compatible W3C range on IE.
		 * @return {Range} Internal browser range object.
		 * @see http://www.quirksmode.org/dom/range_intro.html
		 * @see http://www.dotvoid.com/2001/03/using-the-range-object-in-mozilla/
		 */
		getRng : function(w3c) {
			var t = this, s, r, elm, doc = t.win.document;

            /*
			 * ATLASSIAN - CONFSRVDEV-7739
			 * This method wraps compareBoundaryPoints in a try/catch to handle exceptions that can be thrown.
			 * In some versions of firefox (Gecko) a 'WrongDocumentError: Node cannot be used in a document other than the one in which it was created'
			 * exception can be thrown.
			 * This has caused a very high flake rate for QUnit firefox tests.
			 * For the bug report against tinyMCE see here: http://archive.tinymce.com/develop/bugtracker_view.php?id=6690
			 * The PR for version v4.0.17 of tinyMCE see here: https://github.com/tinymce/tinymce/commit/63acd72da6c8abbfb6398101344046d717828b55#diff-e8800259c4985f4a73b0936128034c53
             */
            function tryCompareBoundaryPoints(how, sourceRange, destinationRange) {
                try {
                    return sourceRange.compareBoundaryPoints(how, destinationRange);
                } catch (ex) {
                    // Gecko throws wrong document exception if the range points
                    // to nodes that where removed from the dom #6690
                    // Browsers should mutate existing DOMRange instances so that they always point
                    // to something in the document this is not the case in Gecko works fine in IE/WebKit/Blink
                    // For performance reasons just return -1
                    return -1;
                }
            }

			// Found tridentSel object then we need to use that one
			if (w3c && t.tridentSel)
				return t.tridentSel.getRangeAt(0);

			try {
				if (s = t.getSel())
					r = s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : doc.createRange());
			} catch (ex) {
				// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
			}

			// We have W3C ranges and it's IE then fake control selection since IE9 doesn't handle that correctly yet
            try {
                if (tinymce.isIE && r && r.setStart && doc.selection && doc.selection.createRange().item) {
                    elm = doc.selection.createRange().item(0);
                    r = doc.createRange();
                    r.setStartBefore(elm);
                    r.setEndAfter(elm);
                }
            } catch (e) {
                // ATLASSIAN - CONF-24571
                // IE can fail here on doc.selection.createRange() call with "Unexpected call to method or property access.".
                // Just IE being normal, buggy IE. Ignoring seems to have the desired effect.
            }

			// No range found then create an empty one
			// This can occur when the editor is placed in a hidden container element on Gecko
			// Or on IE when there was an exception
			if (!r)
				r = doc.createRange ? doc.createRange() : doc.body.createTextRange();

			if (t.selectedRange && t.explicitRange) {
				// ATLASSIAN - CONFSRVDEV-7739
				// See comments attached to the method declaration of tryCompareBoundaryPoints().
                if (tryCompareBoundaryPoints(r.START_TO_START, r, t.selectedRange) === 0 && tryCompareBoundaryPoints(r.END_TO_END, r, t.selectedRange) === 0) {
					// Safari, Opera and Chrome only ever select text which causes the range to change.
					// This lets us use the originally set range if the selection hasn't been changed by the user.
					r = t.explicitRange;
				} else {
					t.selectedRange = null;
					t.explicitRange = null;
				}
			}

			return r;
		},

		/**
		 * Changes the selection to the specified DOM range.
		 *
		 * @method setRng
		 * @param {Range} r Range to select.
		 */
		setRng : function(r) {
			var s, t = this;

			if (!t.tridentSel) {
				s = t.getSel();

				if (s) {
					t.explicitRange = r;

					try {
						s.removeAllRanges();
					} catch (ex) {
						// IE9 might throw errors here don't know why
                        AJS.logError('Exception occurred at tinymce setRng() - removeAllRanges(): ' + ex);
					}

                    try {
                        s.addRange(r);
                    }
                    catch (ex) {
                        // IE11 might throw errors when setting ranges.
                        AJS.logError('Exception occurred at tinymce setRng() - addRange(): ' + ex);
                    }

					// adding range isn't always successful so we need to check range count otherwise an exception can occur
					t.selectedRange = s.rangeCount > 0 ? s.getRangeAt(0) : null;
				}
			} else {
				// Is W3C Range
				if (r.cloneRange) {
					try {
						t.tridentSel.addRange(r);
						return;
					} catch (ex) {
						//IE9 throws an error here if called before selection is placed in the editor
                        AJS.logError('Exception occurred at tinymce setRng() - tridentSel.addRange(): ' + ex);
					}
				}

				// Is IE specific range
				try {
					r.select();
				} catch (ex) {
					// Needed for some odd IE bug #1843306
                    AJS.logError('Exception occurred at tinymce setRng() - select(): ' + ex);
				}
			}
		},

		/**
		 * Sets the current selection to the specified DOM element.
		 *
		 * @method setNode
		 * @param {Element} n Element to set as the contents of the selection.
		 * @return {Element} Returns the element that got passed in.
		 * @example
		 * // Inserts a DOM node at current selection/caret location
		 * tinyMCE.activeEditor.selection.setNode(tinyMCE.activeEditor.dom.create('img', {src : 'some.gif', title : 'some title'}));
		 */
		setNode : function(n) {
			var t = this;

			t.setContent(t.dom.getOuterHTML(n));

			return n;
		},

		/**
		 * Returns the currently selected element or the common ancestor element for both start and end of the selection.
		 *
		 * @method getNode
		 * @return {Element} Currently selected element or common ancestor element.
		 * @example
		 * // Alerts the currently selected elements node name
		 * alert(tinyMCE.activeEditor.selection.getNode().nodeName);
		 */
		getNode : function() {
			var t = this, rng = t.getRng(), sel = t.getSel(), elm, start = rng.startContainer, end = rng.endContainer;

			// Range maybe lost after the editor is made visible again
			if (!rng)
				return t.dom.getRoot();

			if (rng.setStart) {
				elm = rng.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!rng.collapsed) {
					if (rng.startContainer == rng.endContainer) {
						if (rng.endOffset - rng.startOffset < 2) {
							if (rng.startContainer.hasChildNodes())
								elm = rng.startContainer.childNodes[rng.startOffset];
						}
					}

					// If the anchor node is a element instead of a text node then return this element
					//if (tinymce.isWebKit && sel.anchorNode && sel.anchorNode.nodeType == 1)
					//	return sel.anchorNode.childNodes[sel.anchorOffset];

					// Handle cases where the selection is immediately wrapped around a node and return that node instead of it's parent.
					// This happens when you double click an underlined word in FireFox.
					if (start.nodeType === 3 && end.nodeType === 3) {
						function skipEmptyTextNodes(n, forwards) {
							var orig = n;
							while (n && n.nodeType === 3 && n.length === 0) {
								n = forwards ? n.nextSibling : n.previousSibling;
							}
							return n || orig;
						}
						if (start.length === rng.startOffset) {
							start = skipEmptyTextNodes(start.nextSibling, true);
						} else {
							start = start.parentNode;
						}
						if (rng.endOffset === 0) {
							end = skipEmptyTextNodes(end.previousSibling, false);
						} else {
							end = end.parentNode;
						}

						if (start && start === end)
							return start;
					}
				}

				if (elm && elm.nodeType == 3)
					return elm.parentNode;

				return elm;
			}

			return rng.item ? rng.item(0) : rng.parentElement();
		},

		getSelectedBlocks : function(st, en) {
			var t = this, dom = t.dom, sb, eb, n, bl = [];

			sb = dom.getParent(st || t.getStart(), dom.isBlock);
			eb = dom.getParent(en || t.getEnd(), dom.isBlock);

			if (sb)
				bl.push(sb);

			if (sb && eb && sb != eb) {
				n = sb;

				var walker = new tinymce.dom.TreeWalker(sb, dom.getRoot());
				while ((n = walker.next()) && n != eb) {
					if (dom.isBlock(n))
						bl.push(n);
				}
			}

			if (eb && sb != eb)
				bl.push(eb);

			return bl;
		},

		normalize : function() {
			var self = this, rng, normalized;

			// TODO:
			// Retain selection direction.
			// Lean left/right on Gecko for inline elements.
			// Run this on mouse up/key up when the user manually moves the selection

			// Normalize only on non IE browsers for now
			if (tinymce.isIE)
				return;

			function normalizeEndPoint(start) {
				var container, offset, walker, dom = self.dom, body = dom.getRoot(), node;

				container = rng[(start ? 'start' : 'end') + 'Container'];
				offset = rng[(start ? 'start' : 'end') + 'Offset'];

				// If the container is a document move it to the body element
				if (container.nodeType === 9) {
					container = container.body;
					offset = 0;
				}

				// If the container is body try move it into the closest text node or position
				// TODO: Add more logic here to handle element selection cases
				if (container === body) {
					// Resolve the index
					if (container.hasChildNodes()) {
						container = container.childNodes[Math.min(!start && offset > 0 ? offset - 1 : offset, container.childNodes.length - 1)];
						offset = 0;

                        // ATLASSIAN - don't normalize if caret before a table
                        if(container.nodeName === 'TABLE') {
                            return;
                        }

						// Don't walk into elements that doesn't have any child nodes like a IMG
						if (container.hasChildNodes()) {
							// Walk the DOM to find a text node to place the caret at or a BR
							node = container;
							walker = new tinymce.dom.TreeWalker(container, body);
							do {
								// Found a text node use that position
								if (node.nodeType === 3) {
									offset = start ? 0 : node.nodeValue.length - 1;
									container = node;
									normalized = true;
									break;
								}

								// Found a BR/IMG element that we can place the caret before
								if (/^(BR|IMG)$/.test(node.nodeName)) {
									offset = dom.nodeIndex(node);
									container = node.parentNode;

									// Put caret after image when moving the end point
									if (node.nodeName ==  "IMG" && !start) {
										offset++;
									}

									normalized = true;
									break;
								}
							} while (node = (start ? walker.next() : walker.prev()));
						}
					}
				}

				// Set endpoint if it was normalized
				if (normalized)
					rng['set' + (start ? 'Start' : 'End')](container, offset);
			};

			rng = self.getRng();

			// Normalize the end points
			normalizeEndPoint(true);
			
//			if (!rng.collapsed)
            // ATLASSIAN - only normalize end point if start was normalized
			if (rng.collapsed && normalized)
				normalizeEndPoint();

			// Set the selection if it was normalized
			if (normalized) {
				//console.log(self.dom.dumpRng(rng));
				self.setRng(rng);
			}
		},

		destroy : function(s) {
			var t = this;

			t.win = null;

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		},

		// IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
		_fixIESelection : function() {
			var dom = this.dom, doc = dom.doc, body = doc.body, started, startRng, htmlElm;

			// Make HTML element unselectable since we are going to handle selection by hand
			doc.documentElement.unselectable = true;

			// Return range from point or null if it failed
			function rngFromPoint(x, y) {
				var rng = body.createTextRange();

				try {
					rng.moveToPoint(x, y);
				} catch (ex) {
					// IE sometimes throws and exception, so lets just ignore it
					rng = null;
				}

				return rng;
			};

			// Fires while the selection is changing
			function selectionChange(e) {
				var pointRng;

				// Check if the button is down or not
				if (e.button) {
					// Create range from mouse position
					pointRng = rngFromPoint(e.x, e.y);

					if (pointRng) {
						// Check if pointRange is before/after selection then change the endPoint
						if (pointRng.compareEndPoints('StartToStart', startRng) > 0)
							pointRng.setEndPoint('StartToStart', startRng);
						else
							pointRng.setEndPoint('EndToEnd', startRng);

						pointRng.select();
					}
				} else
					endSelection();
			}

			// Removes listeners
			function endSelection() {
				// CONF-31610 - IE11 has deprecated support for 'selection'
				// http://msdn.microsoft.com/en-us/library/ie/ms535869(v=vs.85).aspx
				var rng = doc.selection ?
					doc.selection.createRange() :
                    tinyMCE.activeEditor.getBody().createTextRange();

				// If the range is collapsed then use the last start range
				if (startRng && !rng.item && rng.compareEndPoints('StartToEnd', rng) === 0)
					startRng.select();

				dom.unbind(doc, 'mouseup', endSelection);
				dom.unbind(doc, 'mousemove', selectionChange);
				startRng = started = 0;
			};

			// Detect when user selects outside BODY
			dom.bind(doc, ['mousedown', 'contextmenu'], function(e) {
				if (e.target.nodeName === 'HTML') {
					if (started)
						endSelection();

					// Detect vertical scrollbar, since IE will fire a mousedown on the scrollbar and have target set as HTML
					htmlElm = doc.documentElement;
					if (htmlElm.scrollHeight > htmlElm.clientHeight)
						return;

					started = 1;
					// Setup start position
					startRng = rngFromPoint(e.x, e.y);
					if (startRng) {
						// Listen for selection change events
						dom.bind(doc, 'mouseup', endSelection);
						dom.bind(doc, 'mousemove', selectionChange);

						dom.win.focus();
						startRng.select();
					}
				}
			});
		}
	});
})(tinymce);

/**
 * Serializer.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class is used to serialize DOM trees into a string. Consult the TinyMCE Wiki API for more details and examples on how to use this class. 
	 *
	 * @class tinymce.dom.Serializer
	 */

	/**
	 * Constucts a new DOM serializer class.
	 *
	 * @constructor
	 * @method Serializer
	 * @param {Object} settings Serializer settings object.
	 * @param {tinymce.dom.DOMUtils} dom DOMUtils instance reference.
	 * @param {tinymce.html.Schema} schema Optional schema reference.
	 */
	tinymce.dom.Serializer = function(settings, dom, schema) {
		var onPreProcess, onPostProcess, isIE = tinymce.isIE, each = tinymce.each, htmlParser;

		// Support the old apply_source_formatting option
		if (!settings.apply_source_formatting)
			settings.indent = false;

		// Default DOM and Schema if they are undefined
		dom = dom || tinymce.DOM;
		schema = schema || new tinymce.html.Schema(settings);
		settings.entity_encoding = settings.entity_encoding || 'named';
		settings.remove_trailing_brs = "remove_trailing_brs" in settings ? settings.remove_trailing_brs : true;

		/**
		 * This event gets executed before a HTML fragment gets serialized into a HTML string. This event enables you to do modifications to the DOM before the serialization occurs. It's important to know that the element that is getting serialized is cloned so it's not inside a document.
		 *
		 * @event onPreProcess
		 * @param {tinymce.dom.Serializer} sender object/Serializer instance that is serializing an element.
		 * @param {Object} args Object containing things like the current node.
		 * @example
		 * // Adds an observer to the onPreProcess event
		 * serializer.onPreProcess.add(function(se, o) {
		 *     // Add a class to each paragraph
		 *     se.dom.addClass(se.dom.select('p', o.node), 'myclass');
		 * });
		 */
		onPreProcess = new tinymce.util.Dispatcher(self);

		/**
		 * This event gets executed after a HTML fragment has been serialized into a HTML string. This event enables you to do modifications to the HTML string like regexp replaces etc. 
		 *
		 * @event onPreProcess
		 * @param {tinymce.dom.Serializer} sender object/Serializer instance that is serializing an element.
		 * @param {Object} args Object containing things like the current contents. 
		 * @example
		 * // Adds an observer to the onPostProcess event
		 * serializer.onPostProcess.add(function(se, o) {
		 *    // Remove all paragraphs and replace with BR
		 *    o.content = o.content.replace(/<p[^>]+>|<p>/g, '');
		 *    o.content = o.content.replace(/<\/p>/g, '<br />');
		 * });
		 */
		onPostProcess = new tinymce.util.Dispatcher(self);

		htmlParser = new tinymce.html.DomParser(settings, schema);

		// Convert move data-mce-src, data-mce-href and data-mce-style into nodes or process them if needed
		htmlParser.addAttributeFilter('src,href,style', function(nodes, name) {
			var i = nodes.length, node, value, internalName = 'data-mce-' + name, urlConverter = settings.url_converter, urlConverterScope = settings.url_converter_scope, undef;

			while (i--) {
				node = nodes[i];

				value = node.attributes.map[internalName];
				if (value !== undef) {
					// Set external name to internal value and remove internal
					node.attr(name, value.length > 0 ? value : null);
					node.attr(internalName, null);
				} else {
					// No internal attribute found then convert the value we have in the DOM
					value = node.attributes.map[name];

					if (name === "style")
						value = dom.serializeStyle(dom.parseStyle(value), node.name);
					else if (urlConverter)
						value = urlConverter.call(urlConverterScope, value, name, node.name);

					node.attr(name, value.length > 0 ? value : null);
				}
			}
		});

		// Remove internal classes mceItem<..>
		htmlParser.addAttributeFilter('class', function(nodes, name) {
			var i = nodes.length, node, value;

			while (i--) {
				node = nodes[i];
				value = node.attr('class').replace(/\s*mce(Item\w+|Selected)\s*/g, '');
				node.attr('class', value.length > 0 ? value : null);
			}
		});

		// Remove bookmark elements
		htmlParser.addAttributeFilter('data-mce-type', function(nodes, name, args) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.attributes.map['data-mce-type'] === 'bookmark' && !args.cleanup)
					node.remove();
			}
		});

		// Force script into CDATA sections and remove the mce- prefix also add comments around styles
		htmlParser.addNodeFilter('script,style', function(nodes, name) {
			var i = nodes.length, node, value;

			function trim(value) {
				return value.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n')
						.replace(/^[\r\n]*|[\r\n]*$/g, '')
						.replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi, '')
						.replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, '');
			};

			while (i--) {
				node = nodes[i];
				value = node.firstChild ? node.firstChild.value : '';

				if (name === "script") {
					// Remove mce- prefix from script elements
					node.attr('type', (node.attr('type') || 'text/javascript').replace(/^mce\-/, ''));

					if (value.length > 0)
						node.firstChild.value = '// <![CDATA[\n' + trim(value) + '\n// ]]>';
				} else {
					if (value.length > 0)
						node.firstChild.value = '<!--\n' + trim(value) + '\n-->';
				}
			}
		});

		// Convert comments to cdata and handle protected comments
		htmlParser.addNodeFilter('#comment', function(nodes, name) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.value.indexOf('[CDATA[') === 0) {
					node.name = '#cdata';
					node.type = 4;
					node.value = node.value.replace(/^\[CDATA\[|\]\]$/g, '');
				} else if (node.value.indexOf('mce:protected ') === 0) {
					node.name = "#text";
					node.type = 3;
					node.raw = true;
					node.value = unescape(node.value).substr(14);
				}
			}
		});

		htmlParser.addNodeFilter('xml:namespace,input', function(nodes, name) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];
				if (node.type === 7)
					node.remove();
				else if (node.type === 1) {
					if (name === "input" && !("type" in node.attributes.map))
						node.attr('type', 'text');
				}
			}
		});

		// Fix list elements, TODO: Replace this later
		if (settings.fix_list_elements) {
			htmlParser.addNodeFilter('ul,ol', function(nodes, name) {
				var i = nodes.length, node, parentNode;

				while (i--) {
					node = nodes[i];
					parentNode = node.parent;

					if (parentNode.name === 'ul' || parentNode.name === 'ol') {
						if (node.prev && node.prev.name === 'li') {
							node.prev.append(node);
						}
					}
				}
			});
		}

		// Remove internal data attributes
		htmlParser.addAttributeFilter('data-mce-src,data-mce-href,data-mce-style', function(nodes, name) {
			var i = nodes.length;

			while (i--) {
				nodes[i].attr(name, null);
			}
		});

		// Return public methods
		return {
			/**
			 * Schema instance that was used to when the Serializer was constructed.
			 *
			 * @field {tinymce.html.Schema} schema
			 */
			schema : schema,

			/**
			 * Adds a node filter function to the parser used by the serializer, the parser will collect the specified nodes by name
			 * and then execute the callback ones it has finished parsing the document.
			 *
			 * @example
			 * parser.addNodeFilter('p,h1', function(nodes, name) {
			 *		for (var i = 0; i < nodes.length; i++) {
			 *			console.log(nodes[i].name);
			 *		}
			 * });
			 * @method addNodeFilter
			 * @method {String} name Comma separated list of nodes to collect.
			 * @param {function} callback Callback function to execute once it has collected nodes.
			 */
			addNodeFilter : htmlParser.addNodeFilter,

			/**
			 * Adds a attribute filter function to the parser used by the serializer, the parser will collect nodes that has the specified attributes
			 * and then execute the callback ones it has finished parsing the document.
			 *
			 * @example
			 * parser.addAttributeFilter('src,href', function(nodes, name) {
			 *		for (var i = 0; i < nodes.length; i++) {
			 *			console.log(nodes[i].name);
			 *		}
			 * });
			 * @method addAttributeFilter
			 * @method {String} name Comma separated list of nodes to collect.
			 * @param {function} callback Callback function to execute once it has collected nodes.
			 */
			addAttributeFilter : htmlParser.addAttributeFilter,

			/**
			 * Fires when the Serializer does a preProcess on the contents.
			 *
			 * @event onPreProcess
			 * @param {tinymce.Editor} sender Editor instance.
			 * @param {Object} obj PreProcess object.
			 * @option {Node} node DOM node for the item being serialized.
			 * @option {String} format The specified output format normally "html".
			 * @option {Boolean} get Is true if the process is on a getContent operation.
			 * @option {Boolean} set Is true if the process is on a setContent operation.
			 * @option {Boolean} cleanup Is true if the process is on a cleanup operation.
			 */
			onPreProcess : onPreProcess,

			/**
			 * Fires when the Serializer does a postProcess on the contents.
			 *
			 * @event onPostProcess
			 * @param {tinymce.Editor} sender Editor instance.
			 * @param {Object} obj PreProcess object.
			 */
			onPostProcess : onPostProcess,

			/**
			 * Serializes the specified browser DOM node into a HTML string.
			 *
			 * @method serialize
			 * @param {DOMNode} node DOM node to serialize.
			 * @param {Object} args Arguments option that gets passed to event handlers.
			 */
			serialize : function(node, args) {
				var impl, doc, oldDoc, htmlSerializer, content;

				// ATLASSIAN - CONF-28665
				// The hack for IE when some elements were present (style, etc.) was not creating a valid node
				// Disabled the hack and tested in IE8/IE9 (style elements are being cloned correctly)
				// The hack seems to affect versions of IE < 8: http://www.tinymce.com/develop/bugtracker_view.php?id=4670

				// Explorer won't clone contents of script and style and the
				// selected index of select elements are cleared on a clone operation.
//				if (isIE && dom.select('script,style,select,map').length > 0) {
//					content = node.innerHTML;
//					node = node.cloneNode(true);
//					dom.setHTML(node, content);
//				} else
				node = node.cloneNode(true);

				// Nodes needs to be attached to something in WebKit/Opera
				// Older builds of Opera crashes if you attach the node to an document created dynamically
				// and since we can't feature detect a crash we need to sniff the actual build number
				// This fix will make DOM ranges and make Sizzle happy!
				impl = node.ownerDocument.implementation;
				if (impl.createHTMLDocument) {
					// Create an empty HTML document
					doc = impl.createHTMLDocument("");

					// Add the element or its children if it's a body element to the new document
					each(node.nodeName == 'BODY' ? node.childNodes : [node], function(node) {
						doc.body.appendChild(doc.importNode(node, true));
					});

					// Grab first child or body element for serialization
					if (node.nodeName != 'BODY')
						node = doc.body.firstChild;
					else
						node = doc.body;

					// set the new document in DOMUtils so createElement etc works
					oldDoc = dom.doc;
					dom.doc = doc;
				}

				args = args || {};
				args.format = args.format || 'html';

				// Pre process
				if (!args.no_events) {
					args.node = node;
					onPreProcess.dispatch(self, args);
				}

				// Setup serializer
				htmlSerializer = new tinymce.html.Serializer(settings, schema);

				// Parse and serialize HTML
				args.content = htmlSerializer.serialize(
					htmlParser.parse(args.getInner ? node.innerHTML : tinymce.trim(dom.getOuterHTML(node), args), args)
				);

				// Replace all BOM characters for now until we can find a better solution
				if (!args.cleanup)
					args.content = args.content.replace(/\uFEFF|\u200B/g, '');

				// Post process
				if (!args.no_events)
					onPostProcess.dispatch(self, args);

				// Restore the old document if it was changed
				if (oldDoc)
					dom.doc = oldDoc;

				args.node = null;

				return args.content;
			},

			/**
			 * Adds valid elements rules to the serializers schema instance this enables you to specify things
			 * like what elements should be outputted and what attributes specific elements might have.
			 * Consult the Wiki for more details on this format.
			 *
			 * @method addRules
			 * @param {String} rules Valid elements rules string to add to schema.
			 */
			addRules : function(rules) {
				schema.addValidElements(rules);
			},

			/**
			 * Sets the valid elements rules to the serializers schema instance this enables you to specify things
			 * like what elements should be outputted and what attributes specific elements might have.
			 * Consult the Wiki for more details on this format.
			 *
			 * @method setRules
			 * @param {String} rules Valid elements rules string.
			 */
			setRules : function(rules) {
				schema.setValidElements(rules);
			}
		};
	};
})(tinymce);
/**
 * ScriptLoader.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class handles asynchronous/synchronous loading of JavaScript files it will execute callbacks when various items gets loaded. This class is useful to load external JavaScript files. 
	 *
	 * @class tinymce.dom.ScriptLoader
	 * @example
	 * // Load a script from a specific URL using the global script loader
	 * tinymce.ScriptLoader.load('somescript.js');
	 * 
	 * // Load a script using a unique instance of the script loader
	 * var scriptLoader = new tinymce.dom.ScriptLoader();
	 * 
	 * scriptLoader.load('somescript.js');
	 * 
	 * // Load multiple scripts
	 * var scriptLoader = new tinymce.dom.ScriptLoader();
	 * 
	 * scriptLoader.add('somescript1.js');
	 * scriptLoader.add('somescript2.js');
	 * scriptLoader.add('somescript3.js');
	 * 
	 * scriptLoader.loadQueue(function() {
	 *    alert('All scripts are now loaded.');
	 * });
	 */
	tinymce.dom.ScriptLoader = function(settings) {
		var QUEUED = 0,
			LOADING = 1,
			LOADED = 2,
			states = {},
			queue = [],
			scriptLoadedCallbacks = {},
			queueLoadedCallbacks = [],
			loading = 0,
			undefined;

		/**
		 * Loads a specific script directly without adding it to the load queue.
		 *
		 * @method load
		 * @param {String} url Absolute URL to script to add.
		 * @param {function} callback Optional callback function to execute ones this script gets loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		function loadScript(url, callback) {
			var t = this, dom = tinymce.DOM, elm, uri, loc, id;

			// Execute callback when script is loaded
			function done() {
				dom.remove(id);

				if (elm)
					elm.onreadystatechange = elm.onload = elm = null;

				callback();
			};
			
			function error() {
				// Report the error so it's easier for people to spot loading errors
                // CONF-22176 Switch to using AJS.log instead
				//if (typeof(console) !== "undefined" && console.log)
				//	console.log("Failed to load: " + url);
                AJS.log("Failed to load: " + url);

				// We can't mark it as done if there is a load error since
				// A) We don't want to produce 404 errors on the server and
				// B) the onerror event won't fire on all browsers.
				// done();
			};

			id = dom.uniqueId();

			if (tinymce.isIE6) {
				uri = new tinymce.util.URI(url);
				loc = location;

				// If script is from same domain and we
				// use IE 6 then use XHR since it's more reliable
				if (uri.host == loc.hostname && uri.port == loc.port && (uri.protocol + ':') == loc.protocol && uri.protocol.toLowerCase() != 'file') {
					tinymce.util.XHR.send({
						url : tinymce._addVer(uri.getURI()),
						success : function(content) {
							// Create new temp script element
							var script = dom.create('script', {
								type : 'text/javascript'
							});

							// Evaluate script in global scope
							script.text = content;
							document.getElementsByTagName('head')[0].appendChild(script);
							dom.remove(script);

							done();
						},
						
						error : error
					});

					return;
				}
			}

			// Create new script element
			elm = dom.create('script', {
				id : id,
				type : 'text/javascript',
				src : tinymce._addVer(url)
			});

			// Add onload listener for non IE browsers since IE9
			// fires onload event before the script is parsed and executed
			if (!tinymce.isIE)
				elm.onload = done;

			// Add onerror event will get fired on some browsers but not all of them
			elm.onerror = error;

			// Opera 9.60 doesn't seem to fire the onreadystate event at correctly
			if (!tinymce.isOpera) {
				elm.onreadystatechange = function() {
					var state = elm.readyState;

					// Loaded state is passed on IE 6 however there
					// are known issues with this method but we can't use
					// XHR in a cross domain loading
					if (state == 'complete' || state == 'loaded')
						done();
				};
			}

			// Most browsers support this feature so we report errors
			// for those at least to help users track their missing plugins etc
			// todo: Removed since it produced error if the document is unloaded by navigating away, re-add it as an option
			/*elm.onerror = function() {
				alert('Failed to load: ' + url);
			};*/

			// Add script to document
			(document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
		};

		/**
		 * Returns true/false if a script has been loaded or not.
		 *
		 * @method isDone
		 * @param {String} url URL to check for.
		 * @return [Boolean} true/false if the URL is loaded.
		 */
		this.isDone = function(url) {
			return states[url] == LOADED;
		};

		/**
		 * Marks a specific script to be loaded. This can be useful if a script got loaded outside
		 * the script loader or to skip it from loading some script.
		 *
		 * @method markDone
		 * @param {string} u Absolute URL to the script to mark as loaded.
		 */
		this.markDone = function(url) {
			states[url] = LOADED;
		};

		/**
		 * Adds a specific script to the load queue of the script loader.
		 *
		 * @method add
		 * @param {String} url Absolute URL to script to add.
		 * @param {function} callback Optional callback function to execute ones this script gets loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		this.add = this.load = function(url, callback, scope) {
			var item, state = states[url];

			// Add url to load queue
			if (state == undefined) {
				queue.push(url);
				states[url] = QUEUED;
			}

			if (callback) {
				// Store away callback for later execution
				if (!scriptLoadedCallbacks[url])
					scriptLoadedCallbacks[url] = [];

				scriptLoadedCallbacks[url].push({
					func : callback,
					scope : scope || this
				});
			}
		};

		/**
		 * Starts the loading of the queue.
		 *
		 * @method loadQueue
		 * @param {function} callback Optional callback to execute when all queued items are loaded.
		 * @param {Object} scope Optional scope to execute the callback in.
		 */
		this.loadQueue = function(callback, scope) {
			this.loadScripts(queue, callback, scope);
		};

		/**
		 * Loads the specified queue of files and executes the callback ones they are loaded.
		 * This method is generally not used outside this class but it might be useful in some scenarios. 
		 *
		 * @method loadScripts
		 * @param {Array} scripts Array of queue items to load.
		 * @param {function} callback Optional callback to execute ones all items are loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		this.loadScripts = function(scripts, callback, scope) {
			var loadScripts;

			function execScriptLoadedCallbacks(url) {
				// Execute URL callback functions
				tinymce.each(scriptLoadedCallbacks[url], function(callback) {
					callback.func.call(callback.scope);
				});

				scriptLoadedCallbacks[url] = undefined;
			};

			queueLoadedCallbacks.push({
				func : callback,
				scope : scope || this
			});

			loadScripts = function() {
				var loadingScripts = tinymce.grep(scripts);

				// Current scripts has been handled
				scripts.length = 0;

				// Load scripts that needs to be loaded
				tinymce.each(loadingScripts, function(url) {
					// Script is already loaded then execute script callbacks directly
					if (states[url] == LOADED) {
						execScriptLoadedCallbacks(url);
						return;
					}

					// Is script not loading then start loading it
					if (states[url] != LOADING) {
						states[url] = LOADING;
						loading++;

						loadScript(url, function() {
							states[url] = LOADED;
							loading--;

							execScriptLoadedCallbacks(url);

							// Load more scripts if they where added by the recently loaded script
							loadScripts();
						});
					}
				});

				// No scripts are currently loading then execute all pending queue loaded callbacks
				if (!loading) {
					tinymce.each(queueLoadedCallbacks, function(callback) {
						callback.func.call(callback.scope);
					});

					queueLoadedCallbacks.length = 0;
				}
			};

			loadScripts();
		};
	};

	// Global script loader
	tinymce.ScriptLoader = new tinymce.dom.ScriptLoader();
})(tinymce);

/**
 * TreeWalker.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

tinymce.dom.TreeWalker = function(start_node, root_node) {
	var node = start_node;

	function findSibling(node, start_name, sibling_name, shallow) {
		var sibling, parent;

		if (node) {
			// Walk into nodes if it has a start
			if (!shallow && node[start_name])
				return node[start_name];

			// Return the sibling if it has one
			if (node != root_node) {
				sibling = node[sibling_name];
				if (sibling)
					return sibling;

				// Walk up the parents to look for siblings
				for (parent = node.parentNode; parent && parent != root_node; parent = parent.parentNode) {
					sibling = parent[sibling_name];
					if (sibling)
						return sibling;
				}
			}
		}
	};

	/**
	 * Returns the current node.
	 *
	 * @return {Node} Current node where the walker is.
	 */
	this.current = function() {
		return node;
	};

	/**
	 * Walks to the next node in tree.
	 *
	 * @return {Node} Current node where the walker is after moving to the next node.
	 */
	this.next = function(shallow) {
		return (node = findSibling(node, 'firstChild', 'nextSibling', shallow));
	};

	/**
	 * Walks to the previous node in tree.
	 *
	 * @return {Node} Current node where the walker is after moving to the previous node.
	 */
	this.prev = function(shallow) {
		return (node = findSibling(node, 'lastChild', 'previousSibling', shallow));
	};
};

/**
 * Range.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	tinymce.dom.RangeUtils = function(dom) {
		var INVISIBLE_CHAR = '\uFEFF';

		/**
		 * Walks the specified range like object and executes the callback for each sibling collection it finds.
		 *
		 * @param {Object} rng Range like object.
		 * @param {function} callback Callback function to execute for each sibling collection.
		 */
		this.walk = function(rng, callback) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				ancestor, startPoint,
				endPoint, node, parent, siblings, nodes;

			// Handle table cell selection the table plugin enables
			// you to fake select table cells and perform formatting actions on them
			nodes = dom.select('td.mceSelected,th.mceSelected');
			if (nodes.length > 0) {
				tinymce.each(nodes, function(node) {
					callback([node]);
				});

				return;
			}

			/**
			 * Excludes start/end text node if they are out side the range
			 *
			 * @private
			 * @param {Array} nodes Nodes to exclude items from.
			 * @return {Array} Array with nodes excluding the start/end container if needed.
			 */
			function exclude(nodes) {
				var node;

				// First node is excluded
				node = nodes[0];
				if (node.nodeType === 3 && node === startContainer && startOffset >= node.nodeValue.length) {
					nodes.splice(0, 1);
				}

				// Last node is excluded
				node = nodes[nodes.length - 1];
				if (endOffset === 0 && nodes.length > 0 && node === endContainer && node.nodeType === 3) {
					nodes.splice(nodes.length - 1, 1);
				}

				return nodes;
			};

			/**
			 * Collects siblings
			 *
			 * @private
			 * @param {Node} node Node to collect siblings from.
			 * @param {String} name Name of the sibling to check for.
			 * @return {Array} Array of collected siblings.
			 */
			function collectSiblings(node, name, end_node) {
				var siblings = [];

				for (; node && node != end_node; node = node[name])
					siblings.push(node);

				return siblings;
			};

			/**
			 * Find an end point this is the node just before the common ancestor root.
			 *
			 * @private
			 * @param {Node} node Node to start at.
			 * @param {Node} root Root/ancestor element to stop just before.
			 * @return {Node} Node just before the root element.
			 */
			function findEndPoint(node, root) {
				do {
					if (node.parentNode == root)
						return node;

					node = node.parentNode;
				} while(node);
			};

			function walkBoundary(start_node, end_node, next) {
				var siblingName = next ? 'nextSibling' : 'previousSibling';

				for (node = start_node, parent = node.parentNode; node && node != end_node; node = parent) {
					parent = node.parentNode;
					siblings = collectSiblings(node == start_node ? node : node[siblingName], siblingName);

					if (siblings.length) {
						if (!next)
							siblings.reverse();

						callback(exclude(siblings));
					}
				}
			};

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes())
				startContainer = startContainer.childNodes[startOffset];

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes())
				endContainer = endContainer.childNodes[Math.min(endOffset - 1, endContainer.childNodes.length - 1)];

			// Same container
			if (startContainer == endContainer)
				return callback(exclude([startContainer]));

			// Find common ancestor and end points
			ancestor = dom.findCommonAncestor(startContainer, endContainer);
				
			// Process left side
			for (node = startContainer; node; node = node.parentNode) {
				if (node === endContainer)
					return walkBoundary(startContainer, ancestor, true);

				if (node === ancestor)
					break;
			}

			// Process right side
			for (node = endContainer; node; node = node.parentNode) {
				if (node === startContainer)
					return walkBoundary(endContainer, ancestor);

				if (node === ancestor)
					break;
			}

			// Find start/end point
			startPoint = findEndPoint(startContainer, ancestor) || startContainer;
			endPoint = findEndPoint(endContainer, ancestor) || endContainer;

			// Walk left leaf
			walkBoundary(startContainer, startPoint, true);

			// Walk the middle from start to end point
			siblings = collectSiblings(
				startPoint == startContainer ? startPoint : startPoint.nextSibling,
				'nextSibling',
				endPoint == endContainer ? endPoint.nextSibling : endPoint
			);

			if (siblings.length)
				callback(exclude(siblings));

			// Walk right leaf
			walkBoundary(endContainer, endPoint);
		};

		/**
		 * Splits the specified range at it's start/end points.
		 *
		 * @param {Range/RangeObject} rng Range to split.
		 * @return {Object} Range position object.
		 */
		this.split = function(rng) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			function splitText(node, offset) {
				return node.splitText(offset);
			};

			// Handle single text node
			if (startContainer == endContainer && startContainer.nodeType == 3) {
				if (startOffset > 0 && startOffset < startContainer.nodeValue.length) {
					endContainer = splitText(startContainer, startOffset);
					startContainer = endContainer.previousSibling;

					if (endOffset > startOffset) {
						endOffset = endOffset - startOffset;
						startContainer = endContainer = splitText(endContainer, endOffset).previousSibling;
						endOffset = endContainer.nodeValue.length;
						startOffset = 0;
					} else {
						endOffset = 0;
					}
				}
			} else {
				// Split startContainer text node if needed
				if (startContainer.nodeType == 3 && startOffset > 0 && startOffset < startContainer.nodeValue.length) {
					startContainer = splitText(startContainer, startOffset);
					startOffset = 0;
				}

				// Split endContainer text node if needed
				if (endContainer.nodeType == 3 && endOffset > 0 && endOffset < endContainer.nodeValue.length) {
					endContainer = splitText(endContainer, endOffset).previousSibling;
					endOffset = endContainer.nodeValue.length;
				}
			}

			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};

	};

	/**
	 * Compares two ranges and checks if they are equal.
	 *
	 * @static
	 * @param {DOMRange} rng1 First range to compare.
	 * @param {DOMRange} rng2 First range to compare.
	 * @return {Boolean} true/false if the ranges are equal.
	 */
	tinymce.dom.RangeUtils.compareRanges = function(rng1, rng2) {
		if (rng1 && rng2) {
			// Compare native IE ranges
			if (rng1.item || rng1.duplicate) {
				// Both are control ranges and the selected element matches
				if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0))
					return true;

				// Both are text ranges and the range matches
				if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1))
					return true;
			} else {
				// Compare w3c ranges
				return rng1.startContainer == rng2.startContainer && rng1.startOffset == rng2.startOffset;
			}
		}

		return false;
	};
})(tinymce);

/**
 * KeyboardNavigation.js
 *
 * Copyright 2011, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var Event = tinymce.dom.Event, each = tinymce.each;

	/**
	 * This class provides basic keyboard navigation using the arrow keys to children of a component.
	 * For example, this class handles moving between the buttons on the toolbars. 
	 * 
	 * @class tinymce.ui.KeyboardNavigation
	 */
	tinymce.create('tinymce.ui.KeyboardNavigation', {
		/**
		 * Create a new KeyboardNavigation instance to handle the focus for a specific element.
		 * 
		 * @constructor
		 * @method KeyboardNavigation
		 * @param {Object} settings the settings object to define how keyboard navigation works.
		 * @param {DOMUtils} dom the DOMUtils instance to use.
		 * 
		 * @setting {Element/String} root the root element or ID of the root element for the control.
		 * @setting {Array} items an array containing the items to move focus between. Every object in this array must have an id attribute which maps to the actual DOM element. If the actual elements are passed without an ID then one is automatically assigned.
		 * @setting {Function} onCancel the callback for when the user presses escape or otherwise indicates cancelling.
		 * @setting {Function} onAction (optional) the action handler to call when the user activates an item.
		 * @setting {Boolean} enableLeftRight (optional, default) when true, the up/down arrows move through items.
		 * @setting {Boolean} enableUpDown (optional) when true, the up/down arrows move through items.
		 * Note for both up/down and left/right explicitly set both enableLeftRight and enableUpDown to true.
		 */
		KeyboardNavigation: function(settings, dom) {
			var t = this, root = settings.root, items = settings.items,
					enableUpDown = settings.enableUpDown, enableLeftRight = settings.enableLeftRight || !settings.enableUpDown,
					excludeFromTabOrder = settings.excludeFromTabOrder,
					itemFocussed, itemBlurred, rootKeydown, rootFocussed, focussedId;

			dom = dom || tinymce.DOM;

			itemFocussed = function(evt) {
				focussedId = evt.target.id;
			};
			
			itemBlurred = function(evt) {
				dom.setAttrib(evt.target.id, 'tabindex', '-1');
			};
			
			rootFocussed = function(evt) {
				var item = dom.get(focussedId);
				dom.setAttrib(item, 'tabindex', '0');
				item.focus();
			};
			
			t.focus = function() {
				dom.get(focussedId).focus();
			};

			/**
			 * Destroys the KeyboardNavigation and unbinds any focus/blur event handles it might have added.
			 *
			 * @method destroy
			 */
			t.destroy = function() {
				each(items, function(item) {
					dom.unbind(dom.get(item.id), 'focus', itemFocussed);
					dom.unbind(dom.get(item.id), 'blur', itemBlurred);
				});

				dom.unbind(dom.get(root), 'focus', rootFocussed);
				dom.unbind(dom.get(root), 'keydown', rootKeydown);

				items = dom = root = t.focus = itemFocussed = itemBlurred = rootKeydown = rootFocussed = null;
				t.destroy = function() {};
			};
			
			t.moveFocus = function(dir, evt) {
				var idx = -1, controls = t.controls, newFocus;

				if (!focussedId)
					return;

				each(items, function(item, index) {
					if (item.id === focussedId) {
						idx = index;
						return false;
					}
				});

				idx += dir;
				if (idx < 0) {
					idx = items.length - 1;
				} else if (idx >= items.length) {
					idx = 0;
				}
				
				newFocus = items[idx];
				dom.setAttrib(focussedId, 'tabindex', '-1');
				dom.setAttrib(newFocus.id, 'tabindex', '0');
				dom.get(newFocus.id).focus();

				if (settings.actOnFocus) {
					settings.onAction(newFocus.id);
				}

				if (evt)
					Event.cancel(evt);
			};
			
			rootKeydown = function(evt) {
				var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40, DOM_VK_ESCAPE = 27, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_SPACE = 32;
				
				switch (evt.keyCode) {
					case DOM_VK_LEFT:
						if (enableLeftRight) t.moveFocus(-1);
						break;
	
					case DOM_VK_RIGHT:
						if (enableLeftRight) t.moveFocus(1);
						break;
	
					case DOM_VK_UP:
						if (enableUpDown) t.moveFocus(-1);
						break;

					case DOM_VK_DOWN:
						if (enableUpDown) t.moveFocus(1);
						break;

					case DOM_VK_ESCAPE:
						if (settings.onCancel) {
							settings.onCancel();
							Event.cancel(evt);
						}
						break;

					case DOM_VK_ENTER:
					case DOM_VK_RETURN:
					case DOM_VK_SPACE:
						if (settings.onAction) {
							settings.onAction(focussedId);
							Event.cancel(evt);
						}
						break;
				}
			};

			// Set up state and listeners for each item.
			each(items, function(item, idx) {
				var tabindex;

				if (!item.id) {
					item.id = dom.uniqueId('_mce_item_');
				}

				if (excludeFromTabOrder) {
					dom.bind(item.id, 'blur', itemBlurred);
					tabindex = '-1';
				} else {
					tabindex = (idx === 0 ? '0' : '-1');
				}

				dom.setAttrib(item.id, 'tabindex', tabindex);
				dom.bind(dom.get(item.id), 'focus', itemFocussed);
			});
			
			// Setup initial state for root element.
			if (items[0]){
				focussedId = items[0].id;
			}

			dom.setAttrib(root, 'tabindex', '-1');
			
			// Setup listeners for root element.
			dom.bind(dom.get(root), 'focus', rootFocussed);
			dom.bind(dom.get(root), 'keydown', rootKeydown);
		}
	});
})(tinymce);

/**
 * Control.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten class names
	var DOM = tinymce.DOM, is = tinymce.is;

	/**
	 * This class is the base class for all controls like buttons, toolbars, containers. This class should not
	 * be instantiated directly other controls should inherit from this one.
	 *
	 * @class tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.Control', {
		/**
		 * Constructs a new control instance.
		 *
		 * @constructor
		 * @method Control
		 * @param {String} id Control id.
		 * @param {Object} s Optional name/value settings object.
		 */
		Control : function(id, s, editor) {
			this.id = id;
			this.settings = s = s || {};
			this.rendered = false;
			this.onRender = new tinymce.util.Dispatcher(this);
			this.classPrefix = '';
			this.scope = s.scope || this;
			this.disabled = 0;
			this.active = 0;
			this.editor = editor;
		},
		
		setAriaProperty : function(property, value) {
			var element = DOM.get(this.id + '_aria') || DOM.get(this.id);
			if (element) {
				DOM.setAttrib(element, 'aria-' + property, !!value);
			}
		},
		
		focus : function() {
			DOM.get(this.id).focus();
		},

		/**
		 * Sets the disabled state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be disabled visually.
		 *
		 * @method setDisabled
		 * @param {Boolean} s Boolean state if the control should be disabled or not.
		 */
		setDisabled : function(s) {
			if (s != this.disabled) {
				this.setAriaProperty('disabled', s);

				this.setState('Disabled', s);
				this.setState('Enabled', !s);
				this.disabled = s;
			}
		},

		/**
		 * Returns true/false if the control is disabled or not. This is a method since you can then
		 * choose to check some class or some internal bool state in subclasses.
		 *
		 * @method isDisabled
		 * @return {Boolean} true/false if the control is disabled or not.
		 */
		isDisabled : function() {
			return this.disabled;
		},

		/**
		 * Sets the activated state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be activated visually.
		 *
		 * @method setActive
		 * @param {Boolean} s Boolean state if the control should be activated or not.
		 */
		setActive : function(s) {
			if (s != this.active) {
				this.setState('Active', s);
				this.active = s;
				this.setAriaProperty('pressed', s);
			}
		},

		/**
		 * Returns true/false if the control is disabled or not. This is a method since you can then
		 * choose to check some class or some internal bool state in subclasses.
		 *
		 * @method isActive
		 * @return {Boolean} true/false if the control is disabled or not.
		 */
		isActive : function() {
			return this.active;
		},

		/**
		 * Sets the specified class state for the control.
		 *
		 * @method setState
		 * @param {String} c Class name to add/remove depending on state.
		 * @param {Boolean} s True/false state if the class should be removed or added.
		 */
		setState : function(c, s) {
			var n = DOM.get(this.id);

			c = this.classPrefix + c;

			if (s)
				DOM.addClass(n, c);
			else
				DOM.removeClass(n, c);
		},

		/**
		 * Returns true/false if the control has been rendered or not.
		 *
		 * @method isRendered
		 * @return {Boolean} State if the control has been rendered or not.
		 */
		isRendered : function() {
			return this.rendered;
		},

		/**
		 * Renders the control as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the button control element.
		 */
		renderHTML : function() {
		},

		/**
		 * Renders the control to the specified container element.
		 *
		 * @method renderTo
		 * @param {Element} n HTML DOM element to add control to.
		 */
		renderTo : function(n) {
			DOM.setHTML(n, this.renderHTML());
		},

		/**
		 * Post render event. This will be executed after the control has been rendered and can be used to
		 * set states, add events to the control etc. It's recommended for subclasses of the control to call this method by using this.parent().
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, b;

			// Set pending states
			if (is(t.disabled)) {
				b = t.disabled;
				t.disabled = -1;
				t.setDisabled(b);
			}

			if (is(t.active)) {
				b = t.active;
				t.active = -1;
				t.setActive(b);
			}
		},

		/**
		 * Removes the control. This means it will be removed from the DOM and any
		 * events tied to it will also be removed.
		 *
		 * @method remove
		 */
		remove : function() {
			DOM.remove(this.id);
			this.destroy();
		},

		/**
		 * Destroys the control will free any memory by removing event listeners etc.
		 *
		 * @method destroy
		 */
		destroy : function() {
			tinymce.dom.Event.clear(this.id);
		}
	});
})(tinymce);
/**
 * Container.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class is the base class for all container controls like toolbars. This class should not
 * be instantiated directly other container controls should inherit from this one.
 *
 * @class tinymce.ui.Container
 * @extends tinymce.ui.Control
 */
tinymce.create('tinymce.ui.Container:tinymce.ui.Control', {
	/**
	 * Base contrustor a new container control instance.
	 *
	 * @constructor
	 * @method Container
	 * @param {String} id Control id to use for the container.
	 * @param {Object} s Optional name/value settings object.
	 */
	Container : function(id, s, editor) {
		this.parent(id, s, editor);

		/**
		 * Array of controls added to the container.
		 *
		 * @property controls
		 * @type Array
		 */
		this.controls = [];

		this.lookup = {};
	},

	/**
	 * Adds a control to the collection of controls for the container.
	 *
	 * @method add
	 * @param {tinymce.ui.Control} c Control instance to add to the container.
	 * @return {tinymce.ui.Control} Same control instance that got passed in.
	 */
	add : function(c) {
		this.lookup[c.id] = c;
		this.controls.push(c);

		return c;
	},

	/**
	 * Returns a control by id from the containers collection.
	 *
	 * @method get
	 * @param {String} n Id for the control to retrive.
	 * @return {tinymce.ui.Control} Control instance by the specified name or undefined if it wasn't found.
	 */
	get : function(n) {
		return this.lookup[n];
	}
});


/**
 * Separator.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class is used to create vertical separator between other controls.
 *
 * @class tinymce.ui.Separator
 * @extends tinymce.ui.Control
 */
tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
	/**
	 * Separator constructor.
	 *
	 * @constructor
	 * @method Separator
	 * @param {String} id Control id to use for the Separator.
	 * @param {Object} s Optional name/value settings object.
	 */
	Separator : function(id, s) {
		this.parent(id, s);
		this.classPrefix = 'mceSeparator';
		this.setDisabled(true);
	},

	/**
	 * Renders the separator as a HTML string. This method is much faster than using the DOM and when
	 * creating a whole toolbar with buttons it does make a lot of difference.
	 *
	 * @method renderHTML
	 * @return {String} HTML for the separator control element.
	 */
	renderHTML : function() {
		return tinymce.DOM.createHTML('span', {'class' : this.classPrefix, role : 'separator', 'aria-orientation' : 'vertical', tabindex : '-1'});
	}
});

/**
 * MenuItem.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	/**
	 * This class is base class for all menu item types like DropMenus items etc. This class should not
	 * be instantiated directly other menu items should inherit from this one.
	 *
	 * @class tinymce.ui.MenuItem
	 * @extends tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.MenuItem:tinymce.ui.Control', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @constructor
		 * @method MenuItem
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		MenuItem : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceMenuItem';
		},

		/**
		 * Sets the selected state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be selected visually.
		 *
		 * @method setSelected
		 * @param {Boolean} s Boolean state if the control should be selected or not.
		 */
		setSelected : function(s) {
			this.setState('Selected', s);
			this.setAriaProperty('checked', !!s);
			this.selected = s;
		},

		/**
		 * Returns true/false if the control is selected or not.
		 *
		 * @method isSelected
		 * @return {Boolean} true/false if the control is selected or not.
		 */
		isSelected : function() {
			return this.selected;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this;
			
			t.parent();

			// Set pending state
			if (is(t.selected))
				t.setSelected(t.selected);
		}
	});
})(tinymce);

/**
 * Menu.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	/**
	 * This class is base class for all menu types like DropMenus etc. This class should not
	 * be instantiated directly other menu controls should inherit from this one.
	 *
	 * @class tinymce.ui.Menu
	 * @extends tinymce.ui.MenuItem
	 */
	tinymce.create('tinymce.ui.Menu:tinymce.ui.MenuItem', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @constructor
		 * @method Menu
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		Menu : function(id, s) {
			var t = this;

			t.parent(id, s);
			t.items = {};
			t.collapsed = false;
			t.menuCount = 0;
			t.onAddItem = new tinymce.util.Dispatcher(this);
		},

		/**
		 * Expands the menu, this will show them menu and all menu items.
		 *
		 * @method expand
		 * @param {Boolean} d Optional deep state. If this is set to true all children will be expanded as well.
		 */
		expand : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.expand)
						o.expand();
				}, 'items', t);
			}

			t.collapsed = false;
		},

		/**
		 * Collapses the menu, this will hide the menu and all menu items.
		 *
		 * @method collapse
		 * @param {Boolean} d Optional deep state. If this is set to true all children will be collapsed as well.
		 */
		collapse : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.collapse)
						o.collapse();
				}, 'items', t);
			}

			t.collapsed = true;
		},

		/**
		 * Returns true/false if the menu has been collapsed or not.
		 *
		 * @method isCollapsed
		 * @return {Boolean} True/false state if the menu has been collapsed or not.
		 */
		isCollapsed : function() {
			return this.collapsed;
		},

		/**
		 * Adds a new menu, menu item or sub classes of them to the drop menu.
		 *
		 * @method add
		 * @param {tinymce.ui.Control} o Menu or menu item to add to the drop menu.
		 * @return {tinymce.ui.Control} Same as the input control, the menu or menu item.
		 */
		add : function(o) {
			if (!o.settings)
				o = new tinymce.ui.MenuItem(o.id || DOM.uniqueId(), o);

			this.onAddItem.dispatch(this, o);

			return this.items[o.id] = o;
		},

		/**
		 * Adds a menu separator between the menu items.
		 *
		 * @method addSeparator
		 * @return {tinymce.ui.MenuItem} Menu item instance for the separator.
		 */
		addSeparator : function() {
			return this.add({separator : true});
		},

		/**
		 * Adds a sub menu to the menu.
		 *
		 * @method addMenu
		 * @param {Object} o Menu control or a object with settings to be created into an control.
		 * @return {tinymce.ui.Menu} Menu control instance passed in or created.
		 */
		addMenu : function(o) {
			if (!o.collapse)
				o = this.createMenu(o);

			this.menuCount++;

			return this.add(o);
		},

		/**
		 * Returns true/false if the menu has sub menus or not.
		 *
		 * @method hasMenus
		 * @return {Boolean} True/false state if the menu has sub menues or not.
		 */
		hasMenus : function() {
			return this.menuCount !== 0;
		},

		/**
		 * Removes a specific sub menu or menu item from the menu.
		 *
		 * @method remove
		 * @param {tinymce.ui.Control} o Menu item or menu to remove from menu.
		 * @return {tinymce.ui.Control} Control instance or null if it wasn't found.
		 */
		remove : function(o) {
			delete this.items[o.id];
		},

		/**
		 * Removes all menu items and sub menu items from the menu.
		 *
		 * @method removeAll
		 */
		removeAll : function() {
			var t = this;

			walk(t, function(o) {
				if (o.removeAll)
					o.removeAll();
				else
					o.remove();

				o.destroy();
			}, 'items', t);

			t.items = {};
		},

		/**
		 * Created a new sub menu for the menu control.
		 *
		 * @method createMenu
		 * @param {Object} s Optional name/value settings object.
		 * @return {tinymce.ui.Menu} New drop menu instance.
		 */
		createMenu : function(o) {
			var m = new tinymce.ui.Menu(o.id || DOM.uniqueId(), o);

			m.onAddItem.add(this.onAddItem.dispatch, this.onAddItem);

			return m;
		}
	});
})(tinymce);
/**
 * DropMenu.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event, Element = tinymce.dom.Element;

	/**
	 * This class is used to create drop menus, a drop menu can be a
	 * context menu, or a menu for a list box or a menu bar.
	 *
	 * @class tinymce.ui.DropMenu
	 * @extends tinymce.ui.Menu
	 * @example
	 * // Adds a menu to the currently active editor instance
	 * var dm = tinyMCE.activeEditor.controlManager.createDropMenu('somemenu');
	 * 
	 * // Add some menu items
	 * dm.add({title : 'Menu 1', onclick : function() {
	 *     alert('Item 1 was clicked.');
	 * }});
	 * 
	 * dm.add({title : 'Menu 2', onclick : function() {
	 *     alert('Item 2 was clicked.');
	 * }});
	 * 
	 * // Adds a submenu
	 * var sub1 = dm.addMenu({title : 'Menu 3'});
	 * sub1.add({title : 'Menu 1.1', onclick : function() {
	 *     alert('Item 1.1 was clicked.');
	 * }});
	 * 
	 * // Adds a horizontal separator
	 * sub1.addSeparator();
	 * 
	 * sub1.add({title : 'Menu 1.2', onclick : function() {
	 *     alert('Item 1.2 was clicked.');
	 * }});
	 * 
	 * // Adds a submenu to the submenu
	 * var sub2 = sub1.addMenu({title : 'Menu 1.3'});
	 * 
	 * // Adds items to the sub sub menu
	 * sub2.add({title : 'Menu 1.3.1', onclick : function() {
	 *     alert('Item 1.3.1 was clicked.');
	 * }});
	 * 
	 * sub2.add({title : 'Menu 1.3.2', onclick : function() {
	 *     alert('Item 1.3.2 was clicked.');
	 * }});
	 * 
	 * dm.add({title : 'Menu 4', onclick : function() {
	 *     alert('Item 3 was clicked.');
	 * }});
	 * 
	 * // Display the menu at position 100, 100
	 * dm.showMenu(100, 100);
	 */
	tinymce.create('tinymce.ui.DropMenu:tinymce.ui.Menu', {
		/**
		 * Constructs a new drop menu control instance.
		 *
		 * @constructor
		 * @method DropMenu
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		DropMenu : function(id, s) {
			s = s || {};
			s.container = s.container || DOM.doc.body;
			s.offset_x = s.offset_x || 0;
			s.offset_y = s.offset_y || 0;
			s.vp_offset_x = s.vp_offset_x || 0;
			s.vp_offset_y = s.vp_offset_y || 0;

			if (is(s.icons) && !s.icons)
				s['class'] += ' mceNoIcons';

			this.parent(id, s);
			this.onShowMenu = new tinymce.util.Dispatcher(this);
			this.onHideMenu = new tinymce.util.Dispatcher(this);
			this.classPrefix = 'mceMenu';
		},

		/**
		 * Created a new sub menu for the drop menu control.
		 *
		 * @method createMenu
		 * @param {Object} s Optional name/value settings object.
		 * @return {tinymce.ui.DropMenu} New drop menu instance.
		 */
		createMenu : function(s) {
			var t = this, cs = t.settings, m;

			s.container = s.container || cs.container;
			s.parent = t;
			s.constrain = s.constrain || cs.constrain;
			s['class'] = s['class'] || cs['class'];
			s.vp_offset_x = s.vp_offset_x || cs.vp_offset_x;
			s.vp_offset_y = s.vp_offset_y || cs.vp_offset_y;
			s.keyboard_focus = cs.keyboard_focus;
			m = new tinymce.ui.DropMenu(s.id || DOM.uniqueId(), s);

			m.onAddItem.add(t.onAddItem.dispatch, t.onAddItem);

			return m;
		},
		
		focus : function() {
			var t = this;
			if (t.keyboardNav) {
				t.keyboardNav.focus();
			}
		},

		/**
		 * Repaints the menu after new items have been added dynamically.
		 *
		 * @method update
		 */
		update : function() {
			var t = this, s = t.settings, tb = DOM.get('menu_' + t.id + '_tbl'), co = DOM.get('menu_' + t.id + '_co'), tw, th;

			tw = s.max_width ? Math.min(tb.clientWidth, s.max_width) : tb.clientWidth;
			th = s.max_height ? Math.min(tb.clientHeight, s.max_height) : tb.clientHeight;

			if (!DOM.boxModel)
				t.element.setStyles({width : tw + 2, height : th + 2});
			else
				t.element.setStyles({width : tw, height : th});

			if (s.max_width)
				DOM.setStyle(co, 'width', tw);

			if (s.max_height) {
				DOM.setStyle(co, 'height', th);

				if (tb.clientHeight < s.max_height)
					DOM.setStyle(co, 'overflow', 'hidden');
			}
		},

		/**
		 * Displays the menu at the specified cordinate.
		 *
		 * @method showMenu
		 * @param {Number} x Horizontal position of the menu.
		 * @param {Number} y Vertical position of the menu.
		 * @param {Numner} px Optional parent X position used when menus are cascading.
		 */
		showMenu : function(x, y, px) {
			var t = this, s = t.settings, co, vp = DOM.getViewPort(), w, h, mx, my, ot = 2, dm, tb, cp = t.classPrefix;

			t.collapse(1);

			if (t.isMenuVisible)
				return;

			if (!t.rendered) {
				co = DOM.add(t.settings.container, t.renderNode());

				each(t.items, function(o) {
					o.postRender();
				});

				t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});
			} else
				co = DOM.get('menu_' + t.id);

			// Move layer out of sight unless it's Opera since it scrolls to top of page due to an bug
			if (!tinymce.isOpera)
				DOM.setStyles(co, {left : -0xFFFF , top : -0xFFFF});

			DOM.show(co);
			t.update();

			x += s.offset_x || 0;
			y += s.offset_y || 0;
			vp.w -= 4;
			vp.h -= 4;

			// Move inside viewport if not submenu
			if (s.constrain) {
				w = co.clientWidth - ot;
				h = co.clientHeight - ot;
				mx = vp.x + vp.w;
				my = vp.y + vp.h;

				if ((x + s.vp_offset_x + w) > mx)
					x = px ? px - w : Math.max(0, (mx - s.vp_offset_x) - w);

				if ((y + s.vp_offset_y + h) > my)
					y = Math.max(0, (my - s.vp_offset_y) - h);
			}

			DOM.setStyles(co, {left : x , top : y});
			t.element.update();

			t.isMenuVisible = 1;
			t.mouseClickFunc = Event.add(co, 'click', function(e) {
				var m;

				e = e.target;

				if (e && (e = DOM.getParent(e, 'tr')) && !DOM.hasClass(e, cp + 'ItemSub')) {
					m = t.items[e.id];

					if (m.isDisabled())
						return;

					dm = t;

					while (dm) {
						if (dm.hideMenu)
							dm.hideMenu();

						dm = dm.settings.parent;
					}

					if (m.settings.onclick)
						m.settings.onclick(e);

					return Event.cancel(e); // Cancel to fix onbeforeunload problem
				}
			});

			if (t.hasMenus()) {
				t.mouseOverFunc = Event.add(co, 'mouseover', function(e) {
					var m, r, mi;

					e = e.target;
					if (e && (e = DOM.getParent(e, 'tr'))) {
						m = t.items[e.id];

						if (t.lastMenu)
							t.lastMenu.collapse(1);

						if (m.isDisabled())
							return;

						if (e && DOM.hasClass(e, cp + 'ItemSub')) {
							//p = DOM.getPos(s.container);
							r = DOM.getRect(e);
							m.showMenu((r.x + r.w - ot), r.y - ot, r.x);
							t.lastMenu = m;
							DOM.addClass(DOM.get(m.id).firstChild, cp + 'ItemActive');
						}
					}
				});
			}
			
			Event.add(co, 'keydown', t._keyHandler, t);

			t.onShowMenu.dispatch(t);

			if (s.keyboard_focus) { 
				t._setupKeyboardNav(); 
			}
		},

		/**
		 * Hides the displayed menu.
		 *
		 * @method hideMenu
		 */
		hideMenu : function(c) {
			var t = this, co = DOM.get('menu_' + t.id), e;

			if (!t.isMenuVisible)
				return;

			if (t.keyboardNav) t.keyboardNav.destroy();
			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);
			Event.remove(co, 'keydown', t._keyHandler);
			DOM.hide(co);
			t.isMenuVisible = 0;

			if (!c)
				t.collapse(1);

			if (t.element)
				t.element.hide();

			if (e = DOM.get(t.id))
				DOM.removeClass(e.firstChild, t.classPrefix + 'ItemActive');

			t.onHideMenu.dispatch(t);
		},

		/**
		 * Adds a new menu, menu item or sub classes of them to the drop menu.
		 *
		 * @method add
		 * @param {tinymce.ui.Control} o Menu or menu item to add to the drop menu.
		 * @return {tinymce.ui.Control} Same as the input control, the menu or menu item.
		 */
		add : function(o) {
			var t = this, co;

			o = t.parent(o);

			if (t.isRendered && (co = DOM.get('menu_' + t.id)))
				t._add(DOM.select('tbody', co)[0], o);

			return o;
		},

		/**
		 * Collapses the menu, this will hide the menu and all menu items.
		 *
		 * @method collapse
		 * @param {Boolean} d Optional deep state. If this is set to true all children will be collapsed as well.
		 */
		collapse : function(d) {
			this.parent(d);
			this.hideMenu(1);
		},

		/**
		 * Removes a specific sub menu or menu item from the drop menu.
		 *
		 * @method remove
		 * @param {tinymce.ui.Control} o Menu item or menu to remove from drop menu.
		 * @return {tinymce.ui.Control} Control instance or null if it wasn't found.
		 */
		remove : function(o) {
			DOM.remove(o.id);
			this.destroy();

			return this.parent(o);
		},

		/**
		 * Destroys the menu. This will remove the menu from the DOM and any events added to it etc.
		 *
		 * @method destroy
		 */
		destroy : function() {
			var t = this, co = DOM.get('menu_' + t.id);

			if (t.keyboardNav) t.keyboardNav.destroy();
			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(DOM.select('a', co), 'focus', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);
			Event.remove(co, 'keydown', t._keyHandler);

			if (t.element)
				t.element.remove();

			DOM.remove(co);
		},

		/**
		 * Renders the specified menu node to the dom.
		 *
		 * @method renderNode
		 * @return {Element} Container element for the drop menu.
		 */
		renderNode : function() {
			var t = this, s = t.settings, n, tb, co, w;

			w = DOM.create('div', {role: 'listbox', id : 'menu_' + t.id, 'class' : s['class'], 'style' : 'position:absolute;left:0;top:0;z-index:200000;outline:0'});
			if (t.settings.parent) {
				DOM.setAttrib(w, 'aria-parent', 'menu_' + t.settings.parent.id);
			}
			co = DOM.add(w, 'div', {role: 'presentation', id : 'menu_' + t.id + '_co', 'class' : t.classPrefix + (s['class'] ? ' ' + s['class'] : '')});
			t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});

			if (s.menu_line)
				DOM.add(co, 'span', {'class' : t.classPrefix + 'Line'});

//			n = DOM.add(co, 'div', {id : 'menu_' + t.id + '_co', 'class' : 'mceMenuContainer'});
			n = DOM.add(co, 'table', {role: 'presentation', id : 'menu_' + t.id + '_tbl', border : 0, cellPadding : 0, cellSpacing : 0});
			tb = DOM.add(n, 'tbody');

			each(t.items, function(o) {
				t._add(tb, o);
			});

			t.rendered = true;

			return w;
		},

		// Internal functions
		_setupKeyboardNav : function(){
			var contextMenu, menuItems, t=this; 
			contextMenu = DOM.get('menu_' + t.id);
			menuItems = DOM.select('a[role=option]', 'menu_' + t.id);
			menuItems.splice(0,0,contextMenu);
			t.keyboardNav = new tinymce.ui.KeyboardNavigation({
				root: 'menu_' + t.id,
				items: menuItems,
				onCancel: function() {
					t.hideMenu();
				},
				enableUpDown: true
			});
			contextMenu.focus();
		},

		_keyHandler : function(evt) {
			var t = this, e;
			switch (evt.keyCode) {
				case 37: // Left
					if (t.settings.parent) {
						t.hideMenu();
						t.settings.parent.focus();
						Event.cancel(evt);
					}
					break;
				case 39: // Right
					if (t.mouseOverFunc)
						t.mouseOverFunc(evt);
					break;
			}
		},

		_add : function(tb, o) {
			var n, s = o.settings, a, ro, it, cp = this.classPrefix, ic;

			if (s.separator) {
				ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'ItemSeparator'});
				DOM.add(ro, 'td', {'class' : cp + 'ItemSeparator'});

				if (n = ro.previousSibling)
					DOM.addClass(n, 'mceLast');

				return;
			}

			n = ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'Item ' + cp + 'ItemEnabled'});
			n = it = DOM.add(n, s.titleItem ? 'th' : 'td');
			n = a = DOM.add(n, 'a', {id: o.id + '_aria',  role: s.titleItem ? 'presentation' : 'option', href : 'javascript:;', onclick : "return false;", onmousedown : 'return false;'});

			if (s.parent) {
				DOM.setAttrib(a, 'aria-haspopup', 'true');
				DOM.setAttrib(a, 'aria-owns', 'menu_' + o.id);
			}

			DOM.addClass(it, s['class']);
//			n = DOM.add(n, 'span', {'class' : 'item'});

			ic = DOM.add(n, 'span', {'class' : 'mceIcon' + (s.icon ? ' mce_' + s.icon : '')});

			if (s.icon_src)
				DOM.add(ic, 'img', {src : s.icon_src});

			n = DOM.add(n, s.element || 'span', {'class' : 'mceText', title : o.settings.title}, o.settings.title);

			if (o.settings.style)
				DOM.setAttrib(n, 'style', o.settings.style);

			if (tb.childNodes.length == 1)
				DOM.addClass(ro, 'mceFirst');

			if ((n = ro.previousSibling) && DOM.hasClass(n, cp + 'ItemSeparator'))
				DOM.addClass(ro, 'mceFirst');

			if (o.collapse)
				DOM.addClass(ro, cp + 'ItemSub');

			if (n = ro.previousSibling)
				DOM.removeClass(n, 'mceLast');

			DOM.addClass(ro, 'mceLast');
		}
	});
})(tinymce);
/**
 * Button.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM;

	/**
	 * This class is used to create a UI button. A button is basically a link
	 * that is styled to look like a button or icon.
	 *
	 * @class tinymce.ui.Button
	 * @extends tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.Button:tinymce.ui.Control', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @constructor
		 * @method Button
		 * @param {String} id Control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed Optional the editor instance this button is for.
		 */
		Button : function(id, s, ed) {
			this.parent(id, s, ed);
			this.classPrefix = 'mceButton';
		},

		/**
		 * Renders the button as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the button control element.
		 */
		renderHTML : function() {
			var cp = this.classPrefix, s = this.settings, h, l;

			l = DOM.encode(s.label || '');
			h = '<a role="button" id="' + this.id + '" href="javascript:;" class="' + cp + ' ' + cp + 'Enabled ' + s['class'] + (l ? ' ' + cp + 'Labeled' : '') +'" onmousedown="return false;" onclick="return false;" aria-labelledby="' + this.id + '_voice" title="' + DOM.encode(s.title) + '">';
			if (s.image && !(this.editor  &&this.editor.forcedHighContrastMode) )
				h += '<img class="mceIcon" src="' + s.image + '" alt="' + DOM.encode(s.title) + '" />' + l;
			else
				h += '<span class="mceIcon ' + s['class'] + '"></span>' + (l ? '<span class="' + cp + 'Label">' + l + '</span>' : '');

			h += '<span class="mceVoiceLabel mceIconOnly" style="display: none;" id="' + this.id + '_voice">' + s.title + '</span>'; 
			h += '</a>';
			return h;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, s = t.settings, imgBookmark;

			// In IE a large image that occupies the entire editor area will be deselected when a button is clicked, so
			// need to keep the selection in case the selection is lost
			if (tinymce.isIE && t.editor) {
				tinymce.dom.Event.add(t.id, 'mousedown', function(e) {
					var nodeName = t.editor.selection.getNode().nodeName;
					imgBookmark = nodeName === 'IMG' ? t.editor.selection.getBookmark() : null;
				});
			}
			tinymce.dom.Event.add(t.id, 'click', function(e) {
				if (!t.isDisabled()) {
					// restore the selection in case the selection is lost in IE
					if (tinymce.isIE && t.editor && imgBookmark !== null) {
						t.editor.selection.moveToBookmark(imgBookmark);
					}
					return s.onclick.call(s.scope, e);
				}
			});
			tinymce.dom.Event.add(t.id, 'keyup', function(e) {
				if (!t.isDisabled() && e.keyCode==tinymce.VK.SPACEBAR)
					return s.onclick.call(s.scope, e);
			});
		}
	});
})(tinymce);

/**
 * ListBox.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	/**
	 * This class is used to create list boxes/select list. This one will generate
	 * a non native control. This one has the benefits of having visual items added.
	 *
	 * @class tinymce.ui.ListBox
	 * @extends tinymce.ui.Control
	 * @example
	 * // Creates a new plugin class and a custom listbox
	 * tinymce.create('tinymce.plugins.ExamplePlugin', {
	 *     createControl: function(n, cm) {
	 *         switch (n) {
	 *             case 'mylistbox':
	 *                 var mlb = cm.createListBox('mylistbox', {
	 *                      title : 'My list box',
	 *                      onselect : function(v) {
	 *                          tinyMCE.activeEditor.windowManager.alert('Value selected:' + v);
	 *                      }
	 *                 });
	 * 
	 *                 // Add some values to the list box
	 *                 mlb.add('Some item 1', 'val1');
	 *                 mlb.add('some item 2', 'val2');
	 *                 mlb.add('some item 3', 'val3');
	 * 
	 *                 // Return the new listbox instance
	 *                 return mlb;
	 *         }
	 * 
	 *         return null;
	 *     }
	 * });
	 * 
	 * // Register plugin with a short name
	 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
	 * 
	 * // Initialize TinyMCE with the new plugin and button
	 * tinyMCE.init({
	 *    ...
	 *    plugins : '-example', // - means TinyMCE will not try to load it
	 *    theme_advanced_buttons1 : 'mylistbox' // Add the new example listbox to the toolbar
	 * });
	 */
	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
		/**
		 * Constructs a new listbox control instance.
		 *
		 * @constructor
		 * @method ListBox
		 * @param {String} id Control id for the list box.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed Optional the editor instance this button is for.
		 */
		ListBox : function(id, s, ed) {
			var t = this;

			t.parent(id, s, ed);

			/**
			 * Array of ListBox items.
			 *
			 * @property items
			 * @type Array
			 */
			t.items = [];

			/**
			 * Fires when the selection has been changed.
			 *
			 * @event onChange
			 */
			t.onChange = new Dispatcher(t);

			/**
			 * Fires after the element has been rendered to DOM.
			 *
			 * @event onPostRender
			 */
			t.onPostRender = new Dispatcher(t);

			/**
			 * Fires when a new item is added.
			 *
			 * @event onAdd
			 */
			t.onAdd = new Dispatcher(t);

			/**
			 * Fires when the menu gets rendered.
			 *
			 * @event onRenderMenu
			 */
			t.onRenderMenu = new tinymce.util.Dispatcher(this);

			t.classPrefix = 'mceListBox';
		},

		/**
		 * Selects a item/option by value. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @method select
		 * @param {String/function} va Value to look for inside the list box or a function selector.
		 */
		select : function(va) {
			var t = this, fv, f;

			if (va == undefined)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && typeof(va)=="function")
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		/**
		 * Selects a item/option by index. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @method selectByIndex
		 * @param {String} idx Index to select, pass -1 to select menu/title of select box.
		 */
		selectByIndex : function(idx) {
			var t = this, e, o, label;

			if (idx != t.selectedIndex) {
				e = DOM.get(t.id + '_text');
				label = DOM.get(t.id + '_voiceDesc');
				o = t.items[idx];

				if (o) {
					t.selectedValue = o.value;
					t.selectedIndex = idx;
					DOM.setHTML(e, DOM.encode(o.title));
					DOM.setHTML(label, t.settings.title + " - " + o.title);
					DOM.removeClass(e, 'mceTitle');
					DOM.setAttrib(t.id, 'aria-valuenow', o.title);
				} else {
					DOM.setHTML(e, DOM.encode(t.settings.title));
					DOM.setHTML(label, DOM.encode(t.settings.title));
					DOM.addClass(e, 'mceTitle');
					t.selectedValue = t.selectedIndex = null;
					DOM.setAttrib(t.id, 'aria-valuenow', t.settings.title);
				}
				e = 0;
			}
		},

		/**
		 * Adds a option item to the list box.
		 *
		 * @method add
		 * @param {String} n Title for the new option.
		 * @param {String} v Value for the new option.
		 * @param {Object} o Optional object with settings like for example class.
		 */
		add : function(n, v, o) {
			var t = this;

			o = o || {};
			o = tinymce.extend(o, {
				title : n,
				value : v
			});

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		/**
		 * Returns the number of items inside the list box.
		 *
		 * @method getLength
		 * @param {Number} Number of items inside the list box.
		 */
		getLength : function() {
			return this.items.length;
		},

		/**
		 * Renders the list box as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the list box control element.
		 */
		renderHTML : function() {
			var h = '', t = this, s = t.settings, cp = t.classPrefix;

			h = '<span role="listbox" aria-haspopup="true" aria-labelledby="' + t.id +'_voiceDesc" aria-describedby="' + t.id + '_voiceDesc"><table role="presentation" tabindex="0" id="' + t.id + '" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tbody><tr>';
			h += '<td>' + DOM.createHTML('span', {id: t.id + '_voiceDesc', 'class': 'voiceLabel', style:'display:none;'}, t.settings.title); 
			h += DOM.createHTML('a', {id : t.id + '_text', tabindex : -1, href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span><span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span></span>') + '</td>';
			h += '</tr></tbody></table></span>';

			return h;
		},

		/**
		 * Displays the drop menu with all items.
		 *
		 * @method showMenu
		 */
		showMenu : function() {
			var t = this, p2, e = DOM.get(this.id), m;

			if (t.isDisabled() || t.items.length == 0)
				return;

			if (t.menu && t.menu.isMenuVisible)
				return t.hideMenu();

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.keyboard_focus = !tinymce.isOpera; // Opera is buggy when it comes to auto focus

			// Select in menu
			if (t.oldID)
				m.items[t.oldID].setSelected(0);

			each(t.items, function(o) {
				if (o.value === t.selectedValue) {
					m.items[o.id].setSelected(1);
					t.oldID = o.id;
				}
			});

			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			DOM.addClass(t.id, t.classPrefix + 'Selected');

			//DOM.get(t.id + '_text').focus();
		},

		/**
		 * Hides the drop menu.
		 *
		 * @method hideMenu
		 */
		hideMenu : function(e) {
			var t = this;

			if (t.menu && t.menu.isMenuVisible) {
				DOM.removeClass(t.id, t.classPrefix + 'Selected');

				// Prevent double toogles by canceling the mouse click event to the button
				if (e && e.type == "mousedown" && (e.target.id == t.id + '_text' || e.target.id == t.id + '_open'))
					return;

				if (!e || !DOM.getParent(e.target, '.mceMenu')) {
					DOM.removeClass(t.id, t.classPrefix + 'Selected');
					Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
					t.menu.hideMenu();
				}
			}
		},

		/**
		 * Renders the menu to the DOM.
		 *
		 * @method renderMenu
		 */
		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : t.classPrefix + 'Menu mceNoIcons',
				max_width : 150,
				max_height : 150
			});

			m.onHideMenu.add(function() {
				t.hideMenu();
				t.focus();
			});

			m.add({
				title : t.settings.title,
				'class' : 'mceMenuItemTitle',
				onclick : function() {
					if (t.settings.onselect('') !== false)
						t.select(''); // Must be runned after
				}
			});

			each(t.items, function(o) {
				// No value then treat it as a title
				if (o.value === undefined) {
					m.add({
						title : o.title,
						role : "option",
						'class' : 'mceMenuItemTitle',
						onclick : function() {
							if (t.settings.onselect('') !== false)
								t.select(''); // Must be runned after
						}
					});
				} else {
					o.id = DOM.uniqueId();
					o.role= "option";
					o.onclick = function() {
						if (t.settings.onselect(o.value) !== false)
							t.select(o.value); // Must be runned after
					};

					m.add(o);
				}
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		/**
		 * Post render event. This will be executed after the control has been rendered and can be used to
		 * set states, add events to the control etc. It's recommended for subclasses of the control to call this method by using this.parent().
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, cp = t.classPrefix;

			Event.add(t.id, 'click', t.showMenu, t);
			Event.add(t.id, 'keydown', function(evt) {
				if (evt.keyCode == 32) { // Space
					t.showMenu(evt);
					Event.cancel(evt);
				}
			});
			Event.add(t.id, 'focus', function() {
				if (!t._focused) {
					t.keyDownHandler = Event.add(t.id, 'keydown', function(e) {
						if (e.keyCode == 40) {
							t.showMenu();
							Event.cancel(e);
						}
					});
					t.keyPressHandler = Event.add(t.id, 'keypress', function(e) {
						var v;
						if (e.keyCode == 13) {
							// Fake select on enter
							v = t.selectedValue;
							t.selectedValue = null; // Needs to be null to fake change
							Event.cancel(e);
							t.settings.onselect(v);
						}
					});
				}

				t._focused = 1;
			});
			Event.add(t.id, 'blur', function() {
				Event.remove(t.id, 'keydown', t.keyDownHandler);
				Event.remove(t.id, 'keypress', t.keyPressHandler);
				t._focused = 0;
			});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.addClass(t.id, cp + 'Hover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.removeClass(t.id, cp + 'Hover');
				});
			}

			t.onPostRender.dispatch(t, DOM.get(t.id));
		},

		/**
		 * Destroys the ListBox i.e. clear memory and events.
		 *
		 * @method destroy
		 */
		destroy : function() {
			this.parent();

			Event.clear(this.id + '_text');
			Event.clear(this.id + '_open');
		}
	});
})(tinymce);

/**
 * NativeListBox.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	/**
	 * This class is used to create list boxes/select list. This one will generate
	 * a native control the way that the browser produces them by default.
	 *
	 * @class tinymce.ui.NativeListBox
	 * @extends tinymce.ui.ListBox
	 */
	tinymce.create('tinymce.ui.NativeListBox:tinymce.ui.ListBox', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @constructor
		 * @method NativeListBox
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		NativeListBox : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceNativeListBox';
		},

		/**
		 * Sets the disabled state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be disabled visually.
		 *
		 * @method setDisabled
		 * @param {Boolean} s Boolean state if the control should be disabled or not.
		 */
		setDisabled : function(s) {
			DOM.get(this.id).disabled = s;
			this.setAriaProperty('disabled', s);
		},

		/**
		 * Returns true/false if the control is disabled or not. This is a method since you can then
		 * choose to check some class or some internal bool state in subclasses.
		 *
		 * @method isDisabled
		 * @return {Boolean} true/false if the control is disabled or not.
		 */
		isDisabled : function() {
			return DOM.get(this.id).disabled;
		},

		/**
		 * Selects a item/option by value. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @method select
		 * @param {String/function} va Value to look for inside the list box or a function selector.
		 */
		select : function(va) {
			var t = this, fv, f;

			if (va == undefined)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && typeof(va)=="function")
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		/**
		 * Selects a item/option by index. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @method selectByIndex
		 * @param {String} idx Index to select, pass -1 to select menu/title of select box.
		 */
		selectByIndex : function(idx) {
			DOM.get(this.id).selectedIndex = idx + 1;
			this.selectedValue = this.items[idx] ? this.items[idx].value : null;
		},

		/**
		 * Adds a option item to the list box.
		 *
		 * @method add
		 * @param {String} n Title for the new option.
		 * @param {String} v Value for the new option.
		 * @param {Object} o Optional object with settings like for example class.
		 */
		add : function(n, v, a) {
			var o, t = this;

			a = a || {};
			a.value = v;

			if (t.isRendered())
				DOM.add(DOM.get(this.id), 'option', a, n);

			o = {
				title : n,
				value : v,
				attribs : a
			};

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		/**
		 * Executes the specified callback function for the menu item. In this case when the user clicks the menu item.
		 *
		 * @method getLength
		 */
		getLength : function() {
			return this.items.length;
		},

		/**
		 * Renders the list box as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the list box control element.
		 */
		renderHTML : function() {
			var h, t = this;

			h = DOM.createHTML('option', {value : ''}, '-- ' + t.settings.title + ' --');

			each(t.items, function(it) {
				h += DOM.createHTML('option', {value : it.value}, it.title);
			});

			h = DOM.createHTML('select', {id : t.id, 'class' : 'mceNativeListBox', 'aria-labelledby': t.id + '_aria'}, h);
			h += DOM.createHTML('span', {id : t.id + '_aria', 'style': 'display: none'}, t.settings.title);
			return h;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, ch, changeListenerAdded = true;

			t.rendered = true;

			function onChange(e) {
				var v = t.items[e.target.selectedIndex - 1];

				if (v && (v = v.value)) {
					t.onChange.dispatch(t, v);

					if (t.settings.onselect)
						t.settings.onselect(v);
				}
			};

			Event.add(t.id, 'change', onChange);

			// Accessibility keyhandler
			Event.add(t.id, 'keydown', function(e) {
				var bf;

				Event.remove(t.id, 'change', ch);
				changeListenerAdded = false;

				bf = Event.add(t.id, 'blur', function() {
					if (changeListenerAdded) return;
					changeListenerAdded = true;
					Event.add(t.id, 'change', onChange);
					Event.remove(t.id, 'blur', bf);
				});

				//prevent default left and right keys on chrome - so that the keyboard navigation is used.
				if (tinymce.isWebKit && (e.keyCode==37 ||e.keyCode==39)) {
					return Event.prevent(e);
				}
				
				if (e.keyCode == 13 || e.keyCode == 32) {
					onChange(e);
					return Event.cancel(e);
				}
			});

			t.onPostRender.dispatch(t, DOM.get(t.id));
		}
	});
})(tinymce);

/**
 * MenuButton.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	/**
	 * This class is used to create a UI button. A button is basically a link
	 * that is styled to look like a button or icon.
	 *
	 * @class tinymce.ui.MenuButton
	 * @extends tinymce.ui.Control
	 * @example
	 * // Creates a new plugin class and a custom menu button
	 * tinymce.create('tinymce.plugins.ExamplePlugin', {
	 *     createControl: function(n, cm) {
	 *         switch (n) {
	 *             case 'mymenubutton':
	 *                 var c = cm.createSplitButton('mysplitbutton', {
	 *                     title : 'My menu button',
	 *                     image : 'some.gif'
	 *                 });
	 * 
	 *                 c.onRenderMenu.add(function(c, m) {
	 *                     m.add({title : 'Some title', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
	 * 
	 *                     m.add({title : 'Some item 1', onclick : function() {
	 *                         alert('Some item 1 was clicked.');
	 *                     }});
	 * 
	 *                     m.add({title : 'Some item 2', onclick : function() {
	 *                         alert('Some item 2 was clicked.');
	 *                     }});
	 *               });
	 * 
	 *               // Return the new menubutton instance
	 *               return c;
	 *         }
	 * 
	 *         return null;
	 *     }
	 * });
	 */
	tinymce.create('tinymce.ui.MenuButton:tinymce.ui.Button', {
		/**
		 * Constructs a new split button control instance.
		 *
		 * @constructor
		 * @method MenuButton
		 * @param {String} id Control id for the split button.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed Optional the editor instance this button is for.
		 */
		MenuButton : function(id, s, ed) {
			this.parent(id, s, ed);

			/**
			 * Fires when the menu is rendered.
			 *
			 * @event onRenderMenu
			 */
			this.onRenderMenu = new tinymce.util.Dispatcher(this);

			s.menu_container = s.menu_container || DOM.doc.body;
		},

		/**
		 * Shows the menu.
		 *
		 * @method showMenu
		 */
		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(t.id), m;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			p1 = DOM.getPos(t.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.vp_offset_x = p2.x;
			m.settings.vp_offset_y = p2.y;
			m.settings.keyboard_focus = t._focused;
			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.setState('Selected', 1);

			t.isMenuVisible = 1;
		},

		/**
		 * Renders the menu to the DOM.
		 *
		 * @method renderMenu
		 */
		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : this.classPrefix + 'Menu',
				icons : t.settings.icons
			});

			m.onHideMenu.add(function() {
				t.hideMenu();
				t.focus();
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		/**
		 * Hides the menu. The optional event parameter is used to check where the event occured so it
		 * doesn't close them menu if it was a event inside the menu.
		 *
		 * @method hideMenu
		 * @param {Event} e Optional event object.
		 */
		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id || e.id === t.id + '_open';}))
				return;

			if (!e || !DOM.getParent(e.target, '.mceMenu')) {
				t.setState('Selected', 0);
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
				if (t.menu)
					t.menu.hideMenu();
			}

			t.isMenuVisible = 0;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, s = t.settings;

			Event.add(t.id, 'click', function() {
				if (!t.isDisabled()) {
					if (s.onclick)
						s.onclick(t.value);

					t.showMenu();
				}
			});
		}
	});
})(tinymce);

/**
 * SplitButton.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	/**
	 * This class is used to create a split button. A button with a menu attached to it.
	 *
	 * @class tinymce.ui.SplitButton
	 * @extends tinymce.ui.Button
	 * @example
	 * // Creates a new plugin class and a custom split button
	 * tinymce.create('tinymce.plugins.ExamplePlugin', {
	 *     createControl: function(n, cm) {
	 *         switch (n) {
	 *             case 'mysplitbutton':
	 *                 var c = cm.createSplitButton('mysplitbutton', {
	 *                     title : 'My split button',
	 *                     image : 'some.gif',
	 *                     onclick : function() {
	 *                         alert('Button was clicked.');
	 *                     }
	 *                 });
	 * 
	 *                 c.onRenderMenu.add(function(c, m) {
	 *                     m.add({title : 'Some title', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
	 * 
	 *                     m.add({title : 'Some item 1', onclick : function() {
	 *                         alert('Some item 1 was clicked.');
	 *                     }});
	 * 
	 *                     m.add({title : 'Some item 2', onclick : function() {
	 *                         alert('Some item 2 was clicked.');
	 *                     }});
	 *                 });
	 * 
	 *               // Return the new splitbutton instance
	 *               return c;
	 *         }
	 * 
	 *         return null;
	 *     }
	 * });
	 */
	tinymce.create('tinymce.ui.SplitButton:tinymce.ui.MenuButton', {
		/**
		 * Constructs a new split button control instance.
		 *
		 * @constructor
		 * @method SplitButton
		 * @param {String} id Control id for the split button.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed Optional the editor instance this button is for.
		 */
		SplitButton : function(id, s, ed) {
			this.parent(id, s, ed);
			this.classPrefix = 'mceSplitButton';
		},

		/**
		 * Renders the split button as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the split button control element.
		 */
		renderHTML : function() {
			var h, t = this, s = t.settings, h1;

			h = '<tbody><tr>';

			if (s.image)
				h1 = DOM.createHTML('img ', {src : s.image, role: 'presentation', 'class' : 'mceAction ' + s['class']});
			else
				h1 = DOM.createHTML('span', {'class' : 'mceAction ' + s['class']}, '');

			h1 += DOM.createHTML('span', {'class': 'mceVoiceLabel mceIconOnly', id: t.id + '_voice', style: 'display:none;'}, s.title);
			h += '<td >' + DOM.createHTML('a', {role: 'button', id : t.id + '_action', tabindex: '-1', href : 'javascript:;', 'class' : 'mceAction ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';
	
			h1 = DOM.createHTML('span', {'class' : 'mceOpen ' + s['class']}, '<span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span>');
			h += '<td >' + DOM.createHTML('a', {role: 'button', id : t.id + '_open', tabindex: '-1', href : 'javascript:;', 'class' : 'mceOpen ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';

			h += '</tr></tbody>';
			h = DOM.createHTML('table', { role: 'presentation',   'class' : 'mceSplitButton mceSplitButtonEnabled ' + s['class'], cellpadding : '0', cellspacing : '0', title : s.title}, h);
			return DOM.createHTML('div', {id : t.id, role: 'button', tabindex: '0', 'aria-labelledby': t.id + '_voice', 'aria-haspopup': 'true'}, h);
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, s = t.settings, activate;

			if (s.onclick) {
				activate = function(evt) {
					if (!t.isDisabled()) {
						s.onclick(t.value);
						Event.cancel(evt);
					}
				};
				Event.add(t.id + '_action', 'click', activate);
				Event.add(t.id, ['click', 'keydown'], function(evt) {
					var DOM_VK_SPACE = 32, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_UP = 38, DOM_VK_DOWN = 40;
					if ((evt.keyCode === 32 || evt.keyCode === 13 || evt.keyCode === 14) && !evt.altKey && !evt.ctrlKey && !evt.metaKey) {
						activate();
						Event.cancel(evt);
					} else if (evt.type === 'click' || evt.keyCode === DOM_VK_DOWN) {
						t.showMenu();
						Event.cancel(evt);
					}
				});
			}

			Event.add(t.id + '_open', 'click', function (evt) {
				t.showMenu();
				Event.cancel(evt);
			});
			Event.add([t.id, t.id + '_open'], 'focus', function() {t._focused = 1;});
			Event.add([t.id, t.id + '_open'], 'blur', function() {t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.addClass(t.id, 'mceSplitButtonHover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.removeClass(t.id, 'mceSplitButtonHover');
				});
			}
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_action');
			Event.clear(this.id + '_open');
			Event.clear(this.id);
		}
	});
})(tinymce);

/**
 * ColorSplitButton.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, is = tinymce.is, each = tinymce.each;

	/**
	 * This class is used to create UI color split button. A color split button will present show a small color picker
	 * when you press the open menu.
	 *
	 * @class tinymce.ui.ColorSplitButton
	 * @extends tinymce.ui.SplitButton
	 */
	tinymce.create('tinymce.ui.ColorSplitButton:tinymce.ui.SplitButton', {
		/**
		 * Constructs a new color split button control instance.
		 *
		 * @constructor
		 * @method ColorSplitButton
		 * @param {String} id Control id for the color split button.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed The editor instance this button is for.
		 */
		ColorSplitButton : function(id, s, ed) {
			var t = this;

			t.parent(id, s, ed);

			/**
			 * Settings object.
			 *
			 * @property settings
			 * @type Object
			 */
			t.settings = s = tinymce.extend({
				colors : '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,008000,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF',
				grid_width : 8,
				default_color : '#888888'
			}, t.settings);

			/**
			 * Fires when the menu is shown.
			 *
			 * @event onShowMenu
			 */
			t.onShowMenu = new tinymce.util.Dispatcher(t);

			/**
			 * Fires when the menu is hidden.
			 *
			 * @event onHideMenu
			 */
			t.onHideMenu = new tinymce.util.Dispatcher(t);

			/**
			 * Current color value.
			 *
			 * @property value
			 * @type String
			 */
			t.value = s.default_color;
		},

		/**
		 * Shows the color menu. The color menu is a layer places under the button
		 * and displays a table of colors for the user to pick from.
		 *
		 * @method showMenu
		 */
		showMenu : function() {
			var t = this, r, p, e, p2;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			e = DOM.get(t.id);
			DOM.show(t.id + '_menu');
			DOM.addClass(e, 'mceSplitButtonSelected');
			p2 = DOM.getPos(e);
			DOM.setStyles(t.id + '_menu', {
				left : p2.x,
				top : p2.y + e.clientHeight,
				zIndex : 200000
			});
			e = 0;

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.onShowMenu.dispatch(t);

			if (t._focused) {
				t._keyHandler = Event.add(t.id + '_menu', 'keydown', function(e) {
					if (e.keyCode == 27)
						t.hideMenu();
				});

				DOM.select('a', t.id + '_menu')[0].focus(); // Select first link
			}

			t.isMenuVisible = 1;
		},

		/**
		 * Hides the color menu. The optional event parameter is used to check where the event occured so it
		 * doesn't close them menu if it was a event inside the menu.
		 *
		 * @method hideMenu
		 * @param {Event} e Optional event object.
		 */
		hideMenu : function(e) {
			var t = this;

			if (t.isMenuVisible) {
				// Prevent double toogles by canceling the mouse click event to the button
				if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id + '_open';}))
					return;

				if (!e || !DOM.getParent(e.target, '.mceSplitButtonMenu')) {
					DOM.removeClass(t.id, 'mceSplitButtonSelected');
					Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
					Event.remove(t.id + '_menu', 'keydown', t._keyHandler);
					DOM.hide(t.id + '_menu');
				}

				t.isMenuVisible = 0;
				t.onHideMenu.dispatch();
			}
		},

		/**
		 * Renders the menu to the DOM.
		 *
		 * @method renderMenu
		 */
		renderMenu : function() {
			var t = this, m, i = 0, s = t.settings, n, tb, tr, w, context;

			w = DOM.add(s.menu_container, 'div', {role: 'listbox', id : t.id + '_menu', 'class' : s['menu_class'] + ' ' + s['class'], style : 'position:absolute;left:0;top:-1000px;'});
			m = DOM.add(w, 'div', {'class' : s['class'] + ' mceSplitButtonMenu'});
			DOM.add(m, 'span', {'class' : 'mceMenuLine'});

			n = DOM.add(m, 'table', {role: 'presentation', 'class' : 'mceColorSplitMenu'});
			tb = DOM.add(n, 'tbody');

			// Generate color grid
			i = 0;
			each(is(s.colors, 'array') ? s.colors : s.colors.split(','), function(c) {
				c = c.replace(/^#/, '');

				if (!i--) {
					tr = DOM.add(tb, 'tr');
					i = s.grid_width - 1;
				}

				n = DOM.add(tr, 'td');
				var settings = {
					href : 'javascript:;',
					style : {
						backgroundColor : '#' + c
					},
					'title': t.editor.getLang('colors.' + c, c),
					'data-mce-color' : '#' + c
				};

				// adding a proper ARIA role = button causes JAWS to read things incorrectly on IE.
				if (!tinymce.isIE ) {
					settings['role']= 'option';
				}

				n = DOM.add(n, 'a', settings);

				if (t.editor.forcedHighContrastMode) {
					n = DOM.add(n, 'canvas', { width: 16, height: 16, 'aria-hidden': 'true' });
					if (n.getContext && (context = n.getContext("2d"))) {
						context.fillStyle = '#' + c;
						context.fillRect(0, 0, 16, 16);
					} else {
						// No point leaving a canvas element around if it's not supported for drawing on anyway.
						DOM.remove(n);
					}
				}
			});

			if (s.more_colors_func) {
				n = DOM.add(tb, 'tr');
				n = DOM.add(n, 'td', {colspan : s.grid_width, 'class' : 'mceMoreColors'});
				n = DOM.add(n, 'a', {role: 'option', id : t.id + '_more', href : 'javascript:;', onclick : 'return false;', 'class' : 'mceMoreColors'}, s.more_colors_title);

				Event.add(n, 'click', function(e) {
					s.more_colors_func.call(s.more_colors_scope || this);
					return Event.cancel(e); // Cancel to fix onbeforeunload problem
				});
			}

			DOM.addClass(m, 'mceColorSplitMenu');
			
			new tinymce.ui.KeyboardNavigation({
				root: t.id + '_menu',
				items: DOM.select('a', t.id + '_menu'),
				onCancel: function() {
					t.hideMenu();
					t.focus();
				}
			});

			// Prevent IE from scrolling and hindering click to occur #4019
			Event.add(t.id + '_menu', 'mousedown', function(e) {return Event.cancel(e);});

			Event.add(t.id + '_menu', 'click', function(e) {
				var c;

				e = DOM.getParent(e.target, 'a', tb);

				if (e && e.nodeName.toLowerCase() == 'a' && (c = e.getAttribute('data-mce-color')))
					t.setColor(c);

				return Event.cancel(e); // Prevent IE auto save warning
			});

			return w;
		},

		/**
		 * Sets the current color for the control and hides the menu if it should be visible.
		 *
		 * @method setColor
		 * @param {String} c Color code value in hex for example: #FF00FF
		 */
		setColor : function(c) {
			this.displayColor(c);
			this.hideMenu();
			this.settings.onselect(c);
		},
		
		/**
		 * Change the currently selected color for the control.
		 *
		 * @method displayColor
		 * @param {String} c Color code value in hex for example: #FF00FF
		 */
		displayColor : function(c) {
			var t = this;

			DOM.setStyle(t.id + '_preview', 'backgroundColor', c);

			t.value = c;
		},

		/**
		 * Post render event. This will be executed after the control has been rendered and can be used to
		 * set states, add events to the control etc. It's recommended for subclasses of the control to call this method by using this.parent().
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, id = t.id;

			t.parent();
			DOM.add(id + '_action', 'div', {id : id + '_preview', 'class' : 'mceColorPreview'});
			DOM.setStyle(t.id + '_preview', 'backgroundColor', t.value);
		},

		/**
		 * Destroys the control. This means it will be removed from the DOM and any
		 * events tied to it will also be removed.
		 *
		 * @method destroy
		 */
		destroy : function() {
			this.parent();

			Event.clear(this.id + '_menu');
			Event.clear(this.id + '_more');
			DOM.remove(this.id + '_menu');
		}
	});
})(tinymce);

/**
 * ToolbarGroup.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
// Shorten class names
var dom = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event;
/**
 * This class is used to group a set of toolbars together and control the keyboard navigation and focus.
 *
 * @class tinymce.ui.ToolbarGroup
 * @extends tinymce.ui.Container
 */
tinymce.create('tinymce.ui.ToolbarGroup:tinymce.ui.Container', {
	/**
	 * Renders the toolbar group as a HTML string.
	 *
	 * @method renderHTML
	 * @return {String} HTML for the toolbar control.
	 */
	renderHTML : function() {
		var t = this, h = [], controls = t.controls, each = tinymce.each, settings = t.settings;

		h.push('<div id="' + t.id + '" role="group" aria-labelledby="' + t.id + '_voice">');
		//TODO: ACC test this out - adding a role = application for getting the landmarks working well.
		h.push("<span role='application'>");
		h.push('<span id="' + t.id + '_voice" class="mceVoiceLabel" style="display:none;">' + dom.encode(settings.name) + '</span>');
		each(controls, function(toolbar) {
			h.push(toolbar.renderHTML());
		});
		h.push("</span>");
		h.push('</div>');

		return h.join('');
	},
	
	focus : function() {
		var t = this;
		dom.get(t.id).focus();
	},
	
	postRender : function() {
		var t = this, items = [];

		each(t.controls, function(toolbar) {
			each (toolbar.controls, function(control) {
				if (control.id) {
					items.push(control);
				}
			});
		});

		t.keyNav = new tinymce.ui.KeyboardNavigation({
			root: t.id,
			items: items,
			onCancel: function() {
				//Move focus if webkit so that navigation back will read the item.
				if (tinymce.isWebKit) {
					dom.get(t.editor.id+"_ifr").focus();
				}
				t.editor.focus();
			},
			excludeFromTabOrder: !t.settings.tab_focus_toolbar
		});
	},
	
	destroy : function() {
		var self = this;

		self.parent();
		self.keyNav.destroy();
		Event.clear(self.id);
	}
});
})(tinymce);

/**
 * Toolbar.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
// Shorten class names
var dom = tinymce.DOM, each = tinymce.each;
/**
 * This class is used to create toolbars a toolbar is a container for other controls like buttons etc.
 *
 * @class tinymce.ui.Toolbar
 * @extends tinymce.ui.Container
 */
tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
	/**
	 * Renders the toolbar as a HTML string. This method is much faster than using the DOM and when
	 * creating a whole toolbar with buttons it does make a lot of difference.
	 *
	 * @method renderHTML
	 * @return {String} HTML for the toolbar control.
	 */
	renderHTML : function() {
		var t = this, h = '', c, co, s = t.settings, i, pr, nx, cl;

		cl = t.controls;
		for (i=0; i<cl.length; i++) {
			// Get current control, prev control, next control and if the control is a list box or not
			co = cl[i];
			pr = cl[i - 1];
			nx = cl[i + 1];

			// Add toolbar start
			if (i === 0) {
				c = 'mceToolbarStart';

				if (co.Button)
					c += ' mceToolbarStartButton';
				else if (co.SplitButton)
					c += ' mceToolbarStartSplitButton';
				else if (co.ListBox)
					c += ' mceToolbarStartListBox';

				h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Add toolbar end before list box and after the previous button
			// This is to fix the o2k7 editor skins
			if (pr && co.ListBox) {
				if (pr.Button || pr.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarEnd'}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Render control HTML

			// IE 8 quick fix, needed to propertly generate a hit area for anchors
			if (dom.stdMode)
				h += '<td style="position: relative">' + co.renderHTML() + '</td>';
			else
				h += '<td>' + co.renderHTML() + '</td>';

			// Add toolbar start after list box and before the next button
			// This is to fix the o2k7 editor skins
			if (nx && co.ListBox) {
				if (nx.Button || nx.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		c = 'mceToolbarEnd';

		if (co.Button)
			c += ' mceToolbarEndButton';
		else if (co.SplitButton)
			c += ' mceToolbarEndSplitButton';
		else if (co.ListBox)
			c += ' mceToolbarEndListBox';

		h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

		return dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || '', role: 'presentation', tabindex: '-1'}, '<tbody><tr>' + h + '</tr></tbody>');
	}
});
})(tinymce);

/**
 * AddOnManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	/**
	 * This class handles the loading of themes/plugins or other add-ons and their language packs.
	 *
	 * @class tinymce.AddOnManager
	 */
	tinymce.create('tinymce.AddOnManager', {
		AddOnManager : function() {
			var self = this;

			self.items = [];
			self.urls = {};
			self.lookup = {};
			self.onAdd = new Dispatcher(self);
		},

		/**
		 * Fires when a item is added.
		 *
		 * @event onAdd
		 */

		/**
		 * Returns the specified add on by the short name.
		 *
		 * @method get
		 * @param {String} n Add-on to look for.
		 * @return {tinymce.Theme/tinymce.Plugin} Theme or plugin add-on instance or undefined.
		 */
		get : function(n) {
			if (this.lookup[n]) {
				return this.lookup[n].instance;
			} else {
				return undefined;
			}
		},

		dependencies : function(n) {
			var result;
			if (this.lookup[n]) {
				result = this.lookup[n].dependencies;
			}
			return result || [];
		},

		/**
		 * Loads a language pack for the specified add-on.
		 *
		 * @method requireLangPack
		 * @param {String} n Short name of the add-on.
		 */
		requireLangPack : function(n) {
			var s = tinymce.settings;

			if (s && s.language && s.language_load !== false)
				tinymce.ScriptLoader.add(this.urls[n] + '/langs/' + s.language + '.js');
		},

		/**
		 * Adds a instance of the add-on by it's short name.
		 *
		 * @method add
		 * @param {String} id Short name/id for the add-on.
		 * @param {tinymce.Theme/tinymce.Plugin} o Theme or plugin to add.
		 * @return {tinymce.Theme/tinymce.Plugin} The same theme or plugin instance that got passed in.
		 * @example
		 * // Create a simple plugin
		 * tinymce.create('tinymce.plugins.TestPlugin', {
		 *     TestPlugin : function(ed, url) {
		 *         ed.onClick.add(function(ed, e) {
		 *             ed.windowManager.alert('Hello World!');
		 *         });
		 *     }
		 * });
		 * 
		 * // Register plugin using the add method
		 * tinymce.PluginManager.add('test', tinymce.plugins.TestPlugin);
		 * 
		 * // Initialize TinyMCE
		 * tinyMCE.init({
		 *    ...
		 *    plugins : '-test' // Init the plugin but don't try to load it
		 * });
		 */
		add : function(id, o, dependencies) {
			this.items.push(o);
			this.lookup[id] = {instance:o, dependencies:dependencies};
			this.onAdd.dispatch(this, id, o);

			return o;
		},
		createUrl: function(baseUrl, dep) {
			if (typeof dep === "object") {
				return dep
			} else {
				return {prefix: baseUrl.prefix, resource: dep, suffix: baseUrl.suffix};
			}
		},

		/**
	 	 * Add a set of components that will make up the add-on. Using the url of the add-on name as the base url.
		 * This should be used in development mode.  A new compressor/javascript munger process will ensure that the 
		 * components are put together into the editor_plugin.js file and compressed correctly.
		 * @param pluginName {String} name of the plugin to load scripts from (will be used to get the base url for the plugins).
		 * @param scripts {Array} Array containing the names of the scripts to load.
	 	 */
		addComponents: function(pluginName, scripts) {
			var pluginUrl = this.urls[pluginName];
			tinymce.each(scripts, function(script){
				tinymce.ScriptLoader.add(pluginUrl+"/"+script);	
			});
		},

		/**
		 * Loads an add-on from a specific url.
		 *
		 * @method load
		 * @param {String} n Short name of the add-on that gets loaded.
		 * @param {String} u URL to the add-on that will get loaded.
		 * @param {function} cb Optional callback to execute ones the add-on is loaded.
		 * @param {Object} s Optional scope to execute the callback in.
		 * @example
		 * // Loads a plugin from an external URL
		 * tinymce.PluginManager.load('myplugin', '/some/dir/someplugin/editor_plugin.js');
		 *
		 * // Initialize TinyMCE
		 * tinyMCE.init({
		 *    ...
		 *    plugins : '-myplugin' // Don't try to load it again
		 * });
		 */
		load : function(n, u, cb, s) {
			var t = this, url = u;

			function loadDependencies() {
				var dependencies = t.dependencies(n);
				tinymce.each(dependencies, function(dep) {
					var newUrl = t.createUrl(u, dep);
					t.load(newUrl.resource, newUrl, undefined, undefined);
				});
				if (cb) {
					if (s) {
						cb.call(s);
					} else {
						cb.call(tinymce.ScriptLoader);
					}
				}
			}

			if (t.urls[n])
				return;
			if (typeof u === "object")
				url = u.prefix + u.resource + u.suffix;

			if (url.indexOf('/') != 0 && url.indexOf('://') == -1)
				url = tinymce.baseURL + '/' + url;

			t.urls[n] = url.substring(0, url.lastIndexOf('/'));

            // ATLASSIAN - We load the scripts via requireResources
            if(!tinymce.settings.atlassian) {
                if (t.lookup[n]) {
                    loadDependencies();
                } else {
                    tinymce.ScriptLoader.add(url, loadDependencies, s);
                }
            }
		}
	});

	// Create plugin and theme managers
	tinymce.PluginManager = new tinymce.AddOnManager();
	tinymce.ThemeManager = new tinymce.AddOnManager();
}(tinymce));

/**
 * TinyMCE theme class.
 *
 * @class tinymce.Theme
 */

/**
 * Initializes the theme.
 *
 * @method init
 * @param {tinymce.Editor} editor Editor instance that created the theme instance.
 * @param {String} url Absolute URL where the theme is located. 
 */

/**
 * Meta info method, this method gets executed when TinyMCE wants to present information about the theme for example in the about/help dialog.
 *
 * @method getInfo
 * @return {Object} Returns an object with meta information about the theme the current items are longname, author, authorurl, infourl and version.
 */

/**
 * This method is responsible for rendering/generating the overall user interface with toolbars, buttons, iframe containers etc.
 *
 * @method renderUI
 * @param {Object} obj Object parameter containing the targetNode DOM node that will be replaced visually with an editor instance. 
 * @return {Object} an object with items like iframeContainer, editorContainer, sizeContainer, deltaWidth, deltaHeight. 
 */

/**
 * Plugin base class, this is a pseudo class that describes how a plugin is to be created for TinyMCE. The methods below are all optional.
 *
 * @class tinymce.Plugin
 * @example
 * // Create a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     init : function(ed, url) {
 *         // Register an example button
 *         ed.addButton('example', {
 *             title : 'example.desc',
 *             onclick : function() {
 *                  // Display an alert when the user clicks the button
 *                  ed.windowManager.alert('Hello world!');
 *             },
 *             'class' : 'bold' // Use the bold icon from the theme
 *         });
 *     }
 * });
 * 
 * // Register plugin with a short name
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 * 
 * // Initialize TinyMCE with the new plugin and button
 * tinyMCE.init({
 *    ...
 *    plugins : '-example', // - means TinyMCE will not try to load it
 *    theme_advanced_buttons1 : 'example' // Add the new example button to the toolbar
 * });
 */

/**
 * Initialization function for the plugin. This will be called when the plugin is created. 
 *
 * @method init
 * @param {tinymce.Editor} editor Editor instance that created the plugin instance. 
 * @param {String} url Absolute URL where the plugin is located. 
 * @example
 * // Creates a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     init : function(ed, url) {
 *         // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
 *         ed.addCommand('mceExample', function() {
 *             ed.windowManager.open({
 *                 file : url + '/dialog.htm',
 *                 width : 320 + ed.getLang('example.delta_width', 0),
 *                 height : 120 + ed.getLang('example.delta_height', 0),
 *                 inline : 1
 *             }, {
 *                 plugin_url : url, // Plugin absolute URL
 *                 some_custom_arg : 'custom arg' // Custom argument
 *             });
 *         });
 * 
 *         // Register example button
 *         ed.addButton('example', {
 *             title : 'example.desc',
 *             cmd : 'mceExample',
 *             image : url + '/img/example.gif'
 *         });
 * 
 *         // Add a node change handler, selects the button in the UI when a image is selected
 *         ed.onNodeChange.add(function(ed, cm, n) {
 *             cm.setActive('example', n.nodeName == 'IMG');
 *         });
 *     }
 * });
 * 
 * // Register plugin
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 */

/**
 * Meta info method, this method gets executed when TinyMCE wants to present information about the plugin for example in the about/help dialog.
 *
 * @method getInfo
 * @return {Object} Returns an object with meta information about the plugin the current items are longname, author, authorurl, infourl and version.
 * @example 
 * // Creates a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     // Meta info method
 *     getInfo : function() {
 *         return {
 *             longname : 'Example plugin',
 *             author : 'Some author',
 *             authorurl : 'http://tinymce.moxiecode.com',
 *             infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/example',
 *             version : "1.0"
 *         };
 *     }
 * });
 * 
 * // Register plugin
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 * 
 * // Initialize TinyMCE with the new plugin
 * tinyMCE.init({
 *    ...
 *    plugins : '-example' // - means TinyMCE will not try to load it
 * });
 */

/**
 * Gets called when a new control instance is created.
 *
 * @method createControl
 * @param {String} name Control name to create for example "mylistbox" 
 * @param {tinymce.ControlManager} controlman Control manager/factory to use to create the control. 
 * @return {tinymce.ui.Control} Returns a new control instance or null.
 * @example 
 * // Creates a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     createControl: function(n, cm) {
 *         switch (n) {
 *             case 'mylistbox':
 *                 var mlb = cm.createListBox('mylistbox', {
 *                      title : 'My list box',
 *                      onselect : function(v) {
 *                          tinyMCE.activeEditor.windowManager.alert('Value selected:' + v);
 *                      }
 *                 });
 * 
 *                 // Add some values to the list box
 *                 mlb.add('Some item 1', 'val1');
 *                 mlb.add('some item 2', 'val2');
 *                 mlb.add('some item 3', 'val3');
 * 
 *                 // Return the new listbox instance
 *                 return mlb;
 *         }
 * 
 *         return null;
 *     }
 * });
 * 
 * // Register plugin
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 * 
 * // Initialize TinyMCE with the new plugin and button
 * tinyMCE.init({
 *    ...
 *    plugins : '-example', // - means TinyMCE will not try to load it
 *    theme_advanced_buttons1 : 'mylistbox' // Add the new mylistbox control to the toolbar
 * });
 */

/**
 * EditorManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * @class tinymce
	 */

	// Shorten names
	var each = tinymce.each, extend = tinymce.extend,
		DOM = tinymce.DOM, Event = tinymce.dom.Event,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		explode = tinymce.explode,
		Dispatcher = tinymce.util.Dispatcher, undefined, instanceCounter = 0;

	// Setup some URLs where the editor API is located and where the document is
	//tinymce.documentBaseURL = window.location.href.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');
    //ATLASSIAN - Use the TinyMCE plugin url as the document base
    // Setup some URLs where the editor API is located and where the document is
    tinymce.documentBaseURL =  tinymce.baseURL;
    AJS.log("tinymce.documentBaseURL = " + tinymce.documentBaseURL);

	if (!/[\/\\]$/.test(tinymce.documentBaseURL))
		tinymce.documentBaseURL += '/';

	tinymce.baseURL = new tinymce.util.URI(tinymce.documentBaseURL).toAbsolute(tinymce.baseURL);

	/**
	 * Absolute baseURI for the installation path of TinyMCE.
	 *
	 * @property baseURI
	 * @type tinymce.util.URI
	 */
	tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);

	// Add before unload listener
	// This was required since IE was leaking memory if you added and removed beforeunload listeners
	// with attachEvent/detatchEvent so this only adds one listener and instances can the attach to the onBeforeUnload event
	tinymce.onBeforeUnload = new Dispatcher(tinymce);

	// Must be on window or IE will leak if the editor is placed in frame or iframe
	Event.add(window, 'beforeunload', function(e) {
		tinymce.onBeforeUnload.dispatch(tinymce, e);
	});

	/**
	 * Fires when a new editor instance is added to the tinymce collection.
	 *
	 * @event onAddEditor
	 * @param {tinymce} sender TinyMCE root class/namespace.
	 * @param {tinymce.Editor} editor Editor instance.
	 * @example
	 * tinyMCE.execCommand("mceAddControl", false, "some_textarea");
	 * tinyMCE.onAddEditor.add(function(mgr,ed) {
	 *     console.debug('A new editor is available' + ed.id);
	 * });
	 */
	tinymce.onAddEditor = new Dispatcher(tinymce);

	/**
	 * Fires when an editor instance is removed from the tinymce collection.
	 *
	 * @event onRemoveEditor
	 * @param {tinymce} sender TinyMCE root class/namespace.
	 * @param {tinymce.Editor} editor Editor instance.
	 */
	tinymce.onRemoveEditor = new Dispatcher(tinymce);

	tinymce.EditorManager = extend(tinymce, {
		/**
		 * Collection of editor instances.
		 *
		 * @property editors
		 * @type Object
		 * @example
		 * for (edId in tinyMCE.editors)
		 *     tinyMCE.editors[edId].save();
		 */
		editors : [],

		/**
		 * Collection of language pack data.
		 *
		 * @property i18n
		 * @type Object
		 */
		i18n : {},

		/**
		 * Currently active editor instance.
		 *
		 * @property activeEditor
		 * @type tinymce.Editor
		 * @example
		 * tinyMCE.activeEditor.selection.getContent();
		 * tinymce.EditorManager.activeEditor.selection.getContent();
		 */
		activeEditor : null,

		/**
		 * Initializes a set of editors. This method will create a bunch of editors based in the input.
		 *
		 * @method init
		 * @param {Object} s Settings object to be passed to each editor instance.
		 * @example
		 * // Initializes a editor using the longer method
		 * tinymce.EditorManager.init({
		 *    some_settings : 'some value'
		 * });
		 *
		 * // Initializes a editor instance using the shorter version
		 * tinyMCE.init({
		 *    some_settings : 'some value'
		 * });
		 */
		init : function(s) {
			var t = this, pl, sl = tinymce.ScriptLoader, e, el = [], ed;

			function execCallback(se, n, s) {
				var f = se[n];

				if (!f)
					return;

				if (tinymce.is(f, 'string')) {
					s = f.replace(/\.\w+$/, '');
					s = s ? tinymce.resolve(s) : 0;
					f = tinymce.resolve(f);
				}

				return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
			};

			s = extend({
				theme : "simple",
				language : "en"
			}, s);

			t.settings = s;

			// Legacy call
            // ATLASSIAN - In tinyMCE the following block is added as an onInit event for "legacy" reasons that don't
            // apply to us, so we just execute it.
			function performInit() {
				var l, co;

				execCallback(s, 'onpageload');

				switch (s.mode) {
					case "exact":
						l = s.elements || '';

						if(l.length > 0) {
							each(explode(l), function(v) {
								if (DOM.get(v)) {
									ed = new tinymce.Editor(v, s);
									el.push(ed);
									ed.render(1);
								} else {
									each(document.forms, function(f) {
										each(f.elements, function(e) {
											if (e.name === v) {
												v = 'mce_editor_' + instanceCounter++;
												DOM.setAttrib(e, 'id', v);

												ed = new tinymce.Editor(v, s);
												el.push(ed);
												ed.render(1);
											}
										});
									});
								}
							});
						}
						break;

					case "textareas":
					case "specific_textareas":
						function hasClass(n, c) {
							return c.constructor === RegExp ? c.test(n.className) : DOM.hasClass(n, c);
						};

						each(DOM.select('textarea'), function(v) {
							if (s.editor_deselector && hasClass(v, s.editor_deselector))
								return;

							if (!s.editor_selector || hasClass(v, s.editor_selector)) {
								// Can we use the name
								e = DOM.get(v.name);
								if (!v.id && !e)
									v.id = v.name;

								// Generate unique name if missing or already exists
								if (!v.id || t.get(v.id))
									v.id = DOM.uniqueId();

								ed = new tinymce.Editor(v.id, s);
								el.push(ed);
								ed.render(1);
							}
						});
						break;
				}

				// Call onInit when all editors are initialized
				if (s.oninit) {
					l = co = 0;

					each(el, function(ed) {
						co++;

						if (!ed.initialized) {
							// Wait for it
							ed.onInit.add(function() {
								l++;

								// All done
								if (l == co)
									execCallback(s, 'oninit');
							});
						} else
							l++;

						// All done
						if (l == co)
							execCallback(s, 'oninit');
					});
				}
			}

            if(s.atlassian) {
                performInit();
            } else {
    			Event.add(document, 'init', performInit);
            }
		},

		/**
		 * Returns a editor instance by id.
		 *
		 * @method get
		 * @param {String/Number} id Editor instance id or index to return.
		 * @return {tinymce.Editor} Editor instance to return.
		 * @example
		 * // Adds an onclick event to an editor by id (shorter version)
		 * tinyMCE.get('mytextbox').onClick.add(function(ed, e) {
		 *    ed.windowManager.alert('Hello world!');
		 * });
		 *
		 * // Adds an onclick event to an editor by id (longer version)
		 * tinymce.EditorManager.get('mytextbox').onClick.add(function(ed, e) {
		 *    ed.windowManager.alert('Hello world!');
		 * });
		 */
		get : function(id) {
			if (id === undefined)
				return this.editors;

			return this.editors[id];
		},

		/**
		 * Returns a editor instance by id. This method was added for compatibility with the 2.x branch.
		 *
		 * @method getInstanceById
		 * @param {String} id Editor instance id to return.
		 * @return {tinymce.Editor} Editor instance to return.
		 * @deprecated Use get method instead.
		 * @see #get
		 */
		getInstanceById : function(id) {
			return this.get(id);
		},

		/**
		 * Adds an editor instance to the editor collection. This will also set it as the active editor.
		 *
		 * @method add
		 * @param {tinymce.Editor} editor Editor instance to add to the collection.
		 * @return {tinymce.Editor} The same instance that got passed in.
		 */
		add : function(editor) {
			var self = this, editors = self.editors;

			// Add named and index editor instance
			editors[editor.id] = editor;
			editors.push(editor);

			self._setActive(editor);
			self.onAddEditor.dispatch(self, editor);

			// #ifdef jquery

			// Patch the tinymce.Editor instance with jQuery adapter logic
			if (tinymce.adapter)
				tinymce.adapter.patchEditor(editor);

			// #endif

			return editor;
		},

		/**
		 * Removes a editor instance from the collection.
		 *
		 * @method remove
		 * @param {tinymce.Editor} e Editor instance to remove.
		 * @return {tinymce.Editor} The editor that got passed in will be return if it was found otherwise null.
		 */
		remove : function(editor) {
			var t = this, i, editors = t.editors;

			// Not in the collection
			if (!editors[editor.id])
				return null;

			delete editors[editor.id];

			for (i = 0; i < editors.length; i++) {
				if (editors[i] == editor) {
					editors.splice(i, 1);
					break;
				}
			}

			// Select another editor since the active one was removed
			if (t.activeEditor == editor)
				t._setActive(editors[0]);

			editor.destroy();
			t.onRemoveEditor.dispatch(t, editor);

			return editor;
		},

		/**
		 * Executes a specific command on the currently active editor.
		 *
		 * @method execCommand
		 * @param {String} c Command to perform for example Bold.
		 * @param {Boolean} u Optional boolean state if a UI should be presented for the command or not.
		 * @param {String} v Optional value parameter like for example an URL to a link.
		 * @return {Boolean} true/false if the command was executed or not.
		 */
		execCommand : function(c, u, v) {
			var t = this, ed = t.get(v), w;

			// Manager commands
			switch (c) {
				case "mceFocus":
					ed.focus();
					return true;

				case "mceAddEditor":
				case "mceAddControl":
					if (!t.get(v))
						new tinymce.Editor(v, t.settings).render();

					return true;

				case "mceAddFrameControl":
					w = v.window;

					// Add tinyMCE global instance and tinymce namespace to specified window
					w.tinyMCE = tinyMCE;
					w.tinymce = tinymce;

					tinymce.DOM.doc = w.document;
					tinymce.DOM.win = w;

					ed = new tinymce.Editor(v.element_id, v);
					ed.render();

					// Fix IE memory leaks
					if (tinymce.isIE) {
						function clr() {
							ed.destroy();
							w.detachEvent('onunload', clr);
							w = w.tinyMCE = w.tinymce = null; // IE leak
						};

						w.attachEvent('onunload', clr);
					}

					v.page_window = null;

					return true;

				case "mceRemoveEditor":
				case "mceRemoveControl":
					if (ed)
						ed.remove();

					return true;

				case 'mceToggleEditor':
					if (!ed) {
						t.execCommand('mceAddControl', 0, v);
						return true;
					}

					if (ed.isHidden())
						ed.show();
					else
						ed.hide();

					return true;
			}

			// Run command on active editor
			if (t.activeEditor)
				return t.activeEditor.execCommand(c, u, v);

			return false;
		},

		/**
		 * Executes a command on a specific editor by id. This method was added for compatibility with the 2.x branch.
		 *
		 * @deprecated Use the execCommand method of a editor instance instead.
		 * @method execInstanceCommand
		 * @param {String} id Editor id to perform the command on.
		 * @param {String} c Command to perform for example Bold.
		 * @param {Boolean} u Optional boolean state if a UI should be presented for the command or not.
		 * @param {String} v Optional value parameter like for example an URL to a link.
		 * @return {Boolean} true/false if the command was executed or not.
		 */
		execInstanceCommand : function(id, c, u, v) {
			var ed = this.get(id);

			if (ed)
				return ed.execCommand(c, u, v);

			return false;
		},

		/**
		 * Calls the save method on all editor instances in the collection. This can be useful when a form is to be submitted.
		 *
		 * @method triggerSave
		 * @example
		 * // Saves all contents
		 * tinyMCE.triggerSave();
		 */
		triggerSave : function() {
			each(this.editors, function(e) {
				e.save();
			});
		},

		/**
		 * Adds a language pack, this gets called by the loaded language files like en.js.
		 *
		 * @method addI18n
		 * @param {String} p Prefix for the language items. For example en.myplugin
		 * @param {Object} o Name/Value collection with items to add to the language group.
		 */
		addI18n : function(p, o) {
			var lo, i18n = this.i18n;

			if (!tinymce.is(p, 'string')) {
				each(p, function(o, lc) {
					each(o, function(o, g) {
						each(o, function(o, k) {
							if (g === 'common')
								i18n[lc + '.' + k] = o;
							else
								i18n[lc + '.' + g + '.' + k] = o;
						});
					});
				});
			} else {
				each(o, function(o, k) {
					i18n[p + '.' + k] = o;
				});
			}
		},

		// Private methods

		_setActive : function(editor) {
			this.selectedInstance = this.activeEditor = editor;
		}
	});
})(tinymce);

/**
 * Alternative name for tinymce added for 2.x compatibility.
 *
 * @member
 * @property tinyMCE
 * @type tinymce
 * @example
 * // To initialize editor instances
 * tinyMCE.init({
 *    ...
 * });
 */

/**
 * Alternative name for tinymce added for compatibility.
 *
 * @member tinymce
 * @property EditorManager
 * @type tinymce
 * @example
 * // To initialize editor instances
 * tinymce.EditorManager.get('editor');
 */

/**
 * Editor.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten these names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend,
		Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isGecko = tinymce.isGecko,
		isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, is = tinymce.is,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		inArray = tinymce.inArray, grep = tinymce.grep, explode = tinymce.explode, VK = tinymce.VK;

	/**
	 * This class contains the core logic for a TinyMCE editor.
	 *
	 * @class tinymce.Editor
	 * @example
	 * // Add a class to all paragraphs in the editor.
	 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'someclass');
	 *
	 * // Gets the current editors selection as text
	 * tinyMCE.activeEditor.selection.getContent({format : 'text'});
	 *
	 * // Creates a new editor instance
	 * var ed = new tinymce.Editor('textareaid', {
	 *     some_setting : 1
	 * });
	 *
	 * // Select each item the user clicks on
	 * ed.onClick.add(function(ed, e) {
	 *     ed.selection.select(e.target);
	 * });
	 *
	 * ed.render();
	 */
	tinymce.create('tinymce.Editor', {
		/**
		 * Constructs a editor instance by id.
		 *
		 * @constructor
		 * @method Editor
		 * @param {String} id Unique id for the editor.
		 * @param {Object} s Optional settings string for the editor.
		 * @author Moxiecode
		 */
		Editor : function(id, s) {
			var t = this;

			/**
			 * Editor instance id, normally the same as the div/textarea that was replaced.
			 *
			 * @property id
			 * @type String
			 */
			t.id = t.editorId = id;

			t.execCommands = {};
			t.queryStateCommands = {};
			t.queryValueCommands = {};

			/**
			 * State to force the editor to return false on a isDirty call.
			 *
			 * @property isNotDirty
			 * @type Boolean
			 * @example
			 * function ajaxSave() {
			 *     var ed = tinyMCE.get('elm1');
			 *
			 *     // Save contents using some XHR call
			 *     alert(ed.getContent());
			 *
			 *     ed.isNotDirty = 1; // Force not dirty state
			 * }
			 */
			t.isNotDirty = false;

			/**
			 * Name/Value object containting plugin instances.
			 *
			 * @property plugins
			 * @type Object
			 * @example
			 * // Execute a method inside a plugin directly
			 * tinyMCE.activeEditor.plugins.someplugin.someMethod();
			 */
			t.plugins = {};

			// Add events to the editor
			each([
				/**
				 * Fires before the initialization of the editor.
				 *
				 * @event onPreInit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @see #onInit
				 * @example
				 * // Adds an observer to the onPreInit event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPreInit.add(function(ed) {
				 *           console.debug('PreInit: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onPreInit',

				/**
				 * Fires before the initialization of the editor.
				 *
				 * @event onBeforeRenderUI
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onBeforeRenderUI event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
 				 *      ed.onBeforeRenderUI.add(function(ed, cm) {
 				 *          console.debug('Before render: ' + ed.id);
 				 *      });
				 *    }
				 * });
				 */
				'onBeforeRenderUI',

				/**
				 * Fires after the rendering has completed.
				 *
				 * @event onPostRender
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onPostRender event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPostRender.add(function(ed, cm) {
				 *           console.debug('After render: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onPostRender',

				/**
				 * Fires when the onload event on the body occurs.
				 *
				 * @event onLoad
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onLoad event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onLoad.add(function(ed, cm) {
				 *           console.debug('Document loaded: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onLoad',

				/**
				 * Fires after the initialization of the editor is done.
				 *
				 * @event onInit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @see #onPreInit
				 * @example
				 * // Adds an observer to the onInit event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onInit.add(function(ed) {
				 *           console.debug('Editor is done: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onInit',

				/**
				 * Fires when the editor instance is removed from page.
				 *
				 * @event onRemove
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onRemove event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onRemove.add(function(ed) {
				 *           console.debug('Editor was removed: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onRemove',

				/**
				 * Fires when the editor is activated.
				 *
				 * @event onActivate
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onActivate event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onActivate.add(function(ed) {
				 *           console.debug('Editor was activated: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onActivate',

				/**
				 * Fires when the editor is deactivated.
				 *
				 * @event onDeactivate
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onDeactivate event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onDeactivate.add(function(ed) {
				 *           console.debug('Editor was deactivated: ' + ed.id);
				 *       });
				 *    }
				 * });
				 */
				'onDeactivate',

				/**
				 * Fires when something in the body of the editor is clicked.
				 *
				 * @event onClick
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onClick event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onClick.add(function(ed, e) {
				 *           console.debug('Editor was clicked: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onClick',

				/**
				 * Fires when a registered event is intercepted.
				 *
				 * @event onEvent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onEvent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onEvent.add(function(ed, e) {
 				 *          console.debug('Editor event occured: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onEvent',

				/**
				 * Fires when a mouseup event is intercepted inside the editor.
				 *
				 * @event onMouseUp
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onMouseUp event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onMouseUp.add(function(ed, e) {
				 *           console.debug('Mouse up event: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onMouseUp',

				/**
				 * Fires when a mousedown event is intercepted inside the editor.
				 *
				 * @event onMouseDown
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onMouseDown event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onMouseDown.add(function(ed, e) {
				 *           console.debug('Mouse down event: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onMouseDown',

				/**
				 * Fires when a dblclick event is intercepted inside the editor.
				 *
				 * @event onDblClick
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onDblClick event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onDblClick.add(function(ed, e) {
 				 *          console.debug('Double click event: ' + e.target.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onDblClick',

				/**
				 * Fires when a keydown event is intercepted inside the editor.
				 *
				 * @event onKeyDown
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onKeyDown event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onKeyDown.add(function(ed, e) {
				 *           console.debug('Key down event: ' + e.keyCode);
				 *       });
				 *    }
				 * });
				 */
				'onKeyDown',

				/**
				 * Fires when a keydown event is intercepted inside the editor.
				 *
				 * @event onKeyUp
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onKeyUp event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onKeyUp.add(function(ed, e) {
				 *           console.debug('Key up event: ' + e.keyCode);
				 *       });
				 *    }
				 * });
				 */
				'onKeyUp',

				/**
				 * Fires when a keypress event is intercepted inside the editor.
				 *
				 * @event onKeyPress
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onKeyPress event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onKeyPress.add(function(ed, e) {
				 *           console.debug('Key press event: ' + e.keyCode);
				 *       });
				 *    }
				 * });
				 */
				'onKeyPress',

				/**
				 * Fires when a contextmenu event is intercepted inside the editor.
				 *
				 * @event onContextMenu
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onContextMenu event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onContextMenu.add(function(ed, e) {
				 *            console.debug('Context menu event:' + e.target);
				 *       });
				 *    }
				 * });
				 */
				'onContextMenu',

				/**
				 * Fires when a form submit event is intercepted.
				 *
				 * @event onSubmit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onSubmit event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSubmit.add(function(ed, e) {
				 *            console.debug('Form submit:' + e.target);
				 *       });
				 *    }
				 * });
				 */
				'onSubmit',

				/**
				 * Fires when a form reset event is intercepted.
				 *
				 * @event onReset
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onReset event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onReset.add(function(ed, e) {
				 *            console.debug('Form reset:' + e.target);
				 *       });
				 *    }
				 * });
				 */
				'onReset',

				/**
				 * Fires when a paste event is intercepted inside the editor.
				 *
				 * @event onPaste
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onPaste event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPaste.add(function(ed, e) {
				 *            console.debug('Pasted plain text');
				 *       });
				 *    }
				 * });
				 */
				'onPaste',

				/**
				 * Fires when the Serializer does a preProcess on the contents.
				 *
				 * @event onPreProcess
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} obj PreProcess object.
				 * @option {Node} node DOM node for the item being serialized.
				 * @option {String} format The specified output format normally "html".
				 * @option {Boolean} get Is true if the process is on a getContent operation.
				 * @option {Boolean} set Is true if the process is on a setContent operation.
				 * @option {Boolean} cleanup Is true if the process is on a cleanup operation.
				 * @example
				 * // Adds an observer to the onPreProcess event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPreProcess.add(function(ed, o) {
				 *            // Add a class to each paragraph in the editor
				 *            ed.dom.addClass(ed.dom.select('p', o.node), 'myclass');
				 *       });
				 *    }
				 * });
				 */
				'onPreProcess',

				/**
				 * Fires when the Serializer does a postProcess on the contents.
				 *
				 * @event onPostProcess
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} obj PreProcess object.
				 * @example
				 * // Adds an observer to the onPostProcess event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onPostProcess.add(function(ed, o) {
				 *            // Remove all paragraphs and replace with BR
				 *            o.content = o.content.replace(/<p[^>]+>|<p>/g, '');
				 *            o.content = o.content.replace(/<\/p>/g, '<br />');
				 *       });
				 *    }
				 * });
				 */
				'onPostProcess',

				/**
				 * Fires before new contents is added to the editor. Using for example setContent.
				 *
				 * @event onBeforeSetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onBeforeSetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onBeforeSetContent.add(function(ed, o) {
				 *            // Replaces all a characters with b characters
				 *            o.content = o.content.replace(/a/g, 'b');
				 *       });
				 *    }
				 * });
				 */
				'onBeforeSetContent',

				/**
				 * Fires before contents is extracted from the editor using for example getContent.
				 *
				 * @event onBeforeGetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 * @example
				 * // Adds an observer to the onBeforeGetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onBeforeGetContent.add(function(ed, o) {
				 *            console.debug('Before get content.');
				 *       });
				 *    }
				 * });
				 */
				'onBeforeGetContent',

				/**
				 * Fires after the contents has been added to the editor using for example onSetContent.
				 *
				 * @event onSetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onSetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSetContent.add(function(ed, o) {
				 *            // Replaces all a characters with b characters
				 *            o.content = o.content.replace(/a/g, 'b');
				 *       });
				 *    }
				 * });
				 */
				'onSetContent',

				/**
				 * Fires after the contents has been extracted from the editor using for example getContent.
				 *
				 * @event onGetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onGetContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onGetContent.add(function(ed, o) {
				 *           // Replace all a characters with b
				 *           o.content = o.content.replace(/a/g, 'b');
				 *       });
				 *    }
				 * });
				 */
				'onGetContent',

				/**
				 * Fires when the editor gets loaded with contents for example when the load method is executed.
				 *
				 * @event onLoadContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onLoadContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onLoadContent.add(function(ed, o) {
				 *           // Output the element name
				 *           console.debug(o.element.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onLoadContent',

				/**
				 * Fires when the editor contents gets saved for example when the save method is executed.
				 *
				 * @event onSaveContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onSaveContent event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSaveContent.add(function(ed, o) {
				 *           // Output the element name
				 *           console.debug(o.element.nodeName);
				 *       });
				 *    }
				 * });
				 */
				'onSaveContent',

				/**
				 * Fires when the user changes node location using the mouse or keyboard.
				 *
				 * @event onNodeChange
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onNodeChange event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onNodeChange.add(function(ed, cm, e) {
				 *           // Activates the link button when the caret is placed in a anchor element
				 *           if (e.nodeName == 'A')
				 *              cm.setActive('link', true);
				 *       });
				 *    }
				 * });
				 */
				'onNodeChange',

				/**
				 * Fires when a new undo level is added to the editor.
				 *
				 * @event onChange
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onChange event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 * 	  ed.onChange.add(function(ed, l) {
				 * 		  console.debug('Editor contents was modified. Contents: ' + l.content);
				 * 	  });
				 *    }
				 * });
				 */
				'onChange',

				/**
				 * Fires before a command gets executed for example "Bold".
				 *
				 * @event onBeforeExecCommand
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onBeforeExecCommand event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onBeforeExecCommand.add(function(ed, cmd, ui, val) {
				 *           console.debug('Command is to be executed: ' + cmd);
				 *       });
				 *    }
				 * });
				 */
				'onBeforeExecCommand',

				/**
				 * Fires after a command is executed for example "Bold".
				 *
				 * @event onExecCommand
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onExecCommand event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onExecCommand.add(function(ed, cmd, ui, val) {
				 *           console.debug('Command was executed: ' + cmd);
				 *       });
				 *    }
				 * });
				 */
				'onExecCommand',

				/**
				 * Fires when the contents is undo:ed.
				 *
				 * @event onUndo
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} level Undo level object.
				 * @ example
				 * // Adds an observer to the onUndo event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onUndo.add(function(ed, level) {
				 *           console.debug('Undo was performed: ' + level.content);
				 *       });
				 *    }
				 * });
				 */
				'onUndo',

				/**
				 * Fires when the contents is redo:ed.
				 *
				 * @event onRedo
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} level Undo level object.
				 * @example
				 * // Adds an observer to the onRedo event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onRedo.add(function(ed, level) {
				 *           console.debug('Redo was performed: ' +level.content);
				 *       });
				 *    }
				 * });
				 */
				'onRedo',

				/**
				 * Fires when visual aids is enabled/disabled.
				 *
				 * @event onVisualAid
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onVisualAid event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onVisualAid.add(function(ed, e, s) {
				 *           console.debug('onVisualAid event: ' + ed.id + ", State: " + s);
				 *       });
				 *    }
				 * });
				 */
				'onVisualAid',

				/**
				 * Fires when the progress throbber is shown above the editor.
				 *
				 * @event onSetProgressState
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onSetProgressState event using tinyMCE.init
				 * tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSetProgressState.add(function(ed, b) {
				 *            if (b)
				 *                 console.debug('SHOW!');
				 *            else
				 *                 console.debug('HIDE!');
				 *       });
				 *    }
				 * });
				 */
				'onSetProgressState',

				/**
				 * Fires after an attribute is set using setAttrib.
				 *
				 * @event onSetAttrib
				 * @param {tinymce.Editor} sender Editor instance.
				 * @example
				 * // Adds an observer to the onSetAttrib event using tinyMCE.init
				 *tinyMCE.init({
				 *    ...
				 *    setup : function(ed) {
				 *       ed.onSetAttrib.add(function(ed, node, attribute, attributeValue) {
				 *            console.log('onSetAttrib tag');
				 *       });
				 *    }
				 * });
				 */
				'onSetAttrib'
			], function(e) {
				t[e] = new Dispatcher(t);
			});

			/**
			 * Name/value collection with editor settings.
			 *
			 * @property settings
			 * @type Object
			 * @example
			 * // Get the value of the theme setting
			 * tinyMCE.activeEditor.windowManager.alert("You are using the " + tinyMCE.activeEditor.settings.theme + " theme");
			 */
			t.settings = s = extend({
				id : id,
				language : 'en',
				docs_language : 'en',
				theme : 'simple',
				skin : 'default',
				delta_width : 0,
				delta_height : 0,
				popup_css : '',
				plugins : '',
				document_base_url : tinymce.documentBaseURL,
				add_form_submit_trigger : 1,
				submit_patch : 1,
				add_unload_trigger : 1,
				convert_urls : 1,
				relative_urls : 1,
				remove_script_host : 1,
				table_inline_editing : 0,
				object_resizing : 1,
				cleanup : 1,
				accessibility_focus : 1,
				custom_shortcuts : 1,
				custom_undo_redo_keyboard_shortcuts : 1,
				custom_undo_redo_restore_selection : 1,
				custom_undo_redo : 1,
				doctype : tinymce.isIE6 ? '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' : '<!DOCTYPE html>', // ATLASSIAN, Use old doctype on IE 6 to avoid horizontal scroll
				visual_table_class : 'mceItemTable',
				visual : 1,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				font_size_legacy_values : 'xx-small,small,medium,large,x-large,xx-large,300%', // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
				apply_source_formatting : 1,
				directionality : 'ltr',
				forced_root_block : 'p',
				hidden_input : 1,
				padd_empty_editor : 1,
				render_ui : 1,
				init_theme : 1,
				force_p_newlines : 1,
				indentation : '30px',
				keep_styles : 1,
				fix_table_elements : 1,
				inline_styles : 1,
				convert_fonts_to_spans : true,
				indent : 'simple',
				indent_before : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr',
				indent_after : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr',
				validate : true,
				entity_encoding : 'named',
				url_converter : t.convertURL,
				url_converter_scope : t,
				ie7_compat : true
			}, s);

			/**
			 * URI object to document configured for the TinyMCE instance.
			 *
			 * @property documentBaseURI
			 * @type tinymce.util.URI
			 * @example
			 * // Get relative URL from the location of document_base_url
			 * tinyMCE.activeEditor.documentBaseURI.toRelative('/somedir/somefile.htm');
			 *
			 * // Get absolute URL from the location of document_base_url
			 * tinyMCE.activeEditor.documentBaseURI.toAbsolute('somefile.htm');
			 */
			t.documentBaseURI = new tinymce.util.URI(s.document_base_url || tinymce.documentBaseURL, {
				base_uri : tinyMCE.baseURI
			});

			/**
			 * URI object to current document that holds the TinyMCE editor instance.
			 *
			 * @property baseURI
			 * @type tinymce.util.URI
			 * @example
			 * // Get relative URL from the location of the API
			 * tinyMCE.activeEditor.baseURI.toRelative('/somedir/somefile.htm');
			 *
			 * // Get absolute URL from the location of the API
			 * tinyMCE.activeEditor.baseURI.toAbsolute('somefile.htm');
			 */
			t.baseURI = tinymce.baseURI;

			/**
			 * Array with CSS files to load into the iframe.
			 *
			 * @property contentCSS
			 * @type Array
			 */
			t.contentCSS = [];

			// Call setup
			t.execCallback('setup', t);
		},

		/**
		 * Renderes the editor/adds it to the page.
		 *
		 * @method render
		 */
		render : function(nst) {
			var t = this, s = t.settings, id = t.id, sl = tinymce.ScriptLoader;

			// ATLASSIAN - No need for this as we initialise TinyMCE on DOM ready
			// Page is not loaded yet, wait for it
			if (!s.atlassian && !Event.domLoaded) {
				Event.add(document, 'init', function() {
					t.render();
				});
				return;
			}

			tinyMCE.settings = s;

			// Element not found, then skip initialization
			if (!t.getElement())
				return;

			// Is a iPad/iPhone and not on iOS5, then skip initialization. We need to sniff
			// here since the browser says it has contentEditable support but there is no visible
			// caret We will remove this check ones Apple implements full contentEditable support
			if (tinymce.isIDevice && !tinymce.isIOS5)
				return;

			// Add hidden input for non input elements inside form elements
			if (!/TEXTAREA|INPUT/i.test(t.getElement().nodeName) && s.hidden_input && DOM.getParent(id, 'form'))
				DOM.insertAfter(DOM.create('input', {type : 'hidden', name : id}), id);

			/**
			 * Window manager reference, use this to open new windows and dialogs.
			 *
			 * @property windowManager
			 * @type tinymce.WindowManager
			 * @example
			 * // Shows an alert message
			 * tinyMCE.activeEditor.windowManager.alert('Hello world!');
			 *
			 * // Opens a new dialog with the file.htm file and the size 320x240
			 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
			 * tinyMCE.activeEditor.windowManager.open({
			 *    url : 'file.htm',
			 *    width : 320,
			 *    height : 240
			 * }, {
			 *    custom_param : 1
			 * });
			 */
			if (tinymce.WindowManager)
				t.windowManager = new tinymce.WindowManager(t);

			if (s.encoding == 'xml') {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = DOM.encode(o.content);
				});
			}

			if (s.add_form_submit_trigger) {
				t.onSubmit.addToTop(function() {
					if (t.initialized) {
						t.save();
						t.isNotDirty = 1;
					}
				});
			}

			if (s.add_unload_trigger) {
				t._beforeUnload = tinyMCE.onBeforeUnload.add(function() {
					if (t.initialized && !t.destroyed && !t.isHidden())
						t.save({format : 'raw', no_events : true});
				});
			}

			tinymce.addUnload(t.destroy, t);

			if (s.submit_patch) {
				t.onBeforeRenderUI.add(function() {
					var n = t.getElement().form;

					if (!n)
						return;

					// Already patched
					if (n._mceOldSubmit)
						return;

					// Check page uses id="submit" or name="submit" for it's submit button
					if (!n.submit.nodeType && !n.submit.length) {
						t.formElement = n;
						n._mceOldSubmit = n.submit;
						n.submit = function() {
							// Save all instances
							tinymce.triggerSave();
							t.isNotDirty = 1;

							return t.formElement._mceOldSubmit(t.formElement);
						};
					}

					n = null;
				});
			}

			// Load scripts
			function loadScripts() {
                // ATLASSIAN - No need to load any scripts, all loaded via #requireResource
				//if (s.language && s.language_load !== false)
					//sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				if (s.theme && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(explode(s.plugins), function(p) {
					if (p &&!PluginManager.urls[p]) {
						if (p.charAt(0) == '-') {
							p = p.substr(1, p.length);
							var dependencies = PluginManager.dependencies(p);
							each(dependencies, function(dep) {
								var defaultSettings = {prefix:'plugins/', resource: dep, suffix:'/editor_plugin' + tinymce.suffix + '.js'};
								var dep = PluginManager.createUrl(defaultSettings, dep);
								PluginManager.load(dep.resource, dep);

							});
						} else {
							// Skip safari plugin, since it is removed as of 3.3b1
							if (p == 'safari') {
								return;
							}
							PluginManager.load(p, {prefix:'plugins/', resource: p, suffix:'/editor_plugin' + tinymce.suffix + '.js'});
						}
					}
				});

                //ATLASSIAN - No need to use the script loader, just init immediately
				// Init when que is loaded
                function initTinyMce() {
                    if (!t.removed)
                        t.init();
                }
                if(s.atlassian) {
                    initTinyMce();
                } else {
                    sl.loadQueue(initTinyMce);
                }
			};

			loadScripts();
		},

		/**
		 * Initializes the editor this will be called automatically when
		 * all plugins/themes and language packs are loaded by the rendered method.
		 * This method will setup the iframe and create the theme and plugin instances.
		 *
		 * @method init
		 */
		init : function() {
			var n, t = this, s = t.settings, w, h, e = t.getElement(), o, ti, u, bi, bc, re, i, initializedPlugins = [];

			tinymce.add(t);

			s.aria_label = s.aria_label || DOM.getAttrib(e, 'aria-label', t.getLang('aria.rich_text_area'));

			/**
			 * Reference to the theme instance that was used to generate the UI.
			 *
			 * @property theme
			 * @type tinymce.Theme
			 * @example
			 * // Executes a method on the theme directly
			 * tinyMCE.activeEditor.theme.someMethod();
			 */
			if (s.theme) {
				s.theme = s.theme.replace(/-/, '');
				o = ThemeManager.get(s.theme);
				t.theme = new o();

				if (t.theme.init && s.init_theme)
					t.theme.init(t, ThemeManager.urls[s.theme] || tinymce.documentBaseURL.replace(/\/$/, ''));
			}
			function initPlugin(p) {
				var c = PluginManager.get(p), u = PluginManager.urls[p] || tinymce.documentBaseURL.replace(/\/$/, ''), po;
				if (c && tinymce.inArray(initializedPlugins,p) === -1) {
					each(PluginManager.dependencies(p), function(dep){
						initPlugin(dep);
					});
					po = new c(t, u);

					t.plugins[p] = po;

					if (po.init) {
						po.init(t, u);
						initializedPlugins.push(p);
					}
					AJS.log("initPlugin: " + p + " initialised"); // ATLASSIAN
				}
			}

			// Create all plugins
			each(explode(s.plugins.replace(/\-/g, '')), initPlugin);

			// Setup popup CSS path(s)
			if (s.popup_css !== false) {
				if (s.popup_css)
					s.popup_css = t.documentBaseURI.toAbsolute(s.popup_css);
				else
					s.popup_css = t.baseURI.toAbsolute("themes/" + s.theme + "/skins/" + s.skin + "/dialog.css");
			}

			if (s.popup_css_add)
				s.popup_css += ',' + t.documentBaseURI.toAbsolute(s.popup_css_add);

			/**
			 * Control manager instance for the editor. Will enables you to create new UI elements and change their states etc.
			 *
			 * @property controlManager
			 * @type tinymce.ControlManager
			 * @example
			 * // Disables the bold button
			 * tinyMCE.activeEditor.controlManager.setDisabled('bold', true);
			 */
			t.controlManager = new tinymce.ControlManager(t);

			if (s.custom_undo_redo) {
				t.onBeforeExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo))
						t.undoManager.beforeChange();
				});

				t.onExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo))
						t.undoManager.add();
				});
			}

			t.onExecCommand.add(function(ed, c) {
				// Don't refresh the select lists until caret move
				if (!/^(FontName|FontSize)$/.test(c))
					t.nodeChanged();
			});

			// Remove ghost selections on images and tables in Gecko
			if (isGecko) {
				function repaint(a, o) {
					if (!o || !o.initial)
						t.execCommand('mceRepaint');
				};

				t.onUndo.add(repaint);
				t.onRedo.add(repaint);
				t.onSetContent.add(repaint);
			}

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			if (s.render_ui) {
				w = s.width || e.style.width || e.offsetWidth;
				h = s.height || e.style.height || e.offsetHeight;
				t.orgDisplay = e.style.display;
				re = /^[0-9\.]+(|px)$/i;

				if (re.test('' + w))
					w = Math.max(parseInt(w) + (o.deltaWidth || 0), 100);

				if (re.test('' + h))
					h = Math.max(parseInt(h) + (o.deltaHeight || 0), 100);

				// Render UI
				o = t.theme.renderUI({
					targetNode : e,
					width : w,
					height : h,
					deltaWidth : s.delta_width,
					deltaHeight : s.delta_height
				});

				t.editorContainer = o.editorContainer;
			}

			// #ifdef contentEditable

			// Content editable mode ends here
			if (s.content_editable) {
				e = n = o = null; // Fix IE leak
				return t.setupContentEditable();
			}

			// #endif

			// User specified a document.domain value
			if (document.domain && location.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			// Resize editor
			DOM.setStyles(o.sizeContainer || o.editorContainer, {
				width : w,
				height : h
			});

			// Load specified content CSS last
			if (s.content_css) {
				tinymce.each(explode(s.content_css), function(u) {
					t.contentCSS.push(t.documentBaseURI.toAbsolute(u));
				});
			}

            //ATLASSIAN
            //we no longer have toolbars so we dont need to worry about this deltaHeight
            //to save people looking the deltaheight is made up of the toolbar heights - some magic number deep in the advanced theme. No fun.
            //so please leave this commented out
			//h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
			if (h < 100)
				h = 100;

            // ATLASSIAN - use the user's current base url for the iframe
			t.iframeHTML = s.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';

			// IE8 doesn't support carets behind images setting ie7_compat would force IE8+ to run in IE7 compat mode.
			if (s.ie7_compat)
				t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" />';
			else
				t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=edge" />';

			t.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			// Load the CSS by injecting them into the HTML this will reduce "flicker"
			for (i = 0; i < t.contentCSS.length; i++) {
				t.iframeHTML += '<link type="text/css" rel="stylesheet" href="' + t.contentCSS[i] + '" />';
			}
            // ATLASSIAN - we want to put our custom link tag markup into the frame
            if (s.contentCssTags) {
                t.iframeHTML += s.contentCssTags;
            }

			t.contentCSS = [];

			bi = s.body_id || 'tinymce';
			if (bi.indexOf('=') != -1) {
				bi = t.getParam('body_id', '', 'hash');
				bi = bi[t.id] || bi;
			}

			bc = s.body_class || '';
			if (bc.indexOf('=') != -1) {
				bc = t.getParam('body_class', '', 'hash');
				bc = bc[t.id] || '';
			}

			t.iframeHTML += '</head><body id="' + bi + '" class="mceContentBody aui-theme-default ' + bc + '" onload="window.parent.tinyMCE.get(\'' + t.id + '\').onLoad.dispatch();"><br></body></html>';

			// Domain relaxing enabled, then set document domain
			if (tinymce.relaxedDomain && (isIE || (tinymce.isOpera && parseFloat(opera.version()) < 11))) {
				// We need to write the contents here in IE since multiple writes messes up refresh button and back button
				u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";var ed = window.parent.tinyMCE.get("' + t.id + '");document.write(ed.iframeHTML);document.close();ed.setupIframe();})()';
			}

			s.iframe_attr = s.iframe_attr || {};
			s.iframe_attr = extend(s.iframe_attr, {
				id : t.id + "_ifr",
				src : u || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				allowTransparency : "true",
				title : s.aria_label,
				style : {
					width : '100%',
					height : h,
					display : 'block' // Important for Gecko to render the iframe correctly
				}
			});
			// Create iframe
			// TODO: ACC add the appropriate description on this.
			n = DOM.add(o.iframeContainer, 'iframe', s.iframe_attr);

			t.contentAreaContainer = o.iframeContainer;
			DOM.get(o.editorContainer).style.display = t.orgDisplay;
			DOM.get(t.id).style.display = 'none';
			DOM.setAttrib(t.id, 'aria-hidden', true);

			if (!tinymce.relaxedDomain || !u)
				t.setupIframe();

			e = n = o = null; // Cleanup
		},

		/**
		 * This method get called by the init method ones the iframe is loaded.
		 * It will fill the iframe with contents, setups DOM and selection objects for the iframe.
		 * This method should not be called directly.
		 *
		 * @method setupIframe
		 */
		setupIframe : function() {
			var t = this, s = t.settings, e = DOM.get(t.id), d = t.getDoc(), h, b;

			// Setup iframe body
			if (!isIE || !tinymce.relaxedDomain) {
				d.open();
				d.write(t.iframeHTML);
				d.close();

				if (tinymce.relaxedDomain)
					d.domain = tinymce.relaxedDomain;
			}

			// It will not steal focus while setting contentEditable
			b = t.getBody();
			b.disabled = true;

			if (!s.readonly)
				b.contentEditable = true;

			b.disabled = false;

			/**
			 * Schema instance, enables you to validate elements and it's children.
			 *
			 * @property schema
			 * @type tinymce.html.Schema
			 */
			t.schema = new tinymce.html.Schema(s);

			/**
			 * DOM instance for the editor.
			 *
			 * @property dom
			 * @type tinymce.dom.DOMUtils
			 * @example
			 * // Adds a class to all paragraphs within the editor
			 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'someclass');
			 */
			t.dom = new tinymce.dom.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				update_styles : 1,
				fix_ie_paragraphs : 1,
				schema : t.schema
			});

			/**
			 * HTML parser will be used when contents is inserted into the editor.
			 *
			 * @property parser
			 * @type tinymce.html.DomParser
			 */
			t.parser = new tinymce.html.DomParser(s, t.schema);

			// Force anchor names closed, unless the setting "allow_html_in_named_anchor" is explicitly included.
			if (!t.settings.allow_html_in_named_anchor) {
				t.parser.addAttributeFilter('name', function(nodes, name) {
					var i = nodes.length, sibling, prevSibling, parent, node;

					while (i--) {
						node = nodes[i];
						if (node.name === 'a' && node.firstChild) {
							parent = node.parent;

							// Move children after current node
							sibling = node.lastChild;
							do {
								prevSibling = sibling.prev;
								parent.insert(sibling, node);
								sibling = prevSibling;
							} while (sibling);
						}
					}
				});
			}

			// Convert src and href into data-mce-src, data-mce-href and data-mce-style
			t.parser.addAttributeFilter('src,href,style', function(nodes, name) {
				var i = nodes.length, node, dom = t.dom, value, internalName;

				while (i--) {
					node = nodes[i];
					value = node.attr(name);
					internalName = 'data-mce-' + name;

					// Add internal attribute if we need to we don't on a refresh of the document
					if (!node.attributes.map[internalName]) {
						if (name === "style")
							node.attr(internalName, dom.serializeStyle(dom.parseStyle(value), node.name));
						else
							node.attr(internalName, t.convertURL(value, name, node.name));
					}
				}
			});

			// Keep scripts from executing
			t.parser.addNodeFilter('script', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.attr('type', 'mce-' + (node.attr('type') || 'text/javascript'));
				}
			});

			t.parser.addNodeFilter('#cdata', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.type = 8;
					node.name = '#comment';
					node.value = '[CDATA[' + node.value + ']]';
				}
			});

			t.parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function(nodes, name) {
				var i = nodes.length, node, nonEmptyElements = t.schema.getNonEmptyElements();

				while (i--) {
					node = nodes[i];

					if (node.isEmpty(t.schema)) // ATLASSIAN: CONF-24365
						node.empty().append(new tinymce.html.Node('br', 1)).shortEnded = true;
				}
			});

			/**
			 * DOM serializer for the editor. Will be used when contents is extracted from the editor.
			 *
			 * @property serializer
			 * @type tinymce.dom.Serializer
			 * @example
			 * // Serializes the first paragraph in the editor into a string
			 * tinyMCE.activeEditor.serializer.serialize(tinyMCE.activeEditor.dom.select('p')[0]);
			 */
			t.serializer = new tinymce.dom.Serializer(s, t.dom, t.schema);

			/**
			 * Selection instance for the editor.
			 *
			 * @property selection
			 * @type tinymce.dom.Selection
			 * @example
			 * // Sets some contents to the current selection in the editor
			 * tinyMCE.activeEditor.selection.setContent('Some contents');
			 *
			 * // Gets the current selection
			 * alert(tinyMCE.activeEditor.selection.getContent());
			 *
			 * // Selects the first paragraph found
			 * tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
			 */
			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);

			/**
			 * Formatter instance.
			 *
			 * @property formatter
			 * @type tinymce.Formatter
			 */
			t.formatter = new tinymce.Formatter(this);

			// Register default formats
			t.formatter.register({
				alignleft : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'left'}},
                    {selector : 'img.confluence-embedded-image', classes : "image-left"}, // ATLASSIAN: introduce class to encompass default style and image margins
					{selector : 'img,table', collapsed : false, styles : {'float' : 'left'}}
				],

				aligncenter : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'center'}},
					//{selector : 'img', collapsed : false, styles : {display : 'block', marginLeft : 'auto', marginRight : 'auto'}},
                    {selector : 'img.confluence-embedded-image', classes : "image-center"}, // ATLASSIAN: introduce class to encompass default style and image margins
					{selector : 'table', collapsed : false, styles : {marginLeft : 'auto', marginRight : 'auto'}}
				],

				alignright : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'right'}},
                    {selector : 'img.confluence-embedded-image', classes : "image-right"}, // ATLASSIAN: introduce class to encompass default style and image margins
					{selector : 'img,table', collapsed : false, styles : {'float' : 'right'}}
				],

				alignfull : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'justify'}}
				],

				bold : [
					{inline : 'strong', remove : 'all'},
					{inline : 'span', styles : {fontWeight : 'bold'}},
					{inline : 'b', remove : 'all'}
				],

				italic : [
					{inline : 'em', remove : 'all'},
					{inline : 'span', styles : {fontStyle : 'italic'}},
					{inline : 'i', remove : 'all'}
				],

				underline : [
					{inline : 'u', remove : 'all'},
					{inline : 'span', styles : {textDecoration : 'underline'}, exact : true} //ATLASSIAN: prefer semantic tag over inline style
				],

				strikethrough : [
//					{inline : 'span', styles : {textDecoration : 'line-through'}, exact : true}, ATLASSIAN: prefer semantic tag over inline style
					{inline : 's', remove : 'all'} // ATLASSIAN: use S instead of STRIKE
				],

				forecolor : {inline : 'span', styles : {color : '%value'}, wrap_links : false},
				hilitecolor : {inline : 'span', styles : {backgroundColor : '%value'}, wrap_links : false},
				fontname : {inline : 'span', styles : {fontFamily : '%value'}},
				fontsize : {inline : 'span', styles : {fontSize : '%value'}},
				fontsize_class : {inline : 'span', attributes : {'class' : '%value'}},
				blockquote : {block : 'blockquote', wrapper : 1, remove : 'all'},
				subscript : {inline : 'sub'},
				superscript : {inline : 'sup'},

				link : {inline : 'a', selector : 'a', remove : 'all', split : true, deep : true,
					onmatch : function(node) {
						return true;
					},

					onformat : function(elm, fmt, vars) {
						each(vars, function(value, key) {
							t.dom.setAttrib(elm, key, value);
						});
					}
				},

				removeformat : [
					{selector : 'b,strong,em,i,font,u,strike', remove : 'all', split : true, expand : false, block_expand : true, deep : true},
					{selector : 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true},
					{selector : '*', attributes : ['style', 'class'], split : false, expand : false, deep : true}
				]
			});

			// Register default block formats
			each('p h1 h2 h3 h4 h5 h6 div address pre div code dt dd samp'.split(/\s/), function(name) {
				t.formatter.register(name, {block : name, remove : 'all'});
			});

			// Register user defined formats
			t.formatter.register(t.settings.formats);

			/**
			 * Undo manager instance, responsible for handling undo levels.
			 *
			 * @property undoManager
			 * @type tinymce.UndoManager
			 * @example
			 * // Undoes the last modification to the editor
			 * tinyMCE.activeEditor.undoManager.undo();
			 */
			t.undoManager = new tinymce.UndoManager(t);

			// Pass through
			t.undoManager.onAdd.add(function(um, l) {
				if (um.hasUndo())
					return t.onChange.dispatch(t, l, um);
			});

			t.undoManager.onUndo.add(function(um, l) {
				return t.onUndo.dispatch(t, l, um);
			});

			t.undoManager.onRedo.add(function(um, l) {
				return t.onRedo.dispatch(t, l, um);
			});

			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});

			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			AJS.log("Editor:setupIframe: dispatch onPreInit");
			t.onPreInit.dispatch(t);

			if (!s.gecko_spellcheck)
				t.getBody().spellcheck = 0;

			if (!s.readonly)
				t._addEvents();

			AJS.log("Editor:setupIframe: dispatch controlManager onPostRender");
			t.controlManager.onPostRender.dispatch(t, t.controlManager);

			AJS.log("Editor:setupIframe: dispatch onPostRender");
			t.onPostRender.dispatch(t);

			t.quirks = new tinymce.util.Quirks(this);

			if (s.directionality)
				t.getBody().dir = s.directionality;

			if (s.nowrap)
				t.getBody().style.whiteSpace = "nowrap";

			if (s.handle_node_change_callback) {
				t.onNodeChange.add(function(ed, cm, n) {
					t.execCallback('handle_node_change_callback', t.id, n, -1, -1, true, t.selection.isCollapsed());
				});
			}

			if (s.save_callback) {
				t.onSaveContent.add(function(ed, o) {
					var h = t.execCallback('save_callback', t.id, o.content, t.getBody());

					if (h)
						o.content = h;
				});
			}

			if (s.onchange_callback) {
				t.onChange.add(function(ed, l) {
					t.execCallback('onchange_callback', t, l);
				});
			}

			if (s.protect) {
				t.onBeforeSetContent.add(function(ed, o) {
					if (s.protect) {
						each(s.protect, function(pattern) {
							o.content = o.content.replace(pattern, function(str) {
								return '<!--mce:protected ' + escape(str) + '-->';
							});
						});
					}
				});
			}

			if (s.convert_newlines_to_brs) {
				t.onBeforeSetContent.add(function(ed, o) {
					if (o.initial)
						o.content = o.content.replace(/\r?\n/g, '<br />');
				});
			}

			if (s.preformatted) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^\s*<pre.*?>/, '');
					o.content = o.content.replace(/<\/pre>\s*$/, '');

					if (o.set)
						o.content = '<pre class="mceItemHidden">' + o.content + '</pre>';
				});
			}

			if (s.verify_css_classes) {
				t.serializer.attribValueFilter = function(n, v) {
					var s, cl;

					if (n == 'class') {
						// Build regexp for classes
						if (!t.classesRE) {
							cl = t.dom.getClasses();

							if (cl.length > 0) {
								s = '';

								each (cl, function(o) {
									s += (s ? '|' : '') + o['class'];
								});

								t.classesRE = new RegExp('(' + s + ')', 'gi');
							}
						}

						return !t.classesRE || /(\bmceItem\w+\b|\bmceTemp\w+\b)/g.test(v) || t.classesRE.test(v) ? v : '';
					}

					return v;
				};
			}

			if (s.cleanup_callback) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);
				});

				t.onPreProcess.add(function(ed, o) {
					if (o.set)
						t.execCallback('cleanup_callback', 'insert_to_editor_dom', o.node, o);

					if (o.get)
						t.execCallback('cleanup_callback', 'get_from_editor_dom', o.node, o);
				});

				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);

					if (o.get)
						o.content = t.execCallback('cleanup_callback', 'get_from_editor', o.content, o);
				});
			}

			if (s.save_callback) {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = t.execCallback('save_callback', t.id, o.content, t.getBody());
				});
			}

			if (s.handle_event_callback) {
				t.onEvent.add(function(ed, e, o) {
					if (t.execCallback('handle_event_callback', e, ed, o) === false)
						Event.cancel(e);
				});
			}

			// Add visual aids when new contents is added
			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			// Remove empty contents
			if (s.padd_empty_editor) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			if (isGecko) {
				// Fix gecko link bug, when a link is placed at the end of block elements there is
				// no way to move the caret behind the link. This fix adds a bogus br element after the link
				function fixLinks(ed, o) {
					each(ed.dom.select('a'), function(n) {
						var pn = n.parentNode;

						if (ed.dom.isBlock(pn) && pn.lastChild === n)
							ed.dom.add(pn, 'br', {'data-mce-bogus' : 1});
					});
				};

				t.onExecCommand.add(function(ed, cmd) {
					if (cmd === 'CreateLink')
						fixLinks(ed);
				});

				t.onSetContent.add(t.selection.onSetContent.add(fixLinks));
			}

			t.load({initial : true, format : 'html'});
			t.startContent = t.getContent({format : 'raw'});
			t.undoManager.add();
			/**
			 * Is set to true after the editor instance has been initialized
			 *
			 * @property initialized
			 * @type Boolean
			 * @example
			 * function isEditorInitialized(editor) {
			 *     return editor && editor.initialized;
			 * }
			 */
			t.initialized = true;

			AJS.log("Editor:setupIframe: dispatch onInit");
			t.onInit.dispatch(t);
			AJS.log("Editor:setupIframe: Callback setupcontent_callback");
			t.execCallback('setupcontent_callback', t.id, t.getBody(), t.getDoc());
			AJS.log("Editor:setupIframe: Completed setupcontent_callback");
			AJS.log("Editor:setupIframe: Callback init_instance_callback");
			t.execCallback('init_instance_callback', t);
			AJS.log("Editor:setupIframe: Completed init_instance_callback");
			t.focus(true);
			t.nodeChanged({initial : 1});
			// Load specified content CSS last
			each(t.contentCSS, function(u) {
				t.dom.loadCSS(u);
			});

			// Handle auto focus
			if (s.auto_focus) {
				setTimeout(function () {
					var ed = tinymce.get(s.auto_focus);

					ed.selection.select(ed.getBody(), 1);
					ed.selection.collapse(1);
					ed.getBody().focus();
					ed.getWin().focus();
				}, 100);
			}

			e = null;
		},

		// #ifdef contentEditable

		/**
		 * Sets up the contentEditable mode.
		 *
		 * @method setupContentEditable
		 */
		setupContentEditable : function() {
			var t = this, s = t.settings, e = t.getElement();

			t.contentDocument = s.content_document || document;
			t.contentWindow = s.content_window || window;
			t.bodyElement = e;

			// Prevent leak in IE
			s.content_document = s.content_window = null;

			DOM.hide(e);
			e.contentEditable = t.getParam('content_editable_state', true);
			DOM.show(e);

			if (!s.gecko_spellcheck)
				t.getDoc().body.spellcheck = 0;

			// Setup objects
			t.dom = new tinymce.dom.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				root_element : t.id,
				fix_ie_paragraphs : 1,
				update_styles : 1
			});

			t.serializer = new tinymce.dom.Serializer(s, t.dom, schema);

			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);
			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});

			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			t.onPreInit.dispatch(t);
			t._addEvents();

			t.controlManager.onPostRender.dispatch(t, t.controlManager);
			t.onPostRender.dispatch(t);

			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			//t.load({initial : true, format : (s.cleanup_on_startup ? 'html' : 'raw')});
			t.startContent = t.getContent({format : 'raw'});
			t.undoManager.add({initial : true});
			t.initialized = true;

			t.onInit.dispatch(t);
			t.focus(true);
			t.nodeChanged({initial : 1});

			// Load specified content CSS last
			if (s.content_css) {
				each(explode(s.content_css), function(u) {
					t.dom.loadCSS(t.documentBaseURI.toAbsolute(u));
				});
			}

			if (isIE) {
				// Store away selection
				t.dom.bind(t.getElement(), 'beforedeactivate', function() {
					t.lastSelectionBookmark = t.selection.getBookmark(1);
				});

				t.onBeforeExecCommand.add(function(ed, cmd, ui, val, o) {
					if (!DOM.getParent(ed.selection.getStart(), function(n) {return n == ed.getBody();}))
						o.terminate = 1;

					if (!DOM.getParent(ed.selection.getEnd(), function(n) {return n == ed.getBody();}))
						o.terminate = 1;
				});
			}

			e = null; // Cleanup
		},

		// #endif

		/**
		 * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
		 * it will also place DOM focus inside the editor.
		 *
		 * @method focus
		 * @param {Boolean} sf Skip DOM focus. Just set is as the active editor.
		 */
		focus : function(sf) {
            var oed, t = this, selection = t.selection, ce = t.settings.content_editable, ieRng, controlElm, doc = t.getDoc(),
                win, vp;

			if (!sf) {
				// Get selected control element
				ieRng = selection.getRng();
				if (ieRng.item) {
					controlElm = ieRng.item(0);
				}

				t._refreshContentEditable();

				// Is not content editable
				if (!ce) {
                    // ATLASSIAN CONFDDEV-6815 & CONFDEV-7399 IE focuses the body if there are multiple contenteditables and you call window.focus().
                    if (tinymce.isIE) {
                        try{
                            win = this.getWin();
                            vp = DOM.getViewPort(win);
                            t.dom.getRoot().focus();
                            win.scrollTo(vp.x, vp.y);
                        } catch (e){
                            //fails when editor isn't yet visible (instant comment/edit initilization)
                        }
                    } else {
                        t.getWin().focus();
                    }
				}

				// Focus the body as well since it's contentEditable
				if (tinymce.isGecko) {
					t.getBody().focus();
				}

				// Restore selected control element
				// This is needed when for example an image is selected within a
				// layer a call to focus will then remove the control selection
				if (controlElm && controlElm.ownerDocument == doc) {
					ieRng = doc.body.createControlRange();
					ieRng.addElement(controlElm);
					ieRng.select();
				}

				// #ifdef contentEditable

				// Content editable mode ends here
				if (ce) {
					if (tinymce.isWebKit)
						t.getWin().focus();
					else {
						if (tinymce.isIE)
							t.getElement().setActive();
						else
							t.getElement().focus();
					}
				}

				// #endif
			}

			if (tinymce.activeEditor != t) {
				if ((oed = tinymce.activeEditor) != null)
					oed.onDeactivate.dispatch(oed, t);

				t.onActivate.dispatch(t, oed);
			}

			tinymce._setActive(t);
		},

		/**
		 * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
		 * There new event model is a better way to add callback so this method might be removed in the future.
		 *
		 * @method execCallback
		 * @param {String} n Name of the callback to execute.
		 * @return {Object} Return value passed from callback function.
		 */
		execCallback : function(n) {
			var t = this, f = t.settings[n], s;

			if (!f)
				return;

			// Look through lookup
			if (t.callbackLookup && (s = t.callbackLookup[n])) {
				f = s.func;
				s = s.scope;
			}

			if (is(f, 'string')) {
				s = f.replace(/\.\w+$/, '');
				s = s ? tinymce.resolve(s) : 0;
				f = tinymce.resolve(f);
				t.callbackLookup = t.callbackLookup || {};
				t.callbackLookup[n] = {func : f, scope : s};
			}

			return f.apply(s || t, Array.prototype.slice.call(arguments, 1));
		},

		/**
		 * Translates the specified string by replacing variables with language pack items it will also check if there is
		 * a key mathcin the input.
		 *
		 * @method translate
		 * @param {String} s String to translate by the language pack data.
		 * @return {String} Translated string.
		 */
		translate : function(s) {
			var c = this.settings.language || 'en', i18n = tinymce.i18n;

			if (!s)
				return '';

			return i18n[c + '.' + s] || s.replace(/{\#([^}]+)\}/g, function(a, b) {
				return i18n[c + '.' + b] || '{#' + b + '}';
			});
		},

		/**
		 * Returns a language pack item by name/key.
		 *
		 * @method getLang
		 * @param {String} n Name/key to get from the language pack.
		 * @param {String} dv Optional default value to retrive.
		 */
		getLang : function(n, dv) {
			return tinymce.i18n[(this.settings.language || 'en') + '.' + n] || (is(dv) ? dv : '{#' + n + '}');
		},

		/**
		 * Returns a configuration parameter by name.
		 *
		 * @method getParam
		 * @param {String} n Configruation parameter to retrive.
		 * @param {String} dv Optional default value to return.
		 * @param {String} ty Optional type parameter.
		 * @return {String} Configuration parameter value or default value.
		 * @example
		 * // Returns a specific config value from the currently active editor
		 * var someval = tinyMCE.activeEditor.getParam('myvalue');
		 *
		 * // Returns a specific config value from a specific editor instance by id
		 * var someval2 = tinyMCE.get('my_editor').getParam('myvalue');
		 */
		getParam : function(n, dv, ty) {
			var tr = tinymce.trim, v = is(this.settings[n]) ? this.settings[n] : dv, o;

			if (ty === 'hash') {
				o = {};

				if (is(v, 'string')) {
					each(v.indexOf('=') > 0 ? v.split(/[;,](?![^=;,]*(?:[;,]|$))/) : v.split(','), function(v) {
						v = v.split('=');

						if (v.length > 1)
							o[tr(v[0])] = tr(v[1]);
						else
							o[tr(v[0])] = tr(v);
					});
				} else
					o = v;

				return o;
			}

			return v;
		},

		/**
		 * Distpaches out a onNodeChange event to all observers. This method should be called when you
		 * need to update the UI states or element path etc.
		 *
		 * @method nodeChanged
		 * @param {Object} o Optional object to pass along for the node changed event.
		 */
		nodeChanged : function(o) {
			var t = this, s = t.selection, n = s.getStart() || t.getBody();

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (t.initialized) {
				o = o || {};
				n = isIE && n.ownerDocument != t.getDoc() ? t.getBody() : n; // Fix for IE initial state

				// Get parents and add them to object
				o.parents = [];
				t.dom.getParent(n, function(node) {
					if (node.nodeName == 'BODY')
						return true;

					o.parents.push(node);
				});

				t.onNodeChange.dispatch(
					t,
					o ? o.controlManager || t.controlManager : t.controlManager,
					n,
					s.isCollapsed(),
					o
				);
			}
		},

		/**
		 * Adds a button that later gets created by the ControlManager. This is a shorter and easier method
		 * of adding buttons without the need to deal with the ControlManager directly. But it's also less
		 * powerfull if you need more control use the ControlManagers factory methods instead.
		 *
		 * @method addButton
		 * @param {String} n Button name to add.
		 * @param {Object} s Settings object with title, cmd etc.
		 * @example
		 * // Adds a custom button to the editor and when a user clicks the button it will open
		 * // an alert box with the selected contents as plain text.
		 * tinyMCE.init({
		 *    ...
		 *
		 *    theme_advanced_buttons1 : 'example,..'
		 *
		 *    setup : function(ed) {
		 *       // Register example button
		 *       ed.addButton('example', {
		 *          title : 'example.desc',
		 *          image : '../jscripts/tiny_mce/plugins/example/img/example.gif',
		 *          onclick : function() {
		 *             ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format : 'text'}));
		 *          }
		 *       });
		 *    }
		 * });
		 */
		addButton : function(n, s) {
			var t = this;

			t.buttons = t.buttons || {};
			t.buttons[n] = s;
		},

		/**
		 * Adds a custom command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with execCommand.
		 *
		 * @method addCommand
		 * @param {String} name Command name to add/override.
		 * @param {addCommandCallback} callback Function to execute when the command occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 * @example
		 * // Adds a custom command that later can be executed using execCommand
		 * tinyMCE.init({
		 *    ...
		 *
		 *    setup : function(ed) {
		 *       // Register example command
		 *       ed.addCommand('mycommand', function(ui, v) {
		 *          ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format : 'text'}));
		 *       });
		 *    }
		 * });
		 */
		addCommand : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a command is executed.
			 *
			 * @callback addCommandCallback
			 * @param {Boolean} ui Display UI state true/false.
			 * @param {Object} value Optional value for command.
			 * @return {Boolean} True/false state if the command was handled or not.
			 */
			this.execCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a custom query state command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandState function.
		 *
		 * @method addQueryStateHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryStateHandler : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandState is executed.
			 *
			 * @callback addQueryStateHandlerCallback
			 * @return {Boolean} True/false state if the command is enabled or not like is it bold.
			 */
			this.queryStateCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a custom query value command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandValue function.
		 *
		 * @method addQueryValueHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryValueHandler : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandValue is executed.
			 *
			 * @callback addQueryValueHandlerCallback
			 * @return {Object} Value of the command or undefined.
			 */
			this.queryValueCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a keyboard shortcut for some command or function.
		 *
		 * @method addShortcut
		 * @param {String} pa Shortcut pattern. Like for example: ctrl+alt+o.
		 * @param {String} desc Text description for the command.
		 * @param {String/Function} cmd_func Command name string or function to execute when the key is pressed.
		 * @param {Object} sc Optional scope to execute the function in.
		 * @return {Boolean} true/false state if the shortcut was added or not.
		 */
		addShortcut : function(pa, desc, cmd_func, sc) {
			var t = this, c;

			if (!t.settings.custom_shortcuts)
				return false;

			t.shortcuts = t.shortcuts || {};

			if (is(cmd_func, 'string')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c, false, null);
				};
			}

			if (is(cmd_func, 'object')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c[0], c[1], c[2]);
				};
			}

			each(explode(pa), function(pa) {
				var o = {
					func : cmd_func,
					scope : sc || this,
					desc : desc,
					alt : false,
					ctrl : false,
					shift : false
				};

				each(explode(pa, '+'), function(v) {
					switch (v) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							o[v] = true;
							break;

						default:
							o.charCode = v.charCodeAt(0);
							o.keyCode = v.toUpperCase().charCodeAt(0);
					}
				});

				t.shortcuts[(o.ctrl ? 'ctrl' : '') + ',' + (o.alt ? 'alt' : '') + ',' + (o.shift ? 'shift' : '') + ',' + o.keyCode] = o;
			});

			return true;
		},

		/**
		 * Executes a command on the current instance. These commands can be TinyMCE internal commands prefixed with "mce" or
		 * they can be build in browser commands such as "Bold". A compleate list of browser commands is available on MSDN or Mozilla.org.
		 * This function will dispatch the execCommand function on each plugin, theme or the execcommand_callback option if none of these
		 * return true it will handle the command as a internal browser command.
		 *
		 * @method execCommand
		 * @param {String} cmd Command name to execute, for example mceLink or Bold.
		 * @param {Boolean} ui True/false state if a UI (dialog) should be presented or not.
		 * @param {mixed} val Optional command value, this can be anything.
		 * @param {Object} a Optional arguments object.
		 * @return {Boolean} True/false if the command was executed or not.
		 */
		execCommand : function(cmd, ui, val, a) {
			var t = this, s = 0, o, st;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(cmd) && (!a || !a.skip_focus))
				t.focus();

			// ATLASSIAN
			a = extend({}, a);
			t.onBeforeExecCommand.dispatch(t, cmd, ui, val, a);
			if (a.terminate)
				return false;

			// Command callback
			if (t.execCallback('execcommand_callback', t.id, t.selection.getNode(), cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Registred commands
			if (o = t.execCommands[cmd]) {
				st = o.func.call(o.scope, ui, val);

				// Fall through on true
				if (st !== true) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					return st;
				}
			}

			// Plugin commands
			each(t.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, val)) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					s = 1;
					return false;
				}
			});

			if (s)
				return true;

			// Theme commands
			if (t.theme && t.theme.execCommand && t.theme.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Editor commands
			if (t.editorCommands.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Browser commands
			t.getDoc().execCommand(cmd, ui, val);
			t.onExecCommand.dispatch(t, cmd, ui, val, a);
		},

		/**
		 * Returns a command specific state, for example if bold is enabled or not.
		 *
		 * @method queryCommandState
		 * @param {string} cmd Command to query state from.
		 * @return {Boolean} Command specific state, for example if bold is enabled or not.
		 */
		queryCommandState : function(cmd) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryStateCommands[cmd]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandState(cmd);
			if (o !== -1)
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandState(cmd);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Returns a command specific value, for example the current font size.
		 *
		 * @method queryCommandValue
		 * @param {string} c Command to query value from.
		 * @return {Object} Command specific value, for example the current font size.
		 */
		queryCommandValue : function(c) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryValueCommands[c]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandValue(c);
			if (is(o))
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandValue(c);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Shows the editor and hides any textarea/div that the editor is supposed to replace.
		 *
		 * @method show
		 */
		show : function() {
			var t = this;

			DOM.show(t.getContainer());
			DOM.hide(t.id);
			t.load();
		},

		/**
		 * Hides the editor and shows any textarea/div that the editor is supposed to replace.
		 *
		 * @method hide
		 */
		hide : function() {
			var t = this, d = t.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE && d)
				d.execCommand('SelectAll');

			// We must save before we hide so Safari doesn't crash
			t.save();
			DOM.hide(t.getContainer());
			DOM.setStyle(t.id, 'display', t.orgDisplay);
		},

		/**
		 * Returns true/false if the editor is hidden or not.
		 *
		 * @method isHidden
		 * @return {Boolean} True/false if the editor is hidden or not.
		 */
		isHidden : function() {
			return !DOM.isHidden(this.id);
		},

		/**
		 * Sets the progress state, this will display a throbber/progess for the editor.
		 * This is ideal for asycronous operations like an AJAX save call.
		 *
		 * @method setProgressState
		 * @param {Boolean} b Boolean state if the progress should be shown or hidden.
		 * @param {Number} ti Optional time to wait before the progress gets shown.
		 * @param {Object} o Optional object to pass to the progress observers.
		 * @return {Boolean} Same as the input state.
		 * @example
		 * // Show progress for the active editor
		 * tinyMCE.activeEditor.setProgressState(true);
		 *
		 * // Hide progress for the active editor
		 * tinyMCE.activeEditor.setProgressState(false);
		 *
		 * // Show progress after 3 seconds
		 * tinyMCE.activeEditor.setProgressState(true, 3000);
		 */
		setProgressState : function(b, ti, o) {
			this.onSetProgressState.dispatch(this, b, ti, o);

			return b;
		},

		/**
		 * Loads contents from the textarea or div element that got converted into an editor instance.
		 * This method will move the contents from that textarea or div into the editor by using setContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method load
		 * @param {Object} o Optional content object, this gets passed around through the whole load process.
		 * @return {String} HTML string that got set into the editor.
		 */
		load : function(o) {
			var t = this, e = t.getElement(), h;

			if (e) {
				o = o || {};
				o.load = true;

				// Double encode existing entities in the value
				h = t.setContent(is(e.value) ? e.value : e.innerHTML, o);
				o.element = e;

				if (!o.no_events)
					t.onLoadContent.dispatch(t, o);

				o.element = e = null;

				return h;
			}
		},

		/**
		 * Saves the contents from a editor out to the textarea or div element that got converted into an editor instance.
		 * This method will move the HTML contents from the editor into that textarea or div by getContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method save
		 * @param {Object} o Optional content object, this gets passed around through the whole save process.
		 * @return {String} HTML string that got set into the textarea/div.
		 */
		save : function(o) {
			var t = this, e = t.getElement(), h, f;

			if (!e || !t.initialized)
				return;

			o = o || {};
			o.save = true;

            // ATLASSIAN - CONFDEV-21949
            // Sometimes a WrongDocumentError can be thrown, and if not caught will cause content loss because
            // the textarea won't have its value updated to the editor content.
            try {
                if (!o.no_events) {
                    t.undoManager.typing = false;
                    t.undoManager.add();
                }
            } catch(e) {
                AJS.logError("editor.save() : " + e);
            }

			o.element = e;
			h = o.content = t.getContent(o);

			if (!o.no_events)
				t.onSaveContent.dispatch(t, o);

			h = o.content;

			if (!/TEXTAREA|INPUT/i.test(e.nodeName)) {
				e.innerHTML = h;

				// Update hidden form element
				if (f = DOM.getParent(t.id, 'form')) {
					each(f.elements, function(e) {
						if (e.name == t.id) {
							e.value = h;
							return false;
						}
					});
				}
			} else
				e.value = h;

			o.element = e = null;

			return h;
		},

		/**
		 * Sets the specified content to the editor instance, this will cleanup the content before it gets set using
		 * the different cleanup rules options.
		 *
		 * @method setContent
		 * @param {String} content Content to set to editor, normally HTML contents but can be other formats as well.
		 * @param {Object} args Optional content object, this gets passed around through the whole set process.
		 * @return {String} HTML string that got set into the editor.
		 * @example
		 * // Sets the HTML contents of the activeEditor editor
		 * tinyMCE.activeEditor.setContent('<span>some</span> html');
		 *
		 * // Sets the raw contents of the activeEditor editor
		 * tinyMCE.activeEditor.setContent('<span>some</span> html', {format : 'raw'});
		 *
		 * // Sets the content of a specific editor (my_editor in this example)
		 * tinyMCE.get('my_editor').setContent(data);
		 *
		 * // Sets the bbcode contents of the activeEditor editor if the bbcode plugin was added
		 * tinyMCE.activeEditor.setContent('[b]some[/b] html', {format : 'bbcode'});
		 */
		setContent : function(content, args) {
			var self = this, rootNode, body = self.getBody(), forcedRootBlockName;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.set = true;
			args.content = content;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeSetContent.dispatch(self, args);

			content = args.content;

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (!tinymce.isIE && (content.length === 0 || /^\s+$/.test(content))) {
				forcedRootBlockName = self.settings.forced_root_block;
				if (forcedRootBlockName)
					content = '<' + forcedRootBlockName + '><br data-mce-bogus="1"></' + forcedRootBlockName + '>';
				else
					content = '<br data-mce-bogus="1">';

				body.innerHTML = content;
				self.selection.select(body, true);
				self.selection.collapse(true);
				// ATLASSIAN - we want setContent events so continue relates to testing of CONFDEV-16140.
				//return;
			}

			// Parse and serialize the html
			if (args.format !== 'raw') {
				content = new tinymce.html.Serializer({}, self.schema).serialize(
					self.parser.parse(content)
				);
			}

			// Set the new cleaned contents to the editor
			args.content = tinymce.trim(content);
			self.dom.setHTML(body, args.content);

			// Do post processing
			if (!args.no_events)
				self.onSetContent.dispatch(self, args);

			self.selection.normalize();

			return args.content;
		},

		/**
		 * Gets the content from the editor instance, this will cleanup the content before it gets returned using
		 * the different cleanup rules options.
		 *
		 * @method getContent
		 * @param {Object} args Optional content object, this gets passed around through the whole get process.
		 * @return {String} Cleaned content string, normally HTML contents.
		 * @example
		 * // Get the HTML contents of the currently active editor
		 * console.debug(tinyMCE.activeEditor.getContent());
		 *
		 * // Get the raw contents of the currently active editor
		 * tinyMCE.activeEditor.getContent({format : 'raw'});
		 *
		 * // Get content of a specific editor:
		 * tinyMCE.get('content id').getContent()
		 */
		getContent : function(args) {
			var self = this, content;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.get = true;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeGetContent.dispatch(self, args);

			// Get raw contents or by default the cleaned contents
			if (args.format == 'raw')
				content = self.getBody().innerHTML;
			else
				content = self.serializer.serialize(self.getBody(), args);

			args.content = tinymce.trim(content);

			// Do post processing
			if (!args.no_events)
				self.onGetContent.dispatch(self, args);

			return args.content;
		},

		/**
		 * Returns true/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 *
		 * @method isDirty
		 * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 * @example
		 * if (tinyMCE.activeEditor.isDirty())
		 *     alert("You must save your contents.");
		 */
		isDirty : function() {
			var self = this;

			return tinymce.trim(self.startContent) != tinymce.trim(self.getContent({format : 'raw', no_events : 1})) && !self.isNotDirty;
		},

        //ATLASSIAN - this method was available in older versions, but we still need it
		setDirty : function(dirty) {
            var t = this;

            t.isNotDirty = dirty ? 0 : 1;
        },

		/**
		 * Returns the editors container element. The container element wrappes in
		 * all the elements added to the page for the editor. Such as UI, iframe etc.
		 *
		 * @method getContainer
		 * @return {Element} HTML DOM element for the editor container.
		 */
		getContainer : function() {
			var t = this;

			if (!t.container)
				t.container = DOM.get(t.editorContainer || t.id + '_parent');

			return t.container;
		},

		/**
		 * Returns the editors content area container element. The this element is the one who
		 * holds the iframe or the editable element.
		 *
		 * @method getContentAreaContainer
		 * @return {Element} HTML DOM element for the editor area container.
		 */
		getContentAreaContainer : function() {
			return this.contentAreaContainer;
		},

		/**
		 * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
		 *
		 * @method getElement
		 * @return {Element} HTML DOM element for the replaced element.
		 */
		getElement : function() {
			return DOM.get(this.settings.content_element || this.id);
		},

		/**
		 * Returns the iframes window object.
		 *
		 * @method getWin
		 * @return {Window} Iframe DOM window object.
		 */
		getWin : function() {
			var t = this, e;

			if (!t.contentWindow) {
				e = DOM.get(t.id + "_ifr");

				if (e)
					t.contentWindow = e.contentWindow;
			}

			return t.contentWindow;
		},

		/**
		 * Returns the iframes document object.
		 *
		 * @method getDoc
		 * @return {Document} Iframe DOM document object.
		 */
		getDoc : function() {
			var t = this, w;

			if (!t.contentDocument) {
				w = t.getWin();

				if (w)
					t.contentDocument = w.document;
			}

			return t.contentDocument;
		},

		/**
		 * Returns the iframes body element.
		 *
		 * @method getBody
		 * @return {Element} Iframe body element.
		 */
		getBody : function() {
			return this.bodyElement || this.getDoc().body;
		},

		/**
		 * URL converter function this gets executed each time a user adds an img, a or
		 * any other element that has a URL in it. This will be called both by the DOM and HTML
		 * manipulation functions.
		 *
		 * @method convertURL
		 * @param {string} u URL to convert.
		 * @param {string} n Attribute name src, href etc.
		 * @param {string/HTMLElement} Tag name or HTML DOM element depending on HTML or DOM insert.
		 * @return {string} Converted URL string.
		 */
		convertURL : function(u, n, e) {
			var t = this, s = t.settings;

			// Use callback instead
			if (s.urlconverter_callback)
				return t.execCallback('urlconverter_callback', u, e, true, n);

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!s.convert_urls || (e && e.nodeName == 'LINK') || u.indexOf('file:') === 0)
				return u;

			// Convert to relative
			if (s.relative_urls)
				return t.documentBaseURI.toRelative(u);

			// Convert to absolute
			u = t.documentBaseURI.toAbsolute(u, s.remove_script_host);

			return u;
		},

		/**
		 * Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.
		 *
		 * @method addVisual
		 * @param {Element} e Optional root element to loop though to find tables etc that needs the visual aid.
		 */
		addVisual : function(e) {
			var t = this, s = t.settings;

			e = e || t.getBody();

			if (!is(t.hasVisual))
				t.hasVisual = s.visual;

			each(t.dom.select('table,a', e), function(e) {
				var v;

				switch (e.nodeName) {
					case 'TABLE':
						v = t.dom.getAttrib(e, 'border');

						if (!v || v == '0') {
							if (t.hasVisual)
								t.dom.addClass(e, s.visual_table_class);
							else
								t.dom.removeClass(e, s.visual_table_class);
						}

						return;

					case 'A':
						v = t.dom.getAttrib(e, 'name');

						if (v) {
							if (t.hasVisual)
								t.dom.addClass(e, 'mceItemAnchor');
							else
								t.dom.removeClass(e, 'mceItemAnchor');
						}

						return;
				}
			});

			t.onVisualAid.dispatch(t, e, t.hasVisual);
		},

		/**
		 * Removes the editor from the dom and tinymce collection.
		 *
		 * @method remove
		 */
		remove : function() {
			var t = this, e = t.getContainer();

			t.removed = 1; // Cancels post remove event execution
			t.hide();

			t.execCallback('remove_instance_callback', t);
			t.onRemove.dispatch(t);

			// Clear all execCommand listeners this is required to avoid errors if the editor was removed inside another command
			t.onExecCommand.listeners = [];

			tinymce.remove(t);
			DOM.remove(e);
		},

		/**
		 * Destroys the editor instance by removing all events, element references or other resources
		 * that could leak memory. This method will be called automatically when the page is unloaded
		 * but you can also call it directly if you know what you are doing.
		 *
		 * @method destroy
		 * @param {Boolean} s Optional state if the destroy is an automatic destroy or user called one.
		 */
		destroy : function(s) {
			var t = this;

			// One time is enough
			if (t.destroyed)
				return;

			if (!s) {
				tinymce.removeUnload(t.destroy);
				tinyMCE.onBeforeUnload.remove(t._beforeUnload);

				// Manual destroy
				if (t.theme && t.theme.destroy)
					t.theme.destroy();

				// Destroy controls, selection and dom
				t.controlManager.destroy();
				t.selection.destroy();
				t.dom.destroy();

				// Remove all events

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!t.settings.content_editable) {
					Event.clear(t.getWin());
					Event.clear(t.getDoc());
				}

				Event.clear(t.getBody());
				Event.clear(t.formElement);
			}

			if (t.formElement) {
				t.formElement.submit = t.formElement._mceOldSubmit;
				t.formElement._mceOldSubmit = null;
			}

			t.contentAreaContainer = t.formElement = t.container = t.settings.content_element = t.bodyElement = t.contentDocument = t.contentWindow = null;

			if (t.selection)
				t.selection = t.selection.win = t.selection.dom = t.selection.dom.doc = null;

			t.destroyed = 1;
		},

		// Internal functions

		_addEvents : function() {
			// 'focus', 'blur', 'dblclick', 'beforedeactivate', submit, reset
			var t = this, i, s = t.settings, dom = t.dom, lo = {
				mouseup : 'onMouseUp',
				mousedown : 'onMouseDown',
				click : 'onClick',
				keyup : 'onKeyUp',
				keydown : 'onKeyDown',
				keypress : 'onKeyPress',
				submit : 'onSubmit',
				reset : 'onReset',
				contextmenu : 'onContextMenu',
				dblclick : 'onDblClick',
				paste : 'onPaste' // Doesn't work in all browsers yet
			};

			function eventHandler(e, o) {
				var ty = e.type;

				// Don't fire events when it's removed
				if (t.removed)
					return;

				// Generic event handler
				if (t.onEvent.dispatch(t, e, o) !== false) {
					// Specific event handler
					t[lo[e.fakeType || e.type]].dispatch(t, e, o);
				}
			};

			// Add DOM events
			each(lo, function(v, k) {
				switch (k) {
					case 'contextmenu':
						dom.bind(t.getDoc(), k, eventHandler);
						break;

					case 'paste':
						dom.bind(t.getBody(), k, function(e) {
							eventHandler(e);
						});
						break;

					case 'submit':
					case 'reset':
						dom.bind(t.getElement().form || DOM.getParent(t.id, 'form'), k, eventHandler);
						break;

					default:
						dom.bind(s.content_editable ? t.getBody() : t.getDoc(), k, eventHandler);
				}
			});

			dom.bind(s.content_editable ? t.getBody() : (isGecko ? t.getDoc() : t.getWin()), 'focus', function(e) {
				t.focus(true);
			});

			// #ifdef contentEditable

			if (s.content_editable && tinymce.isOpera) {
				// Opera doesn't support focus event for contentEditable elements so we need to fake it
				function doFocus(e) {
					t.focus(true);
				};

				dom.bind(t.getBody(), 'click', doFocus);
				dom.bind(t.getBody(), 'keydown', doFocus);
			}

			// #endif

			// Fixes bug where a specified document_base_uri could result in broken images
			// This will also fix drag drop of images in Gecko
			if (tinymce.isGecko) {
				dom.bind(t.getDoc(), 'DOMNodeInserted', function(e) {
					var v;

					e = e.target;

					if (e.nodeType === 1 && e.nodeName === 'IMG' && (v = e.getAttribute('data-mce-src')))
						e.src = t.documentBaseURI.toAbsolute(v);
				});
			}

			// Set various midas options in Gecko
			if (isGecko) {
				function setOpts() {
					var t = this, d = t.getDoc(), s = t.settings;

					if (isGecko && !s.readonly) {
						t._refreshContentEditable();

						try {
							// Try new Gecko method
							d.execCommand("styleWithCSS", 0, false);
						} catch (ex) {
							// Use old method
							if (!t._isHidden())
								try {d.execCommand("useCSS", 0, true);} catch (ex) {}
						}

						if (!s.table_inline_editing)
							try {d.execCommand('enableInlineTableEditing', false, false);} catch (ex) {}

						if (!s.object_resizing)
							try {d.execCommand('enableObjectResizing', false, false);} catch (ex) {}
					}
				};

				t.onBeforeExecCommand.add(setOpts);
				t.onMouseDown.add(setOpts);
			}

			// Add node change handlers
			t.onMouseUp.add(t.nodeChanged);
			//t.onClick.add(t.nodeChanged);
			t.onKeyUp.add(function(ed, e) {
				var c = e.keyCode;

				if ((c >= 33 && c <= 36) || (c >= 37 && c <= 40) || c == 13 || c == 45 || c == 46 || c == 8 || (tinymce.isMac && (c == 91 || c == 93)) || e.ctrlKey)
					t.nodeChanged();
			});


			// Add block quote deletion handler
			t.onKeyDown.add(function(ed, e) {
				if (e.keyCode != VK.BACKSPACE)
					return;

				// ATLASSIAN
				var rng = ed.selection.getRng(true);
				if (!rng.collapsed)
					return;

				var n = rng.startContainer;
				var offset = rng.startOffset;

				while (n && n.nodeType && n.nodeType != 1 && n.parentNode)
					n = n.parentNode;

				// Is the cursor at the beginning of a blockquote?
				if (n && n.parentNode && n.parentNode.tagName === 'BLOCKQUOTE' && n.parentNode.firstChild == n && offset === 0) {
					// Remove the blockquote
					ed.formatter.toggle('blockquote', null, n.parentNode);

					// Move the caret to the beginning of n
					rng.setStart(n, 0);
					rng.setEnd(n, 0);
					ed.selection.setRng(rng);
					ed.selection.collapse(false);
				}
			});



			// Add reset handler
			t.onReset.add(function() {
				t.setContent(t.startContent, {format : 'raw'});
			});

			// Add shortcuts
			if (s.custom_shortcuts) {
				if (s.custom_undo_redo_keyboard_shortcuts) {
					t.addShortcut('ctrl+z', t.getLang('undo_desc'), 'Undo');
					t.addShortcut('ctrl+y', t.getLang('redo_desc'), 'Redo');
				}

				// Add default shortcuts for gecko
				t.addShortcut('ctrl+b', t.getLang('bold_desc'), 'Bold');
				t.addShortcut('ctrl+i', t.getLang('italic_desc'), 'Italic');
				t.addShortcut('ctrl+u', t.getLang('underline_desc'), 'Underline');

                // ATLASSIAN - Leave these shortcuts commented out. We add them ourselves in
                // the keyboard shortcut plugin
				// BlockFormat shortcuts keys
				//for (i=1; i<=6; i++)
				//	t.addShortcut('ctrl+' + i, '', ['FormatBlock', false, 'h' + i]);

				//t.addShortcut('ctrl+7', '', ['FormatBlock', false, 'p']);
				//t.addShortcut('ctrl+8', '', ['FormatBlock', false, 'div']);
				//t.addShortcut('ctrl+9', '', ['FormatBlock', false, 'address']);

				function find(e) {
					var v = null;

					if (!e.altKey && !e.ctrlKey && !e.metaKey)
						return v;

					each(t.shortcuts, function(o) {
						if (tinymce.isMac && o.ctrl != e.metaKey)
							return;
						else if (!tinymce.isMac && o.ctrl != e.ctrlKey)
							return;

						if (o.alt != e.altKey)
							return;

						if (o.shift != e.shiftKey)
							return;

						if (e.keyCode == o.keyCode || (e.charCode && e.charCode == o.charCode)) {
							v = o;
							return false;
						}
					});

					return v;
				};

				t.onKeyUp.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyPress.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyDown.add(function(ed, e) {
					var o = find(e);

					if (o) {
						o.func.call(o.scope);
						return Event.cancel(e);
					}
				});
			}

			if (tinymce.isIE) {
				// Fix so resize will only update the width and height attributes not the styles of an image
				// It will also block mceItemNoResize items
				dom.bind(t.getDoc(), 'controlselect', function(e) {
					var re = t.resizeInfo, cb;

					e = e.target;

					// Don't do this action for non image elements
					if (e.nodeName !== 'IMG')
						return;

					if (re)
						dom.unbind(re.node, re.ev, re.cb);

					if (!dom.hasClass(e, 'mceItemNoResize')) {
						ev = 'resizeend';
						cb = dom.bind(e, ev, function(e) {
							var v;

							e = e.target;

							if (v = dom.getStyle(e, 'width')) {
								dom.setAttrib(e, 'width', v.replace(/[^0-9%]+/g, ''));
								dom.setStyle(e, 'width', '');
							}

							if (v = dom.getStyle(e, 'height')) {
								dom.setAttrib(e, 'height', v.replace(/[^0-9%]+/g, ''));
								dom.setStyle(e, 'height', '');
							}
						});
					} else {
						ev = 'resizestart';
						cb = dom.bind(e, 'resizestart', Event.cancel, Event);
					}

					re = t.resizeInfo = {
						node : e,
						ev : ev,
						cb : cb
					};
				});
			}

			if (tinymce.isOpera) {
				t.onClick.add(function(ed, e) {
					Event.prevent(e);
				});
			}

			// Add custom undo/redo handlers
			if (s.custom_undo_redo) {
				function addUndo() {
					t.undoManager.typing = false;
					t.undoManager.add();
				};

				var focusLostFunc = tinymce.isGecko ? 'blur' : 'focusout';
				dom.bind(t.getDoc(), focusLostFunc, function(e){
					if (!t.removed && t.undoManager.typing)
						addUndo();
				});

				// Add undo level when contents is drag/dropped within the editor
				t.dom.bind(t.dom.getRoot(), 'dragend', function(e) {
					addUndo();
				});

				t.onKeyUp.add(function(ed, e) {
					var keyCode = e.keyCode;

					if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 13 || keyCode == 45 || e.ctrlKey)
						addUndo();
				});

				t.onKeyDown.add(function(ed, e) {
					var keyCode = e.keyCode, sel;

					if (keyCode == 8) {
						sel = t.getDoc().selection;

						// Fix IE control + backspace browser bug
						if (sel && sel.createRange && sel.createRange().item) {
							t.undoManager.beforeChange();
							ed.dom.remove(sel.createRange().item(0));
							addUndo();

							return Event.cancel(e);
						}
					}

					// Is caracter positon keys left,right,up,down,home,end,pgdown,pgup,enter
					if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 13 || keyCode == 45) {
						// Add position before enter key is pressed, used by IE since it still uses the default browser behavior
						// Todo: Remove this once we normalize enter behavior on IE
						if (tinymce.isIE && keyCode == 13)
							t.undoManager.beforeChange();

						if (t.undoManager.typing)
							addUndo();

						return;
					}

					// If key isn't shift,ctrl,alt,capslock,metakey
					if ((keyCode < 16 || keyCode > 20) && keyCode != 224 && keyCode != 91 && !t.undoManager.typing) {
						t.undoManager.beforeChange();
						t.undoManager.typing = true;
						t.undoManager.add();
					}
				});

				t.onMouseDown.add(function() {
					if (t.undoManager.typing)
						addUndo();
				});
			}

			// Bug fix for FireFox keeping styles from end of selection instead of start.
			if (tinymce.isGecko) {
				function getAttributeApplyFunction() {
					var template = t.dom.getAttribs(t.selection.getStart().cloneNode(false));

					return function() {
						var target = t.selection.getStart();

						if (target !== t.getBody()) {
							t.dom.setAttrib(target, "style", null);

						each(template, function(attr) {
							target.setAttributeNode(attr.cloneNode(true));
						});
						}
					};
				}

				function isSelectionAcrossElements() {
					var s = t.selection;

					return !s.isCollapsed() && s.getStart() != s.getEnd();
				}

				t.onKeyPress.add(function(ed, e) {
					var applyAttributes;

					if ((e.keyCode == 8 || e.keyCode == 46) && isSelectionAcrossElements()) {
						applyAttributes = getAttributeApplyFunction();
						t.getDoc().execCommand('delete', false, null);
						applyAttributes();

						return Event.cancel(e);
					}
				});

				t.dom.bind(t.getDoc(), 'cut', function(e) {
					var applyAttributes;

					if (isSelectionAcrossElements()) {
						applyAttributes = getAttributeApplyFunction();
						t.onKeyUp.addToTop(Event.cancel, Event);

						setTimeout(function() {
							applyAttributes();
							t.onKeyUp.remove(Event.cancel, Event);
						}, 0);
					}
				});
			}
		},

		_refreshContentEditable : function() {
			var self = this, body, parent;

			// Check if the editor was hidden and the re-initalize contentEditable mode by removing and adding the body again
			if (self._isHidden()) {
				body = self.getBody();
				parent = body.parentNode;

				parent.removeChild(body);
				parent.appendChild(body);

				body.focus();
			}
		},

		_isHidden : function() {
			var s;

			if (!isGecko)
				return 0;

			// Weird, wheres that cursor selection?
			s = this.selection.getSel();
			return (!s || !s.rangeCount || s.rangeCount == 0);
		}
	});
})(tinymce);

/**
 * EditorCommands.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Added for compression purposes
	var each = tinymce.each, undefined, TRUE = true, FALSE = false;

	/**
	 * This class enables you to add custom editor commands and it contains
	 * overrides for native browser commands to address various bugs and issues.
	 *
	 * @class tinymce.EditorCommands
	 */
	tinymce.EditorCommands = function(editor) {
		var dom = editor.dom,
			selection = editor.selection,
			commands = {state: {}, exec : {}, value : {}},
			settings = editor.settings,
			formatter = editor.formatter,
			bookmark;

		/**
		 * Executes the specified command.
		 *
		 * @method execCommand
		 * @param {String} command Command to execute.
		 * @param {Boolean} ui Optional user interface state.
		 * @param {Object} value Optional value for command.
		 * @return {Boolean} true/false if the command was found or not.
		 */
		function execCommand(command, ui, value) {
			var func;

			command = command.toLowerCase();
			if (func = commands.exec[command]) {
				func(command, ui, value);
				return TRUE;
			}

			return FALSE;
		};

		/**
		 * Queries the current state for a command for example if the current selection is "bold".
		 *
		 * @method queryCommandState
		 * @param {String} command Command to check the state of.
		 * @return {Boolean/Number} true/false if the selected contents is bold or not, -1 if it's not found.
		 */
		function queryCommandState(command) {
			var func;

			command = command.toLowerCase();
			if (func = commands.state[command])
				return func(command);

			return -1;
		};

		/**
		 * Queries the command value for example the current fontsize.
		 *
		 * @method queryCommandValue
		 * @param {String} command Command to check the value of.
		 * @return {Object} Command value of false if it's not found.
		 */
		function queryCommandValue(command) {
			var func;

			command = command.toLowerCase();
			if (func = commands.value[command])
				return func(command);

			return FALSE;
		};

		/**
		 * Adds commands to the command collection.
		 *
		 * @method addCommands
		 * @param {Object} command_list Name/value collection with commands to add, the names can also be comma separated.
		 * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
		 */
		function addCommands(command_list, type) {
			type = type || 'exec';

			each(command_list, function(callback, command) {
				each(command.toLowerCase().split(','), function(command) {
					commands[type][command] = callback;
				});
			});
		};

		// Expose public methods
		tinymce.extend(this, {
			execCommand : execCommand,
			queryCommandState : queryCommandState,
			queryCommandValue : queryCommandValue,
			addCommands : addCommands
		});

		// Private methods

		function execNativeCommand(command, ui, value) {
			if (ui === undefined)
				ui = FALSE;

			if (value === undefined)
				value = null;

			return editor.getDoc().execCommand(command, ui, value);
		};

		function isFormatMatch(name) {
			return formatter.match(name);
		};

		function toggleFormat(name, value) {
			formatter.toggle(name, value ? {value : value} : undefined);
		};

		function storeSelection(type) {
			bookmark = selection.getBookmark(type);
		};

		function restoreSelection() {
			selection.moveToBookmark(bookmark);
		};

		// Add execCommand overrides
		addCommands({
			// Ignore these, added for compatibility
			'mceResetDesignMode,mceBeginUndoLevel' : function() {},

			// Add undo manager logic
			'mceEndUndoLevel,mceAddUndoLevel' : function() {
				editor.undoManager.add();
			},

			'Cut,Copy,Paste' : function(command) {
				var doc = editor.getDoc(), failed;

				// Try executing the native command
				try {
					execNativeCommand(command);
				} catch (ex) {
					// Command failed
					failed = TRUE;
				}

				// Present alert message about clipboard access not being available
				if (failed || !doc.queryCommandSupported(command)) {
					if (tinymce.isGecko) {
						editor.windowManager.confirm(editor.getLang('clipboard_msg'), function(state) {
							if (state)
								open('http://www.mozilla.org/editor/midasdemo/securityprefs.html', '_blank');
						});
					} else
						editor.windowManager.alert(editor.getLang('clipboard_no_support'));
				}
			},

			// Override unlink command
			unlink : function(command) {
				if (selection.isCollapsed())
					selection.select(selection.getNode());

				execNativeCommand(command);
				selection.collapse(FALSE);
			},

			// Override justify commands to use the text formatter engine
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				var align = command.substring(7);

                //ATLASSIAN: adding an undo level
                editor.undoManager.add();
                //ATLASSIAN: get the current selection and node before remove() is called
                var curSelection = selection.getRng();
                var curNode = selection.getNode();

				// Remove all other alignments first
				each('left,center,right,full'.split(','), function(name) {
					if (align != name)
						formatter.remove('align' + name);

                    //ATLASSIAN CONFDEV-3905: Sometimes the range gets messed up when removing format if an
                    //image is involved, reset it to what it was if so.
				    if (!tinyMCE.isIE && (curNode.nodeName == "IMG") && ((selection.getRng().startContainer.nodeName == "#document")
                            || (selection.getRng().startContainer.nodeName == "#text"))) {
                        selection.setRng(curSelection);
                    }
                });

				toggleFormat('align' + align);
				execCommand('mceRepaint');
			},

			// Override list commands to fix WebKit bug
			'InsertUnorderedList,InsertOrderedList' : function(command) {
				var listElm, listParent;

				execNativeCommand(command);

				// WebKit produces lists within block elements so we need to split them
				// we will replace the native list creation logic to custom logic later on
				// TODO: Remove this when the list creation logic is removed
				listElm = dom.getParent(selection.getNode(), 'ol,ul');
				if (listElm) {
					listParent = listElm.parentNode;

					// If list is within a text block then split that block
					if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
						storeSelection();
						dom.split(listParent, listElm);
						restoreSelection();
					}
				}
			},

			// Override commands to use the text formatter engine
			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' : function(command) {
				toggleFormat(command);
			},

			// Override commands to use the text formatter engine
			'ForeColor,HiliteColor,FontName' : function(command, ui, value) {
				toggleFormat(command, value);
			},

			FontSize : function(command, ui, value) {
				var fontClasses, fontSizes;

				// Convert font size 1-7 to styles
				if (value >= 1 && value <= 7) {
					fontSizes = tinymce.explode(settings.font_size_style_values);
					fontClasses = tinymce.explode(settings.font_size_classes);

					if (fontClasses)
						value = fontClasses[value - 1] || value;
					else
						value = fontSizes[value - 1] || value;
				}

				toggleFormat(command, value);
			},

			RemoveFormat : function(command) {
				formatter.remove(command);
			},

			mceBlockQuote : function(command) {
				toggleFormat('blockquote');
			},

			FormatBlock : function(command, ui, value) {
				return toggleFormat(value || 'p');
			},

			mceCleanup : function() {
				var bookmark = selection.getBookmark();

				editor.setContent(editor.getContent({cleanup : TRUE}), {cleanup : TRUE});

				selection.moveToBookmark(bookmark);
			},

			mceRemoveNode : function(command, ui, value) {
				var node = value || selection.getNode();

				// Make sure that the body node isn't removed
				if (node != editor.getBody()) {
					storeSelection();
					editor.dom.remove(node, TRUE);
					restoreSelection();
				}
			},

			mceSelectNodeDepth : function(command, ui, value) {
				var counter = 0;

				dom.getParent(selection.getNode(), function(node) {
					if (node.nodeType == 1 && counter++ == value) {
						selection.select(node);
						return FALSE;
					}
				}, editor.getBody());
			},

			mceSelectNode : function(command, ui, value) {
				selection.select(value);
			},

			mceInsertContent : function(command, ui, value) {
				var parser, serializer, parentNode, rootNode, fragment, args,
					marker, nodeRect, viewPortRect, rng, node, node2, bookmarkHtml, viewportBodyElement;

				//selection.normalize();

				// Setup parser and serializer
				parser = editor.parser;
				serializer = new tinymce.html.Serializer({}, editor.schema);
				bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">\uFEFF</span>';

				// Run beforeSetContent handlers on the HTML to be inserted
				args = {content: value, format: 'html'};
				selection.onBeforeSetContent.dispatch(selection, args);
				value = args.content;

				// Add caret at end of contents if it's missing
				if (value.indexOf('{$caret}') == -1)
					value += '{$caret}';

				// Replace the caret marker with a span bookmark element
				value = value.replace(/\{\$caret\}/, bookmarkHtml);

				// Insert node maker where we will insert the new HTML and get it's parent
                // ATLASSIAN - make don't delete an empty selection as FF will add a NBSP
 				if (!selection.isCollapsed() && selection.getContent().length)
                    editor.execCommand('mceDelete', false, null, {skip_undo: true}); // ATLASSIAN: CONF-23691: skip undo since the native command doesn't add an undo step either

				parentNode = selection.getNode();

				// Parse the fragment within the context of the parent node
				args = {context : parentNode.nodeName.toLowerCase()};
				fragment = parser.parse(value, args);

				// Move the caret to a more suitable location
				node = fragment.lastChild;
				if (node.attr('id') == 'mce_marker') {
					marker = node;

					for (node = node.prev; node; node = node.walk(true)) {
						if (node.type == 3 || !dom.isBlock(node.name)) {
							node.parent.insert(marker, node, node.name === 'br');
							break;
						}
					}
				}

				// If parser says valid we can insert the contents into that parent
				if (!args.invalid) {
					value = serializer.serialize(fragment);

					// Check if parent is empty or only has one BR element then set the innerHTML of that parent
					node = parentNode.firstChild;
					node2 = parentNode.lastChild;
					if (!node || (node === node2 && node.nodeName === 'BR'))
						dom.setHTML(parentNode, value);
					else
						selection.setContent(value);
				} else {
					// If the fragment was invalid within that context then we need
					// to parse and process the parent it's inserted into

					// Insert bookmark node and get the parent
					selection.setContent(bookmarkHtml);
					parentNode = editor.selection.getNode();
					rootNode = editor.getBody();

					// Opera will return the document node when selection is in root
					if (parentNode.nodeType == 9)
						parentNode = node = rootNode;
					else
						node = parentNode;

					// Find the ancestor just before the root element
					while (node !== rootNode) {
						parentNode = node;
						node = node.parentNode;
					}

					// Get the outer/inner HTML depending on if we are in the root and parser and serialize that
					value = parentNode == rootNode ? rootNode.innerHTML : dom.getOuterHTML(parentNode);
					value = serializer.serialize(
						parser.parse(
							// Need to replace by using a function since $ in the contents would otherwise be a problem
							value.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i, function() {
								return serializer.serialize(fragment);
							})
						)
					);

					// Set the inner/outer HTML depending on if we are in the root or not
					if (parentNode == rootNode)
						dom.setHTML(rootNode, value);
					else
						dom.setOuterHTML(parentNode, value);
				}

				marker = dom.get('mce_marker');

				// Scroll range into view scrollIntoView on element can't be used since it will scroll the main view port as well
				nodeRect = dom.getRect(marker);
				viewPortRect = dom.getViewPort(editor.getWin());

				// Check if node is out side the viewport if it is then scroll to it
				if ((nodeRect.y + nodeRect.h > viewPortRect.y + viewPortRect.h || nodeRect.y < viewPortRect.y) ||
					(nodeRect.x > viewPortRect.x + viewPortRect.w || nodeRect.x < viewPortRect.x)) {
					viewportBodyElement = tinymce.isIE ? editor.getDoc().documentElement : editor.getBody();
					viewportBodyElement.scrollLeft = nodeRect.x;
					viewportBodyElement.scrollTop = nodeRect.y - viewPortRect.h + 25;
				}

				// Move selection before marker and remove it
				rng = dom.createRng();

				// If previous sibling is a text node set the selection to the end of that node
				node = marker.previousSibling;
				if (node && node.nodeType == 3) {
					rng.setStart(node, node.nodeValue.length);
				} else {
					// If the previous sibling isn't a text node or doesn't exist set the selection before the marker node
					rng.setStartBefore(marker);
					rng.setEndBefore(marker);
				}

				// Remove the marker node and set the new range
				dom.remove(marker);
				selection.setRng(rng);

				// Dispatch after event and add any visual elements needed
				selection.onSetContent.dispatch(selection, args);
				editor.addVisual();
			},

			mceInsertRawHTML : function(command, ui, value) {
				selection.setContent('tiny_mce_marker');
				editor.setContent(editor.getContent().replace(/tiny_mce_marker/g, function() { return value }));
			},

			mceSetContent : function(command, ui, value) {
				editor.setContent(value);
			},

			'Indent,Outdent' : function(command) {
				var intentValue, indentUnit, value;

				// Setup indent level
				intentValue = settings.indentation;
				indentUnit = /[a-z%]+$/i.exec(intentValue);
				intentValue = parseInt(intentValue);

				if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList') && !queryCommandState('InsertInlineTaskList')) {
					each(selection.getSelectedBlocks(), function(element) {
						if (command == 'outdent') {
							value = Math.max(0, parseInt(element.style.paddingLeft || 0) - intentValue);
							dom.setStyle(element, 'paddingLeft', value ? value + indentUnit : '');
						} else
							dom.setStyle(element, 'paddingLeft', (parseInt(element.style.paddingLeft || 0) + intentValue) + indentUnit);
					});
				} else
					execNativeCommand(command);
			},

			mceRepaint : function() {
				var bookmark;

				if (tinymce.isGecko) {
					try {
						storeSelection(TRUE);

						if (selection.getSel())
							selection.getSel().selectAllChildren(editor.getBody());

						selection.collapse(TRUE);
						restoreSelection();
					} catch (ex) {
						// Ignore
					}
				}
			},

			mceToggleFormat : function(command, ui, value) {
				formatter.toggle(value);
			},

			InsertHorizontalRule : function() {
				editor.execCommand('mceInsertContent', false, '<hr />');
			},

			mceToggleVisualAid : function() {
				editor.hasVisual = !editor.hasVisual;
				editor.addVisual();
			},

			mceReplaceContent : function(command, ui, value) {
				editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({format : 'text'})));
			},

			mceInsertLink : function(command, ui, value) {
				var anchor;

				if (typeof(value) == 'string')
					value = {href : value};

				anchor = dom.getParent(selection.getNode(), 'a');

				// Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
				value.href = value.href.replace(' ', '%20');

				// Remove existing links if there could be child links or that the href isn't specified
				if (!anchor || !value.href) {
					formatter.remove('link');
				}		

				// Apply new link to selection
				if (value.href) {
					formatter.apply('link', value, anchor);
						}
			},

			selectAll : function() {
				var root = dom.getRoot(), rng = dom.createRng();

				rng.setStart(root, 0);
				rng.setEnd(root, root.childNodes.length);

				editor.selection.setRng(rng);
			}
		});

		// Add queryCommandState overrides
		addCommands({
			// Override justify commands
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				var name = 'align' + command.substring(7);
				// Use Formatter.matchNode instead of Formatter.match so that we don't match on parent node. This fixes bug where for both left
				// and right align buttons can be active. This could occur when selected nodes have align right and the parent has align left.
				var nodes = selection.isCollapsed() ? [selection.getNode()] : selection.getSelectedBlocks();
				var matches = tinymce.map(nodes, function(node) {
					return !!formatter.matchNode(node, name);
				});
				return tinymce.inArray(matches, TRUE) !== -1;
			},

			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' : function(command) {
				return isFormatMatch(command);
			},

			mceBlockQuote : function() {
				return isFormatMatch('blockquote');
			},

			Outdent : function() {
				var node;

				if (settings.inline_styles) {
					if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;

					if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;
				}

				return queryCommandState('InsertUnorderedList') || queryCommandState('InsertOrderedList') || queryCommandState('InsertInlineTaskList')
                        || (!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'));
			},

            /* ATLASSIAN - Add task list support */
			'InsertUnorderedList,InsertOrderedList,InsertInlineTaskList' : function(command) {
                var list = dom.getParent(selection.getNode(), 'ul,ol');
                var tagName;

                if(!list)
                    return false;

                tagName = list.tagName;

                return (tagName === 'OL') && (command === 'insertorderedlist')
                      || (tagName === 'UL') && !dom.hasClass(list, 'inline-task-list') && (command === 'insertunorderedlist')
                      || (tagName === 'UL') && dom.hasClass(list, 'inline-task-list') && (command === 'insertinlinetasklist');
			}
		}, 'state');

		// Add queryCommandValue overrides
		addCommands({
			'FontSize,FontName' : function(command) {
				var value = 0, parent;

				if (parent = dom.getParent(selection.getNode(), 'span')) {
					if (command == 'fontsize')
						value = parent.style.fontSize;
					else
						value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
				}

				return value;
			}
		}, 'value');

		// Add undo manager logic
		if (settings.custom_undo_redo) {
			addCommands({
				Undo : function() {
					editor.undoManager.undo();
				},

				Redo : function() {
					editor.undoManager.redo();
				}
			});
		}
	};
})(tinymce);

/**
 * UndoManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher;

	/**
	 * This class handles the undo/redo history levels for the editor. Since the build in undo/redo has major drawbacks a custom one was needed.
	 *
	 * @class tinymce.UndoManager
	 */
	tinymce.UndoManager = function(editor) {
		var self, index = 0, data = [], beforeBookmark;

		function getContent() {
			return tinymce.trim(editor.getContent({format : 'raw', no_events : 1}));
		};

		return self = {
			/**
			 * State if the user is currently typing or not. This will add a typing operation into one undo
			 * level instead of one new level for each keystroke.
			 *
			 * @field {Boolean} typing
			 */
			typing : false,

			/**
			 * This event will fire each time a new undo level is added to the undo manager.
			 *
			 * @event onAdd
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The new level object containing a bookmark and contents.
			 */
			onAdd : new Dispatcher(self),

			/**
			 * This event will fire when the user make an undo of a change.
			 *
			 * @event onUndo
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The old level object containing a bookmark and contents.
			 */
			onUndo : new Dispatcher(self),

			/**
			 * This event will fire when the user make an redo of a change.
			 *
			 * @event onRedo
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The old level object containing a bookmark and contents.
			 */
			onRedo : new Dispatcher(self),

			/**
			 * Stores away a bookmark to be used when performing an undo action so that the selection is before
			 * the change has been made.
			 *
			 * @method beforeChange
			 */
			beforeChange : function() {
				beforeBookmark = editor.selection.getBookmark(2, true);
			},

			/**
			 * Adds a new undo level/snapshot to the undo list.
			 *
			 * @method add
			 * @param {Object} l Optional undo level object to add.
			 * @return {Object} Undo level that got added or null it a level wasn't needed.
			 */
			add : function(level) {
				var i, settings = editor.settings, lastLevel;

				level = level || {};
				level.content = getContent();

				// Add undo level if needed
				lastLevel = data[index];
				if (lastLevel && lastLevel.content == level.content)
					return null;

				// Set before bookmark on previous level
				if (data[index])
					data[index].beforeBookmark = beforeBookmark;

				// Time to compress
				if (settings.custom_undo_redo_levels) {
					if (data.length > settings.custom_undo_redo_levels) {
						for (i = 0; i < data.length - 1; i++)
							data[i] = data[i + 1];

						data.length--;
						index = data.length;
					}
				}

				// Get a non intrusive normalized bookmark
				level.bookmark = editor.selection.getBookmark(2, true);

				// Crop array if needed
				if (index < data.length - 1)
					data.length = index + 1;

				data.push(level);
				index = data.length - 1;

				self.onAdd.dispatch(self, level);
				editor.isNotDirty = 0;

				return level;
			},

			/**
			 * Undoes the last action.
			 *
			 * @method undo
			 * @return {Object} Undo level or null if no undo was performed.
			 */
			undo : function() {
				var level, i;

				if (self.typing) {
					self.add();
					self.typing = false;
				}

				if (index > 0) {
					level = data[--index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.beforeBookmark);

					self.onUndo.dispatch(self, level);
				}

				return level;
			},

			/**
			 * Redoes the last action.
			 *
			 * @method redo
			 * @return {Object} Redo level or null if no redo was performed.
			 */
			redo : function() {
				var level;

				if (index < data.length - 1) {
					level = data[++index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.bookmark);

					self.onRedo.dispatch(self, level);
				}

				return level;
			},

			/**
			 * Removes all undo levels.
			 *
			 * @method clear
			 */
			clear : function() {
				data = [];
				index = 0;
				self.typing = false;
			},

			/**
			 * Returns true/false if the undo manager has any undo levels.
			 *
			 * @method hasUndo
			 * @return {Boolean} true/false if the undo manager has any undo levels.
			 */
			hasUndo : function() {
				return index > 0 || this.typing;
			},

			/**
			 * Returns true/false if the undo manager has any redo levels.
			 *
			 * @method hasRedo
			 * @return {Boolean} true/false if the undo manager has any redo levels.
			 */
			hasRedo : function() {
				return index < data.length - 1 && !this.typing;
			},

            // ATLASSIAN this is handy for debugging when you need it.
            // getData : function() { return data; },

            // ATLASSIAN our own very simple naive version of the TinyMCE 4 transact method.
            /**
             * Saves the state of the undoManager, executes the provided function, then restores
             * the state. Implicit and explicit changes to the undomanager will all be
             * effectively ignored.
             *
             * @param operation
             * @param target optional target
             */
            ignore : function(operation, target) {
                var dataState = data.slice();
                operation.call(target || editor);
                data = dataState;
            }
		};
	};
})(tinymce);

/**
 * ForceBlocks.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var Event = tinymce.dom.Event,
		isIE = tinymce.isIE,
		isGecko = tinymce.isGecko,
		isOpera = tinymce.isOpera,
		each = tinymce.each,
		extend = tinymce.extend,
		TRUE = true,
		FALSE = false;

	function cloneFormats(node) {
		var clone, temp, inner;

		do {
			if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(node.nodeName)) {
				if (clone) {
					temp = node.cloneNode(false);
					temp.appendChild(clone);
					clone = temp;
				} else {
					clone = inner = node.cloneNode(false);
				}

				clone.removeAttribute('id');
			}
		} while (node = node.parentNode);

		if (clone)
			return {wrapper : clone, inner : inner};
	};

	// Checks if the selection/caret is at the end of the specified block element
	function isAtEnd(rng, par) {
		var rng2 = par.ownerDocument.createRange();

		rng2.setStart(rng.endContainer, rng.endOffset);
		rng2.setEndAfter(par);

		// Get number of characters to the right of the cursor if it's zero then we are at the end and need to merge the next block element
		return rng2.cloneContents().textContent.length == 0;
	};

	function splitList(selection, dom, li) {
		var listBlock, block;

		if (dom.isEmpty(li)) {
			listBlock = dom.getParent(li, 'ul,ol');

			if (!dom.getParent(listBlock.parentNode, 'ul,ol')) {
				dom.split(listBlock, li);
				block = dom.create('p', 0, '<br data-mce-bogus="1" />');
				dom.replace(block, li);
				selection.select(block, 1);
			}

			// ATLASSIAN - CONFDEV-3749 - make sure new element is visible
			AJS.Rte.showSelection();

			return FALSE;
		}

		return TRUE;
	};

	/**
	 * This is a internal class and no method in this class should be called directly form the out side.
	 */
	tinymce.create('tinymce.ForceBlocks', {
		ForceBlocks : function(ed) {
			var t = this, s = ed.settings, elm;

			t.editor = ed;
			t.dom = ed.dom;
			elm = (s.forced_root_block || 'p').toLowerCase();
			s.element = elm.toUpperCase();

			ed.onPreInit.add(t.setup, t);
		},

		setup : function() {
			var t = this, ed = t.editor, s = ed.settings, dom = ed.dom, selection = ed.selection, blockElements = ed.schema.getBlockElements();

			// Force root blocks
			if (s.forced_root_block) {
				function addRootBlocks() {
					//ATLASSIAN - CONFDEV-6096/CONFDEV-6478/others - Call getRoot instead of just grabbing the body
					var node = selection.getStart(), rootNode = dom.getRoot(), body = ed.getDoc().body, rng, startContainer, startOffset, endContainer, endOffset, rootBlockNode, tempNode, offset = -0xFFFFFF;

					function isValidNode(node) {
						return (node && node.nodeType === 1);
					}

					if(!isValidNode(node)) {
						return;
					}

					// Check if node is wrapped in block
					while (node != rootNode) {
						if(isValidNode(node)) {
							if (blockElements[node.nodeName]) {
								return;
							}
							node = node.parentNode;
						} else {
							return;
						}
					}

					// Get current selection
					rng = selection.getRng();
					if (rng.setStart) {
						startContainer = rng.startContainer;
						startOffset = rng.startOffset;
						endContainer = rng.endContainer;
						endOffset = rng.endOffset;
					} else {
						// Force control range into text range
						if (rng.item) {
							rng = ed.getDoc().body.createTextRange();
							rng.moveToElementText(rng.item(0));
						}

						tmpRng = rng.duplicate();
						tmpRng.collapse(true);
						startOffset = tmpRng.move('character', offset) * -1;

						if (!tmpRng.collapsed) {
							tmpRng = rng.duplicate();
							tmpRng.collapse(false);
							endOffset = (tmpRng.move('character', offset) * -1) - startOffset;
						}
					}

					// Wrap non block elements and text nodes
					for (node = rootNode.firstChild; node; node) {
						if (node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName])) {
							if (!rootBlockNode) {
								rootBlockNode = dom.create(s.forced_root_block);
								node.parentNode.insertBefore(rootBlockNode, node);
							}

							tempNode = node;
							node = node.nextSibling;
							rootBlockNode.appendChild(tempNode);
						} else {
							rootBlockNode = null;
							node = node.nextSibling;
						}
					}

					if (rng.setStart) {
						rng.setStart(startContainer, startOffset);
						rng.setEnd(endContainer, endOffset);
						selection.setRng(rng);
					} else {
						try {
							rng = body.createTextRange();
							//ATLASSIAN - CONFDEV-7363/CONFDEV-7364 - Move selection back as far as possible before moving it to offsets
							rng.moveToElementText(body);
							rng.move('character', offset);
							rng.collapse(true);
							rng.moveStart('character', startOffset);

							if (endOffset > 0)
								rng.moveEnd('character', endOffset);

							rng.select();
						} catch (ex) {
							// Ignore
						}
					}

					ed.nodeChanged();
				};

				ed.onKeyUp.add(addRootBlocks);
				// ATLASSIAN CONFDEV-8468
				// We also need to addRootBlocks on KeyDown because code is sometimes
				// triggered by a keyPress that occurs before the keyUp event of the
				// previous keystroke. We want to make sure that root blocks are in
				// place by the time such code is executed (e.g. autoformat handlers)
				ed.onKeyDown.add(addRootBlocks);
				ed.onClick.add(addRootBlocks);
			}

			if (s.force_br_newlines) {
				// Force IE to produce BRs on enter
				if (isIE) {
					ed.onKeyPress.add(function(ed, e) {
						var n;

						if (e.keyCode == 13 && selection.getNode().nodeName != 'LI') {
							selection.setContent('<br id="__" /> ', {format : 'raw'});
							n = dom.get('__');
							n.removeAttribute('id');
							selection.select(n);
							selection.collapse();
							return Event.cancel(e);
						}
					});
				}
			}

			if (s.force_p_newlines) {
				if (!isIE) {
					ed.onKeyPress.add(function(ed, e) {
						if (e.keyCode == 13 && !e.shiftKey && !t.insertPara(e))
							Event.cancel(e);
					});
				}

/*
 * ATLASSIAN - the code below doesn't seem to be necessary for correct new line and formatting behaviour
 * for IE8 and later versions. This code creates CONFDEV-9088 which is actually more generic than inline
 * tasks alone.
 *
 * Hitting enter after any list item containing a child element such as a span (for text colour,
 * carried over from the inline task placeholder, etc.) isn't able to escape the list. This bug is currently
 * reproducible in the tinyMCE demo.
 */
//                else {
//					// Ungly hack to for IE to preserve the formatting when you press
//					// enter at the end of a block element with formatted contents
//					// This logic overrides the browsers default logic with
//					// custom logic that enables us to control the output
//					tinymce.addUnload(function() {
//						t._previousFormats = 0; // Fix IE leak
//					});
//
//					ed.onKeyPress.add(function(ed, e) {
//						t._previousFormats = 0;
//
//						// Clone the current formats, this will later be applied to the new block contents
//						if (e.keyCode == 13 && !e.shiftKey && ed.selection.isCollapsed() && s.keep_styles) {
//							t._previousFormats = cloneFormats(ed.selection.getStart());
//                        }
//					});
//
//					ed.onKeyUp.add(function(ed, e) {
//						// Let IE break the element and the wrap the new caret location in the previous formats
//						if (e.keyCode == 13 && !e.shiftKey) {
//							var parent = ed.selection.getStart(), fmt = t._previousFormats;
//
//							// Parent is an empty block
//							if (!parent.hasChildNodes() && fmt) {
//								parent = dom.getParent(parent, dom.isBlock);
//
//								if (parent && parent.nodeName != 'LI') {
//                                    parent.innerHTML = '';
//
//                                    if (t._previousFormats) {
//                                        parent.appendChild(fmt.wrapper);
//                                        fmt.inner.innerHTML = '\uFEFF';
//                                    } else
//                                        parent.innerHTML = '\uFEFF';
//
//                                    selection.select(parent, 1);
//                                    selection.collapse(true);
//                                    ed.getDoc().execCommand('Delete', false, null);
//                                    t._previousFormats = 0;
//								}
//							}
//						}
//					});
//				}

				if (isGecko) {
					ed.onKeyDown.add(function(ed, e) {
						if ((e.keyCode == 8 || e.keyCode == 46) && !e.shiftKey)
							t.backspaceDelete(e, e.keyCode == 8);
					});
				}
			}

			// Workaround for missing shift+enter support, http://bugs.webkit.org/show_bug.cgi?id=16973
			if (tinymce.isWebKit) {
				function insertBr(ed) {
					var rng = selection.getRng(), br, div = dom.create('div', null, ' '), divYPos, divHeight, vpPos = dom.getViewPort(ed.getWin());

					// Insert BR element
					rng.insertNode(br = dom.create('br'));

					// Place caret after BR
					rng.setStartAfter(br);
					rng.setEndAfter(br);
					selection.setRng(rng);

					// Could not place caret after BR then insert an nbsp entity and move the caret
					if (selection.getSel().focusNode == br.previousSibling) {
						selection.select(dom.insertAfter(dom.doc.createTextNode('\u00a0'), br));
						selection.collapse(TRUE);
					}

					// Create a temporary DIV after the BR and get the position as it
					// seems like getPos() returns 0 for text nodes and BR elements.
					dom.insertAfter(div, br);
					divYPos = dom.getPos(div).y;
					divHeight = dom.getSize(div).h;
					dom.remove(div);

					// Scroll to new position, scrollIntoView can't be used due to bug: http://bugs.webkit.org/show_bug.cgi?id=16117
					var divBottom = divYPos + divHeight;
					var vpBottom = vpPos.y + vpPos.h;
					if (divBottom > vpBottom) // It is not necessary to scroll if the DIV is inside the view port.
						ed.getWin().scrollTo(0, divBottom - vpPos.h);
				};

				ed.onKeyPress.add(function(ed, e) {
					if (e.keyCode == 13 && (e.shiftKey || (s.force_br_newlines && !dom.getParent(selection.getNode(), 'h1,h2,h3,h4,h5,h6,ol,ul')))) {
						insertBr(ed);
						Event.cancel(e);
					}
				});
			}

			// IE specific fixes
			if (isIE) {
				// Replaces IE:s auto generated paragraphs with the specified element name
				if (s.element != 'P') {
					ed.onKeyPress.add(function(ed, e) {
						t.lastElm = selection.getNode().nodeName;
					});

					ed.onKeyUp.add(function(ed, e) {
						var bl, n = selection.getNode(), b = ed.getBody();

						if (b.childNodes.length === 1 && n.nodeName == 'P') {
							n = dom.rename(n, s.element);
							selection.select(n);
							selection.collapse();
							ed.nodeChanged();
						} else if (e.keyCode == 13 && !e.shiftKey && t.lastElm != 'P') {
							bl = dom.getParent(n, 'p');

							if (bl) {
								dom.rename(bl, s.element);
								ed.nodeChanged();
							}
						}
					});
				}
			}
		},

		getParentBlock : function(n) {
			var d = this.dom;

			return d.getParent(n, d.isBlock);
		},

		insertPara : function(e) {
			var t = this, ed = t.editor, dom = ed.dom, d = ed.getDoc(), se = ed.settings, s = ed.selection.getSel(), r = s.getRangeAt(0), b = d.body;
			var rb, ra, dir, sn, so, en, eo, sb, eb, bn, bef, aft, sc, ec, n, vp = dom.getViewPort(ed.getWin()), y, ch, car;

			ed.undoManager.beforeChange();

			// If root blocks are forced then use Operas default behavior since it's really good
// Removed due to bug: #1853816
//			if (se.forced_root_block && isOpera)
//				return TRUE;

			// Setup before range
			rb = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			rb.setStart(s.anchorNode, s.anchorOffset);
			rb.collapse(TRUE);

			// Setup after range
			ra = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			ra.setStart(s.focusNode, s.focusOffset);
			ra.collapse(TRUE);

			// Setup start/end points
			dir = rb.compareBoundaryPoints(rb.START_TO_END, ra) < 0;
			sn = dir ? s.anchorNode : s.focusNode;
			so = dir ? s.anchorOffset : s.focusOffset;
			en = dir ? s.focusNode : s.anchorNode;
			eo = dir ? s.focusOffset : s.anchorOffset;

			/**
			 * ATLASSIAN: Fix CONF-18922 (must be before the fix below regarding a start node of TD or TH).
			 *
			 * Hitting ENTER when the cursor is after a table in webkit should not send the cursor to the top of the page.
			 *
			 * The reason why this occurs is because this function (i.e. insertPara) considers a range with startContainer
			 * equal to the BODY element to be illegal and accordingly "adjusts" this by setting the startContainer to
			 * the first child of the BODY element (explaining why the cursor jumps to the top).
			 *
			 * Bypass this with this code.
			 *
			 * NOTE: as long as the fix still exists regarding TD or TH's directly below this, this code should come before.
			 * This will another issue which happens when you hit ENTER after a table "nested inside a table cell" (i.e.
			 * You would get this markup: <p>foo<table />bar</p><p>THIS IS THE NEW PARAGRAPH inserted by insertPara</p>).
			 */
			var table;
			if (tinymce.isWebKit && sn === en /* deal with collapsed selections only */
				&& sn.nodeType === 1
				&& sn.childNodes.length > 0
				&& ed.dom.is(table = sn.childNodes[so > 0 ? so - 1 : 0], "table")) {
				/**
				 * default webkit browser behaviour is jittery (possibly because it creates a BR and then transitions to a P)
				 * do our own paragraph insertion
				 */
				var newParagraph = dom.create('p', 0, '<br data-mce-bogus="1" />');
				dom.insertAfter(newParagraph, table);

				r.setStart(newParagraph, 0);
				ed.selection.setRng(r);

				var yPos = ed.dom.getPos(newParagraph).y;
				if (yPos > vp.y) {
					ed.getWin().scrollTo(0, yPos);
				}

				ed.undoManager.add();

				return FALSE;
			}

			// If selection is in empty table cell
			if (sn === en && /^(TD|TH)$/.test(sn.nodeName)) {
				if (sn.firstChild.nodeName == 'BR')
					dom.remove(sn.firstChild); // Remove BR

				// Create two new block elements
				if (sn.childNodes.length == 0) {
					ed.dom.add(sn, se.element, null, '<br />');
					aft = ed.dom.add(sn, se.element, null, '<br />');
				} else {
					/**
					 * CONF-45096:
					 * check for block elements because <p> (se.element) can not contain a block element
					 */
					var isChildBlockElement = false;
					each(sn.childNodes, function (child) {
						if (ed.dom.isBlock(child)) {
							isChildBlockElement = true;
							return false;
						}
					});
					if (isChildBlockElement) {
						r = ed.selection.getRng();
						//insert <p> before current node to push the node down
						r.insertNode(ed.dom.create(se.element, null, '<br />'));
					} else {
						n = sn.innerHTML;
						sn.innerHTML = '';
						ed.dom.add(sn, se.element, null, n);
						aft = ed.dom.add(sn, se.element, null, '<br />');
					}
				}

				if (aft) {
					// Move caret into the last one
					r = d.createRange();
					r.selectNodeContents(aft);
					r.collapse(1);
					ed.selection.setRng(r);
				}

				return FALSE;
			}

			// If the caret is in an invalid location in FF we need to move it into the first block
			if (sn == b && en == b && b.firstChild && ed.dom.isBlock(b.firstChild)) {
				sn = en = sn.firstChild;
				so = eo = 0;
				rb = d.createRange();
				rb.setStart(sn, 0);
				ra = d.createRange();
				ra.setStart(en, 0);
			}

			// If the body is totally empty add a BR element this might happen on webkit
			if (!d.body.hasChildNodes()) {
				d.body.appendChild(dom.create('br'));
			}

			// Never use body as start or end node
			sn = sn.nodeName == "HTML" ? d.body : sn; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			sn = sn.nodeName == "BODY" ? sn.firstChild : sn;
			en = en.nodeName == "HTML" ? d.body : en; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			en = en.nodeName == "BODY" ? en.firstChild : en;


			// ATLASSIAN Never use the root node as the start or end node, otherwise elements
			// may get inserted outside of the root node. Firefox tends to include the contenteditable
			// element itself in the selection on Ctrl/Cmd+A.
			var root = ed.dom.getRoot();
			if (sn === root) {
				sn = sn.firstChild;
				so = 0;
			}
			if (en === root) {
				en = en.firstChild;
				eo = 0;
			}

			// Get start and end blocks
			sb = t.getParentBlock(sn);
			eb = t.getParentBlock(en);
			bn = sb ? sb.nodeName : se.element; // Get block name to create

			// Return inside list use default browser behavior
			if (n = t.dom.getParent(sb, 'li,pre')) {
				if (n.nodeName == 'LI')
					return splitList(ed.selection, t.dom, n);

				return TRUE;
			}

			// If caption or absolute layers then always generate new blocks within
			if (sb && (sb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				sb = null;
			}

			// If caption or absolute layers then always generate new blocks within
			if (eb && (eb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				eb = null;
			}

			// Use P instead
			if (/(TD|TABLE|TH|CAPTION)/.test(bn) || (sb && bn == "DIV" && /left|right/gi.test(dom.getStyle(sb, 'float', 1)))) {
				bn = se.element;
				sb = eb = null;
			}

			// Setup new before and after blocks
			bef = (sb && sb.nodeName == bn) ? sb.cloneNode(0) : ed.dom.create(bn);
			aft = (eb && eb.nodeName == bn) ? eb.cloneNode(0) : ed.dom.create(bn);

			// Remove id from after clone
			aft.removeAttribute('id');

			// Is header and cursor is at the end, then force paragraph under
			if (/^(H[1-6])$/.test(bn) && isAtEnd(r, sb))
				aft = ed.dom.create(se.element);

			// Find start chop node
			n = sc = sn;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				sc = n;
			} while ((n = n.previousSibling ? n.previousSibling : n.parentNode));

			// Find end chop node
			n = ec = en;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				ec = n;
			} while ((n = n.nextSibling ? n.nextSibling : n.parentNode));

			// Place first chop part into before block element
			if (sc.nodeName == bn)
				rb.setStart(sc, 0);
			else
				rb.setStartBefore(sc);

			rb.setEnd(sn, so);
			bef.appendChild(rb.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Place secnd chop part within new block element
			try {
				ra.setEndAfter(ec);
			} catch(ex) {
				//console.debug(s.focusNode, s.focusOffset);
			}

			ra.setStart(en, eo);
			aft.appendChild(ra.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Create range around everything
			r = d.createRange();
			if (!sc.previousSibling && sc.parentNode.nodeName == bn) {
				r.setStartBefore(sc.parentNode);
			} else {
				if (rb.startContainer.nodeName == bn && rb.startOffset == 0)
					r.setStartBefore(rb.startContainer);
				else
					r.setStart(rb.startContainer, rb.startOffset);
			}

			if (!ec.nextSibling && ec.parentNode.nodeName == bn)
				r.setEndAfter(ec.parentNode);
			else
				r.setEnd(ra.endContainer, ra.endOffset);

			// Delete and replace it with new block elements
			r.deleteContents();

			if (isOpera)
				ed.getWin().scrollTo(0, vp.y);

			// Never wrap blocks in blocks
			if (bef.firstChild && bef.firstChild.nodeName == bn)
				bef.innerHTML = bef.firstChild.innerHTML;

			if (aft.firstChild && aft.firstChild.nodeName == bn)
				aft.innerHTML = aft.firstChild.innerHTML;

			function appendStyles(e, en) {
				var nl = [], nn, n, i;

				e.innerHTML = '';

				// Make clones of style elements
				if (se.keep_styles) {
					n = en;
					do {
						// We only want style specific elements
						if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(n.nodeName)) {
							nn = n.cloneNode(FALSE);
							dom.setAttrib(nn, 'id', ''); // Remove ID since it needs to be unique
							nl.push(nn);
						}
					} while (n = n.parentNode);
				}

				// Append style elements to aft
				if (nl.length > 0) {
					for (i = nl.length - 1, nn = e; i >= 0; i--)
						nn = nn.appendChild(nl[i]);

					// Padd most inner style element
					nl[0].innerHTML = isOpera ? '\u00a0' : '<br />'; // Extra space for Opera so that the caret can move there
					return nl[0]; // Move caret to most inner element
				} else
					e.innerHTML = isOpera ? '\u00a0' : '<br />'; // Extra space for Opera so that the caret can move there
			};

			// Padd empty blocks
			if (dom.isEmpty(bef))
				appendStyles(bef, sn);

			// Fill empty afterblook with current style
			if (dom.isEmpty(aft))
				car = appendStyles(aft, en);

			// don't persist the auto-cursor-target to new paragraphs
			t.dom.removeClass(aft, 'auto-cursor-target');

			// Opera needs this one backwards for older versions
			if (isOpera && parseFloat(opera.version()) < 9.5) {
				r.insertNode(bef);
				r.insertNode(aft);
			} else {
				r.insertNode(aft);
				r.insertNode(bef);
			}

			// Normalize
			aft.normalize();
			bef.normalize();

			// Move cursor and scroll into view
			ed.selection.select(aft, true);
			ed.selection.collapse(true);

			// scrollIntoView seems to scroll the parent window in most browsers now including FF 3.0b4 so it's time to stop using it and do it our selfs
			y = ed.dom.getPos(aft).y;
			//ch = aft.clientHeight;

			// Is element within viewport
			if (y < vp.y || y + 25 > vp.y + vp.h) {
				ed.getWin().scrollTo(0, y < vp.y ? y : y - vp.h + 25); // Needs to be hardcoded to roughly one line of text if a huge text block is broken into two blocks

				/*console.debug(
					'Element: y=' + y + ', h=' + ch + ', ' +
					'Viewport: y=' + vp.y + ", h=" + vp.h + ', bottom=' + (vp.y + vp.h)
				);*/
			}

			ed.undoManager.add();

			return FALSE;
		},

		backspaceDelete : function(e, bs) {
			var t = this, ed = t.editor, b = ed.getBody(), dom = ed.dom, n, se = ed.selection, r = se.getRng(), sc = r.startContainer, n, w, tn, walker;

			/**
			 * ATLASSIAN: Since backspaceDelete() is meant to supplement the default backspace behaviour in firefox, it should
			 * respect when the backspace key event's default action has been prevented - i.e. don't do anything :)
			 */
			var defaultPrevented = e.getPreventDefault ? e.getPreventDefault() : e.defaultPrevented; // e.defaultPrevented is available on firefox 6+
			if (defaultPrevented) {
				return;
			}

			// Delete when caret is behind a element doesn't work correctly on Gecko see #3011651
			if (!bs && r.collapsed && sc.nodeType == 1 && r.startOffset == sc.childNodes.length) {
				walker = new tinymce.dom.TreeWalker(sc.lastChild, sc);

				// Walk the dom backwards until we find a text node
				for (n = sc.lastChild; n; n = walker.prev()) {
					if (n.nodeType == 3) {
						r.setStart(n, n.nodeValue.length);
						r.collapse(true);
						se.setRng(r);
						return;
					}
				}
			}

			// The caret sometimes gets stuck in Gecko if you delete empty paragraphs
			// This workaround removes the element by hand and moves the caret to the previous element
			if (sc && ed.dom.isBlock(sc) && !/^(TD|TH)$/.test(sc.nodeName) && bs) {
				if (sc.childNodes.length == 0 || (sc.childNodes.length == 1 && sc.firstChild.nodeName == 'BR')) {
					// Find previous block element
					n = sc;
					while ((n = n.previousSibling) && !ed.dom.isBlock(n)) ;

					if (n) {
						if (sc != b.firstChild) {
							// Find last text node
							w = ed.dom.doc.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, FALSE);
							while (tn = w.nextNode())
								n = tn;

							// Place caret at the end of last text node
							r = ed.getDoc().createRange();
							r.setStart(n, n.nodeValue ? n.nodeValue.length : 0);
							r.setEnd(n, n.nodeValue ? n.nodeValue.length : 0);
							se.setRng(r);

							// Remove the target container
							ed.dom.remove(sc);
						}

						return Event.cancel(e);
					}
				}
			}

			// ATLASSIAN - CONFDEV-5383 Gecko doesn't delete the paragraph properly and leaves the br behind
			// This workaround explicitly removes the whole element and moves cursor to the next text node.
			if (!bs && r.collapsed && /^(BODY)$/.test(sc.nodeName)) {
				var selected = sc.childNodes[r.startOffset];
				if (selected && ed.dom.isBlock(selected) && !/^(TD|TH)$/.test(selected.nodeName)) {
					if (selected.childNodes.length == 0 || (selected.childNodes.length == 1 && selected.firstChild.nodeName == 'BR')) {
						n = selected;
						var next;
						while ((n = n.nextSibling)) {
							if (ed.dom.isBlock(n)) {
								next = n;
								break;
							}
						}

						if (next) {
							if (selected != b.lastChild) {
								// Find first text node
								w = ed.dom.doc.createTreeWalker(next, NodeFilter.SHOW_TEXT, null, FALSE);
								next = w.nextNode();

								// Place caret at the start of first text node
								r = ed.getDoc().createRange();
								r.setStart(next, 0);
								r.setEnd(next, 0);
								se.setRng(r);

								// Remove the target container
								ed.dom.remove(selected);

								return Event.cancel(e);
							}
						}
					}
				}
			}
		}
	});
})(tinymce);

/**
 * ControlManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, extend = tinymce.extend;

	/**
	 * This class is responsible for managing UI control instances. It's both a factory and a collection for the controls.
	 * @class tinymce.ControlManager
	 */
	tinymce.create('tinymce.ControlManager', {
		/**
		 * Constructs a new control manager instance.
		 * Consult the Wiki for more details on this class.
		 *
		 * @constructor
		 * @method ControlManager
		 * @param {tinymce.Editor} ed TinyMCE editor instance to add the control to.
		 * @param {Object} s Optional settings object for the control manager.
		 */
		ControlManager : function(ed, s) {
			var t = this, i;

			s = s || {};
			t.editor = ed;
			t.controls = {};
			t.onAdd = new tinymce.util.Dispatcher(t);
			t.onPostRender = new tinymce.util.Dispatcher(t);
			t.prefix = s.prefix || ed.id + '_';
			t._cls = {};

			t.onPostRender.add(function() {
				each(t.controls, function(c) {
					c.postRender();
				});
			});
		},

		/**
		 * Returns a control by id or undefined it it wasn't found.
		 *
		 * @method get
		 * @param {String} id Control instance name.
		 * @return {tinymce.ui.Control} Control instance or undefined.
		 */
		get : function(id) {
			return this.controls[this.prefix + id] || this.controls[id];
		},

		/**
		 * Sets the active state of a control by id.
		 *
		 * @method setActive
		 * @param {String} id Control id to set state on.
		 * @param {Boolean} s Active state true/false.
		 * @return {tinymce.ui.Control} Control instance that got activated or null if it wasn't found.
		 */
		setActive : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setActive(s);

			return c;
		},

		/**
		 * Sets the dsiabled state of a control by id.
		 *
		 * @method setDisabled
		 * @param {String} id Control id to set state on.
		 * @param {Boolean} s Active state true/false.
		 * @return {tinymce.ui.Control} Control instance that got disabled or null if it wasn't found.
		 */
		setDisabled : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setDisabled(s);

			return c;
		},

		/**
		 * Adds a control to the control collection inside the manager.
		 *
		 * @method add
		 * @param {tinymce.ui.Control} Control instance to add to collection.
		 * @return {tinymce.ui.Control} Control instance that got passed in.
		 */
		add : function(c) {
			var t = this;

			if (c) {
				t.controls[c.id] = c;
				t.onAdd.dispatch(c, t);
			}

			return c;
		},

		/**
		 * Creates a control by name, when a control is created it will automatically add it to the control collection.
		 * It first ask all plugins for the specified control if the plugins didn't return a control then the default behavior
		 * will be used.
		 *
		 * @method createControl
		 * @param {String} n Control name to create for example "separator".
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createControl : function(n) {
			var c, t = this, ed = t.editor;

			each(ed.plugins, function(p) {
				if (p.createControl) {
					c = p.createControl(n, t);

					if (c)
						return false;
				}
			});

			switch (n) {
				case "|":
				case "separator":
					return t.createSeparator();
			}

			if (!c && ed.buttons && (c = ed.buttons[n]))
				return t.createButton(n, c);

			return t.add(c);
		},

		/**
		 * Creates a drop menu control instance by id.
		 *
		 * @method createDropMenu
		 * @param {String} id Unique id for the new dropdown instance. For example "some menu".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createDropMenu : function(id, s, cc) {
			var t = this, ed = t.editor, c, bm, v, cls;

			s = extend({
				'class' : 'mceDropDown',
				constrain : ed.settings.constrain_menus
			}, s);

			s['class'] = s['class'] + ' ' + ed.getParam('skin') + 'Skin';
			if (v = ed.getParam('skin_variant'))
				s['class'] += ' ' + ed.getParam('skin') + 'Skin' + v.substring(0, 1).toUpperCase() + v.substring(1);

			id = t.prefix + id;
			cls = cc || t._cls.dropmenu || tinymce.ui.DropMenu;
			c = t.controls[id] = new cls(id, s);
			c.onAddItem.add(function(c, o) {
				var s = o.settings;

				s.title = ed.getLang(s.title, s.title);

				if (!s.onclick) {
					s.onclick = function(v) {
						if (s.cmd)
							ed.execCommand(s.cmd, s.ui || false, s.value);
					};
				}
			});

			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();

					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		/**
		 * Creates a list box control instance by id. A list box is either a native select element or a DOM/JS based list box control. This
		 * depends on the use_native_selects settings state.
		 *
		 * @method createListBox
		 * @param {String} id Unique id for the new listbox instance. For example "styles".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createListBox : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;


			function useNativeListForAccessibility(ed) {
				return ed.settings.use_accessible_selects && !tinymce.isGecko
			}

			if (ed.settings.use_native_selects || useNativeListForAccessibility(ed))
				c = new tinymce.ui.NativeListBox(id, s);
			else {
				cls = cc || t._cls.listbox || tinymce.ui.ListBox;
				c = new cls(id, s, ed);
			}

			t.controls[id] = c;

			// Fix focus problem in Safari
			if (tinymce.isWebKit) {
				c.onPostRender.add(function(c, n) {
					// Store bookmark on mousedown
					Event.add(n, 'mousedown', function() {
						ed.bookmark = ed.selection.getBookmark(1);
					});

					// Restore on focus, since it might be lost
					Event.add(n, 'focus', function() {
						ed.selection.moveToBookmark(ed.bookmark);
						ed.bookmark = null;
					});
				});
			}

			if (c.hideMenu)
				ed.onMouseDown.add(c.hideMenu, c);

			return t.add(c);
		},

		/**
		 * Creates a button control instance by id.
		 *
		 * @method createButton
		 * @param {String} id Unique id for the new button instance. For example "bold".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createButton : function(id, s, cc) {
			var t = this, ed = t.editor, o, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.label = ed.translate(s.label);
			s.scope = s.scope || ed;

			if (!s.onclick && !s.menu_button) {
				s.onclick = function() {
					ed.execCommand(s.cmd, s.ui || false, s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				unavailable_prefix : ed.getLang('unavailable', ''),
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (s.menu_button) {
				cls = cc || t._cls.menubutton || tinymce.ui.MenuButton;
				c = new cls(id, s, ed);
				ed.onMouseDown.add(c.hideMenu, c);
			} else {
				cls = t._cls.button || tinymce.ui.Button;
				c = new cls(id, s, ed);
			}

			return t.add(c);
		},

		/**
		 * Creates a menu button control instance by id.
		 *
		 * @method createMenuButton
		 * @param {String} id Unique id for the new menu button instance. For example "menu1".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createMenuButton : function(id, s, cc) {
			s = s || {};
			s.menu_button = 1;

			return this.createButton(id, s, cc);
		},

		/**
		 * Creates a split button control instance by id.
		 *
		 * @method createSplitButton
		 * @param {String} id Unique id for the new split button instance. For example "spellchecker".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.splitbutton || tinymce.ui.SplitButton;
			c = t.add(new cls(id, s, ed));
			ed.onMouseDown.add(c.hideMenu, c);

			return c;
		},

		/**
		 * Creates a color split button control instance by id.
		 *
		 * @method createColorSplitButton
		 * @param {String} id Unique id for the new color split button instance. For example "forecolor".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createColorSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls, bm;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					if (tinymce.isIE)
						bm = ed.selection.getBookmark(1);

					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				'menu_class' : ed.getParam('skin') + 'Skin',
				scope : s.scope,
				more_colors_title : ed.getLang('more_colors')
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.colorsplitbutton || tinymce.ui.ColorSplitButton;
			c = new cls(id, s, ed);
			ed.onMouseDown.add(c.hideMenu, c);

			// Remove the menu element when the editor is removed
			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();
					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		/**
		 * Creates a toolbar container control instance by id.
		 *
		 * @method createToolbar
		 * @param {String} id Unique id for the new toolbar container control instance. For example "toolbar1".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createToolbar : function(id, s, cc) {
			var c, t = this, cls;

			id = t.prefix + id;
			cls = cc || t._cls.toolbar || tinymce.ui.Toolbar;
			c = new cls(id, s, t.editor);

			if (t.get(id))
				return null;

			return t.add(c);
		},
		
		createToolbarGroup : function(id, s, cc) {
			var c, t = this, cls;
			id = t.prefix + id;
			cls = cc || this._cls.toolbarGroup || tinymce.ui.ToolbarGroup;
			c = new cls(id, s, t.editor);
			
			if (t.get(id))
				return null;
			
			return t.add(c);
		},

		/**
		 * Creates a separator control instance.
		 *
		 * @method createSeparator
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createSeparator : function(cc) {
			var cls = cc || this._cls.separator || tinymce.ui.Separator;

			return new cls();
		},

		/**
		 * Overrides a specific control type with a custom class.
		 *
		 * @method setControlType
		 * @param {string} n Name of the control to override for example button or dropmenu.
		 * @param {function} c Class reference to use instead of the default one.
		 * @return {function} Same as the class reference.
		 */
		setControlType : function(n, c) {
			return this._cls[n.toLowerCase()] = c;
		},
	
		/**
		 * Destroy.
		 *
		 * @method destroy
		 */
		destroy : function() {
			each(this.controls, function(c) {
				c.destroy();
			});

			this.controls = null;
		}
	});
})(tinymce);

/**
 * WindowManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isIE = tinymce.isIE, isOpera = tinymce.isOpera;

	/**
	 * This class handles the creation of native windows and dialogs. This class can be extended to provide for example inline dialogs.
	 *
	 * @class tinymce.WindowManager
	 * @example
	 * // Opens a new dialog with the file.htm file and the size 320x240
	 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
	 * tinyMCE.activeEditor.windowManager.open({
	 *    url : 'file.htm',
	 *    width : 320,
	 *    height : 240
	 * }, {
	 *    custom_param : 1
	 * });
	 * 
	 * // Displays an alert box using the active editors window manager instance
	 * tinyMCE.activeEditor.windowManager.alert('Hello world!');
	 * 
	 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
	 * tinyMCE.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
	 *    if (s)
	 *       tinyMCE.activeEditor.windowManager.alert("Ok");
	 *    else
	 *       tinyMCE.activeEditor.windowManager.alert("Cancel");
	 * });
	 */
	tinymce.create('tinymce.WindowManager', {
		/**
		 * Constructs a new window manager instance.
		 *
		 * @constructor
		 * @method WindowManager
		 * @param {tinymce.Editor} ed Editor instance that the windows are bound to.
		 */
		WindowManager : function(ed) {
			var t = this;

			t.editor = ed;
			t.onOpen = new Dispatcher(t);
			t.onClose = new Dispatcher(t);
			t.params = {};
			t.features = {};
		},

		/**
		 * Opens a new window.
		 *
		 * @method open
		 * @param {Object} s Optional name/value settings collection contains things like width/height/url etc.
		 * @option {String} title Window title. 
		 * @option {String} file URL of the file to open in the window. 
		 * @option {Number} width Width in pixels. 
		 * @option {Number} height Height in pixels. 
		 * @option {Boolean} resizable Specifies whether the popup window is resizable or not. 
		 * @option {Boolean} maximizable Specifies whether the popup window has a "maximize" button and can get maximized or not. 
		 * @option {Boolean} inline Specifies whether to display in-line (set to 1 or true for in-line display; requires inlinepopups plugin). 
		 * @option {String/Boolean} popup_css Optional CSS to use in the popup. Set to false to remove the default one. 
		 * @option {Boolean} translate_i18n Specifies whether translation should occur or not of i18 key strings. Default is true. 
		 * @option {String/bool} close_previous Specifies whether a previously opened popup window is to be closed or not (like when calling the file browser window over the advlink popup). 
		 * @option {String/bool} scrollbars Specifies whether the popup window can have scrollbars if required (i.e. content larger than the popup size specified). 
		 * @param {Object} p Optional parameters/arguments collection can be used by the dialogs to retrive custom parameters.
		 * @option {String} plugin_url url to plugin if opening plugin window that calls tinyMCEPopup.requireLangPack() and needs access to the plugin language js files 
		 */
		open : function(s, p) {
			var t = this, f = '', x, y, mo = t.editor.settings.dialog_type == 'modal', w, sw, sh, vp = tinymce.DOM.getViewPort(), u;

			// Default some options
			s = s || {};
			p = p || {};
			sw = isOpera ? vp.w : screen.width; // Opera uses windows inside the Opera window
			sh = isOpera ? vp.h : screen.height;
			s.name = s.name || 'mc_' + new Date().getTime();
			s.width = parseInt(s.width || 320);
			s.height = parseInt(s.height || 240);
			s.resizable = true;
			s.left = s.left || parseInt(sw / 2.0) - (s.width / 2.0);
			s.top = s.top || parseInt(sh / 2.0) - (s.height / 2.0);
			p.inline = false;
			p.mce_width = s.width;
			p.mce_height = s.height;
			p.mce_auto_focus = s.auto_focus;

			if (mo) {
				if (isIE) {
					s.center = true;
					s.help = false;
					s.dialogWidth = s.width + 'px';
					s.dialogHeight = s.height + 'px';
					s.scroll = s.scrollbars || false;
				}
			}

			// Build features string
			each(s, function(v, k) {
				if (tinymce.is(v, 'boolean'))
					v = v ? 'yes' : 'no';

				if (!/^(name|url)$/.test(k)) {
					if (isIE && mo)
						f += (f ? ';' : '') + k + ':' + v;
					else
						f += (f ? ',' : '') + k + '=' + v;
				}
			});

			t.features = s;
			t.params = p;
			t.onOpen.dispatch(t, s, p);

			u = s.url || s.file;
			u = tinymce._addVer(u);

			try {
				if (isIE && mo) {
					w = 1;
					window.showModalDialog(u, window, f);
				} else
					w = window.open(u, s.name, f);
			} catch (ex) {
				// Ignore
			}

			if (!w)
				alert(t.editor.getLang('popup_blocked'));
		},

		/**
		 * Closes the specified window. This will also dispatch out a onClose event.
		 *
		 * @method close
		 * @param {Window} w Native window object to close.
		 */
		close : function(w) {
			w.close();
			this.onClose.dispatch(this);
		},

		/**
		 * Creates a instance of a class. This method was needed since IE can't create instances
		 * of classes from a parent window due to some reference problem. Any arguments passed after the class name
		 * will be passed as arguments to the constructor.
		 *
		 * @method createInstance
		 * @param {String} cl Class name to create an instance of.
		 * @return {Object} Instance of the specified class.
		 * @example
		 * var uri = tinyMCEPopup.editor.windowManager.createInstance('tinymce.util.URI', 'http://www.somesite.com');
		 * alert(uri.getURI());
		 */
		createInstance : function(cl, a, b, c, d, e) {
			var f = tinymce.resolve(cl);

			return new f(a, b, c, d, e);
		},

		/**
		 * Creates a confirm dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @method confirm
		 * @param {String} t Title for the new confirm dialog.
		 * @param {function} cb Callback function to be executed after the user has selected ok or cancel.
		 * @param {Object} s Optional scope to execute the callback in.
		 * @example
		 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
		 * tinyMCE.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
		 *    if (s)
		 *       tinyMCE.activeEditor.windowManager.alert("Ok");
		 *    else
		 *       tinyMCE.activeEditor.windowManager.alert("Cancel");
		 * });
		 */
		confirm : function(t, cb, s, w) {
			w = w || window;

			cb.call(s || this, w.confirm(this._decode(this.editor.getLang(t, t))));
		},

		/**
		 * Creates a alert dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @method alert
		 * @param {String} t Title for the new alert dialog.
		 * @param {function} cb Callback function to be executed after the user has selected ok.
		 * @param {Object} s Optional scope to execute the callback in.
		 * @example
		 * // Displays an alert box using the active editors window manager instance
		 * tinyMCE.activeEditor.windowManager.alert('Hello world!');
		 */
		alert : function(tx, cb, s, w) {
			var t = this;

			w = w || window;
			w.alert(t._decode(t.editor.getLang(tx, tx)));

			if (cb)
				cb.call(s || t);
		},

		/**
		 * Resizes the specified window or id.
		 *
		 * @param {Number} dw Delta width.
		 * @param {Number} dh Delta height.
		 * @param {window/id} win Window if the dialog isn't inline. Id if the dialog is inline.
		 */
		resizeBy : function(dw, dh, win) {
			win.resizeBy(dw, dh);
		},

		// Internal functions

		_decode : function(s) {
			return tinymce.DOM.decode(s).replace(/\\n/g, '\n');
		}
	});
}(tinymce));
/**
 * Formatter.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * Text formatter engine class. This class is used to apply formats like bold, italic, font size
	 * etc to the current selection or specific nodes. This engine was build to replace the browsers
	 * default formatting logic for execCommand due to it's inconsistant and buggy behavior.
	 *
	 * @class tinymce.Formatter
	 * @example
	 *  tinymce.activeEditor.formatter.register('mycustomformat', {
	 *    inline : 'span',
	 *    styles : {color : '#ff0000'}
	 *  });
	 *
	 *  tinymce.activeEditor.formatter.apply('mycustomformat');
	 */

	/**
	 * Constructs a new formatter instance.
	 *
	 * @constructor Formatter
	 * @param {tinymce.Editor} ed Editor instance to construct the formatter engine to.
	 */
	tinymce.Formatter = function(ed) {
		var formats = {},
			each = tinymce.each,
			dom = ed.dom,
			selection = ed.selection,
			TreeWalker = tinymce.dom.TreeWalker,
			rangeUtils = new tinymce.dom.RangeUtils(dom),
			isValid = ed.schema.isValidChild,
			isBlock = dom.isBlock,
			forcedRootBlock = ed.settings.forced_root_block,
			nodeIndex = dom.nodeIndex,
			INVISIBLE_CHAR = '\uFEFF',
			MCE_ATTR_RE = /^(src|href|style)$/,
			FALSE = false,
			TRUE = true,
			undefined;

		function isArray(obj) {
			return obj instanceof Array;
		};

		function getParents(node, selector) {
			return dom.getParents(node, selector, dom.getRoot());
		};

		function isCaretNode(node) {
			return node.nodeType === 1 && node.id === '_mce_caret';
		};

		// Public functions

		/**
		 * Returns the format by name or all formats if no name is specified.
		 *
		 * @method get
		 * @param {String} name Optional name to retrive by.
		 * @return {Array/Object} Array/Object with all registred formats or a specific format.
		 */
		function get(name) {
			return name ? formats[name] : formats;
		};

		/**
		 * Registers a specific format by name.
		 *
		 * @method register
		 * @param {Object/String} name Name of the format for example "bold".
		 * @param {Object/Array} format Optional format object or array of format variants can only be omitted if the first arg is an object.
		 */
		function register(name, format) {
			if (name) {
				if (typeof(name) !== 'string') {
					each(name, function(format, name) {
						register(name, format);
					});
				} else {
					// Force format into array and add it to internal collection
					format = format.length ? format : [format];

					each(format, function(format) {
						// Set deep to false by default on selector formats this to avoid removing
						// alignment on images inside paragraphs when alignment is changed on paragraphs
						if (format.deep === undefined)
							format.deep = !format.selector;

						// Default to true
						if (format.split === undefined)
							format.split = !format.selector || format.inline;

						// Default to true
						if (format.remove === undefined && format.selector && !format.inline)
							format.remove = 'none';

						// Mark format as a mixed format inline + block level
						if (format.selector && format.inline) {
							format.mixed = true;
							format.block_expand = true;
						}

						// Split classes if needed
						if (typeof(format.classes) === 'string')
							format.classes = format.classes.split(/\s+/);
					});

					formats[name] = format;
				}
			}
		};

		var getTextDecoration = function(node) {
			var decoration;

			ed.dom.getParent(node, function(n) {
				decoration = ed.dom.getStyle(n, 'text-decoration');
				return decoration && decoration !== 'none';
			});

			return decoration;
		};

		var processUnderlineAndColor = function(node) {
			var textDecoration;
			if (node.nodeType === 1 && node.parentNode && node.parentNode.nodeType === 1) {
				textDecoration = getTextDecoration(node.parentNode);
				if (ed.dom.getStyle(node, 'color') && textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', textDecoration);
				} else if (ed.dom.getStyle(node, 'textdecoration') === textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', null);
				}
			}
		};

		/**
		 * Applies the specified format to the current selection or specified node.
		 *
		 * @method apply
		 * @param {String} name Name of format to apply.
		 * @param {Object} vars Optional list of variables to replace within format before applying it.
		 * @param {Node} node Optional node to apply the format to defaults to current selection.
		 */
		function apply(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, rng, i, isCollapsed = selection.isCollapsed();

			function setElementFormat(elm, fmt) {
				fmt = fmt || format;

				if (elm) {
					if (fmt.onformat) {
						fmt.onformat(elm, fmt, vars, node);
					}

					each(fmt.styles, function(value, name) {
						dom.setStyle(elm, name, replaceVars(value, vars));
					});

					each(fmt.attributes, function(value, name) {
						dom.setAttrib(elm, name, replaceVars(value, vars));
					});

					each(fmt.classes, function(value) {
						value = replaceVars(value, vars);

						if (!dom.hasClass(elm, value))
							dom.addClass(elm, value);
					});
				}
			};
			function adjustSelectionToVisibleSelection() {
				function findSelectionEnd(start, end) {
					var walker = new TreeWalker(end);
					for (node = walker.current(); node; node = walker.prev()) {
						if (node.childNodes.length > 1 || node == start) {
							return node;
						}
					}
				};

				// Adjust selection so that a end container with a end offset of zero is not included in the selection
				// as this isn't visible to the user.
				var rng = ed.selection.getRng();
				var start = rng.startContainer;
				var end = rng.endContainer;

				if (start != end && rng.endOffset == 0) {
					var newEnd = findSelectionEnd(start, end);
					var endOffset = newEnd.nodeType == 3 ? newEnd.length : newEnd.childNodes.length;

					rng.setEnd(newEnd, endOffset);
				}

				return rng;
			}

			function applyRngStyle(rng, bookmark, node_specific) {
				var newWrappers = [], wrapName, wrapElm;

				// Setup wrapper element
				wrapName = format.inline || format.block;
				wrapElm = dom.create(wrapName);
				setElementFormat(wrapElm);

				rangeUtils.walk(rng, function(nodes) {
					var currentWrapElm;

					/**
					 * Process a list of nodes wrap them.
					 */
					function process(node) {
						var nodeName = node.nodeName.toLowerCase(), parentName = node.parentNode.nodeName.toLowerCase(), found;

						// Stop wrapping on br elements
						if (isEq(nodeName, 'br')) {
							currentWrapElm = 0;

							// Remove any br elements when we wrap things
							if (format.block)
								dom.remove(node);

							return;
						}

						// If node is wrapper type
						if (format.wrapper && matchNode(node, name, vars)) {
							currentWrapElm = 0;
							return;
						}

						// Can we rename the block
						if (format.block && !format.wrapper && isTextBlock(nodeName)) {
							node = dom.rename(node, wrapName);
							setElementFormat(node);
							newWrappers.push(node);
							currentWrapElm = 0;
							return;
						}

						// Handle selector patterns
						if (format.selector) {
							// Look for matching formats
							each(formatList, function(format) {
								// Check collapsed state if it exists
								if ('collapsed' in format && format.collapsed !== isCollapsed) {
									return;
								}

								if (dom.is(node, format.selector) && !isCaretNode(node)) {
									setElementFormat(node, format);
									found = true;
								}
							});

							// Continue processing if a selector match wasn't found and a inline element is defined
							if (!format.inline || found) {
								currentWrapElm = 0;
								return;
							}
						}

						// Is it valid to wrap this item
						if (isValid(wrapName, nodeName) && isValid(parentName, wrapName) &&
								!(!node_specific && node.nodeType === 3 && node.nodeValue.length === 1 && node.nodeValue.charCodeAt(0) === 65279) && !isCaretNode(node)) {
							// Start wrapping
							if (!currentWrapElm) {
								// Wrap the node
								currentWrapElm = wrapElm.cloneNode(FALSE);
								node.parentNode.insertBefore(currentWrapElm, node);
								newWrappers.push(currentWrapElm);
							}

							currentWrapElm.appendChild(node);
						} else {
							// Start a new wrapper for possible children
							currentWrapElm = 0;

							each(tinymce.grep(node.childNodes), process);

							// End the last wrapper
							currentWrapElm = 0;
						}
					};

					// Process siblings from range
					each(nodes, process);
				});

				// Wrap links inside as well, for example color inside a link when the wrapper is around the link
				if (format.wrap_links === false) {
					each(newWrappers, function(node) {
						function process(node) {
							var i, currentWrapElm, children;

							if (node.nodeName === 'A') {
								currentWrapElm = wrapElm.cloneNode(FALSE);
								newWrappers.push(currentWrapElm);

								children = tinymce.grep(node.childNodes);
								for (i = 0; i < children.length; i++)
									currentWrapElm.appendChild(children[i]);

								node.appendChild(currentWrapElm);
							}

							each(tinymce.grep(node.childNodes), process);
						};

						process(node);
					});
				}

				// Cleanup
				each(newWrappers, function(node) {
					var childCount;

					function getChildCount(node) {
						var count = 0;

						each(node.childNodes, function(node) {
							if (!isWhiteSpaceNode(node) && !isBookmarkNode(node))
								count++;
						});

						return count;
					};

					function mergeStyles(node) {
						var child, clone;

						each(node.childNodes, function(node) {
							if (node.nodeType == 1 && !isBookmarkNode(node) && !isCaretNode(node)) {
								child = node;
								return FALSE; // break loop
							}
						});

						// If child was found and of the same type as the current node
						if (child && matchName(child, format)) {
							clone = child.cloneNode(FALSE);
							setElementFormat(clone);

							dom.replace(clone, node, TRUE);
							dom.remove(child, 1);
						}

						return clone || node;
					};

					childCount = getChildCount(node);

					// Remove empty nodes but only if there is multiple wrappers and they are not block
					// elements so never remove single <h1></h1> since that would remove the currrent empty block element where the caret is at
					if ((newWrappers.length > 1 || !isBlock(node)) && childCount === 0) {
						dom.remove(node, 1);
						return;
					}

					if (format.inline || format.wrapper) {
						// Merges the current node with it's children of similar type to reduce the number of elements
						if (!format.exact && childCount === 1)
							node = mergeStyles(node);

						// Remove/merge children
						each(formatList, function(format) {
							// Merge all children of similar type will move styles from child to parent
							// this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
							// will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
							each(dom.select(format.inline, node), function(child) {
								var parent;

								// When wrap_links is set to false we don't want
								// to remove the format on children within links
								if (format.wrap_links === false) {
									parent = child.parentNode;

									do {
										if (parent.nodeName === 'A')
											return;
									} while (parent = parent.parentNode);
								}

								removeFormat(format, vars, child, format.exact ? child : null);
							});
						});

						// Remove child if direct parent is of same type
						if (matchNode(node.parentNode, name, vars)) {
							dom.remove(node, 1);
							node = 0;
							return TRUE;
						}

						// Look for parent with similar style format
						if (format.merge_with_parents) {
							dom.getParent(node.parentNode, function(parent) {
								if (matchNode(parent, name, vars)) {
									dom.remove(node, 1);
									node = 0;
									return TRUE;
								}
							});
						}

						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						if (node && format.merge_siblings !== false) {
							node = mergeSiblings(getNonWhiteSpaceSibling(node), node);
							node = mergeSiblings(node, getNonWhiteSpaceSibling(node, TRUE));
						}
					}
				});
			};

			if (format) {
				if (node) {
					if (node.nodeType) {
					    rng = dom.createRng();
					    rng.setStartBefore(node);
					    rng.setEndAfter(node);
						applyRngStyle(expandRng(rng, formatList), null, true);
					} else {
						applyRngStyle(node, null, true);
					}
				} else {
					if (!isCollapsed || !format.inline || dom.select('td.mceSelected,th.mceSelected').length) {

						// CONFDEV-32673 Formatting cannot be applied to the numbering column
						if (dom.select('td.mceSelected.numberingColumn').length) {
							return;
						}

						// Obtain selection node before selection is unselected by applyRngStyle()
						var curSelNode = ed.selection.getNode();

						// Apply formatting to selection
						ed.selection.setRng(adjustSelectionToVisibleSelection());
						bookmark = selection.getBookmark();
						applyRngStyle(expandRng(selection.getRng(TRUE), formatList), bookmark);

						// Colored nodes should be underlined so that the color of the underline matches the text color.
						if (format.styles && (format.styles.color || format.styles.textDecoration)) {
							tinymce.walk(curSelNode, processUnderlineAndColor, 'childNodes');
							processUnderlineAndColor(curSelNode);
						}

						selection.moveToBookmark(bookmark);
						moveStart(selection.getRng(TRUE));
						ed.nodeChanged();
					} else
						performCaretAction('apply', name, vars);
				}
			}
		};

		/**
		 * Removes the specified format from the current selection or specified node.
		 *
		 * @method remove
		 * @param {String} name Name of format to remove.
		 * @param {Object} vars Optional list of variables to replace within format before removing it.
		 * @param {Node/Range} node Optional node or DOM range to remove the format from defaults to current selection.
		 */
		function remove(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, i, rng;

			// Merges the styles for each node
			function process(node) {
				var children, i, l;

				// Grab the children first since the nodelist might be changed
				children = tinymce.grep(node.childNodes);

				// Process current node
				for (i = 0, l = formatList.length; i < l; i++) {
					if (removeFormat(formatList[i], vars, node, node))
						break;
				}

				// Process the children
				if (format.deep) {
					for (i = 0, l = children.length; i < l; i++)
						process(children[i]);
				}
			};

			function findFormatRoot(container) {
				var formatRoot;

				// Find format root
				each(getParents(container.parentNode).reverse(), function(parent) {
					var format;

					// Find format root element
					if (!formatRoot && parent.id != '_start' && parent.id != '_end') {
						// Is the node matching the format we are looking for
						format = matchNode(parent, name, vars);
						if (format && format.split !== false)
							formatRoot = parent;
					}
				});

				return formatRoot;
			};

			function wrapAndSplit(format_root, container, target, split) {
				var parent, clone, lastClone, firstClone, i, formatRootParent;

				// Format root found then clone formats and split it
				if (format_root) {
					formatRootParent = format_root.parentNode;

					for (parent = container.parentNode; parent && parent != formatRootParent; parent = parent.parentNode) {
						clone = parent.cloneNode(FALSE);

						for (i = 0; i < formatList.length; i++) {
							if (removeFormat(formatList[i], vars, clone, clone)) {
								clone = 0;
								break;
							}
						}

						// Build wrapper node
						if (clone) {
							if (lastClone)
								clone.appendChild(lastClone);

							if (!firstClone)
								firstClone = clone;

							lastClone = clone;
						}
					}

					// Never split block elements if the format is mixed
					if (split && (!format.mixed || !isBlock(format_root)))
						container = dom.split(format_root, container);

					// Wrap container in cloned formats
					if (lastClone) {
						target.parentNode.insertBefore(lastClone, target);
						firstClone.appendChild(target);
					}
				}

				return container;
			};

			function splitToFormatRoot(container) {
				return wrapAndSplit(findFormatRoot(container), container, container, true);
			};

			function unwrap(start) {
				var node = dom.get(start ? '_start' : '_end'),
					out = node[start ? 'firstChild' : 'lastChild'];

				// If the end is placed within the start the result will be removed
				// So this checks if the out node is a bookmark node if it is it
				// checks for another more suitable node
				if (isBookmarkNode(out))
					out = out[start ? 'firstChild' : 'lastChild'];

				dom.remove(node, true);

				return out;
			};

			function removeRngStyle(rng) {
				var startContainer, endContainer, node;

				rng = expandRng(rng, formatList, TRUE);

				if (format.split) {
					startContainer = getContainer(rng, TRUE);
					endContainer = getContainer(rng);

					if (startContainer != endContainer) {
                        // WebKit will render the table incorrectly if we wrap a TD in a SPAN so lets see if the can use the first child instead
                        // This will happen if you tripple click a table cell and use remove formatting
                        node = startContainer.firstChild;
                        if (startContainer.nodeName == "TD" && node) {
                            startContainer = node;
                        }

                        // Wrap start/end nodes in span element since these might be cloned/moved
						startContainer = wrap(startContainer, 'span', {id : '_start', 'data-mce-type' : 'bookmark'});
						endContainer = wrap(endContainer, 'span', {id : '_end', 'data-mce-type' : 'bookmark'});

						// Split start/end
						splitToFormatRoot(startContainer);
						splitToFormatRoot(endContainer);

						// Unwrap start/end to get real elements again
						startContainer = unwrap(TRUE);
						endContainer = unwrap();
					} else
						startContainer = endContainer = splitToFormatRoot(startContainer);

					// Update range positions since they might have changed after the split operations
					rng.startContainer = startContainer.parentNode;
					rng.startOffset = nodeIndex(startContainer);
					rng.endContainer = endContainer.parentNode;
					rng.endOffset = nodeIndex(endContainer) + 1;
				}

				// Remove items between start/end
				rangeUtils.walk(rng, function(nodes) {
					each(nodes, function(node) {
						process(node);

						// Remove parent span if it only contains text-decoration: underline, yet a parent node is also underlined.
						if (node.nodeType === 1 && ed.dom.getStyle(node, 'text-decoration') === 'underline' && node.parentNode && getTextDecoration(node.parentNode) === 'underline') {
							removeFormat({'deep': false, 'exact': true, 'inline': 'span', 'styles': {'textDecoration' : 'underline'}}, null, node);
						}
					});
				});
			};

			// Handle node
			if (node) {
				if (node.nodeType) {
				rng = dom.createRng();
				rng.setStartBefore(node);
				rng.setEndAfter(node);
				removeRngStyle(rng);
				} else {
					removeRngStyle(node);
				}

				return;
			}

			if (!selection.isCollapsed() || !format.inline || dom.select('td.mceSelected,th.mceSelected').length) {

				// CONFDEV-32673 Formatting cannot be applied to the numbering column
				if (dom.select('td.mceSelected.numberingColumn').length) {
					return;
				}

				bookmark = selection.getBookmark();
				removeRngStyle(selection.getRng(TRUE));
				selection.moveToBookmark(bookmark);

				// Check if start element still has formatting then we are at: "<b>text|</b>text" and need to move the start into the next text node
				if (format.inline && match(name, vars, selection.getStart())) {
					moveStart(selection.getRng(true));
				}

				ed.nodeChanged();
			} else
				performCaretAction('remove', name, vars);
		};

		/**
		 * Toggles the specified format on/off.
		 *
		 * @method toggle
		 * @param {String} name Name of format to apply/remove.
		 * @param {Object} vars Optional list of variables to replace within format before applying/removing it.
		 * @param {Node} node Optional node to apply the format to or remove from. Defaults to current selection.
		 */
		function toggle(name, vars, node) {
			var fmt = get(name);

			if (match(name, vars, node) && (!('toggle' in fmt[0]) || fmt[0]['toggle']))
				remove(name, vars, node);
			else
				apply(name, vars, node);
		};

		/**
		 * Return true/false if the specified node has the specified format.
		 *
		 * @method matchNode
		 * @param {Node} node Node to check the format on.
		 * @param {String} name Format name to check.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @param {Boolean} similar Match format that has similar properties.
		 * @return {Object} Returns the format object it matches or undefined if it doesn't match.
		 */
		function matchNode(node, name, vars, similar) {
			var formatList = get(name), format, i, classes;

			function matchItems(node, format, item_name) {
				var key, value, items = format[item_name], i;

				// Custom match
				if (format.onmatch) {
					return format.onmatch(node, format, item_name);
				}

				// Check all items
				if (items) {
					// Non indexed object
					if (items.length === undefined) {
						for (key in items) {
							if (items.hasOwnProperty(key)) {
								if (item_name === 'attributes')
									value = dom.getAttrib(node, key);
								else
									value = getStyle(node, key);

								if (similar && !value && !format.exact)
									return;

								if ((!similar || format.exact) && !isEq(value, replaceVars(items[key], vars)))
									return;
							}
						}
					} else {
						// Only one match needed for indexed arrays
						for (i = 0; i < items.length; i++) {
							if (item_name === 'attributes' ? dom.getAttrib(node, items[i]) : getStyle(node, items[i]))
								return format;
						}
					}
				}

				return format;
			};

			if (formatList && node) {
				// Check each format in list
				for (i = 0; i < formatList.length; i++) {
					format = formatList[i];

					// Name name, attributes, styles and classes
					if (matchName(node, format) && matchItems(node, format, 'attributes') && matchItems(node, format, 'styles')) {
						// Match classes
						if (classes = format.classes) {
							for (i = 0; i < classes.length; i++) {
								if (!dom.hasClass(node, classes[i]))
									return;
							}
						}

						return format;
					}
				}
			}
		};

		/**
		 * Matches the current selection or specified node against the specified format name.
		 *
		 * @method match
		 * @param {String} name Name of format to match.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @param {Node} node Optional node to check.
		 * @return {boolean} true/false if the specified selection/node matches the format.
		 */
		function match(name, vars, node) {
			var startNode;

			function matchParents(node) {
				// Find first node with similar format settings
				node = dom.getParent(node, function(node) {
					return !!matchNode(node, name, vars, true);
				});

				// Do an exact check on the similar format element
				return matchNode(node, name, vars);
			};

			// Check specified node
			if (node)
				return matchParents(node);

			// Check selected node
			node = selection.getNode();
			if (matchParents(node))
				return TRUE;

			// Check start node if it's different
			startNode = selection.getStart();
			if (startNode != node) {
				if (matchParents(startNode))
					return TRUE;
			}

			return FALSE;
		};

		/**
		 * Matches the current selection against the array of formats and returns a new array with matching formats.
		 *
		 * @method matchAll
		 * @param {Array} names Name of format to match.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @return {Array} Array with matched formats.
		 */
		function matchAll(names, vars) {
			var startElement, matchedFormatNames = [], checkedMap = {}, i, ni, name;

			// Check start of selection for formats
			startElement = selection.getStart();
			dom.getParent(startElement, function(node) {
				var i, name;

				for (i = 0; i < names.length; i++) {
					name = names[i];

					if (!checkedMap[name] && matchNode(node, name, vars)) {
						checkedMap[name] = true;
						matchedFormatNames.push(name);
					}
				}
			});

			return matchedFormatNames;
		};

		/**
		 * Returns true/false if the specified format can be applied to the current selection or not. It will currently only check the state for selector formats, it returns true on all other format types.
		 *
		 * @method canApply
		 * @param {String} name Name of format to check.
		 * @return {boolean} true/false if the specified format can be applied to the current selection/node.
		 */
		function canApply(name) {
			var formatList = get(name), startNode, parents, i, x, selector;

			if (formatList) {
				startNode = selection.getStart();
				parents = getParents(startNode);

				for (x = formatList.length - 1; x >= 0; x--) {
					selector = formatList[x].selector;

					// Format is not selector based, then always return TRUE
					if (!selector)
						return TRUE;

					for (i = parents.length - 1; i >= 0; i--) {
						if (dom.is(parents[i], selector))
							return TRUE;
					}
				}
			}

			return FALSE;
		};

		// Expose to public
		tinymce.extend(this, {
			get : get,
			register : register,
			apply : apply,
			remove : remove,
			toggle : toggle,
			match : match,
			matchAll : matchAll,
			matchNode : matchNode,
			canApply : canApply
		});

		// Private functions

		/**
		 * Checks if the specified nodes name matches the format inline/block or selector.
		 *
		 * @private
		 * @param {Node} node Node to match against the specified format.
		 * @param {Object} format Format object o match with.
		 * @return {boolean} true/false if the format matches.
		 */
		function matchName(node, format) {
			// Check for inline match
			if (isEq(node, format.inline))
				return TRUE;

			// Check for block match
			if (isEq(node, format.block))
				return TRUE;

			// Check for selector match
			if (format.selector)
				return dom.is(node, format.selector);
		};

		/**
		 * Compares two string/nodes regardless of their case.
		 *
		 * @private
		 * @param {String/Node} Node or string to compare.
		 * @param {String/Node} Node or string to compare.
		 * @return {boolean} True/false if they match.
		 */
		function isEq(str1, str2) {
			str1 = str1 || '';
			str2 = str2 || '';

			str1 = '' + (str1.nodeName || str1);
			str2 = '' + (str2.nodeName || str2);

			return str1.toLowerCase() == str2.toLowerCase();
		};

		/**
		 * Returns the style by name on the specified node. This method modifies the style
		 * contents to make it more easy to match. This will resolve a few browser issues.
		 *
		 * @private
		 * @param {Node} node to get style from.
		 * @param {String} name Style name to get.
		 * @return {String} Style item value.
		 */
		function getStyle(node, name) {
			var styleVal = dom.getStyle(node, name);

			// Force the format to hex
			if (name == 'color' || name == 'backgroundColor')
				styleVal = dom.toHex(styleVal);

			// Opera will return bold as 700
			if (name == 'fontWeight' && styleVal == 700)
				styleVal = 'bold';

			return '' + styleVal;
		};

		/**
		 * Replaces variables in the value. The variable format is %var.
		 *
		 * @private
		 * @param {String} value Value to replace variables in.
		 * @param {Object} vars Name/value array with variables to replace.
		 * @return {String} New value with replaced variables.
		 */
		function replaceVars(value, vars) {
			if (typeof(value) != "string")
				value = value(vars);
			else if (vars) {
				value = value.replace(/%(\w+)/g, function(str, name) {
					return vars[name] || str;
				});
			}

			return value;
		};

		function isWhiteSpaceNode(node) {
			return node && node.nodeType === 3 && /^([\t \r\n]+|)$/.test(node.nodeValue);
		};

		function wrap(node, name, attrs) {
			var wrapper = dom.create(name, attrs);

			node.parentNode.insertBefore(wrapper, node);
			wrapper.appendChild(node);

			return wrapper;
		};

		/**
		 * Expands the specified range like object to depending on format.
		 *
		 * For example on block formats it will move the start/end position
		 * to the beginning of the current block.
		 *
		 * @private
		 * @param {Object} rng Range like object.
		 * @param {Array} formats Array with formats to expand by.
		 * @return {Object} Expanded range like object.
		 */
		function expandRng(rng, format, remove) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset, sibling, lastIdx, leaf, endPoint;

			// This function walks up the tree if there is no siblings before/after the node
			function findParentContainer(start) {
				var container, parent, child, sibling, siblingName;

				container = parent = start ? startContainer : endContainer;
				siblingName = start ? 'previousSibling' : 'nextSibling';
				root = dom.getRoot();

				// If it's a text node and the offset is inside the text
				if (container.nodeType == 3 && !isWhiteSpaceNode(container)) {
					if (start ? startOffset > 0 : endOffset < container.nodeValue.length) {
						return container;
					}
				}

				for (;;) {
					// Stop expanding on block elements
					if (!format[0].block_expand && isBlock(parent))
						return parent;

					// Walk left/right
					for (sibling = parent[siblingName]; sibling; sibling = sibling[siblingName]) {
						if (!isBookmarkNode(sibling) && !isWhiteSpaceNode(sibling)) {
							return parent;
						}
					}

					// Check if we can move up are we at root level or body level
					if (parent.parentNode == root) {
						container = parent;
						break;
					}

					parent = parent.parentNode;
				}

				return container;
			};

			// This function walks down the tree to find the leaf at the selection.
			// The offset is also returned as if node initially a leaf, the offset may be in the middle of the text node.
			function findLeaf(node, offset) {
				if (offset === undefined)
					offset = node.nodeType === 3 ? node.length : node.childNodes.length;
				while (node && node.hasChildNodes()) {
					node = node.childNodes[offset];
					if (node)
						offset = node.nodeType === 3 ? node.length : node.childNodes.length;
				}
				return { node: node, offset: offset };
			}

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes()) {
				lastIdx = startContainer.childNodes.length - 1;
				startContainer = startContainer.childNodes[startOffset > lastIdx ? lastIdx : startOffset];

				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes()) {
				lastIdx = endContainer.childNodes.length - 1;
				endContainer = endContainer.childNodes[endOffset > lastIdx ? lastIdx : endOffset - 1];

				if (endContainer.nodeType == 3)
					endOffset = endContainer.nodeValue.length;
			}

			// Exclude bookmark nodes if possible
			if (isBookmarkNode(startContainer.parentNode) || isBookmarkNode(startContainer)) {
				startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode;
				startContainer = startContainer.nextSibling || startContainer;

				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

			if (isBookmarkNode(endContainer.parentNode) || isBookmarkNode(endContainer)) {
				endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode;
				endContainer = endContainer.previousSibling || endContainer;

				if (endContainer.nodeType == 3)
				endOffset = endContainer.length;
			}

			if (format[0].inline) {
				if (rng.collapsed) {
					function findWordEndPoint(container, offset, start) {
						var walker, node, pos, lastTextNode;

						function findSpace(node, offset) {
							var pos, pos2, str = node.nodeValue;

							if (typeof(offset) == "undefined") {
								offset = start ? str.length : 0;
							}

							if (start) {
								pos = str.lastIndexOf(' ', offset);
								pos2 = str.lastIndexOf('\u00a0', offset);
								pos = pos > pos2 ? pos : pos2;

								// Include the space on remove to avoid tag soup
								if (pos !== -1 && !remove) {
									pos++;
								}
							} else {
								pos = str.indexOf(' ', offset);
								pos2 = str.indexOf('\u00a0', offset);
								pos = pos !== -1 && (pos2 === -1 || pos < pos2) ? pos : pos2;
							}

							return pos;
						};

						if (container.nodeType === 3) {
							pos = findSpace(container, offset);

							if (pos !== -1) {
								return {container : container, offset : pos};
							}

							lastTextNode = container;
						}

						// Walk the nodes inside the block
						walker = new TreeWalker(container, dom.getParent(container, isBlock) || ed.getBody());
						while (node = walker[start ? 'prev' : 'next']()) {
							if (node.nodeType === 3) {
								lastTextNode = node;
								pos = findSpace(node);

								if (pos !== -1) {
									return {container : node, offset : pos};
								}
							} else if (isBlock(node)) {
								break;
							}
						}

						if (lastTextNode) {
							if (start) {
								offset = 0;
							} else {
								offset = lastTextNode.length;
							}

							return {container: lastTextNode, offset: offset};
						}
					}

					// Expand left to closest word boundery
					endPoint = findWordEndPoint(startContainer, startOffset, true);
					if (endPoint) {
						startContainer = endPoint.container;
						startOffset = endPoint.offset;
					}

					// Expand right to closest word boundery
					endPoint = findWordEndPoint(endContainer, endOffset);
					if (endPoint) {
						endContainer = endPoint.container;
						endOffset = endPoint.offset;
					}
				}

				// Avoid applying formatting to a trailing space.
				leaf = findLeaf(endContainer, endOffset);
				if (leaf.node) {
					while (leaf.node && leaf.offset === 0 && leaf.node.previousSibling)
						leaf = findLeaf(leaf.node.previousSibling);

					if (leaf.node && leaf.offset > 0 && leaf.node.nodeType === 3 &&
							leaf.node.nodeValue.charAt(leaf.offset - 1) === ' ') {

						if (leaf.offset > 1) {
							endContainer = leaf.node;
							endContainer.splitText(leaf.offset - 1);
						} else if (leaf.node.previousSibling) {
							// TODO: Figure out why this is in here
							//endContainer = leaf.node.previousSibling;
						}
					}
				}
			}

			// Move start/end point up the tree if the leaves are sharp and if we are in different containers
			// Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
			// This will reduce the number of wrapper elements that needs to be created
			// Move start point up the tree
			if (format[0].inline || format[0].block_expand) {
				if (!format[0].inline || (startContainer.nodeType != 3 || startOffset === 0)) {
					startContainer = findParentContainer(true);
				}

				if (!format[0].inline || (endContainer.nodeType != 3 || endOffset === endContainer.nodeValue.length)) {
					endContainer = findParentContainer();
				}
			}

			// Expand start/end container to matching selector
			if (format[0].selector && format[0].expand !== FALSE && !format[0].inline) {
				function findSelectorEndPoint(container, sibling_name) {
					var parents, i, y, curFormat;

					if (container.nodeType == 3 && container.nodeValue.length == 0 && container[sibling_name])
						container = container[sibling_name];

					parents = getParents(container);
					for (i = 0; i < parents.length; i++) {
						for (y = 0; y < format.length; y++) {
							curFormat = format[y];

							// If collapsed state is set then skip formats that doesn't match that
							if ("collapsed" in curFormat && curFormat.collapsed !== rng.collapsed)
								continue;

							if (dom.is(parents[i], curFormat.selector))
								return parents[i];
						}
					}

					return container;
				};

				// Find new startContainer/endContainer if there is better one
				startContainer = findSelectorEndPoint(startContainer, 'previousSibling');
				endContainer = findSelectorEndPoint(endContainer, 'nextSibling');
			}

			// Expand start/end container to matching block element or text node
			if (format[0].block || format[0].selector) {
				function findBlockEndPoint(container, sibling_name, sibling_name2) {
					var node;

					// ATLASSIAN - don't select an element higher than the root, like Document.
					if (container == dom.getRoot()) {
						return container;
					}

					// Expand to block of similar type
					if (!format[0].wrapper)
						node = dom.getParent(container, format[0].block);

					// Expand to first wrappable block element or any block element
					if (!node)
						node = dom.getParent(container.nodeType == 3 ? container.parentNode : container, isBlock);

					// Exclude inner lists from wrapping
					if (node && format[0].wrapper)
						node = getParents(node, 'ul,ol').reverse()[0] || node;

					// Didn't find a block element look for first/last wrappable element
					if (!node) {
						node = container;

						while (node[sibling_name] && !isBlock(node[sibling_name])) {
							node = node[sibling_name];

							// Break on BR but include it will be removed later on
							// we can't remove it now since we need to check if it can be wrapped
							if (isEq(node, 'br'))
								break;
						}
					}

					return node || container;
				};

				// Find new startContainer/endContainer if there is better one
				startContainer = findBlockEndPoint(startContainer, 'previousSibling');
				endContainer = findBlockEndPoint(endContainer, 'nextSibling');

				// Non block element then try to expand up the leaf
				if (format[0].block) {
					if (!isBlock(startContainer))
						startContainer = findParentContainer(true);

					if (!isBlock(endContainer))
						endContainer = findParentContainer();
				}
			}

			// Setup index for startContainer
			if (startContainer.nodeType == 1) {
				startOffset = nodeIndex(startContainer);
				startContainer = startContainer.parentNode;
			}

			// Setup index for endContainer
			if (endContainer.nodeType == 1) {
				endOffset = nodeIndex(endContainer) + 1;
				endContainer = endContainer.parentNode;
			}

			// Return new range like object
			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		}

		/**
		 * Removes the specified format for the specified node. It will also remove the node if it doesn't have
		 * any attributes if the format specifies it to do so.
		 *
		 * @private
		 * @param {Object} format Format object with items to remove from node.
		 * @param {Object} vars Name/value object with variables to apply to format.
		 * @param {Node} node Node to remove the format styles on.
		 * @param {Node} compare_node Optional compare node, if specified the styles will be compared to that node.
		 * @return {Boolean} True/false if the node was removed or not.
		 */
		function removeFormat(format, vars, node, compare_node) {
			var i, attrs, stylesModified;

			// Check if node matches format
			if (!matchName(node, format))
				return FALSE;

			// Should we compare with format attribs and styles
			if (format.remove != 'all') {
				// Remove styles
				each(format.styles, function(value, name) {
					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(getStyle(compare_node, name), value))
						dom.setStyle(node, name, '');

					stylesModified = 1;
				});

				// Remove style attribute if it's empty
				if (stylesModified && dom.getAttrib(node, 'style') == '') {
					node.removeAttribute('style');
					node.removeAttribute('data-mce-style');
				}

				// Remove attributes
				each(format.attributes, function(value, name) {
					var valueOut;

					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(dom.getAttrib(compare_node, name), value)) {
						// Keep internal classes
						if (name == 'class') {
							value = dom.getAttrib(node, name);
							if (value) {
								// Build new class value where everything is removed except the internal prefixed classes
								valueOut = '';
								each(value.split(/\s+/), function(cls) {
									if (/mce\w+/.test(cls))
										valueOut += (valueOut ? ' ' : '') + cls;
								});

								// We got some internal classes left
								if (valueOut) {
									dom.setAttrib(node, name, valueOut);
									return;
								}
							}
						}

						// IE6 has a bug where the attribute doesn't get removed correctly
						if (name == "class")
							node.removeAttribute('className');

						// Remove mce prefixed attributes
						if (MCE_ATTR_RE.test(name))
							node.removeAttribute('data-mce-' + name);

						node.removeAttribute(name);
					}
				});

				// Remove classes
				each(format.classes, function(value) {
					value = replaceVars(value, vars);

					if (!compare_node || dom.hasClass(compare_node, value))
						dom.removeClass(node, value);
				});

				// Check for non internal attributes
				attrs = dom.getAttribs(node);
				for (i = 0; i < attrs.length; i++) {
					if (attrs[i].nodeName.indexOf('_') !== 0)
						return FALSE;
				}
			}

			// Remove the inline child if it's empty for example <b> or <span>
			if (format.remove != 'none') {
				removeNode(node, format);
				return TRUE;
			}
		};

		/**
		 * Removes the node and wrap it's children in paragraphs before doing so or
		 * appends BR elements to the beginning/end of the block element if forcedRootBlocks is disabled.
		 *
		 * If the div in the node below gets removed:
		 *  text<div>text</div>text
		 *
		 * Output becomes:
		 *  text<div><br />text<br /></div>text
		 *
		 * So when the div is removed the result is:
		 *  text<br />text<br />text
		 *
		 * @private
		 * @param {Node} node Node to remove + apply BR/P elements to.
		 * @param {Object} format Format rule.
		 * @return {Node} Input node.
		 */
		function removeNode(node, format) {
			var parentNode = node.parentNode, rootBlockElm;

			if (format.block) {
				if (!forcedRootBlock) {
					function find(node, next, inc) {
						node = getNonWhiteSpaceSibling(node, next, inc);

						return !node || (node.nodeName == 'BR' || isBlock(node));
					};

					// Append BR elements if needed before we remove the block
					if (isBlock(node) && !isBlock(parentNode)) {
						if (!find(node, FALSE) && !find(node.firstChild, TRUE, 1))
							node.insertBefore(dom.create('br'), node.firstChild);

						if (!find(node, TRUE) && !find(node.lastChild, FALSE, 1))
							node.appendChild(dom.create('br'));
					}
				} else {
					// Wrap the block in a forcedRootBlock if we are at the root of document
					if (parentNode == dom.getRoot()) {
						if (!format.list_block || !isEq(node, format.list_block)) {
							each(tinymce.grep(node.childNodes), function(node) {
								if (isValid(forcedRootBlock, node.nodeName.toLowerCase())) {
									if (!rootBlockElm)
										rootBlockElm = wrap(node, forcedRootBlock);
									else
										rootBlockElm.appendChild(node);
								} else
									rootBlockElm = 0;
							});
						}
					}
				}
			}

			// Never remove nodes that isn't the specified inline element if a selector is specified too
			if (format.selector && format.inline && !isEq(format.inline, node))
				return;

			dom.remove(node, 1);
		};

		/**
		 * Returns the next/previous non whitespace node.
		 *
		 * @private
		 * @param {Node} node Node to start at.
		 * @param {boolean} next (Optional) Include next or previous node defaults to previous.
		 * @param {boolean} inc (Optional) Include the current node in checking. Defaults to false.
		 * @return {Node} Next or previous node or undefined if it wasn't found.
		 */
		function getNonWhiteSpaceSibling(node, next, inc) {
			if (node) {
				next = next ? 'nextSibling' : 'previousSibling';

				for (node = inc ? node : node[next]; node; node = node[next]) {
					if (node.nodeType == 1 || !isWhiteSpaceNode(node))
						return node;
				}
			}
		};

		/**
		 * Checks if the specified node is a bookmark node or not.
		 *
		 * @param {Node} node Node to check if it's a bookmark node or not.
		 * @return {Boolean} true/false if the node is a bookmark node.
		 */
		function isBookmarkNode(node) {
			return node && node.nodeType == 1 && node.getAttribute('data-mce-type') == 'bookmark';
		};

		/**
		 * Merges the next/previous sibling element if they match.
		 *
		 * @private
		 * @param {Node} prev Previous node to compare/merge.
		 * @param {Node} next Next node to compare/merge.
		 * @return {Node} Next node if we didn't merge and prev node if we did.
		 */
		function mergeSiblings(prev, next) {
			var marker, sibling, tmpSibling;

			/**
			 * Compares two nodes and checks if it's attributes and styles matches.
			 * This doesn't compare classes as items since their order is significant.
			 *
			 * @private
			 * @param {Node} node1 First node to compare with.
			 * @param {Node} node2 Second node to compare with.
			 * @return {boolean} True/false if the nodes are the same or not.
			 */
			function compareElements(node1, node2) {
				// Not the same name
				if (node1.nodeName != node2.nodeName)
					return FALSE;

				/**
				 * Returns all the nodes attributes excluding internal ones, styles and classes.
				 *
				 * @private
				 * @param {Node} node Node to get attributes from.
				 * @return {Object} Name/value object with attributes and attribute values.
				 */
				function getAttribs(node) {
					var attribs = {};

					each(dom.getAttribs(node), function(attr) {
						var name = attr.nodeName.toLowerCase();

						// Don't compare internal attributes or style
						if (name.indexOf('_') !== 0 && name !== 'style')
							attribs[name] = dom.getAttrib(node, name);
					});

					return attribs;
				};

				/**
				 * Compares two objects checks if it's key + value exists in the other one.
				 *
				 * @private
				 * @param {Object} obj1 First object to compare.
				 * @param {Object} obj2 Second object to compare.
				 * @return {boolean} True/false if the objects matches or not.
				 */
				function compareObjects(obj1, obj2) {
					var value, name;

					for (name in obj1) {
						// Obj1 has item obj2 doesn't have
						if (obj1.hasOwnProperty(name)) {
							value = obj2[name];

							// Obj2 doesn't have obj1 item
							if (value === undefined)
								return FALSE;

							// Obj2 item has a different value
							if (obj1[name] != value)
								return FALSE;

							// Delete similar value
							delete obj2[name];
						}
					}

					// Check if obj 2 has something obj 1 doesn't have
					for (name in obj2) {
						// Obj2 has item obj1 doesn't have
						if (obj2.hasOwnProperty(name))
							return FALSE;
					}

					return TRUE;
				};

				// Attribs are not the same
				if (!compareObjects(getAttribs(node1), getAttribs(node2)))
					return FALSE;

				// Styles are not the same
				if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style'))))
					return FALSE;

				return TRUE;
			};

			// Check if next/prev exists and that they are elements
			if (prev && next) {
				function findElementSibling(node, sibling_name) {
					for (sibling = node; sibling; sibling = sibling[sibling_name]) {
						if (sibling.nodeType == 3 && sibling.nodeValue.length !== 0)
							return node;

						if (sibling.nodeType == 1 && !isBookmarkNode(sibling))
							return sibling;
					}

					return node;
				};

				// If previous sibling is empty then jump over it
				prev = findElementSibling(prev, 'previousSibling');
				next = findElementSibling(next, 'nextSibling');

				// Compare next and previous nodes
				if (compareElements(prev, next)) {
					// Append nodes between
					for (sibling = prev.nextSibling; sibling && sibling != next;) {
						tmpSibling = sibling;
						sibling = sibling.nextSibling;
						prev.appendChild(tmpSibling);
					}

					// Remove next node
					dom.remove(next);

					// Move children into prev node
					each(tinymce.grep(next.childNodes), function(node) {
						prev.appendChild(node);
					});

					return prev;
				}
			}

			return next;
		};

		/**
		 * Returns true/false if the specified node is a text block or not.
		 *
		 * @private
		 * @param {Node} node Node to check.
		 * @return {boolean} True/false if the node is a text block.
		 */
		function isTextBlock(name) {
			return /^(h[1-6]|p|div|pre|address|dl|dt|dd)$/.test(name);
		};

		function getContainer(rng, start) {
			var container, offset, lastIdx, walker;

			container = rng[start ? 'startContainer' : 'endContainer'];
			offset = rng[start ? 'startOffset' : 'endOffset'];

			if (container.nodeType == 1) {
				lastIdx = container.childNodes.length - 1;

				if (!start && offset)
					offset--;

				container = container.childNodes[offset > lastIdx ? lastIdx : offset];
			}

			// If start text node is excluded then walk to the next node
			if (container.nodeType === 3 && start && offset >= container.nodeValue.length) {
				container = new TreeWalker(container, ed.getBody()).next() || container;
			}

			// If end text node is excluded then walk to the previous node
			if (container.nodeType === 3 && !start && offset == 0) {
				container = new TreeWalker(container, ed.getBody()).prev() || container;
			}

			return container;
		};

		function performCaretAction(type, name, vars) {
			var invisibleChar, caretContainerId = '_mce_caret', debug = ed.settings.caret_debug;

			// Setup invisible character use zero width space on Gecko since it doesn't change the heigt of the container
			invisibleChar = tinymce.isGecko ? '\u200B' : INVISIBLE_CHAR;

			// Creates a caret container bogus element
			function createCaretContainer(fill) {
				var caretContainer = dom.create('span', {id: caretContainerId, 'data-mce-bogus': true, style: debug ? 'color:red' : ''});

				if (fill) {
					caretContainer.appendChild(ed.getDoc().createTextNode(invisibleChar));
				}

				return caretContainer;
			};

			function isCaretContainerEmpty(node, nodes) {
				while (node) {
					if ((node.nodeType === 3 && node.nodeValue !== invisibleChar) || node.childNodes.length > 1) {
						return false;
					}

					// Collect nodes
					if (nodes && node.nodeType === 1) {
						nodes.push(node);
					}

					node = node.firstChild;
				}

				return true;
			};

			// Returns any parent caret container element
			function getParentCaretContainer(node) {
				while (node) {
					if (node.id === caretContainerId) {
						return node;
					}

					node = node.parentNode;
				}
			};

			// Finds the first text node in the specified node
			function findFirstTextNode(node) {
				var walker;

				if (node) {
					walker = new TreeWalker(node, node);

					for (node = walker.current(); node; node = walker.next()) {
						if (node.nodeType === 3) {
							return node;
						}
					}
				}
			};

			// Removes the caret container for the specified node or all on the current document
			function removeCaretContainer(node, move_caret) {
				var child, rng;

				if (!node) {
					node = getParentCaretContainer(selection.getStart());

					if (!node) {
						while (node = dom.get(caretContainerId)) {
							removeCaretContainer(node, false);
						}
			}
				} else {
					rng = selection.getRng(true);

					if (isCaretContainerEmpty(node)) {
						if (move_caret !== false) {
							rng.setStartBefore(node);
							rng.setEndBefore(node);
						}

						dom.remove(node);
					} else {
						child = findFirstTextNode(node);

						if (child.nodeValue.charAt(0) === INVISIBLE_CHAR) {
							child = child.deleteData(0, 1);
						}

						dom.remove(node, 1);
					}

					selection.setRng(rng);
			}
			};

			// Applies formatting to the caret postion
			function applyCaretFormat() {
				var rng, caretContainer, textNode, offset, bookmark, container, text;

				rng = selection.getRng(true);
				offset = rng.startOffset;
				container = rng.startContainer;
				text = container.nodeValue;

				caretContainer = getParentCaretContainer(selection.getStart());
				if (caretContainer) {
					textNode = findFirstTextNode(caretContainer);
				}

				// Expand to word is caret is in the middle of a text node and the char before/after is a alpha numeric character
				if (text && offset > 0 && offset < text.length && /\w/.test(text.charAt(offset)) && /\w/.test(text.charAt(offset - 1))) {
					// Get bookmark of caret position
						bookmark = selection.getBookmark();

					// Collapse bookmark range (WebKit)
					rng.collapse(true);

					// Expand the range to the closest word and split it at those points
					rng = expandRng(rng, get(name));
					rng = rangeUtils.split(rng);

					// Apply the format to the range
					apply(name, vars, rng);

					// Move selection back to caret position
						selection.moveToBookmark(bookmark);
				} else {
					if (!caretContainer || textNode.nodeValue !== invisibleChar) {
						caretContainer = createCaretContainer(true);
						textNode = caretContainer.firstChild;

						rng.insertNode(caretContainer);
						offset = 1;

						apply(name, vars, caretContainer);
					} else {
						apply(name, vars, caretContainer);
					}

					// Move selection to text node
					selection.setCursorLocation(textNode, offset);
							}
			};

			function removeCaretFormat() {
				var rng = selection.getRng(true), container, offset, bookmark,
					hasContentAfter, node, formatNode, parents = [], i, caretContainer;

				container = rng.startContainer;
				offset = rng.startOffset;
				node = container;

				if (container.nodeType == 3) {
					if (offset != container.nodeValue.length || container.nodeValue === invisibleChar) {
						hasContentAfter = true;
									}

					node = node.parentNode;
				}

				while (node) {
					if (matchNode(node, name, vars)) {
						formatNode = node;
						break;
										}

					if (node.nextSibling) {
						hasContentAfter = true;
									}

					parents.push(node);
					node = node.parentNode;
								}

				// Node doesn't have the specified format
				if (!formatNode) {
					return;
								}

				// Is there contents after the caret then remove the format on the element
				if (hasContentAfter) {
					// Get bookmark of caret position
					bookmark = selection.getBookmark();

					// Collapse bookmark range (WebKit)
					rng.collapse(true);

					// Expand the range to the closest word and split it at those points
					rng = expandRng(rng, get(name), true);
					rng = rangeUtils.split(rng);

					// Remove the format from the range
					remove(name, vars, rng);

					// Move selection back to caret position
					selection.moveToBookmark(bookmark);
				} else {
					caretContainer = createCaretContainer();

					node = caretContainer;
					for (i = parents.length - 1; i >= 0; i--) {
						node.appendChild(parents[i].cloneNode(false));
						node = node.firstChild;
							}

					// Insert invisible character into inner most format element
					node.appendChild(dom.doc.createTextNode(invisibleChar));
					node = node.firstChild;

					// Insert caret container after the formated node
					dom.insertAfter(caretContainer, formatNode);

					// Move selection to text node
					selection.setCursorLocation(node, 1);
				}
			};

			// Only bind the caret events once
			if (!self._hasCaretEvents) {
				// Mark current caret container elements as bogus when getting the contents so we don't end up with empty elements
				ed.onBeforeGetContent.addToTop(function() {
					var nodes = [], i;

					if (isCaretContainerEmpty(getParentCaretContainer(selection.getStart()), nodes)) {
						// Mark children
						i = nodes.length;
						while (i--) {
							dom.setAttrib(nodes[i], 'data-mce-bogus', '1');
						}
					}
				});

				// Remove caret container on mouse up and on key up
				tinymce.each('onMouseUp onKeyUp'.split(' '), function(name) {
					ed[name].addToTop(function() {
						removeCaretContainer();
					});
						});

				// Remove caret container on keydown and it's a backspace, enter or left/right arrow keys
				ed.onKeyDown.addToTop(function(ed, e) {
					var keyCode = e.keyCode;

					if (keyCode == 8 || keyCode == 37 || keyCode == 39) {
						removeCaretContainer(getParentCaretContainer(selection.getStart()));
					}
					});

				self._hasCaretEvents = true;
				}

			// Do apply or remove caret format
			if (type == "apply") {
				applyCaretFormat();
			} else {
				removeCaretFormat();
			}
		};

		/**
		 * Moves the start to the first suitable text node.
		 */
        function moveStart(rng) {
            var container = rng.startContainer,
                    offset = rng.startOffset,
                    walker, node, nodes, tmpNode;

            // Convert text node into index if possible
            if (container.nodeType == 3 && offset >= container.nodeValue.length) {
                // Get the parent container location and walk from there
                container = container.parentNode;
                offset = nodeIndex(container) + 1;
            }

            // Move startContainer/startOffset in to a suitable node
            if (container.nodeType == 1) {
                nodes = container.childNodes;
                container = nodes[Math.min(offset, nodes.length - 1)];
                walker = new TreeWalker(container, dom.getParent(container, dom.isBlock));

                // If offset is at end of the parent node walk to the next one
                if (offset > nodes.length - 1)
                    walker.next();

                for (node = walker.current(); node; node = walker.next()) {
                    if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
                        // IE has a "neat" feature where it moves the start node into the closest element
                        // we can avoid this by inserting an element before it and then remove it after we set the selection
                        tmpNode = dom.create('a', null, INVISIBLE_CHAR);
                        node.parentNode.insertBefore(tmpNode, node);

                        // Set selection and remove tmpNode
                        rng.setStart(node, 0);
                        selection.setRng(rng);
                        dom.remove(tmpNode);

                        return;
                    }
                }
            }
        };

	};
})(tinymce);

/**
 * LegacyInput.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

tinymce.onAddEditor.add(function(tinymce, ed) {
	var filters, fontSizes, dom, settings = ed.settings;

	if (settings.inline_styles) {
		fontSizes = tinymce.explode(settings.font_size_legacy_values);

		function replaceWithSpan(node, styles) {
			tinymce.each(styles, function(value, name) {
				if (value)
					dom.setStyle(node, name, value);
			});

			dom.rename(node, 'span');
		};

		filters = {
			font : function(dom, node) {
				replaceWithSpan(node, {
					backgroundColor : node.style.backgroundColor,
					color : node.color,
					fontFamily : node.face,
					fontSize : fontSizes[parseInt(node.size) - 1]
				});
			},

/* ATLASSIAN: we want to keep 'U' tags and not convert them. <U> is semantically better than a SPAN with inline style.
			u : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'underline'
				});
			},
*/

			strike : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'line-through'
				});
			}
		};

		function convert(editor, params) {
			dom = editor.dom;

			if (settings.convert_fonts_to_spans) {
				tinymce.each(dom.select('font,strike', params.node), function(node) { // ATLASSIAN - Don't do 'U'
					filters[node.nodeName.toLowerCase()](ed.dom, node);
				});
			}
		};

		ed.onPreProcess.add(convert);
		ed.onSetContent.add(convert);

		ed.onInit.add(function() {
			ed.selection.onSetContent.add(convert);
		});
	}
});

define('atlassian-editor-plugins/paste/repairer-util', function(require, exports) {
    exports.getBrAndContents = function($el) {
        return $('<br>').add($el.contents());
    };
    
    exports.isEmptyLine = function($el) {
        return $el.text() === '';
    };

    exports.isNodeContainingText = function(node) {
        return (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) && $.trim(node.textContent);
    };

    exports.isFirstTextContentInParent = function($el) {
        var isFirst = false;
        $el.parent().contents().each(function() {
            if (exports.isNodeContainingText(this)) {
                if (this === $el[0]) {
                    isFirst = true;
                    return false;
                }
                return false;
            }
        });
        return isFirst;
    };
    
    exports.replaceWithP = function($el) {
        var style = $el.attr('style');
        var $p = $('<p></p>').append($el.contents());
        if (style) {
            $p.attr('style', style);
        }
        $el.replaceWith($p);
    };

    exports.appendContentsToPreviousContentOrP = function($el) {
        var $prevP = $el.prev('p');
        if ($prevP.length) {
            $prevP.append(exports.getBrAndContents($el));
            $el.remove();
        } else if (exports.isFirstTextContentInParent($el)) {
            exports.replaceWithP($el);
        } else {
            $el.replaceWith(exports.getBrAndContents($el));
        }
    };

    exports.createMacro = function(macroName, $content) {
        var $macro = $(
            '<table class="wysiwyg-macro" data-macro-name="' + macroName + '" data-macro-body-type="RICH_TEXT">' +
                '<tbody><tr><td class="wysiwyg-macro-body">' +
                '</td></tr></tbody>' +
            '</table>'
        );
        $macro.find('.wysiwyg-macro-body').append($content);
        return $macro;
    };
});


define('atlassian-editor-plugins/paste/repairer', [
    'atlassian-editor-plugins/paste/repairer-util'
], function(
    util
) {
    var repairers = [
        function convertExpandMacros(container) {
            container.find('.expand-container').replaceWith(function() {
                var $expanderContents = $(this).find('.expand-content').first().contents();
                return $expanderContents.length ?
                    util.createMacro('expand', $expanderContents) :
                    '';
            });
        },
        
        function stripEmptySpans(container) {
            container.find('span:empty').remove();
        },

        function stripLineBreaksAfterParagraphs(container) {
            container.find('p + br').remove();
        },

        function convertDivsToParagraphsAndLineBreaks(container) {
            var wasEmptyLine = false;
            container.find('div:not(.content-wrapper)').each(function() {
                var $el = $(this);

                if (util.isEmptyLine($el)) {
                    $el.remove();
                    wasEmptyLine = true;
                } else if ($el.find('div, p, pre').length) {
                    $el.replaceWith($el.contents());
                } else {
                    if (wasEmptyLine) {
                        util.replaceWithP($el);
                    } else {
                        util.appendContentsToPreviousContentOrP($el);
                    }
                    wasEmptyLine = false;
                }
            });
        }
    ];

    return {
        repair: function(html) {
            var container = $('<div></div>').html(html);

            repairers.forEach(function(repairer) {
                repairer(container);
            });

            return container.html();
        }
    };
});


/**
 * AE Paste plugin
 */
(function ($) {
    var each = tinymce.each;
    var defs = {
        paste_auto_cleanup_on_paste: true,
        paste_enable_default_filters: true,
        paste_block_drop: false,
        paste_retain_style_properties: "none",
        paste_strip_class_attributes: "mso",
        paste_remove_spans: false,
        paste_remove_styles: false,
        paste_remove_styles_if_webkit: false,
        paste_convert_middot_lists: true,
        paste_convert_headers_to_strong: false,
        paste_dialog_width: "450",
        paste_dialog_height: "400",
        paste_text_use_dialog: false,
        paste_text_sticky: false,
        paste_text_sticky_default: false,
        paste_text_notifyalways: false,
        paste_text_linebreaktype: "combined",
        paste_text_replacements: [
            [/\u2026/g, "..."],
            [/[\x93\x94\u201c\u201d]/g, '"'],
            [/[\x60\x91\x92\u2018\u2019]/g, "'"]
        ]
    };
    var htmlRepairers;

    function getParam(ed, name) {
        return ed.getParam(name, defs[name]);
    }

    /**
     * ATLASSIAN - Adds or removes data-inline-task-id and data-pasted-task to the provided contents.
     * Useful when pasting Inline Tasks into an unordered task list or reverse.
     * @param $list the list element, e.g. <ol>, <ul>, <ul class='inline-task-list'>. The action will check
     * whether this is an Inline Task list before adding or removing attributes.
     * @param $clipboard the contents of the clipboard.
     */
    //TODO - Inline Task plugin https://ecosystem.atlassian.net/browse/AE-3
    function setInlineTaskAttributes($list, $clipboard) {
        if ($list.is('ul.inline-task-list')) {
            $clipboard.each(function () {
                var $li = $(this);
                if (!$li.attr('data-inline-task-id')) {
                    $li.attr('data-inline-task-id', '');
                }
            });
        } else {
            // We only remove the attributes from the top-level elements. Any nested
            // list needs to keep its attributes.
            $clipboard.removeAttr('data-inline-task-id').removeAttr('data-pasted-task');
        }
    }

    var _isCursorAtStartOfListItem = function (ed, range) {
        if (!range.collapsed || range.startOffset != 0) {
            return false;
        }

        var $list = $(range.startContainer).closest("ol, ul", ed.getBody());

        if ($list.length === 0) {
            return false;
        }

        var shallow = true;
        var previousNode = new tinymce.dom.TreeWalker(range.startContainer, $list[0]).prev(shallow);

        return previousNode === undefined || $(previousNode).is("li");
    };

    var _isCursorInEmptyListItem = function (range) {
        var container = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
        return tinymce.isIE ? container.nodeName === 'LI' && container.childNodes.length === 0 : container.nodeName === 'LI' && container.childNodes.length === 1 && container.firstChild.nodeName === 'BR';
    };

    function _clipboardOnlyContainsLists($clipboard) {
        var listCount = $clipboard.filter("ol,ul").length;
        return $clipboard.length === listCount;
    }

    tinymce.create('tinymce.plugins.AtlassianEditorPaste', {
        init: function (ed, url) {
            var t = this;

            t.editor = ed;
            t.url = url;

            // Setup plugin events
            t.onPreProcess = new tinymce.util.Dispatcher(t);
            t.onPostProcess = new tinymce.util.Dispatcher(t);

            // Register default handlers
            t.onPreProcess.add(t._preProcess);
            t.onPostProcess.add(t._postProcess);

            // Register optional preprocess handler
            t.onPreProcess.add(function (pl, o) {
                ed.execCallback('paste_preprocess', pl, o);
            });

            // Register optional postprocess
            t.onPostProcess.add(function (pl, o) {
                ed.execCallback('paste_postprocess', pl, o);
            });

            htmlRepairers = [
                {
                    repair: function (html) {
                        var listOfTdsRegex = /<meta charset='utf-8'>(<td.*<\/td>)<br class="Apple-interchange-newline">/;
                        var matches = listOfTdsRegex.exec(html);

                        if (!matches) {
                            return html;
                        } else {
                            //TODO - Table plugin https://ecosystem.atlassian.net/browse/AE-4
                            return "<table class=\"confluenceTable\"><tbody><tr>" + matches[1] + "</tr></tbody></table>";
                        }
                    }
                },
                {
                    repair: function (html) {
                        var listOfTrsRegex = /<meta charset='utf-8'>(<tr.*<\/tr>)<br class="Apple-interchange-newline">/;
                        var matches = listOfTrsRegex.exec(html);

                        if (!matches) {
                            return html;
                        } else {
                            //TODO - Table plugin https://ecosystem.atlassian.net/browse/AE-4
                            return "<table class=\"confluenceTable\"><tbody>" + matches[1] + "</tbody></table>";
                        }
                    }
                }
            ];

            var undoPasteBlocker = function (ed, e) {
              // Block ctrl+v from adding an undo level since the default logic in tinymce.Editor will add that
              if (((tinymce.isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.keyCode === 86) || (e.shiftKey && e.keyCode === 45)) {
                return false; // Stop other listeners
              }
            };

            //ATLASSIAN CONFDEV-4032. Add a check to ensure that the user doesn't have the shift held down.
            ed.onKeyDown.addToTop(undoPasteBlocker);
            ed.onKeyUp.addToTop(undoPasteBlocker);

            // Initialize plain text flag
            ed.pasteAsPlainText = getParam(ed, 'paste_text_sticky_default');

            // ATLASSIAN - SHPXXXV-133 Initialise advanced paste repairer
            var advancedPasteRepairer = null;
            if (AJS && AJS.DarkFeatures && !AJS.DarkFeatures.isEnabled('editor.advanced.paste.disable')) {
                require(['atlassian-editor-plugins/paste/repairer'], function(repairer) {
                    advancedPasteRepairer = repairer;
                });
            }

            // This function executes the process handlers and inserts the contents
            // force_rich overrides plain text mode set by user, important for pasting with execCommand
            function process(o, force_rich) {
                var dom = ed.dom;
                var rng;

                // Execute pre process handlers
                t.onPreProcess.dispatch(t, o);

                // ATLASSIAN - SHPXXXV-133 Advanced paste repairer
                if (advancedPasteRepairer) {
                    o.content = advancedPasteRepairer.repair(o.content);
                }

                // Create DOM structure
                o.node = dom.create('div', 0, o.content);

                // If pasting inside the same element and the contents is only one block
                // remove the block and keep the text since Firefox will copy parts of pre and h1-h6 as a pre element
                if (tinymce.isGecko) {
                    rng = ed.selection.getRng(true);
                    if (rng.startContainer == rng.endContainer && rng.startContainer.nodeType === 3) {
                        // Is only one block node and it doesn't contain word stuff
                        if (o.node.childNodes.length === 1 && /^(p|h[1-6]|pre)$/i.test(o.node.firstChild.nodeName) && o.content.indexOf('__MCE_ITEM__') === -1) {
                            dom.remove(o.node.firstChild, true);
                        }
                    }
                }

                // Execute post process handlers
                t.onPostProcess.dispatch(t, o);

                // Serialize content
                o.content = ed.serializer.serialize(o.node, {getInner: 1, forced_root_block: ''});

                // Plain text option active?
                if ((!force_rich) && (ed.pasteAsPlainText)) {
                    t._insertPlainText(o.content);

                    if (!getParam(ed, "paste_text_sticky")) {
                        ed.pasteAsPlainText = false;
                        ed.controlManager.setActive("pastetext", false);
                    }
                } else {
                    t._insert(o.content);
                }

                ///CONFDEV-6658 Within page layouts pasting block level elements in FF causes the user not to be able to type
                tinymce.isGecko && ed.dom.getRoot().focus();
            }

            // Add command for external usage
            ed.addCommand('mceInsertClipboardContent', function (u, o) {
                process(o, true);
            });

            if (!getParam(ed, "paste_text_use_dialog")) {
                ed.addCommand('mcePasteText', function (u, v) {
                    var cookie = tinymce.util.Cookie;

                    ed.pasteAsPlainText = !ed.pasteAsPlainText;
                    ed.controlManager.setActive('pastetext', ed.pasteAsPlainText);

                    if ((ed.pasteAsPlainText) && (!cookie.get("tinymcePasteText"))) {
                        if (getParam(ed, "paste_text_sticky")) {
                            ed.windowManager.alert(ed.translate('paste.plaintext_mode_sticky'));
                        } else {
                            ed.windowManager.alert(ed.translate('paste.plaintext_mode'));
                        }

                        if (!getParam(ed, "paste_text_notifyalways")) {
                            cookie.set("tinymcePasteText", "1", new Date(new Date().getFullYear() + 1, 12, 31));
                        }
                    }
                });
            }

            ed.addButton('pastetext', {title: 'paste.paste_text_desc', cmd: 'mcePasteText'});
            ed.addButton('selectall', {title: 'paste.selectall_desc', cmd: 'selectall'});

            function cleanClipboardContainer(container) {
                if (!container) {
                    return;
                }

                var child = container.firstChild;

                // WebKit inserts a DIV container with lots of odd styles
                if (child && child.nodeName === 'DIV' && child.style.marginTop && child.style.backgroundColor) {
                    ed.dom.remove(child, 1);
                }

                //Atlassian - Just remove the class, not the entire element
                // Remove apple style spans
                tinymce.isWebKit && each(ed.dom.select('span.Apple-style-span', container), function (container) {
                    ed.dom.removeClass(container, 'Apple-style-span');
                });

                // Atlassian: remove <br class="Apple-interchange-newline"> (they are redundant as they are usually paired up with the real <BR>)
                tinymce.isWebKit && each(ed.dom.select('br.Apple-interchange-newline', container), function (container) {
                    ed.dom.remove(container);
                });

                // Remove bogus br elements
                each(ed.dom.select('br[data-mce-bogus]', container), function (container) {
                    ed.dom.remove(container);
                });

                // Remove meta
                each(ed.dom.select('meta[charset]', container), function (container) {
                    ed.dom.remove(container);
                });
            }

            // This function grabs the contents from the clipboard by adding a
            // hidden div and placing the caret inside it and after the browser paste
            // is done it grabs that contents and processes that
            function grabContent(e) {
                var n;
                var oldBookmark;
                var rng;
                var oldRng;
                var sel = ed.selection;
                var dom = ed.dom;
                var body = ed.getBody();
                var posY;
                var textContent;
                var isInPlainTextMacro;

                //Atlassian - ensure undo level set before paste CONFDEV-4847
                ed.undoManager.add();

                /**
                 * Handle the paste event by extracting the clipboard contents directly from the event itself.
                 * This is only available on webkit at the time of writing.
                 *
                 * @param e the paste event
                 *
                 * @return true if the event was handled, false otherwise.
                 */
                function handlePasteEvent(e) {
                    if (!e.clipboardData || $.inArray("text/html", e.clipboardData.types || []) == -1) {
                        return false;
                    }

                    var htmlData = e.clipboardData.getData('text/html');
                    var repairedHtmlData;

                    if (!htmlData || !$.browser.webkit) {
                        return false;
                    }

                    repairedHtmlData = t.repair(htmlData);

                    if (repairedHtmlData == htmlData) {
                        return false;
                    }

                    var $clipboard = t.parse(repairedHtmlData, ed.getDoc());
                    var $fragment = $("<div></div>");

                    $fragment.append($clipboard);
                    cleanClipboardContainer($fragment[0]);

                    process({
                        content: $fragment.html()
                    });

                    return true;
                }

                /**
                 * Attempt to get hold of the clipboard by extracting it from the paste event itself.
                 * This approach is only supported in webkit at the moment.
                 *
                 * Failing this. Fall back to tinymce's / default way of accessing the clipboard
                 * (i.e. allow the paste into a hidden DIV first, and then set a timer to grab the contents from the
                 * hidden DIV afterwards)
                 */
                if (handlePasteEvent(e)) {
                    $.Event(e).preventDefault();
                    return;
                }

                // Check if browser supports direct plaintext access
                if (e.clipboardData || dom.doc.dataTransfer) {
                    textContent = (e.clipboardData || dom.doc.dataTransfer).getData('Text');

                    if (ed.pasteAsPlainText) {
                        e.preventDefault();
                        process({content: dom.encode(textContent).replace(/\r?\n/g, '<br />')});
                        return;
                    }
                }

                if (dom.get('_mcePaste')) {
                    return;
                }

                // CONF-28552
                isInPlainTextMacro = $(ed.selection.getStart()).closest("[data-macro-body-type='PLAIN_TEXT']").length;

                // ALTASSIAN - the body isn't always content editable since we have content editable sections (page layouts)
                // The paste div must be created in the right content editable container otherwise the browser won't perform any paste operations
                var container = body;
                if (body.contentEditable != "true") {
                    container = dom.getParent(ed.selection.getStart(), '[contenteditable="true"]', body);
                }
                // Create container to paste into
                n = dom.add(container, 'div', {
                    id: '_mcePaste',
                    'class': 'mcePaste',
                    'data-mce-bogus': '1'
                }, '\uFEFF\uFEFF');

                // If contentEditable mode we need to find out the position of the closest element
                if (body != ed.getDoc().body) {
                    posY = dom.getPos(ed.selection.getStart(), body).y;
                } else {
                    // ATLASSIAN - base the positioning off of the viewport only.
                    posY = (function () {
                        var vp = dom.getViewPort(ed.getWin());
                        return vp.y + parseInt(vp.h / 2, 10);
                    }());
                }

                // Styles needs to be applied after the element is added to the document since WebKit will otherwise remove all styles
                // If also needs to be in view on IE or the paste would fail
                dom.setStyles(n, {
                    position: 'absolute',
                    left: tinymce.isGecko ? -40 : 0, // Need to move it out of site on Gecko since it will othewise display a ghost resize rect for the div
                    top: posY - 25,
                    width: 1,
                    height: 1,
                    overflow: 'hidden'
                });

                if (tinymce.isIE) {
                    // Store away the old range
                    oldRng = sel.getRng();

                    // Select the container
                    rng = dom.doc.body.createTextRange();
                    rng.moveToElementText(n);
                    rng.execCommand('Paste');

                    // Remove container
                    dom.remove(n);

                    // Check if the contents was changed, if it wasn't then clipboard extraction failed probably due
                    // to IE security settings so we pass the junk though better than nothing right
                    if (n.innerHTML === '\uFEFF\uFEFF') {
                      ed.execCommand('mcePasteWord');
                      e.preventDefault();
                      return;
                    }

                    // Restore the old range and clear the contents before pasting
                    sel.setRng(oldRng);
                    sel.setContent('');

                    // For some odd reason we need to detach the the mceInsertContent call from the paste event
                    // It's like IE has a reference to the parent element that you paste in and the selection gets messed up
                    // when it tries to restore the selection
                    setTimeout(function () {
                      // Process contents
                      process({content: n.innerHTML});
                    }, 0);

                    // Block the real paste event
                    return tinymce.dom.Event.cancel(e);
                } else {
                    function block(e) {
                        e.preventDefault();
                    }

                    // Block mousedown and click to prevent selection change
                    dom.bind(ed.getDoc(), 'mousedown', block);
                    dom.bind(ed.getDoc(), 'keydown', block);

                    oldBookmark = sel.getBookmark();

                    // Move select contents inside DIV
                    n = n.firstChild;
                    rng = ed.getDoc().createRange();
                    rng.setStart(n, 0);
                    rng.setEnd(n, 2);
                    sel.setRng(rng);

                    // Wait a while and grab the pasted contents
                    window.setTimeout(function () {
                        var h = '';
                        var nl;

                        // Paste divs duplicated in paste divs seems to happen when you paste plain text so lets first look for that broken behavior in WebKit
                        if (!dom.select('div.mcePaste > div.mcePaste').length) {
                            nl = dom.select('div.mcePaste');

                            // WebKit will split the div into multiple ones so this will loop through then all and join them to get the whole HTML string
                            each(nl, function (n) {
                                cleanClipboardContainer(n);

                                // WebKit will make a copy of the DIV for each line of plain text pasted and insert them into the DIV
                                if (n.parentNode.className != 'mcePaste') {
                                    h += n.innerHTML;
                                }
                            });
                        } else {
                            // Found WebKit weirdness so force the content into paragraphs this seems to happen when you paste plain text from Nodepad etc
                            if ( isInPlainTextMacro ) {
                                // If we're in a plain text macro, we need to make sure the line breaks are preserved
                                h = '<p>' + dom.encode(textContent).replace(/\r?\n/g, '<br />') + '</p>';
                            } else {
                                // Otherwise we smush everything into <p> tags
                                h = '<p>' + dom.encode(textContent).replace(/\r?\n\r?\n/g, '</p><p>').replace(/\r?\n/g, '<br />') + '</p>';
                            }
                        }

                        // Remove the nodes
                        each(dom.select('div.mcePaste'), function (n) {
                            dom.remove(n);
                        });

                        // Restore the old selection
                        if (oldBookmark) {
                            sel.moveToBookmark(oldBookmark);
                        }

                        process({content: h});

                        // Unblock events ones we got the contents
                        dom.unbind(ed.getDoc(), 'mousedown', block);
                        dom.unbind(ed.getDoc(), 'keydown', block);
                    }, 0);
                }
            }

            // Check if we should use the new auto process method
            if (getParam(ed, "paste_auto_cleanup_on_paste")) {
                // Is it's Opera or older FF use key handler
                if (tinymce.isOpera || /Firefox\/2/.test(navigator.userAgent)) {
                    ed.onKeyDown.addToTop(function (ed, e) {
                        if (((tinymce.isMac ? e.metaKey : e.ctrlKey) && e.keyCode === 86) || (e.shiftKey && e.keyCode === 45)) {
                            grabContent(e);
                        }
                    });
                } else {
                    // Grab contents on paste event on Gecko and WebKit
                    ed.onPaste.addToTop(function (ed, e) {
                        return grabContent(e);
                    });
                }
            }

            ed.onInit.add(function () {
                ed.controlManager.setActive("pastetext", ed.pasteAsPlainText);

                // Block all drag/drop events
                if (getParam(ed, "paste_block_drop")) {
                    ed.dom.bind(ed.getBody(), ['dragend', 'dragover', 'draggesture', 'dragdrop', 'drop', 'drag'], function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        return false;
                    });
                }
            });

            //TODO - Inline Task plugin https://ecosystem.atlassian.net/browse/AE-3
            ed.onSaveContent.add(function (ed, event) {
                //Copy-pasted tasks should be considered new if they are duplicated.
                var $contents = $("<div/>").html(event.content);
                $('ul.inline-task-list > li[data-pasted-task="true"]', $contents).each(function(){
                    var $currentLi = $(this);
                    var taskId = $currentLi.attr('data-inline-task-id');
                    if (taskId) {
                        var $listWithTaskId = $contents.find('ul.inline-task-list > li[data-inline-task-id="' + taskId + '"]');
                        if ($listWithTaskId.size() > 1) {
                            $currentLi.attr('data-inline-task-id', '');
                        }
                    }
                });
                event.content = $contents.html();
            });

            // Add legacy support
            t._legacySupport();
        },

        getInfo: function () {
            return {
                longname: 'AtlassianEditorPaste',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                infourl: 'http://www.atlassian.com',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        },

        _preProcess: function (pl, o) {
            var ed = this.editor;
            var h = o.content;
            var grep = tinymce.grep;
            var explode = tinymce.explode;
            var trim = tinymce.trim;
            var len;
            var stripClass;

            //console.log('Before preprocess:' + o.content);

            function process(items) {
                each(items, function (v) {
                    // Remove or replace
                    if (v.constructor == RegExp) {
                        h = h.replace(v, '');
                    }
                    else {
                        h = h.replace(v[0], v[1]);
                    }
                });
            }

            if (ed.settings.paste_enable_default_filters == false) {
                return;
            }

            // IE9 adds BRs before/after block elements when contents is pasted from word or for example another browser
            if (tinymce.isIE && document.documentMode >= 9) {
                // IE9 adds BRs before/after block elements when contents is pasted from word or for example another browser
                process([[/(?:<br>&nbsp;[\s\r\n]+|<br>)*(<\/?(h[1-6r]|p|div|address|pre|form|table|tbody|thead|tfoot|th|tr|td|li|ol|ul|caption|blockquote|center|dl|dt|dd|dir|fieldset)[^>]*>)(?:<br>&nbsp;[\s\r\n]+|<br>)*/g, '$1']]);

                // IE9 also adds an extra BR element for each soft-linefeed and it also adds a BR for each word wrap break
                process([
                    [/<br><br>/g, '<BR><BR>'], // Replace multiple BR elements with uppercase BR to keep them intact
                    [/<br>/g, ' '], // Replace single br elements with space since they are word wrap BR:s
                    [/<BR><BR>/g, '<br>'] // Replace back the double brs but into a single BR
                ]);
            }

            // Detect Word content and process it more aggressive
            if (/class="?Mso|style="[^"]*\bmso-|w:WordDocument/i.test(h) || o.wordContent) {
                o.wordContent = true;            // Mark the pasted contents as word specific content
                //console.log('Word contents detected.');

                // Process away some basic content
                process([
                    /^\s*(&nbsp;)+/gi,                // &nbsp; entities at the start of contents
                    /(&nbsp;|<br[^>]*>)+\s*$/gi        // &nbsp; entities at the end of contents
                ]);

                if (getParam(ed, "paste_convert_headers_to_strong")) {
                    h = h.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>");
                }

                if (getParam(ed, "paste_convert_middot_lists")) {
                    process([
                        [/<!--\[if !supportLists\]-->/gi, '$&__MCE_ITEM__'],                    // Convert supportLists to a list item marker
                        [/(<span[^>]+(?:mso-list:|:\s*symbol)[^>]+>)/gi, '$1__MCE_ITEM__'],        // Convert mso-list and symbol spans to item markers
                        [/(<p[^>]+(?:MsoListParagraph)[^>]+>)/gi, '$1__MCE_ITEM__']                // Convert mso-list and symbol paragraphs to item markers (FF)
                    ]);
                }

                process([
                    // Word comments like conditional comments etc
                    /<!--[\s\S]+?-->/gi,

                    // Remove comments, scripts (e.g., msoShowComment), XML tag, VML content, MS Office namespaced tags, and a few other tags
                    /<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,

                    // Convert <s> into <strike> for line-though
                    [/<(\/?)s>/gi, "<$1strike>"],

                    // Replace nsbp entites to char since it's easier to handle
                    [/&nbsp;/gi, "\u00a0"]
                ]);

                // Remove bad attributes, with or without quotes, ensuring that attribute text is really inside a tag.
                // If JavaScript had a RegExp look-behind, we could have integrated this with the last process() array and got rid of the loop. But alas, it does not, so we cannot.
                do {
                    len = h.length;
                    h = h.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
                } while (len != h.length);

                // Remove all spans if no styles is to be retained
                if (getParam(ed, "paste_retain_style_properties").replace(/^none$/i, "").length === 0) {
                    h = h.replace(/<\/?span[^>]*>/gi, "");
                } else {
                    // We're keeping styles, so at least clean them up.
                    // CSS Reference: http://msdn.microsoft.com/en-us/library/aa155477.aspx

                    process([
                        // Convert <span style="mso-spacerun:yes">___</span> to string of alternating breaking/non-breaking spaces of same length
                        [/<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
                            function (str, spaces) {
                                return (spaces.length > 0) ? spaces.replace(/./, " ").slice(Math.floor(spaces.length / 2)).split("").join("\u00a0") : "";
                            }
                        ],

                        // Examine all styles: delete junk, transform some, and keep the rest
                        [/(<[a-z][^>]*)\sstyle="([^"]*)"/gi,
                            function (str, tag, style) {
                                var n = [];
                                var i = 0;
                                var s = explode(trim(style).replace(/&quot;/gi, "'"), ";");

                                // Examine each style definition within the tag's style attribute
                                each(s, function (v) {
                                    var name;
                                    var value;
                                    var parts = explode(v, ":");

                                    function ensureUnits(v) {
                                        return v + ((v !== "0") && (/\d$/.test(v))) ? "px" : "";
                                    }

                                    if (parts.length === 2) {
                                        name = parts[0].toLowerCase();
                                        value = parts[1].toLowerCase();

                                        // Translate certain MS Office styles into their CSS equivalents
                                        switch (name) {
                                            case "mso-padding-alt":
                                            case "mso-padding-top-alt":
                                            case "mso-padding-right-alt":
                                            case "mso-padding-bottom-alt":
                                            case "mso-padding-left-alt":
                                            case "mso-margin-alt":
                                            case "mso-margin-top-alt":
                                            case "mso-margin-right-alt":
                                            case "mso-margin-bottom-alt":
                                            case "mso-margin-left-alt":
                                            case "mso-table-layout-alt":
                                            case "mso-height":
                                            case "mso-width":
                                            case "mso-vertical-align-alt":
                                                n[i++] = name.replace(/^mso-|-alt$/g, "") + ":" + ensureUnits(value);
                                                return;

                                            case "horiz-align":
                                                n[i++] = "text-align:" + value;
                                                return;

                                            case "vert-align":
                                                n[i++] = "vertical-align:" + value;
                                                return;

                                            case "font-color":
                                            case "mso-foreground":
                                                n[i++] = "color:" + value;
                                                return;

                                            case "mso-background":
                                            case "mso-highlight":
                                                n[i++] = "background:" + value;
                                                return;

                                            case "mso-default-height":
                                                n[i++] = "min-height:" + ensureUnits(value);
                                                return;

                                            case "mso-default-width":
                                                n[i++] = "min-width:" + ensureUnits(value);
                                                return;

                                            case "mso-padding-between-alt":
                                                n[i++] = "border-collapse:separate;border-spacing:" + ensureUnits(value);
                                                return;

                                            case "text-line-through":
                                                if ((value == "single") || (value == "double")) {
                                                    n[i++] = "text-decoration:line-through";
                                                }
                                                return;

                                            case "mso-zero-height":
                                                if (value == "yes") {
                                                    n[i++] = "display:none";
                                                }
                                                return;
                                        }

                                        // Eliminate all MS Office style definitions that have no CSS equivalent by examining the first characters in the name
                                        if (/^(mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?!align|decor|indent|trans)|top-bar|version|vnd|word-break)/.test(name)) {
                                            return;
                                        }

                                        // If it reached this point, it must be a valid CSS style
                                        n[i++] = name + ":" + parts[1];        // Lower-case name, but keep value case
                                    }
                                });

                                // If style attribute contained any valid styles the re-write it; otherwise delete style attribute.
                                if (i > 0) {
                                    return tag + ' style="' + n.join(';') + '"';
                                } else {
                                    return tag;
                                }
                            }
                        ]
                    ]);
                }
            }

            // Replace headers with <strong>
            if (getParam(ed, "paste_convert_headers_to_strong")) {
                process([
                    [/<h[1-6][^>]*>/gi, "<p><strong>"],
                    [/<\/h[1-6][^>]*>/gi, "</strong></p>"]
                ]);
            }

            process([
                // Copy paste from Java like Open Office will produce this junk on FF
                [/Version:[\d.]+\nStartHTML:\d+\nEndHTML:\d+\nStartFragment:\d+\nEndFragment:\d+/gi, '']
            ]);

            // Class attribute options are: leave all as-is ("none"), remove all ("all"), or remove only those starting with mso ("mso").
            // Note:-  paste_strip_class_attributes: "none", verify_css_classes: true is also a good variation.
            stripClass = getParam(ed, "paste_strip_class_attributes");

            if (stripClass !== "none") {
                function removeClasses(match, g1) {
                    if (stripClass === "all") {
                        return '';
                    }

                    var cls = grep(explode(g1.replace(/^(["'])(.*)\1$/, "$2"), " "),
                        function (v) {
                            return (/^(?!mso)/i.test(v));
                        }
                    );

                    return cls.length ? ' class="' + cls.join(" ") + '"' : '';
                }

                h = h.replace(/ class="([^"]+)"/gi, removeClasses);
                h = h.replace(/ class=([\-\w]+)/gi, removeClasses);
            }

            // Remove spans option
            if (getParam(ed, "paste_remove_spans")) {
                h = h.replace(/<\/?span[^>]*>/gi, "");
            }

            //console.log('After preprocess:' + h);

            o.content = h;
        },

        /**
         * Various post process items.
         */
        _postProcess: function (pl, o) {
            var t = this;
            var ed = t.editor;
            var dom = ed.dom;
            var styleProps;

            if (ed.settings.paste_enable_default_filters == false) {
                return;
            }

            if (o.wordContent) {
                // Remove named anchors or TOC links
                each(dom.select('a', o.node), function (a) {
                    if (!a.href || a.href.indexOf('#_Toc') !== -1) {
                        dom.remove(a, 1);
                    }
                });

                if (getParam(ed, "paste_convert_middot_lists")) {
                    t._convertLists(pl, o);
                }

                // Process styles
                styleProps = getParam(ed, "paste_retain_style_properties"); // retained properties

                // Process only if a string was specified and not equal to "all" or "*"
                if ((tinymce.is(styleProps, "string")) && (styleProps !== "all") && (styleProps !== "*")) {
                    styleProps = tinymce.explode(styleProps.replace(/^none$/i, ""));

                    // Retains some style properties
                    each(dom.select('*', o.node), function (el) {
                        var newStyle = {};
                        var npc = 0;
                        var i;
                        var sp;
                        var sv;

                        // Store a subset of the existing styles
                        if (styleProps) {
                            for (i = 0; i < styleProps.length; i++) {
                                sp = styleProps[i];
                                sv = dom.getStyle(el, sp);

                                if (sv) {
                                    newStyle[sp] = sv;
                                    npc++;
                                }
                            }
                        }

                        // Remove all of the existing styles
                        dom.setAttrib(el, 'style', '');

                        if (styleProps && npc > 0) {
                            dom.setStyles(el, newStyle); // Add back the stored subset of styles
                        } else { // Remove empty span tags that do not have class attributes
                            if (el.nodeName === 'SPAN' && !el.className) {
                                dom.remove(el, true);
                            }
                        }
                    });
                }
            }

            // Remove all style information or only specifically on WebKit to avoid the style bug on that browser
            if (getParam(ed, "paste_remove_styles") || (getParam(ed, "paste_remove_styles_if_webkit") && tinymce.isWebKit)) {
                each(dom.select('*[style]', o.node), function (el) {
                    el.removeAttribute('style');
                    el.removeAttribute('data-mce-style');
                });
            } else {
                if (tinymce.isWebKit) {
                    // We need to compress the styles on WebKit since if you paste <img border="0" /> it will become <img border="0" style="... lots of junk ..." />
                    // Removing the mce_style that contains the real value will force the Serializer engine to compress the styles
                    each(dom.select('*', o.node), function (el) {
                        el.removeAttribute('data-mce-style');
                    });
                }
            }
            // Fix pasted content containing editor format html, if the data-base-url doesn't match the current configured base url.
            var configuredBaseUrl = AJS.Meta.get("base-url");
            each(dom.select("a:not([data-base-url='" + configuredBaseUrl + "'])[data-base-url]", o.node), function (el) {
                var href = el.attributes["href"] ? el.attributes["href"].value : configuredBaseUrl; //pasting in anchors with no href value shouldn't happen...
                while (el.attributes.length > 0) {
                    el.removeAttribute(el.attributes[0].name);
                }
                el.setAttribute("href", href);
            });
        },

        /**
         * Converts the most common bullet and number formats in Office into a real semantic UL/LI list.
         */
        _convertLists: function (pl, o) {
            var dom = pl.editor.dom;
            var listElm;
            var li;
            var lastMargin = -1;
            var margin;
            var levels = [];
            var lastType;
            var html;

            // Convert middot lists into real semantic lists
            each(dom.select('p', o.node), function (p) {
                var sib;
                var val = '';
                var type;
                var html;
                var idx;
                var parents;

                // Get text node value at beginning of paragraph
                for (sib = p.firstChild; sib && sib.nodeType === 3; sib = sib.nextSibling) {
                    val += sib.nodeValue;
                }

                val = p.innerHTML.replace(/<\/?\w+[^>]*>/gi, '').replace(/&nbsp;/g, '\u00a0');

                // Detect unordered lists look for bullets
                if (/^(__MCE_ITEM__)+[\u2022\u00b7\u00a7\u00d8o\u25CF]\s*\u00a0*/.test(val)) {
                    type = 'ul';
                }

                // Detect ordered lists 1., a. or ixv.
                if (/^__MCE_ITEM__\s*\w+\.\s*\u00a0+/.test(val)) {
                    type = 'ol';
                }

                // Check if node value matches the list pattern: o&nbsp;&nbsp;
                if (type) {
                    margin = parseFloat(p.style.marginLeft || 0);

                    if (margin > lastMargin) {
                        levels.push(margin);
                    }

                    if (!listElm || type != lastType) {
                        listElm = dom.create(type);
                        dom.insertAfter(listElm, p);
                    } else {
                        // Nested list element
                        if (margin > lastMargin) {
                            listElm = li.appendChild(dom.create(type));
                        } else if (margin < lastMargin) {
                            // Find parent level based on margin value
                            idx = tinymce.inArray(levels, margin);
                            parents = dom.getParents(listElm.parentNode, type);
                            listElm = parents[parents.length - 1 - idx] || listElm;
                        }
                    }

                    // Remove middot or number spans if they exists
                    each(dom.select('span', p), function (span) {
                        var html = span.innerHTML.replace(/<\/?\w+[^>]*>/gi, '');

                        // Remove span with the middot or the number
                        if (type == 'ul' && /^__MCE_ITEM__[\u2022\u00b7\u00a7\u00d8o\u25CF]/.test(html)) {
                            dom.remove(span);
                        } else if (/^__MCE_ITEM__[\s\S]*\w+\.(&nbsp;|\u00a0)*\s*/.test(html)) {
                            dom.remove(span);
                        }
                    });

                    html = p.innerHTML;

                    // Remove middot/list items
                    if (type == 'ul') {
                        html = p.innerHTML.replace(/__MCE_ITEM__/g, '').replace(/^[\u2022\u00b7\u00a7\u00d8o\u25CF]\s*(&nbsp;|\u00a0)+\s*/, '');
                    } else {
                        html = p.innerHTML.replace(/__MCE_ITEM__/g, '').replace(/^\s*\w+\.(&nbsp;|\u00a0)+\s*/, '');
                    }

                    // Create li and add paragraph data into the new li
                    li = listElm.appendChild(dom.create('li', 0, html));
                    dom.remove(p);

                    lastMargin = margin;
                    lastType = type;
                } else {
                    listElm = lastMargin = 0; // End list element
                }
            });

            // Remove any left over makers
            html = o.node.innerHTML;
            if (html.indexOf('__MCE_ITEM__') !== -1) {
                o.node.innerHTML = html.replace(/__MCE_ITEM__/g, '');
            }
        },

        /**
         * Inserts the specified contents at the caret position.
         */
        _insert: function (h, skip_undo) {
            var ed = this.editor;
            var range = ed.selection.getRng(true);
            var that = this;
            var clipboardInserter;
            var $clipboard;

            h = that._applyOnBeforeSetContentListeners(ed, h);

            /**
             * Converts a string from the clipboard into a jQuery wrapped elements
             *
             * This is necessary as some strings don't contain any html and may be interpreted as jQuery selectors erroneously (CONF-24066) producing editor freezing.
             */
            $clipboard = that.parse(h, ed.getDoc());

            clipboardInserter = this._getClipboardInserter(ed, range, $clipboard);
            if (clipboardInserter) {
                clipboardInserter.insert(ed, range, $clipboard);

                ed.selection.onSetContent.dispatch(ed.selection, {content: h, format: 'html'});
                ed.addVisual();
            } else {
                // First delete the contents seems to work better on WebKit when the selection spans multiple list items or multiple table cells.
                if (!ed.selection.isCollapsed() && range.startContainer != range.endContainer) {
                    ed.execCommand('mceDelete', false, null, {skip_undo: true}); // CONF-23691: skip undo since the native command doesn't add an undo step either
                }

                if (tinymce.isIE) {
                    for (var i = 0; i < $clipboard.length; i++) {
                        if ($clipboard[i].nodeName.toLowerCase() === "img") {
                            skip_undo = true;
                            break;
                        }
                    }
                }

                ed.execCommand('mceInsertContent', false, h, {skip_undo: skip_undo});
            }
        },

        _getClipboardInserter: function (ed, range, $clipboard) {
            var result;
            $.each(this.clipboardInserters, function (index, inserter) {
                if (inserter.shouldInsert(ed, range, $clipboard)) {
                    result = inserter;
                    return false;
                }
            });
            return result;
        },

        clipboardInserters: [
        /** Inserts lists into an empty list item **/
            {
                shouldInsert: function (ed, range, $clipboard) {
                    var t = _isCursorInEmptyListItem(range);

                    t = t && _clipboardOnlyContainsLists($clipboard);
                    return t && $clipboard.children("li").length > 0;
                },
                insert: function (ed, range, $clipboard) {
                    var $li = $(range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer);
                    var $clipboardListItems = $clipboard.children();

                    ed.undoManager.beforeChange(); // stores the cursor so we get a nice undo that restores the cursor placement
                    ed.undoManager.add();

                    //TODO - Inline Task plugin https://ecosystem.atlassian.net/browse/AE-3
                    setInlineTaskAttributes($li.parent(), $clipboardListItems);
                    $li.replaceWith($clipboardListItems);
                    ed.selection.select($clipboardListItems.last()[0], true);
                    ed.selection.collapse();

                    ed.undoManager.add();
                }
            },
        /** Inserts lists when cursor is at the start of an existing non-empty list item **/
            {
                shouldInsert: function (ed, range, $clipboard) {
                    var t = _isCursorAtStartOfListItem(ed, range);
                    t = t && _clipboardOnlyContainsLists($clipboard);
                    return t && $clipboard.children("li").length > 0;
                },
                insert: function (ed, range, $clipboard) {
                    var $li = $(range.startContainer).closest("li", ed.getBody());
                    var $clipboardListItems = $clipboard.children();

                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    //TODO - Inline Task plugin https://ecosystem.atlassian.net/browse/AE-3
                    setInlineTaskAttributes($li.parent(), $clipboardListItems);
                    $li.before($clipboardListItems);
                    ed.selection.select($li[0], true);
                    ed.selection.collapse(true);

                    ed.undoManager.add();
                }
            },
        /** Inserts lists when cursor is at the end of an existing non-empty list item **/
            {
                shouldInsert: function (ed, range, $clipboard) {
                    var _isCursorAtEndOfLisItem = function (ed, range) {
                        if (!range.collapsed) {
                            return false;
                        }

                        if (range.startContainer.nodeType === 3 && range.startOffset != range.startContainer.nodeValue.length) { // end of text node
                            return false;
                        }

                        if (range.startContainer.nodeType === 1 && range.startOffset != range.startContainer.childNodes.length) {
                            return false;
                        }

                        var $list = $(range.startContainer).closest("ol, ul", ed.getBody());

                        if ($list.length === 0) {
                            return false;
                        }

                        var shallow = true;
                        var nextNode = new tinymce.dom.TreeWalker(range.startContainer, $list[0]).next(shallow);

                        return nextNode === undefined || $(nextNode).is("li");
                    };

                    return _isCursorAtEndOfLisItem(ed, range) && $clipboard.length === $clipboard.filter("ol,ul").length && $clipboard.children("li").length > 0;
                },
                insert: function (ed, range, $clipboard) {
                    var $li = $(range.startContainer).closest("li", ed.getBody());
                    var $clipboardListItems = $clipboard.children();

                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    //TODO - Inline Task plugin https://ecosystem.atlassian.net/browse/AE-3
                    setInlineTaskAttributes($li.parent(), $clipboardListItems);
                    $li.after($clipboardListItems);
                    ed.selection.select($clipboardListItems.last()[0], true);
                    ed.selection.collapse(false); // collapse to end

                    ed.undoManager.add();
                }
            },
             /** Inserting a list item with sublists into a list **/
            {
                shouldInsert: function(ed, range, $clipboard) {
                    var _lastItemIsTheOnlyList = function ($clipboard) {
                        var $li = $clipboard.filter("ol,ul");
                        var lastItem = $clipboard[$clipboard.length - 1];
                        return $li.length === 1 && $li[0] === lastItem;
                    }
                    var toPaste = $clipboard.length > 1;
                    toPaste = toPaste && !_isCursorInEmptyListItem(range);
                    toPaste = toPaste && _isCursorAtStartOfListItem(ed, range);
                    toPaste = toPaste && _lastItemIsTheOnlyList($clipboard);
                    return toPaste;
                },
                insert: function(ed, range, $clipboard) {
                    var $li = $(range.startContainer).closest("li", ed.getBody());

                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    // do copy paste stuff here
                    setInlineTaskAttributes($li.parent(), $clipboard.children("li")); // not a fucking clue what this line does
                    var newLi = $("<li></li>").append($clipboard);
                    $li.before(newLi);

                    ed.undoManager.add();
                }
            },
            /* Table row inserter for handling insertion of a clipboard table rows into an existing table which some cells selected.
             * The aim is to transfer what is applicable from the clipboard "into" the selection (and not beyond).
             */
            {
                //TODO - Table plugin https://ecosystem.atlassian.net/browse/AE-4
                shouldInsert: function (ed, range, $clipboard) {
                    if (range.collapsed) {
                        return false;
                    }

                    /**
                     * The only supported selections are:
                     * - partial row (common ancestor = row)
                     * - one whole row (common ancestor = row)
                     * - multiple rows (common ancestor = tbody)
                     */
                    if (!$(range.commonAncestorContainer).is("table.confluenceTable > tbody, table.confluenceTable > tbody > tr")) {
                        return false;
                    }

                    return $clipboard.is("table:not(.wysiwyg-macro)");
                },
                insert: function (ed, range, $clipboard) {
                    var $clipboardRows = $clipboard.children("tbody").length > 0 ? $clipboard.children("tbody").children("tr") : $clipboard.children("tr");
                    var $clipboardTableCells = $clipboardRows.children("td, th");
                    var $targetTableCells = $(".mceSelected", ed.getDoc());
                    var $targetTableRows = $targetTableCells.parent();
                    var sourceRows;
                    var targetRows;

                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    function overwrite(sourceCells, targetCells) {
                        for (var sourceCell = sourceCells.shift(), targetCell = targetCells.shift(); sourceCell && targetCell; sourceCell = sourceCells.shift(), targetCell = targetCells.shift()) {
                            $(targetCell).html($(sourceCell).html());
                        }
                    }

                    if ($targetTableRows.length === 1) {
                        overwrite($.makeArray($clipboardTableCells), $.makeArray($targetTableCells));
                    } else {
                        sourceRows = $.makeArray($clipboardRows);
                        targetRows = $.makeArray($targetTableRows);

                        for (var sourceRow = sourceRows.shift(), targetRow = targetRows.shift(); sourceRow && targetRow; sourceRow = sourceRows.shift(), targetRow = targetRows.shift()) {
                            overwrite($.makeArray($(sourceRow).children()), $.makeArray($(targetRow).children()));
                        }

                    }

                    ed.selection.setRng(range); // restore the selection (that have all overwritten cells display as selected - its a nice visual cue as to what has been overwritten)
                    ed.undoManager.add();
                }
            },
        /** Table row / cell inserter that overwrites */
            {
                //TODO - Table plugin https://ecosystem.atlassian.net/browse/AE-4
                shouldInsert: function (ed, range, $clipboard) {
                    var $targetCell = $(range.startContainer).closest("td.confluenceTd, th.confluenceTh", ".mceContent");

                    if ($targetCell.length === 0) {
                        return false;
                    }

                    var $targetTable = $targetCell.closest("table.confluenceTable", ".mceContent");

                    if ($targetTable.length === 0 || $targetTable.children("tbody").length === 0) { // most tables should be well formed - check this assumption.
                        return;
                    }

                    if (!$clipboard.is("table:not(.wysiwyg-macro)")) {
                        return false;
                    }

                    var hasSpanningCells = false;
                    $targetTable.find("*[colspan], *[rowspan]").each(function (index, element) {
                        if ($(element).attr("rowspan") > 1 || $(element).attr("colspan") > 1) {
                            hasSpanningCells = true;
                            return false; // stop iterating
                        }
                    });

                    return !hasSpanningCells;
                },
                //TODO - Table plugin https://ecosystem.atlassian.net/browse/AE-4
                insert: function (ed, range, $clipboard) {
                    var $targetCell = $(range.startContainer).closest("td.confluenceTd, th.confluenceTh", ".mceContent");
                    var $targetTable = $targetCell.closest("table.confluenceTable", ".mceContent");
                    var $clipboardRows = $clipboard.children("tbody").length > 0 ? $clipboard.children("tbody").children("tr") : $clipboard.children("tr");
                    var $targetRows = $targetTable.children("tbody").children("tr");
                    var clipboardTableHeight = $clipboardRows.length;
                    var clipboardTableWidth = $clipboardRows.first().children("td, th").length;
                    var targetTableHeight = $targetRows.length;
                    var targetTableWidth = $targetRows.first().children("td, th").length;
                    var targetRowIndex = $targetCell.parent().index();
                    var targetCellIndex = $targetCell.index();

                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    var extraCells = targetCellIndex + clipboardTableWidth - targetTableWidth;
                    var extraRows = targetRowIndex + clipboardTableHeight - targetTableHeight;

                    extraCells = extraCells < 0 ? 0 : extraCells;
                    extraRows = extraRows < 0 ? 0 : extraRows;

                    $targetRows.each(function (index, row) {
                        var $row = $(row);
                        var $lastChild = $row.children().last();

                        for (var i = 0; i < extraCells; i++) {
                            $row.append($lastChild.clone().html(tinymce.isIE ? "" : "<br/>"));
                        }
                    });

                    var $lastRow = $targetRows.last();
                    var $additionalRow;
                    for (var i = 0; i < extraRows; i++) {
                        $additionalRow = $("<tr></tr>").insertAfter($lastRow);

                        for (var j = 0; j < targetTableWidth + extraCells; j++) {
                            $additionalRow.append("<td class=\"confluenceTd\">" + (tinymce.isIE ? "" : "<br/>") + "</td>");
                        }

                        $lastRow = $additionalRow;
                    }

                    var targetRows = [];
                    $targetTable.children("tbody").children("tr").slice(targetRowIndex).each(function (index, row) {
                        targetRows.push($.makeArray($(row).children("th, td").slice(targetCellIndex)));
                    });

                    var clipboardRows = [];
                    $clipboardRows.each(function (index, row) {
                        clipboardRows.push($.makeArray($(row).children("th, td")));
                    });

                    for (var sourceRow = clipboardRows.shift(), targetRow = targetRows.shift(); sourceRow && targetRow; sourceRow = clipboardRows.shift(), targetRow = targetRows.shift()) {
                        for (var sourceCell = sourceRow.shift(), targetCell = targetRow.shift(); sourceCell && targetCell; sourceCell = sourceRow.shift(), targetCell = targetRow.shift()) {
                            $(targetCell).html($(sourceCell).html());
                        }
                    }

                    // ensure we restore the cursor to the original cell where the paste was initiated
                    ed.selection.select($targetCell[0], 1);
                    ed.selection.collapse(true);

                    ed.undoManager.add();
                }
            }
        ],

        _applyOnBeforeSetContentListeners: function (editor, contentToSet) {
            var args = {content: contentToSet, format: 'html'};
            editor.selection.onBeforeSetContent.dispatch(editor.selection, args);
            return args.content;
        },

        /**
         * Instead of the old plain text method which tried to re-create a paste operation, the
         * new approach adds a plain text mode toggle switch that changes the behavior of paste.
         * This function is passed the same input that the regular paste plugin produces.
         * It performs additional scrubbing and produces (and inserts) the plain text.
         * This approach leverages all of the great existing functionality in the paste
         * plugin, and requires minimal changes to add the new functionality.
         * Speednet - June 2009
         */
        _insertPlainText: function (content) {
            var ed = this.editor;
            var linebr = getParam(ed, "paste_text_linebreaktype");
            var rl = getParam(ed, "paste_text_replacements");
            var is = tinymce.is;

            function process(items) {
                each(items, function (v) {
                    if (v.constructor == RegExp) {
                        content = content.replace(v, "");
                    } else {
                        content = content.replace(v[0], v[1]);
                    }
                });
            }

            if ((typeof(content) === "string") && (content.length > 0)) {
                // If HTML content with line-breaking tags, then remove all cr/lf chars because only tags will break a line
                if (/<(?:p|br|h[1-6]|ul|ol|dl|table|t[rdh]|div|blockquote|fieldset|pre|address|center)[^>]*>/i.test(content)) {
                    process([
                        /[\n\r]+/g
                    ]);
                } else {
                    // Otherwise just get rid of carriage returns (only need linefeeds)
                    process([
                        /\r+/g
                    ]);
                }

                process([
                    [/<\/(?:p|h[1-6]|ul|ol|dl|table|div|blockquote|fieldset|pre|address|center)>/gi, "\n\n"],        // Block tags get a blank line after them
                    [/<br[^>]*>|<\/tr>/gi, "\n"],                // Single linebreak for <br /> tags and table rows
                    [/<\/t[dh]>\s*<t[dh][^>]*>/gi, "\t"],        // Table cells get tabs betweem them
                    /<[a-z!\/?][^>]*>/gi,                        // Delete all remaining tags
                    [/&nbsp;/gi, " "],                            // Convert non-break spaces to regular spaces (remember, *plain text*)
                    [/(?:(?!\n)\s)*(\n+)(?:(?!\n)\s)*/gi, "$1"],// Cool little RegExp deletes whitespace around linebreak chars.
                    [/\n{3,}/g, "\n\n"]                            // Max. 2 consecutive linebreaks
                ]);

                content = ed.dom.decode(tinymce.html.Entities.encodeRaw(content));

                // Perform default or custom replacements
                if (is(rl, "array")) {
                    process(rl);
                } else if (is(rl, "string")) {
                    process(new RegExp(rl, "gi"));
                }

                // Treat paragraphs as specified in the config
                if (linebr == "none") {
                    // Convert all line breaks to space
                    process([
                        [/\n+/g, " "]
                    ]);
                } else if (linebr == "br") {
                    // Convert all line breaks to <br />
                    process([
                        [/\n/g, "<br />"]
                    ]);
                } else if (linebr == "p") {
                    // Convert all line breaks to <p>...</p>
                    process([
                        [/\n+/g, "</p><p>"],
                        [/^(.*<\/p>)(<p>)$/, '<p>$1']
                    ]);
                } else {
                    // defaults to "combined"
                    // Convert single line breaks to <br /> and double line breaks to <p>...</p>
                    process([
                        [/\n\n/g, "</p><p>"],
                        [/^(.*<\/p>)(<p>)$/, '<p>$1'],
                        [/\n/g, "<br />"]
                    ]);
                }

                ed.execCommand('mceInsertContent', false, content);
            }
        },

        /**
         * This method will open the old style paste dialogs. Some users might want the old behavior but still use the new cleanup engine.
         */
        _legacySupport: function () {
            var t = this;
            var ed = t.editor;

            // Register command(s) for backwards compatibility
            ed.addCommand("mcePasteWord", function () {
                ed.windowManager.open({
                    file: t.url + "/pasteword.htm",
                    width: parseInt(getParam(ed, "paste_dialog_width")),
                    height: parseInt(getParam(ed, "paste_dialog_height")),
                    inline: 1
                });
            });

            if (getParam(ed, "paste_text_use_dialog")) {
                ed.addCommand("mcePasteText", function () {
                    ed.windowManager.open({
                        file: t.url + "/pastetext.htm",
                        width: parseInt(getParam(ed, "paste_dialog_width")),
                        height: parseInt(getParam(ed, "paste_dialog_height")),
                        inline: 1
                    });
                });
            }

            // Register button for backwards compatibility
            ed.addButton("pasteword", {title: "paste.paste_word_desc", cmd: "mcePasteWord"});
        },
        /**
         * Parses the specified html and turns it into a jQuery wrapped collection of DOM elements.
         *
         * @param html the html
         * @param owningDocument (optional) the document that will own the DOM elements that are returned. Defaults to the current document.
         *
         * @returns a jQuery wrapped collection of DOM elements
         */
        parse: function (html, owningDocument) {
            if (html.charAt(0) === "<" && html.charAt(html.length - 1) === ">" && html.length >= 3) {
                /**
                 * This "if" condition has been borrowed from jQuery source. This case is important because surrounding
                 * "<td>foo</td>" with a DIV will cause the TD tags to be lost.
                 */
                return $(html, owningDocument || document);
            } else {
                /**
                 * Surrounding the html with DIV is crucial. The html may just be plain text that resembles a jQuery
                 * selector. Illegal selectors can block up the browser.
                 */
                return $("<div>" + html + "</div>", owningDocument || document).contents();
            }
        },
        /**
         * Takes in the raw html from the clipboard, applies any relevant processing.
         *
         * @param clipboardHtml clipboard html
         * @returns processed html or the original html
         */
        repair: function (clipboardHtml) {
            if (!clipboardHtml) {
                return clipboardHtml;
            }

            $.each(htmlRepairers, function (index, htmlRepairer) {
                clipboardHtml = htmlRepairer.repair(clipboardHtml);
            });

            return clipboardHtml;
        }
    });

    tinymce.PluginManager.add('aePaste', tinymce.plugins.AtlassianEditorPaste);
})($);

