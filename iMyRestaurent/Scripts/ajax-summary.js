$(document).ready(function () {
    summary.initialize();
});

var summary = {
    body: $('.opacity-box'),
    model: {
        scrollLeft: 0,
        scrollTop: 0,
        zoom: 1,
        store: $('#model-data'),
        date: null,
        location: 0,
        root: null
    },
    data: null,
    inputs: {
        date: $('#date-picker'),
        location: $('#location-list'),
        refresher: $('#btn-refresh'),
        zoomIn: $('#btn-zoom-in'),
        zoomOut: $('#btn-zoom-out'),
        nextDate: $('#next-date'),
        prevDate: $('#previous-date'),
        nextLocation: $('#next-location'),
        prevLocation: $('#previous-location'),
        option: $('.button-options')
    },
    initialize: function () {
        // get model data
        var date = summary.model.store.attr('init-date');

        summary.model.scrollLeft = parseInt(summary.model.store.attr('scroll-left'));
        summary.model.scrollTop = parseInt(summary.model.store.attr('scroll-top'));
        summary.model.zoom = parseInt(summary.model.store.attr('zoom'));

        // init date
        summary.inputs.date.scroller({
            preset: 'date',
            theme: Utils.mobiscrollTheme(),
            display: 'modal',
            mode: Utils.mobiscrollMode(),
            dateFormat: 'D, d M yy',
            dateOrder: 'D dMyy'
        });

        if (date == null || date.length == 0) {
            summary.model.date = new Date();
        } else {
            summary.model.date = $.datepicker.parseDate('yymmdd', date);
        }

        summary.inputs.date.scroller('setDate', summary.model.date, true);

        summary.model.location = summary.model.store.attr('location');

        if (summary.model.location == 0) {
            summary.model.location = summary.inputs.location.val();
        } else {
            summary.inputs.location.val(summary.model.location);
        }

        // add event handler
        summary.handle();

        // query data
        summary.load(true);
    },
    handle: function () {
        summary.inputs.date.change(function () { summary.load(false); });
        summary.inputs.location.change(function () { summary.load(false); });
        summary.inputs.refresher.click(function () { summary.load(true); });

        // previous date
        summary.inputs.prevDate.click(function () {
            var date = summary.inputs.date.scroller('getDate');
            date.setDate(date.getDate() - 1);
            summary.inputs.date.scroller('setDate', date, true);
            summary.load(false);
        });

        // next date
        summary.inputs.nextDate.click(function () {
            var date = summary.inputs.date.scroller('getDate');
            date.setDate(date.getDate() + 1);
            summary.inputs.date.scroller('setDate', date, true);
            summary.load(false);
        });

        // previous location
        summary.inputs.prevLocation.click(function () {
            // get selected-index
            var selectedIndex = summary.inputs.location.prop('selectedIndex');

            // check boundary
            if (selectedIndex > 0) {
                summary.inputs.location.prop('selectedIndex', selectedIndex - 1);
                summary.load(false);
            }
        });

        $('#next-location').click(function () {
            // get selected-index
            var selectedIndex = summary.inputs.location.prop('selectedIndex');
            var max = summary.inputs.location.find('option').length;

            // check boundary
            if (selectedIndex < max - 1) {
                summary.inputs.location.prop('selectedIndex', selectedIndex + 1);
                summary.load(false);
            }
        });

        // setup
        ZoomControl.setup('#chart-area', 1, function () {
            Chart.adapt();
        });
        // assign zoom-in, zoom-out handle
        summary.inputs.zoomOut.click(function () {
            if (summary.data != null) {
                ZoomControl.zoomout('#zoom-scale');
                summary.model.store.attr('zoom', ZoomControl.currentScale);
                summary.model.store.attr('scroll-left', $('#adapt-div')[0].scrollLeft);
                summary.model.store.attr('scroll-top', $('#adapt-div')[0].scrollTop);
            }
        });

        summary.inputs.zoomIn.click(function () {
            if (summary.data != null) {
                ZoomControl.zoomin('#zoom-scale');
                summary.model.store.attr('zoom', ZoomControl.currentScale);
                summary.model.store.attr('scroll-left', $('#adapt-div')[0].scrollLeft);
                summary.model.store.attr('scroll-top', $('#adapt-div')[0].scrollTop);
            }
        });

        summary.inputs.option.click(function () {
            SummaryMenu.show();
        });
    },
    openMenu: function (target) {
        var eventId = $(target).attr('id');

        var date = summary.inputs.date.scroller('getDate');

        day = date.getDay() == 0 ? 6 : date.getDay() - 1;

        // SonTH fix bug #25. Need to stop page refresh when showing dialog
        summary.refresher.stop();
        var sittingId = $('div[sitting-id]').attr('sitting-id');
        var eventName = $(target).attr('event-name');
        openMyMenu1(eventId, day, sittingId, eventName, function () {
            summary.refresher.start();
        });
    },
    refresher: {
        interval: 5 * 60 * 1000, // 5 mins
        start: function () {
            summary.refresher.timer = setTimeout(function () { summary.load(true); }, summary.refresher.interval);
        },
        stop: function () {
            clearTimeout(summary.refresher.timer);
            summary.refresher.timer = null;
        },
        timer: null
    },
    toggleDisplay: function (button) {
        //alert($(button).attr('event-id'));
        var eventId = $(button).attr("event-id");
        $('.biz-hour-area[event-id="' + eventId + '"]').toggle('fade', {}, 200);
        $('.chart-element[event-id="' + eventId + '"]').toggle("fade", {}, 200);

        // change icon
        $(button).toggleClass('minus-icon');
        $(button).toggleClass('plus-icon');
    },
    load: function (always) {
        // get date
        var date = summary.inputs.date.scroller('getDate');

        // check change
        var notChanged = true;

        notChanged = date.getDate() == summary.model.date.getDate() && date.getMonth() == summary.model.date.getMonth() && date.getYear() == summary.model.date.getYear();

        if (!notChanged) {
            // set new value
            summary.model.date = date;
        }

        notChanged = notChanged && summary.model.location == summary.inputs.location.val();
        if (!notChanged) {
            summary.model.location = summary.inputs.location.val()
        }

        if (notChanged && !always) {
            // do nothing
        } else {
            showProgressDialog('Loading location data');

            $.ajax({
                type: 'post',
                url: url.getSummary,
                data: {
                    Date: $.datepicker.formatDate('yymmdd', summary.model.date),
                    LocationID: summary.model.location
                },
                complete: function () {
                    showAndHideProgressDialog('Restaurant location data loaded successfully!');
                },
                success: summary.update
            });
        }
    },
    update: function (data) {
        summary.body.empty();
        summary.data = data;
        //        summary.model.root = Utils.convertDateFromJSON(summary.data.BoundaryStartTime);
        //        summary.model.root = Utils.formatTime(summary.model.root);
        summary.model.root = summary.generator.parseTime(summary.data.RootTime + ':00');
        if (data.IsClose) {
            // show close mask
            summary.body.append($('<div />').attr('class', 'close-div -fl-ah').append($('<div >').html('CLOSED')));
            summary.data = null;
            summary.model.store.attr('scroll-top', 0).attr('scroll-left', 0);
        } else {
            // generate the reservation summary area
            summary.generator.reservationSummary.list();

            // generate the separate line
            summary.body.append($('<div />').attr('id', 'summary-line'));

            // generate chart area
            summary.generator.chart.create();

            // start chart control
            Chart.setup();

            setTimeout(function () {
                Chart.adapt();
                // restore zoom & scroll
                ZoomControl.update(summary.model.store.attr('zoom'));
                $('#adapt-div').scrollTop(summary.model.store.attr('scroll-top'));
                $('#adapt-div').scrollLeft(summary.model.store.attr('scroll-left'));
            }, 50);
        }

        FlexibleLayout.adapt();

        summary.refresher.start();

        // update forward-form
        $('input[name="SummaryLocationID"]').val(summary.model.location);
        $('input[name="SummaryDate"]').val($.datepicker.formatDate('yymmdd', summary.model.date));
    },
    generator: {
        chart: {
            create: function () {
                html = '';
                html += '<div id="adapt-div" class="-fl-ah">';
                html += '   <div id="chart-area">';
                html += '       <table id="summary-chart">';
                html += '           <tbody>';
                html += '               <tr>';
                html += '                   <td></td>';
                html += '                   <td>' + summary.generator.chart.timeRuler(true, 'top-time-ruler') + '</td>';
                html += '               </tr>';
                html += '               <tr>';
                html += '                   <td>' + summary.generator.chart.tableRuler('table-ruler') + '</td>';
                html += '                   <td id="chart-background">';

                if (summary.data.Summary.TableList != null) {
                    html += '                   <table>';
                    for (var i = 0; i < summary.data.Summary.TableList.length + 1; i++) {
                        var clazz = i == 0 ? 'first-row' : i % 2 == 1 ? 'even-row' : '';
                        html += '                   <tr class="' + clazz + '"><td></td></tr>';
                    }
                    html += '                       <tr><td></td></tr>';
                    html += '                   </table>';
                }
                html += '                   </td>';
                html += '               </tr>';
                html += '               <tr>';
                html += '                   <td></td>';
                html += '                   <td>';
                html += summary.generator.chart.timeRuler(false, 'bottom-time-ruler');
                html += '                   </td>';
                html += '               </tr>';
                html += '           </tbody>';
                html += '       </table>';
                html += '       <div id="chart-body" length="' + (summary.data.BlockNo + 1) + '">';
                html += '           <div>';
                // generate booking
                for (var i = 0; i < summary.data.Summary.BookingList.length; i++) {
                    html += summary.generator.chart.booking(summary.data.Summary.BookingList[i]);
                }
                // generate biz hour
                for (var i = 0; i < summary.data.Summary.BizHourList.length; i++) {
                    html += summary.generator.chart.bizhour(summary.data.Summary.BizHourList[i]);
                }
                // generate floating time ruler
                html += summary.generator.chart.timeRuler(true, 'float-time-ruler');
                // generate floating table ruler
                html += summary.generator.chart.tableRuler('float-table-ruler');
                html += '           </div>';
                html += '       </div>';
                html += '   </div>';
                html += '</div>';

                summary.body.append(html);
            },
            booking: function (data) {
                var html = '';

                // work with time
                var start = summary.generator.parseTime(data.BookingStartTime);
                var end = summary.generator.parseTime(data.BookingEndTime);

                if (end.getTime() < start.getTime()) {
                    end.setDate(end.getDate() + 1);
                }

                var sb = summary.generator.subtractTime(start, summary.model.root);
                var lb = summary.generator.subtractTime(end, start);

                // get biz hour info
                var shift = jLinq.from(summary.data.Summary.BizHourList).ignoreCase().startsWith('EventID', data.EventID).first();
                if (data.BookingStartTime < shift.Start_Time) {
                    return html;
                }

                // get table index
                var table = jLinq.from(summary.data.Summary.TableList).ignoreCase().startsWith('LayoutCode', data.TableNo).first();
                var index = $.inArray(table, summary.data.Summary.TableList);

                html += '<div class="chart-element" event-id="' + data.EventID + '" imytable="' + data.iMyTableReserved + '"';
                html += ' start-block="' + sb + '" length="' + lb + '" table-index="' + index + '" booking-id="' + data.BookingID + '"';
                html += ' number-of-guests="' + data.NoOfGuests + '">';
                html += '   <span class="chart-element-popup hidden"></span>';
                html += '   <div class="chart-text">' + data.FullName + '</div>';
                html += '   <div class="booking-detail"></div>';
                html += '</div>';

                return html;
            },
            bizhour: function (data) {
                var html = '';
                if (data.Start_Time == data.End_Time || data.State.toLowerCase() == 'closed') {
                    return html;
                }

                // convert time
                var start = summary.generator.parseTime(data.Start_Time);
                var end = summary.generator.parseTime(data.End_Time);
                var close = summary.generator.parseTime(data.KitchenClosedTime);
                var sb = summary.generator.subtractTime(start, summary.model.root);

                if (end.getTime() < start.getTime()) {
                    end.setDate(end.getDate() + 1);
                }

                var lb = summary.generator.subtractTime(end, start);

                if (close.getTime() < start.getTime()) {
                    close.setDate(close.getDate() + 1);
                }

                var ob = summary.generator.subtractTime(close, start);

                var startTime = summary.generator.extractTime(data.Start_Time);
                var endTime = summary.generator.extractTime(data.End_Time);
                var titleText = data.EventName + ' (' + startTime + ' - ' + endTime + ')';

                html += '<div class="biz-hour-area" event-id="' + data.EventID + '" start-block="' + sb + '" length="' + lb + '" opening-length="' + ob + '"';
                html += '   event-name="' + data.EventName + '" start-time="' + startTime + '" end-time="' + endTime + '">';
                html += '   <div class="title"><span>' + titleText + '</span></div>';
                html += '   <div>';
                html += '       <table>';
                html += '           <tr>';
                html += '               <td class="open"></td>';
                if (ob < lb) {
                    html += '           <td class="close"></td>';
                }
                html += '           </tr>';
                html += '       </table>';
                html += '   </div>';
                html += '   <div class="title" colspan="2"><span>' + titleText + '</span></div>';
                html += '</div>';
                return html;
            },
            timeRuler: function (isTop, id) {
                var html = '';
                html += '<table id="' + id + '">';
                html += '   <tbody>';
                if (isTop) {
                    html += '   <tr>';
                    for (var i = 0; i < summary.data.Milestones.length; i++) {
                        var milestone = summary.data.Milestones[i];
                        //var t = Utils.convertDateFromJSON(milestone.Value);
                        html += '   <td colspan="' + milestone.Block + '"></td>';
                        html += '   <td colspan="4">' + milestone.Value + '</td>';
                    }
                    html += '   </tr>';
                }
                html += '       <tr class="ruler">';
                for (var i = 0; i < summary.data.BlockNo + 1; i++) {
                    var t = new Date(summary.model.root.getTime() + i * (15 * 60 * 1000));
                    var clazz = (i < summary.data.BlockNo) ? (t.getMinutes() == 0 ? 'hour' : 'minute') : '';
                    html += '<td class="' + clazz + '"></td>';
                }
                html += '       </tr>';
                if (!isTop) {
                    html += '   <tr>';
                    for (var i = 0; i < summary.data.Milestones.length; i++) {
                        var milestone = summary.data.Milestones[i];
                        //var t = Utils.convertDateFromJSON(milestone.Value);
                        html += '   <td colspan="' + milestone.Block + '"></td>';
                        html += '   <td colspan="4">' + milestone.Value + '</td>';
                    }
                    html += '   </tr>';
                }
                html += '   </tbody>';
                html += '</table>';

                return html;
            },
            tableRuler: function (id) {
                var html = '';
                html += '<table id="' + id + '">';
                html += '   <tbody>';
                html += '       <tr id="tabler-ruler-header">';
                html += '           <td><span>Table#</span></td>';
                html += '           <td><span>Chair#</span></td>';
                html += '       </tr>';

                for (var i = 0; i < summary.data.Summary.TableList.length; i++) {
                    var table = summary.data.Summary.TableList[i];
                    html += '   <tr class="' + (i % 2 == 1 ? 'table-ruler-info' : 'table-ruler-info even-row') + '" table-id="' + table.TableID + '">';
                    html += '       <td><span class="layout-code">' + table.LayoutCode + '</span></td>';
                    html += '       <td><span class="table-size">' + table.NoOfChairs + '</span></td>';
                    html += '   </tr>';
                }
                html += '       <tr>';
                html += '           <td colspan="2">&nbsp</td>';
                html += '       </tr>';
                html += '   </tbody>';
                html += '</table>';

                return html;
            }
        },
        subtractTime: function (d1, d2) {
            return Math.round((d1.getTime() - d2.getTime()) / 1000 / 60 / 15);
        },
        parseTime: function (str) {
            var e = str.split(':');
            var time = new Date();
            time.setHours(parseInt(e[0], 10));
            time.setMinutes(parseInt(e[1], 10));
            time.setSeconds(parseInt(e[2], 10));

            return time;
        },
        extractTime: function (str) {
            return str.substr(0, 5);
        },
        reservationSummary: {
            list: function () {
                var summaryArea = $('<div />').css('text-align', 'center');

                for (var i = 0; i < summary.data.Summary.BizHourList.length; i++) {
                    summaryArea.append(summary.generator.reservationSummary.create(summary.data.Summary.BizHourList[i]));
                }

                summary.body.append(summaryArea);
            },
            create: function (shift) {
                var html = '';

                if (shift.Start_Time == shift.End_Time || shift.State.toLowerCase() == 'closed') {
                    return html;
                } else {
                    // convert time
                    var start = summary.generator.extractTime(shift.Start_Time);
                    var end = summary.generator.extractTime(shift.End_Time);

                    // get reservation summary
                    var sum = jLinq.from(summary.data.Summary.ReservationSummaryList).ignoreCase().startsWith('EventID', shift.EventID).first();

                    html += '<table border="0" style="display: inline-table; text-align: left;" cellpadding="0" cellspacing="0">';
                    html += '   <thead>';
                    html += '       <tr>';
                    html += '           <td colspan="2">';
                    html += '               <div class="business-hour-header yellow-bg" id="' + shift.EventID + '" sitting-id="' + shift.SittingID + '" event-name="' + shift.EventName + '" onclick="summary.openMenu(this)">';
                    html += '                   <span>' + shift.EventName + ' (' + start + ' - ' + end + ')</span>';
                    html += '               </div>';
                    html += '           </td>';
                    html += '           <td align="center">';
                    html += '               <div class="summary-button minus-icon" event-id="' + shift.EventID + '" onclick="summary.toggleDisplay(this);"></div>';
                    html += '           </td>';
                    html += '       </tr>';
                    html += '   </thead>';
                    html += '   <tbody>';
                    html += '       <tr>';
                    html += '           <td colspan="2">Reserved tables</td>';
                    html += '           <td align="center">' + (sum == null ? 0 : sum.TotalBookings) + '</td>';
                    html += '       </tr>';
                    html += '       <tr>';
                    html += '           <td colspan="2">Number of guests</td>';
                    html += '           <td align="center">' + (sum == null ? 0 : sum.TotalNoGuests) + '</td>';
                    html += '       </tr>';
                    html += '       <tr>';
                    html += '           <td>iMyTable Reservations</td>';
                    html += '           <td class="imytable-icon"></td>';
                    html += '           <td align="center">' + (sum == null ? 0 : sum.iMyTableBookings) + '</td>';
                    html += '       </tr>';
                    html += '   </tbody>';
                    html += '</table>';

                    return html;
                }
            }
        }
    }
};