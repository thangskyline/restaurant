var dialogTop;

function ShowBookingDetail(bookingID, personID, top) {
    forwardToChangeReservation = false;
    dialogTop = top + 10;
    var url = '/Reservation/GetBookingDetail';
    var hfIsChanged = document.getElementById("hfIsChanged");
    var hfSaveRate = document.getElementById("hfSaveRate");
    var hfSaveOnTime = document.getElementById("hfSaveOnTime");
    var hfSaveAmount = document.getElementById("hfSaveAmount");
    var changed;

    if (hfIsChanged != null) {
        changed = hfIsChanged.value;
    }
    else {
        changed = "-1";
    }

    $.ajax({
        type: "post",
        url: url,
        data: {
            bookingID: bookingID
        },
        success: function (data) {
            // hide loading dialog
            hideProgressDialog();

            // Get data and check
            //alert(data.ResultData);
            var rate;
            if (hfSaveRate != null) rate = hfSaveRate.value;
            else rate = data.GuestRate;

            var onTime;
            if (hfSaveOnTime != null) onTime = hfSaveOnTime.value;
            else {
                if (data.GuestOnTime == 1) onTime = "true";
                else onTime = "false";
            }

            var amount;
            if (hfSaveAmount != null) amount = hfSaveAmount.value;
            else amount = data.BillTotalAmount;

            var html = popup_ex.join
            ('<div class="dialog-contentment clearfix">')
            ('  <div class="dialog-title">Table Reservation Detail</div>')
            ('  <div class="information-div center-box clearfix">')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Date</div>')
            ('          <div class="value-text">' + data.Date + '</div>')
            ('          <div class="label-text">')
            ('          <div class="imytable-icon" style="margin-left: -28px; margin-top: -5px;"></div>')
            ('              <text>iMyTable Reservation</text>')
            ('          </div>')
            ('          <div class="value-text">')
            ('              <input type="checkbox" disabled="disabled" id="cbIMyTable" ' + (data.iMyTable == 1 ? "checked=\"checked\"" : "") + ' />')
            ('          </div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Location:</div>')
            ('          <div class="value-text">' + data.Location + '</div>')
            ('          <div class="label-text">Guest arrived on time?</div>')
            ('          <div class="value-text">')
            ('              <input type="checkbox" id="cbOnTime" ' + (onTime == "true" ? "checked=\"checked\"" : "") + ' />')
            ('          </div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Menu Type:</div>')
            ('          <div class="value-text">' + data.MenuType + '</div>')
            ('          <div class="label-text">Guest Rating</div>')
            ('          <div class="value-text">')
            ('              <img id="star1" src="' + (rate >= 1 ? "/Content/images/starOn.png" : "/Content/images/starOff.png") + '" width="20" onclick="RateAction(\'1\');" />')
            ('              <img id="star2" src="' + (rate >= 2 ? "/Content/images/starOn.png" : "/Content/images/starOff.png") + '" width="20" onclick="RateAction(\'2\');" />')
            ('              <img id="star3" src="' + (rate >= 3 ? "/Content/images/starOn.png" : "/Content/images/starOff.png") + '" width="20" onclick="RateAction(\'3\');" />')
            ('              <img id="star4" src="' + (rate >= 4 ? "/Content/images/starOn.png" : "/Content/images/starOff.png") + '" width="20" onclick="RateAction(\'4\');" />')
            ('              <img id="star5" src="' + (rate >= 5 ? "/Content/images/starOn.png" : "/Content/images/starOff.png") + '" width="20" onclick="RateAction(\'5\');" />')
            ('          </div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Reservation time slot:</div>')
            ('          <div class="value-text">' + data.StartTime + ' - ' + data.EndTime + '</div>')
            ('          <div class="label-text">Bill Total Amount</div>')
            ('          <div class="value-text">')
            ('              <input type="text" id="txtBillAmount" value="' + amount + '" />')
            ('          </div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Table no.</div>')
            ('          <div class="value-text">' + data.TableNo + '</div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Number of guests:</div>')
            ('          <div class="value-text">' + data.NumberGuest + '</div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Name:</div>')
            ('          <div class="value-text clearfix">' + data.Name + '</div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Email:</div>')
            ('          <div class="value-text">' + data.Email + '</div>')
            ('      </div>')
            ('      <div class="line clearfix">')
            ('          <div class="label-text">Mobile phone no.:</div>')
            ('          <div class="value-text">' + data.Phone + '</div>')
            ('      </div>')
            ('  </div>')
            ('  <div class="button-panel center-box clearfix">')
            ('      <div>')
            ('          <form action="Reservation/Edit" method="post" id="change-reservation-form">')
            ('              <input type="hidden" name="GuestName" value="' + data.Name + '" />')
            ('              <input type="hidden" name="PhoneNumber" value="' + data.Phone + '" />')
            ('              <input type="hidden" name="GuestNo" value="' + data.NumberGuest + '" />')
            ('              <input type="hidden" name="LocationID" value="' + data.LocationID + '" />')
            ('              <input type="hidden" name="LocationName" value="' + data.Location + '" />')
            ('              <input type="hidden" name="SummaryDate" value="' + data.Date + '" />')
            ('              <input type="hidden" name="InitialTime" value="' + data.InitialTime + '" />')
            ('              <input type="hidden" name="EndTime" value="' + data.EndTime + '" />')
            ('              <input type="hidden" name="Mode" value="Edit" />')
            ('              <input type="hidden" name="BookingID" value="' + bookingID + '" />')
            ('              <input type="hidden" name="SittingType" value="' + data.SittingType + '" />')
            ('              <input type="hidden" name="PersonID" value="' + personID + '" />')
            ('              <input type="button" class="image-button button-change-reservation" value="" onclick="changeFlag();" />')
            ('          </form>')
            ('      </div>')
            ('      <div>')
            ('          <input type="button" class="image-button button-cancel-reservation" value="" onclick="OnClickReservation(\'Cancel\',\'Cancel a Reservation\',\'Reason to cancel\',\'Cancel reason\'); return false;" />')
            ('      </div>')
            ('      <div>')
            ('          <input type="button" class="image-button button-block-guest" value="" onclick="OnClickReservation(\'BlockGuest\',\'Block Guest\',\'Reason to block\',\'Block reason\'); return false;" />')
            ('      </div>')
            ('      <div>')
            ('          <input type="button" class="image-button button-report-guest" value="" onclick="CallReservation(\'ReportGuestNoShow\'); return false;" />')
            ('      </div>')
            ('      <div>')
            ('          <input type="button" class="image-button button-reservation-history" value="" onclick="CallReservation(\'History\'); return false;" />')
            ('      </div>')
            ('      <div>')
            ('          <input type="button" class="image-button button-save-close" value="" onclick="CallReservation(\'SaveAndClose\'); return false;" />')
            ('      </div>')
            ('  </div>')
            ('</div>')
            ('<input id="hfIsCancel" type="hidden" value="' + changed + '" />')
            ('<input id="hfIsRefresh" type="hidden" value="' + changed + '" />')
            ('<input id="bookingId" type="hidden" value="' + bookingID + '" />')
            ('<input id="hfOnTime" type="hidden" value="' + data.GuestOnTime + '" />')
            ('<input id="hfRate" type="hidden" value="' + data.GuestRate + '" />')
            ('<input id="hfRateCurrent" type="hidden" value="' + rate + '" />')
            ('<input id="hfPersonID" type="hidden" value="' + personID + '" />')
            ('<input id="hfAmount" type="hidden" value="' + data.BillTotalAmount + '" />')
            ();

            popup_ex.hide('ReservationBox');
            popup_ex.show('ReservationBox', '', html,
			{
			    background: {
			        'background-color': 'transparent'
			    },
			    border: {
			        'background-color': 'transparent',
			        'padding': '0px'
			    },
			    title: {
			        'display': 'none'
			    },
			    content: {
			        'padding': '0px',
			        'width': '700px'
			    },
			    position: 'defined-top',
			    top: dialogTop
			}, HideForm);
        }
    });
}

