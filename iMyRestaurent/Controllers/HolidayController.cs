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
using System.Web.Script.Serialization;

namespace iMyRestaurent.Controllers
{
    public class HolidayController : Controller
    {
        #region Holiday

        [HttpPost]
        [CustomAuth]
        public ActionResult InitializePublicHolidayDialog(string token)
        {
            var getCountryResponse = iRstSrvClient.Get().CountryGetList_00_00_001(Common.Restaurant.RestaurantID.ToString(), Common.Token);

            if (getCountryResponse.Error == null || getCountryResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new
                {
                    IsSucceed = true,
                    Countries = getCountryResponse.Countries
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public JsonResult GetPublicHolidays(string countryId, string year, string locationId)
        {
            var getPublicHolidayResponse = iRstSrvClient.Get().PublicHolidayGetList_00_00_001(Common.RestaurantID, countryId, locationId, year, Common.Token);

            if (getPublicHolidayResponse.Error == null || getPublicHolidayResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new
                {
                    IsSucceed = true,
                    PublicHolidays = getPublicHolidayResponse.PublicHolidays
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
        [HttpPost]
        [CustomAuth]
        public JsonResult GetPublicHolidayList(string countryId, string year, string locationId)
        {
            var getPublicHolidayResponse = iRstSrvClient.Get().PublicHolidayGetList_00_00_002(Common.RestaurantID, countryId, locationId, year, Common.Token);

            if (getPublicHolidayResponse.Error == null || getPublicHolidayResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new
                {
                    IsSucceed = true,
                    PublicHolidays = getPublicHolidayResponse.PublicHolidays.OrderBy(x => x.PublicHolidayID)
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult SavePublicHolidays(string LocationID, string Input, string Token)
        {
            List<MenuInput> menus = Session[Constants.MenuPrefix + Token] as List<MenuInput>;

            string[] frags = Input.Split('|');

            List<OverrideModel> list = new List<OverrideModel>();

            foreach (string holidayText in frags)
            {
                string[] data = holidayText.Split(',');

                OverrideModel obj = new OverrideModel();

                obj.DayID = Convert.ToInt32(data[1]);
                obj.OverrideID = Convert.ToInt32(data[2]);
                obj.IsOverride = Convert.ToInt32(data[3]);

                obj.EventID = menus.Where(m => m.SittingID.ToString().Equals(data[0])).Single().SittingTimes.Where(s => s.Day.Equals(data[4])).Select(s => s.EventID).Single();

                list.Add(obj);
            }

            StringBuilder xmlBuilder = new StringBuilder();
            xmlBuilder.Append("<holidays>");
            foreach (var overrideModel in list)
            {
                xmlBuilder.Append("<holidayoverride>");
                xmlBuilder.AppendFormat("<dayid>{0}</dayid>", overrideModel.DayID);
                xmlBuilder.AppendFormat("<overrideid>{0}</overrideid>", overrideModel.OverrideID);
                xmlBuilder.AppendFormat("<isoverride>{0}</isoverride>", overrideModel.IsOverride);
                xmlBuilder.AppendFormat("<eventid>{0}</eventid>", overrideModel.EventID);
                xmlBuilder.Append("</holidayoverride>");
            }
            xmlBuilder.Append("</holidays>");

            var savePublicHolidayResponse = iRstSrvClient.Get().PublicHolidaysOverrideApply_00_00_001(Common.RestaurantID, LocationID, xmlBuilder.ToString(), Common.Token);

            return Json(new
            {
                IsSucceed = Utils.CheckAPIResponse(savePublicHolidayResponse)
            });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetSpecialDays(string locationId, string year)
        {
            var getSpecialDayResponse = iRstSrvClient.Get().SpecialDaysForOverrideGetList_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                locationId, year, Common.Token);

            if (Utils.CheckAPIResponse(getSpecialDayResponse))
            {
                return Json(new
                {
                    IsSucceed = true,
                    SpecialDays = getSpecialDayResponse.SpecialDayList
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult AddSpecialDay(string LocationID, string Year, string Date, string Name)
        {
            try
            {
                string fullDate = Date + " " + Year;

                #region convert date to 'yyyyMMdd'
                // assign default date
                CultureInfo currentCulture = Thread.CurrentThread.CurrentCulture;
                Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture("en-US");

                DateTime date = DateTime.ParseExact(fullDate, Constants.InputDateFormat, CultureInfo.CurrentCulture);
                // restore culture
                Thread.CurrentThread.CurrentCulture = currentCulture;
                #endregion

                // check exist
                var getAllHolidaysResponse = iRstSrvClient.Get().PublicHolidaysGetMasterList_00_00_001(Common.RestaurantID, LocationID, Year, Common.Token);

                if (Utils.CheckAPIResponse(getAllHolidaysResponse))
                {
                    bool canSave = true;

                    if (getAllHolidaysResponse.PublicHolidayList != null)
                    {
                        var matchedItems = getAllHolidaysResponse.PublicHolidayList.Where(h => h.Date.ToString(Constants.SystemDateFormat).Equals(date.ToString(Constants.SystemDateFormat)));
                        canSave = matchedItems.Count() == 0;
                    }
                    if (canSave)
                    {
                        var addSpecialDayResponse = iRstSrvClient.Get().SpecialDayAddNew_00_00_001(Common.RestaurantID, LocationID, Name, date.ToString(StringFormats.yyyyMMdd), Common.Token);

                        if (Utils.CheckAPIResponse(addSpecialDayResponse))
                        {
                            int day = (int)date.DayOfWeek;
                            day--;
                            if (day == -1) { day = 6; }

                            return Json(new
                            {
                                IsSucceed = true,
                                CanSave = true,
                                DayID = addSpecialDayResponse.DayID,
                                Date = Date,
                                Day = day,
                                Name = Name,
                            });
                        }
                    }
                    else
                    {
                        return Json(new
                        {
                            IsSucceed = true,
                            CanSave = false
                        });
                    }
                }
            }
            catch { }

            return Json(Common.JsonFail);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult SaveSpecialDays(string LocationID, string Input, string Token)
        {
            List<MenuInput> menus = Session[Constants.MenuPrefix + Token] as List<MenuInput>;

            string[] frags = Input.Split('|');

            List<OverrideModel> list = new List<OverrideModel>();

            foreach (string holidayText in frags)
            {
                string[] data = holidayText.Split(',');

                OverrideModel obj = new OverrideModel();

                obj.DayID = Convert.ToInt32(data[1]);
                obj.OverrideID = Convert.ToInt32(data[2]);
                obj.IsOverride = Convert.ToInt32(data[3]);

                obj.EventID = menus.Where(m => m.SittingID.ToString().Equals(data[0])).Single().SittingTimes.Where(s => s.Day.Equals(data[4])).Select(s => s.EventID).Single();

                list.Add(obj);
            }

            StringBuilder xmlBuilder = new StringBuilder();
            xmlBuilder.Append("<holidays>");
            foreach (var overrideModel in list)
            {
                xmlBuilder.Append("<holidayoverride>");
                xmlBuilder.AppendFormat("<dayid>{0}</dayid>", overrideModel.DayID);
                xmlBuilder.AppendFormat("<overrideid>{0}</overrideid>", overrideModel.OverrideID);
                xmlBuilder.AppendFormat("<isoverride>{0}</isoverride>", overrideModel.IsOverride);
                xmlBuilder.AppendFormat("<eventid>{0}</eventid>", overrideModel.EventID);
                xmlBuilder.Append("</holidayoverride>");
            }
            xmlBuilder.Append("</holidays>");

            var saveSpecialDayResponse = iRstSrvClient.Get().SpecialDaysOverrideApply_00_00_001(Common.RestaurantID, LocationID, xmlBuilder.ToString(), Common.Token);
            //var response = AbstractServiceInvoker.Get().SpecialDaysOverrideApply(LocationID, xmlBuilder.ToString(), Utils.GetToken());

            return Json(new
            {
                IsSucceed = Utils.CheckAPIResponse(saveSpecialDayResponse)
            });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetOverrideList(string LocationID, string Year, string Token)
        {
            var getOverrideListResponse = iRstSrvClient.Get().PublicHolidayGetOverrideList_00_00_001(Common.RestaurantID, LocationID, Year, Common.Token);

            //var response = AbstractServiceInvoker.Get().PublicHolidayGetOverrideList(LocationId, year, Utils.GetToken());

            if (Utils.CheckAPIResponse(getOverrideListResponse))
            {

                if (getOverrideListResponse.PublicHolidays != null)
                {
                    // store in session for future use
                    Session[Constants.HolidayPrefix + Token] = getOverrideListResponse.PublicHolidays.Where(s => s.EventIDList != null && s.EventIDList.Length > 0).ToArray();
                }

                return Json(new
                {
                    Holidays = getOverrideListResponse.PublicHolidays
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult ShowHoliday(string DayID, string Token)
        {
            try
            {
                var holidays = Session[Constants.HolidayPrefix + Token] as iRstSrv.AppliedOverrideDay[];

                var matchedItem = holidays.Where(h => h.DayID.ToString().Equals(DayID)).Single();

                var menus = Session[Constants.MenuPrefix + Token] as List<MenuInput>;

                List<int> sittingIDs = new List<int>();

                foreach (int eventID in matchedItem.EventIDList)
                {
                    var input = menus.Where(m => ContainsEventID(m.SittingTimes, eventID));

                    if (input.Count() > 0)
                    {
                        sittingIDs.Add(input.Single().SittingID);
                    }
                }

                // calculate day
                int day = (int)matchedItem.Date.DayOfWeek - 1;
                if (day == -1) day = 6;

                return Json(new
                {
                    HasMatchedItem = true,
                    Data = matchedItem,
                    SitingIDs = sittingIDs.ToArray(),
                    Day = day
                });
            }
            catch
            {
                return Json(new
                {
                    HasMatchedItem = false
                });
            }
        }

        private bool ContainsEventID(List<iRstSrv.SittingTime> sittingTimes, int eventID)
        {
            var query = sittingTimes.Where(s => s.EventID == eventID);

            return query.Count() > 0;
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteSpecialDay(string DayID)
        {
            var deleteSpecialDayResponse = iRstSrvClient.Get().SpecialDayDelete_00_00_001(Common.RestaurantID, DayID, Common.Token);

            return Json(new
            {
                IsSucceed = Utils.CheckAPIResponse(deleteSpecialDayResponse)
            });
        }

        #endregion
        [CustomAuth]
        public ActionResult HolidaySetting(string LocationIDForHoliday, string LocationNameForHoliday,string Token,string SummaryLocationID,string SummaryDate, string Mode)
        {
            //var menuInputList = Session[Constants.MenuPrefix + Token] as List<MenuInput>;
            ViewBag.LocationID = LocationIDForHoliday;
            ViewBag.Title = "iMyRestaurant - " + LocationNameForHoliday + " year planner";
            ViewBag.LocationName = LocationNameForHoliday;
            ViewBag.Token = Token;
            ViewBag.SummaryLocationID = SummaryLocationID;
            ViewBag.SummaryDate = SummaryDate;
            ViewBag.Mode = Mode;
            return View();
        }
        public ActionResult Template()
        {
            return View();
        }
        public DateRange GetDateRange(string YearMonth)
        {
            DateTime dt = ParseDateTime(YearMonth);
            DateTime StartDate = new DateTime();
            DateTime EndDate;
            //DayOfWeek.
            switch (dt.DayOfWeek)
            {
                case DayOfWeek.Monday:
                    StartDate = dt.AddDays(-7);
                    break;
                case DayOfWeek.Tuesday:
                    StartDate = dt.AddDays(-1);
                    break;
                case DayOfWeek.Wednesday:
                    StartDate = dt.AddDays(-2);
                    break;
                case DayOfWeek.Thursday:
                    StartDate = dt.AddDays(-3);
                    break;
                case DayOfWeek.Friday:
                    StartDate = dt.AddDays(-4);
                    break;
                case DayOfWeek.Saturday:
                    StartDate = dt.AddDays(-5);
                    break;
                case DayOfWeek.Sunday:
                    StartDate = dt.AddDays(-6);
                    break;
            }
            EndDate = StartDate.AddDays(41);
            DateRange dr = new DateRange();
            dr.StartDate = StartDate;
            dr.EndDate = EndDate;
            return dr;
        }
        public DateTime ParseDateTime(string YearMonth)
        {
            string year = YearMonth.Substring(0, 4);
            string month = YearMonth.Substring(4, 2);
            return new DateTime(Convert.ToInt32(year), Convert.ToInt32(month), 1);
        }
        [CustomAuth]
        public ActionResult RequestNewData(string StartDate, string EndDate, string LocationID, string CountryID)
        {
            //call API            
            // default country code is Australia
            if (CountryID.Equals("0"))
                CountryID = "1";
            var apiSpecialDay = iRstSrvClient.Get().SpecialDaysGetList_00_00_002(Common.RestaurantID, LocationID, CountryID, StartDate, EndDate, Common.Token);

            if (Utils.CheckAPIResponse(apiSpecialDay))
            {
                return Json(new
                {
                    IsSucceed = true,
                    SpecialDaysList = apiSpecialDay.SpecialDaysList
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
        [HttpPost]
        [CustomAuth]
        public ActionResult InitializePublicHoliday()
        {
            var getCountryResponse = iRstSrvClient.Get().CountryGetList_00_00_001(Common.Restaurant.RestaurantID.ToString(), Common.Token);

            if (Utils.CheckAPIResponse(getCountryResponse))
            {
                return Json(new
                {
                    IsSucceed = true,
                    Countries = getCountryResponse.Countries
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
        [HttpPost]
        [CustomAuth]
        public ActionResult SpecialDaysOverrideApply(string LocationID, string SpecialDate, string EventID, string Name)
        {
            var getSpecialDayOverrideApply = iRstSrvClient.Get().SpecialDaysOverrideApply_00_00_002(Common.RestaurantID, LocationID, SpecialDate, Name, EventID, Common.Token);

            if (Utils.CheckAPIResponse(getSpecialDayOverrideApply))
            {
                return Json(new
                {
                    IsSucceed = true
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [CustomAuth]
        public ActionResult InitData(string LocationID, string StartDate, string EndDate,string Token)
        {
            var menuInputList = Session[Constants.MenuPrefix + Token] as List<MenuInput>;
            var apiMasterData = iRstSrvClient.Get().BizHoursGetMasterList_00_00_002(Common.RestaurantID, LocationID, Common.Token);
            var apiPublicHolidaysCountryIDGet = iRstSrvClient.Get().PublicHolidaysCountryIDGet_00_00_002(Common.RestaurantID, LocationID, DateTime.Now.Year.ToString(), Common.Token);

            if (Utils.CheckAPIResponse(apiMasterData) && Utils.CheckAPIResponse(apiPublicHolidaysCountryIDGet))
            {
                int CountryID = 0;
                if (apiPublicHolidaysCountryIDGet.CountryID == 0)
                    CountryID = 1;
                else
                    CountryID = apiPublicHolidaysCountryIDGet.CountryID;
                var apiSpecialDay = iRstSrvClient.Get().SpecialDaysGetList_00_00_002(Common.RestaurantID, LocationID, CountryID.ToString(), StartDate, EndDate, Common.Token);
                return Json(new
                {
                    IsSucceed = true,
                    SittingList = apiMasterData.SittingsList,
                    CountryID = CountryID,
                    SpecialDaysList = apiSpecialDay.SpecialDaysList,
                    MenuInputList = menuInputList
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }
        [CustomAuth]
        public ActionResult SpecialDayDelete(string OverrideID)
        {
            var apiSpecialDayDelete = iRstSrvClient.Get().SpecialDayDelete_00_00_002(Common.RestaurantID, OverrideID, Common.Token);
            if (Utils.CheckAPIResponse(apiSpecialDayDelete))
            {
                return Json(new
                {
                    IsSucceed = true
                    //SittingList = apiMasterData.SittingsList
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }
        [CustomAuth]
        public ActionResult SpecialDaysOverrideCheck(string SpecialDate, string EventID)
        {
            var apiSpecialDaysOverrideCheck = iRstSrvClient.Get().SpecialDaysOverrideCheck_00_00_002(Common.RestaurantID, SpecialDate, EventID, Common.Token);
            if (Utils.CheckAPIResponse(apiSpecialDaysOverrideCheck))
            {
                return Json(new
                {
                    IsSucceed = true,
                    HasBookings = apiSpecialDaysOverrideCheck.HasBookings
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }
        [CustomAuth]
        public ActionResult PublicHolidaysOverrideApplyMulti(string LocationID, string JsonPublicholidays)
        {

            var apiPublicHolidaysOverrideApplyMulti = iRstSrvClient.Get().PublicHolidaysOverrideApply_00_00_002(Common.RestaurantID, LocationID, BuildPublicHolidayXML(JsonPublicholidays), Common.Token);
            if (Utils.CheckAPIResponse(apiPublicHolidaysOverrideApplyMulti))
            {
                return Json(new
                {
                    IsSucceed = true
                    //HasBookings = apiPublicHolidaysOverrideApply.HasBookings
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }
        [CustomAuth]
        public ActionResult PublicHolidaysOverrideApply(string LocationID, string DayID, string EventID, string IsOverride)
        {
            StringBuilder xmlBuilder = new StringBuilder();
            xmlBuilder.Append("<publicholidays>");
            xmlBuilder.Append("     <holidayoverride>");
            xmlBuilder.AppendFormat("   <dayid>{0}</dayid>", DayID);
            xmlBuilder.AppendFormat("   <eventid>{0}</eventid>", EventID);
            xmlBuilder.AppendFormat("   <isoverride>{0}</isoverride>", IsOverride);
            xmlBuilder.Append("     </holidayoverride>");
            xmlBuilder.Append("</publicholidays>");
            var apiPublicHolidaysOverrideApply = iRstSrvClient.Get().PublicHolidaysOverrideApply_00_00_002(Common.RestaurantID, LocationID, xmlBuilder.ToString(), Common.Token);
            if (Utils.CheckAPIResponse(apiPublicHolidaysOverrideApply))
            {
                return Json(new
                {
                    IsSucceed = true
                    //HasBookings = apiPublicHolidaysOverrideApply.HasBookings
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }
        [CustomAuth]
        public ActionResult PublicHolidaysOverrideCheck(string LocationID, string DayID, string EventID, string IsOverride)
        {
            StringBuilder xmlBuilder = new StringBuilder();
            xmlBuilder.Append("<publicholidays>");
            xmlBuilder.Append("     <holidayoverride>");
            xmlBuilder.AppendFormat("   <dayid>{0}</dayid>", DayID);
            xmlBuilder.AppendFormat("   <eventid>{0}</eventid>", EventID);
            xmlBuilder.AppendFormat("   <isoverride>{0}</isoverride>", IsOverride);
            xmlBuilder.Append("     </holidayoverride>");
            xmlBuilder.Append("</publicholidays>");
            var apiPublicHolidaysOverrideCheck = iRstSrvClient.Get().PublicHolidaysOverrideCheck_00_00_002(Common.RestaurantID, xmlBuilder.ToString(), Common.Token);
            if (Utils.CheckAPIResponse(apiPublicHolidaysOverrideCheck))
            {
                return Json(new
                {
                    IsSucceed = true,
                    HasBookings = apiPublicHolidaysOverrideCheck.HasBookings
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }
        private string BuildPublicHolidayXML(string json)
        {
            try
            {
                // deserialize json
                var serializer = new JavaScriptSerializer();
                var contents = serializer.Deserialize<IList<PublicHoliday>>(json);
                // create xml
                StringBuilder xmlBuilder = new StringBuilder();
                xmlBuilder.Append("<publicholidays>");

                foreach (var content in contents)
                {
                    xmlBuilder.Append("<holidayoverride>");
                    xmlBuilder.AppendFormat("<dayid>{0}</dayid>", content.DayID);
                    xmlBuilder.AppendFormat("<eventid>{0}</eventid>", content.EventID);
                    xmlBuilder.AppendFormat("<isoverride>{0}</isoverride>", content.IsOverride);
                    xmlBuilder.Append("</holidayoverride>");
                }

                xmlBuilder.Append("</publicholidays>");
                return xmlBuilder.ToString();
            }
            catch
            {
                return "fail";
            }
        }
        [CustomAuth]
        public ActionResult PublicHolidaysOverrideCheckMulti(string JsonPublicholidays)
        {

            var apiPublicHolidaysOverrideCheckMulti = iRstSrvClient.Get().PublicHolidaysOverrideCheck_00_00_002(Common.RestaurantID, BuildPublicHolidayXML(JsonPublicholidays), Common.Token);
            if (Utils.CheckAPIResponse(apiPublicHolidaysOverrideCheckMulti))
            {
                return Json(new
                {
                    IsSucceed = true,
                    HasBookings = apiPublicHolidaysOverrideCheckMulti.HasBookings
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }

        [CustomAuth]
        public ActionResult SpecialDayUpdate(string OverrideID, string Name)
        {
            var apiSpecialDayUpdate = iRstSrvClient.Get().SpecialDayUpdate_00_00_002(Common.RestaurantID, OverrideID, Name, Common.Token);
            if (Utils.CheckAPIResponse(apiSpecialDayUpdate))
            {
                return Json(new
                {
                    IsSucceed = true
                    //HasBookings = apiPublicHolidaysOverrideApply.HasBookings
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }
        [CustomAuth]
        public ActionResult PublicHolidaysOpenAll(string LocationID, string CountryID, string Year)
        {
            var apiPublicHolidaysOpenAll = iRstSrvClient.Get().PublicHolidaysOpenAll_00_00_002(Common.RestaurantID, LocationID, CountryID, Year, Common.Token);
            if (Utils.CheckAPIResponse(apiPublicHolidaysOpenAll))
            {
                return Json(new
                {
                    IsSucceed = true
                    //HasBookings = apiPublicHolidaysOverrideApply.HasBookings
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }

        }

    }
}
