$(document).ready(function () {
    setInterval(function () {
        $.ajax({
            type: 'post',
            url: '/Report/Notification',
            data: {
                LocationID: Report.getLocationId()
            },
            success: function (response) {
                if (response.IsSucceed) {
                    var count = response.Notification;

                    if (count > 0) {
                        $('#new-booking-notifier').removeAttr('class');
                        $('#new-booking-notifier').html(count);
                    } else {
                        $('#new-booking-notifier').attr('class', 'off');
                    }
                }
            }
        });
    }, 5000);
});

Report = {
    open: function () {
        showProgressDialog('Opening report dialog');

        $.ajax({
            type: 'post',
            data: {
                LocationID: Report.getLocationId()
            },
            url: '/BusinessHours/GetMenuList',
            complete: function () {
                //hideProgressDialog();
            },
            success: function (response) {
                if (typeof summary !== "undefined") {
                    summary.refresher.stop();
                }

                var html = '';

                html += '<div id="report-dialog" class="popup-dialog lv4 detail-dialog">';
                html += '   <div role="body">';
                html += '       <div role="header">';
                html += '           <div class="clearfix">';
                html += '               <button type="button" class="image-button dialog-close" onclick="Report.close();"></button>';
                html += '           </div>';
                html += '           <div class="clearfix">';
                html += '               <button type="button" id="filter-button" class="image-button" onclick="Filter.toggle();"></button>';
                html += '               <div>iMyRestaurant - Reservation report for ' + Report.getLocationName() + '</div>';
                html += '           </div>';
                html += '       </div>';
                html += '       <div role="filter" class="clearfix" style="height: 0px;">';
                html += '           <table>';
                html += '               <tr>';
                html += '                   <td>Date reservation was made/ changed</td>';
                html += '                   <td>iMyTable reservations</td>';
                html += '                   <td>Date of reservation</td>';
                html += '                   <td>Menu type</td>';
                html += '                   <td>New</td>';
                html += '                   <td>Confirmed</td>';
                html += '                   <td>Reset filters</td>';
                html += '                   <td></td>';
                html += '               </tr>';
                html += '               <tr>';
                html += '                   <td>';
                html += '                       <select id="modified-date-filter">';
                html += '                           <option value="-1">All</option>';
                html += '                           <option value="-2d">Last 2 days</option>';
                html += '                           <option value="-7d">Last 7 days</option>';
                html += '                           <option value="-14d">Last 14 days</option>';
                html += '                           <option value="-1m">Last month</option>';
                html += '                           <option value="-2m">Last 2 months</option>';
                html += '                           <option value="-3m">Last 3 months</option>';
                html += '                           <option value="-6m">Last 6 months</option>';
                html += '                           <option value="-1y">Last year</option>';
                html += '                           <option value="-2y">Last 2 years</option>';
                html += '                       </select>';
                html += '                   </td>';
                html += '                   <td>';
                html += '                       <select id="iMyTable-filter">';
                html += '                           <option value="-1">All</option>';
                html += '                           <option value="1">Yes</option>';
                html += '                           <option value="0">No</option>';
                html += '                       </select>';
                html += '                   </td>';
                html += '                   <td>';
                html += '                       <select id="reservation-date-filter">';
                html += '                           <option value="-1">All</option>';
                html += '                           <option value="+2d">Next 2 days</option>';
                html += '                           <option value="+7d">Next 7 days</option>';
                html += '                           <option value="+14d">Next 14 days</option>';
                html += '                           <option value="+1m">Next month</option>';
                html += '                           <option value="+2m">Next 2 months</option>';
                html += '                           <option value="+3m">Next 3 months</option>';
                html += '                           <option value="+6m">Next 6 months</option>';
                html += '                           <option value="+1y">Next year</option>';
                html += '                           <option value="+2y">Next 2 years</option>';
                html += '                           <option value="-2d">Last 2 days</option>';
                html += '                           <option value="-7d">Last 7 days</option>';
                html += '                           <option value="-14d">Last 14 days</option>';
                html += '                           <option value="-1m">Last month</option>';
                html += '                           <option value="-2m">Last 2 months</option>';
                html += '                           <option value="-3m">Last 3 months</option>';
                html += '                           <option value="-6m">Last 6 months</option>';
                html += '                           <option value="-1y">Last year</option>';
                html += '                           <option value="-2y">Last 2 years</option>';
                html += '                       </select>';
                html += '                   </td>';
                html += '                   <td>';
                html += '                       <select id="menu-type-filter">';
                html += '                           <option value="-1">All</option>';

                if (response.Menus != null) {
                    for (var i = 0; i < response.Menus.length; i++) {
                        var eventName = response.Menus[i].EventName;
                        var eventId = response.Menus[i].SittingID;
                        html += '                       <option value="' + eventId + '">' + eventName + '</option>';

                    }
                }

                html += '                       </select>';
                html += '                   </td>';
                html += '                   <td>';
                html += '                       <select id="is-new-filter">';
                html += '                           <option value="-1">All</option>';
                html += '                           <option value="1">Yes</option>';
                html += '                           <option value="0">No</option>';
                html += '                       </select>';
                html += '                   </td>';
                html += '                   <td>';
                html += '                       <select id="is-confirmed-filter">';
                html += '                           <option value="-1">All</option>';
                html += '                           <option value="1">Yes</option>';
                html += '                           <option value="0">No</option>';
                html += '                       </select>';
                html += '                   </td>';
                html += '                   <td>';
                html += '                       <button type="button" class="image-button" onclick="Filter.reset();">Clear all</button>';
                html += '                   </td>';
                html += '                   <td>';
                html += '                       <button type="button" class="image-button" onclick="Filter.execute(true);">Display report</button>';
                html += '                   </td>';
                html += '               </tr>';
                html += '           </table>';
                html += '       </div>';
                html += '       <div role="table-containment">';
                html += '           <table role="header" cellpadding="1" border="0" cellspacing="1">';
                html += '               <thead>';
                html += '                   <tr id="group-header">';
                html += '                       <td>Reservation was made on/ changed on</td>';
                html += '                       <td colspan="6">Reservation was made by iMyTable app/ or by restaurant for guest</td>';
                html += '                       <td colspan="12">Reservation detail</td>';
                html += '                   </tr>';
                html += '                   <tr id="item-header">';
                html += '                       <td style="width: 65px;">Date</td>';
                html += '                       <td style="width: 35px;">iMyTable</td>';
                html += '                       <td style="width: 25px;">New guest</td>';
                html += '                       <td style="width: 80px;">Name of guest</td>';
                html += '                       <td style="width: 130px;">Email</td>';
                html += '                       <td style="width: 60px;">Phone no</td>';
                html += '                       <td style="width: 110px;">Location of iMyTable app when reservation was made</td>';
                html += '                       <td style="width: 40px;">Date</td>';
                html += '                       <td style="width: 25px;">Start time</td>';
                html += '                       <td style="width: 30px;">Sitting time</td>';
                html += '                       <td style="width: 30px;">Menu</td>';
                html += '                       <td style="width: 25px;">Table no.</td>';
                html += '                       <td style="width: 30px;">Chairs</td>';
                html += '                       <td style="width: 30px;">No. of guests</td>';
                html += '                       <td style="width: 80px;">Comments</td>';
                html += '                       <td style="width: 45px;">Confirmed</td>';
                html += '                       <td style="width: 40px;">Bill amount</td>';
                html += '                       <td style="width: 30px;">Guest rating</td>';
                html += '                       <td>Arrived on time</td>';
                html += '                   </tr>';
                html += '               </thead>';
                html += '           </table>';
                html += '           <div role="info">';
                html += '               <table cellpadding="1" border="0" cellspacing="1">';
                html += '                   <tbody>';
                html += '                   </tbody>';
                html += '               </table>';
                html += '           </div>';
                html += '       </div>';
                html += '   </div>';
                html += '</div>';

                $('body').append(html);
                $('body').append($('<div class="overlay lv4 black" for="report-dialog" />'));

                Report.dock();

                // set default filter
                $('#iMyTable-filter, #is-new-filter').val(1);

                // set default flag
                $('#report-dialog').data('need-refresh', 0);

                // filter 
                Filter.execute(false);
            }
        });
    },
    close: function () {
        if ($('#report-dialog').data('need-refresh') == 1) {
            if (typeof summary != 'undefined') {
                summary.load(true);
            }
        }

        $('#report-dialog').remove();
        $('.overlay[for="report-dialog"]').remove();

        if (typeof summary !== "undefined") {
            summary.refresher.start();
        }


    },
    dock: function () {
        //$('.overlay[for="report-dialog"], .overlay[for="booking-detail"]').height(0).width(0);
        $('#report-dialog, #booking-history-dialog, #booking-detail-dialog').css({ top: 0, left: 0 });
        FlexibleLayout.adapt();
        Utils.positioningDialog('#report-dialog', 'center', 'center');
        //$('.overlay[for="report-dialog"]').height(Utils.pageH()).width(Utils.pageW());
    },
    resizeTable: function () {
        var headers = $('#report-dialog table[role="header"] tr#item-header').find('td');

        var count = headers.length - 1;

        for (var i = 0; i < count; i++) {
            var header = $(headers[i]);
            var body = $($('#report-dialog div[role="info"] table tr').first().find('td')[i]);

            body.width(header.width());
        }

        //$('#report-dialog table[role="header"]').width($('#report-dialog div[role="info"] table').width());
    },
    getLocationId: function () {
        if ($('#SummaryLocationID').length > 0) {
            return $('#SummaryLocationID').val();
        } else {
            return $('input[name="LocationID"]').val();
        }
    },
    getLocationName: function () {
        if ($('#location-list').length > 0) {
            return $('#location-list option:selected').html();
        } else {
            return $('#hidden-location-name').html();
        }
    }
};