function hideDialog() {

    if (Boolean(forwardToChangeReservation)) {
        $("#change-reservation-form").submit();
    }

    popup_ex.hide('ReservationBox');
}

function changeFlag() {
    if ($("#hfIsCancel").val() === "1") {
        return false;
    }
    forwardToChangeReservation = true;
    HideForm();
}

var forwardToChangeReservation;

function ShowHistory(isRefresh, rateCurrent, onTime, amount) {
    showProgressDialog('Loading history');

    var url = '/Reservation/GetHistory';
    var obj = {};
    var hfPersonID = document.getElementById("hfPersonID");
    var bookingId = document.getElementById("bookingId");
    obj.personID = hfPersonID.value;
    $.ajax({
        type: "post",
        url: url,
        data: {
            personID: hfPersonID.value
        },
        complete: function () {
            hideProgressDialog();
        },
        success: function (data) {
            // Get data and check
            //alert(data.ResultData);
            var html = popup_ex.join
            ('<div class="dialog-contentment clearfix">')
            ('  <div class="dialog-title">Table Reservation History of ' + data.Name + '</div>')
            ('  <table cellpadding="1" border="0" cellspacing="1">')
            ('      <thead>')
            ('          <td width="80px">Date</td>')
            ('          <td width="90px">Time</td>')
            ('          <td width="85px">')
            ('              <text>iMyTable Reservation</text>')
            ('              <div class="imytable-icon center-box" /></div>')
            ('          </td>')
            ('          <td width="110px">Location</td>')
            ('          <td width="60px">Menu</td>')
            ('          <td width="50px">Table no.</td>')
            ('          <td width="60px">No. of Guest</td>')
            ('          <td width="60px">Arrived on time</td>')
            ('          <td width="100px">Guest Rating</td>')
            ('          <td>Bill Total Amount</td>')
            ('      </thead>')
            ('  </table>')
            ('  <div class="scrollable">')
            ('      <table cellpadding="1" border="0" cellspacing="1">')
            ('          <tbody>')
            ('          ' + data.ResultData)
            ('          </tbody>')
            ('      </table>')
            ('  </div>')
            ('</div>')
            ('<input id="hfIsChanged" type="hidden" value="' + isRefresh + '" />')
            ('<input id="hfSaveRate" type="hidden" value="' + rateCurrent + '" />')
            ('<input id="hfSaveOnTime" type="hidden" value="' + onTime + '" />')
            ('<input id="hfSaveAmount" type="hidden" value="' + amount + '" />')();

            popup_ex.show('HistoryBox', '', html, {
                position: 'default',
                background: {
                    'background-color': 'transparent'
                },
                border: {
                    'background-color': 'transparent',
                    'padding': '0px'
                },
                title: {
                    'display': 'none'
                },
                content: {
                    'padding': '0px',
                    'width': '880px'
                }
            }, 'HideFormHistory(' + bookingId.value + ',' + hfPersonID.value + ')');
        }
    });
}

