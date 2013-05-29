var Chart = {
    time: null,
    isInitialed: false,
    body: function () {
        return $('#chart-body');
    },
    root: function () {
        return Chart.body().offset();
    },
    length: function () {
        return Chart.body().width();
    },
    blockW: function () {
        return Chart.length() / parseFloat(Chart.body().attr('length'));
    },
    blockH: function () {
        return $('.table-ruler-info:first').height();
    },
    pos: function (element) {
        //var position = element.position();
        var position = d.lib.offset(element, Chart.body());

        var block = (position.left + 1) / Chart.blockW() - 1;
        var index = Math.round(position.top / Chart.blockH()) - 1;
        var layoutCode = $($('.table-ruler-info')[index]).find('.layout-code').html();

        return { block: block, index: index, layoutCode: layoutCode };
    },
    adapt: function () {
        if (Chart.isInitialed) {
            this.alignPosition();
            this.alignAllElements(false);
            this.alignBizHours();
        }
    },
    alignAllElements: function (useAnimation) {
        $.each($('.chart-element'), function (index, value) {
            Chart.alignElement($(value), useAnimation);
        });
    },
    alignElement: function (element, useAnimation) {
        // get information
        var tableIndex = parseFloat(element.attr('table-index')) + 1;
        var sBlock = parseFloat(element.attr('start-block'));
        var length = parseFloat(element.attr('length'));

        var width = Math.round(length * Chart.blockW() - 1);

        var dPosition = { top: tableIndex * Chart.blockH() + 0.5, left: (sBlock + 1) * Chart.blockW() - 1 };
        if (useAnimation) {
            element.animate({
                top: dPosition.top,
                left: dPosition.left,
                width: width
            }, 1000);
        } else {
            element.css({ top: dPosition.top, left: dPosition.left }).width(width);
        }
    },
    alignBizHours: function () {
        $.each($('.biz-hour-area'), function (index, value) {
            var startBlock = parseFloat($(value).attr('start-block'));
            var length = parseFloat($(value).attr('length'));
            var openingLength = parseFloat($(value).attr('opening-length'));

            if (openingLength > length) openingLength = length;

            var timeRulerH = $('#top-time-ruler').height();

            // set height
            $(this).find('.open').height(Chart.body().height() + (timeRulerH + 10) * 2);

            // set width
            $(this).width(Math.round(length * Chart.blockW() + 2));
            if ($(this).find('.close').length > 0) {
                $(this).find('.open').width(Math.round(openingLength * Chart.blockW()));
            }

            $(this).css({
                'top': -(timeRulerH + $(this).find('.title').height() + 10),
                'left': Math.round((startBlock + 1) * Chart.blockW() - 1) // -1 = border-width
            });
        });
    },
    alignPosition: function () {
        var cell = $('#chart-background');

        var offset = d.lib.offset(cell, '#chart-area');

        Chart.body().width(Math.round(cell.outerWidth()) - 1)
            .height(Math.round(cell.outerHeight()) - 1)
            .css({ top: offset.top, left: offset.left });
    },
    focus: function (y) {
        // get table-index
        var height = $('#tabler-ruler-header').height();
        height = $('#table-ruler .table-ruler-info').height();

        var index = Math.floor(y / height) - 1;

        var max = $('#table-ruler .table-ruler-info').length - 1;
        var min = 0;

        if (min <= index && index <= max) {
            // get time
            var rulerW = $('#table-ruler').outerWidth();
            var width = Chart.body().outerWidth() + rulerW;
            var additionWidth = 1;
            var additionHeight = 1;
            var focusLine = $('<div />').attr('id', 'focus-line').attr('table-index', index).css({
                top: (index + 1) * height - additionHeight,
                left: -rulerW,
                width: Chart.body().width() + rulerW + additionWidth,
                height: height + additionHeight
            });
            $('#focus-line').remove();
            $('#chart-body > div').append(focusLine);

            focusLine.click(function (e) {
                // reset auto hide timeout
                var offset = d.lib.offsetToElement(e, $('#chart-body > div'));

                if (offset.left > 0) {
                    var totalBlocks = parseInt(Chart.body().attr('length'), 10);
                    var block = (offset.left / Chart.length()) * totalBlocks;

                    var addTick = Math.round(((parseFloat(block - 1) * 15) * 60 * 1000));
                    // get time
                    var time = new Date(Chart.time.getTime() + addTick);
                    time = Utils.nearTimeSlot(time);
                    var hour = (time.getHours() + 100).toString().substr(1);
                    var min = (time.getMinutes() + 100).toString().substr(1);
                    var second = (time.getSeconds() + 100).toString().substr(1);
                    var timeText = format(['{0}:{1}:{2}', hour, min, second]);

                    // get table
                    var index = $('#focus-line').attr('table-index');
                    var table = $($('#table-ruler .table-ruler-info')[index]);
                    var position = {
                        id: table.attr('table-id'),
                        layout: table.find('.layout-code').html(),
                        chairs: table.find('.table-size').html()
                    };

                    // get event
                    var event = null;

                    $.each($('.biz-hour-area'), function (key, value) {
                        value = $(value);
                        var start = parseInt(value.attr('start-block'), 10);
                        var length = parseInt(value.attr('opening-length'), 10);

                        if (start <= block && block <= start + length + 1) {
                            event = value;
                            return false;
                        }
                    });

                    if (event != null) {
                        event = {
                            id: event.attr('event-id'),
                            name: event.attr('event-name'),
                            start: event.attr('start-time'),
                            end: event.attr('end-time')
                        };

                        // open simple reservation form
                        $('#focus-line').remove();
                        ReservationForm.open(position, event, hour + ':' + min);
                    }
                }
            });

            // auto hide focus-line
            Chart.autoHideFocus(focusLine);
        }
    },
    autoHideFocus: function (focusLine) {
        focusLine = $(focusLine);
        clearTimeout(Chart.clearFocus);
        Chart.clearFocus = setTimeout(function () {
            focusLine.unbind();
            focusLine.fadeOut('slow', function () {
                focusLine.remove();
            });
        }, 5000);
    },
    clearFocus: null,
    setup: function () {
        Chart.isInitialed = true;

        Chart.time = summary.model.root;

        // LongLH 30/10: add feature 'Create booking by click on chart'
        $('#chart-body > div').click(function (e) {
            var target = $(e.target);
            var checkHandler = target.is('#focus-line') || target.is('.chart-element') || target.parents('.chart-element').length > 0;
            if (!checkHandler) {
                // highlight clicked line
                var offset = d.lib.offsetToElement(e, this);

                Chart.focus(offset.top);
            }
        });

        dDragController.init({
            restricted: true,
            restrictTop: 20,
            restrictLeft: 0,
            restrictBottom: 20,
            drag: function (element) {
                var pos = Chart.pos(element);

                // highlight table
                $('.table-ruler-info.highlight').removeClass('highlight');
                $($('.table-ruler-info')[pos.index]).addClass('highlight');

                // calculate adding time
                var addTick = Math.round(((parseFloat(pos.block) * 15) * 60 * 1000));
                // get time
                var time = new Date(Chart.time.getTime() + addTick);

                var hour = (time.getHours() + 100).toString().substr(1);
                var min = (time.getMinutes() + 100).toString().substr(1);
                var second = (time.getSeconds() + 100).toString().substr(1);
                var timeText = format(['{0}:{1}:{2}', hour, min, second]);
                element.children('.chart-element-popup').text(format(['{0} - {1}', timeText, pos.layoutCode]));
            },
            dragstart: function (element) {
                flags.canTouchScroll = false;

                //drag.scrolls($('#adapt-div'));
                element.css({
                    'cursor': 'move',
                    'z-index': 5
                });

                element.children('.chart-element-popup').show();
            },
            dragend: function (element) {
                flags.canTouchScroll = true;
                element.css({
                    'cursor': 'pointer',
                    'z-index': 4
                });

                element.children('.chart-element-popup').hide();
                $('.table-ruler-info.highlight').removeClass('highlight');

                // fire event 'drop'
                element.trigger('cdrop');
            },
            container: Chart.body(),
            scrollableContainer: '#adapt-div',
            target: '.chart-element',
            initPos: Chart.pos
        });

        $('.chart-element').bind('rollback', function () {
            Chart.alignElement($(this), true);
        });

        // drop
        $('.chart-element').bind('cdrop', function () {
            var element = $(this);

            // get booking info
            var pos = Chart.pos(element);
            var eventId = element.attr('event-id');
            var bookingId = element.attr('booking-id');
            var length = parseFloat(element.attr('length'));
            var numberOfGuests = parseFloat(element.attr('number-of-guests'));

            // get biz-hour info
            var bizHour = $('.biz-hour-area[event-id="' + eventId + '"]');
            var bizHourStartBlock = parseFloat(bizHour.attr('start-block'));
            var bizHourLength = parseFloat(bizHour.attr('length'));
            var bizHourOpeningLength = parseFloat(bizHour.attr('opening-length'));

            // check new position is outside of the biz hour
            if (pos.block >= bizHourStartBlock + bizHourOpeningLength - 0.01 ||
                pos.block >= bizHourStartBlock + bizHourLength - 0.01 ||
                pos.block < bizHourStartBlock ||
                pos.block + length > bizHourStartBlock + bizHourLength) {
                element.trigger('rollback');
                return;
            }

            // get table info
            var table = $($('.table-ruler-info')[pos.index]);
            var tableSize = parseFloat(table.find('.table-size').text());
            var tableId = table.attr('table-id');

            // check size
            if (numberOfGuests > tableSize) {
                // confirm
                // SonTH fix bug #25. Stop timer before dialog is shown
                summary.refresher.stop();
                MessageBox.show({
                    message: [
                            "The table you have selected do not have enough chairs for the number of guests!",
                            "Do you want to continue with this move?"
                        ],
                    buttons: {
                        no: function () {
                            // SonTH fix bug #25. Start timer again when dialog is closed
                            summary.refresher.start();
                            element.trigger('rollback');
                        },
                        yes: function () {
                            // SonTH. Because of ability to show message box again in function below, so need to start timer first
                            summary.refresher.start();
                            Chart.updateBooking(element, bookingId, eventId, tableId, pos, length, numberOfGuests, tableSize);
                        }
                    }
                });
            } else {
                Chart.updateBooking(element, bookingId, eventId, tableId, pos, length, numberOfGuests, tableSize);
            }
        });

        // open booking detail
        $('.chart-element .booking-detail, .chart-element').bind('mousedown touchstart', function (e) {
            // prevent drag
            e.stopPropagation();
        });

        $('.chart-element .booking-detail').click(function (e) {
            // do not trigger parent click event
            e.stopPropagation();

            var element = $(this).parent();

            element.trigger('highlight');

            BookingDetail.open(element.attr('booking-id'), true);
        });

        $('.chart-element').bind('highlight', function () {
            summary.refresher.stop();

            // get booking
            var tableIndex = $(this).attr('table-index');
            var eventId = $(this).attr('event-id');

            // highlight datepicker, dropdownlist & biz-hour
            $('#date-picker').addClass('input-highlighted');
            $('#location-list').addClass('input-highlighted');
            $('.business-hour-header#' + eventId).addClass('input-highlighted');
            $('.business-hour-header#' + eventId).removeClass('yellow-bg');

            // highlight table-ruler
            $($('.table-ruler-info')[tableIndex]).addClass('ruler-highlighted');
        });

        $('#chart-body').click(function () {
            //alert("avx");
            //Chart.toggleFloatRulers();
        });

        // if scroll, store current scroll position & hide floating-ruler
        $('#adapt-div').scroll(function () {
            summary.model.store.attr('scroll-left', this.scrollLeft);
            summary.model.store.attr('scroll-top', this.scrollTop);
            Chart.toggleFloatRulers();
        });
    },
    removeHighLight: function () {
        summary.refresher.start();

        $(".business-hour-header.input-highlighted").addClass('yellow-bg');
        $('.input-highlighted').removeClass('input-highlighted');
        $('.ruler-highlighted').removeClass('ruler-highlighted');
    },
    toggleFloatRulers: function () {
        // show time-ruler
        var scrollTop = $('#adapt-div').scrollTop() / ZoomControl.currentScale;
        var pos = Chart.body().position();

        if (scrollTop > pos.top) {
            $('#float-time-ruler').show();
            $('#float-time-ruler').css('top', scrollTop - pos.top);
        } else {
            $('#float-time-ruler').hide();
        }

        var scrollLeft = $('#adapt-div').scrollLeft() / ZoomControl.currentScale;
        if (scrollLeft > pos.left) {
            // show table-ruler
            $('#float-table-ruler').show();
            $('#float-table-ruler').css('left', scrollLeft - pos.left);
        } else {
            $('#float-table-ruler').hide();
        }
    },
    hideFloatRulers: function () {
        $('#float-time-ruler').fadeOut(200);
        $('#float-table-ruler').fadeOut(200);

        $('#scroll-top').val($('#adapt-div').scrollTop());
        $('#scroll-left').val($('#adapt-div').scrollLeft());
    },
    updateBooking: function (element, bookingId, eventId, tableId, pos, length, numberOfGuests, tableSize) {
        // get date in format yyyyMMdd, ex: 20120826
        var date = $.datepicker.formatDate('yymmdd', $('#date-picker').scroller('getDate'));

        // call ajax to check booking-data
        $.ajax({
            type: 'post',
            async: false,
            url: '/Summary/CheckBookingDrag',
            data: {
                BookingID: bookingId,
                EventID: eventId,
                TableID: tableId,
                BookingDate: date,
                BoundaryStartDate: Utils.formatTime(summary.model.root), //$('#boundary-start-time').html(),
                Block: pos.block,
                Length: length
            },
            success: function (checkResponse) {
                if (checkResponse.IsSucceed) {
                    var message;

                    // get booking info
                    var prevBlock = parseFloat(element.attr('start-block'));
                    var prevTableIndex = parseInt(element.attr('table-index'));
                    var prevTable = $($('.table-ruler-info')[prevTableIndex]);
                    var prevLayoutCode = parseInt(prevTable.find('.layout-code').text());
                    var prevTableSize = parseInt(prevTable.find('.table-size').text());
                    var bookingName = element.children('.chart-text').text();

                    // prepare params for messages
                    var newStartTime = checkResponse.StartTime;
                    var newEndTime = checkResponse.EndTime;

                    // check different to compose message content
                    if (prevBlock != checkResponse.Block && prevTableIndex != pos.index) {
                        // change both time & table
                        message = format([
                            'You are moving {0} ({1} guest(s)) from table no. {2} with {3} chairs to table no. {4} with {5} chairs. The time of the reservation has been changed and is now from {6} to {7}. Are you sure you want to make this change?',
                            bookingName,
                            numberOfGuests,
                            prevLayoutCode,
                            prevTableSize,
                            parseInt(pos.layoutCode),
                            tableSize,
                            checkResponse.StartTime,
                            checkResponse.EndTime
                        ]);
                    } else {
                        if (prevBlock != checkResponse.Block) {
                            // change time only
                            message = format([
                                'The time of the reservation has been changed and is now from {0} to {1}. Are you sure you want to make this change?',
                                checkResponse.StartTime,
                                checkResponse.EndTime
                            ]);
                        } else {
                            // change table only
                            message = format([
                                'You are moving {0} ({1} guest(s)) from table no. {2} with {3} chairs to table no. {4} with {5} chairs. Are you sure you want to make this change?',
                                bookingName,
                                numberOfGuests,
                                prevLayoutCode,
                                prevTableSize,
                                parseInt(pos.layoutCode),
                                tableSize
                            ]);
                        }
                    }

                    // SonTH fix bug #25. Need to stop page refresh when showing dialog
                    summary.refresher.stop();
                    MessageBox.show({
                        message: [message],
                        buttons: {
                            // SonTH fix bug #25. Start timer again when dialog is closed
                            no: function () {
                                element.trigger('rollback');
                                summary.refresher.start();
                            },
                            yes: function () {
                                $.ajax({
                                    type: 'post',
                                    async: false,
                                    url: '/Summary/SubmitBookingDrag',
                                    data: {
                                        BookingID: bookingId,
                                        EventID: eventId,
                                        TableID: tableId,
                                        BookingDate: date,
                                        StartTime: checkResponse.StartTime,
                                        EndTime: checkResponse.EndTime,
                                        BoundaryStartTime: Utils.formatTime(summary.model.root)
                                    },
                                    success: function (submitResponse) {
                                        if (submitResponse.IsSucceed) {
                                            // update start-block
                                            element.attr('start-block', submitResponse.Block);
                                            // update length
                                            element.attr('length', submitResponse.Length);

                                            // update table-index 
                                            element.attr('table-index', pos.index);

                                            // re-align emlement
                                            Chart.alignElement(element, true);
                                        } else {
                                            element.trigger('rollback');
                                            Utils.showError();
                                        }
                                    }
                                });
                                // SonTH fix bug #25. Start timer again when dialog is closed
                                summary.refresher.start();
                            }
                        }
                    });
                } else {
                    // SonTH fix bug #25. Need to stop page refresh when showing dialog
                    summary.refresher.stop();
                    MessageBox.show({
                        message: [
                            "Invalid move as there is already a reservation on this table at this time!",
                            "Please move the guest to a vacant table."
                        ],
                        buttons: {
                            // SonTH fix bug #25. Start timer again when dialog is closed
                            ok: function () {
                                summary.refresher.start();
                                element.trigger('rollback');
                            }
                        }
                    });

                }
            }
        });
    }
};

var _timer;
$(window).resize(function () {
    clearTimeout(_timer);

    _timer = setTimeout(function () {
        Chart.adapt();
    }, 100);
});