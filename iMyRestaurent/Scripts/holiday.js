var SelectTypeDialog = {
    open: function () {
        var html = '';

        html += '<div id="select-type-dialog" class="popup-dialog lv1 clearfix">';
        html += '   <div class="left">';
        html += '       <button type="button" class="image-button" id="public-holiday-button">Public holiday</button>';
        html += '   </div>';
        html += '   <div class="right">';
        html += '       <button type="button" class="image-button"id="special-day-button">Special day</button>';
        html += '   </div>';
        html += '</div>';

        $('body').append(html);
        $('body').append($('<div class="overlay lv1" for="select-type-dialog" onclick="SelectTypeDialog.close();" />'));

        $('#public-holiday-button').click(function () {
            SelectTypeDialog.close();
            showPublicHolidayDialog();
        });

        $('#special-day-button').click(function () {
            SelectTypeDialog.close();
            showSpecialDayDialog();
        });

        this.dock();
    },
    close: function () {
        $('#select-type-dialog').remove();
        $('.overlay[for="select-type-dialog"]').remove();
    },
    dock: function () {
        $('#select-type-dialog').css({ top: 0, left: 0 });
        $('.overlay[for="select-type-dialog"]').width(0).height(0);

        FlexibleLayout.adapt();

        var buttonPos = $('#type-selector').offset();

        $('#select-type-dialog').css({
            top: buttonPos.top - $('#select-type-dialog').height() - 15,
            left: buttonPos.left
        });

        $('.overlay[for="select-type-dialog"]').width(Utils.pageW()).height(Utils.pageH());
    }
};

$(function () {
    $('#type-selector').click(function () {
        SelectTypeDialog.open();
    });

    $("#holiday-select-panel #year-selector").change(getOverrideList);

    $('.button-show-hide-holiday').click(function () {
        var div = $(this).children("div");
        var isShowing = div.text() === "1";

        if (isShowing) {
            div.text("0");
            // hide
            hideOverride();
        } else {
            div.text("1");
            // show
            showOverride($("#holiday-select-panel #day-selector").val());
        }
    });

    $("#holiday-select-panel #day-selector").change(function () {
        if ($(this).val() != -1) {
            $(".button-show-hide-holiday").removeClass("hidden");
            $(".button-show-hide-holiday div").text('1');
            hideOverride();
            showOverride($(this).val());
            //            var isShowing = $(".button-show-hide-holiday div").text() === "1";

            //            if (isShowing) {
            //                hideOverride();
            //                showOverride($(this).val());
            //            }
        } else {
            $(".button-show-hide-holiday").addClass("hidden");

            $(".button-show-hide-holiday").children("div").text("0");
            // hide
            hideOverride();
        }
    });
});

function hideOverride() {
    // enable all controls
    $(".menu-input input[type='text']").removeAttr("disabled");
    $(".button-menu-close").click(closeMenu);
    $(".close-state").click(openMenu);
    $(".button-delete-menu").click(deleteMenu);
    $(".button-imymenu").click(iMyMenuClick);
    $(".button-copy").click(copyMenu);

    var masks = $(".holiday-mask");

    masks.removeClass("holiday-mask");

    $.each(masks, function (key, value) {
        if ($(value).hasClass("need-close")) {
            $(value).removeClass("need-close");
        } else {
            $(value).addClass("hidden");

            // show input controls
            var id = $(value).attr("id");

            var input = $(value).parent().parent().parent();

            $(value).addClass("hidden");

            input.find(".menu-day." + id).removeClass("hidden");

            input.find(".button-menu-close." + id).parent().removeClass("hidden");

            input.find(".button-imymenu." + id).parent().removeClass("hidden");
        }
        $(value).text("CLOSED");
    });
}