function RateAction(star) {
    var rateCurrent = document.getElementById("hfRateCurrent");
    rateCurrent.value = star;

    var star1 = document.getElementById("star1");
    if (star >= 1) star1.src = "/Content/images/starOn.png";
    else star1.src = "/Content/images/starOff.png";

    var star2 = document.getElementById("star2");
    if (star >= 2) star2.src = "/Content/images/starOn.png";
    else star2.src = "/Content/images/starOff.png";

    var star3 = document.getElementById("star3");
    if (star >= 3) star3.src = "/Content/images/starOn.png";
    else star3.src = "/Content/images/starOff.png";

    var star4 = document.getElementById("star4");
    if (star >= 4) star4.src = "/Content/images/starOn.png";
    else star4.src = "/Content/images/starOff.png";

    var star5 = document.getElementById("star5");
    if (star >= 5) star5.src = "/Content/images/starOn.png";
    else star5.src = "/Content/images/starOff.png";

}

function HideFormHistory(bookingId, personId) {
    ShowBookingDetail(bookingId, personId, dialogTop);
    popup_ex.hide('HistoryBox');
}

//Check: if user change data in screen then save and close
function HideForm() {
    afterCloseDialog();
    var hfOnTime = document.getElementById("hfOnTime");
    var hfRate = document.getElementById("hfRate");
    var hfAmount = document.getElementById("hfAmount");

    // Check changeing data in form
    var flag = false;
    if (document.getElementById("cbOnTime").checked != hfOnTime.value)
        flag = true;

    var hfCurrentRate = document.getElementById("hfRateCurrent");
    var currentRate = hfCurrentRate.value;
    if (currentRate != hfRate.value)
        flag = true;

    if (document.getElementById("txtBillAmount").value != hfAmount.value)
        flag = true;

    if (flag) {
        // Save data in screen
        MessageBox.show({
            message: ["Do you want to save the changes you made?"],
            buttons: {
                no: function () {
                    var hfIsRefresh = document.getElementById("hfIsRefresh");
                    if (hfIsRefresh.value == "1") {
                        submit();
                    }

                    hideDialog();
                },
                yes: SaveAndClose
            }
        });
    } else {
        var hfIsRefresh = document.getElementById("hfIsRefresh");
        if (hfIsRefresh.value == "1") {
            submit();
        }

        hideDialog();
    }
}

