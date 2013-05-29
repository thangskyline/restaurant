using System.Collections.Generic;
using System.Web;
using System;

namespace iMyRestaurent.Models
{
    public class DateRange
    {
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
    }

    public class WeekHoliday
    {
        public List<DateTime> Dates { get; set; }        
    }
    public class PublicHoliday
    {
        public string DayID { get; set; }
        public string EventID { get; set; }
        public string IsOverride { get; set; }
    }
}