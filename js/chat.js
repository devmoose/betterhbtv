/**
 * Better HitBox TV Chat.
 *
 * Adds a few features that don't currently exist with the chat interface on Hitbox.tv.
 *  - name highlight
 *  - URLs are not linked automatically
 *  - Timestamp/userlist have to be re-enabled each time the page is loaded
 */

var URL = /(((http|ftp|https):\/\/)?([\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?))/;

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

$.extend($.expr[':'],{
    containsRegex: function(a,i,m){
        var regreg =  /^\/((?:\\\/|[^\/])+)\/([mig]{0,3})$/,
            reg = regreg.exec(m[3]);
        return reg ? RegExp(reg[1], reg[2]).test($.trim(a.innerHTML)) : false;
    }
});

var HBAPI = (function() {
    var me;
    var loggedIn = false;
    return {
        checkHighlights: function() {
            $("ul.chatBody li span.message:not(.highlight):contains('" + me + "')").each(function(index, elem) {
                var newme = "<span class='emphasize'>" + me + "</span>";
                elem.innerHTML = elem.innerHTML.replace(me, newme);
            }).parent().parent().addClass("highlight");
        },
        checkForUrls: function() {
            $("ul.chatBody li span.message:not(.url-skip):containsRegex('" + URL + "')").each(function(i, el) {
                var results = URL.exec(el.innerHTML);
                if (results[3] != null) {
                    el.innerHTML = el.innerHTML.replace(URL, "<a href='$1' target='_blank'>$4</a>");
                }
                else {
                    el.innerHTML = el.innerHTML.replace(URL, "<a href='http://$1' target='_blank'>$4</a>");
                }
            }).addClass("url-skip");
        },
        fixMessage: function() {
            if (loggedIn) {
                HBAPI.checkHighlights();
            }
            HBAPI.checkForUrls();
        },
        init: function() {
            me = $("span.navItemsUser div.cursorD span.ng-binding").html();
            loggedIn = $("body").hasClass("loggedIn");
            setInterval(this.fixMessage, 500);
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