function showOverride(dayId) {
    showProgressDialog("Loading");

    $.ajax({
        type: "post",
        url: "/Holiday/ShowHoliday",
        data: {
            dayId: dayId,
            token: $("input[name='Token']").val()
        },
        success: function (response) {
            hideProgressDialog();

            // disable all controls
            $(".menu-input input[type='text']").attr("disabled", "");
            $(".button-menu-close, .close-state, .button-delete-menu, .button-imymenu, .button-copy").unbind();

            if (response.HasMatchedItem) {
                var name = response.Data.PublicHolidayName;

                // show close mask
                for (var i = 0; i < response.SitingIDs.length; i++) {
                    var sittingID = response.SitingIDs[i];

                    // get close mask 
                    var input = $(".menu-input#" + sittingID);

                    var closeMask = input.find(".close-state." + response.Day);

                    // show close-mask
                    // check if close-mask is showing
                    var isShowing = !closeMask.hasClass("hidden");

                    if (isShowing) {
                        closeMask.addClass("need-close");
                    }

                    closeMask.removeClass("hidden");
                    closeMask.text(name);
                    closeMask.addClass("holiday-mask");

                    // hide other controls
                    input.find(".menu-day." + response.Day).addClass("hidden");

                    input.find(".button-menu-close." + response.Day).parent().addClass("hidden");

                    input.find(".button-imymenu." + response.Day).parent().addClass("hidden");
                }
            }
        }
    });
}

function getOverrideList() {
    var selectedYear = $("#holiday-select-panel #year-selector").val();

    if (selectedYear != -1) {
        showProgressDialog("Loading");

        $.ajax({
            type: "post",
            data: {
                LocationID: $("input[name='LocationID']").val(),
                Year: selectedYear,
                Token: $("input[name='Token']").val()
            },
            url: "/Holiday/GetOverrideList",
            success: function (response) {
                hideProgressDialog();
                emptyDaySelector();
                hideOverride();

                $(".button-show-hide-holiday").addClass("hidden");
                $(".button-show-hide-holiday div").text("0");

                if (response.Holidays == null || response.Holidays.length == 0) {

                } else {
                    //$("#holiday-select-panel #day-selector").empty();

                    var html = "";
                    for (var i = 0; i < response.Holidays.length; i++) {
                        html += '<option value="' + response.Holidays[i].DayID + '">' + response.Holidays[i].PublicHolidayName + '</option>';
                    }

                    $("#holiday-select-panel #day-selector").append(html);
                }
            }
        });
    } else {
        hideOverride();
        emptyDaySelector();
        $(".button-show-hide-holiday").addClass("hidden");
        $(".button-show-hide-holiday div").text("0");
    }
}

function emptyDaySelector() {
    var daySelector = $("#holiday-select-panel #day-selector");

    daySelector.empty();
    daySelector.append('<option value="-1" selected="selected">Select closed date to display</option>');
}

