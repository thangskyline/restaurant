using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    public class BusinessHoursController : Controller
    {
        #region BizHours

        [CustomAuth]
        public ActionResult Index()
        {
            return RedirectToAction("Index", "Summary");
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Create(BizHourModel model)
        {
            GetData(ref model);

            return View("MenuType", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Edit(BizHourModel model)
        {
            GetData(ref model);

            return View("MenuType", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult AddMenu(BizHourModel model)
        {
            return View("Create", model);
        }

        private void GetData(ref BizHourModel model)
        {
            if (string.IsNullOrEmpty(model.Token))
            {
                model.Token = Guid.NewGuid().ToString();

                var response = iRstSrvClient.Get().SittingTimesListByLocID_00_00_001(Utils.GetRestaurentID().ToString(), model.LocationID.ToString(), Utils.GetToken());

                if (response != null && (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError))
                {
                    var sittingIds = response.SittingTimes.OrderBy(s => s.SittingID).Select(s => s.SittingID).Distinct().ToList();

                    List<MenuInput> menus = new List<MenuInput>();

                    for (int i = 0; i < sittingIds.Count; i++)
                    {
                        var days = response.SittingTimes.Where(s => s.SittingID == sittingIds[i]).OrderBy(s => s.Day).ToList();

                        menus.Add(new MenuInput()
                        {
                            SittingID = sittingIds[i],
                            Name = days[0].EventName,
                            SittingTimes = days,
                            Index = i
                        });
                    }

                    Session[Constants.MenuPrefix + model.Token] = menus;
                }
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckName(string MenuName, string Token, int SittingID, string LocationID)
        {
            var menus = Session[Constants.MenuPrefix + Token] as List<MenuInput>;

            bool isExisted = false;

            int[] eventIDs = null;

            if (menus != null)
            {
                foreach (var menu in menus)
                {
                    if (menu.Name.Equals(MenuName, StringComparison.CurrentCultureIgnoreCase))
                    {
                        isExisted = true;
                        break;
                    }
                }
            }

            bool errorOccurs = false;

            if (!isExisted)
            {
                if (SittingID > 0)
                {
                    // delete old menu
                    var deleteMenuResponse = iRstSrvClient.Get().BizHourDeleteLogic_00_00_001(Common.Restaurant.RestaurantID.ToString(), SittingID.ToString(), Common.Token);

                    errorOccurs = deleteMenuResponse.Error != null && deleteMenuResponse.Error.ErrorCode != iRstSrv.ErrorCodes.NoneError;
                }

                if (!errorOccurs)
                {
                    // create new menu
                    var createMenuResponse = iRstSrvClient.Get().BizHourCreateNew_00_00_001(Common.Restaurant.RestaurantID.ToString(), LocationID, MenuName, Common.Token);

                    if (createMenuResponse.Error == null || createMenuResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                    {
                        SittingID = createMenuResponse.SittingID;
                    }
                    else
                    {
                        errorOccurs = true;
                    }
                }

                if (!errorOccurs)
                {
                    var getSittingTimeResponse = iRstSrvClient.Get().SittingTimesListBySittingID_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                        SittingID.ToString(), Common.Token);

                    if (getSittingTimeResponse.Error == null || getSittingTimeResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                    {
                        eventIDs = getSittingTimeResponse.SittingTimes.OrderBy(s => s.Day).Select(s => s.EventID).ToArray();
                    }
                }
            }

            return Json(new
            {
                IsSucceed = !errorOccurs,
                IsExisted = isExisted,
                SittingID = SittingID,
                EventIDs = eventIDs
            });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult StoreMenu(string LocationID, string MenuName, string Values, string States, string EventIDs, string Token, int SittingID)
        {
            try
            {
                string[] times = Values.Split(',');

                string[] sittingStates = States.Split(',');

                MenuInput input = new MenuInput();

                input.SittingID = SittingID;

                //var response = iRstSrvClient.Get().SittingTimesListBySittingID_00_00_001(Common.Restaurant.RestaurantID.ToString(), SittingID.ToString(), Common.Token);

                //var eventIds = response.SittingTimes.OrderBy(s => s.Day).Select(s => s.EventID).ToArray();
                int[] eventIds = EventIDs.Split(',').Select(id => Convert.ToInt32(id)).ToArray();

                input.Name = MenuName;
                input.SittingTimes = new List<iRstSrv.SittingTime>();

                for (int day = 0; day < 7; day++)
                {
                    input.SittingTimes.Add(CreateSittingTime(MenuName, sittingStates[day], eventIds[day].ToString(), new string[]
                    {
                        times[0 * 7 + day], 
                        times[1 * 7 + day], 
                        times[2 * 7 + day],
                        times[3 * 7 + day], 
                        times[4 * 7 + day],
                        times[5 * 7 + day], 
                        times[6 * 7 + day]
                    }, day.ToString(), SittingID.ToString())
                    );
                }

                // store into session
                var menus = Session[Constants.MenuPrefix + Token] as List<MenuInput>;

                if (menus == null)
                {
                    menus = new List<MenuInput>();
                }

                input.Index = menus.Count;

                menus.Add(input);

            }
            catch { }

            return Json(new { });
        }

        // - Create SittingTime from input strings
        // - Delete existed SittingTime
        // - Store new SittingTime
        [HttpPost]
        [CustomAuth]
        public ActionResult SaveMenu(string LocationID, string MenuNames, string States, string Values, string IDs, string SittingIDs)
        {
            try
            {
                string[] arrName = MenuNames.Split('|');
                string[] arrState = States.Split('|');
                string[] arrValue = Values.Split('|');
                string[] arrID = IDs.Split('|');
                string[] arrSittingIds = SittingIDs.Split('|');

                #region delete when rename???
                /*
                // check name
                var response = iRstSrvClient.Get().SittingTimesListByLocID_00_00_001(Common.Restaurant.RestaurantID.ToString(), LocationID, Common.Token);
                //SittingTimesByLocationID response = AbstractServiceInvoker.Get().SittingTimesListByLocationID(locationID, Utils.GetToken());

                for (int i = 0; i < arrSittingIds.Length; i++)
                {
                    var matchedShift = response.SittingTimes.Where(s => s.SittingID == Convert.ToInt32(arrSittingIds[i])).FirstOrDefault();

                    if (!matchedShift.EventName.Equals(arrName[i]))
                    {
                        // delete existed menu
                        iRstSrvClient.Get().BizHourDeleteLogic_00_00_001(Common.Restaurant.RestaurantID.ToString(), matchedShift.SittingID.ToString(), Common.Token);

                        // create new menu
                        var createMenuResponse = iRstSrvClient.Get().BizHourCreateNew_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                            LocationID, arrName[i], Common.Token);

                        arrSittingIds[i] = createMenuResponse.SittingID.ToString();

                        // update event-id corresponding with new sitting-id
                        var getSittingTimeResponse = iRstSrvClient.Get().SittingTimesListBySittingID_00_00_001(Common.Restaurant.RestaurantID.ToString(), arrSittingIds[i], Common.Token);

                        string eventIDs = string.Empty;

                        foreach (var sittingTime in getSittingTimeResponse.SittingTimes.OrderBy(s => s.Day))
                        {
                            eventIDs += sittingTime.EventID + ",";
                        }

                        eventIDs = eventIDs.Substring(0, eventIDs.Length - 1);

                        arrID[i] = eventIDs;
                    }
                }
                 * */
                #endregion

                List<iRstSrv.SittingTime> list = new List<iRstSrv.SittingTime>();

                for (int i = 0; i < arrName.Length; i++)
                {
                    string[] times = arrValue[i].Split(',');

                    string[] sittingStates = arrState[i].Split(',');

                    string[] eventIds = arrID[i].Split(',');

                    for (int day = 0; day < 7; day++)
                    {
                        list.Add(CreateSittingTime(arrName[i], sittingStates[day], eventIds[day], new string[]
                            {
                                times[0 * 7 + day], 
                                times[1 * 7 + day], 
                                times[2 * 7 + day],
                                times[3 * 7 + day], 
                                times[4 * 7 + day],
                                times[5 * 7 + day], 
                                times[6 * 7 + day]
                            }, day.ToString(), arrSittingIds[i])
                        );
                    }
                }

                for (int i = 0; i < arrSittingIds.Length; i++)
                {
                    var subList = list.Where(s => s.SittingID.ToString().Equals(arrSittingIds[i])).ToList();

                    StringBuilder builder = new StringBuilder();
                    builder.Append("<sittingtimelist>");

                    foreach (var shift in subList)
                    {
                        builder.Append("<sittingtime>");
                        builder.Append("<eventid>" + shift.EventID + "</eventid>");
                        builder.Append("<starttime>" + shift.Start_Time + "</starttime>");
                        builder.Append("<endtime>" + shift.End_Time + "</endtime>");
                        builder.Append("<state>" + shift.State + "</state>");
                        builder.Append("<maxsittingtime>" + shift.LongSittingTime + "</maxsittingtime>");
                        builder.Append("<mediumsittingtime>" + shift.MediumSittingTime + "</mediumsittingtime>");
                        builder.Append("<shortsittingtime>" + shift.ShortSittingTime + "</shortsittingtime>");
                        builder.Append("<kitchenclosedtime>" + shift.KitchenClosedTime + "</kitchenclosedtime>");
                        builder.Append("<changeovertime>" + shift.ChangeOverTime + "</changeovertime>");
                        builder.Append("<day>" + shift.Day + "</day>");
                        builder.Append("</sittingtime>");

                        if (shift.State.Equals("closed", StringComparison.CurrentCultureIgnoreCase))
                        {
                            iRstSrvClient.Get().SittingTimeCloseLogic_00_00_001(Common.Restaurant.RestaurantID.ToString(), shift.EventID.ToString(), Common.Token);
                        }
                    }
                    builder.Append("</sittingtimelist>");

                    var updateResponse = iRstSrvClient.Get().BizHoursUpdateAll_00_00_001(Common.Restaurant.RestaurantID.ToString(), arrSittingIds[i], arrName[i], builder.ToString(), Common.Token);
                }

                return Json(new { });
            }
            catch
            {
                return Json(new { });
            }
        }

        private iRstSrv.SittingTime CreateSittingTime(string name, string state, string id, string[] values, string day, string sittingId)
        {
            iRstSrv.SittingTime sittingTime = new iRstSrv.SittingTime();

            sittingTime.State = state;
            sittingTime.EventName = name;
            sittingTime.Day = day.ToString();
            sittingTime.EventID = Convert.ToInt32(id);
            sittingTime.SittingID = Convert.ToInt32(sittingId);

            if (sittingTime.State.Equals("open", StringComparison.CurrentCultureIgnoreCase))
            {
                sittingTime.Start_Time = string.IsNullOrEmpty(values[0]) ? "00:00" : values[0];
                sittingTime.End_Time = string.IsNullOrEmpty(values[2]) ? "00:00" : values[2];
                sittingTime.KitchenClosedTime = string.IsNullOrEmpty(values[1]) ? sittingTime.End_Time : values[1];
                sittingTime.LongSittingTime = string.IsNullOrEmpty(values[3]) ? "0" : ConvertToMinute(values[3]);
                sittingTime.MediumSittingTime = string.IsNullOrEmpty(values[4]) ? "0" : ConvertToMinute(values[4]);
                sittingTime.ShortSittingTime = string.IsNullOrEmpty(values[5]) ? "0" : ConvertToMinute(values[5]);
                sittingTime.ChangeOverTime = string.IsNullOrEmpty(values[6]) ? "0" : values[6];
            }
            else
            {
                sittingTime.Start_Time = "00:00";
                sittingTime.LongSittingTime = "0";
                sittingTime.MediumSittingTime = "0";
                sittingTime.ShortSittingTime = "0";
                sittingTime.KitchenClosedTime = "00:00";
                sittingTime.ChangeOverTime = "0";
                sittingTime.End_Time = "00:00";
            }

            return sittingTime;
        }

        private string ConvertToMinute(string time)
        {
            string[] arr = time.Trim().Split(new char[] { ':' });
            return (Convert.ToInt32(arr[0]) * 60 + Convert.ToInt32(arr[1])).ToString();
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckBeforeClose(string eventID)
        {
            var response = iRstSrvClient.Get().SittingTimeCheckBeforeClosing_00_00_001(Utils.GetRestaurentID().ToString(), eventID, Utils.GetToken());

            bool isSucceed = response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError;

            if (isSucceed)
            {
                return Json(new { IsSucceed = isSucceed, hasBookings = response.HasBookings == 1 });
            }
            else
            {
                return Json(new { IsSucceed = isSucceed });
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckMenuBeforeDelete(string SittingID)
        {
            var checkResponse = iRstSrvClient.Get().BizHourCheckBeforeDeleting_00_00_001(Common.Restaurant.RestaurantID.ToString(), SittingID, Common.Token);

            if (checkResponse.Error == null || checkResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new
                {
                    IsSucceed = true,
                    HasBookings = checkResponse.HasBookings == 1
                });
            }
            else
            {
                return Json(new { IsSucceed = false });
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteMenu(string SittingID, string Token)
        {
            var deleteResponse = iRstSrvClient.Get().BizHourDeleteLogic_00_00_001(Common.Restaurant.RestaurantID.ToString(), SittingID, Common.Token);

            bool isSucceed = deleteResponse.Error == null || deleteResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError;

            if (isSucceed)
            {
                // remove from session
                var menus = Session[Constants.MenuPrefix + Token] as List<MenuInput>;

                if (menus != null)
                {
                    var matchedQuery = menus.Where(s => s.SittingID.ToString().Equals(SittingID));

                    if (matchedQuery.Count() > 0)
                    {
                        menus.Remove(matchedQuery.Single());
                    }
                }
            }

            return Json(new { IsSucceed = isSucceed });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult StoreCurrentData(string names, string states, string values, string ids, string sittingIds, string token)
        {
            try
            {
                string[] arrName = names.Split('|');
                string[] arrState = states.Split('|');
                string[] arrValue = values.Split('|');
                string[] arrID = ids.Split('|');
                string[] arrSittingIds = sittingIds.Split('|');

                List<iRstSrv.SittingTime> list = new List<iRstSrv.SittingTime>();

                for (int i = 0; i < arrName.Length; i++)
                {
                    string[] times = arrValue[i].Split(',');

                    string[] sittingStates = arrState[i].Split(',');

                    string[] eventIds = arrID[i].Split(',');

                    for (int day = 0; day < 7; day++)
                    {
                        list.Add(CreateSittingTime(arrName[i], sittingStates[day], eventIds[day], new string[]
                        {
                            times[0 * 7 + day], 
                            times[1 * 7 + day], 
                            times[2 * 7 + day],
                            times[3 * 7 + day], 
                            times[4 * 7 + day],
                            times[5 * 7 + day], 
                            times[6 * 7 + day]
                        }, day.ToString(), arrSittingIds[i])
                        );
                    }
                }

                List<MenuInput> menus = new List<MenuInput>();

                for (int i = 0; i < arrSittingIds.Length; i++)
                {
                    var days = list.Where(s => s.SittingID.ToString().Equals(arrSittingIds[i])).OrderBy(s => s.Day).ToList();

                    menus.Add(new MenuInput()
                    {
                        SittingID = Convert.ToInt32(arrSittingIds[i]),
                        Name = days[0].EventName,
                        SittingTimes = days,
                        Index = i
                    });
                }

                Session[Constants.MenuPrefix + token] = menus;
            }
            catch { }

            return Json(new { });
        }

        #endregion

        [HttpPost]
        [CustomAuth]
        public ActionResult GetMenuList(string LocationID)
        {
            try
            {
                var getMenuListResponse = iRstSrvClient.Get().BizHoursGetList_00_00_001(Common.RestaurantID, LocationID, Common.Token);

                if (Utils.CheckAPIResponse(getMenuListResponse))
                {
                    return Json(new
                    {
                        IsSucceed = true,
                        Menus = getMenuListResponse.Sittings
                    });
                }
            }
            catch { }

            return Json(Common.JsonFail);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetEventList(string SittingID)
        {
            try
            {
                var getEventListResponse = iRstSrvClient.Get().SittingTimesListBySittingID_00_00_001(Common.RestaurantID, SittingID, Common.Token);

                if (Utils.CheckAPIResponse(getEventListResponse))
                {
                    return Json(new
                    {
                        IsSucceed = true,
                        Events = getEventListResponse.SittingTimes
                    });
                }
            }
            catch { }

            return Json(Common.JsonFail);
        }
        [HttpPost]
        [CustomAuth]
        public ActionResult GetMappings(string EventID)
        {
            try
            {
                var response = iRstSrvClient.Get().MenuMappingsGetList(Common.RestaurantID, EventID, Common.Token);
                if (Utils.CheckAPIResponse(response))
                {
                    return Json(new
                    {
                        IsSucceed = true,
                        Menus = response.Menus
                    });
                }
            }
            catch { }

            return Json(Common.JsonFail);
        }
        [HttpPost]
        [CustomAuth]
        public ActionResult SetMappings(string Events, string Menus)
        {
            try
            {
                // chua check empty string
                List<string> events = Events.TrimEnd(';').Split(';').ToList<string>();
                List<string> menus = Menus.TrimEnd(';').Split(';').ToList<string>();
                string XMLData = BuildMenuMappingXML(events, menus);
                var response = iRstSrvClient.Get().MenuMappingsSet_00_00_001(Common.RestaurantID, XMLData, Common.Token);
                if (Utils.CheckAPIResponse(response))
                {
                    return Json(new
                    {
                        IsSucceed = true
                    });
                }
            }
            catch (Exception ex) { }

            return Json(Common.JsonFail);
        }
        private string BuildMenuMappingXML(List<string> events, List<string> menus)
        {
            try
            {
                // create xml
                StringBuilder xmlBuilder = new StringBuilder();
                xmlBuilder.Append("<menulist>");

                foreach (var itemEvent in events)
                {
                    foreach (var itemMenu in menus)
                    {
                        xmlBuilder.Append("<menumapping>");
                        xmlBuilder.AppendFormat("<eventid>{0}</eventid>", itemEvent);
                        xmlBuilder.AppendFormat("<menuid>{0}</menuid>", itemMenu);
                        xmlBuilder.Append("</menumapping>");
                    }
                }
                xmlBuilder.Append("</menulist>");
                return xmlBuilder.ToString();
            }
            catch
            {
                return "fail";
            }
        }
        

    }
}
