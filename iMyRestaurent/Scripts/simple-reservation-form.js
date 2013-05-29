var ReservationForm = {};
ReservationForm.open = function (position, event, start) {
    summary.refresher.stop();
    var html = '';
    html += '<div id="simple-reservation" class="popup-dialog lv-max detail-dialog">';
    html += '   <div role="body">';
    html += '       <div role="header">';
    html += '           <div class="clearfix">';
    html += '               <button type="button" class="image-button dialog-close" onclick="ReservationForm.close();"></button>';
    html += '           </div>';
    html += '           <div>New Reservation</div>';
    html += '       </div>';
    html += '       <div role="detail-info" class="clearfix">';
    html += '           <div id="left-panel" class="clearfix">';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Date</div>';
    html += '                   <div id="booking-date" class="value">';
    html += '                       <input type="text" readonly="readonly" value="' + summary.inputs.date.val() + '" />';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Location</div>';
    html += '                   <div class="value">' + summary.inputs.location.find('option:selected').html() + '</div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Menu type</div>';
    html += '                   <div class="value"><span id="menu-type"></span></div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Reservation time slot</div>';
    html += '                   <div class="value">';
    html += '                       <div class="clearfix">';
    html += '                           <div class="time-prefix">From</div>';
    html += '                           <div style="margin-left: 60px;" class="input">';
    html += '                               <input type="text" id="booking-start-time" value="' + start + '" />';
    html += '                           </div>';
    html += '                       </div>';
    html += '                       <div class="clearfix">';
    html += '                           <div class="time-prefix">To</div>';
    html += '                           <div style="margin-left: 60px;" class="input">';
    html += '                               <input type="text" id="booking-end-time" value="" disabled/>';
    html += '                           </div>';
    html += '                       </div>';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Sitting time</div>';
    html += '                   <div class="value clearfix" id="sitting-time-containment">';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Table no</div>';
    html += '                   <div id="table-selector" class="value input">';
    html += '                       <input type="text" id="layout-code" value="' + position.layout + '" />';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div id="number-guest" class="clearfix">';
    html += '                   <div class="label">Number of guests</div>';
    html += '                   <div class="value">';
    html += '                       <input type="text" id="guest-no" value="' + position.chairs + '" />';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Name</div>';
    html += '                   <div class="value">';
    html += '                       <input type="text" id="guest-name" />';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Mobile phone no</div>';
    html += '                   <div class="value">';
    html += '                       <input type="text" id="guest-phone" />';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Email</div>';
    html += '                   <div class="value">';
    html += '                       <input type="text" id="guest-email" />';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Confirm</div>';
    html += '                   <div id="is-confirmed" class="value">';
    html += '                       <input type="checkbox" />';
    html += '                   </div>';
    html += '               </div>';
    html += '           </div>';
    html += '           <div id="right-panel" class="clearfix">';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Comment</div>';
    html += '               </div>';
    html += '               <div>';
    html += '                   <textarea id="comments" rows="8" onfocus="BookingDetail.placeholder(true);" onblur="BookingDetail.placeholder(false);">NEW - please review</textarea>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Guest arrived on time</div>';
    html += '                   <div class="value">';
    html += '                       <input type="checkbox" id="is-on-time" />';
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Guest rating</div>';
    html += '                   <div id="feedback" class="value">';
    html += RatingControl.html(0);
    html += '                   </div>';
    html += '               </div>';
    html += '               <div class="clearfix">';
    html += '                   <div class="label">Bill total amount</div>';
    html += '                   <div class="value">';
    html += '                       <input type="text" id="bill-amount" />';
    html += '                   </div>';
    html += '               </div>';
    html += '           </div>';
    html += '       </div>';
    html += '       <div role="buttons" class="clearfix">';
    html += '           <button type="button" class="image-button bb" onclick="ReservationForm.checkBeforeCreate();">Save & close</button>';
    html += '           <form action="Reservation/ShowTable" method="post" id="show-table">';
    html += '               <input type="hidden" name="LocationID" value="' + summary.inputs.location.val() + '" />';
    html += '               <input type="hidden" name="LocationName" value="' + summary.inputs.location.find('option:selected').html() + '" />';
    html += '               <input type="hidden" name="GuestName" />';
    html += '               <input type="hidden" name="PhoneNumber" />';
    html += '               <input type="hidden" name="GuestNo" />';
    html += '               <input type="hidden" name="SittingType" />';
    html += '               <input type="hidden" name="InitialTime" />';
    html += '               <input type="hidden" name="LayoutCode" />';
    html += '               <button type="submit" class="image-button bb">Show table</button>';
    html += '           </form>';
    html += '       </div>';
    html += '   </div>';
    html += '</div>';

    $('body').append(html);
    $('body').append($('<div class="overlay lv-max black" for="simple-reservation" />'));

    ReservationForm.dock();

    $('#booking-date input').scroller({
        preset: 'date',
        theme: Utils.mobiscrollTheme(),
        display: 'modal',
        mode: Utils.mobiscrollMode(),
        dateFormat: 'D, d M yy',
        dateOrder: 'D dMyy'
    });

    $('#booking-start-time').setMask('time');
    $('#booking-date input').change(ReservationForm.updateSittingTime);
    ReservationForm.updateSittingTime();

    $('#booking-start-time').change(ReservationForm.refineStartTime);

    // handle events
    RatingControl.start();

    $('#show-table').submit(function () {
        $('#show-table input[name="GuestName"]').val($.trim($('#guest-name').val()));
        $('#show-table input[name="PhoneNumber"]').val($.trim($('#guest-phone').val()));
        $('#show-table input[name="GuestNo"]').val($.trim($('#guest-no').val()));
        $('#show-table input[name="LayoutCode"]').val($.trim($('#layout-code').val()));
        var index = $('#sitting-time-containment input').index($('#sitting-time-containment input:checked'));

        var sittingTime = index == 0 ? 'short' : index == 1 ? 'normal' : 'long';

        $('#show-table input[name="SittingType"]').val(index + 1);

        var initialTime = $('#booking-date input').val() + ' - ' + $('#booking-start-time').val();
        $('#show-table input[name="InitialTime"]').val(initialTime);
    });
};

