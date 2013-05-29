using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Web.Mvc;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    [HandleError]
    public class ReservationController : Controller
    {
        private const string InputDateFormat = "ddd, d MMM yyyy";
        private const string InputDateTimeFormat = "ddd, d MMM yyyy - HH:mm";
        private const string SystemDateFormat = "yyyyMMdd";
        private const string SystemTimeFormat = "HH:mm";

        #region Create/Edit Reservation

        [CustomAuth]
        public ActionResult Index()
        {
            // invalid URL, redirect to summary-page
            return RedirectToAction("Index", "Summary");
        }

        [HttpGet]
        [CustomAuth]
        public ActionResult Create()
        {
            // invalid URL, redirect to summary-page
            return RedirectToAction("Index", "Summary");
        }

        [HttpGet]
        [CustomAuth]
        public ActionResult Edit()
        {
            // invalid URL, redirect to summary-page
            return RedirectToAction("Index", "Summary");
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Create(ReservationStaticModel model)
        {
            InitializeTables(ref model);

            // set initial time
            string lastTime = Session[SessionKeys.LastReservationTime] as string;

            if (string.IsNullOrEmpty(lastTime))
            {
                //lastTime = FindNearestTimeBy15MinsBlock(DateTime.Now).ToString(StringFormats.HHmm);
                model.InitialTime = string.Empty;
            }
            else
            {
                // convert date
                DateTime date;
                if (DateTime.TryParseExact(model.SummaryDate, StringFormats.yyyyMMdd, CultureInfo.CurrentCulture, DateTimeStyles.None, out date))
                {
                    model.InitialTime = string.Format(StringFormats.DisplayReservationTime, date.ToString(StringFormats.DisplayDate), lastTime);
                }
                else
                {
                    model.InitialTime = string.Empty;
                }
            }

            return View("Reservation", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Edit(ReservationStaticModel model)
        {
            var getBookingResponse = iRstSrvClient.Get().BookingDetailsByBookingID_00_00_002(Common.RestaurantID, model.BookingID.ToString(), Common.Token);
            var detail = getBookingResponse.BookingDetail;

            if (detail != null)
            {
                var sittingType = detail.IsShortSitting == 1 ? SittingType.ShortSitting : detail.IsMediumSitting == 1 ? SittingType.MediumSitting : SittingType.LongSitting;

                // create initial value
                model.GuestName = detail.FullName;
                model.PhoneNumber = detail.PhoneNumber;
                model.GuestNo = detail.NoOfGuests;
                model.LocationID = detail.LocationID.ToString();
                model.LocationName = detail.LocationName;

                CultureInfo currentCulture = Thread.CurrentThread.CurrentCulture;
                Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture("en-US");

                model.SummaryDate = detail.BookingDate.ToString(InputDateFormat);
                model.InitialTime = detail.BookingDate.ToString(InputDateFormat) + " - " + detail.BookingStartTime.Substring(0, detail.BookingStartTime.LastIndexOf(':'));

                Thread.CurrentThread.CurrentCulture = currentCulture;

                model.PersonID = detail.PersonID.ToString();
                model.SittingType = sittingType;
                model.Mode = Mode.Edit;
            }


            InitializeTables(ref model);

            return View("Reservation", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult ShowTable(ReservationStaticModel model)
        {
            model.Mode = Mode.Create;

            InitializeTables(ref model);

            return View("Reservation", model);
        }

        private void InitializeTables(ref ReservationStaticModel model)
        {
            // get table list
            var response = iRstSrvClient.Get().TableGetList_01_03_092(Common.RestaurantID, model.LocationID.ToString(), Common.Token);

            // calculate displaying table size
            model.Tables = Utils.CalculateTableWidth(response.Tables);
        }

        private DateTime FindNearestTimeBy15MinsBlock(DateTime datetime)
        {
            DateTime decreaseTime = datetime;
            DateTime inscreaseTime = datetime;

            while (decreaseTime.Minute % 15 != 0 && inscreaseTime.Minute % 15 != 0)
            {
                decreaseTime = decreaseTime.AddMinutes(-1);

                inscreaseTime = inscreaseTime.AddMinutes(1);
            }

            if (decreaseTime.Minute % 15 == 0)
            {
                return decreaseTime;
            }
            else
            {
                return inscreaseTime;
            }
        }

        private bool CheckTime(string time, string startTime, string endTime)
        {
            if (endTime.CompareTo(startTime) < 0)
            {
                return (startTime.CompareTo(time) <= 0 && time.CompareTo("24:00") <= 0) || (endTime.CompareTo(time) > 0 && time.CompareTo("00:00") >= 0);
            }
            else
            {
                return startTime.CompareTo(time) <= 0 && (endTime).CompareTo(time) > 0;
            }
        }

        private ShiftBlock[] CalculateShiftWidth(iRstSrv.SittingTime[] sittingTimes)
        {
            List<ShiftBlock> blocks = new List<ShiftBlock>();

            // check null
            if (sittingTimes == null)
            {
                return blocks.ToArray();
            }

            foreach (var shift in sittingTimes)
            {
                double rulerLength = 981;
                double unit = (double)rulerLength / (60 * 24);

                // check valid data
                if (shift.Start_Time == shift.End_Time)
                {
                    continue;
                }

                // make sure the date converting is okay

                try
                {
                    bool hasKitchenTimeClose = !shift.KitchenClosedTime.Equals("00:00:00");

                    // convert
                    DateTime sTime = DateTime.Now;
                    DateTime eTime = DateTime.Now;
                    DateTime cTime = DateTime.Now;


                    DateTime.TryParseExact(shift.Start_Time, "HH:mm:ss", System.Globalization.CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.None, out sTime);
                    DateTime.TryParseExact(shift.End_Time, "HH:mm:ss", System.Globalization.CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.None, out eTime);
                    if (hasKitchenTimeClose)
                    {
                        DateTime.TryParseExact(shift.KitchenClosedTime, "HH:mm:ss", System.Globalization.CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.None, out cTime);
                    }

                    bool isServeTimeExceed = false;
                    bool isShiftTimeExceed = false;

                    if (eTime.CompareTo(sTime) < 0)
                    {
                        eTime = eTime.AddDays(1);
                        isShiftTimeExceed = true;
                    }

                    if (hasKitchenTimeClose && cTime.CompareTo(sTime) < 0)
                    {
                        cTime = cTime.AddDays(1);
                        isServeTimeExceed = true;
                    }

                    // check different case
                    if (!isShiftTimeExceed)
                    {
                        if (hasKitchenTimeClose)
                        {
                            // create 1 normal block
                            blocks.Add(new ShiftBlock()
                            {
                                Left = (sTime.Hour * 60 + sTime.Minute) * unit,
                                Width = cTime.Subtract(sTime).TotalMinutes * unit,
                                Text = shift.EventName,
                                IsKitchenBlock = false
                            });

                            // create 1 kitchen block
                            blocks.Add(new ShiftBlock()
                            {
                                Left = (cTime.Hour * 60 + cTime.Minute) * unit,
                                Width = eTime.Subtract(cTime).TotalMinutes * unit,
                                IsKitchenBlock = true
                            });
                        }
                        else
                        {
                            // create 1 normal block
                            blocks.Add(new ShiftBlock()
                            {
                                Left = (sTime.Hour * 60 + sTime.Minute) * unit,
                                Width = eTime.Subtract(sTime).TotalMinutes * unit,
                                Text = shift.EventName,
                                IsKitchenBlock = false
                            });
                        }
                    }
                    else
                    {
                        if (hasKitchenTimeClose)
                        {
                            if (isServeTimeExceed)
                            {
                                double left = (sTime.Hour * 60 + sTime.Minute) * unit;
                                double width = eTime.Subtract(sTime).TotalMinutes * unit;
                                double kitchenWidth = eTime.Subtract(cTime).TotalMinutes * unit;
                                // create 2 normal blocks
                                blocks.Add(new ShiftBlock()
                                {
                                    Left = left,
                                    Width = rulerLength - left,
                                    Text = shift.EventName,
                                    IsKitchenBlock = false
                                });

                                blocks.Add(new ShiftBlock()
                                {
                                    Left = 0,
                                    Width = width + left - rulerLength - kitchenWidth,
                                    Text = shift.EventName,
                                    IsKitchenBlock = false
                                });
                                // create 1 kitchen block
                                blocks.Add(new ShiftBlock()
                                {
                                    Left = (cTime.Hour * 60 + cTime.Minute) * unit,
                                    Width = kitchenWidth,
                                    IsKitchenBlock = true
                                });
                            }
                            else
                            {
                                double left = (cTime.Hour * 60 + cTime.Minute) * unit;
                                double width = cTime.Subtract(sTime).TotalMinutes * unit;
                                double kitchenWidth = eTime.Subtract(cTime).TotalMinutes * unit;

                                // create 1 normal block
                                blocks.Add(new ShiftBlock()
                                {
                                    Left = (sTime.Hour * 60 + sTime.Minute) * unit,
                                    Width = width,
                                    Text = shift.EventName,
                                    IsKitchenBlock = false
                                });

                                // create 2 kitchen blocks
                                blocks.Add(new ShiftBlock()
                                {
                                    Left = left,
                                    Width = rulerLength - left,
                                    IsKitchenBlock = true
                                });

                                blocks.Add(new ShiftBlock()
                                {
                                    Left = 0,
                                    Width = (eTime.Hour * 60 + eTime.Minute) * unit,
                                    IsKitchenBlock = true
                                });
                            }
                        }
                        else
                        {
                            double left = (sTime.Hour * 60 + sTime.Minute) * unit;
                            double width = eTime.Subtract(sTime).TotalMinutes * unit;

                            // create 2 normal blocks
                            blocks.Add(new ShiftBlock()
                            {
                                Text = shift.EventName,
                                Left = left,
                                Width = rulerLength - left,
                                IsKitchenBlock = false
                            });

                            blocks.Add(new ShiftBlock()
                            {
                                Text = shift.EventName,
                                Left = 0,
                                Width = width + left - rulerLength,
                                IsKitchenBlock = false
                            });
                        }
                    }
                }
                catch { continue; }
            }

            return blocks.ToArray();
        }

        private bool CalculateEndTime(ref BookingModel model)
        {
            CultureInfo currentCulture = Thread.CurrentThread.CurrentCulture;
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture("en-US");
            DateTime date;
            bool result = DateTime.TryParseExact(model.ReservationTime, InputDateTimeFormat, CultureInfo.CurrentCulture, DateTimeStyles.None, out date);
            Thread.CurrentThread.CurrentCulture = currentCulture;

            if (result && date != null)
            {
                model.Date = date.ToString(StringFormats.yyyyMMdd);
                model.StartTime = date.ToString(StringFormats.HHmmss);
                model.EndTime = date.AddMinutes(model.Duration).ToString(StringFormats.HHmmss);
                return true;
            }
            else
            {
                return false;
            }

            /*
            var requestTime = TimeSync.ToLocalTime(model.MilliSecs);

            model.Date = requestTime.ToString(StringFormats.yyyyMMdd);
            model.StartTime = requestTime.ToString(StringFormats.HHmmss);
            model.EndTime = requestTime.AddMinutes(model.Duration).ToString(StringFormats.HHmmss);
            return true;
            */
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult AddBooking(BookingModel model)
        {
            try
            {
                if (CalculateEndTime(ref model))
                {
                    var addBookingResponse = iRstSrvClient.Get().BookingAddNew_00_00_002(Common.RestaurantID, model.EventID, model.TableID,
                        model.Date, model.StartTime, model.EndTime, model.PhoneNumber, model.GuestName, model.NoOfGuests, model.SittingTime, Common.Token);

                    if (addBookingResponse.Error == null || addBookingResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                    {
                        return Json(new { IsSucceed = true, BookingID = addBookingResponse.BookingID });
                    }
                    else
                    {
                        return Json(new { IsSucceed = false, Error = addBookingResponse.Error.ErrorCode.ToString() });
                    }
                }
            }
            catch { }

            return Json(new { IsSucceed = false });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult EditBooking(BookingModel model)
        {
            try
            {
                if (CalculateEndTime(ref model))
                {
                    var editBookingResponse = iRstSrvClient.Get().BookingEdit_00_00_002(Common.Restaurant.RestaurantID.ToString(), model.BookingID, model.EventID,
                        model.TableID, model.Date, model.StartTime, model.EndTime, model.PhoneNumber, model.GuestName, model.NoOfGuests, model.SittingTime, Common.Token);

                    if (editBookingResponse.Error == null || editBookingResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                    {
                        return Json(new { IsSucceed = true, BookingID = model.BookingID });
                    }
                    else
                    {
                        return Json(new { IsSucceed = false, Error = editBookingResponse.Error.ErrorCode.ToString() });
                    }
                }
            }
            catch { }

            return Json(new { IsSucceed = false });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Statuses(QueryStatusModel input)
        {
            StatusModel model = new StatusModel();

            #region Parse input datetime -> reserved date & start time

            CultureInfo currentCulture = Thread.CurrentThread.CurrentCulture;
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture("en-US");

            DateTime date;
            bool result = DateTime.TryParseExact(input.ReservationTime, InputDateTimeFormat, CultureInfo.CurrentCulture, DateTimeStyles.None, out date);
            Thread.CurrentThread.CurrentCulture = currentCulture;

            if (result && date != null)
            {
                date = FindNearestTimeBy15MinsBlock(date);
                input.Date = date.ToString(StringFormats.yyyyMMdd);
                input.StartTime = date.ToString(StringFormats.HHmm);

                // calculate start position
                model.StartPos = (date.Hour * 60 + date.Minute); // *((double)969 / 60 / 24);

                // store session
                Session[SessionKeys.LastReservationTime] = input.StartTime;
            }
            else
            {
                return Json(new { IsSucceed = false });
            }

            /*
            var clientTime = FindNearestTimeBy15MinsBlock(TimeSync.ToLocalTime(input.MilliSecs));
            input.Date = clientTime.ToString(StringFormats.yyyyMMdd);
            input.StartTime = clientTime.ToString(StringFormats.HHmm);

            // calculate start position
            model.StartPos = (clientTime.Hour * 60 + clientTime.Minute); // *((double)969 / 60 / 24);

            // store session
            Session[SessionKeys.LastReservationTime] = input.StartTime;
            */

            #endregion

            // get sitting time
            var getBizHoursResp = iRstSrvClient.Get().BizHoursByLocIDAndDate_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                input.LocationID, input.Date, Common.Token);

            model.Blocks = CalculateShiftWidth(getBizHoursResp.BizHours);

            if (getBizHoursResp.BizHours != null)
            {
                // get current shift
                string fullFormattedTime = input.StartTime + ":00";
                var currentShift = getBizHoursResp.BizHours.Where(bizHour => CheckTime(fullFormattedTime, bizHour.Start_Time, bizHour.End_Time));

                if (currentShift.Count() > 0)
                {
                    model.CurrentShift = currentShift.Single();
                    // incase have current shift

                    model.SittingType = input.SittingType == 0 ? SittingType.LongSitting : (SittingType)input.SittingType;
                }
                else
                {
                    model.SittingType = SittingType.Undetected;
                }
            }

            // calculate end time
            if (model.SittingType != SittingType.Undetected)
            {
                // convert to double
                double duration = 0;
                switch (model.SittingType)
                {
                    case SittingType.ShortSitting:
                        duration = Convert.ToDouble(model.CurrentShift.ShortSittingTime);
                        break;
                    case SittingType.MediumSitting:
                        duration = Convert.ToDouble(model.CurrentShift.MediumSittingTime);
                        break;
                    case SittingType.LongSitting:
                        duration = Convert.ToDouble(model.CurrentShift.LongSittingTime);
                        break;
                }

                // convert to time
                DateTime startTime;
                bool parseRet = DateTime.TryParseExact(input.StartTime, SystemTimeFormat, CultureInfo.CurrentCulture, DateTimeStyles.None, out startTime);

                // check parse result
                if (parseRet)
                {
                    input.EndTime = startTime.AddMinutes(duration).ToString(SystemTimeFormat);

                    // check kitchen-close-time
                    model.IsKitchenClose = CheckTime(input.StartTime + ":00", model.CurrentShift.KitchenClosedTime, model.CurrentShift.End_Time) &&
                        CheckTime(input.EndTime + ":00", model.CurrentShift.KitchenClosedTime, model.CurrentShift.End_Time);
                }
            }

            // get table statuses
            model.TableStatuses = null;

            if (model.SittingType != SittingType.Undetected)
            {
                var getTableStatusResponse = iRstSrvClient.Get().TableStatusGetListByLocIDAndTime_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                    input.LocationID, input.Date, input.StartTime, input.EndTime, input.PersonID, input.PhoneNumber, Common.Token);

                if (Utils.CheckAPIResponse(getTableStatusResponse))
                {
                    model.TableStatuses = getTableStatusResponse.TableStatuses;
                }
            }

            // get data success, return
            model.IsSucceed = true;
            return Json(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetGuestList(string LocationID, string PhoneNumber)
        {
            var getGuestListResponse = iRstSrvClient.Get().GuestNameGetList_00_00_001(Common.Restaurant.RestaurantID.ToString(), LocationID, PhoneNumber, Common.Token);

            if (getGuestListResponse.Error == null || getGuestListResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new
                {
                    IsSucceed = true,
                    GuestNames = getGuestListResponse.GuestNameList
                });
            }

            return Json(new { IsSucceed = false });
        }

        #endregion

        #region Booking detail

        [CustomAuth]
        public JsonResult GetBookingDetail(string bookingID)
        {
            object data = new
            {
                IsSucceed = false,
            };

            try
            {
                // Cal to API, get BookingData
                var response = iRstSrvClient.Get().BookingDetailsByBookingID_00_00_002(Common.RestaurantID, bookingID, Utils.GetToken());

                if (Utils.CheckAPIResponse(response))
                {
                    var detail = response.BookingDetail;

                    // convert date to formatter-string
                    var reservationDate = detail.BookingDate.ToString(StringFormats.yyyyMMdd);
                    var startTime = detail.BookingStartTime.Substring(0, detail.BookingStartTime.LastIndexOf(':'));

                    // get biz hour
                    var getSittingTimeResponse = iRstSrvClient.Get().BizHoursByDateAndTime_00_00_001(Common.RestaurantID,
                        detail.LocationID.ToString(), reservationDate, startTime, Common.Token);

                    if (!Utils.CheckAPIResponse(getSittingTimeResponse))
                    {
                        return Json(Common.JsonFail);
                    }

                    if (getSittingTimeResponse.BizHour != null)
                    {

                        // Set value into data in view
                        var sittingType = detail.IsShortSitting == 1 ? SittingType.ShortSitting : detail.IsMediumSitting == 1 ? SittingType.MediumSitting : SittingType.LongSitting;

                        data = new
                        {
                            IsSucceed = true,
                            BookingDate = detail.BookingDate,
                            Date = ConvertDate(detail.BookingDate),
                            Location = detail.LocationName,
                            LocationID = detail.LocationID,
                            MenuType = detail.MenuType,
                            InitialTime = detail.BookingDate.ToString(InputDateFormat) + " at " + detail.BookingStartTime.Substring(0, detail.BookingStartTime.LastIndexOf(':')),
                            //StartTime = ConvertTime(detail.BookingStartTime),
                            //EndTime = ConvertTime(detail.BookingEndTime),
                            StartTime = detail.BookingStartTime.Substring(0, detail.BookingStartTime.LastIndexOf(':')),
                            EndTime = detail.BookingEndTime.Substring(0, detail.BookingEndTime.LastIndexOf(':')),
                            TableID = detail.TableID,
                            NumberGuest = detail.NoOfGuests,
                            Name = detail.FullName,
                            Email = detail.Email,
                            Phone = detail.PhoneNumber,
                            iMyTable = detail.iMyTableReserved,
                            GuestOnTime = detail.IsOntime,
                            GuestRate = detail.GuestRating,
                            BillTotalAmount = string.IsNullOrEmpty(detail.BillAmount) ? "" : detail.BillAmount.Substring(0, detail.BillAmount.Length - 2),
                            SittingType = sittingType,
                            IsConfirmed = detail.IsConfirmed,
                            Comments = string.IsNullOrEmpty(detail.Comments) ? string.Empty : detail.Comments,
                            PersonID = detail.PersonID,
                            TableNo = detail.TableNo,
                            BizHour = getSittingTimeResponse.BizHour
                        };
                    }
                    else
                    {
                        data = new
                        {
                            IsSucceed = true,
                            BookingDate = detail.BookingDate,
                            Date = ConvertDate(detail.BookingDate),
                            NumberGuest = detail.NoOfGuests,
                            Name = detail.FullName,
                            Email = detail.Email,
                            Phone = detail.PhoneNumber,
                            iMyTable = detail.iMyTableReserved,
                            GuestOnTime = detail.IsOntime,
                            GuestRate = detail.GuestRating,
                            BillTotalAmount = string.IsNullOrEmpty(detail.BillAmount) ? "" : detail.BillAmount.Substring(0, detail.BillAmount.Length - 2),
                            IsConfirmed = detail.IsConfirmed,
                            Comments = string.IsNullOrEmpty(detail.Comments) ? string.Empty : detail.Comments,
                            PersonID = detail.PersonID,
                            StartTime = detail.BookingStartTime.Substring(0, detail.BookingStartTime.LastIndexOf(':')),
                            SittingType = SittingType.LongSitting
                        };
                    }

                    return Json(data);
                }
            }
            catch (Exception e)
            {
            }

            return Json(Common.JsonFail);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetBizHour(string LocationID, string BookingDate, string StartTime)
        {
            var response = iRstSrvClient.Get().BizHoursByDateAndTime_00_00_001(Common.RestaurantID, LocationID, BookingDate,
                StartTime, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                return Json(new
                {
                    BizHour = response.BizHour
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetTable(string LocationID, string LayoutCode)
        {
            var response = iRstSrvClient.Get().TableGetList_01_03_092(Common.RestaurantID, LocationID, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                if (response.Tables != null)
                {
                    var query = response.Tables.Where(t => t.LayoutCode == LayoutCode);

                    if (query.Count() == 1)
                    {
                        var table = query.Single();

                        return Json(new
                        {
                            IsSucceed = true,
                            ChairNo = table.NoOfChairs,
                            TableID = table.TableID
                        });
                    }
                }

                return Json(new
                {
                    IsSucceed = true,
                    ChairNo = -1
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [CustomAuth]
        public JsonResult Cancel(string textInput, string bookingId)
        {
            // Call API
            var response = iRstSrvClient.Get().BookingCancel_00_00_001(Utils.GetRestaurentID().ToString(), bookingId, textInput, Utils.GetToken());

            if (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new { Message = Msg.M014, IsSucceed = true });
            }
            else
            {
                return Json(new { Message = string.Format(Msg.M015, response.Error.ErrorMessage), IsSucceed = false });
            }
        }

        /// <summary>
        /// handle BlogGuest from user
        /// </summary>
        /// <param name="TextInput"></param>
        /// <param name="BookingID"></param>
        /// <returns></returns>
        [CustomAuth]
        public JsonResult BlockGuest(string textInput, string bookingId)
        {
            // Call API
            var response = iRstSrvClient.Get().BookingBlockPersonSet_00_00_001(Utils.GetRestaurentID().ToString(), bookingId, textInput, Utils.GetToken());

            if (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new { Message = Msg.M016 });
            }
            else
            {
                return Json(new { Message = string.Format(Msg.M015, response.Error.ErrorMessage) });
            }
        }

        /// <summary>
        /// HAndle event No Show from screen
        /// </summary>
        /// <param name="TextInput"></param>
        /// <param name="BookingID"></param>
        /// <returns></returns>
        [CustomAuth]
        public JsonResult ReportGuestNoShow(string bookingId)
        {
            var response = iRstSrvClient.Get().BookingNoShowSet_00_00_001(Utils.GetRestaurentID().ToString(), bookingId, Utils.GetToken());

            // Check result and set message
            if (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                // Success
                return Json(new { Message = Msg.M017 });
            }
            else
            {
                // Error
                return Json(new { Message = response.Error.ErrorMessage });
            }
        }

        /// <summary>
        /// Show history list by PersonID
        /// </summary>
        /// <param name="PersonID"></param>
        /// <returns></returns>
        [CustomAuth]
        public JsonResult GetHistory(string personID)
        {
            // Call API 
            try
            {
                // Call API
                var response = iRstSrvClient.Get().BookingsHistoryByPersonID_00_00_001(Utils.GetRestaurentID().ToString(), personID, Common.Token);
                var bookings = response.BookingsHistoryList;

                var list = new List<object>();

                foreach (var detail in bookings)
                {

                    string formattedTime = String.Format("{0}<br />{1}", ConvertTime(detail.BookingStartTime), ConvertTime(detail.BookingEndTime));

                    var data = new
                    {
                        BookingDate = detail.BookingDate,
                        StartTime = ConvertTime(detail.BookingStartTime),
                        EndTime = ConvertTime(detail.BookingEndTime),
                        Time = formattedTime,
                        iMyTableReserved = detail.iMyTableReserved == 1,
                        LocationName = detail.LocationName,
                        MenuType = detail.MenuType,
                        TableNo = detail.TableNo,
                        NoOfGuests = detail.NoOfGuests,
                        IsOnTime = detail.IsOntime == 1,
                        GuestRating = detail.GuestRating,
                        BillAmount = (string.IsNullOrEmpty(detail.BillAmount) ? "" : detail.BillAmount.Substring(0, detail.BillAmount.Length - 2))
                    };

                    list.Add(data);
                }

                // Show screen
                return Json(new { ResultData = list, Name = response.Person.PersonName });
            }
            catch
            {
                return Json(new { });
            }
        }

        private string ConvertTime(string serverTime)
        {
            try
            {
                DateTime time = DateTime.ParseExact(serverTime, StringFormats.HHmmss, CultureInfo.CurrentCulture);
                return time.ToString(Thread.CurrentThread.CurrentCulture.DateTimeFormat.ShortTimePattern);
            }
            catch
            {
                return string.Empty;
            }
        }

        private string ConvertDate(DateTime serverDate)
        {
            return serverDate.ToString(Thread.CurrentThread.CurrentCulture.DateTimeFormat.ShortDatePattern);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Save(DetailModel model)
        {
            try
            {
                var response = iRstSrvClient.Get().BookingDetailsSet_00_00_004(Common.RestaurantID, model.BookingID,
                    string.IsNullOrEmpty(model.BillAmount) ? string.Empty : model.BillAmount, model.Feedback, model.IsOnTime,
                    model.IsConfirmed, string.IsNullOrEmpty(model.Comments) ? string.Empty : model.Comments, model.BookingDate,
                    model.StartTime, model.EndTime, model.SittingTime, model.TableID, model.NoOfGuests, model.EventID, Common.Token);

                return Json(new
                {
                    IsSuccess = Utils.CheckAPIResponse(response)
                });
            }
            catch
            {
                return Json(Common.JsonFail);
            }
        }

        [CustomAuth]
        public ActionResult CheckBeforeSave(DetailModel model)
        {
            var response = iRstSrvClient.Get().BookingDetailsSet_Check_00_00_003(Common.RestaurantID, model.LocationID, model.BookingID,
                model.TableID, model.BookingDate, model.StartTime, model.SittingTime, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                var startTime = string.Empty;
                var endTime = string.Empty;

                if (response.IsSucceed == 1)
                {
                    startTime = response.NewStartTime.Substring(0, response.NewStartTime.LastIndexOf(":"));
                    endTime = response.NewEndTime.Substring(0, response.NewEndTime.LastIndexOf(":"));
                }

                return Json(new
                {
                    IsSucceed = true,
                    StartTime = startTime,
                    EndTime = endTime,
                    Code = response.IsSucceed
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        #endregion
    }
}
