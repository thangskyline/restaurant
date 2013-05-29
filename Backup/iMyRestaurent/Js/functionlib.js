var lib = {

    //check every thing;
    is_arr: function (arr) { return (arr != null && arr.constructor == Array) },

    is_str: function (str) { return (str && (/string/).test(typeof str)) },

    is_func: function (func) { return (func != null && func.constructor == Function) },

    is_num: function (num) { var num = Number(num); return (num != null && !isNaN(num)) },

    is_int: function (x) { var y = parseInt(x); if (isNaN(y)) return false; return x == y && x.toString() == y.toString(); },

    is_obj: function (obj) { return (obj != null && obj instanceof Object) },

    is_ele: function (ele) { return (ele && ele.tagName && ele.nodeType == 1) },

    is_exists: function (obj) { return (obj != null && obj != undefined && obj != "undefined") },

    is_blank: function (str) { return (lib.util_trim(str) == "") },

    is_phone: function (num) {
        return (/^(01([0-9]{2})|09[0-9])(\d{7})$/i).test(num);
    },

    is_email: function (str) { return (/^[a-z-_0-9\.]+@[a-z-_=>0-9\.]+\.[a-z]{2,3}$/i).test(lib.util_trim(str)) },

    is_username: function (value) { return (value.match(/^[0-9]/) == null) && (value.search(/^[0-9_a-zA-Z]*$/) > -1); },

    is_link: function (str) { return (/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/).test(lib.util_trim(str)) },

    is_image: function (imagePath) {
        var fileType = imagePath.substring(imagePath.lastIndexOf("."), imagePath.length).toLowerCase();
        return (fileType == ".gif") || (fileType == ".jpg") || (fileType == ".png") || (fileType == ".jpeg");
    },

    is_ff: function () { return (/Firefox/).test(navigator.userAgent) },

    is_ie: function () { return (/MSIE/).test(navigator.userAgent) },

    is_ie6: function () { return (/MSIE 6/).test(navigator.userAgent) },

    is_ie7: function () { return (/MSIE 7/).test(navigator.userAgent) },

    is_ie8: function () { return (/MSIE 8/).test(navigator.userAgent) },

    is_chrome: function () { return (/Chrome/).test(navigator.userAgent) },

    is_opera: function () { return (/Opera/).test(navigator.userAgent) },

    is_safari: function () { return (/Safari/).test(navigator.userAgent) },

    //redirect to url
    redirect: function (url) { window.location = url },

    util_trim: function (str) { return (/string/).test(typeof str) ? str.replace(/^\s+|\s+$/g, "") : "" },

    util_random: function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a },

    get_ele: function (id) { return document.getElementById(id) },

    get_uuid: function () { return (new Date().getTime() + Math.random().toString().substring(2)) },

    /*
    shop.numberFormat(extra[i].price, 0, '', '.')
    */
    numberFormat: function (number, decimals, dec_point, thousands_sep) {
        var n = number, prec = decimals;
        n = !isFinite(+n) ? 0 : +n;
        prec = !isFinite(+prec) ? 0 : Math.abs(prec);
        var sep = (typeof thousands_sep == "undefined") ? '.' : thousands_sep;
        var dec = (typeof dec_point == "undefined") ? ',' : dec_point;
        var s = (prec > 0) ? n.toFixed(prec) : Math.round(n).toFixed(prec);
        var abs = Math.abs(n).toFixed(prec);
        var _, i;
        if (abs >= 1000) {
            _ = abs.split(/\D/);
            i = _[0].length % 3 || 3;
            _[0] = s.slice(0, i + (n < 0)) +
			_[0].slice(i).replace(/(\d{3})/g, sep + '$1');
            s = _.join(dec);
        } else {
            s = s.replace(',', dec);
        }
        return s;
    },

    numberOnly: function (myfield, e) {
        var key, keychar;
        if (window.event) { key = window.event.keyCode }
        else if (e) { key = e.which }
        else { return true }
        keychar = String.fromCharCode(key);
        if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13) || (key == 27)) { return true }
        else if (("0123456789").indexOf(keychar) > -1) { return true }
        return false;
    },

    // Get url parameter follow param name
    // Example: url: http://www.foo.com/index.html?bob=123&frank=321&tom=213#top
    // Get param: var frank_param = gup( 'frank' );
    gup: function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null) return null;
        else return results[1];
    }

};