function getPublicHolidays() {
    var countryId = $(".dialog #country-selector").val();

    var year = $(".dialog #year-selector").val();

    if (countryId != -1 && year != -1) {
        showProgressDialog("Loading");

        $.ajax({
            type: "post",
            url: "/Holiday/GetPublicHolidays",
            data: {
                countryId: countryId,
                year: year,
                locationId: $("input[name='LocationID']").val()
            },
            success: function (response) {
                if (response.IsSucceed) {

                    $(".dialog table tbody").empty();

                    if (response.PublicHolidays != null) {
                        var colSpan = $(".dialog table thead tr th").length;

                        var sittingIds = {};
                        $.each($(".dialog table thead tr th"), function (key, value) {
                            sittingIds[key - 1] = $(value).attr("id");
                        });

                        for (var i = 0; i < response.PublicHolidays.length; i++) {
                            var html = "";

                            html += '<tr class="holiday-name">';
                            html += '   <td colspan="' + colSpan + '">' + response.PublicHolidays[i].PublicHolidayName + '</td>';
                            html += '</tr>';

                            for (var j = 0; j < response.PublicHolidays[i].HolidayDateList.length; j++) {
                                html += '<tr class="' + response.PublicHolidays[i].HolidayDateList[j].DayID + '">';
                                var date = new Date(parseInt(response.PublicHolidays[i].HolidayDateList[j].Date.substr(6)));
                                var day = date.getDay() - 1;

                                if (day === -1) { day = 6; }

                                html += '   <td class=' + day + '>' + $.datepicker.formatDate("D, d M", date) + '</td>';
                                for (var k = 0; k < colSpan - 1; k++) {
                                    html += '   <td align="center" class="' + sittingIds[k] + ' input-cell">';
                                    html += '       <input type="checkbox" />';
                                    html += '           <div class="hidden override-id">-1</div>';
                                    html += '           <div class="hidden is-override">0</div>';
                                    html += '   </td>';
                                }
                                html += '</tr>';
                            }

                            $(".dialog table tbody").append(html);
                        }

                        // update the current holiday
                        for (var i = 0; i < response.PublicHolidays.length; i++) {
                            for (var j = 0; j < response.PublicHolidays[i].HolidayDateList.length; j++) {
                                for (var k = 0; k < response.PublicHolidays[i].HolidayDateList[j].OverrideDayList.length; k++) {
                                    var sittingID = response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].SittingID;
                                    if (sittingID != -1) {
                                        var dayID = response.PublicHolidays[i].HolidayDateList[j].DayID;
                                        var cell = $(".dialog table tbody tr." + dayID + " td." + sittingID);
                                        var isOverride = response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].IsOverride != 0;

                                        if (isOverride) {
                                            cell.children("input").attr("checked", "checked");
                                            cell.children(".is-override").text("1");
                                        }

                                        cell.children(".override-id").text(response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].OverrideID);
                                    }
                                }
                            }
                        }
                        if (colSpan > 2) {
                            initializeAllCheckBoxes();
                        }
                    }
                    hideProgressDialog();
                } else {
                    hideProgressDialog();
                    Utils.showError();
                }
            }
        });
    } else {
        $(".dialog table tbody").empty();
    }
}

function initializeAllCheckBoxes() {
    // add class for 'all' checkbox
    $.each($(".dialog table tbody tr"), function (key, value) {

        var input = $(value).find("input[type='checkbox']:last");
        input.parent().attr("class", "all");
        input.bind("change", allCheckBoxBehaviour);

    });

    $("td.input-cell > input").bind("change", function () {
        markAllCheckBox($(this).parent().parent());
    });

    // update 'all' checkbox
    $.each($(".dialog table tbody tr"), function (key, value) {
        //var input = $(value).find(".input-cell:first").children("input");
        markAllCheckBox($(value));
    });
}

function allCheckBoxBehaviour() {
    var checked = $(this).attr("checked") === "checked";

    var otherInputs = $(this).parent().parent().children("td").not(".all").children("input");

    if (checked) {
        otherInputs.attr("checked", "checked");
    } else {
        otherInputs.removeAttr("checked");
    }
}

function markAllCheckBox(tr) {
    var sameRowInputs = tr.children("td").not(".all").children("input");
    var allInput = tr.children(".all").children("input");

    var isAllChecked = true;

    $.each(sameRowInputs, function (key, value) {
        if ($(value).attr("checked") != "checked") {
            isAllChecked = false;
            return false;
        }
    });

    if (isAllChecked) {
        allInput.attr("checked", "checked");
    }
    else {
        allInput.removeAttr("checked");
    }
}

function checkChange() {
    var isChange = false;

    $.each($("td.input-cell"), function (key, value) {
        var checked = $(value).children("input").attr("checked") === "checked";
        var originChecked = $(value).children(".is-override").text() === "1";

        if (checked != originChecked) {
            isChange = true;
            return false;
        }
    });

    return isChange;
}

function discardHolidays() {
    if (checkChange()) {
        getPublicHolidays();
    }
}