function OnClickReservation(objName, title, desc, displayText) {
    var hfIsCancel = document.getElementById("hfIsCancel");
    if (hfIsCancel.value == "1") {
        return;
    }

    var html = '';
    html += '<div>' + desc + '</div>';
    html += '<input type="text" value="' + displayText + '" id="' + objName + '" class="textbox-popup" onclick="ClearText(this);" style="text-align: center; font-size: 11px; height: 14px; margin-top: 3px;" />';

    MessageBox.show({
        title: title,
        message: [html],
        buttons: {
            no: null,
            yes: function () {
                var input = $(".info-box input[type='text']").val();
                var id = $(".info-box input[type='text']").attr("id");

                CallReservation(id, input);
            }
        }
    });
}

function ClearText(obj) {
    obj.value = "";
}

function CallReservation(objName, input) {
    var obj = {
        textInput: input,
        bookingId: $("#bookingId").val()
    };

    switch (objName) {
        case "Cancel":
            $.ajax({
                type: "post",
                url: "/Reservation/Cancel",
                data: obj,
                success: function (response) {
                    if (response.IsSucceed) {
                        $("#hfIsRefresh").val(1);
                        $("#hfIsCancel").val(1);
                    }

                    MessageBox.show({
                        message: [response.Message],
                        buttons: {
                            ok: null
                        }
                    });
                }
            });

            break;
        case "BlockGuest":
            $.ajax({
                type: "post",
                url: "/Reservation/BlockGuest",
                data: obj,
                success: function (response) {
                    MessageBox.show({
                        message: [response.Message],
                        buttons: {
                            ok: null
                        }
                    });
                }
            });

            break;
        case "ReportGuestNoShow":
            if ($("#hfIsCancel").val() === "1") {
                return;
            }

            $.ajax({
                type: "post",
                url: "/Reservation/ReportGuestNoShow",
                data: obj,
                success: function (response) {
                    MessageBox.show({
                        message: [response.Message],
                        buttons: {
                            ok: null
                        }
                    });
                }
            });

            break;
        case "History":
            ShowHistory($("#hfIsRefresh").val(), $("#hfRateCurrent").val(), document.getElementById("cbOnTime").checked, $("#txtBillAmount").val());

            popup_ex.hide('ReservationBox');
            break;
        case "SaveAndClose":
            SaveAndClose();

            break;
    }
}

/**
* Checks if a given string is float or not
*
* @author sos
* @param {String} val The string in question.
*/
function isFloat(val) {
    if (!val || (typeof val != "string" || val.constructor != String)) {
        return (false);
    }
    var isNumber = !isNaN(new Number(val));
    if (isNumber) {
        if (val.indexOf(',') == -1) {
            return (true);
        } else {
            return (false);
        }
    } else {
        return (false);
    }
}

function SaveAndClose() {
    // validate
    var amount = $.trim($("#txtBillAmount").val());

    if (amount.length === 0) {
        amount = "0";
    } else if (!isFloat(amount) || parseFloat(amount) < 0) {
        MessageBox.show({
            message: ["Bill Total Amount is invalid"],
            buttons: {
                ok: null
            }
        });
        return;
    }

    $.ajax({
        url: "/Reservation/SaveAndCloseReservation",
        type: "post",
        asycn: false,
        data: {
            bookingId: $("#bookingId").val(),
            billAmount: amount,
            feedback: $("#hfRateCurrent").val(),
            isOnTime: $("#cbOnTime").attr("checked")
        },
        success: function (data) {
            // Get data and check
            showAndHideProgressDialog("Reservation detail changes have been saved!");

            if ($("#hfIsRefresh").val() === "1") {
                submit();
            }

            hideDialog();
            afterCloseDialog();
        }
    });

}