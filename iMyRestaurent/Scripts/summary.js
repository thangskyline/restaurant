$(document).ready(function () {
    // initialize menu
    $('#date-picker').scroller({
        preset: 'date',
        theme: Utils.mobiscrollTheme(),
        display: 'modal',
        mode: Utils.mobiscrollMode(),
        dateFormat: 'D, d M yy',
        dateOrder: 'D dMyy'
    });

    $('.button-options').click(function (event) {
        SummaryMenu.show();

        return false;
    });

    $('#location-list').change(function () {
        submit(true);
    });

    $('#date-picker').change(function () {
        submit(true);
    });

    $('#btn-refresh').click(function () {
        submit(false)
    });

    $('#previous-date').click(function () {
        var currentDate = $('#date-picker').scroller('getDate');
        currentDate.setDate(currentDate.getDate() - 1);
        $('#date-picker').scroller('setDate', currentDate, true);
    });

    $('#next-date').click(function () {
        var currentDate = $('#date-picker').scroller('getDate');
        currentDate.setDate(currentDate.getDate() + 1);
        $('#date-picker').scroller('setDate', currentDate, true);
    });

    $('#previous-location').click(function () {
        // get selected-index
        var selectedIndex = $('#location-list').prop('selectedIndex');

        // check boundary
        if (selectedIndex > 0) {
            // selected previous location
            $('select#location-list').prop('selectedIndex', selectedIndex - 1);

            // submit form
            submit(true);
        }
    });

    $('#next-location').click(function () {
        // get selected-index
        var selectedIndex = $('#location-list').prop('selectedIndex');
        var max = $('#location-list option').length;

        // check boundary
        if (selectedIndex < max - 1) {
            // select location
            $('select#location-list').prop('selectedIndex', selectedIndex + 1);

            // submit form
            submit(true);
        }
    });

    if ($('#summary-chart').length > 0) {
        Utils.touchScroll('#adapt-div');

        // start chart control
        Chart.setup();

        // setup zoom
        var zoomScale = $('input[name="ZoomScale"]').val();

        ZoomControl.setup('#chart-area', zoomScale, function () {
            Chart.adapt();
        });

        // restore scroll position
        $('#adapt-div').scrollTop($('#scroll-top').val());
        $('#adapt-div').scrollLeft($('#scroll-left').val());

        // assign zoom-in, zoom-out handle
        $('.button-zoom-out').click(function () {
            ZoomControl.zoomout('#zoom-scale');
        });

        $('.button-zoom-in').click(function () {
            ZoomControl.zoomin('#zoom-scale');
        });

        $('.summary-button').click(function () {
            toggleChart($(this));
        });

        $('.business-hour-header').click(function () {
            var eventId = $(this).attr('id');

            var date = $('#date-picker').scroller('getDate');

            day = date.getDay() == 0 ? 6 : date.getDay() - 1;

            // SonTH fix bug #25. Need to stop page refresh when showing dialog
            stopTimer();
            openMyMenu1(eventId, day, function () {
                startTimer();
            });
        });
    }
});

$(document).ready(function () {
    showAndHideProgressDialog('Restaurant location data loaded successfully!');

    // start timer
    startTimer();
});

function submit(isReset) {
    showProgressDialog('Loading location data');

    // submit in interval because the scrollmobi is lag
    setTimeout(function () {
        if (isReset) {
            $('#zoom-scale').val(1);
            $('#scroll-top').val(0);
            $('#scroll-left').val(0);
        }

        $('#my-form').submit();
    }, 100);
}

function toggleFloatingBars() {
    // show time-ruler
    var scrollTop = $('#adapt-div').scrollTop();
    alert(scrollTop);
    if (scrollTop > 50) {
        $('#float-time-ruler').toggle('fade', {}, 200);
        $('#float-time-ruler').css('top', scrollTop - 40);
    }

    var scrollLeft = $(".chart-div").scrollLeft();
    if (scrollLeft > 140) {
        // show table-ruler
        $(".floating-table-ruler").toggle("fade", {}, 200);
        $(".floating-table-ruler").css("left", scrollLeft);
    }
}

function toggleChart(button) {
    var eventId = button.attr("event-id");
    $('.biz-hour-area[event-id="' + eventId + '"]').toggle('fade', {}, 200);
    $('.chart-element[event-id="' + eventId + '"]').toggle("fade", {}, 200);

    // change icon
    button.toggleClass('minus-icon');
    button.toggleClass('plus-icon');
}

function hideFloatingBars() {
    $('#float-time-ruler').fadeOut(200);
    $(".floating-table-ruler").fadeOut(200);

    $('#scroll-top').val($('#adapt-div').scrollTop());
    $('#scroll-left').val($('#adapt-div').scrollLeft());
}

var _refreshTimer;

function stopTimer() {
    // SonTH fix bug #25. Need to stop page refresh when showing dialog. Ensure that timer is not cleared twice
    if (_refreshTimer != null) {
        clearTimeout(_refreshTimer);
        _refreshTimer = null;
    }
}

function startTimer() {
    // SonTH fix bug #25. Need to stop page refresh when showing dialog. Ensure that timer is not started twice
    if (_refreshTimer == null) {
        _refreshTimer = setTimeout(function () {
            submit(false);
        }, 1000 * 60 * 5);
    }
}