function saveHolidays() {
    if (checkChange()) {
        MessageBox.show({
            message: [
                "Please note, all existing reservations for these selected days closed, will be deleted.",
                "Do you want to continue and save these selected closed days"
            ],
            buttons: {
                no: null,
                yes: function () {
                    callAPISaveHolidays(true);
                }
            }
        });
    }
}

function closeAndSaveHolidays() {
    if (checkChange()) {
        MessageBox.show({
            message: ["Do you want to save these changes?"],
            buttons: {
                no: function () {
                    popup_ex.hide("PublicHolidayDialog");
                    getOverrideList();
                },
                yes: function () {
                    MessageBox.show({
                        message: [
                            "Please note, all existing reservations for these selected days closed, will be deleted.",
                            "Do you want to continue and save these selected closed days"
                        ],
                        buttons: {
                            no: function () {
                                popup_ex.hide("PublicHolidayDialog");
                                getOverrideList();
                            },
                            yes: function () {
                                callAPISaveHolidays(false);
                                popup_ex.hide("PublicHolidayDialog");
                                getOverrideList();
                            }
                        }
                    });
                }
            }
        });
    } else {
        popup_ex.hide("PublicHolidayDialog");
        getOverrideList();
    }
}

function callAPISaveHolidays(isUpdate) {
    showProgressDialog("Saving");

    // prepare data
    var summary = "";

    $.each($("td.input-cell"), function (key, value) {
        var checked = $(value).children("input").attr("checked") === "checked";
        var originChecked = $(value).children(".is-override").text() === "1";

        if (checked != originChecked) {
            var sittingId = $(value).attr("class").replace(" input-cell", "");
            var dayId = $(value).parent().attr("class");
            var overrideId = $(value).children(".override-id").text();
            var isOverride = $(value).children("input").attr("checked") === "checked" ? 1 : 0;
            var day = $(value).parent().children("td").first().attr("class");

            summary += sittingId + ',' + dayId + ',' + overrideId + ',' + isOverride + ',' + day + '|';
        }
    });

    summary = summary.substring(0, summary.length - 1);

    $.ajax({
        type: "post",
        url: "/Holiday/SavePublicHolidays",
        data: {
            LocationID: $("input[name='LocationID']").val(),
            Input: summary,
            Token: $("input[name='Token']").val()
        },
        success: function (response) {
            hideProgressDialog();
            //update latest data
            if (response.IsSucceed) {
                if (isUpdate) {
                    getPublicHolidays();
                }
            } else {
                Utils.showError();
            }
        }
    });
}

