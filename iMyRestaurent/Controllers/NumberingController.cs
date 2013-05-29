using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using iMyRestaurent.iRstSrv;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    public class NumberingController : Controller
    {
        [CustomAuth]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Create(NumberingModel model)
        {
            CreateModel(ref model);

            return View("Numbering", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Edit(NumberingModel model)
        {
            CreateModel(ref model);

            return View("Numbering", model);
        }

        private void CreateModel(ref NumberingModel model)
        {
            TableData[] data;

            if (Session[Constants.StartNumber] == null)
            {
                Session[Constants.StartNumber] = 1;
                model.StartNumber = 1;
            }
            else
            {
                model.StartNumber = (int)Session[Constants.StartNumber];
            }

            if (string.IsNullOrWhiteSpace(model.TablePositionText))
            {
                // get from DB
                data = iRstSrvClient.Get().TableGetList_01_03_092(Utils.GetRestaurentID().ToString(), model.LocationID.ToString(), Utils.GetToken()).Tables;

                // create table-position-text
                model.TablePositionText = CreateFromTableList(data);
            }
            else
            {
                // parse input text
                data = Utils.ParseFullInfo(model.TablePositionText);
            }

            model.Tables = Utils.CalculateTableWidth(data);
        }

        private string CreateFromTableList(iRstSrv.TableData[] tables)
        {
            var text = string.Empty;

            foreach (var table in tables)
            {
                text += table.TableID + "," + table.NoOfChairs + "," + table.PosT + "," + table.PosL + "," + table.LayoutCode + "|";
            }

            if (text.Length > 0)
            {
                text = text.Substring(0, text.Length - 1);
            }

            return text;
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult SaveStartNumber(int startNumber)
        {
            Session[Constants.StartNumber] = startNumber;
            return Json(new { });
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Save(string locationId, string infoText)
        {
            List<TableData> inputTables = Utils.ParseFullInfo(infoText).ToList();

            TableData[] existTables = iRstSrvClient.Get().TableGetList_01_03_092(Utils.GetRestaurentID().ToString(), locationId, Utils.GetToken()).Tables;

            var deleteQueue = new List<int>();

            // delete all exist table
            if (existTables != null)
            {
                foreach (var table in existTables)
                {
                    var matchedTables = inputTables.Where(t => t.TableID == table.TableID);

                    if (matchedTables.Count() == 0)
                    {
                        // this table in DB is deleted in input screen -> delete it from DB
                        //iRstSrvClient.Get().TableDeleteLogic_00_00_001(Utils.GetRestaurentID().ToString(), table.TableID.ToString(), Utils.GetToken());
                        deleteQueue.Add(table.TableID);
                    }
                    else
                    {
                        // edit the matched table
                        var addingTable = matchedTables.Single();

                        //AbstractServiceInvoker.Get().TableEdit(table.TableID.ToString(), locationId, addingTable.NumberSeat.ToString(), "1", addingTable.PosT, addingTable.PosL, addingTable.LayoutCode);
                    }
                }
            }

            if (deleteQueue.Count > 0)
            {
                StringBuilder xml = new StringBuilder();

                xml.Append("<tablelist>");
                foreach (var id in deleteQueue)
                {
                    xml.AppendFormat("<table><tableid>{0}</tableid></table>", id);
                }
                xml.Append("</tablelist>");

                var deleteTableResponse = iRstSrvClient.Get().TableDeleteList_00_00_001(Common.Restaurant.RestaurantID.ToString(), locationId, xml.ToString(), Common.Token);
            }

            // add new tables

            if (inputTables.Count > 0)
            {

                StringBuilder xml = new StringBuilder();
                xml.Append("<tablelist>");

                foreach (var table in inputTables)
                {
                    xml.Append("<table>");
                    xml.AppendFormat("<tablenumber>{0}</tablenumber>", table.LayoutCode);
                    xml.AppendFormat("<noofchairs>{0}</noofchairs>", table.NoOfChairs);
                    xml.AppendFormat("<post>{0}</post>", table.PosT);
                    xml.AppendFormat("<posl>{0}</posl>", table.PosL);
                    xml.AppendFormat("<tableid>{0}</tableid>", table.TableID);
                    xml.Append("</table>");
                }

                xml.Append("</tablelist>");

                var addTablesResponse = iRstSrvClient.Get().TableAddUpdateList_00_00_001(Common.Restaurant.RestaurantID.ToString(), locationId, xml.ToString(), Common.Token);
            }

            return Json(new { });
        }
    }
}
