/**
 * Better HitBox TV Chat.
 *
 * Adds a few features that don't currently exist with the chat interface on Hitbox.tv.
 *  - name highlight
 *  - URLs are not linked automatically
 *  - Timestamp/userlist have to be re-enabled each time the page is loaded
 */

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

function HBDB(item) {
    this.VERSION = 2;
    this.DB = null;
    this.settings = [];
    this.READY = false;
    this.open = function(callback) {
        try {
            var request = window.indexedDB.open("BHBTVSettings", VERSION);
            request.onsuccess = function(e) {
                DB = e.target.result;
                parent.READY = true;
                console.log("Database opened. Initializing API.");
                callback();
            };
            request.onerror = function(e) {
                console.log("Error opening database: #" + e.errorCode + " - " + e.message);
            };
            request.onupgradeneeded = function(e) {
                // Need to update database.
                console.log("Upgrading database.");
                if (!e.target.result.objectStoreNames.contains("settings")) {
                    var settingsStore = e.target.result.createObjectStore("settings", {keyPath: "key"})
                    console.log("Settings store created.");
                }
                READY = true;
            };
        }
        catch (e) {
            console.log("Error #" + e.target.errorCode + ": " + e.target.message);
        }
    };
    this.init = function(callback) {
        this.open(callback);
    };
    this.set = function(k, v) {
        var tx = db.transaction("settings", "readwrite");
        var store = tx.objectStore("settings");
        var request = store.put({
            "key": k,
            "value": v
        });
        request.onsuccess = function(e) {
            console.log("added");
        };
        request.onerror = function(e) {
            console.log("didn't add");
        };
    };
    this.get = function(key, item, callback) {
        var tx = db.transaction("settings", "readwrite");
        var store = tx.objectStore("settings");
        var request;
        if (key == null) {
            // Return all settings
            console.log("Loading settings");
            request = store.openCursor();
            request.onsuccess = function(e) {
                var result = e.target.result;
                if (result) {
                    settings[result.key] = result.value;
                    result.continue();
                }
                console.log(t);
                callback();
            };
        }
        else {
            var find = arguments[1];
            key = IDBKeyRange.only(find);
            request = store.openCursor(key);
            request.onsuccess = function(e) {
                var result = e.target.result;
                if (!!result == false) {
                    return null;
                }
                callback(item, result.value);
            };
        }
    };
}

var HBAPI = (function() {
    var timer;
    var settingsDB;
    var me;
    var loggedIn = false;
    var settings = [];
    return {
        highlightName: function() {
            if (loggedIn) {
                $("ul.chatBody li span.message:not(.highlight):contains('" + me + "')").each(function(index, elem) {
                    var newme = "<span class='emphasize'>" + me + "</span>";
                    elem.innerHTML = elem.innerHTML.replace(me, newme);
                }).parent().parent().addClass("highlight");
            }
        },
        saveSettings: function() {
            for (var key in this.settings) {
                settingsDB.set(key, settings[key]);
            }
        },
        getSettings: function(callback) {
            return settingsDB.get(callback);
        },
        getSetting: function(key) {
            if (this.settings != null && key in settings) {
                return settings[key];
            }
            else {
                return settingsDB.get(key);
            }
        },
        check: function(item, value) {
            $(item).prop('checked', value);
        },
        setupBinds: function() {
            this.getSetting('userlist', "#chatUsersBox", HBAPI.check);
            this.getSetting('timestamps', "#timestampsBox", HBAPI.check);
            $("#chatUsersBox").bind('change', function() {
                HBAPI.settings.userlist = $(this).is(":checked");
                HBAPI.saveSettings();
            });
            $("#timestampsBox").bind('change', function() {
                HBAPI.settings.timestamps = $(this).is(":checked");
                HBAPI.saveSettings();
            });
        },
        init: function() {
            me = $("span.navItemsUser div.cursorD span.ng-binding").html();
            console.log("I am " + me);
            loggedIn = $("body").hasClass("loggedIn");
            setInterval(this.highlightName, 500);
        }
    };
})();

function waitForLoad() {
    if (document.readyState != "complete") {
        return;
    }
    clearInterval(t);
    //HBDB.init(startApi);
    HBAPI.init();
}

function startApi() {
    a = setInterval(apiInit, 1000);
}

function apiInit() {
    if (READY) {
        console.log("Ready, initializing API.");
        clearInterval(a);
        HBAPI.init();
    }
    else {
        console.log("HBDB not ready.");
    }
}

var a;
var t = setInterval(waitForLoad, 1000);