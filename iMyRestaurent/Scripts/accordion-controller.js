$(document).ready(function () {
        accordion.init();    
});

var tab = {
    
}
var accordion = {
    minHeight: $('.acc-header').outerHeight(),
    maxHeight: 305,
    time: 200,
    controls: $('.accordion'),
    body: function (item) {
        return item.find('.acc-body');
    },
    init: function () {
        $('.acc-header').click(function () {
            if (!$(this).is('.show')) {
                accordion.expand($(this).parents('.accordion'));
            }
        });

        $('.acc-header:first').click();
    },
    expand: function (item) {
        $.each(accordion.controls, function (key, value) {
            var acc = $(value);
            //if (true) {
            if (acc.is(item)) {
                acc.find('.acc-body').show();
                acc.animate({
                    height: accordion.maxHeight
                },
                accordion.time,
                function () {
                    $(this).addClass('show');
                    $(this).removeClass('hide');
                });
            } else {
                acc.find('.acc-body').hide();
                acc.animate({
                    height: accordion.minHeight
                },
                accordion.time,
                function () {
                    $(this).addClass('hide');
                    $(this).removeClass('show');
                });
            }
        });
    }
};