ReservationForm.checkBeforeCreate = function () {
    // check empty
    if (ReservationForm.validate()) {
        // check table
        // call server to validate table no and guest
        showProgressDialog('Checking table');
        $.ajax({
            type: 'post',
            url: '/Reservation/GetTable',
            data: {
                LocationID: summary.inputs.location.val(),
                LayoutCode: $.trim($('#layout-code').val())
            },
            complete: function (x) {
                hideProgressDialog();
            },
            success: function (response) {
                if (response.IsSucceed) {
                    if (response.ChairNo == -1) {
                        MessageBox.show({
                            message: ['Invalid table, please select a valid table number!'],
                            buttons: {
                                ok: function () {
                                    $('#layout-code').focus();
                                }
                            }
                        });
                    } else {
                        var guestNo = parseInt($('#guest-no').val(), 10);

                        if (guestNo > response.ChairNo) {
                            MessageBox.show({
                                message: [
                                        'The table you have selected do not have enough chairs for the number of guests!',
                                        'Do you want to continue with this reservation?'
                                    ],
                                buttons: {
                                    no: null,
                                    yes: function () {
                                        ReservationForm.check(response.TableID);
                                    }
                                }
                            });
                        } else {
                            ReservationForm.check(response.TableID);
                        }
                    }
                } else {
                    Utils.showError();
                }
            }
        });
    }
};

