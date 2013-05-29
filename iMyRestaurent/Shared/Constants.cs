using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace iMyRestaurent.Shared
{
    public class SessionKeys
    {
        public const string LastReservationTime = "_last_reservation_time_";
    }

    public class StringFormats
    {
        public const string DisplayReservationTime = "{0} - {1}";

        public const string HHmm = "HH:mm";

        public const string HHmmss = "HH:mm:ss";

        public const string yyyyMMdd = "yyyyMMdd";

        public const string ImageSrc = "data:image/*;base64,{0}";

        public const string DisplayDate = "ddd, d MMM yyyy";
    }

    public class Constants
    {
        public const string RestaurantData = "_restaurant_data_";

        public const string Token = "_token_";

        public const string RestaurantName = "RestaurantName";

        public const string LoginModel = "LoginModel";

        public const string LoginIsFirst = "LoginIsFirst";

        public const string Button_DisplayPassword = "Display Password";

        public const string Button_SendQuestion = "Send Question";

        public const string COOKIES_PBLOGIN = "PBLOGIN";

        public const string ProfileTemp = "ProfileTemp";

        public const string LocationTemp = "LocationTemp";

        public const string LayoutTemp = "LayoutTemp";

        public const string TableNumbersTemp = "TableNumbersTemp";

        public const string BusinessHoursTemp = "BusinessHoursTemp";

        public const string Location_CreateFromSummary = "CreateFromSummary";

        public const string Location_CreateFromProfile = "Create";

        public const string Location_Title = "iMyRestaurant - Create A New Location";

        public const string Location_Desc = "Please provide your restaurant's location name and select the number of tables and chairs that you want to configure. (All values can be changed later if needed)";

        public const string Layout_Title = "iMyRestaurant – Create {0} layout";

        public const string TableNumbers_Title = "iMyRestaurant – Create {0} table numbers";

        public const string SetAvailability_Title = "iMyRestaurant – Set iMyTable availability for {0}";

        public const string SetAvailability_Ava = "Table is available for reservations on iMyTable application";

        public const string SetAvailability_NotAva = "Table is not available for reservations on iMyTable application";

        public const string SummaryData = "SummaryData";

        public const string ReservationModel = "ReservationModel";

        public const int WidthDifferent = 10;

        public const int SmallestTableWidth = 60;

        public const int InitialTableTop = 10;

        public const string StartNumber = "StartNumber";

        public const string RestaurantID = "RestaurantID";

        public const string MenuPrefix = "_menu_";

        public const string SystemDateFormat = "yyyyMMdd";

        public const string SystemTimeFormat = "HH:mm:ss";

        public const string InputDateFormat = "ddd, d MMM yyyy";

        public const string HolidayPrefix = "_holiday_";

        public const string ImageKey = "_image_{0}_{1}_";

        public const string Username = "_username_";

        public const string EmailRegex = @"^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$";
    }
}