var resizeGlobalTimeout;
var INTERVAL = 50;
$(window).resize(function () {
    clearTimeout(resizeGlobalTimeout);

    resizeGlobalTimeout = setTimeout(function () {
        if ($('#overlay-popup').length > 0) {
            $('#overlay-popup, #copy-dialog-mask').width(0).height(0);
            $('.core-popup, #copy-dialog').css({ top: 0, left: 0 });

            FlexibleLayout.adapt();

            $('.core-popup').css({
                top: (Utils.pageH() - $('.core-popup').height()) / 2,
                left: (Utils.pageW() - $('.core-popup').width()) / 2
            });

            var top = parseInt($("#iMyMenuDialog").css("top")) + 90;
            Utils.positioningDialog($("#copy-dialog"), top, "center");

            $('#overlay-popup, #copy-dialog-mask').width(Utils.pageW()).height(Utils.pageH());
        }

        // report
        if ($('#report-dialog').length > 0) {
            Report.dock();
        }

        if ($('#booking-detail-dialog').length > 0) {
            BookingDetail.dock();
        }

        if ($('#simple-reservation').length > 0) {
            ReservationForm.dock();
        }

        if ($('#booking-history-dialog').length > 0) {
            BookingHistory.dock();
        }

        if ($('#select-type-dialog').length > 0) {
            SelectTypeDialog.dock();
        }

        // progress dialog
        if ($('#dialog-mask').length > 0) {
            var isDisplaying = $('#dialog-mask').css('display') != 'none';

            if (isDisplaying) {
                $("#progress-dialog").css("margin-top", ($(window).height() - $("#progress-dialog").height()) / 2 + $(window).scrollTop());
            }
        }

        // message box {
        if ($('.info-box').length > 0) {
            var isDisplaying = $('.info-box').css('display') != 'none';

            if (isDisplaying) {
                $('.info-box').css('margin-top', ($('.info-box-mask').height() - $('.info-box').outerHeight()) / 2);
            }
        }

        // option menu in summary page
        if ($("#float-menu").length > 0) {
            SummaryMenu.dock();
        }

        // suggest box in reservation page
        if ($(".suggest-mask").length > 0) {
            var isDisplaying = $(".suggest-mask").css("display") != 'none';

            if (isDisplaying) {
                $('.suggest-mask').width(0).height(0);
                FlexibleLayout.adapt();
                $('.suggest-mask').width(Utils.pageW()).height(Utils.pageH());
            }
        }

        if ($('#pub-day-panel').length > 0) {
            holiday.resizePublicHolidayTable();
        }
    }, INTERVAL);
});