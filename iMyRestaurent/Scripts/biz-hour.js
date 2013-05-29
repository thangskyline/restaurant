$(function () {
    Utils.touchScroll('.menu-containment');

    $(".button-add-menu-type").click(function () {
        var data = collectData();
        $.ajax({
            type: "post",
            data: {
                names: data.names,
                states: data.states,
                values: data.values,
                ids: data.ids,
                sittingIds: data.sittingIds,
                token: $("input[name='Token']").val()
            },
            url: "/BusinessHours/StoreCurrentData",
            success: function (response) {
                $("form#add-menu").submit();
            }
        });
    });

    $(".button-back").click(function () {
        $("form#back").submit();
    });

    $(".button-done").click(saveMenus);

    $(".txt-menu-name").focusout(function () {
        if (!checkName(this)) {
            $(this).focus();

            MessageBox.show({
                message: ["This menu type name has been existed!"],
                buttons: {
                    ok: null
                }
            });
        }
    });

    $(".button-menu-close").click(closeMenu);

    $(".close-state").click(openMenu);

    $(".button-delete-menu").click(deleteMenu);

    $('#btn-holiday-setting').click(
        function () {
            $('#location-holiday-setting').val($('input[name="LocationID"]:first').val());
            var data = collectData();
            $.ajax({
                type: "post",
                data: {
                    names: data.names,
                    states: data.states,
                    values: data.values,
                    ids: data.ids,
                    sittingIds: data.sittingIds,
                    token: $("input[name='Token']").val()
                },
                url: "/BusinessHours/StoreCurrentData",
                success: function (response) {
                    $('#token-holiday-setting').val($("input[name='Token']").val());
                    $('#frm-holiday-setting').submit();
                }
            });

        }
    );
});

function closeMenu() {
    showProgressDialog("Closing");
    var day = $(this).attr("id");

    // get selected input
    var input = $(this).parent().parent().parent().parent();

    var eventID = input.find(".event-id." + day + " span").text();

    var button = $(this).parent();

    $.ajax({
        type: "post",
        url: "/BusinessHours/CheckBeforeClose",
        data: {
            eventID: eventID
        },
        success: function (response) {
            hideProgressDialog();
            if (response.IsSucceed) {
                if (response.hasBookings) {
                    MessageBox.show({
                        message: [
                            "You already have reservations for this day!",
                            "Do you want to continue to close this day and delete all reservations on this day?"
                        ],
                        buttons: {
                            no: null,
                            yes: function () {
                                input.find(".menu-day." + day).addClass("hidden");

                                button.addClass("hidden");

                                input.find(".button-imymenu." + day).parent().addClass("hidden");

                                input.find(".close-state." + day).removeClass("hidden");
                            }
                        }
                    });
                } else {
                    input.find(".menu-day." + day).addClass("hidden");

                    button.addClass("hidden");

                    input.find(".button-imymenu." + day).parent().addClass("hidden");

                    input.find(".close-state." + day).removeClass("hidden");
                }
            } else {
                MessageBox.show({
                    message: ["Error occurs when connecting to server"],
                    buttons: {
                        ok: null
                    }
                });
            }
        }
    });
}

function callDeleteMenuAPI(menuInput) {
    showProgressDialog("Deleting");

    $.ajax({
        type: "post",
        url: "/BusinessHours/DeleteMenu",
        data: {
            SittingID: menuInput.attr("id"),
            Token: $("input[name='Token']").val()
        },
        success: function (response) {
            hideProgressDialog();
            if (response.IsSucceed) {
                menuInput.remove();

                if ($(".menu-input").length === 0) {
                    $("#holiday-select-panel").addClass("hidden");
                }
            } else {
                Utils.showError();
            }
        }
    });
}

