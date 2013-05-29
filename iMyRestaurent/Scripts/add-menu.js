$(function () {
    $(".button-back").click(function () {
        var sittingId = parseInt($(".menu-input").attr("id"));

        if (sittingId > 0) {
            $.ajax({
                type: "post",
                url: "/BusinessHours/DeleteMenu",
                data: {
                    SittingID: $(".menu-input").attr("id"),
                    Token: $("input[name='Token']").val()
                },
                success: function (response) {
                    $("form").submit();
                }
            });
        } else {
            $("form").submit();
        }
    });

    $(".button-save").click(function () {
        if ($(".txt-menu-name").val().length > 0) {
            saveMenu();
        } else {
            MessageBox.show({
                message: ["Please enter in a menu type!"],
                buttons: {
                    ok: function () {
                        $(".txt-menu-name").focus();
                    }
                }
            });
        }
    });

    $(".txt-menu-name").focusout(function () {
        $(this).val($.trim($(this).val()));

        if ($(this).val().length > 0) {
            showProgressDialog("Saving");

            $.ajax({
                type: "post",
                url: "/BusinessHours/CheckName",
                data: {
                    MenuName: $(".txt-menu-name").val(),
                    Token: $("input[name='Token']").val(),
                    LocationID: $("input[name='LocationID']").val(),
                    SittingID: $(".menu-input").attr("id")
                },
                success: function (response) {
                    hideProgressDialog();

                    if (response.IsSucceed) {
                        if (response.IsExisted) {
                            MessageBox.show({
                                message: ["This menu type name has been existed!"],
                                buttons: {
                                    ok: function () {
                                        $(".txt-menu-name").focus();
                                    }
                                }
                            });
                        } else {
                            $(".menu-input").attr("id", response.SittingID);

                            var eventIds = $(".menu-input td.event-id span");

                            for (var i = 0; i < response.EventIDs.length; i++) {
                                $(eventIds[i]).text(response.EventIDs[i]);
                            }
                        }
                    } else {
                        Utils.showError();
                    }
                }
            });
        }
    });

    $(".button-menu-close").click(closeMenu);
});

function closeMenu() {
    var id = $(this).attr("id");

    // get selected input
    var input = $(this).parent().parent().parent().parent();

    input.find(".menu-day." + id).addClass("hidden");

    $(this).parent().addClass("hidden");

    input.find(".button-imymenu." + id).parent().addClass("hidden");

    input.find(".close-state." + id).removeClass("hidden");
}

function saveMenu() {
    showProgressDialog("Saving");

    var values = "";

    // prepare data
    $.each($(".menu-day-input"), function (key, input) {
        values += $(input).val() + ",";
    });

    // remove last character
    values = values.substring(0, values.length - 1);

    var states = "";

    $.each($(".close-state"), function (key, div) {
        var isOpenned = $(div).hasClass("hidden");
        states += (isOpenned === true ? "Open" : "Closed") + ",";
    });

    states = states.substring(0, states.length - 1);

    var eventIds = "";
    $.each($("td.event-id span"), function (key, span) {
        eventIds += $(span).text() + ",";
    });
    eventIds = eventIds.substring(0, eventIds.length - 1);

    $.ajax({
        type: "post",
        data: {
            LocationID: $("input[name='LocationID']").val(),
            SittingID: $(".menu-input").attr("id"),
            MenuName: $(".txt-menu-name").val(),
            Values: values,
            States: states,
            EventIDs: eventIds,
            Token: $("input[name='Token']").val()
        },
        url: "/BusinessHours/StoreMenu",
        success: function () {
            hideProgressDialog();

            $("form").submit();
        }
    });
}