function showPublicHolidayDialog() {
    showProgressDialog("Loading");

    // get data from screen
    var inputs = {};

    $.each($(".menu-input"), function (key, value) {
        var sittingId = $(value).attr("id");
        var menuName = $(value).find("input.txt-menu-name").val();

        inputs[key] = { sittingId: sittingId, menuName: menuName };
    });

    $.ajax({
        type: "post",
        url: "/Holiday/InitializePublicHolidayDialog",
        data: {
            token: $("input[name='Token']").val()
        },
        success: function (response) {
            hideProgressDialog();
            if (response.IsSucceed) {
                // create html
                var html = "";
                html += '<div class="dialog center-box clearfix">';
                html += '   <div class="select-panel clearfix">';
                html += '       <select id="country-selector" onchange="getPublicHolidays();">';
                html += '           <option value="-1">Select country</option>';

                for (var i = 0; i < response.Countries.length; i++) {
                    html += '       <option value="' + response.Countries[i].CountryID + '">' + response.Countries[i].CountryName + '</option>';
                }

                html += '       </select>';
                html += '       <select id="year-selector" onchange="getPublicHolidays();">';
                html += '           <option value="-1">Select year</option>';
                var currentTime = new Date();
                var currentYear = currentTime.getFullYear();

                for (var year = 2000; year < 3000; year++) {
                    if (year === currentYear) {
                        html += '   <option value="' + year + '" selected="selected">' + year + '</option>';
                    } else {
                        html += '   <option value="' + year + '">' + year + '</option>';
                    }
                }

                html += '       </select>';
                html += '   </div>';
                html += '   <div class="table-containment">';
                html += '       <table class="center-box">';
                html += '           <thead>';
                html += '               <tr>';
                html += '                   <th align="left">Public holidays</th>';

                for (key in inputs) {
                    html += '               <th id="' + inputs[key].sittingId + '">' + inputs[key].menuName + '</th>';
                }

                if (Object.keys(inputs).length > 1) {
                    html += '               <th>All</th>';
                }

                html += '               </tr>';
                html += '           </thead>';
                html += '           <tbody>';
                html += '           </tbody>';
                html += '       </table>';
                html += '   </div>';
                html += '   <div class="clearfix" style="margin-bottom: 10px;">';
                html += '       <button type="button" class="image-button biz-dialog-button left" style="margin-right: 30px;" onclick="saveHolidays();">Save</button>';
                html += '       <button type="button" class="image-button biz-dialog-button left" onclick="discardHolidays();">Discard</button>';
                html += '       <button type="button" class="image-button biz-dialog-button right" onclick="closeAndSaveHolidays();">Done</button>';
                html += '   </div>';
                html += '</div>';

                popup_ex.hide("PublicHolidayDialog");
                popup_ex.show("PublicHolidayDialog", "", html, {
                    background: {
                        'background-color': 'transparent'
                    }, border: {
                        'background-color': 'transparent',
                        'padding': '0px'
                    }, title: {
                        'display': 'none'
                    }, content: {
                        'padding': '0px',
                        'width': '710px'
                    }
                }, closeAndSaveHolidays);

                setTimeout(function () {
                    Utils.touchScroll(".table-containment");
                }, 500);
            } else {
                Utils.showError();
            }
        }
    });
}

function getSpecialDays() {
    var selectedYear = $(".dialog #year-selector").val();

    //$(".dialog #toggle-button").addClass("button-delete-special-day");
    $(".dialog #toggle-button").removeClass('active');

    if (selectedYear === -1) {
        $(".dialog table tbody").empty();
    } else {
        showProgressDialog("Loading");

        var cols = $(".dialog table thead tr th").length;

        $.ajax({
            type: "post",
            url: "/Holiday/GetSpecialDays",
            data: {
                locationId: $("input[name='LocationID']").val(),
                year: selectedYear
            },
            success: function (response) {
                hideProgressDialog();

                if (response.IsSucceed) {
                    $(".dialog table tbody").empty();

                    var sittingIds = {};
                    $.each($(".dialog table thead tr th"), function (key, value) {
                        sittingIds[key - 2] = $(value).attr("id");
                    });

                    if (response.SpecialDays != null) {

                        for (var i = 0; i < response.SpecialDays.length; i++) {
                            var html = "";

                            html += '<tr class="' + response.SpecialDays[i].DayID + '">';
                            var date = new Date(parseInt(response.SpecialDays[i].Date.substr(6)));
                            var day = date.getDay() - 1;

                            if (day === -1) { day = 6; }

                            html += '   <td>' + response.SpecialDays[i].Name + '</td>';
                            html += '   <td class="special-day-date ' + day + '">' + $.datepicker.formatDate("D, d M", date) + '</td>';

                            for (var j = 0; j < cols - 2; j++) {
                                html += '   <td align="center" class="' + sittingIds[j] + ' input-cell">';
                                html += '       <input type="checkbox" />';
                                html += '       <div class="hidden override-id">-1</div>';
                                html += '       <div class="hidden is-override">0</div>';
                                html += '   </td>';
                            }

                            html += '   <td class="delete-cell hidden"><div class="image-button button-delete"></div></td>';
                            html += '</tr>';

                            $(".dialog table tbody").append(html);
                        }

                        // update the current special days
                        for (var i = 0; i < response.SpecialDays.length; i++) {
                            for (var j = 0; j < response.SpecialDays[i].OverrideDayList.length; j++) {
                                var sittingID = response.SpecialDays[i].OverrideDayList[j].SittingID;

                                if (sittingID != -1) {
                                    var dayID = response.SpecialDays[i].DayID;
                                    var cell = $(".dialog table tbody tr." + dayID + " td." + sittingID);
                                    var isOverride = response.SpecialDays[i].OverrideDayList[j].IsOverride === 1;

                                    if (isOverride) {
                                        cell.children("input").attr("checked", "checked");
                                        cell.children(".is-override").text("1");
                                    }

                                    cell.children(".override-id").text(response.SpecialDays[i].OverrideDayList[j].OverrideID);
                                }
                            }
                        }

                        // handle button-delete
                        $(".dialog .button-delete").click(deleteSpecialDay);

                        if (cols > 3) {
                            initializeAllCheckBoxes();
                        }
                    }
                } else {
                    Utils.showError();
                }
            }
        });
    }
}

