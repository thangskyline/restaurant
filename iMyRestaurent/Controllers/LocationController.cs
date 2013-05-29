using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using iMyRestaurent.iRstSrv;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    [HandleError]
    public class LocationController : Controller
    {
        //
        // GET: /Location/
        [CustomAuth]
        public ActionResult Index()
        {
            return RedirectToAction("Index", "Summary");
        }

        #region forward-action

        [HttpPost]
        [CustomAuth]
        public ActionResult CreateReservation(ForwardModel model)
        {
            model.ForwardTo = ForwardAction.CreateReservation;

            return List(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult EditLocation(ForwardModel model)
        {
            model.CanCreateLocation = true;
            model.ForwardTo = ForwardAction.EditLocation;

            return List(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult EditLayout(ForwardModel model)
        {
            model.ForwardTo = ForwardAction.EditLayout;

            return List(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult EditAvailability(ForwardModel model)
        {
            model.ForwardTo = ForwardAction.EditAvailability;

            return List(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult EditBusinessHours(ForwardModel model)
        {
            model.ForwardTo = ForwardAction.EditBusinessHour;

            return List(model);
        }

        [CustomAuth]
        public ActionResult List(ForwardModel model)
        {
            GetLocationList(ref model);
            return View("List", model);
        }

        private void GetLocationList(ref ForwardModel model)
        {
            model.Locations = iRstSrvClient.Get().LocationsByRestaurantID_00_00_001(Utils.GetRestaurentID().ToString(), Utils.GetToken());
        }

        #endregion

        [HttpPost]
        [CustomAuth]
        public ActionResult GetLocationList()
        {
            try
            {
                var response = iRstSrvClient.Get().LocationsByRestaurantID_00_00_001(Common.RestaurantID, Common.Token);

                if (Utils.CheckAPIResponse(response))
                {
                    return Json(new
                    {
                        IsSucceed = true,
                        Locations = response.LocationList
                    });
                }
            }
            catch { }

            return Json(Common.JsonFail);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteLocation(DeleteLocationModel input)
        {
            try
            {
                var response = iRstSrvClient.Get().LocationDeleteLogic_00_00_001(Common.RestaurantID, input.LocationID.ToString(), Common.Token);

                if (Utils.CheckAPIResponse(response))
                {
                    return Json(new { isSucceed = true });
                }
            }
            catch { }

            return Json(new { isSucceed = false });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckBeforeDelete(DeleteLocationModel input)
        {
            try
            {
                var response = iRstSrvClient.Get().LocationCheckBeforeDeleting_00_00_001(Utils.GetRestaurentID().ToString(), input.LocationID.ToString(), Utils.GetToken());

                if (response.Error == null || response.Error.ErrorCode == ErrorCodes.NoneError)
                {
                    return Json(new { hasError = false, hasBooking = response.HasBookings != 0 });
                }
            }
            catch { }

            return Json(new { hasError = true });
        }

        [HttpGet]
        [CustomAuth]
        public ActionResult Create()
        {
            LocationModel model = new LocationModel()
            {
                Mode = Mode.CreateAfterRegistering,
                TableText = "2,0|4,0|6,0|8,0"
            };

            CreateModel(ref model);

            return View("Location", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Create(LocationModel model)
        {
            if (string.IsNullOrEmpty(model.TableText))
            {
                // create default value
                model.TableText = "2,0|4,0|6,0|8,0";
            }

            CreateModel(ref model);

            return View("Location", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Edit(LocationModel model)
        {
            CreateModel(ref model);

            return View("Location", model);
        }

        private void CreateModel(ref LocationModel model)
        {
            // set restaurant name as default name
            if (string.IsNullOrEmpty(model.LocationName))
            {
                model.LocationName = Common.Restaurant.Restaurant_Name;
            }

            if (string.IsNullOrEmpty(model.TableText) || model.TableText.Equals("*"))
            {
                model.TableText = string.Empty;

                List<TableInfo> list = new List<TableInfo>();

                var response = iRstSrvClient.Get().TableGetList_01_03_092(Utils.GetRestaurentID().ToString(), model.LocationID.ToString(), Utils.GetToken());

                TableData[] tables = response.Tables;

                Dictionary<int, int> dict = new Dictionary<int, int>();

                if (tables != null)
                {
                    foreach (var table in tables)
                    {
                        if (!dict.ContainsKey(table.NoOfChairs))
                        {
                            dict[table.NoOfChairs] = 0;
                        }

                        dict[table.NoOfChairs] += 1;
                    }

                    foreach (var pair in dict)
                    {
                        list.Add(new TableInfo()
                        {
                            ChairNo = pair.Key,
                            TableNo = pair.Value
                        });

                        model.TableText += pair.Key + "," + pair.Value + "|";
                    }

                    if (dict.Count > 0)
                    {
                        model.TableText = model.TableText.Remove(model.TableText.Length - 1);
                    }
                }
                else
                {
                    model.TableText = "";
                }

                model.Tables = list.ToArray();
            }
            else
            {
                model.Tables = ConvertTableText(model.TableText);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Save(LocationModel model)
        {
            int locationId;
            if (model.LocationID == 0)
            {
                var respone = iRstSrvClient.Get().LocationCreateNew_00_00_001(Common.Restaurant.RestaurantID.ToString(), model.LocationName, string.Empty, string.Empty, string.Empty, string.Empty, Common.Token);

                locationId = respone.LocationID;
            }
            else
            {
                locationId = model.LocationID;
                var response = iRstSrvClient.Get().LocationEdit_00_00_001(Utils.GetRestaurentID().ToString(), locationId.ToString(), model.LocationName,
                    string.Empty, string.Empty, string.Empty, string.Empty, Utils.GetToken());
            }

            return Json(new { locationId = locationId });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckDeleteTable(string OldInfo, string CurrentInfo)
        {
            var oldInfo = ConvertTableText(OldInfo);

            var currentInfo = ConvertTableText(CurrentInfo);

            var hasDeleteTable = false;

            for (int i = 0; i < oldInfo.Length; i++)
            {
                if (oldInfo[i].ChairNo > 0)
                {
                    var matchedQuery = currentInfo.Where(info => info.ChairNo == oldInfo[i].ChairNo);

                    if (matchedQuery.Count() > 0)
                    {
                        var matchedType = matchedQuery.Single();

                        if (matchedType.TableNo >= oldInfo[i].TableNo)
                        {
                            continue;
                        }
                    }

                    hasDeleteTable = true;
                    break;
                }
            }

            return Json(new { HasDeletedTable = hasDeleteTable });
        }

        private TableInfo[] ConvertTableText(string tableText)
        {
            List<TableInfo> list = new List<TableInfo>();

            string[] tables = tableText.Split('|');

            for (int i = 0; i < tables.Length; i++)
            {
                string[] info = tables[i].Split(',');
                try
                {
                    list.Add(new TableInfo()
                    {
                        ChairNo = Convert.ToInt32(info[0]),
                        TableNo = Convert.ToInt32(info[1])
                    });
                }
                catch { }
            }

            return list.ToArray();
        }
    }
}
