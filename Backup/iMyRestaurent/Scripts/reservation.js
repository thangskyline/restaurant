var RULER_LENGTH = $('#business-hour-display').width();
var W_UNIT = RULER_LENGTH / (60 * 24);

$(function () {
    ZoomControl.setup('#layout-div');

    $(".button-zoom-out").click(function () {
        ZoomControl.zoomout();
    });

    $(".button-zoom-in").click(function () {
        ZoomControl.zoomin();
    });

    $('#input-date').scroller({
        preset: 'datetime',
        theme: Utils.mobiscrollTheme(),
        display: 'modal',
        mode: Utils.mobiscrollMode(),
        separator: ' - ',
        stepMinute: 15,
        timeFormat: 'HH:ii',
        dateFormat: 'D, d M yy',
        timeWheels: 'HHii',
        dateOrder: 'D dMyy'
    });

    $('#input-date').change(function () {
        updateTableStatus();
    });

    $("#previous-date").click(function () {
        var currentDate = $('#input-date').scroller('getDate');
        currentDate.setDate(currentDate.getDate() - 1);
        $("#input-date").scroller('setDate', currentDate, true);

        updateTableStatus();
    });

    $("#next-date").click(function () {
        var currentDate = $('#input-date').scroller('getDate');
        currentDate.setDate(currentDate.getDate() + 1);
        $("#input-date").scroller('setDate', currentDate, true);

        updateTableStatus();
    });

    $("#input-date").click(function () {
        $("#ui-datepicker-div").css("z-index", 99);

        // save last selected time
        var seletectTime = $('#input-date').val();
        $('#input-date').data('last-selected-time', seletectTime);
    });

    $("input[type='radio']").live("click", function () {
        updateTableStatus(false);
    });

    $(".suggest-mask").click(hideSuggestList);

    $("input:not(#txt-guest-name)").focusin(hideSuggestList);

    $("#txt-guest-name").focusin(showSuggestList);

    $(".suggest-list li").live("click", function () {
        $("#txt-guest-name").val($(this).children("span").text());
        hideSuggestList();
    });

    $("#txt-phone-number").change(function () {
        updateGuestList();
        updateTableStatus(false);
    });

    $(".table").click(doBooking);

    $(".button-new-reservation").click(function () {
        // clear all recent info
        $("#hidden-values-store .booking-id").text("0");
        $(".new-reservation").addClass("hidden");
        $("#txt-guest-name").val("");
        $("#txt-phone-number").val("");
        $("#txt-guest-no").val("");

        FlexibleLayout.adapt();

        updateTableStatus(false);
    });

    $('.button-back').click(function () {
        var selectedTime = $('#input-date').scroller('getDate');

        var dateString = $.datepicker.formatDate('yymmdd', selectedTime);
        $("form#back input[name='Date']").val(dateString);

        $("form#back").submit();
    });
});

$(document).ready(function () {
    Utils.touchScroll('#layout-div');

    $(".suggest-mask").width(Utils.pageW());
    $(".suggest-mask").height(Utils.pageH());

    $('#txt-phone-number').focus();

    if ($.trim($('#input-date').val()).length === 0) {
        $('#input-date').scroller('setDate', Utils.nearTimeSlot(), true);
    }

    updateGuestList();

    updateTableStatus(true);

    $('.table[highlighted]').focus();
});

function updateGuestList() {
    $(".suggest-list ul").empty();
    $.ajax({
        type: "post",
        url: "/Reservation/GetGuestList",
        data: {
            LocationID: $("#hidden-values-store .location-id").text(),
            PhoneNumber: $("#txt-phone-number").val()
        },
        success: function (response) {
            if (response.IsSucceed && response.GuestNames != null) {
                var html = '';
                for (var i = 0; i < response.GuestNames.length; i++) {
                    html += '<li><span>' + response.GuestNames[i] + '</span></li>';
                }

                $(".suggest-list ul").append(html);

                if ($("#txt-guest-name:focus").length > 0) {
                    showSuggestList();
                }
            }
        }
    });
}

