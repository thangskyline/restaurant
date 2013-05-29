using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using iMyRestaurent.iRstSrv;

namespace iMyRestaurent.Models
{
    public class FilterModel
    {
        public string LocationID { get; set; }

        public string ModifiedDateOption { get; set; }

        public string BookingDateOption { get; set; }

        public string StartModifiedDate { get; set; }

        public string EndModifiedDate { get; set; }

        public string IsiMyTable { get; set; }

        public string StartBookingDate { get; set; }

        public string EndBookingDate { get; set; }

        public string MenuTypeID { get; set; }

        public string IsNew { get; set; }

        public string IsConfirmed { get; set; }
    }

    public class ReportElement : RerportBookingData
    {
        public string ModifiedTime { get; set; }

        public string ModifiedDateText { get; set; }

        public string SittingTimeText { get; set; }

        public string BookingDateText { get; set; }

        public ReportElement(RerportBookingData input)
        {
            this.ModifiedDateText = input.ModifiedDate.ToString("dd/MM/yyyy");
            this.ModifiedTime = input.ModifiedDate.ToString("HH:mm");
            this.SittingTimeText = TimeSpan.FromMinutes(input.SittingTime).ToString(@"%h\:mm");
            this.BookingDateText = input.BookingDate.ToString("dd/MM/yyyy");
            this.BillAmount = input.BillAmount;
            this.BookingID = input.BookingID;
            this.BookingStartTime = input.BookingStartTime;
            this.Chairs = input.Chairs;
            this.Comments = input.Comments;
            this.Email = input.Email;
            this.FullName = input.FullName;
            this.GuestRating = input.GuestRating;
            this.iMyTableReserved = input.iMyTableReserved;
            this.IsConfirmed = input.IsConfirmed;
            this.IsNew = input.IsNew;
            this.IsNewGuest = input.IsNewGuest;
            this.IsOntime = input.IsOntime;
            this.LocationOfiMyTableApp = input.LocationOfiMyTableApp;
            this.Menu = input.Menu;
            this.NoOfGuests = input.NoOfGuests;
            this.PhoneNumber = input.PhoneNumber;
            this.TableNo = input.TableNo;
            this.IsByEmail = input.IsByEmail;
        }
    }
}