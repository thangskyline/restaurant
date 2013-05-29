using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Models
{
    public class LocationModel : InFlowModel
    {
        public int LocationID { get; set; }

        [DisplayName("Restaurant location name")]
        public string LocationName { get; set; }

        public string RestaurantID { get; set; }

        public string TableText { get; set; }

        public TableInfo[] Tables { get; set; }

        public LocationModel()
            : base()
        {

        }
    }

    public class TableInfo
    {
        public int ChairNo { get; set; }
        public int TableNo { get; set; }
    }

    public class SaveLocationModel
    {
        public string TableChairText { get; set; }
        public string TableNumberText { get; set; }
    }

    public class TableList
    {
        public long Chairs { get; set; }
        public long Number { get; set; }

    }

    public class ForwardModel : InFlowModel
    {
        public int LocationID { get; set; }

        public ForwardAction ForwardTo { get; set; }

        public bool CanCreateLocation { get; set; }

        public iRstSrv.LocationListByRestIDResponse Locations { get; set; }
    }

    public enum ForwardAction
    {
        Invalid = 0,
        CreateReservation = 1,
        EditLocation = 2,
        EditLayout = 3,
        EditBusinessHour = 4,
        EditAvailability = 5
    }

    public class LocationBackModel
    {
        public PreviousPage Previous { get; set; }
    }

    public enum PreviousPage
    {
        Summary = 0,
        Profile = 1
    }

    public class DeleteLocationModel
    {
        public int LocationID { get; set; }
    }
}