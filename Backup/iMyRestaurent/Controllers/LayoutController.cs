using System;
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
    public class LayoutController : Controller
    {
        //
        // GET: /Layout/

        [CustomAuth]
        public ActionResult Index()
        {
            return RedirectToAction("Index", "Summary");
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Create(LayoutModel model)
        {
            CreateModel(ref model);

            return View("Layout", model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Edit(LayoutModel model)
        {
            CreateModel(ref model);

            return View("Layout", model);
        }

        private iRstSrv.TableData[] CreateTableData(Dictionary<int, int> addDict)
        {
            List<TableInfo> info = new List<TableInfo>();

            foreach (var pair in addDict)
            {
                info.Add(new TableInfo()
                {
                    ChairNo = pair.Key,
                    TableNo = pair.Value
                });
            }

            return CreateTableData(info);
        }

        private void CreateModel(ref LayoutModel model)
        {
            iRstSrv.TableData[] data = null;

            /* 
             * check:
             * - TablePositionText = null -> post from location page or location-list-(edit-layout) page
             * - TablePositionText != null -> back from table-numbering page or refresh the page
             */
            if (string.IsNullOrEmpty(model.TablePositionText))
            {
                switch (model.Mode)
                {
                    case Mode.CreateAfterRegistering:
                    case Mode.CreateFromLocationList:
                    case Mode.Create:
                    case Mode.EditFromLocation:

                        if (model.IsReload)
                        {
                            break;
                        }

                        /*
                        * TODO:
                        * - Get table list from database
                        * - Compare with input (if from location)
                        * - Delete tables or add new table
                        */

                        // create from data that passed from location page
                        List<TableInfo> tableInfo = CreateTableInfo(model.TableText);

                        Dictionary<int, int> addDict = new Dictionary<int, int>();

                        List<int> deleteIDQueue = new List<int>();

                        var response = iRstSrvClient.Get().LocationGetTablesList_00_00_001(Common.Restaurant.RestaurantID.ToString(), model.LocationID.ToString(), Common.Token);

                        List<int> checkList = new List<int>();

                        foreach (var info in tableInfo)
                        {
                            checkList.Add(info.ChairNo);

                            LocationTable matched = null;

                            if (response.LocationTablesList != null)
                            {
                                var findQuery = response.LocationTablesList.Where(table => table.TableType == info.ChairNo);

                                if (findQuery.Count() > 0)
                                {
                                    matched = findQuery.Single();


                                    if (matched.TableIDs.Length > info.TableNo)
                                    {
                                        // delete exist table
                                        for (int i = info.TableNo; i < matched.TableIDs.Length; i++)
                                        {
                                            deleteIDQueue.Add(matched.TableIDs[i]);
                                        }
                                    }
                                    else if (matched.TableIDs.Length < info.TableNo)
                                    {
                                        int addingAmount = info.TableNo - matched.TableIDs.Length;

                                        addDict[matched.TableType] = addingAmount;
                                    }
                                }
                            }

                            if (matched == null)
                            {
                                addDict[info.ChairNo] = info.TableNo;
                            }
                        }

                        if (response.LocationTablesList != null)
                        {
                            foreach (var e in response.LocationTablesList)
                            {
                                if (checkList.Contains(e.TableType))
                                {
                                    continue;
                                }
                                else
                                {
                                    foreach (var id in e.TableIDs)
                                    {
                                        deleteIDQueue.Add(id);
                                    }
                                }
                            }
                        }

                        // delete table from delete-id-queue
                        if (deleteIDQueue.Count > 0)
                        {
                            StringBuilder xml = new StringBuilder();
                            xml.Append("<tablelist>");

                            foreach (var id in deleteIDQueue)
                            {
                                xml.AppendFormat("<table><tableid>{0}</tableid></table>", id);
                            }

                            xml.Append("</tablelist>");

                            var deleteTableResponse = iRstSrvClient.Get().TableDeleteList_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                                model.LocationID.ToString(), xml.ToString(), Common.Token);
                        }

                        // create table-data from add-dict
                        iRstSrv.TableData[] tableData = CreateTableData(addDict);

                        if (tableData.Length > 0)
                        {
                            StringBuilder xml = new StringBuilder();
                            xml.Append("<tablelist>");

                            foreach (var table in tableData)
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

                            var addTablesResponse = iRstSrvClient.Get().TableAddUpdateList_00_00_001(Common.Restaurant.RestaurantID.ToString(),
                                model.LocationID.ToString(), xml.ToString(), Common.Token);
                        }
                        break;
                }

                data = iRstSrvClient.Get().TableGetList_01_03_092(Common.Restaurant.RestaurantID.ToString(), model.LocationID.ToString(), Common.Token).Tables;
            }
            else
            {
                data = Utils.ParseFullInfo(model.TablePositionText);
            }

            if (model.IsReload)
            {
                data = ResetPosition(data);
            }

            //CreateModel(ref model);
            model.Tables = Utils.CalculateTableWidth(data);
        }

        private TableData[] ResetPosition(iRstSrv.TableData[] tables)
        {
            if (tables == null)
            {
                return null;
            }

            // order by chair number
            tables = tables.OrderBy(table => table.NoOfChairs).ToArray();

            int i = -1;
            int j = 0;
            int lastNumberSeat = 0;

            foreach (var table in tables)
            {
                if (lastNumberSeat != table.NoOfChairs)
                {
                    lastNumberSeat = table.NoOfChairs;
                    i++;
                    j = 0;
                }
                table.PosL = i * (Constants.SmallestTableWidth + Constants.WidthDifferent * i + 50) + j * 5 + 5 + "";
                table.PosT = 300 + j * 5 + "";

                j++;
            }

            return tables;
        }

        private List<TableInfo> CreateTableInfo(string tableText)
        {
            List<TableInfo> tableInfo = new List<TableInfo>();

            try
            {
                if (!string.IsNullOrEmpty(tableText))
                {
                    string[] tables = tableText.Split('|');

                    for (int i = 0; i < tables.Length; i++)
                    {
                        string[] info = tables[i].Split(',');
                        tableInfo.Add(new TableInfo()
                        {
                            ChairNo = Convert.ToInt32(info[0]),
                            TableNo = Convert.ToInt32(info[1])
                        });
                    }
                }
            }
            catch { }

            return tableInfo;
        }

        private iRstSrv.TableData[] CreateTableData(List<TableInfo> tableInfo)
        {
            List<iRstSrv.TableData> list = new List<iRstSrv.TableData>();

            // order by chair
            tableInfo = tableInfo.OrderBy(info => info.ChairNo).ToList();

            for (int i = 0; i < tableInfo.Count; i++)
            {
                //int tableNo = tableInfo[i].TableNo;

                for (int j = 0; j < tableInfo[i].TableNo; j++)
                {
                    iRstSrv.TableData tableObj = new iRstSrv.TableData();

                    tableObj.TableID = -1;
                    tableObj.LayoutCode = "-1";
                    tableObj.NoOfChairs = Convert.ToInt32(tableInfo[i].ChairNo);
                    tableObj.PosL = i * (Constants.SmallestTableWidth + Constants.WidthDifferent * i + 50) + j * 5 + 5 + "";
                    tableObj.PosT = Constants.InitialTableTop + j * 5 + "";

                    list.Add(tableObj);
                }
            }

            return list.ToArray();
        }

        private iRstSrv.TableData[] CreateTablesFromInput(string tableText)
        {
            List<iRstSrv.TableData> list = new List<iRstSrv.TableData>();

            // check has value
            if (!string.IsNullOrEmpty(tableText))
            {
                string[] tables = tableText.Split('|');
                //string[] chairs = chairText.Split(',');
                //string[] tables = tableText.Split(',');

                List<TableInfo> tableInfo = new List<TableInfo>();

                for (int i = 0; i < tables.Length; i++)
                {
                    string[] info = tables[i].Split(',');
                    tableInfo.Add(new TableInfo()
                    {
                        ChairNo = Convert.ToInt32(info[0]),
                        TableNo = Convert.ToInt32(info[1])
                    });
                }

                // order by chair
                tableInfo = tableInfo.OrderBy(info => info.ChairNo).ToList();

                for (int i = 0; i < tableInfo.Count; i++)
                {
                    //int tableNo = tableInfo[i].TableNo;

                    for (int j = 0; j < tableInfo[i].TableNo; j++)
                    {
                        iRstSrv.TableData tableObj = new iRstSrv.TableData();

                        tableObj.NoOfChairs = Convert.ToInt32(tableInfo[i].ChairNo);
                        tableObj.PosL = i * (Constants.SmallestTableWidth + Constants.WidthDifferent * i + 50) + j * 5 + 5 + "";
                        tableObj.PosT = 300 + j * 5 + "";

                        list.Add(tableObj);
                    }
                }
            }

            return list.ToArray();
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult CheckBeforeDelete(string tableID)
        {
            var checkResponse = iRstSrvClient.Get().TableCheckBeforeDeleting_00_00_001(Common.Restaurant.RestaurantID.ToString(), tableID, Common.Token);

            if (checkResponse.Error == null || checkResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                return Json(new { IsSucceed = true, HasBookings = checkResponse.HasBookings == 1 });
            }
            else
            {
                return Json(new { IsSucceed = false });
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteTable(string tableID)
        {
            var deleteResponse = iRstSrvClient.Get().TableDeleteLogic_00_00_001(Common.Restaurant.RestaurantID.ToString(), tableID, Common.Token);

            return Json(new { IsSucceed = deleteResponse.Error == null || deleteResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError });
        }
    }
}

