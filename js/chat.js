/**
 * Better HitBox TV Chat.
 *
 * Adds a few features that don't currently exist with the chat interface on Hitbox.tv.
 *  - name highlight
  *  - Timestamp/userlist have to be re-enabled each time the page is loaded
 */

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

var HBAPI = (function() {
    var me;
    var loggedIn = false;
    return {
        checkHighlights: function(keyword) {
            $("ul.chatBody li span.message:not(.highlight):contains('" + keyword + "')").parent().parent().addClass("highlight");
        },
        fixMessage: function() {
            if (loggedIn) {
                HBAPI.checkHighlights(HBAPI.me);
            }
        },
        init: function() {
            me = $("span.navItemsUser div.cursorD span.ng-binding").html();
            loggedIn = $("body").hasClass("loggedIn");
            setInterval(this.fixMessage, 750);
        },
        log: function(msg) {
            var d = new Date();
            var time = d.getHours() + ":" + d.getMinutes();
            var template = "<li ng-repeat='message in messages' class='from_ buffer_'><p>" +
                "<span ng-show='timestamps' class='time ng-binding'>" + time + "</span>" +
                "<span ng-bind-html-unsafe='message.text' class='message ng-binding'>" + msg + "</span>" +
                "</p><div class='bufferTimestamp'></div><p></p></li>";
            $("ul.chatBody").append(template);
        }
    };
})();

function waitForLoad() {
    if (document.readyState != "complete") {
        return;
    }
    clearInterval(t);
    HBAPI.init();
}

var t = setInterval(waitForLoad, 1000);