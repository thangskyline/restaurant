var startNumber;
var canContinue;

$(function () {
    Utils.touchScroll('#layout-containment');

    ZoomControl.setup('#layout', $('input[name="LayoutZoomScale"]').val());

    $(".button-zoom-out").click(function () {
        ZoomControl.zoomout('input[name="LayoutZoomScale"]');
    });

    $(".button-zoom-in").click(function () {
        ZoomControl.zoomin('input[name="LayoutZoomScale"]');
    });

    $(".button-restart").click(reset);

    $.each($(".table"), function (key, value) {
        if ($(value).find(".layout-code").text().length == 0) {
            $(value).bind("click", numbering);
        }
    });

    $(".button-save-layout").click(saveLayout);

    $(".button-back").click(back);

    findStartNumber();
});

function findStartNumber() {
    startNumber = 0;

    $.each($(".table"), function (key, value) {
        var layoutCode = $(value).find(".layout-code").text();

        if (!isNaN(layoutCode) && layoutCode != "") {
            var intValue = parseInt(layoutCode, 10);

            if (intValue > startNumber) {
                startNumber = intValue;
            }
        }
    });
    if (startNumber != 0) {
        startNumber += 1;
        canContinue = true;
    }
}

function saveLayout() {
    // validate
    var isAllNumbered = true;

    $.each($(".table"), function (key, value) {
        if ($(value).find(".layout-code").text().length == 0) {
            isAllNumbered = false;
            return false;
        }
    });

    if (isAllNumbered) {
        showProgressDialog("Saving");

        //save and submit
        $.ajax({
            type: "post",
            url: "/Numbering/Save",
            data: {
                locationId: $("input#location-id").attr("value"),
                infoText: getInfoText()
            },
            success: function () {
                $("form#next").submit();
            }
        });
    } else {
        MessageBox.show({
            message: ["Please add a table number to all tables!"],
            buttons: {
                ok: null
            }
        });
    }
}

function getInfoText() {
    // prepare data
    var text = "";
    var containment = $('#layout');
    $.each($(".table"), function (key, value) {
        var id = $(value).attr("id");
        var numberSeat = $(value).find(".number-seat").children("div").text();
        var layoutCode = $(value).find(".layout-code").text();
        var position = $(value).position();

        text += id + "," + numberSeat + "," + layoutCode + "," + (position.top + containment.scrollTop()) + "," + (position.left + containment.scrollLeft()) + "|";
    });

    if (text != "") {
        text = text.substring(0, text.length - 1);
    } else {
        text = "*";
    }

    return text;
}

function back() {
    $('input#table-position-text').val(getInfoText());
    // back
    $('form#back').submit();
}

function reset() {
    $(".table").bind("click", numbering);

    $.each($(".table"), function (key, value) {
        $(value).find(".layout-code").text("");
    });
    canContinue = false;
}

function numbering() {
    if (!canContinue) {
        if (!isNaN($("input#txt-start-number").val())) {
            startNumber = parseInt($("input#txt-start-number").val(), 10);

            if (startNumber > 0) {
                $("input#txt-start-number").val(startNumber);
                canContinue = true;

                // save startNumber in session
                $.ajax({
                    url: "/Numbering/SaveStartNumber",
                    type: "post",
                    async: true,
                    data: {
                        startNumber: startNumber
                    }
                });
            }
        }
    }

    if (canContinue) {
        if ($(this).find(".layout-code").text().length == 0) {
            $(this).find(".layout-code").text(startNumber);
            startNumber++;
            $(this).unbind();
        }
    } else {
        MessageBox.show({
            message: ["Please input a greater 1 integer number!"],
            buttons: {
                ok: function () {
                    $("input#txt-start-number").focus();
                }
            }
        });
    }
}