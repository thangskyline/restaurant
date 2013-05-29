var pointerX;
var pointerY;

$(function () {
    Utils.touchScroll('#layout-containment');

    ZoomControl.setup('#layout', $('input[name="LayoutZoomScale"]').val(), function () {
    });

    $(".button-zoom-out").click(function () {
        ZoomControl.zoomout('input[name="LayoutZoomScale"]');
    });

    $(".button-zoom-in").click(function () {
        ZoomControl.zoomin('input[name="LayoutZoomScale"]');
    });

    dDragController.init({
        restricted: false,
        restrictTop: 0,
        restrictLeft: 0,
        drag: function (element) {
        },
        dragstart: function (element) {
            flags.canTouchScroll = false;
        },
        dragend: function (element) {
            flags.canTouchScroll = true;
        },
        container: '#layout',
        scrollableContainer: '.auto-height-div',
        target: '.table'
    });

    $(".button-delete-table").click(function () {

        var table = $(this).parents('.table');

        MessageBox.show({
            message: ["Do you want to delete this table?"],
            buttons: {
                no: null,
                yes: function () {

                    showProgressDialog("Checking");

                    $.ajax({
                        type: "post",
                        url: "/Layout/CheckBeforeDelete",
                        data: {
                            tableID: table.attr("id")
                        },
                        success: function (checkResponse) {
                            if (checkResponse.IsSucceed) {
                                if (checkResponse.HasBookings) {
                                    hideProgressDialog();
                                    MessageBox.show({
                                        message: [
                                                "Please note, all existing reservations for the selected table will be deleted.",
                                                "Do you want to continue and delete this table?"
                                            ],
                                        buttons: {
                                            no: null,
                                            yes: function () {
                                                deleteTable(table);
                                            }
                                        }
                                    });
                                }
                                else {
                                    deleteTable(table);
                                }
                            } else {
                                hideProgressDialog();
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
    });

    $(".button-back").click(function () {
        if ($("input[name='Mode']").val() == "EditFromLayout") {
            $("form#back").submit();
        }

        $.ajax({
            type: "post",
            url: "/Numbering/Save",
            data: {
                locationId: $("form#reload input[name='LocationID']").val(),
                infoText: getInfoText()
            },
            success: function () {
                // back
                $("form#back input[name='TableText']").val("*");
                $("form#back").submit();
            }
        });
    });

    $(".button-reset").click(function () {

        var summary = getSummary();

        //$('form#reload > input[name="TableChairText"]').attr("value", summary.txtChair);
        //$('form#reload > input[name="TableNumberText"]').attr("value", summary.txtTable);

        //$('form#reload > input[name="TablePositionText"]').attr("value", getPositionText());

        // reload
        $("form#reload").submit();
    });

    $("#btnContinue").click(function () {


        // prepare data before submit
        $("form#next > input#txt-table-position-summary").attr("value", getPositionText());

        // next
        $("form#next").submit();
    });
});

function getInfoText() {
    // prepare data
    var text = "";
    var containment = $("#divContainer");
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

function deleteTable(table) {
    showProgressDialog("Deleting");

    $.ajax({
        type: "post",
        url: "/Layout/DeleteTable",
        data: {
            tableID: table.attr("id")
        },
        success: function (response) {
            hideProgressDialog();

            if (response.IsSucceed) {
                table.remove();
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

function getSummary() {
    var dictionary = {};
    // summary chair & table
    $.each($(".table"), function (key, value) {
        var chairNo = $(value).find(".number-seat").children("div").text();

        if (isNaN(dictionary[chairNo])) {
            dictionary[chairNo] = 0;
        }
        dictionary[chairNo] = dictionary[chairNo] + 1;
    });

    var txtTable = "";

    for (key in dictionary) {
        txtTable += key + "," + dictionary[key] + "|";
    }
    txtTable = txtTable.substring(0, txtTable.length - 1);

    return txtTable;
}

function getPositionText() {
    // gather position of each table
    var tables = new Array();

    $.each($(".table"), function (key, value) {
        var chairNo = $(value).find(".number-seat").children("div").text();
        var layoutCode = $(value).find(".layout-code").text();
        var position = $(value).position();

        tables[key] = {
            id: $(value).attr("id"),
            chairNo: chairNo,
            layoutCode: layoutCode,
            top: position.top,
            left: position.left
        };
    });

    var summary = "";
    var containment = $("#divContainer");
    for (key in tables) {
        var table = tables[key];
        summary += table.id + "," + table.chairNo + "," + table.layoutCode + "," + (table.top + containment.scrollTop()) + "," + (table.left + containment.scrollLeft()) + "|";
    }

    if (summary != "") {
        summary = summary.substring(0, summary.length - 1);
    } else {
        summary = "*";
    }

    return summary;
}