ReservationForm.check = function (tableId) {
    MessageBox.show({
        message: [
            'Table no. ' + $('#layout-code').val() + ' for ' + $('#guest-no').val() + ' guests.',
            'Time slot ' + $('#booking-date input').val(),
            'from ' + $('#booking-start-time').val() + ' to ' + $('#booking-end-time').val() + '.',
            'Do you want to reserve this table?'
        ],
        buttons: {
            no: null,
            yes: function () {
                // get siting time
                var index = $('#sitting-time-containment input').index($('#sitting-time-containment input:checked'));

                var sittingTime = index == 0 ? 'short' : index == 1 ? 'normal' : 'long';

                // get is-on-time
                var isOnTime = $('input#is-on-time').attr('checked');
                isOnTime = isOnTime == 'checked' ? '1' : '0';

                // get is-confirmed
                var isConfirmed = $('#is-confirmed input').attr('checked');
                isConfirmed = isConfirmed == 'checked' ? '1' : '0';

                var data = {
                    LocationID: summary.inputs.location.val(),
                    BookingID: $('#booking-detail-dialog').data('booking-id'),
                    BillAmount: $.trim($('input#bill-amount').val()),
                    Comments: $.trim($('textarea#comments').val()),
                    IsOnTime: isOnTime,
                    IsConfirmed: isConfirmed,
                    BookingDate: $.datepicker.formatDate('yymmdd', $('#booking-date input').scroller('getDate')),
                    StartTime: $('#booking-start-time').val(),
                    EndTime: $('#booking-end-time').val(),
                    TableID: tableId,
                    NoOfGuests: $.trim($('#number-guest input').val()),
                    Feedback: RatingControl.value($('#feedback .rating')),
                    SittingTime: sittingTime,
                    EventID: $('#simple-reservation').data('event-id'),
                    GuestName: $.trim($('#guest-name').val()),
                    GuestPhone: $.trim($('#guest-phone').val())
                };

                showProgressDialog('Checking reservation time');

                $.ajax({
                    type: 'post',
                    url: '/Summary/CheckSimpleBooking',
                    data: data,
                    success: function (resp) {
                        if (resp.IsSucceed) {
                            if (resp.Code == 1) {
                                data.StartTime = resp.NewStartTime;
                                data.EndTime = resp.NewEndTime;

                                ReservationForm.create(data);
                                return;
                            } else if (resp.Code == 2) {
                                hideProgressDialog();
                                MessageBox.show({
                                    message: ['Invalid change as there is already a reservation on the selected table at the selected time! Please change the guest to a vacant table.'],
                                    buttons: { ok: null }
                                });
                                return;
                            } else {
                                hideProgressDialog();
                                MessageBox.show({
                                    message: ['Invalid change as the restaurant closed at the selected time!'],
                                    buttons: { ok: null }
                                });
                                return;
                            }
                        } else {
                            hideProgressDialog();
                            Utils.showError();
                        }
                    },
                    error: hideProgressDialog
                });
            }
        }
    });
};

ReservationForm.create = function (data) {
    showProgressDialog('Adding new reservation');

    $.ajax({
        type: 'post',
        url: '/Summary/SimpleAddBooking',
        data: data,
        complete: function () {
            hideProgressDialog();
        },
        success: function (resp) {
            if (resp.IsSucceed) {
                ReservationForm.close();
                summary.load(true);
            } else {
                Utils.showError();
            }
        }
    });
};

ReservationForm.validate = function () {
    // validate start time
    var startTime = $.trim($('#booking-start-time').val());

    if (startTime.length == 0) {
        MessageBox.show({
            message: ['Booking Start Time is invalid'],
            buttons: {
                ok: function () {
                    $('#booking-start-time').focus();
                }
            }
        });

        return false;
    }

    // validate table-no
    var tableNo = $.trim($('#layout-code').val());

    if (tableNo.length == 0) {
        MessageBox.show({
            message: ['Table No is invalid'],
            buttons: {
                ok: function () {
                    $('#layout-code').focus();
                }
            }
        });

        return false;
    }

    // validate guest-no
    var guestNo = $.trim($('input#guest-no').val());

    if (guestNo.length == 0 || isNaN(guestNo) || parseInt(guestNo) < 0) {
        MessageBox.show({
            message: ['Please enter the  total number of guests for this reservation!'],
            buttons: {
                ok: function () {
                    $('#guest-no').focus();
                }
            }
        });

        return false;
    }

    // validate guest-name
    var tableNo = $.trim($('#guest-name').val());

    if (tableNo.length == 0) {
        MessageBox.show({
            message: ['Please enter \'Name of guest\' for this reservation'],
            buttons: {
                ok: function () {
                    $('#guest-name').focus();
                }
            }
        });

        return false;
    }

    // validate guest-phone
    var tableNo = $.trim($('#guest-phone').val());

    if (tableNo.length == 0) {
        MessageBox.show({
            message: ['Please enter \'Mobile phone no\' for this reservation'],
            buttons: {
                ok: function () {
                    $('#guest-phone').focus();
                }
            }
        });

        return false;
    }

    // validate bill amount
    var billAmount = $.trim($('input#bill-amount').val());

    if (billAmount.length > 0) {
        // need to validate
        if (isNaN(billAmount)) {
            MessageBox.show({
                message: ['Bill Total Amount is invalid'],
                buttons: {
                    ok: function () {
                        $('input#bill-amount').focus();
                    }
                }
            });

            return false;
        }
    }

    return true;
};