function showSuggestList() {
    if ($(".suggest-list ul li").length > 0) {
        $(".suggest-mask").show();
        $(".suggest-list").show();
    }
}

function hideSuggestList() {
    $(".suggest-mask").hide();
    $(".suggest-list").hide();
}

function updateTableStatus(useInitializeValue) {
    showProgressDialog("Update table statuses");

    var div = $("input[type='radio']:checked").parent();
    var sittingType = 0;

    if (useInitializeValue) {
        sittingType = $("#hidden-values-store .sitting-type").text();
    } else if (div.length > 0) {
        sittingType = div.attr("class").replace("right sitting-label ", "");
    }

    var personId = $("#hidden-values-store .person-id").text();

    $.ajax({
        type: "post",
        url: "/Reservation/Statuses",
        data: {
            LocationID: $("#hidden-values-store .location-id").text(),
            PhoneNumber: $("#txt-phone-number").val(),
            SittingType: sittingType,
            PersonID: personId,
            ReservationTime: $('#input-date').val()
        },
        success: updatePage
    });
}

function updatePage(response) {
    if (response.IsSucceed) {
        var html = '';

        // update biz hours
        $(".shift-block").remove();

        if (response.Blocks != null) {
            html = '';

            for (var i = 0; i < response.Blocks.length; i++) {
                var block = response.Blocks[i];
                if (block.IsKitchenBlock) {
                    html += '<div class="shift-block" style="left: ' + Math.round(block.Left) + 'px; width: ' + Math.round(block.Width) + 'px;">';
                    html += '   <div class="kitchen"></div>';
                    html += '</div>';
                }
                else {
                    html += '<div class="shift-block" style="left: ' + Math.round(block.Left) + 'px; width: ' + Math.round(block.Width) + 'px;">';
                    html += '   <span>' + block.Text + '</span>';
                    html += '</div>';
                }
            }

            $("#business-hour-display").append(html);
        }

        // update current shift info
        $(".sitting-label").remove();

        if ($(".table").length > 0 && response.CurrentShift != null) {
            html = '';

            html += '<div class="right sitting-label 3">';
            html += '   <input type="radio" value="' + response.CurrentShift.LongSittingTime + '" name="SittingType" />';
            html += '   <span>Long Sitting Time ' + toTime(response.CurrentShift.LongSittingTime) + '</span>';
            html += '</div>';
            html += '<div class="right sitting-label 2">';
            html += '   <input type="radio" value="' + response.CurrentShift.MediumSittingTime + '" name="SittingType" />';
            html += '   <span>Medium Sitting Time ' + toTime(response.CurrentShift.MediumSittingTime) + '</span>';
            html += '</div>';
            html += '<div class="right sitting-label 1">';
            html += '   <input type="radio" value="' + response.CurrentShift.ShortSittingTime + '" name="SittingType" />';
            html += '   <span>Short Sitting Time ' + toTime(response.CurrentShift.ShortSittingTime) + '</span>';
            html += '</div>';

            $("#sitting-types").append(html);

            // check current sitting type
            $(".sitting-label." + response.SittingType + " input").attr("checked", "");
        }

        var eventId = (response.CurrentShift != null) ? response.CurrentShift.EventID : 0;
        $("#hidden-values-store .event-id").text(eventId);
        $("#hidden-values-store .is-kitchen-close").text(response.IsKitchenClose ? 1 : 0);

        // update choosen time
        $(".choosen-time").remove();

        var duration = $("input[type='radio']:checked").val();

        if (isNaN(duration)) {
            duration = 15;
        }

        var width = duration * W_UNIT;

        html = '';
        // 2012.07.01 SonTH fix bug #1. Need to convert StartPos to scaled value
        if ((response.StartPos * W_UNIT) + width > RULER_LENGTH) {
            //            $('#business-hour-display').append($('<div class="choosen-time" />').data('start', 0).data('last', duration - (60 * 24) + response.StartPos));
            //            $('#business-hour-display').append($('<div class="choosen-time" />').css('right', 0).data('last', 60 * 24 - response.StartPos));
            html += '<div class="choosen-time" style="left: 0; width: ' + Math.round(width - RULER_LENGTH + (response.StartPos * W_UNIT)) + 'px;"></div>';
            html += '<div class="choosen-time" style="right: 0; width: ' + Math.round(RULER_LENGTH - (response.StartPos * W_UNIT)) + 'px;"></div>';
        } else {
            //            $('#business-hour-display').append($('<div class="choosen-time" />').data('start', response.StartPos).data('last', duration));
            html += '<div class="choosen-time" style="left: ' + Math.round(response.StartPos * W_UNIT) + 'px; width: ' + width + 'px;"></div>';
        }

        $("#business-hour-display").append(html);

        // update table status
        $(".table").attr("class", "table");
        $(".recent-book").removeClass("recent-book");
        if (response.TableStatuses == null) {
            $(".table").addClass("status-close");
        } else {
            for (var i = 0; i < response.TableStatuses.length; i++) {
                var tableStatus = response.TableStatuses[i];

                var table = $(".table#" + tableStatus.TableID);

                var code = parseInt(tableStatus.IsBooked);

                switch (code) {
                    case 0:
                        table.addClass("status-available");
                        break;
                    case 1:
                        table.addClass("status-invisible");
                        break;
                    default:
                        table.addClass("status-same-user");
                        break;
                }

                table.children(".booking-id").text(tableStatus.BookingID);

                if ($("#hidden-values-store .booking-id").text() == tableStatus.BookingID) {
                    table.find(".layout-code").addClass("recent-book");
                }
            }
        }

    } else {
    }

    hideProgressDialog();
}

