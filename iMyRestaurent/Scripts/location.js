$(function () {
    updateRowDisplay();

    // bind textbox events
    $(".txt-chair, .txt-table").focusin(onFocusin);
    $(".txt-chair, .txt-table").focusout(onFocusout);
    $(".txt-chair, .txt-table").keydown(allowNumericOnly);

    // bind button events
    $(".button-add").click(addRow);
    $(".button-delete").click(function () {
        deleteRow(this);
    });
    $(".button-back").click(back);
    $(".button-continue").click(next);
});

function back() {
    $("form#back").submit();
}

function next() {
    var locationName = $.trim($("input#LocationName").val());

    if (locationName == null || locationName.length == 0) {
        MessageBox.show({
            message: ["Please input a name for the new location"],
            buttons: {
                ok: null
            }
        });
        return;
    }

    // check changes
    var oldTableText = $.trim($("#txt-table-summary").val());

    // prepare data before submit next-form
    var summary = createSummary();

    var historyUrl = document.referrer;
    var element = historyUrl.split('/');
    var relativeUrl = "/" + element[element.length - 2] + "/" + element[element.length - 1];

    var isEdit = $('input[name="Mode"]').val() == "EditFromLocation";

    var hasChanges = oldTableText != summary && isEdit;
    var isFirstTime = relativeUrl == "/Location/EditLocation";

    if (hasChanges) {
        showProgressDialog("Checking");
        $.ajax({
            type: "post",
            url: "/Location/CheckDeleteTable",
            data: {
                OldInfo: oldTableText,
                CurrentInfo: summary
            },
            success: function (response) {
                hideProgressDialog();
                if (response.HasDeletedTable) {
                    MessageBox.show({
                        message: [
                                "Please note you are about to delete some existing tables and their reservations!",
                                "Do you want to continue and delete these tables?"
                            ],
                        buttons: {
                            no: null,
                            yes: function () {
                                saveLocation(hasChanges, isFirstTime, isEdit, summary, locationName);
                            }
                        }
                    });
                } else {
                    saveLocation(hasChanges, isFirstTime, isEdit, summary, locationName);
                }
            }
        });

    } else {
        saveLocation(hasChanges, isFirstTime, isEdit, summary, locationName);
    }
}

function saveLocation(hasChanges, isFirstTime, isEdit, summary, locationName) {
    $(".button-continue").unbind();
    showProgressDialog("Saving");
    $.ajax({
        type: "post",
        url: "/Location/Save",
        async: false,
        data: {
            LocationID: $("#location-id").val(),
            LocationName: locationName
        },
        success: function (response) {
            if (response.locationId < 0) {
                MessageBox.show({
                    message: ["Cannot save location"],
                    buttons: {
                        ok: function () {
                            $(".button-continue").bind("click", next);
                        }
                    }
                });
            } else {
                if (!hasChanges && isFirstTime && isEdit) {
                    // change only location name
                    $("form#next").attr("action", "/Summary");
                } else {
                    // has changed layout
                    $("#txt-table-summary").val(summary);
                    $("#location-id").val(response.locationId);
                    $("#location-name").val(locationName);
                }

                // submit next-form
                $("form#next").submit();
            }
        }
    });
}

function createSummary() {
    var tableText = "";

    $.each($("#table > tbody > tr"), function (key, value) {

        var cValue = $.trim($(value).children("td").children(".txt-chair").val());
        var tValue = $.trim($(value).children("td").children(".txt-table").val());

        if (cValue != "?" && tValue != "?") {
            tableText += cValue + "," + tValue + "|";
        }
    });

    // cut the last ','
    if (tableText.length > 0) {
        tableText = tableText.substring(0, tableText.length - 1);
    }

    return tableText;
}

function updateRowDisplay() {
    $.each($("#table > tbody > tr"), function (key, value) {
        if (key % 2 == 1) {
            $(value).addClass("even-row");
        } else {
            $(value).removeClass("even-row");
        }
    });
}

function deleteRow(row) {
    MessageBox.show({
        message: ["Do you want to delete this kind of table?"],
        buttons: {
            no: null,
            yes: function () {
                $(row).parent().parent().remove();
                updateRowDisplay();
            }
        }
    });
}

function onFocusin() {
    var value = $.trim($(this).val());

    if (value === "?") {
        $(this).val("");
    }
}

function onFocusout() {
    var value = $.trim($(this).val());

    if (value.length === 0 || value === "?") {
        $(this).val("?");
        return;
    }

    if (isNaN(value)) {
        MessageBox.show({
            message: ["Only numeric values allowed"],
            buttons: {
                ok: null
            }
        });
        $(this).val("?");

        return;
    }

    var numbericValue = parseInt(value, 10);

    if (numbericValue < 0) { numbericValue = -numbericValue }

    if (numbericValue == 0) {
        $(this).val("?");
    } else {
        var isValid = true;

        // check exist with .txt-chair
        if ($(this).hasClass("txt-chair")) {
            var comparedInput = this;

            $.each($(".txt-chair"), function (key, value) {
                if (value != comparedInput && isValid) {
                    if ($.trim($(value).val()) == numbericValue) {
                        isValid = false;

                        return false;
                    }
                }
            });
        }

        if (isValid) {
            $(this).val(numbericValue);
        } else {
            MessageBox.show({
                message: ["This kind of table existed"],
                buttons: {
                    ok: null
                }
            });
            $(this).val("?");
        }
    }
}

function allowNumericOnly(event) {
    // Allow: backspace, delete, tab and escape
    if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
    // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
    // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
    }
    else {
        // Ensure that it is a number and stop the keypress
        if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    }
}

function addRow() {
    var hasUndefinedRow = false;

    $.each($(".txt-chair"), function (key, value) {
        if ($(value).val() == "?") {
            hasUndefinedRow = true;
            return false;
        }
    });

    if (hasUndefinedRow) {
        MessageBox.show({
            message: ["This kind of table existed"],
            buttons: {
                ok: null
            }
        });
        return;
    } else {

        var html = '';
        html += '<tr>';
        html += '   <td>';
        html += '       <input type="text" class="txt-chair" value="?" />';
        html += '   </td>';
        html += '   <td>';
        html += '       <input type="text" class="txt-table" value="?" />';
        html += '   </td>';
        html += '   <td>';
        html += '       <button type="button" class="image-button button-delete"></button>';
        html += '   </td>';
        html += '</tr>';

        $("#table tbody").append(html);

        updateRowDisplay();

        // bind event to new control
        $(".button-delete").last().bind("click", function () {
            deleteRow(this);
        });
        $(".txt-chair").last().bind("keydown", allowNumericOnly);
        $(".txt-chair").last().bind("focusin", onFocusin);
        $(".txt-chair").last().bind("focusout", onFocusout);
        $(".txt-table").last().bind("keydown", allowNumericOnly);
        $(".txt-table").last().bind("focusin", onFocusin);
        $(".txt-table").last().bind("focusout", onFocusout);
    }
}