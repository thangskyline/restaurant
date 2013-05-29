$(document).ready(function () {
    $(".menu-type-header .event-name").width($(".menu-input .menu-name").outerWidth());
    $(".menu-type-header .event-type").width($(".menu-input .menu-type").outerWidth());
    $(".menu-type-header .day").width($(".menu-input .menu-day").outerWidth());
});

$(function () {
    $(".time-picker").timepicker({
        showButtonPanel: true,
        beforeShow: validateMenuName,
        onClose: function (dateText, inst) {
            if ($.trim(dateText).length === 0) {
                return;
            }
            var arr = dateText.split(':');

            var isValid = false;

            if (arr.length > 1) {
                var hour = parseInt(arr[0], 10);

                var min = parseInt(arr[1], 10);

                if (0 <= hour <= 23 && 0 <= min <= 59) {
                    isValid = true;
                }
            }

            if (!isValid) {
                $(inst.input).val('');
            }
        }
    });
    $(".time-picker").setMask("time");

    $(".minute-picker").timepicker({
        showButtonPanel: true,
        minutePicker: true,
        minuteMax: 100,
        showHour: false,
        beforeShow: validateMenuName,
        onClose: function (dateText, inst) {
            if ($.trim(dateText).length === 0) {
                return;
            }

            var input = parseInt(dateText, 10);

            if (0 <= input && input <= 100) {
                //inst.settings.minute = input;
            } else {
                $(inst.input).val('');
            }
        }
    });

    $(".txt-menu-name").focus(function () {
        $(this).val($.trim($(this).val()));
    });

    $(".close-state").click(openMenu);

    $(".button-imymenu").click(iMyMenuClick);

    $(".button-copy").click(copyMenuInput);
});

function iMyMenuClick() {
    var day = $(this).attr("class").replace("image-button button-imymenu ", "");

    var input = $(this).parents(".menu-input");

    var eventId = input.find(".event-id." + day + " span").text();

    if (eventId.length > 0) {
        openMyMenu1(eventId, day);
    }
}

function copyMenuInput() {
    var day = parseInt($(this).attr("class").replace("image-button button-copy ", ""));

    var menuInput = $(this).parents(".menu-input");

    var nextDay = day == 6 ? 0 : day + 1;

    var todayValues = menuInput.find(".menu-day." + day + " input[type='text']");

    var nextDayValues = menuInput.find(".menu-day." + nextDay + " input[type='text']");

    // copy data
    for (var i = 0; i < todayValues.length; i++) {
        nextDayValues[i].value = todayValues[i].value;
    }

    // check close-state
    var closeState = menuInput.find(".close-state." + nextDay);

    if (!closeState.hasClass("hidden")) {
        closeState.click();
    }
}

function validateMenuName(input, inst) {
    var inputTable = $(input).parents(".menu-input");

    var menuNameInput = inputTable.find(".txt-menu-name");

    if ($.trim(menuNameInput.val()).length == 0) {
        MessageBox.show({
            message: ["Please enter in a menu type!"],
            buttons: {
                ok: function () {
                    menuNameInput.focus();
                }
            }
        });

        throw new Error();
    }
}

function openMenu() {
    var id = $(this).attr("id");

    var input = $(this).parents(".menu-input");

    $(this).addClass("hidden");

    input.find(".menu-day." + id).removeClass("hidden");

    input.find(".button-menu-close." + id).parent().removeClass("hidden");

    input.find(".button-imymenu." + id).parent().removeClass("hidden");
}