function toTime(minutes) {
    var h = minutes / 60;

    var m = minutes % 60;

    if (m < 10) {
        m = "0" + m;
    }

    return Math.floor(h) + ":" + m;
}

function validate() {
    // validate user input
    // check 'Mobile phone number'
    if ($.trim($("#txt-phone-number").val()).length == 0) {
        MessageBox.show({
            message: ["Please enter 'Mobile phone number' for this reservation"],
            buttons: {
                ok: function () {
                    $("#txt-phone-number").focus();
                    $("#txt-phone-number").val("");
                }
            }
        });

        return false;
    } else {
        $("#txt-phone-number").val($.trim($("#txt-phone-number").val()));
    }

    // check 'Name of guest'
    if ($.trim($("#txt-guest-name").val()).length == 0 || $.trim($("#txt-guest-name").val()).length >= 50) {
        MessageBox.show({
            message: ["Please enter 'Name of guest' for this reservation"],
            buttons: {
                ok: function () {
                    $("#txt-guest-name").focus();
                    $("#txt-guest-name").val("");
                }
            }
        });
        return false;
    } else {
        $("#txt-guest-name").val($.trim($("#txt-guest-name").val()));
    }

    // check 'How many guests?'
    var textGuestNo = $("#txt-guest-no");

    if ($.trim(textGuestNo.val()).length == 0 || isNaN($.trim(textGuestNo.val())) || parseInt(textGuestNo.val()) <= 0) {
        MessageBox.show({
            message: ["Please enter the  total number of guests for this reservation!"],
            buttons: {
                ok: function () {
                    $("#txt-guest-no").focus();
                    $("#txt-guest-no").val("");
                }
            }
        });
        return false;
    } else {
        textGuestNo.val(parseInt(textGuestNo.val()));
    }

    return true;
}

function doBooking() {
    $('.table[highlighted]').removeAttr('highlighted');
    var table = $(this);

    var statusCondition = table.hasClass("status-available") || table.find(".layout-code").hasClass("recent-book");

    if (!statusCondition) {
        invalidStatus();
        return;
    }

    if (!validate()) {
        return;
    }

    // check is-kitchen-close
    if ($("#hidden-values-store .is-kitchen-close").text() === "1") {
        MessageBox.show({
            message: ["The kitchen is closed on this time. Please check again."],
            buttons: {
                ok: null
            }
        });
        return;
    }

    var requestGuestNo = parseInt($("#txt-guest-no").val());

    var selectedGuestNo = parseInt(table.find(".number-seat").text());

    // confirm guest-no
    if (requestGuestNo > selectedGuestNo) {
        MessageBox.show({
            message: [
                "The table you have selected do not have enough chairs for the number of guests!",
                "Do you want to continue with this reservation?"
            ],
            buttons: {
                no: null,
                yes: function () {
                    callAddEditBookingAPI(table);
                }
            }
        });
    } else {
        callAddEditBookingAPI(table);
    }
}

