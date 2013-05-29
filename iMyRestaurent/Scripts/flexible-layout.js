var FL_HIDE = '.-fl-h';
var FL_SHOW = '.-fl-s';
var FL_CSS_SWITCH = '.-fl-css-switch';
var FL_CSS_ADD = '.-fl-css-add';
var FL_AUTO_HEIGHT = '.-fl-ah';

var FlexibleLayout = {
    adapt: function () {
        var viewPortW = $(window).width();
        var viewPortH = $(window).height();

        // -fl-h: begin
        $.each($(FL_HIDE), function (key, value) {
            var flaWidth = parseInt($(value).attr('fla-width'));
            var flaHeight = parseInt($(value).attr('fla-height'));

            if (flaWidth > viewPortW || flaHeight > viewPortW) {
                $(value).hide();
            } else {
                $(value).show();
            }
        });
        // -fl-h: end

        // -fl-s: begin
        $.each($(FL_SHOW), function (key, value) {
            var flaWidth = parseInt($(value).attr('fla-width'));
            var flaHeight = parseInt($(value).attr('fla-height'));

            if (flaWidth > viewPortW || flaHeight > viewPortW) {
                $(value).show();
            } else {
                $(value).hide();
            }
        });
        // -fl-s: end

        // -fl-css-switch: begin
        $.each($(FL_CSS_SWITCH), function (key, value) {
            var flaWidth = parseInt($(value).attr('fla-width'));
            var flaHeight = parseInt($(value).attr('fla-height'));
            var flClass = $(value).attr('fla-css');
            var flClassSwitch = $(value).attr('fla-css-switch');

            if (flaWidth > viewPortW || flaHeight > viewPortW) {
                $(value).attr('class', flClassSwitch + ' -fl-css-switch');
            } else {
                $(value).attr('class', flClass + ' -fl-css-switch');
            }
        });
        // -fl-css-switch: end

        // -fl-css-add: begin
        $.each($(FL_CSS_ADD), function (key, value) {

            var flaWidth = parseInt($(value).attr('fla-width'));
            var flaHeight = parseInt($(value).attr('fla-height'));
            var flClass = $(value).attr('fla-css');

            if (flaWidth > viewPortW || flaHeight > viewPortW) {
                $(value).addClass(flClass);
            } else {
                $(value).removeClass(flClass);
            }
        });
        // -fl-css-add: end

        // -fl-ah: begin
        $.each($(FL_AUTO_HEIGHT), function (key, value) {
            if ($(value).is(':visible')) {
                var height = parseInt($(value).css('min-height'));
                $(value).outerHeight(height);

                var bottomPos = $('#footer').position().top - $('#footer').outerHeight();
                var contentHeight = $('#content').outerHeight();
                if (contentHeight + 10 < bottomPos) {
                    $(value).outerHeight($(value).outerHeight() + (bottomPos - contentHeight - 10));
                }
            }
        });
        // -fl-ah: end

        // adapt time-ruler (reservation page)
        if ($('#ruler').length > 0) {
            var oldClass = $('#ruler').attr('class');
            if (viewPortW < 480) {
                $('#ruler').attr('class', 'w320');
            } else if (viewPortW < 520) {
                $('#ruler').attr('class', 'w480');
            } else if (viewPortW < 640) {
                $('#ruler').attr('class', 'w520');
            }
            else if (viewPortW < 1020) {
                $('#ruler').attr('class', 'w640');
            } else {
                $('#ruler').removeAttr('class');
            }

            if (oldClass !== $('#ruler').attr('class')) {
                drawBlocks();
            }
        }
    }
};

var _fl_timeout;

$(window).resize(function () {
    clearTimeout(_fl_timeout);

    _fl_timeout = setTimeout(FlexibleLayout.adapt, 200);
});

$(document).ready(FlexibleLayout.adapt);

