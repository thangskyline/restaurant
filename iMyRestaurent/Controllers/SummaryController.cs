using System;
using System.Globalization;
using System.Threading;
using System.Web.Mvc;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    [HandleError]
    public class SummaryController : Controller
    {
        private const string InputDateFormat = "ddd, d MMM yyyy";
        private const string SystemDateFormat = "yyyyMMdd";
        private const string SystemTimeFormat = "HH:mm:ss";
        private const string OpenState = "open";

        //
        // GET: /Summary/
        [CustomAuth]
        public ActionResult Index()
        {
            SummaryModel model = new SummaryModel();

            return Index(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Index(SummaryModel model)
        {
            GetLocationData(ref model);

            return View("Summary", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckSimpleBooking(DetailModel model)
        {
            var checkResponse = iRstSrvClient.Get().BookingAddNew_Simple_Check_00_00_004(Common.RestaurantID, model.LocationID, model.TableID, model.BookingDate,
                model.StartTime, model.SittingTime, Common.Token);

            if (Utils.CheckAPIResponse(checkResponse))
            {
                return Json(new
                {
                    IsSucceed = true,
                    NewStartTime = checkResponse.NewStartTime,
                    NewEndTime = checkResponse.NewEndTime,
                    Code = checkResponse.IsSucceed
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult SimpleAddBooking(DetailModel model)
        {
            var addBookingResponse = iRstSrvClient.Get().BookingAddNew_00_00_003(Common.RestaurantID, string.IsNullOrEmpty(model.BillAmount) ? string.Empty : model.BillAmount,
                model.Feedback, model.IsOnTime, model.IsConfirmed, string.IsNullOrEmpty(model.Comments) ? string.Empty : model.Comments,
                model.BookingDate, model.StartTime, model.EndTime, model.SittingTime, model.TableID, model.NoOfGuests, model.EventID,
                model.GuestPhone, model.GuestName, Common.Token);

            if (Utils.CheckAPIResponse(addBookingResponse))
            {
                return Json(new { IsSucceed = true, BookingID = addBookingResponse.BookingID });
            }
            else
            {
                return Json(new { IsSucceed = false, Error = addBookingResponse.Error.ErrorCode.ToString() });
            }
        }

        [HttpPost]
        public ActionResult GetSummary(SummaryModel model)
        {
            try
            {
                model.Summary = iRstSrvClient.Get().SummaryReservations_00_00_001(Utils.GetRestaurentID().ToString(), model.LocationID.ToString(), model.Date, Utils.GetToken());

                CheckCloseDay(ref model);

                CreateSummary(ref model);

                return Json(model);
            }
            catch
            {
                return Json(null);
            }
        }

        private void CreateSummary(ref SummaryModel model)
        {
            if (!model.IsClose)
            {
                DateTime shiftStartTime = DateTime.Now;
                DateTime shiftEndTime = DateTime.Now;
                DateTime startTime = DateTime.MaxValue;
                DateTime endTime = DateTime.MinValue;

                try
                {
                    foreach (var shift in model.Summary.BizHourList)
                    {
                        // convert
                        bool sRes = DateTime.TryParseExact(shift.Start_Time, "HH:mm:ss", System.Globalization.CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.None, out shiftStartTime);
                        bool eRes = DateTime.TryParseExact(shift.End_Time, "HH:mm:ss", System.Globalization.CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.None, out shiftEndTime);

                        if (sRes && eRes && (shiftStartTime.CompareTo(shiftEndTime) != 0))
                        {
                            // compare shift-start-time to shift-end-time
                            if (shiftStartTime.CompareTo(shiftEndTime) > 0)
                            {
                                // add 1 day to shift-end-time
                                shiftEndTime = shiftEndTime.AddDays(1);
                            }

                            // compare
                            if (startTime.CompareTo(shiftStartTime) > 0)
                            {
                                startTime = shiftStartTime;
                            }

                            if (endTime.CompareTo(shiftEndTime) < 0)
                            {
                                endTime = shiftEndTime;
                            }
                        }
                    }

                    // create boundary
                    model.BoundaryStartTime = startTime.AddMinutes(-1);
                    model.BoundaryEndTime = endTime.AddMinutes(1);

                    while (model.BoundaryStartTime.Minute != 30 && model.BoundaryStartTime.Minute != 0)
                    {
                        model.BoundaryStartTime = model.BoundaryStartTime.AddMinutes(-1);
                    }

                    while (model.BoundaryEndTime.Minute != 30 && model.BoundaryEndTime.Minute != 0)
                    {
                        model.BoundaryEndTime = model.BoundaryEndTime.AddMinutes(1);
                    }

                    // create milestone
                    DateTime mTime = model.BoundaryStartTime.AddMinutes(30);
                    int addingMins = 30;

                    while (mTime.CompareTo(model.BoundaryEndTime) < 0)
                    {
                        if (mTime.Hour % 3 == 0 && mTime.Minute == 0)
                        {
                            Milestone milestone = new Milestone();
                            milestone.Value = mTime.ToString(StringFormats.HHmm);

                            // calculate number of blocks
                            if (model.Milestones.Count == 0)
                            {
                                // first milestone
                                milestone.Block = (int)mTime.Subtract(model.BoundaryStartTime).TotalMinutes / 15 - 1;
                            }
                            else
                            {
                                milestone.Block = 8;
                            }

                            model.Milestones.Add(milestone);
                            addingMins = 60 * 3;
                        }

                        mTime = mTime.AddMinutes(addingMins);
                    }

                    TimeSpan span = model.BoundaryEndTime.Subtract(model.BoundaryStartTime);

                    model.BlockNo = (int)span.TotalMinutes / 15;

                    model.RootTime = model.BoundaryStartTime.ToString(StringFormats.HHmm);
                }
                catch
                {
                    model.IsClose = true;
                }
            }
        }

        private void CheckCloseDay(ref SummaryModel model)
        {
            // check close day
            if (model.Summary.BizHourList == null)
            {
                model.IsClose = true;
                return;
            }
            else
            {
                model.IsClose = true;
                // check each shift
                foreach (var shift in model.Summary.BizHourList)
                {
                    // check state
                    if (shift.State.Equals(OpenState, StringComparison.CurrentCultureIgnoreCase))
                    {
                        model.IsClose = false;
                        break;
                    }
                }
            }


        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckBookingDrag(CheckDragModel model)
        {
            try
            {
                DateTime rootTime = DateTime.Parse(model.BoundaryStartDate);

                // calculate new start-time
                DateTime startTime = rootTime.AddMinutes(15 * (model.Block));

                // calculate new end-time
                DateTime endTime = startTime.AddMinutes(15 * model.Length);

                var response = iRstSrvClient.Get().BookingDragDropCheck_00_00_002(Common.RestaurantID, model.BookingID, model.EventID,
                    model.TableID, model.BookingDate, startTime.ToString(StringFormats.HHmmss),
                    endTime.ToString(StringFormats.HHmmss), Common.Token);

                if (Utils.CheckAPIResponse(response) && response.IsSucceed == 1)
                {
                    DateTime bTime;
                    DateTime.TryParseExact(rootTime.ToString(SystemTimeFormat), SystemTimeFormat, CultureInfo.CurrentCulture,
                        DateTimeStyles.None, out bTime);

                    DateTime newStartTime;
                    DateTime.TryParseExact(response.NewStartTime, StringFormats.HHmmss, CultureInfo.CurrentCulture,
                        DateTimeStyles.None, out newStartTime);

                    double block = newStartTime.Subtract(rootTime).TotalMinutes / 15;

                    return Json(new
                    {
                        IsSucceed = true,
                        Block = block,
                        BookingID = model.BookingID,
                        EventID = model.EventID,
                        TableID = model.TableID,
                        BookingDate = model.BookingDate,
                        StartTime = response.NewStartTime.Substring(0, response.NewStartTime.LastIndexOf(":")),
                        EndTime = response.NewEndTime.Substring(0, response.NewEndTime.LastIndexOf(":")),
                        BoundaryStartTime = model.BoundaryStartDate,
                    });
                }
            }
            catch { }
            return Json(Common.JsonFail);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult SubmitBookingDrag(SubmitDragModel model)
        {
            try
            {
                var response = iRstSrvClient.Get().BookingDragDropEdit_00_00_001(Common.RestaurantID, model.BookingID, model.EventID,
                    model.TableID, model.BookingDate, model.StartTime + ":00", model.EndTime + ":00", Common.Token);

                if (Utils.CheckAPIResponse(response))
                {
                    // convert date-time
                    DateTime rootTime = DateTime.Parse(model.BoundaryStartTime);

                    DateTime startTime;
                    DateTime.TryParseExact(model.StartTime, StringFormats.HHmm, CultureInfo.CurrentCulture,
                        DateTimeStyles.None, out startTime);

                    DateTime endTime;
                    DateTime.TryParseExact(model.EndTime, StringFormats.HHmm, CultureInfo.CurrentCulture,
                        DateTimeStyles.None, out endTime);

                    if (endTime.CompareTo(startTime) < 0)
                    {
                        endTime = endTime.AddDays(1);
                    }

                    // calculate new block
                    double block = startTime.Subtract(rootTime).TotalMinutes / 15;
                    double length = endTime.Subtract(startTime).TotalMinutes / 15;

                    return Json(new
                    {
                        IsSucceed = true,
                        Block = block,
                        Length = length
                    });
                }
            }
            catch { }

            return Json(Common.JsonFail);
        }

        private void GetLocationData(ref SummaryModel model)
        {
            // get list of locations
            model.Locations = iRstSrvClient.Get().LocationsByRestaurantID_00_00_001(Utils.GetRestaurentID().ToString(), Utils.GetToken());
        }

        private void ConvertDate(ref SummaryModel model)
        {
            CultureInfo currentCulture = Thread.CurrentThread.CurrentCulture;
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture("en-US");

            DateTime date;
            bool result = DateTime.TryParseExact(model.InputDate, InputDateFormat, CultureInfo.CurrentCulture, DateTimeStyles.None, out date);
            Thread.CurrentThread.CurrentCulture = currentCulture;

            if (result && date != null)
            {
                model.Date = date.ToString(SystemDateFormat);
            }
            else
            {
                model.Date = DateTime.Now.ToString(SystemDateFormat);
                model.InputDate = DateTime.Now.ToString(InputDateFormat);
            }
        }
    }
}
