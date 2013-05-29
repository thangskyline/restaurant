var BookingDetail = {
    locationId: null,
    fullData: true,
    value: function (value) {
        if (typeof value == 'undefined') {
            BookingDetail.fullData = false;
            return '';
        } else {
            return value;
        }
    },
    locationName: function (value) {
        if (typeof value == 'undefined') {
            return typeof summary == 'undefined' ? $('#hidden-location-name').text() : summary.inputs.location.find('option:selected').text();
        } else {
            return value;
        }
    },
    open: function (bookingID, needCloseCallback) {
        // show loading dialog
        showProgressDialog("Loading reservation detail information");

        $.ajax({
            type: 'post',
            url: '/Reservation/GetBookingDetail',
            data: {
                bookingID: bookingID
            },
            complete: function () {
                hideProgressDialog();
            },
            success: function (response) {
                if (response.IsSucceed) {
                    BookingDetail.fullData = true;

                    if (typeof response.LocationID == 'undefined' || response.LocationID == null) {
                        BookingDetail.locationId = typeof summary == 'undefined' ? $('#hidden-values-store .location-id').text() : summary.inputs.location.val();
                    } else {
                        BookingDetail.locationId = response.LocationID;
                    }

                    var html = '';
                    html += '<div id="booking-detail-dialog" class="popup-dialog lv-max detail-dialog">';
                    html += '   <div role="body">';
                    html += '       <div role="header">';
                    html += '           <div class="clearfix">';
                    html += '               <button type="button" class="image-button dialog-close" onclick="BookingDetail.confirmingClose(false);"></button>';
                    html += '           </div>';
                    html += '           <div>Table Reservation Detail</div>';
                    html += '       </div>';
                    html += '       <div role="detail-info" class="clearfix">';
                    html += '           <div id="left-panel" class="clearfix">';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Date</div>';
                    html += '                   <div id="booking-date" class="value">';
                    html += '                       <input type="text" readonly="readonly" />';
                    html += '                       <div class="origin">' + BookingDetail.value(response.BookingDate) + '</div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Location</div>';
                    html += '                   <div class="value">' + BookingDetail.locationName(response.Location) + '</div>';
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
                    html += '                               <input type="text" id="booking-start-time" value="' + BookingDetail.value(response.StartTime) + '" />';
                    html += '                               <div class="origin">' + BookingDetail.value(response.StartTime) + '</div>';
                    html += '                           </div>';
                    html += '                       </div>';
                    html += '                       <div class="clearfix">';
                    html += '                           <div class="time-prefix">To</div>';
                    html += '                           <div style="margin-left: 60px;" class="input">';
                    html += '                               <input type="text" id="booking-end-time" value="' + BookingDetail.value(response.EndTime) + '" disabled/>';
                    html += '                               <div class="origin">' + BookingDetail.value(response.EndTime) + '</div>';
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
                    html += '                       <input type="text" id="layout-code" value="' + BookingDetail.value(response.TableNo) + '" />';
                    html += '                       <div class="origin">' + BookingDetail.value(response.TableNo) + '</div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '               <div id="number-guest" class="clearfix">';
                    html += '                   <div class="label">Number of guests</div>';
                    html += '                   <div class="value">';
                    html += '                       <input type="text" id="guest-no" value="' + BookingDetail.value(response.NumberGuest) + '" />';
                    html += '                       <div class="origin">' + BookingDetail.value(response.NumberGuest) + '</div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Name</div>';
                    html += '                   <div class="value">' + BookingDetail.value(response.Name) + '</div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Email</div>';
                    html += '                   <div class="value">' + BookingDetail.value(response.Email) + '</div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Mobile phone no</div>';
                    html += '                   <div class="value">' + BookingDetail.value(response.Phone) + '</div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Confirm</div>';
                    html += '                   <div id="is-confirmed" class="value input">';
                    html += '                       <input type="checkbox"' + (BookingDetail.value(response.IsConfirmed) == 1 ? ' checked="checked"' : '') + '/>';
                    html += '                       <div class="origin">' + BookingDetail.value(response.IsConfirmed) + '</div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '           </div>';
                    html += '           <div id="right-panel" class="clearfix">';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">iMyTable reservation</div>';
                    html += '                   <div class="value">';
                    html += '                       <div class="iMyTable-reservation' + (BookingDetail.value(response.iMyTable) == 1 ? ' on' : ' off') + '"></div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Comment</div>';
                    html += '               </div>';
                    html += '               <div class="input">';
                    html += '                   <textarea id="comments" rows="8" onfocus="BookingDetail.placeholder(true);" onblur="BookingDetail.placeholder(false);">' + BookingDetail.value(response.Comments) + '</textarea>';
                    html += '                   <div class="origin">' + BookingDetail.value(response.Comments) + '</div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Guest arrived on time</div>';
                    html += '                   <div class="value input">';
                    html += '                       <input type="checkbox" id="is-on-time" ' + (BookingDetail.value(response.GuestOnTime) == 1 ? ' checked="checked"' : '') + '/>';
                    html += '                       <div class="origin">' + BookingDetail.value(response.GuestOnTime) + '</div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Guest rating</div>';
                    html += '                   <div id="feedback" class="value input">';
                    html += RatingControl.html(BookingDetail.value(response.GuestRate));
                    html += '                   <div class="origin">' + BookingDetail.value(response.GuestRate) + '</div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '               <div class="clearfix">';
                    html += '                   <div class="label">Bill total amount</div>';
                    html += '                   <div class="value input">';
                    html += '                       <input type="text" id="bill-amount" value="' + BookingDetail.value(response.BillTotalAmount) + '" />';
                    html += '                       <div class="origin">' + BookingDetail.value(response.BillTotalAmount) + '</div>';
                    html += '                   </div>';
                    html += '               </div>';
                    html += '           </div>';
                    html += '       </div>';
                    html += '       <div role="buttons" class="clearfix">';
                    html += '           <form action="/Reservation/Edit" method="post" id="edit-reservation">';
                    html += '               <input type="hidden" name="BookingID" value="' + bookingID + '" />';
                    html += '           </form>';
                    html += '           <button type="button" class="image-button button-change-reservation" onclick="BookingDetail.confirmingClose(true);"></button>';
                    html += '           <button type="button" class="image-button button-cancel-reservation" onclick="BookingDetail.confirm(\'Cancel\',\'Cancel a Reservation\',\'Reason to cancel\',\'Cancel reason\');"></button>';
                    html += '           <button type="button" class="image-button button-block-guest" onclick="BookingDetail.confirm(\'BlockGuest\',\'Block Guest\',\'Reason to block\',\'Block reason\');"></button>';
                    html += '           <button type="button" class="image-button button-report-guest" onclick="BookingDetail.doAction(\'ReportGuestNoShow\');"></button>';
                    html += '           <button type="button" class="image-button button-reservation-history" onclick="BookingDetail.doAction(\'History\');"></button>';
                    html += '           <button type="button" class="image-button button-save-close" onclick="BookingDetail.doAction(\'SaveAndClose\');"></button>';
                    html += '       </div>';
                    html += '   </div>';
                    html += '</div>';

                    $('body').append(html);
                    $('body').append($('<div class="overlay lv-max black" for="booking-detail" />'));

                    // initialize scrollmobi
                    $('#booking-date input').scroller({
                        preset: 'date',
                        theme: Utils.mobiscrollTheme(),
                        display: 'modal',
                        mode: Utils.mobiscrollMode(),
                        dateFormat: 'D, d M yy',
                        dateOrder: 'D dMyy'
                    });

                    // set value
                    $('#booking-date input').scroller('setDate', Utils.convertDateFromJSON(response.BookingDate), true);

                    $('#booking-date .origin').html($('#booking-date input').val());

                    // set flag
                    $('#booking-detail-dialog').data('need-refresh', 0);
                    $('#booking-detail-dialog').data('is-cancel', 0);
                    $('#booking-detail-dialog').data('booking-id', bookingID);
                    $('#booking-detail-dialog').data('person-id', response.PersonID);
                    $('#booking-detail-dialog').data('start-time', response.StartTime);
                    $('#booking-detail-dialog').data('end-time', response.EndTime);
                    $('#booking-detail-dialog').data('need-close-callback', needCloseCallback ? 1 : 0);

                    // set value
                    $('#table-selector select').val(response.TableID);

                    $('#booking-date input').change(BookingDetail.updateSittingTime);

                    // set --:-- mask
                    $('#booking-start-time').setMask('time');

                    // validate & refine start time
                    $('#booking-start-time').change(BookingDetail.refineStartTime);

                    BookingDetail.displaySittingTime(response.BizHour, response.SittingType);

                    // handle events
                    RatingControl.start();

                    BookingDetail.dock();
                } else {
                    Utils.showError();
                }
            }
        });
    },
    placeholder: function (isFocus) {
        var comment = $('#comments').val();

        if (isFocus && comment == 'NEW - please review') {
            $('#comments').val('');
        }

        if (!isFocus && $.trim(comment).length == 0) {
            $('#comments').val('NEW - please review');
        }
    },
    refineStartTime: function () {
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
            var min = time.getMinutes();

            while (time.getMinutes() % 15 != 0) {
                time.setMinutes(time.getMinutes() - 1);
            }

            var hour = (100 + time.getHours()).toString().substr(1);
            var min = (100 + time.getMinutes()).toString().substr(1);

            $('#booking-start-time').val(hour + ':' + min);

            BookingDetail.refineEndTime();

            BookingDetail.updateSittingTime();

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
    },
    refineEndTime: function () {
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
    },
    updateSittingTime: function () {
        showProgressDialog('Getting sitting time');

        var bookingDate = $.datepicker.formatDate('yymmdd', $('#booking-date input').scroller('getDate'));

        $.ajax({
            type: 'post',
            url: 'Reservation/GetBizHour',
            data: {
                LocationID: BookingDetail.locationId,
                BookingDate: bookingDate,
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

                BookingDetail.displaySittingTime(response.BizHour, sittingType);
            }
        });
    },
    displaySittingTime: function (bizHour, sittingType) {
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
            $('#booking-detail-dialog').data('event-id', bizHour.EventID);

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

            $('#sitting-time-containment input').click(BookingDetail.refineEndTime);

            BookingDetail.refineEndTime();
        }

    },
    close: function (isForward) {
        if (isForward) {
            $('form#edit-reservation').submit();
        }

        if ($('#booking-detail-dialog').data('need-refresh') == 1) {
            // check report 
            if ($('#report-dialog').length > 0) {
                $('#report-dialog').data('need-refresh', 1);
                Filter.execute();
            } else {
                if (typeof summary != 'undefined') {
                    summary.load(true);
                }
            }
        }
        //        // always refresh
        //        submit(false);

        if ($('#booking-detail-dialog').data('need-close-callback') == 1) {
            if (typeof Chart != 'undefined') {
                Chart.removeHighLight();
            }
        }

        $('#booking-detail-dialog').remove();
        $('.overlay[for="booking-detail"]').remove();
    },
    dock: function () {
        //$('.overlay[for="booking-detail"]').height(0).width(0);
        $('#booking-detail-dialog').css({ top: 0, left: 0 });

        FlexibleLayout.adapt();

        if ($('#booking-detail-dialog').data('need-close-callback') == 1) {

            var chart = $('#summary-line');

            // get button-position
            var chartPos = chart.position();

            Utils.positioningDialog('#booking-detail-dialog', chartPos.top - 40, 'center');
        } else {
            Utils.positioningDialog('#booking-detail-dialog', 'center', 'center');
        }

        //$('.overlay[for="booking-detail"]').height(Utils.pageH()).width(Utils.pageW());
    },
    show: function () {
        $('#booking-detail-dialog').removeClass('hidden');
    },
    hide: function () {
        $('#booking-detail-dialog').addClass('hidden');
    },
    confirm: function (objName, title, desc, displayText) {
        var isCancel = $('#booking-detail-dialog').data('is-cancel') === '1';
        if (isCancel) {
            return false;
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
                    var input = $('.info-box input[type="text"]').val();
                    var id = $('.info-box input[type="text"]').attr('id');

                    BookingDetail.doAction(id, input);
                }
            }
        });

        return false;
    },
    doAction: function (id, input) {
        var obj = {
            textInput: input,
            bookingId: $('#booking-detail-dialog').data('booking-id')
        };

        switch (id) {
            case 'Cancel':
                $.ajax({
                    type: 'post',
                    url: '/Reservation/Cancel',
                    data: obj,
                    success: function (response) {
                        if (response.IsSucceed) {
                            $('#booking-detail-dialog').data('need-refresh', 1);
                            $('#booking-detail-dialog').data('is-cancel', 1);
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
            case 'BlockGuest':
                $.ajax({
                    type: 'post',
                    url: '/Reservation/BlockGuest',
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
            case 'ReportGuestNoShow':
                if ($('#booking-detail-dialog').data('is-cancel') == 1) {
                    return false;
                }

                $.ajax({
                    type: 'post',
                    url: '/Reservation/ReportGuestNoShow',
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
            case 'History':
                BookingHistory.open();

                break;
            case 'SaveAndClose':
                BookingDetail.save(false);

                break;
        }

        return false;
    },
    confirmingClose: function (isForward) {
        var hasChanges = false;

        if (BookingDetail.fullData) {
            // check change
            var inputs = $('#booking-detail-dialog .input');

            $.each(inputs, function (key, div) {
                var value = '';

                var origin = $.trim($(div).children('.origin').html());
                //alert(origin);
                if ($(div).children('input[type="text"]').length > 0) {
                    value = $.trim($(div).children('input[type="text"]').val());

                } else if ($(div).children('input[type="checkbox"]').length > 0) {
                    value = $(div).children('input[type="checkbox"]').attr('checked');
                    value = value == 'checked' ? 1 : 0;
                } else if ($(div).children('.rating').length > 0) {
                    var ratingControl = $(div).children('.rating');
                    value = RatingControl.value(ratingControl);
                } else if ($(div).children('select').length > 0) {
                    value = $('#table-selector select').val();
                } else if ($(div).children('textarea#comments').length > 0) {
                    value = $('textarea#comments').val();
                }

                // compare with original value
                if (value != origin) {
                    hasChanges = true;
                    return false;
                }
            });
        }

        if (hasChanges) {
            MessageBox.show({
                message: ["Do you want to save the changes you made?"],
                buttons: {
                    no: function () {
                        BookingDetail.close(isForward);
                    },
                    yes: function () {
                        BookingDetail.save(isForward);
                    }
                }
            });
        } else {
            BookingDetail.close(isForward);
        }
    },
    finallySave: function (tableId, isForward) {
        // get siting time
        var index = $('#sitting-time-containment input').index($('#sitting-time-containment input:checked'));

        var sittingTime = index == 0 ? 'short' : index == 1 ? 'normal' : 'long';

        // get is-on-time
        var isOnTime = $('input#is-on-time').attr('checked');
        isOnTime = isOnTime == 'checked' ? '1' : '0';

        // get is-confirmed
        var isConfirmed = $('#is-confirmed input').attr('checked');
        isConfirmed = isConfirmed == 'checked' ? '1' : '0';

        showProgressDialog("Saving reservation detail information");

        $.ajax({
            type: 'post',
            url: '/Reservation/Save',
            data: {
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
                EventID: $('#booking-detail-dialog').data('event-id')
            },
            complete: function () {
                hideProgressDialog();
            },
            success: function () {
                $('#booking-detail-dialog').data('need-refresh', 1);
                BookingDetail.close(isForward);
            }
        });
    },
    checkBeforeSave: function (tableId, isForward) {
        // check
        showProgressDialog('Checking table status');

        // get siting time
        var index = $('#sitting-time-containment input').index($('#sitting-time-containment input:checked'));

        var sittingTime = index == 0 ? 'short' : index == 1 ? 'normal' : 'long';

        $.ajax({
            type: 'post',
            url: '/Reservation/CheckBeforeSave',
            data: {
                LocationID: BookingDetail.locationId,
                BookingID: $('#booking-detail-dialog').data('booking-id'),
                TableID: tableId,
                BookingDate: $.datepicker.formatDate('yymmdd', $('#booking-date input').scroller('getDate')),
                StartTime: $('#booking-start-time').val(),
                SittingTime: sittingTime
            },
            complete: function () {
                hideProgressDialog();
            },
            success: function (response) {
                if (response.IsSucceed) {
                    if (response.Code == 1) {
                        var startTime = $.trim($('#booking-start-time').val());

                        var message = '';

                        if (startTime != response.StartTime) {
                            message = [
                            'The start time of the reservation has been changed to avoid overlapping and the time is now from ' + startTime + ' to ' + response.StartTime + '.',
                            'Click Yes to keep this new start time and No to cancel all changes that you’ve made.'
                        ];
                        } else {
                            message = ['Are you sure you want to make your change?'];
                        }

                        MessageBox.show({
                            message: message,
                            buttons: {
                                no: null,
                                yes: function () {
                                    // update start & end time
                                    $('#booking-start-time').val(response.StartTime);
                                    $('#booking-end-time').val(response.EndTime);

                                    BookingDetail.finallySave(tableId, isForward);
                                }
                            }
                        });

                        return;
                    } else if (response.Code == 2) {
                        MessageBox.show({
                            message: ['Invalid change as there is already a reservation on the selected table at the selected time! Please change the guest to a vacant table.'],
                            buttons: {
                                ok: null
                            }
                        });
                        return;
                    }
                }

                MessageBox.show({
                    message: ['Invalid change as the restaurant closed at the selected time!'],
                    buttons: {
                        ok: null
                    }
                });
            }
        });
    },
    save: function (isForward) {
        // validate total amount bill
        if (BookingDetail.validate()) {

            // call server to validate table no and guest
            showProgressDialog('Checking table');

            $.ajax({
                type: 'post',
                url: '/Reservation/GetTable',
                data: {
                    LocationID: BookingDetail.locationId,
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
                            var guestNo = $('#number-guest input').val();

                            if (guestNo > response.ChairNo) {
                                MessageBox.show({
                                    message: [
                                        'The table you have selected do not have enough chairs for the number of guests!',
                                        'Do you want to continue with this reservation?'
                                    ],
                                    buttons: {
                                        no: null,
                                        yes: function () {
                                            BookingDetail.checkBeforeSave(response.TableID, isForward);
                                        }
                                    }
                                });
                            } else {
                                BookingDetail.checkBeforeSave(response.TableID, isForward);
                            }
                        }
                    } else {
                        Utils.showError();
                    }
                }
            });
        }
    },
    validate: function () {
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
                message: ['Number of guests is invalid'],
                buttons: {
                    ok: function () {
                        $('#guest-no').focus();
                    }
                }
            });

            return false;
        }

        if ($('#sitting-time-containment').children().length == 0) {
            MessageBox.show({
                message: ['The restaurant is closed for the selected time! Please select another time.'],
                buttons: {
                    ok: null
                }
            });

            return false;
        }

        return true;
    }
};

var BookingHistory = {
    open: function () {
        BookingHistory.close();
        showProgressDialog('Loading history');

        $.ajax({
            type: 'post',
            url: '/Reservation/GetHistory',
            data: {
                personID: $('#booking-detail-dialog').data('person-id')
            },
            complete: function () {
                hideProgressDialog();
            },
            success: function (response) {
                // hide booking-detail-dialg
                BookingDetail.hide();

                // build dialog
                var html = '';
                html += '<div id="booking-history-dialog" class="popup-dialog lv-max detail-dialog">';
                html += '   <div role="body">';
                html += '       <div role="header">';
                html += '           <div class="clearfix">';
                html += '               <button class="image-button dialog-close" onclick="BookingHistory.close();"></button>';
                html += '           </div>';
                html += '           <div>Table reservation history of ' + response.Name + '</div>';
                html += '       </div>';
                html += '       <table cellpadding="1" border="0" cellspacing="1" id="header-table">';
                html += '           <thead>';
                html += '               <tr>';
                html += '                   <td width="100px">Date</td>';
                html += '                   <td width="100px">Time</td>';
                html += '                   <td width="85px">iMyTable Reservation</td>';
                html += '                   <td width="110px">Location</td>';
                html += '                   <td width="60px">Menu</td>';
                html += '                   <td width="50px">Table no.</td>';
                html += '                   <td width="60px">No. of Guest</td>';
                html += '                   <td width="60px">Arrived on time</td>';
                html += '                   <td width="100px">Guest Rating</td>';
                html += '                   <td>Bill Total Amount</td>';
                html += '               </tr>';
                html += '           </thead>';
                html += '       </table>';
                html += '       <div role="history">';
                html += '           <table cellpadding="1" border="0" cellspacing="1" id="body-table">';
                html += '               <tbody>';

                if (response.ResultData != null) {
                    for (var i = 0; i < response.ResultData.length; i++) {
                        var history = response.ResultData[i];

                        var localeText = Utils.convertDateFromJSON(history.BookingDate).toLocaleDateString();

                        html += '               <tr' + (i % 2 == 0 ? '' : ' class="highlight-row"') + '>';
                        html += '                   <td>' + localeText + '</td>';
                        html += '                   <td>';
                        html += '                       <div class="clearfix">';
                        html += '                           <div class="left">From </div>';
                        html += '                           <div class="right">' + history.StartTime + '</div>';
                        html += '                       </div>';
                        html += '                       <div class="clearfix">';
                        html += '                           <div class="left">To </div>';
                        html += '                           <div class="right">' + history.EndTime + '</div>';
                        html += '                       </div>';
                        html += '                   </td>';
                        html += '                   <td>';
                        html += '                       <div class="center-box iMyTable-reservation' + (history.iMyTableReserved == 1 ? ' on' : ' off') + '"></div>';
                        html += '                   </td>';
                        html += '                   <td>' + history.LocationName + '</td>';
                        html += '                   <td>' + history.MenuType + '</td>';
                        html += '                   <td>' + history.TableNo + '</td>';
                        html += '                   <td>' + history.NoOfGuests + '</td>';
                        html += '                   <td>' + (history.IsOnTime ? 'Yes' : 'No') + '</td>';
                        html += '                   <td>' + RatingControl.html(history.GuestRating) + '</td>';
                        html += '                   <td>' + history.BillAmount + '</td>';
                        html += '               </tr>';
                    }
                }
                html += '               </tbody>';
                html += '           </table>';
                html += '       </div>';
                html += '       <div style="height: 20px;"></div>';
                html += '   </div>';
                html += '</div>';

                $('body').append(html);

                Utils.touchScroll('#booking-history-dialog div[role="history"]');

                BookingHistory.dock();
            }
        });
    },
    close: function () {
        BookingDetail.show();
        $('#booking-history-dialog').remove();
    },
    dock: function () {
        if ($('#booking-detail-dialog').data('need-close-callback') == 1) {

            var chart = $('#summary-line');

            // get button-position
            var chartPos = chart.position();

            Utils.positioningDialog('#booking-history-dialog', chartPos.top - 40, 'center');
        } else {
            Utils.positioningDialog('#booking-history-dialog', 'center', 'center');
        }

        var count = $('#header-table thead tr').first().find('td').length - 1;

        for (var i = 0; i < count; i++) {
            var header = $($('#header-table thead tr').first().find('td')[i]);
            var body = $($('#body-table tbody tr').first().find('td')[i]);

            body.width(header.width());
        }

        //$('#header-table').width($('#body-table').width());
    }
};

var RatingControl = {
    html: function (value) {
        var html = '';

        html += '<div class="clearfix rating">';
        for (var star = 1; star < 6; star++) {
            html += '<div class="star ' + (star <= value ? 'on' : 'off') + '" rate-value="' + star + '"></div>';
        }
        html += '</div>';

        return html;
    },
    index: function (star) {
        return parseInt(star.attr('rate-value'));

    },
    start: function () {
        $('.detail-dialog .star').click(function () {
            var value = RatingControl.index($(this));

            var stars = $(this).parent().find('.star');

            for (var i = 0; i < 5; i++) {
                $(stars[i]).attr('class', (i < value) ? 'star on' : 'star off');
            }
        });

        $('detail-dialog .star').hover(function () {
            var index = RatingControl.index($(this));

            var stars = $(this).parent().find('.star');

            for (var i = 0; i < 5; i++) {
                $(stars[i]).addClass((i < index) ? 'selected' : 'unselected');
            }

        }, function () {
            $('.detail-dialog .star.selected').removeClass('selected');
            $('.detail-dialog .star.unselected').removeClass('unselected');
        });
    },
    value: function (control) {
        return control.find('.star.on').length;
    }
};

var TableGrapper = {
    html: function () {
        var html = '';

        var info = $('#table-ruler .table-info-div');

        $.each(info, function (key, value) {
            var layoutCode = $(value).find('.table-no').html();
            var tableId = $(value).find('#table-id').html();

            html += '<option value="' + tableId + '">' + layoutCode + '</option>';
        });

        return html;
    }
};

function toTime(minutes) {
    var h = minutes / 60;

    var m = minutes % 60;

    if (m < 10) {
        m = "0" + m;
    }

    return Math.floor(h) + ":" + m;
}