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

var HBAPI = (function() {
    var me;
    var loggedIn = false;
    return {
        highlightName: function() {
            if (loggedIn) {
                $("ul.chatBody li span.message:not(.highlight):contains('" + me + "')").each(function(index, elem) {
                    var newme = "<span class='emphasize'>" + me + "</span>";
                    elem.innerHTML = elem.innerHTML.replace(me, newme);
                }).parent().parent().addClass("highlight");
            }
        },
        init: function() {
            me = $("span.navItemsUser div.cursorD span.ng-binding").html();
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
    HBAPI.init();
}

var t = setInterval(waitForLoad, 1000);