function deleteMenu() {
    var menuInput = $(this).parent().parent().parent().parent();

    MessageBox.show({
        message: ["Do you want delete this menu type?"],
        buttons: {
            no: null,
            yes: function () {
                showProgressDialog("Checking");

                $.ajax({
                    type: "post",
                    url: "/BusinessHours/CheckMenuBeforeDelete",
                    data: {
                        SittingID: menuInput.attr("id")
                    },
                    success: function (response) {
                        hideProgressDialog();
                        if (response.IsSucceed) {
                            if (response.HasBookings) {
                                MessageBox.show({
                                    message: ["You already have reservations for this menu, do you want to continue to delete this menu type and all reservations for this menu?"],
                                    buttons: {
                                        no: null,
                                        yes: function () {
                                            callDeleteMenuAPI(menuInput);
                                        }
                                    }
                                });
                            } else {
                                callDeleteMenuAPI(menuInput);
                            }
                        } else {
                            Utils.showError();
                        }
                    }
                });
            }
        }
    });
}

function checkName(input) {
    var isExisted = false;

    $.each($(".txt-menu-name"), function (key, value) {
        if (input != value) {
            var newName = $.trim($(input).val());
            var otherName = $.trim($(value).val());
            if (newName === otherName) {
                isExisted = true;
                return false;
            }
        }
    });

    return !isExisted;
}

function saveMenus() {
    var error = "";

    $.each($(".txt-menu-name"), function (key, value) {
        if (!checkName(value)) {
            error = "existed";
            $(value).focus();
            return false;
        }

        if ($.trim($(value).val()).length === 0) {
            error = "empty";
            $(value).focus();
            return false;
        }
    });

    if (error === "existed") {
        MessageBox.show({
            message: ["This menu type name has been existed!"],
            buttons: {
                ok: null
            }
        });
    } else if (error === "empty") {
        MessageBox.show({
            message: ["Please enter in a menu type!"],
            buttons: {
                ok: null
            }
        });
    } else {
        showProgressDialog("Saving");

        hideOverride();
        // prepare data
        var data = collectData();

        $.ajax({
            type: "post",
            url: "/BusinessHours/SaveMenu",
            data: {
                LocationID: $("input[name='LocationID']").val(),
                MenuNames: data.names,
                States: data.states,
                Values: data.values,
                IDs: data.ids,
                SittingIDs: data.sittingIds
            },
            success: function (response) {
                $("form#next").submit();
            }
        });
    }
}

function collectData() {
    var values = "";
    var states = "";
    var names = "";
    var ids = "";
    var sittingIds = "";

    $.each($(".menu-input"), function (key, value) {
        $.each($(value).find(".menu-day-input"), function (key, input) {
            values += $(input).val() + ",";
        });

        // remove last character
        values = values.substring(0, values.length - 1);
        values += "|";

        $.each($(value).find(".close-state"), function (key, div) {
            var isOpenned = $(div).hasClass("hidden");
            states += (isOpenned === true ? "Open" : "Closed") + ",";
        });

        // remove last character
        states = states.substring(0, states.length - 1);
        states += "|";

        $.each($(value).find(".event-id span"), function (key, td) {
            ids += $(td).text() + ",";
        });

        // remove last character
        ids = ids.substring(0, ids.length - 1);
        ids += "|";

        names += $.trim($(value).find(".txt-menu-name").val()) + "|";
        sittingIds += $(value).attr("id") + "|";
    });

    // remove last character
    if (values.length > 0) {
        values = values.substring(0, values.length - 1);
    }
    if (states.length > 0) {
        states = states.substring(0, states.length - 1);
    }
    if (names.length > 0) {
        names = names.substring(0, names.length - 1);
    }
    if (ids.length > 0) {
        ids = ids.substring(0, ids.length - 1);
    }
    if (sittingIds.length > 0) {
        sittingIds = sittingIds.substring(0, sittingIds.length - 1);
    }

    return {
        values: values,
        states: states,
        names: names,
        ids: ids,
        sittingIds: sittingIds
    };
}