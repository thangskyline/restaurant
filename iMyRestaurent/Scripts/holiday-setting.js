$(document).ready(function () {
    holiday.initialize();
});
var holiday = {
    // holiday.initialize
    initialize: function () {
        holiday.currentYearMonth.set(Utils.parseYearMonth(new Date()));
        holiday.global.LocationID = $('#LocationID').val();
        holiday.initData();
    },
    handler: {
        // holiday.handler.datePickerChange
        datePickerChange: function () {
            var iMonth = $(this).scroller('getDate').getMonth();
            iMonth++;
            var iYear = $(this).scroller('getDate').getFullYear();
            holiday.currentYearMonth.set(iYear.toString() + (iMonth < 10 ? '0' + iMonth.toString() : iMonth.toString()));

            holiday.special.requestNewData();

        },
        // holiday.handler.common
        common: function () {
            //for live controls
            $('.status').live('click', holiday.special.handler.statusClick);
            $('.date').live('click', holiday.special.handler.dateClick);
            //end live controls
            $('#btn-done').click(function () {
                //            window.location = '/Location/EditBusinessHours';
                $('#frm-done').submit();
            })
            $('.previous').click(function () {
                holiday.ChangeYearMonth(false);
            });
            $('.next').click(function () {
                holiday.ChangeYearMonth(true);
            });
            $('#date-picker').scroller({
                preset: 'date',
                theme: Utils.mobiscrollTheme(),
                display: 'modal',
                mode: Utils.mobiscrollMode(),
                dateFormat: 'MM yy',
                dateOrder: 'MMyy'
            });
            //change month year 
            $('#date-picker').change(holiday.handler.datePickerChange);
            // init value for date-picker
            var strYearMonth = holiday.currentYearMonth.get();
            var strMonth = strYearMonth.substring(4);
            var strYear = strYearMonth.substring(0, 4);
            var iMonth = parseInt(strMonth);
            $('#date-picker').val(MONTH_NAMES[iMonth - 1] + ' ' + strYear);
            //end init
            $('#country-selector').change(holiday.public.handler.countryChange);
            $('#country-selector').click(function () {
                holiday.public.previousCountryID = holiday.global.CountryID;
            });

            $.fn.HasScrollBar = function () {
                //note: clientHeight= height of holder
                //scrollHeight= we have content till this height
                var _elm = $(this)[0];
                var _hasScrollBar = false;
                if ((_elm.clientHeight < _elm.scrollHeight) || (_elm.clientWidth < _elm.scrollWidth)) {
                    _hasScrollBar = true;
                }
                return _hasScrollBar;
            }
        }
    },
    resizePublicHolidayTable: function () {
        $('#public-data').outerWidth($('#table-header').width());
        var headers = $('#table-header tr').find('th');

        var count = headers.length - 1;

        for (var i = 0; i < count; i++) {
            var header = $(headers[i]);
            //            var body = $($('table.center-box tr').first().find('td')[i]);
            var tr = $('table.center-box tr')[1];
            var body = $(tr).find('td')[i];

            $(body).width(header.width());
            $(body).css('min-width', header.width());
        }

        //$('#report-dialog table[role="header"]').width($('#report-dialog div[role="info"] table').width());
    },
    special: {
        getSpecialProps: function (element) {
            var SpecialProps = {};
            SpecialProps.sittingId = $(element).parents('table').attr('sitting-id');
            SpecialProps.dateFormatted = $(element).parents('td').attr('date');
            SpecialProps.day = $(element).parents('td').attr('day');
            SpecialProps.isPublicHoliday = $(element).parents('td').attr('ispublicholiday');
            SpecialProps.eventId = $(element).parents('tbody').find('tr:first').find('td[day="' + SpecialProps.day + '"]').attr('event-id');
            SpecialProps.strDate = $(element).parents('td').attr('date');
            SpecialProps.overrideId = $(element).parents('td').attr('overrideid');
            SpecialProps.isOverride = $(element).parents('td').attr('isoverride');
            SpecialProps.dayName = $(element).attr('day-name');

            return SpecialProps;
        },
        // holiday.special.requestNewData
        requestNewData: function () {
            var RangeDate = holiday.GetRangeDate(holiday.currentYearMonth.get());
            var dtStart = RangeDate[0];
            var dtEnd = RangeDate[1];
            showProgressDialog('Getting new special holiday data');
            $.ajax({
                type: "post",
                url: "/Holiday/RequestNewData",
                data: {
                    StartDate: Utils.parseDateTimeToString(dtStart),
                    EndDate: Utils.parseDateTimeToString(dtEnd),
                    LocationID: holiday.global.LocationID,
                    CountryID: holiday.global.CountryID
                },
                complete: function () {

                },
                success: function (response) {
                    hideProgressDialog();
                    if (response.IsSucceed) {
                        if (response.SpecialDaysList != null)
                            holiday.global.SpecialDaysList = holiday.RebuildSpecialDaysList(response.SpecialDaysList);
                        else
                            holiday.global.SpecialDaysList = null;
                        holiday.special.updateData();
                    }
                    else {
                        hideProgressDialog();
                        Utils.showError();
                    }

                }
            })
        },
        // holiday.special.updateData
        updateData: function () {
            var RangeDate = holiday.GetRangeDate(holiday.currentYearMonth.get());
            var dtStart = RangeDate[0];
            var dtEnd = RangeDate[1];
            holiday.global.SixWeeks = holiday.buildSixWeeks(dtStart, dtEnd);
            //                        if (response.SpecialDaysList != null)
            //                            holiday.global.SpecialDaysList = holiday.RebuildSpecialDaysList(response.SpecialDaysList);
            var html = '';
            $('#calendar-list').empty();
            if (holiday.global.SittingList != null) {
                for (var k = 0; k < holiday.global.SittingList.length; k++) {
                    html += '<table sitting-id=' + holiday.global.SittingList[k].SittingID + ' class="calendar tophidden" >';
                    html += '   <tr style="display:none;" >';
                    html += '       <td class="event" rowspan="7">' + holiday.global.SittingList[k].Name;
                    html += '       </td>';
                    //header of Calendar              
                    for (var m = 0; m < holiday.global.SittingList[k].SittingTimes.length; m++) {
                        var sittingTimeItem = holiday.global.SittingList[k].SittingTimes[m];
                        html += '       <td event-id="' + sittingTimeItem.EventID + '" day="' + sittingTimeItem.Day + '" class="day" >' + SHORTDAY_NAMES[sittingTimeItem.Day];
                        html += '       </td>';
                    }
                    html += '   </tr>';
                    //loop for rows
                    for (var i = 0; i < holiday.global.SixWeeks.length; i++) {
                        html += '<tr>';
                        if (i == 0) {
                            html += '<td class="sitting-name" rowspan="6">';
                            //                            html += '   <div class="cell-status-date">';
                            //                            html += '   </div>';
                            html += '<input  type="textbox"  readonly="readonly" style="width:45px;" value="' + holiday.global.SittingList[k].Name + '" />';
                            html += '</td>';
                        }
                        //loop for columns
                        for (var j = 0; j < holiday.global.SixWeeks[i].length; j++) {
                            var statusDefault = holiday.global.SittingList[k].SittingTimes[j].State;
                            var status = statusDefault;
                            var date = holiday.global.SixWeeks[i][j];
                            var sDate = Utils.parseDateTimeToString(holiday.global.SixWeeks[i][j]);
                            var thisYearMonth = sDate.substring(0, 6);

                            var cssCell = '';
                            var cssOddEven = j % 2 == 0 ? 'odd' : 'even';
                            var cssStatus = status;
                            var strDate = $.datepicker.formatDate('yyMMdd', date);
                            var cssDate = 'date';
                            var disable = '';
                            var IsOverride = 0;
                            var IsPublicHoliday = 0;
                            var IsSpecialDay = 0;
                            var OverrideID = -1;
                            var TooltipName = '';
                            var DayName = '';
                            // special setting cell
                            if (holiday.global.SpecialDaysList != null) {
                                var Sitting = jLinq.from(holiday.global.SpecialDaysList).ignoreCase().startsWith('SittingID', holiday.global.SittingList[k].SittingID).first();
                                if (Sitting != null) {
                                    var specialDayStatus = jLinq.from(Sitting.SpecialDayStatusList).ignoreCase().startsWith('DateString', strDate).first();
                                    if (specialDayStatus != null) {
                                        // now status = statusDefault
                                        if (status == 'Open')
                                            status = (specialDayStatus.IsOverride == 1) ? 'Closed' : 'Open';
                                        IsOverride = specialDayStatus.IsOverride;
                                        IsPublicHoliday = specialDayStatus.IsPublicHoliday;
                                        IsSpecialDay = specialDayStatus.IsSpecialDay;
                                        OverrideID = specialDayStatus.OverrideID;
                                        DayName = specialDayStatus.DayName;
                                        if (status == 'Closed') {
                                            TooltipName = 'Closed - ' + specialDayStatus.DayName;
                                        }
                                    }
                                }
                            }
                            
                            if (statusDefault == 'Open' && status == 'Closed') {
                                //case special close
                                if (IsSpecialDay)
                                    cssCell = 'special-closed';
                                //case public close
                                else
                                    cssCell = 'public-closed';
                            }
                            //case common close
                            else if (statusDefault == 'Closed') {
                                disable = ' disabled="disabled"';
                                cssCell = 'common-closed';
                            }

                            cssStatus = status;
                            if (thisYearMonth != holiday.currentYearMonth.get() && status != 'Closed') {
                                //                                cssDate += ' outmonth';
                                cssCell += ' outmonth';
                            }
                            html += '<td title="' + TooltipName + '" status-default="' + statusDefault + '" overrideid ="' + OverrideID + '" date="' + Utils.parseDateTimeToString(date) + '" day="' + j + '" IsOverride="' + IsOverride + '" IsPublicHoliday="' + IsPublicHoliday + '" IsSpecialDay="' + IsSpecialDay + '" title="" class="' + cssStatus.toLowerCase() + ' ' + cssOddEven + '">';
                            html += '   <div class="cell-status-date ' + cssCell + '"  >';
                            html += '       <button type="button" ' + disable + ' class="image-button status">' + status + '</button>';
                            html += '       <button type="button" day-name="' + DayName + '"  class="image-button ' + cssDate + '">' + date.getDate() + '</button>';
                            html += '   </div>';
                            html += '</td>';
                        }
                        html += '</tr>';
                    }
                    html += '   <tr class="footer">';
                    html += '       <td>';
                    html += '       </td>';
                    html += '       <td colspan="7">&nbsp;';
                    html += '       </td>';
                    html += '   </tr >';
                    html += '</table>';
                }
            }
            $('#calendar-list').append(html);

            holiday.setSpecialSelectedDate(holiday.currentSpecialSelectedDate.sittingId, holiday.currentSpecialSelectedDate.dateFormatted);

            if ($('#calendar-list').HasScrollBar()) {
                $('table[class="calendar bottomhidden"]').width(487);
            }
        },


        handler: {
            // holiday.special.handler.dateClick
            dateClick: function () {
                var objSpecialProps = holiday.special.getSpecialProps(this);
                if (objSpecialProps.isOverride == 1) {
                    if (objSpecialProps.isPublicHoliday != 1) {
                        MessageBox.show({
                            title: '',
                            message: ['<textarea placeholder="Name of special day..." id="mess-change-status" >' + objSpecialProps.dayName + '</textarea>'],
                            buttons: {
                                done: function () {
                                    var messageName = $('#mess-change-status').val();
                                    holiday.special.handler.doSpecialDayUpdate(objSpecialProps.overrideId, messageName);
                                },
                                cancel: function () { }
                            }
                        })
                    }
                    else {
                        MessageBox.show({
                            title: '',
                            message: ['<textarea placeholder="Name of special day..." id="mess-change-status" >' + objSpecialProps.dayName + '</textarea>'],
                            buttons: {
                                ok: function () { }
                            }
                        })
                    }
                }

            },
            // holiday.special.handler.statusClick
            statusClick: function () {
                var objSpecialProps = holiday.special.getSpecialProps(this);
                //if special day is Open to Close
                if (objSpecialProps.isOverride == "0") {
                    MessageBox.show({
                        title: '',
                        message: ['<textarea placeholder="Name of special day..." id="mess-change-status" ></textarea>'],
                        buttons: {

                            cancel: function () { },
                            done: function () {
                                var messageName = $('#mess-change-status').val();
                                //check
                                $.ajax({
                                    url: '/Holiday/SpecialDaysOverrideCheck',
                                    type: 'post',
                                    data: {
                                        SpecialDate: objSpecialProps.strDate,
                                        EventID: objSpecialProps.eventId
                                    },
                                    complete: function () {

                                    },
                                    success: function (response) {
                                        hideProgressDialog();
                                        if (response.IsSucceed) {
                                            //no have bookings
                                            if (response.HasBookings == 0) {
                                                holiday.special.handler.SpecialDaysOverrideApply(objSpecialProps.strDate, objSpecialProps.eventId, messageName);

                                                if (objSpecialProps.isPublicHoliday == "1") {
                                                    holiday.currentPublicSelectedDate.sittingId = objSpecialProps.sittingId;
                                                    holiday.currentPublicSelectedDate.dateFormatted = objSpecialProps.dateFormatted;
                                                }

                                            }
                                            //have bookings
                                            else {

                                                MessageBox.show({
                                                    title: '',
                                                    message: ['You already have reservations for this day!<br/> Do you want to continue to close this day and delete all reservation on this day?'],
                                                    buttons: {
                                                        yes: function () {
                                                            holiday.special.handler.SpecialDaysOverrideApply(objSpecialProps.strDate, objSpecialProps.eventId, messageName);
                                                            if (objSpecialProps.isPublicHoliday == "1") {
                                                                holiday.currentPublicSelectedDate.sittingId = objSpecialProps.sittingId;
                                                                holiday.currentPublicSelectedDate.dateFormatted = objSpecialProps.dateFormatted;
                                                            }
                                                        },
                                                        no: function () { }
                                                    }
                                                });
                                            }
                                        }
                                        else {
                                            hideProgressDialog();
                                            Utils.showError();
                                        }
                                    }
                                })

                            }
                        }
                    });

                }
                //if special day is Close to Open
                else {
                    //confirm
                    MessageBox.show({
                        message: ['Do you want to change status to open?'],
                        buttons: {
                            yes: function () {
                                showProgressDialog('ReOpenning');
                                $.ajax({
                                    url: '/Holiday/SpecialDayDelete',
                                    type: 'post',
                                    data: {
                                        OverrideID: objSpecialProps.overrideId
                                    },
                                    complete: function () {

                                    },
                                    success: function (response) {
                                        hideProgressDialog();
                                        if (response.IsSucceed) {
                                            if (objSpecialProps.isPublicHoliday == "1") {
                                                holiday.currentPublicSelectedDate.sittingId = objSpecialProps.sittingId;
                                                holiday.currentPublicSelectedDate.dateFormatted = objSpecialProps.dateFormatted;
                                            }
                                            holiday.special.requestNewData();
                                            //refresh data in right side
                                            holiday.public.handler.getPublicData();
                                        }
                                        else {
                                            hideProgressDialog();
                                            Utils.showError();
                                        }
                                    }
                                })
                            },
                            no: function () { }
                        }
                    });

                }
            }
            ,
            // holiday.special.handler.SpecialDaysOverrideApply
            SpecialDaysOverrideApply: function (strDate, eventId, name) {
                showProgressDialog('Saving');
                $.ajax({
                    url: '/Holiday/SpecialDaysOverrideApply',
                    type: 'post',
                    data: {
                        LocationID: holiday.global.LocationID,
                        SpecialDate: strDate,
                        EventID: eventId,
                        Name: name
                    },
                    complete: function () {

                    },
                    success: function (response) {
                        hideProgressDialog();
                        if (response.IsSucceed) {
                            // refresh data in left and right side
                            holiday.special.requestNewData();
                            holiday.public.handler.getPublicData();
                        }
                        else {
                            hideProgressDialog();
                            Utils.showError();
                        }
                    }
                })
            },
            doSpecialDayUpdate: function (overrideId, name) {
                showProgressDialog('Saving');
                $.ajax({
                    url: '/Holiday/SpecialDayUpdate',
                    type: 'post',
                    data: {
                        OverrideID: overrideId,
                        Name: name
                    },
                    complete: function () {

                    },
                    success: function (response) {
                        hideProgressDialog();
                        if (response.IsSucceed) {
                            holiday.special.requestNewData();
                        }
                        else {
                            hideProgressDialog();
                            Utils.showError();
                        }
                    }
                })
            }

        }
    },
    setSpecialSelectedDate: function (sittingId, dateFormatted) {
        $('table[sitting-id] td[date]').removeClass('selected');
        if (sittingId.length > 1) {
            $('table td[date="' + dateFormatted + '"]').addClass('selected');
        }
        else
            $('table[sitting-id="' + sittingId + '"] td[date="' + dateFormatted + '"]').addClass('selected');
        if (sittingId != null && dateFormatted != null) {

            $('#calendar-list').animate({
                scrollTop: $('table[sitting-id="' + sittingId[0] + '"]').offset().top
            }, 2000);
            //            $.scrollTo($('table[sitting-id="' + sittingId[0] + '"]'), 500); // index start with 0
        }
        holiday.currentSpecialSelectedDate.sittingId = new Array();
        holiday.currentSpecialSelectedDate.dateFormatted = null;
    },
    setPublicSelectedDate: function (sittingId, dateFormatted) {

        if (sittingId != null && dateFormatted != null) {

            $('.table-containment').animate({
                scrollTop: $('tr[date-formatted="' + dateFormatted + '"]').offset().top
            }, 2000);
            //            $.scrollTo($('table[sitting-id="' + sittingId[0] + '"]'), 500); // index start with 0
        }
        holiday.currentPublicSelectedDate.sittingId = null;
        holiday.currentPublicSelectedDate.dateFormatted = null;
    },
    currentSpecialSelectedDate: {
        sittingId: new Array(),
        dateFormatted: null
    },
    currentPublicSelectedDate: {
        sittingId: null,
        dateFormatted: null
    },
    // holiday.currentYearMonth
    currentYearMonth: {
        get: function () {
            return $('#CurrentYearMonth').val();
        },
        set: function (value) {
            $('#CurrentYearMonth').val(value);
        }
    },
    initData: function () {
        var RangeDate = holiday.GetRangeDate(holiday.currentYearMonth.get());
        var dtStart = RangeDate[0];
        var dtEnd = RangeDate[1];

        showProgressDialog("Loading Special holiday data");
        $.ajax({
            type: "post",
            url: "/Holiday/InitData",
            data: {
                LocationID: holiday.global.LocationID,
                StartDate: Utils.parseDateTimeToString(dtStart),
                EndDate: Utils.parseDateTimeToString(dtEnd),
                Token: $('#Token').val()
            },
            complete: function () {

            },
            success: function (response) {
                hideProgressDialog();
                if (response.IsSucceed) {
                    if (response.SittingList != null) {
                        // init global data

                        holiday.global.CountryID = response.CountryID;

                        holiday.global.SpecialDaysList = holiday.RebuildSpecialDaysList(response.SpecialDaysList);

                        //                        holiday.global.SittingList = response.SittingList;

                        holiday.global.SittingList = response.MenuInputList;

                        //init data for public holiday panel
                        holiday.public.initPublicHolidayData();

                        holiday.handler.common();

                    }
                }
                else {
                    hideProgressDialog();
                    Utils.showError();
                }

            }
        })
    },
    RebuildSittingList: function () {

    },
    RebuildPublicHolidays: function (publicHolidays) {
        for (var i = 0; i < publicHolidays.length; i++) {
            publicHolidays[i].HolidayDateList = jLinq.from(publicHolidays[i].HolidayDateList).orderBy("DayID").select();
            for (var j = 0; j < publicHolidays[i].HolidayDateList.length; j++) {
                var Date = Utils.parseDateTime(publicHolidays[i].HolidayDateList[j].Date);
                for (var k = 0; k < publicHolidays[i].HolidayDateList[j].OverrideDayList.length; k++) {
                    var SittingID = publicHolidays[i].HolidayDateList[j].OverrideDayList[k].SittingID;
                    //find by SittingID
                    var Sitting = jLinq.from(holiday.global.SittingList).ignoreCase().startsWith('SittingID', SittingID).first();
                    var State = Sitting.SittingTimes[Utils.getDay(Date)].State;
                    State == 'Closed' ? publicHolidays[i].HolidayDateList[j].OverrideDayList[k].IsCommonClosed = 1 : publicHolidays[i].HolidayDateList[j].OverrideDayList[k].IsCommonClosed = 0;
                }

            }
        }
        return publicHolidays;
    },
    RebuildSpecialDaysList: function (specialDaysList) {
        if (specialDaysList != null) {
            for (var i = 0; i < specialDaysList.length; i++) {
                for (var j = 0; j < specialDaysList[i].SpecialDayStatusList.length; j++) {
                    var strDate = $.datepicker.formatDate('yyMMdd', Utils.parseDateTime(specialDaysList[i].SpecialDayStatusList[j].Date));
                    specialDaysList[i].SpecialDayStatusList[j].DateString = strDate;
                    specialDaysList[i].SpecialDayStatusList[j].DateFormatted = Utils.parseJsonDateToString(specialDaysList[i].SpecialDayStatusList[j].Date);
                }
            }
        }
        return specialDaysList;
    },
    GetRangeDate: function (YearMonth) {
        var year = YearMonth.substring(0, 4);
        var month = YearMonth.substring(4);
        var StartDate = new Date(parseInt(year), parseInt(month, 10) - 1, 1);

        var EndDate;
        switch (StartDate.getDay()) {
            case 1:
                StartDate.setDate(StartDate.getDate() - 7);
                break;
            case 2:
                StartDate.setDate(StartDate.getDate() - 1);
                break;
            case 3:
                StartDate.setDate(StartDate.getDate() - 2);
                break;
            case 4:
                StartDate.setDate(StartDate.getDate() - 3);
                break;
            case 5:
                StartDate.setDate(StartDate.getDate() - 4);
                break;
            case 6:
                StartDate.setDate(StartDate.getDate() - 5);
                break;
            case 0:
                StartDate.setDate(StartDate.getDate() - 6);
                break;
        }
        EndDate = new Date(StartDate.getTime());
        EndDate.setDate(EndDate.getDate() + 41);
        var RangeDate = new Array();
        RangeDate.push(StartDate);
        RangeDate.push(EndDate);
        return RangeDate;
    },
    ChangeYearMonth: function (IsNext) {
        var strYearMonth = holiday.currentYearMonth.get();
        var strMonth = strYearMonth.substring(4);
        var strYear = strYearMonth.substring(0, 4);
        var yearMonth = parseInt(strYearMonth);
        if (IsNext) {
            if (strMonth != "12") {
                yearMonth++;
                holiday.currentYearMonth.set(yearMonth);
                $('#date-picker').scroller('setDate', new Date(parseInt(strYear), parseInt(strMonth, 10), 1), true);
            }
            else {
                var iYear = parseInt(strYear);
                iYear++;
                holiday.currentYearMonth.set(iYear + '01');
                $('#date-picker').scroller('setDate', new Date(iYear, 0, 1), true);
            }
        }
        else {
            if (strMonth != "01") {
                yearMonth--;
                holiday.currentYearMonth.set(yearMonth);
                $('#date-picker').scroller('setDate', new Date(parseInt(strYear), parseInt(strMonth, 10) - 2, 1), true);
            }
            else {
                var iYear = parseInt(strYear);
                iYear--;
                holiday.currentYearMonth.set(iYear + '12');
                $('#date-picker').scroller('setDate', new Date(iYear, 11, 1), true);
            }
        }
        $('#CurrentYearMonthLabel').html(Utils.getMonthOfYear(holiday.currentYearMonth.get()));
    },
    // holiday.global
    global: {
        SpecialDaysList: null,
        SittingList: null,
        SixWeeks: null,
        LocationID: null,
        PublicHolidays: null,
        CountryID: null
    },
    weekHoliday: {
        Dates: null
    },
    buildSixWeeks: function (start, end) {
        holiday.weekHoliday.Dates = new Array();
        var Dates = new Array();
        var SixWeeks = new Array();
        var index = 0;
        var totalDates = new Array();
        for (var dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
            var ndate = new Date(dt.getTime());
            totalDates.push(ndate);
            index++;
            if (index == 7) {
                Dates = new Array();
                Dates = totalDates;
                SixWeeks.push(Dates);
                totalDates = new Array();
                index = 0;
            }
        }
        return SixWeeks;
    },
    public: {
        IsHasPublicClosed: function () {
            var obj = holiday.global.PublicHolidays;
            if (obj != null) {
                for (var i = 0; i < obj.length; i++) {
                    for (var j = 0; j < obj[i].HolidayDateList.length; j++) {
                        for (var k = 0; k < obj[i].HolidayDateList[j].OverrideDayList.length; k++) {
                            if (obj[i].HolidayDateList[j].OverrideDayList[k].OverrideID != -1)
                                return true;
                        }
                    }
                }
            }
            return false;
        },
        previousCountryID: null,
        initPublicHolidayData: function () {
            $.ajax({
                type: "post",
                url: "/Holiday/InitializePublicHoliday",
                complete: function () {

                },
                success: function (response) {
                    hideProgressDialog();
                    if (response.IsSucceed) {
                        // create html
                        var html = '';
                        for (var i = 0; i < response.Countries.length; i++) {
                            if (response.Countries[i].CountryID == holiday.global.CountryID) {
                                html += '       <option value="' + response.Countries[i].CountryID + '" selected="selected" >' + response.Countries[i].CountryName + '</option>';
                            }
                            else if (response.Countries[i].CountryID == 1 && holiday.global.CountryID == 0) {
                                html += '       <option value="' + response.Countries[i].CountryID + '" selected="selected" >' + response.Countries[i].CountryName + '</option>';
                                holiday.global.CountryID = 1;
                            }
                            else
                                html += '       <option value="' + response.Countries[i].CountryID + '">' + response.Countries[i].CountryName + '</option>';
                        }
                        $('#country-selector').append(html);
                        html = '';
                        var currentTime = new Date();
                        var currentYear = currentTime.getFullYear();

                        for (var year = 2000; year < 3000; year++) {
                            if (year === currentYear) {
                                html += '   <option value="' + year + '" selected="selected">' + year + '</option>';
                            } else {
                                html += '   <option value="' + year + '">' + year + '</option>';
                            }
                        }
                        $('#year-selector').append(html);
                        html = '';

                        for (var i = 0; i < holiday.global.SittingList.length; i++) {
                            html += '               <th id="' + holiday.global.SittingList[i].SittingID + '">' + holiday.global.SittingList[i].Name + '</th>';
                        }

                        html += '               <th style="min-width: 50px;" >All</th>';

                        $('.table-containment').find('tr').append(html);
                        //first call data in right side
                        holiday.public.handler.getPublicData();
                        //first call data in left side
                        holiday.special.requestNewData();


                    } else {
                        hideProgressDialog();
                        Utils.showError();
                    }
                }
            });
        },
        markAllCheckBox: function (tr) {
            var sameRowInputs = tr.children("td").not(".all").children('input');
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
        },
        allCheckBoxBehaviour: function () {
            var checked = $(this).attr("checked") === "checked";

            var otherInputs = $(this).parent().parent().children("td").not(".all").children('input[disabled!="disabled"]');

            var objSelectedDate = {
                dateFormatted: null,
                sittingId: null
            };
            var arrPublicOverrideApply = new Array();
            var arrSelectedDate = new Array();
            if (checked) {
                otherInputs.attr("checked", "checked");
            } else {
                otherInputs.removeAttr("checked");
            }
            otherInputs.each(function () {
                var objPublicProps = holiday.public.getPublicProps(this);
                //                
                objSelectedDate.dateFormatted = objPublicProps.dateFormatted;
                objSelectedDate.sittingId = objPublicProps.sittingId;

                arrPublicOverrideApply.push({ DayID: objPublicProps.DayId, EventID: objPublicProps.eventId, IsOverride: objPublicProps.isOverride });
                arrSelectedDate.push(objSelectedDate);

            });
            //check if have reserved then show message to confirm
            $.ajax({
                url: '/Holiday/PublicHolidaysOverrideCheckMulti',
                type: 'post',
                data: {
                    JsonPublicholidays: JSON.stringify(arrPublicOverrideApply)
                },
                complete: function () {

                },
                success: function (response) {
                    hideProgressDialog();
                    if (response.IsSucceed) {
                        //no have bookings
                        if (response.HasBookings == 0) {
                            // Public Override Apply and refresh right side
                            holiday.public.handler.PublicHolidaysOverrideApplyMulti(JSON.stringify(arrPublicOverrideApply), arrSelectedDate);
                            holiday.public.handler.getPublicData();
                        }
                        //have bookings
                        else {

                            MessageBox.show({
                                title: '',
                                message: ['You already have reservations for this day!<br/> Do you want to continue to close this day and delete all reservation on this day?'],
                                buttons: {
                                    yes: function () {
                                        // Public Override Apply and refresh right side
                                        holiday.public.handler.PublicHolidaysOverrideApplyMulti(JSON.stringify(arrPublicOverrideApply), arrSelectedDate);
                                        holiday.public.handler.getPublicData();
                                    },
                                    no: function () {
                                        holiday.public.handler.getPublicData();
                                    }
                                }
                            });
                        }
                    }
                    else {
                        hideProgressDialog();
                        Utils.showError();
                    }
                }
            })

        },
        getPublicProps: function (checkbox) {
            var PublicProps = {};

            PublicProps.thisCheckbox = checkbox;
            PublicProps.sittingId = $(checkbox).parent().attr('class').split(' ')[0];
            PublicProps.eventId = $(checkbox).parent().attr('event-id'); //
            PublicProps.DayId = $(checkbox).parents('tr').attr('class'); //
            var checked = $(checkbox).attr("checked") === "checked";
            PublicProps.isOverride = checked ? '1' : '0'; //
            PublicProps.dateFormatted = $(checkbox).parents('tr').attr('date-formatted');
            return PublicProps;
        },
        initializeAllCheckBoxes: function () {
            // add class for 'all' checkbox
            $.each($(".dialog table tbody tr"), function (key, value) {

                var input = $(value).find("input[type='checkbox']:last");
                input.parent().attr("class", "all");
                input.bind("change", holiday.public.allCheckBoxBehaviour);

            });

            $("td.input-cell > input").bind("change", holiday.public.handler.NormalInputsChange);

            // update 'all' checkbox
            $.each($(".dialog table tbody tr"), function (key, value) {
                //var input = $(value).find(".input-cell:first").children("input");
                holiday.public.markAllCheckBox($(value));
            });
        },
        handler: {
            NormalInputsChange: function () {
                //thangma public input onchange handler
                var objPublicProps = holiday.public.getPublicProps(this);
                //check if have reserved then show message to confirm
                $.ajax({
                    url: '/Holiday/PublicHolidaysOverrideCheck',
                    type: 'post',
                    data: {
                        LocationID: holiday.global.LocationID,
                        DayId: objPublicProps.DayId,
                        EventID: objPublicProps.eventId,
                        IsOverride: objPublicProps.isOverride
                    },
                    complete: function () {

                    },
                    success: function (response) {
                        hideProgressDialog();
                        if (response.IsSucceed) {
                            //no have bookings
                            if (response.HasBookings == 0) {
                                // Public Override Apply and refresh right side
                                holiday.public.handler.PublicHolidaysOverrideApply(objPublicProps.DayId, objPublicProps.eventId, objPublicProps.isOverride, objPublicProps.sittingId, objPublicProps.dateFormatted);
                                holiday.public.handler.getPublicData();

                            }
                            //have bookings
                            else {

                                MessageBox.show({
                                    title: '',
                                    message: ['You already have reservations for this day!<br/> Do you want to continue to close this day and delete all reservation on this day?'],
                                    buttons: {
                                        yes: function () {
                                            // Public Override Apply and refresh right side
                                            holiday.public.handler.PublicHolidaysOverrideApply(objPublicProps.DayId, objPublicProps.eventId, objPublicProps.isOverride, objPublicProps.sittingId, objPublicProps.dateFormatted);
                                            holiday.public.handler.getPublicData();
                                        },
                                        no: function () {
                                            $(objPublicProps.thisCheckbox).removeAttr('checked', 'checked');
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            hideProgressDialog();
                            Utils.showError();
                        }
                    }
                })
                //end
                holiday.public.markAllCheckBox($(this).parent().parent());
            },
            // holiday.public.handler.PublicHolidaysOverrideApply
            PublicHolidaysOverrideApply: function (DayId, eventId, isOverride, sittingId, dateFormatted) {
                showProgressDialog('Saving Public Holiday Setting');
                $.ajax({
                    type: "post",
                    url: "/Holiday/PublicHolidaysOverrideApply",
                    data: {
                        LocationID: holiday.global.LocationID,
                        DayID: DayId,
                        EventID: eventId,
                        IsOverride: isOverride
                    },
                    complete: function () {

                    },
                    success: function (response) {
                        if (response.IsSucceed) {
                            hideProgressDialog();
                            //compare with currentYearMonth
                            var thisYearMonth = dateFormatted.substring(0, 6);
                            var sThisYear = thisYearMonth.substring(0, 4);
                            var sThisMonth = thisYearMonth.substring(4);
                            //                                if (thisYearMonth != holiday.currentYearMonth.get()) {
                            // rebuild Public
                            //
                            //move to specific date in left side
                            holiday.currentSpecialSelectedDate.sittingId.push(sittingId);
                            holiday.currentSpecialSelectedDate.dateFormatted = dateFormatted;
                            $('#date-picker').scroller('setDate', new Date(parseInt(sThisYear), parseInt(sThisMonth, 10) - 1, 1), true);
                            //                                }
                        }
                        else {
                            hideProgressDialog();
                            Utils.showError();
                        }

                    }
                })
            },
            // holiday.public.handler.PublicHolidaysOverrideApplyMulti
            PublicHolidaysOverrideApplyMulti: function (arrPublic, arrSelectedDate) {
                showProgressDialog('Saving Public Holiday Setting');
                $.ajax({
                    type: "post",
                    url: "/Holiday/PublicHolidaysOverrideApplyMulti",
                    data: {
                        LocationID: holiday.global.LocationID,
                        JsonPublicholidays: arrPublic
                    },
                    complete: function () {

                    },
                    success: function (response) {
                        if (response.IsSucceed) {
                            hideProgressDialog();
                            //compare with currentYearMonth
                            var thisYearMonth = arrSelectedDate[0].dateFormatted.substring(0, 6);
                            var sThisYear = thisYearMonth.substring(0, 4);
                            var sThisMonth = thisYearMonth.substring(4);
                            //                            // rebuild Public
                            //                            //
                            //                            //move to specific date in left side
                            for (var i = 0; i < arrSelectedDate.length; i++) {
                                holiday.currentSpecialSelectedDate.sittingId.push(arrSelectedDate[i].sittingId);
                            }
                            holiday.currentSpecialSelectedDate.dateFormatted = arrSelectedDate[0].dateFormatted;
                            $('#date-picker').scroller('setDate', new Date(parseInt(sThisYear), parseInt(sThisMonth, 10) - 1, 1), true);
                        }
                        else {
                            hideProgressDialog();
                            Utils.showError();
                        }

                    }
                })
            },
            // holiday.public.handler.countryChange
            countryChange: function () {
                //Check has closed
                if (holiday.public.IsHasPublicClosed()) {
                    MessageBox.show({
                        title: '',
                        message: ['Do you want to switch the settings of Public Holidays to this country?'],
                        buttons: {
                            yes: function () {
                                //reset to open
                                showProgressDialog('Saving');
                                $.ajax({
                                    type: "post",
                                    url: "/Holiday/PublicHolidaysOpenAll",
                                    data: {
                                        LocationID: holiday.global.LocationID,
                                        CountryID: holiday.public.previousCountryID,
                                        Year: $('#year-selector').val()
                                    },
                                    complete: function () {

                                    },
                                    success: function (response) {
                                        hideProgressDialog();
                                        if (response.IsSucceed) {
                                            // get data in right side when country change
                                            holiday.public.handler.getPublicData();
                                            holiday.special.requestNewData();
                                        }
                                        else {
                                            hideProgressDialog();
                                            Utils.showError();
                                        }

                                    }
                                })
                            },
                            no: function () { }
                        }

                    });
                }
                else {
                    // get data in right side when country change
                    holiday.public.handler.getPublicData();
                    holiday.special.requestNewData();
                }
            },
            getPublicData: function () {
                holiday.global.CountryID = $(".dialog #country-selector").val();
                //first call data to left side


                var countryId = $(".dialog #country-selector").val();

                var year = $(".dialog #year-selector").val();

                if (countryId != -1 && year != -1) {
                    showProgressDialog("Loading Public holiday data");

                    $.ajax({
                        type: "post",
                        url: "/Holiday/GetPublicHolidayList",
                        data: {
                            countryId: countryId,
                            year: year,
                            locationId: holiday.global.LocationID
                        },
                        complete: function () {
                            //                            if ($('#public-data').HasScrollBar()) {
                            //                                $('#table-header').width('98%');
                            //                            }
                            //                            else {
                            //                                $('#table-header').width('100%');
                            //                            };
                            //                            $('.classic-popup-content1').height($('#spec-day-panel').height() - 15);
                            holiday.resizePublicHolidayTable();
                        },
                        success: function (response) {
                            if (response.IsSucceed) {
                                holiday.global.PublicHolidays = holiday.RebuildPublicHolidays(response.PublicHolidays);
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
                                            var date = new Date(parseInt(response.PublicHolidays[i].HolidayDateList[j].Date.substr(6)));
                                            var day = date.getDay() - 1;
                                            if (day === -1) { day = 6; }

                                            html += '<tr class="' + response.PublicHolidays[i].HolidayDateList[j].DayID + '" date-formatted=' + Utils.parseDateTimeToString(date) + '  >';

                                            html += '   <td  class=' + day + '>' + $.datepicker.formatDate("D, d M", date) + '</td>';
                                            for (var k = 0; k < colSpan - 1; k++) {
                                                var overrideDay = jLinq.from(response.PublicHolidays[i].HolidayDateList[j].OverrideDayList).ignoreCase().startsWith('SittingID', sittingIds[k]).first();
                                                var eventId = null
                                                overrideDay != null ? eventId = overrideDay.EventID : eventId = null;

                                                html += '   <td align="center" class="' + sittingIds[k] + ' input-cell" event-id="' + eventId + '" >';
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
                                    // public setting cell
                                    for (var i = 0; i < response.PublicHolidays.length; i++) {
                                        for (var j = 0; j < response.PublicHolidays[i].HolidayDateList.length; j++) {
                                            for (var k = 0; k < response.PublicHolidays[i].HolidayDateList[j].OverrideDayList.length; k++) {
                                                var sittingID = response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].SittingID;
                                                if (sittingID != -1) {
                                                    var dayID = response.PublicHolidays[i].HolidayDateList[j].DayID;
                                                    var cell = $(".dialog table tbody tr." + dayID + " td." + sittingID);
                                                    var overrideID = response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].OverrideID != -1;
                                                    var IsSpecialDay = response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].IsSpecialDay;
                                                    var IsCommonClosed = response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].IsCommonClosed;
                                                    if (overrideID && IsSpecialDay == 0) {
                                                        cell.children("input").attr("checked", "checked");
                                                        cell.children(".is-override").text("1");
                                                    }
                                                    else if (IsSpecialDay == 1 || IsCommonClosed == 1) {
                                                        cell.children("input").attr('disabled', 'disabled');
                                                    }

                                                    cell.children(".override-id").text(response.PublicHolidays[i].HolidayDateList[j].OverrideDayList[k].OverrideID);
                                                }
                                            }
                                        }
                                    }
                                    if (colSpan > 2) {
                                        holiday.public.initializeAllCheckBoxes();
                                    }
                                }
                                hideProgressDialog();

                                holiday.setPublicSelectedDate(holiday.currentPublicSelectedDate.sittingId, holiday.currentPublicSelectedDate.dateFormatted);
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
        }

    }
}