var Filter = {
    inProgress: false,
    toggle: function () {
        if (Filter.inProgress) {
            // do nothing
        } else {
            var filter = $('#report-dialog div[role="filter"]')

            var height = filter.height();
            var target = 0;
            if (height > 0) {
                // hide
                target = 0;
            } else {
                // show
                target = 55;
            }

            Filter.inProgress = true;

            filter.animate({
                height: target
            }, 500, function () {
                Filter.inProgress = false;
            });
        }
    },
    reset: function () {
        $('#report-dialog div[role="filter"] select').val(-1);
    },
    execute: function (needToggle) {
        if (needToggle) {
            Filter.toggle();
        }

        showProgressDialog('Generating report');

        // remove all old data
        $('#report-dialog div[role="info"] table tbody').empty();

        $.ajax({
            type: 'post',
            data: {
                LocationID: Report.getLocationId(),
                ModifiedDateOption: $('#modified-date-filter').val(),
                BookingDateOption: $('#reservation-date-filter').val(),
                IsiMyTable: $('#iMyTable-filter').val(),
                MenuTypeID: $('#menu-type-filter').val(),
                IsNew: $('#is-new-filter').val(),
                IsConfirmed: $('#is-confirmed-filter').val()
            },
            url: '/Report/Filter',
            complete: function () {
                hideProgressDialog();
            },
            success: function (response) {
                if (response.IsSucceed) {
                    if (response.Data != null) {
                        var html = '';
                        for (var i = 0; i < response.Data.length; i++) {
                            var e = response.Data[i];
                            var clazz = '';
                            if (i % 2 == 1) clazz += 'event-row';
                            if (e.Comments == 'NEW - please review') clazz += ' highlight';
                            html += '<tr' + (clazz.length == 0 ? '' : ' class="' + clazz + '"') + ' onclick="BookingDetail.open(' + e.BookingID + ', false);">';
                            html += '   <td>' + e.ModifiedDateText + '</td>';
                            html += '   <td class="highlight">' + (e.IsByEmail == 1 ? 'Email' : (e.iMyTableReserved == 1 ? 'Yes' : 'No')) + '</td>';
                            html += '   <td>' + (e.IsNewGuest == 1 ? 'Yes' : 'No') + '</td>';
                            html += '   <td class="text-left"><div>' + e.FullName + '</div></td>';
                            html += '   <td class="text-left"><div>' + e.Email + '</div></td>';
                            html += '   <td class="text-right">' + e.PhoneNumber + '</td>';
                            html += '   <td class="text-left"><div>' + e.LocationOfiMyTableApp + '</div></td>';
                            html += '   <td>' + e.BookingDateText + '</td>';
                            html += '   <td>' + e.BookingStartTime.substring(0, e.BookingStartTime.length - 3) + '</td>';
                            html += '   <td>' + e.SittingTimeText + '</td>';
                            html += '   <td>' + e.Menu + '</td>';
                            html += '   <td>' + e.TableNo + '</td>';
                            html += '   <td>' + e.Chairs + '</td>';
                            html += '   <td>' + e.NoOfGuests + '</td>';
                            html += '   <td class="text-left highlight">';
                            html += '       <div>' + e.Comments + '</div>';
                            html += '   </td>';
                            html += '   <td>' + (e.IsConfirmed == 1 ? 'Yes' : 'No') + '</td>';
                            html += '   <td>' + (e.BillAmount > 0 ? e.BillAmount.substring(0, e.BillAmount.length - 2) : '') + '</td>';
                            html += '   <td>' + e.GuestRating + '</td>';
                            html += '   <td>' + (e.IsOntime == 1 ? 'Yes' : 'No') + '</td>';
                            html += '</tr>';
                        }

                        $('#report-dialog div[role="info"] table tbody').append(html);

                        Report.resizeTable();

                        Utils.touchScroll('#report-dialog div[role="info"]');
                    }
                } else {
                    Utils.showError();
                }

            }
        });
    }
};