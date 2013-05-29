using System.Text;
using System.Web.Mvc;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    public class AvailabilityController : Controller
    {
        //
        // GET: /Availability/

        public ActionResult Index()
        {
            return RedirectToAction("Index", "Summary");
        }

        [HttpPost]
        public ActionResult Edit(AvailabilityModel model)
        {
            GetTableList(ref model);

            return View("Availability", model);
        }

        [HttpPost]
        public ActionResult Create(AvailabilityModel model)
        {
            GetTableList(ref model);

            return View("Availability", model);
        }

        private void GetTableList(ref AvailabilityModel model)
        {
            // get list of table from DB
            var data = iRstSrvClient.Get().TableGetList_01_03_092(Common.Restaurant.RestaurantID.ToString(), model.LocationID.ToString(), Common.Token).Tables;

            // calculate table width
            model.Tables = Utils.CalculateTableWidth(data);
        }

        [HttpPost]
        public ActionResult Save(SaveAvailabilityModel model)
        {
            if (model.Tables == null)
            {
                // don't have to save, not changes
                return Json(new { IsSucceed = true });
            }

            try
            {
                string[] tables = model.Tables.Split(',');
                string[] statuses = model.Statuses.Split(',');

                StringBuilder xml = new StringBuilder();

                // open root tag
                xml.Append("<tablelist>");
                for (int i = 0; i < tables.Length - 1; i++)
                {
                    xml.Append("<table>");
                    xml.Append("<tableid>" + tables[i] + "</tableid>");
                    xml.Append("<isavailableonimytable>" + statuses[i] + "</isavailableonimytable>");
                    xml.Append("</table>");
                }

                // close root tag
                xml.Append("</tablelist>");
                var updateResponse = iRstSrvClient.Get().TableUpdateAvailabilityOniMyTableList_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                    model.LocationID.ToString(), xml.ToString(), Common.Token);

                return Json(new { IsSucceed = updateResponse.Error == null || updateResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError });
            }
            catch
            {

            }

            return Json(new { IsSucceed = false });
        }
    }
}
