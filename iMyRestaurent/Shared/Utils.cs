using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using iMyRestaurent.iRstSrv;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using iMyRestaurent.Models;
using System.Reflection;
using System.Web.Mvc;

namespace iMyRestaurent.Shared
{
    public class TimeSync
    {
        public static DateTime ToLocalTime(long milliSecs)
        {
            DateTime root = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            DateTime clientTime = root.AddMilliseconds(milliSecs);

            return clientTime.ToLocalTime();
        }
    }

    public class Utils
    {
        public static bool IsAndroid()
        {
            return HttpContext.Current.Request.UserAgent.ToLower().IndexOf("android") > -1;
        }

        public static string ConvertToTimeFormat(string minutes)
        {
            try
            {
                int intValue = Convert.ToInt32(minutes);

                TimeSpan span = TimeSpan.FromMinutes(intValue);

                return span.ToString("c").Substring(0, 5);
            }
            catch
            {
                return "00:00";
            }
        }

        public static int GetRestaurentID()
        {
            var data = HttpContext.Current.Session[Constants.RestaurantData] as RestaurantData;

            return data.RestaurantID;
        }

        public static string GetToken()
        {
            return (string)HttpContext.Current.Session[Constants.Token];
        }

        public static string GetUsername()
        {
            return (string)HttpContext.Current.Session[Constants.Username];
        }

        public static string Token(string username)
        {
            // Use input string to calculate MD5 hash
            MD5 md5 = MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(string.Format("{0}iMyRestaurant", username));
            byte[] hashBytes = md5.ComputeHash(inputBytes);
            md5.Clear();
            md5.Dispose();

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("x2"));
            }

            string hashed = sb.ToString();

            return hashed;
        }

        public static bool IsValidEmail(string email)
        {
            // validate email format
            Match match = Regex.Match(email, Constants.EmailRegex, RegexOptions.IgnoreCase);

            return match.Success;
        }

        public static TableWS[] CalculateTableWidth(TableData[] input)
        {
            TableWS[] tables = ConvertTableData(input);

            tables = tables.OrderBy(table => table.NoOfChairs).ToArray();

            int tableTypeCounter = -1;
            int lastNumberSeat = 0;

            foreach (var table in tables)
            {
                if (lastNumberSeat != table.NoOfChairs)
                {
                    tableTypeCounter++;
                    lastNumberSeat = table.NoOfChairs;
                }

                table.Size = Constants.SmallestTableWidth + Constants.WidthDifferent * tableTypeCounter;
                table.CoreSize = table.Size / 3;
                table.FontSize = Math.Floor(table.CoreSize * 2 / 3) + 2;

                // set css style 
                // .table
                table.Css.Table = string.Format("width: {0}px; height: {0}px; top: {1}px; left: {2}px", 
                    table.Size, table.PosT, table.PosL);

                // .layout-code
                table.Css.Layout = string.Format("line-height: {0}px; font-size: {1}px;", 
                    table.Size / 2.5, table.FontSize);

                // .avai-icon
                table.Css.Avail = string.Format("top: {0}px", table.Size - 16);

                // .number-seat
                table.Css.Number = string.Format("font-size: {0}px; width: {1}px; height: {1}px; background-size: {1}px {1}px;", 
                    table.FontSize + 3, table.Size * 0.7);

                // .number-seat text
                table.Css.NumberText = string.Format("padding-top: {0}px", (table.Size * 0.7 - table.FontSize - 3) * 0.9);
            }

            return tables;
        }

        private static TableWS[] ConvertTableData(TableData[] input)
        {
            List<TableWS> tables = new List<TableWS>();

            if (input == null)
            {
                return tables.ToArray();
            }

            Type serviceType = typeof(TableData);
            Type localType = typeof(TableWS);

            PropertyInfo[] properties = serviceType.GetProperties();

            foreach (var tableData in input)
            {
                TableWS table = new TableWS();
                foreach (var property in properties)
                {
                    try
                    {
                        var value = property.GetValue(tableData, null);
                        localType.GetProperty(property.Name).SetValue(table, value, null);
                    }
                    catch { }
                }
                tables.Add(table);
            }

            return tables.ToArray();
        }

        public static TableData[] ParseFullInfo(string infoText)
        {
            List<TableData> list = new List<TableData>();

            if (infoText.Equals("*"))
            {
                return list.ToArray();
            }
            string[] tables = infoText.Split('|');

            foreach (var table in tables)
            {
                // id,number-seat,layout-code,pos-t,pos-l
                string[] info = table.Split(',');

                list.Add(new TableData()
                {
                    TableID = Convert.ToInt32(info[0]),
                    NoOfChairs = Convert.ToInt32(info[1]),
                    LayoutCode = info[2],
                    PosT = info[3],
                    PosL = info[4]
                });
            }

            return list.ToArray();
        }

        public static bool CheckAPIResponse(object response)
        {
            try
            {
                Type responseType = response.GetType();

                var errorProp = responseType.GetProperty("Error");

                object errorValueFromProp = errorProp.GetValue(response, null);

                var error = errorValueFromProp as IMyRestError;

                return error == null || error.ErrorCode == ErrorCodes.NoneError;
            }
            catch
            {
                return false;
            }
        }
    }

    public class Common
    {
        public static RestaurantData Restaurant
        {
            get
            {
                return HttpContext.Current.Session[Constants.RestaurantData] as RestaurantData;
            }
            set
            {
                HttpContext.Current.Session[Constants.RestaurantData] = value;
            }
        }

        public static string RestaurantID
        {
            get
            {
                return Restaurant.RestaurantID.ToString();
            }
        }

        public static string Token
        {
            get
            {
                return (string)HttpContext.Current.Session[Constants.Token];
            }
        }

        public static string Username
        {
            get
            {
                return (string)HttpContext.Current.Session[Constants.Username];
            }
        }

        private static object jsonFail = new { IsSucceed = false };

        public static object JsonFail
        {
            get
            {
                return jsonFail;
            }
        }
    }
}