function callAddEditBookingAPI(table) {
    var time = $('#input-date').scroller('getDate');
    var duration = parseInt($("input[type='radio']:checked").val());
    var date = $.datepicker.formatDate("D, d M yy", time);

    var startTimeH = time.getHours();
    var startTimeM = time.getMinutes();
    if (startTimeM < 10) startTimeM = "0" + startTimeM;

    time.setMinutes(time.getMinutes() + duration);

    var endTimeH = time.getHours();
    var endTimeM = time.getMinutes();
    if (endTimeM < 10) endTimeM = "0" + endTimeM;

    MessageBox.show({
        message: [
            "Table no. " + $(table).find(".layout-code").text() + " for " + $("#txt-guest-no").val() + " guests.",
            "Time slot " + date,
            "from " + startTimeH + ":" + startTimeM + " to " + endTimeH + ":" + endTimeM + ".",
            "Do you want to reserve this table?"
        ],
        buttons: {
            no: null,
            yes: function () {

                showProgressDialog("Reserving");

                var mode = $("#hidden-values-store .mode").text();
                var isCreateNew = $(".new-reservation").hasClass("hidden");
                var bookingId = parseInt($("#hidden-values-store .booking-id").text());
                var eventId = $("#hidden-values-store .event-id").text();
                var reservationTime = $("#input-date").val();
                var sittingTime = $("input[type='radio']:checked").parent().attr("class").replace("right sitting-label ", "");
                var url = bookingId > 0 ? "/Reservation/EditBooking" : "/Reservation/AddBooking";

                $.ajax({
                    type: "post",
                    url: url,
                    data: {
                        LocationID: $("#hidden-values-store .location-id").text(),
                        EventID: eventId,
                        TableID: $(table).attr("id"),
                        Duration: duration,
                        GuestName: $("#txt-guest-name").val(),
                        PhoneNumber: $("#txt-phone-number").val(),
                        NoOfGuests: $("#txt-guest-no").val(),
                        BookingID: bookingId,
                        SittingTime: sittingTime == 1 ? "short" : sittingTime == 2 ? "normal" : "long",
                        ReservationTime: $('#input-date').val()
                    },
                    success: function (response) {
                        hideProgressDialog();

                        if (response.IsSucceed) {
                            if (mode == "Create") {
                                $(".new-reservation").removeClass("hidden");
                                FlexibleLayout.adapt();
                            }

                            // clear last booking
                            $(".recent-book").parents('.table').attr("class", "table status-available");
                            $(".recent-book").removeClass("recent-book");

                            // mark new table as same-user
                            table.attr("class", "table status-same-user");
                            table.find(".layout-code").addClass("recent-book");

                            $("#hidden-values-store .booking-id").text(response.BookingID);

                            MessageBox.show({
                                message: ["This table reservation was successful!"],
                                buttons: {
                                    ok: null
                                }
                            });
                        } else if (response.Error === "TableBookedByOthers") {
                            MessageBox.show({
                                message: [
                                // 2012.07.01 SonTH fix bug #2. 
                                    "The table you have selected is already reserved! Please select a vacant table!"
                                ],
                                buttons: {
                                    ok: null
                                }
                            });
                        } else {
                            MessageBox.show({
                                message: ["We have encountered a server connection error. Please try again later!"],
                                buttons: {
                                    ok: null
                                }
                            });
                        }
                    }
                });
            }
        }
    });

}

function invalidStatus() {
    MessageBox.show({
        message: ["The table you have selected is already reserved! Please select a vacant table!"],
        buttons: {
            ok: null
        }
    });
}