function discardSpecialDays() {
    var hasInputRow = $(".dialog table input[type='text']").length > 0;

    if (checkChange() || hasInputRow) {
        getSpecialDays();
    }
}

function addSpecialDay() {
    var selectedYear = $(".dialog #year-selector").val();

    if (selectedYear != -1) {
        // check if there's input row or not
        var hasInputRow = $(".dialog table input[type='text']").length > 0;

        if (hasInputRow) {
            MessageBox.show({
                message: ["Please finish adding special day!"],
                buttons: {
                    ok: function () {
                        $(".new-special-day-name").focus();
                    }
                }
            });

            return;
        }

        // append input row
        var cols = $(".dialog table thead tr th").length;

        var sittingIds = {};
        $.each($(".dialog table thead tr th"), function (key, value) {
            sittingIds[key - 2] = $(value).attr("id");
        });

        var html = "";
        html += '<tr class="input-row">';
        html += '   <td><input type="text" class="new-special-day-name" /></td>';
        html += '   <td><input type="text" class="new-special-day-date" readonly="readonly" /></td>';

        for (var i = 0; i < cols - 2; i++) {
            html += '<td align="center" class="' + sittingIds[i] + ' input-cell">';
            html += '   <input type="checkbox" disabled />';
            html += '   <div class="hidden override-id">-1</div>';
            html += '   <div class="hidden is-override">0</div>';
            html += '</td>';
        }

        html += '</tr>';

        $(".dialog table tbody").append(html);

        $(".new-special-day-name").focus();

        $(".new-special-day-date").scroller({
            dateFormat: "D, d M",
            dateOrder: 'D dM',
            theme: Utils.mobiscrollTheme(),
            display: 'modal',
            mode: Utils.mobiscrollMode(),
            preset: 'date',
            minDate: new Date(selectedYear, 0, 1),
            maxDate: new Date(selectedYear, 11, 31),
            onShow: function () {
                var name = $(".new-special-day-name").val();

                if ($.trim(name).length === 0) {
                    $('.new-special-day-date').scroller('hide');
                    $(".new-special-day-name").focus();
                }
            }
        });

        $(".new-special-day-date").change(function () {
            var date = $(this).val();

            var isExisted = false;

            $.each($(".dialog .special-day-date"), function (key, value) {
                var otherDate = $(value).text();

                if (date === otherDate) {
                    isExisted = true;

                    return false;
                }
            });

            if (isExisted) {
                MessageBox.show({
                    message: ["This Public holiday already exists, please enter in a different special day!"],
                    buttons: {
                        ok: function () {
                            $(".new-special-day-date").focus();
                        }
                    }
                });

                return;
            } else {
                showProgressDialog("Saving");

                $.ajax({
                    type: "post",
                    data: {
                        LocationID: $("input[name='LocationID']").val(),
                        Date: date,
                        Year: selectedYear,
                        Name: $.trim($(".new-special-day-name").val())
                    },
                    url: "/Holiday/AddSpecialDay",
                    success: function (response) {
                        hideProgressDialog();
                        if (response.IsSucceed) {
                            if (response.CanSave) {
                                // update to latest data
                                var tr = $(".input-row");

                                tr.attr("class", response.DayID);
                                var tds = tr.children("td");

                                // update name
                                $(tds[0]).empty();
                                $(tds[0]).text(response.Name);

                                // update date
                                $(tds[1]).empty();
                                $(tds[1]).text(response.Date);
                                $(tds[1]).attr("class", "special-day-date " + response.Day);

                                tr.find("input").removeAttr("disabled");

                                if (tr.find("input[type='checkbox']").length > 1) {
                                    var input = tr.find("input[type='checkbox']:last");
                                    input.parent().attr("class", "all");
                                    input.bind("change", allCheckBoxBehaviour);
                                }

                                tr.children("td").not(".all").children("input").bind("change", function () {
                                    markAllCheckBox($(this).parent().parent());
                                });

                                var isHidden = !$(".dialog #toggle-button").is('.active');

                                tr.append('<td class="delete-cell ' + (isHidden === true ? 'hidden' : '') + '"><div class="image-button button-delete"></div></td>');

                                tr.find(".button-delete").click(deleteSpecialDay);

                            } else {
                                MessageBox.show({
                                    message: ["This Public holiday already exists, please enter in a different special day!"],
                                    buttons: {
                                        ok: function () {
                                            $(".new-special-day-date").focus();
                                        }
                                    }
                                });
                            }
                        } else {
                            Utils.showError();
                        }
                    }
                });
            }
        });
    }
}

