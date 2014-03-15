/**
 * Better HitBox TV Chat.
 *
 * Adds a few features that don't currently exist with the chat interface on Hitbox.tv.
 *  - name highlight
  *  - Timestamp/userlist have to be re-enabled each time the page is loaded
 */

var SETTINGSDB = (function(){
    var settings = {};
    return {
        save: function() {
            chrome.storage.sync.set({'bhbtv.settings': settings}, null);
        },
        get: function(key) {
            if (settings.hasOwnProperty(key)) {
                return settings[key];
            }
            else {
                return null;
            }
        },
        show: function(items) {
            console.log(items);
        },
        set: function(k, v) {
            if (k != null && v != null) {
                settings[k] = v;
            }
            SETTINGSDB.save();
        },
        load: function(config) {
            settings = {};
            if (Object.keys(config).length != 0) {
                settings = config['bhbtv.settings'];
            }
        },
        init: function() {
            chrome.storage.sync.get("bhbtv.settings", SETTINGSDB.load);
        }
    };
})();

var HBAPI = (function() {
    var me;
    var loggedIn = false;
    return {
        checkHighlights: function(keyword) {
            $("ul.chatBody li:not(.skip) span.message:contains('" + keyword + "')").parent().parent().addClass("skip highlight");
        },
        addIcons: function() {
            $("ul.chatBody li.user").addClass("mods");
            $("ul.chatBody li.admin").addClass("adm");
        },
        fixMessage: function() {
            if (loggedIn) {
                HBAPI.checkHighlights(me);
            }
            HBAPI.addIcons();
        },
        init: function() {
            this.log("<strong>Better HitBoxTV</strong> - Brought to you by <a class='devmoose' href='http://hitbox.tv/TheMoose' target='_blank'>TheMoose</a>");
            me = $("span.navItemsUser div.cursorD span.ng-binding").html();
            loggedIn = $("body").hasClass("loggedIn");
            setInterval(this.fixMessage, 750);
            HBAPI.addSettingsOption();
        },
        log: function(msg) {
            // Simple logging. Adds an item to the chat list display.
            var d = new Date();
            var time = d.getHours() + ":" + d.getMinutes();
            var template = "<li ng-repeat='message in messages' class='from_ buffer_ skip'><p>" +
                "<span ng-bind-html-unsafe='message.text' class='message ng-binding'>" + msg + "</span>" +
                "</p><div class='bufferTimestamp'></div><p></p></li>";
            $("ul.chatBody").prepend(template);
        },
        setupBinds: function() {
            // If the settings exist already and are enabled, go ahead and enable the userlist/timestamp display.
            if (SETTINGSDB.get('userlist')) {
                $("#chatUsersBox").click();
            }
            if (SETTINGSDB.get('timestamp')) {
                $("#timestampsBox").click();
            }
            // Whenever the userlist/timestamp checkboxes are clicked, save the settings.
            $("#chatUsersBox").bind('change', function() {
                SETTINGSDB.set('userlist', $(this).is(":checked"));
            });
            $("#timestampsBox").bind('change', function() {
                SETTINGSDB.set('timestamp', $(this).is(":checked"));
            });
        },
        addSettingsOption: function() {
            var listOption = "<section><span id='bhbtv.btn' class='icon-cog hoverG2'>BetterHBTV Settings</span></section>";
            console.log(listOption, $("section.chatOverlay div.chatSettings:not(.chatUserHoverCard) section").last().html());
            $("section.chatOverlay div.chatSettings:not(.chatUserHoverCard) section").last().after(listOption);
            $("#bhbtv.btn").bind("click", HBAPI.showSettings);
        },
        settingsModal: function() {

        },
        showSettings: function() {}
    };
})();

function waitForLoad() {
    if (document.readyState != "complete") {
        return;
    }
    clearInterval(t);
    HBAPI.init();
    SETTINGSDB.init();
    setTimeout(HBAPI.setupBinds, 1000);
}

var t = setInterval(waitForLoad, 1000);