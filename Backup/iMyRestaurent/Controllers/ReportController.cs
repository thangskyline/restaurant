using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;
using iMyRestaurent.Models;

namespace iMyRestaurent.Controllers
{
    public class ReportController : Controller
    {
        private const string All = "-1";

        [HttpPost]
        [CustomAuth]
        public ActionResult Filter(FilterModel model)
        {
            // check date option
            if (model.ModifiedDateOption.Equals(All))
            {
                model.StartModifiedDate = string.Empty;
                model.EndModifiedDate = string.Empty;
            }
            else
            {
                string start, end;
                CalculateTime(model.ModifiedDateOption, out start, out end);

                model.StartModifiedDate = start;
                model.EndModifiedDate = end;
            }

            if (model.BookingDateOption.Equals(All))
            {
                model.StartBookingDate = string.Empty;
                model.EndBookingDate = string.Empty;
            }
            else
            {
                string start, end;
                CalculateTime(model.BookingDateOption, out start, out end);

                model.StartBookingDate = start;
                model.EndBookingDate = end;
            }


            var response = iRstSrvClient.Get().ReportBookingList_00_00_003(Common.RestaurantID, model.LocationID,
                model.StartModifiedDate, model.EndModifiedDate, model.IsiMyTable, model.StartBookingDate, model.EndBookingDate,
                model.MenuTypeID, model.IsNew, model.IsConfirmed, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                List<ReportElement> list = new List<ReportElement>();

                if (response.BookingList != null)
                {
                    foreach (var e in response.BookingList)
                    {
                        list.Add(new ReportElement(e));
                    }
                }

                return Json(new
                {
                    IsSucceed = true,
                    Data = list.ToArray()
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        private void CalculateTime(string option, out string startTime, out string endTime)
        {
            try
            {
                int number = Convert.ToInt32(option.Substring(0, option.Length - 1));
                char type = option[option.Length - 1];

                DateTime start = DateTime.Today;
                DateTime end;

                switch (type)
                {
                    case 'd':
                        end = DateTime.Today.AddDays(number);
                        break;
                    case 'm':
                        end = DateTime.Today.AddMonths(number);
                        break;
                    case 'y':
                        end = DateTime.Today.AddYears(number);
                        break;
                    default:
                        throw new Exception();
                }

                // number < 0 -> last
                // number > 0 -> next
                if (number < 0)
                {
                    // swap date
                    var temp = start;
                    start = end;
                    end = temp;
                    // last start from yesterday
                    end = end.AddDays(-1);
                    start = start.AddDays(-1);
                }
                else
                {
                    // next include today
                }

                startTime = start.ToString("yyyyMMdd");
                endTime = end.ToString("yyyyMMdd");
            }
            catch
            {
                startTime = string.Empty;
                endTime = string.Empty;
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Notification(string LocationID)
        {
            var response = iRstSrvClient.Get().ReportNewBookingsGetCount_00_00_002(Common.RestaurantID, LocationID, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                return Json(new
                {
                    IsSucceed = true,
                    Notification = response.NewsBookingCount
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
    }
}