ReservationForm.updateSittingTime = function () {
    showProgressDialog('Getting sitting time');
    $.ajax({
        url: '/Reservation/GetBizHour',
        type: 'post',
        data: {
            LocationID: summary.inputs.location.val(),
            BookingDate: $.datepicker.formatDate('yymmdd', $('#booking-date input').scroller('getDate')),
            StartTime: $('#booking-start-time').val()
        },
        complete: function () {
            hideProgressDialog();
        },
        success: function (response) {
            var sittingType = 3;

            if ($('#sitting-time-containment').children().length > 0) {
                sittingType = $('#sitting-time-containment input').index($('#sitting-time-containment input:checked')) + 1;
            }

            ReservationForm.displaySittingTime(response.BizHour, sittingType);
        }
    });
};

ReservationForm.displaySittingTime = function (bizHour, sittingType) {
    $('#sitting-time-containment').empty();
    if (bizHour == null || bizHour.State == 'Closed') {
        MessageBox.show({
            message: ['The restaurant is closed for the selected time! Please select another time.'],
            buttons: {
                ok: function () {
                    // clear menu name
                    $('#menu-type').html('');
                    $('#booking-end-time').val('');
                }
            }
        });

        return;
    } else {
        // update menu-type
        $('#menu-type').html(bizHour.EventName);

        // update event-id
        $('#simple-reservation').data('event-id', bizHour.EventID);

        // append radiobutton
        var html = '';
        html += '<div>';
        html += '   <input type="radio" name="sitting-time" value="' + bizHour.ShortSittingTime + '" />';
        html += '   <span>' + toTime(bizHour.ShortSittingTime) + '</span>'
        html += '</div>';
        html += '<div>';
        html += '   <input type="radio" name="sitting-time" value="' + bizHour.MediumSittingTime + '" />';
        html += '   <span>' + toTime(bizHour.MediumSittingTime) + '</span>'
        html += '</div>';
        html += '<div>';
        html += '   <input type="radio" name="sitting-time" value="' + bizHour.LongSittingTime + '" />';
        html += '   <span>' + toTime(bizHour.LongSittingTime) + '</span>'
        html += '</div>';

        $('#sitting-time-containment').append(html);

        if (sittingType > 0) {
            // tick current sitting type
            $($('#sitting-time-containment input[type="radio"]')[sittingType - 1]).attr('checked', '');
        }

        $('#sitting-time-containment input').click(ReservationForm.refineEndTime);

        ReservationForm.refineEndTime();
    }
};

ReservationForm.refineStartTime = function () {
    // validate time format
    var text = $('#booking-start-time').val();
    var regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])?$/;
    var isValid = regex.test(text);

    if (isValid) {
        var digit = text.split(':');

        var time = new Date();
        time.setHours(digit[0]);
        time.setMinutes(digit[1]);

        // find nearest 15min-block
        time = Utils.nearTimeSlot(time);

        var hour = (100 + time.getHours()).toString().substr(1);
        var min = (100 + time.getMinutes()).toString().substr(1);

        $('#booking-start-time').val(hour + ':' + min);

        ReservationForm.refineEndTime();

        ReservationForm.updateSittingTime();

    } else {
        MessageBox.show({
            message: ['The booking start time is invalid'],
            buttons: {
                ok: function () {
                    $('#booking-start-time').val('');
                }
            }
        });
    }
};

ReservationForm.refineEndTime = function () {
    var sittingTime = $('input[name="sitting-time"]:checked').val();

    if (sittingTime) {

        var digit = $('#booking-start-time').val().split(':');

        var time = new Date();
        time.setHours(digit[0]);
        time.setMinutes(digit[1]);

        time.setMinutes(time.getMinutes() + parseInt(sittingTime));

        var hour = (100 + time.getHours()).toString().substr(1);
        var min = (100 + time.getMinutes()).toString().substr(1);

        $('#booking-end-time').val(hour + ':' + min);
    }
};

ReservationForm.close = function () {
    $('#simple-reservation').remove();
    $('.overlay[for="simple-reservation"]').remove();

    summary.refresher.start();
};

ReservationForm.dock = function () {
    //$('.overlay[for="booking-detail"]').height(0).width(0);
    $('#simple-reservation').css({ top: 0, left: 0 });

    FlexibleLayout.adapt();

    Utils.positioningDialog('#simple-reservation', 'center', 'center');
};