function deleteSpecialDay() {
    var tr = $(this).parent().parent();

    MessageBox.show({
        message: ["Are you sure want to delete this row?"],
        buttons: {
            no: null,
            yes: function () {
                showProgressDialog("Deleting");

                $.ajax({
                    type: "post",
                    url: "/Holiday/DeleteSpecialDay",
                    data: {
                        DayID: tr.attr("class")
                    },
                    success: function (response) {
                        hideProgressDialog();

                        if (response.IsSucceed) {
                            tr.remove();
                        } else {
                            Utils.showError();
                        }
                    }
                });
            }
        }
    });

}

function saveSpecialDays() {
    if (checkChange()) {
        MessageBox.show({
            message: [
                "Please note, all existing reservations for these selected days closed, will be deleted.",
                "Do you want to continue and save these selected closed days?"
            ],
            buttons: {
                no: null,
                yes: function () {
                    callAPISaveSpecialDays(true);
                }
            }
        });
    }
}

function saveAndCloseSpecialDays() {
    $('.new-special-day-date').scroller('hide');

    if (checkChange()) {
        MessageBox.show({
            message: ["Do you want to save these changes?"],
            buttons: {
                no: function () {
                    popup_ex.hide("SpecialDayDialog");
                    getOverrideList();
                },
                yes: function () {
                    MessageBox.show({
                        message: [
                            "Please note, all existing reservations for these selected days closed, will be deleted.",
                            "Do you want to continue and save these selected closed days"
                        ],
                        buttons: {
                            no: function () {
                                popup_ex.hide("SpecialDayDialog");
                                getOverrideList();
                            },
                            yes: function () {
                                callAPISaveSpecialDays(false);
                                popup_ex.hide("SpecialDayDialog");
                                getOverrideList();
                            }
                        }
                    });
                }
            }
        });
    } else {
        popup_ex.hide("SpecialDayDialog");
        getOverrideList();
    }
}

