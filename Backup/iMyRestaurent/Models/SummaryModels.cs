using System;
using System.Collections.Generic;
using iMyRestaurent.Shared;
using iMyRestaurent.iRstSrv;

namespace iMyRestaurent.Models
{
    public class TableRulerModel
    {
        public string ID { get; set; }
        public TableDataSummary[] Tables { get; set; }
    }

    public class DisplayBizHourModel
    {
        public SummaryModel MasterData { get; set; }
        public SittingTimeSummary BizHour { get; set; }
    }

    public class DisplayBookingModel
    {
        public SummaryModel MasterData { get; set; }
        public BookingDataSummary Booking { get; set; }
    }

    public class TimeRulerModel
    {
        public string ID { get; set; }
        public bool Top { get; set; }
        public SummaryModel Summary { get; set; }
    }

    public class SummaryModel
    {
        public LocationListByRestIDResponse Locations { get; set; }

        public string Date { get; set; }

        public string InputDate { get; set; }

        public int LocationID { get; set; }

        public string Token { get; set; }

        public ReservationsSummaryResponse Summary { get; set; }

        public bool IsClose { get; set; }

        public string RootTime { get; set; }

        public DateTime BoundaryStartTime { get; set; }

        public DateTime BoundaryEndTime { get; set; }

        public List<Milestone> Milestones { get; set; }

        public int BlockNo { get; set; }

        public double ZoomScale { get; set; }

        public int ScrollTop { get; set; }

        public int ScrollLeft { get; set; }

        public SummaryModel()
        {
            Milestones = new List<iMyRestaurent.Shared.Milestone>();

            //default zoom & scroll position
            ZoomScale = 1;
            ScrollTop = 0;
            ScrollLeft = 0;
        }
    }

    public class CheckDragModel
    {
        public string BookingID { get; set; }

        public string EventID { get; set; }

        public string TableID { get; set; }

        public string BookingDate { get; set; }

        public string BoundaryStartDate { get; set; }

        public float Block { get; set; }

        public float Length { get; set; }
    }

    public class SubmitDragModel
    {
        public string BookingID { get; set; }

        public string EventID { get; set; }

        public string TableID { get; set; }

        public string BookingDate { get; set; }

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        public string BoundaryStartTime { get; set; }
    }
}