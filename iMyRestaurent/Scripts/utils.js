var flags = { canTouchScroll: true };

var DAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];
var DAY_NAMES_JS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
var SHORTDAY_NAMES = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
];

var MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

var d = {};
d.lib = {};
d.lib.offset = function (selector, relativeTo) {
    var top = 0, left = 0;
    var ele = $(selector)[0];
    var cont = false;

    if ($(ele).css('position') != 'relative') {
        do {
            top += ele.offsetTop;
            left += ele.offsetLeft;
            ele = ele.offsetParent;
            //cont = $(ele).css('position') != 'relative';
        } while ($(ele).css('position') != 'relative' && ele != null && (!$(ele).is('html')))
    }

    return { top: top, left: left };
};
d.lib.isAndroid = function () {
    return navigator.userAgent.toLowerCase().indexOf('android') > -1;
};
d.lib.offsetToElement = function (event, element) {
    var adaptDiv = $('#adapt-div')[0];
    var rootOffset = { left: adaptDiv.offsetLeft, top: adaptDiv.offsetTop };
    var scroll = { left: adaptDiv.scrollLeft, top: adaptDiv.scrollTop };

    var offset = d.lib.offset('#chart-body');

    var left = rootOffset.left + offset.left * ZoomControl.currentScale;
    var top = rootOffset.top + offset.top * ZoomControl.currentScale;

    //$('#title').html(left + ':' + top + '|' + event.clientX + ':' + event.clientY);

    return {
        left: (event.clientX - left + scroll.left) / ZoomControl.currentScale,
        top: (event.clientY - top + scroll.top) / ZoomControl.currentScale
    };
};

var Utils = {
    mobiscrollMode: function () {
        return d.lib.isAndroid() ? 'clickpick' : 'scroller';
    },
    mobiscrollTheme: function () {
        return d.lib.isAndroid() ? 'android-ics' : 'ios';
    },
    showError: function () {
        MessageBox.show({
            message: ["We have encountered a server connection error. Please try again later!"],
            buttons: {
                ok: null
            }
        });
    },
    positioningDialog: function (dialog, top, left) {
        var center = {
            top: (Utils.pageH() - $(dialog).height()) / 2,
            left: (Utils.pageW() - $(dialog).width()) / 2
        };
        if (top == "center") {
            $(dialog).css("top", center.top);
        } else {
            $(dialog).css("top", top > center.top ? top : center.top);
        }

        if (left == "center") {
            $(dialog).css("left", center.left);
        } else {
            $(dialog).css("left", left > center.left ? left : center.left);
        }
    },
    pageH: function () {
        //return Math.min(Math.floor($(document).height()), Math.floor($('#bottom-anchor').position().top));
        var body = document.body,
            html = document.documentElement;
        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    },
    pageW: function () {
        //alert($("#wrapper").width());
        //alert($("body").width());
        return Math.max($("#wrapper").outerWidth(), $("body").outerWidth());
    },
    cloneTime: function (time) {
        var clone = new Date();
        clone.setTime(time.getTime());
        return clone;
    },
    nearTimeSlot: function (time) {
        var decreaseTime = typeof time == 'undefined' ? new Date() : Utils.cloneTime(time);
        var inscreaseTime = typeof time == 'undefined' ? new Date() : Utils.cloneTime(time);

        while (decreaseTime.getMinutes() % 15 != 0 && inscreaseTime.getMinutes() % 15 != 0) {
            decreaseTime.setMinutes(decreaseTime.getMinutes() - 1);

            inscreaseTime.setMinutes(inscreaseTime.getMinutes() + 1);
        }

        if (decreaseTime.getMinutes() % 15 == 0) {
            return decreaseTime;
        }
        else {
            return inscreaseTime;
        }
    },
    convertDateFromJSON: function (json) {
        var tick = json.replace('/Date(', '');
        tick = tick.replace(')/', '');
        var date = new Date();
        date.setTime(parseFloat(tick));

        return date;
    },
    touchScroll: function (selector) {
        if (typeof touchScroll != 'undefined') {
            touchScroll(selector);
        }
    },
    formatTime: function (time) {
        var hour = (time.getHours() + 100).toString().substr(1);
        var min = (time.getMinutes() + 100).toString().substr(1);

        return hour + ':' + min;
    },
    getDay: function (datetime) {
        //return 0-6 (sun to sat)
        var day = datetime.getDay();
        var dayName = DAY_NAMES_JS[day];
        for (var i = 0; i < DAY_NAMES.length; i++) {
            if (dayName == DAY_NAMES[i])
                return i;
        }
    }
    ,
    parseDateToJson: function (datetime) {
        return '/Date(' + datetime.getTime() + '/';
    }
    ,
    parseYearMonth: function (datetime) {
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1;
        return year.toString() + (month >= 10 ? month.toString() : '0' + month.toString());
    },
    //from json date to js date
    parseDateTime: function (jsonDate) {
        var milli = jsonDate.replace(/\/Date\((-?\d+)\)\//, '$1');
        var d = new Date(parseInt(milli));
        return d;
    },
    parseJsonDateToString: function (jsonDate) {
        return this.parseDateTimeToString(this.parseDateTime(jsonDate));
    },
    //from js datetime to yyyyMMdd
    parseDateTimeToString: function (datetime) {
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1;
        var date = datetime.getDate();
        return year.toString() + (month >= 10 ? month.toString() : '0' + month.toString()) + (date >= 10 ? date.toString() : '0' + date.toString());
    },
    sameDate: function (d1, d2) {
        return ((d1.getFullYear() === d2.getFullYear())
       && (d1.getMonth() === d2.getMonth())
       && (d1.getDate() === d2.getDate()));
    },
    cloneObject: function (obj) {
        var clone = {};
        for (var i in obj) {
            if (typeof (obj[i]) == "object")
                clone[i] = cloneObject(obj[i]);
            else
                clone[i] = obj[i];
        }
        return clone;
    },
    getMonthOfYear: function (strYearMonth) {
        var strMonth = strYearMonth.substring(4);
        var strYear = strYearMonth.substring(0, 4);
        return MONTH_NAMES[parseInt(strMonth, 10) - 1] + ' ' + strYear;
    },
    splitBy: function (s) {

    }
};

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
        enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
		    var 
			  oldval = this[prop]
			, newval = oldval
			, getter = function () {
			    return newval;
			}
			, setter = function (val) {
			    oldval = newval;
			    return newval = handler.call(this, prop, oldval, val);
			}
			;

		    if (delete this[prop]) { // can't watch constants
		        Object.defineProperty(this, prop, {
		            get: getter
					, set: setter
					, enumerable: true
					, configurable: true
		        });
		    }
		}
    });
}

// object.unwatch
if (!Object.prototype.unwatch) {
    Object.defineProperty(Object.prototype, "unwatch", {
        enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop) {
		    var val = this[prop];
		    delete this[prop]; // remove accessors
		    this[prop] = val;
		}
    });
}

function format(arguments) {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}
String.prototype.contains = function (it) { return this.indexOf(it) != -1; };