function callAPISaveSpecialDays(isUpdate) {
    showProgressDialog("Saving");

    // prepare data
    var summary = "";

    $.each($("td.input-cell"), function (key, value) {
        var checked = $(value).children("input").attr("checked") === "checked";
        var originChecked = $(value).children(".is-override").text() === "1";

        if (checked != originChecked) {
            var sittingId = $(value).attr("class").replace(" input-cell", "");
            var dayId = $(value).parent().attr("class");
            var overrideId = $(value).children(".override-id").text();
            var isOverride = $(value).children("input").attr("checked") === "checked" ? 1 : 0;
            var day = $(value).parent().children(".special-day-date").attr("class").replace("special-day-date ", "");

            summary += sittingId + ',' + dayId + ',' + overrideId + ',' + isOverride + ',' + day + '|';
        }
    });

    summary = summary.substring(0, summary.length - 1);

    $.ajax({
        type: "post",
        url: "/Holiday/SaveSpecialDays",
        data: {
            LocationID: $("input[name='LocationID']").val(),
            Input: summary,
            Token: $("input[name='Token']").val()
        },
        success: function (response) {
            hideProgressDialog();
            if (response.IsSucceed) {
                //update latest data
                if (isUpdate) {
                    getSpecialDays();
                }
            } else {
                Utils.showError();
            }
        }
    });
}

function toggleDeleteButtons() {
    if ($(".dialog #year-selector").val() != -1) {
        var button = $(".dialog #toggle-button");
        var isShown = button.is('.active');

        if (isShown) {
            // hide
            $(".dialog table .button-delete").parent().addClass("hidden");
            button.removeClass('active');
        } else {
            // show
            $(".dialog table .button-delete").parent().removeClass("hidden");
            button.addClass('active');
        }
    }
}

function showSpecialDayDialog() {
    // get data from screen
    var inputs = {};

    $.each($(".menu-input"), function (key, value) {
        var sittingId = $(value).attr("id");
        var menuName = $(value).find("input.txt-menu-name").val();

        inputs[key] = { sittingId: sittingId, menuName: menuName };
    });

    // create html
    var html = "";
    html += '<div class="dialog center-box clearfix">';
    html += '   <div class="select-panel clearfix">';
    html += '       <select id="year-selector" onchange="getSpecialDays();">';
    html += '           <option value="-1" selected="selected">Select year</option>';

    for (var year = 2000; year < 3000; year++) {
        html += '       <option value="' + year + '">' + year + '</option>';
    }

    html += '       </select>';
    html += '       <button type="button" class="image-button big biz-dialog-button" onclick="addSpecialDay();">Add special day</button>';
    html += '       <button type="button" class="image-button big biz-dialog-button" id="toggle-button" onclick="toggleDeleteButtons();">Delete</button>';
    html += '   </div>';
    html += '   <div class="table-containment">';
    html += '       <table class="center-box">';
    html += '           <thead>';
    html += '               <tr>';
    html += '                   <th align="left">Special days</th>';
    html += '                   <th></th>';

    for (key in inputs) {
        html += '               <th id="' + inputs[key].sittingId + '">' + inputs[key].menuName + '</th>';
    }

    if (Object.keys(inputs).length > 1) {
        html += '               <th>All</th>';
    }

    html += '               </tr>';
    html += '           </thead>';
    html += '           <tbody>';
    html += '           </tbody>';
    html += '       </table>';
    html += '   </div>';
    html += '   <div class="clearfix" style="margin-bottom: 10px;">';
    html += '       <button type="button" class="image-button biz-dialog-button left" style="margin-right: 30px;" onclick="saveSpecialDays();">Save</button>';
    html += '       <button type="button" class="image-button biz-dialog-button left" onclick="discardSpecialDays();">Discard</button>';
    html += '       <button type="button" class="image-button biz-dialog-button right" onclick="saveAndCloseSpecialDays();">Done</button>';
    html += '   </div>';
    html += '</div>';

    popup_ex.hide("SpecialDayDialog");
    popup_ex.show("SpecialDayDialog", "", html, {
        background: {
            'background-color': 'transparent'
        }, border: {
            'background-color': 'transparent',
            'padding': '0px'
        }, title: {
            'display': 'none'
        }, content: {
            'padding': '0px',
            'width': '710px'
        }
    }, saveAndCloseSpecialDays);

    setTimeout(function () {
        Utils.touchScroll(".table-containment");
    }, 500);

}