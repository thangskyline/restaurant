using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using iMyRestaurent.Shared;
using iMyRestaurent.iRstSrv;

namespace iMyRestaurent.Models
{
    public class DetailModel
    {
        public string Feedback { get; set; }

        public string BookingID { get; set; }

        public string BillAmount { get; set; }

        public string Comments { get; set; }

        public string IsOnTime { get; set; }

        public string IsConfirmed { get; set; }

        public string BookingDate { get; set; }

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        public string TableID { get; set; }

        public string NoOfGuests { get; set; }

        public string SittingTime { get; set; }

        public string LocationID { get; set; }

        public string EventID { get; set; }

        public string PhoneNumber { get; set; }

        public string GuestName { get; set; }

        public string GuestPhone { get; set; }
    }

    public class ReservationModel
    {
        public const int ShortSitting = 1;
        public const int MediumSitting = 2;
        public const int LongSitting = 3;

        public int LocationID { get; set; }

        public string LocationName { get; set; }

        public string SummaryDate { get; set; }

        public string InputDate { get; set; }

        public string Date { get; set; }

        public string StartTime { get; set; }

        public BizHoursByLocIDAndDateResponse SittingTimes { get; set; }

        public SittingType SittingType { get; set; }

        public TableWS[] Tables { get; set; }

        public List<ShiftBlock> Blocks { get; set; }

        public SittingTime CurrentShift { get; set; }

        public string EndTime { get; set; }

        public TableStatusByLocationIDAndTimeResponse TableStatus { get; set; }

        public bool IsKitchenClose { get; set; }

        public string BookingDate { get; set; }

        public string GuestName { get; set; }

        public string Mobile { get; set; }

        public string GuestNo { get; set; }

        public RefreshMode RefreshMode { get; set; }

        public int RecentTableID { get; set; }

        public string PersonID { get; set; }

        public Mode Mode { get; set; }

        public int BookingID { get; set; }

        public string OriginBookingDate { get; set; }

        public ReservationModel()
        {
            RefreshMode = RefreshMode.Full;
            SittingType = Models.SittingType.Undetected;
        }
    }

    public class StatusModel
    {
        public TableStatus[] TableStatuses { get; set; }

        public bool IsSucceed { get; set; }

        public SittingTime[] BizHours { get; set; }

        public ShiftBlock[] Blocks { get; set; }

        public SittingType SittingType { get; set; }

        public SittingTime CurrentShift { get; set; }

        public bool IsKitchenClose { get; set; }

        public double StartPos { get; set; }
    }

    public class QueryStatusModel
    {
        public string LocationID { get; set; }

        public string Date { get; set; }

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        public string PhoneNumber { get; set; }

        public string PersonID { get; set; }

        public int Duration { get; set; }

        public int SittingType { get; set; }

        public long MilliSecs { get; set; }

        public string ReservationTime { get; set; }
    }

    public class ReservationStaticModel : InFlowModel
    {
        public string PersonID { get; set; }

        public TableWS[] Tables { get; set; }

        public string LocationID { get; set; }

        public string LocationName { get; set; }

        public string GuestName { get; set; }

        public string PhoneNumber { get; set; }

        public string GuestNo { get; set; }

        public string InitialTime { get; set; }

        public int BookingID { get; set; }

        public string EndTime { get; set; }

        public int Duration { get; set; }

        public SittingType SittingType { get; set; }

        public string LayoutCode { get; set; }
    }

    public enum SittingType
    {
        Undetected,
        ShortSitting,
        MediumSitting,
        LongSitting
    }

    public class ShiftBlock
    {
        public double Left { get; set; }
        public double Width { get; set; }
        public string Text { get; set; }
        public bool IsKitchenBlock { get; set; }
    }

    public class BookingModel
    {
        public string EventID { get; set; }

        public string TableID { get; set; }

        public string Date { get; set; }

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        public string PhoneNumber { get; set; }

        public string GuestName { get; set; }

        public string NoOfGuests { get; set; }

        public string BookingID { get; set; }

        public double Duration { get; set; }

        public string SittingTime { get; set; }

        public long MilliSecs { get; set; }

        public string ReservationTime { get; set; }
    }

    public enum RefreshMode
    {
        KeepInformation,
        Full
    }

    public class BookingDetailModel
    {

        [DisplayName("BookingID")]
        public int BookingID { get; set; }

        [DisplayName("Date")]
        public string BookingDate { get; set; }

        [DisplayName("")]
        public int RestaurantID { get; set; }

        [DisplayName("")]
        public int LocationID { get; set; }

        [DisplayName("Location")]
        public string LocationName { get; set; }

        [DisplayName("")]
        public int EventID { get; set; }

        [DisplayName("Menu type")]
        public string MenuType { get; set; }

        [DisplayName("")]
        public int TableID { get; set; }

        [DisplayName("Table no")]
        public string TableNo { get; set; }

        [DisplayName("")]
        public int PersonID { get; set; }

        [DisplayName("")]
        public int IsStarted { get; set; }

        [DisplayName("")]
        public int IsOrdered { get; set; }

        [DisplayName("")]
        public int IsComplete { get; set; }

        [DisplayName("")]
        public int IsPaid { get; set; }

        [DisplayName("")]
        public int IsConfirmed { get; set; }

        [DisplayName("")]
        public string Feedback { get; set; }

        [DisplayName("")]
        public string TableNumber { get; set; }

        [DisplayName("Number of guests")]
        public string NoOfGuests { get; set; }

        [DisplayName("")]
        public int SystemID { get; set; }

        [DisplayName("")]
        public string FirstName { get; set; }

        [DisplayName("")]
        public string LastName { get; set; }

        [DisplayName("Name")]
        public string FullName { get; set; }

        [DisplayName("Mobile phone no")]
        public string PhoneNumber { get; set; }

        [DisplayName("Email")]
        public string Email { get; set; }

        [DisplayName("")]
        public string BookingStartTime { get; set; }

        [DisplayName("")]
        public string BookingEndTime { get; set; }

        [DisplayName("Reservation time slot")]
        public string TimeSlot
        {
            get { return BookingStartTime + " to " + BookingEndTime; }
        }

        [DisplayName("iMytable Reservation")]
        public int iMyTableReserved { get; set; }

        [DisplayName("Bill toltal amount")]
        public string BillAmount { get; set; }

        [DisplayName("Guest arrived on time")]
        public bool IsOntime { get; set; }

        [DisplayName("Guest rating")]
        public int GuestRating { get; set; }

        [DisplayName("")]
        public int RateSize { get; set; }

        [DisplayName("")]
        public int IsNoShow { get; set; }

        [DisplayName("")]
        public int IsShortSitting { get; set; }

        [DisplayName("")]
        public int IsLongSitting { get; set; }

        [DisplayName("")]
        public int IsMediumSitting { get; set; }
    }
}