using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace iMyRestaurent.Shared
{
    public class Milestone
    {
        public String Value { get; set; }

        public int Block { get; set; }
    }

    public enum Mode
    {
        Create = 0,
        CreateAfterRegistering = 1,
        EditFromAvailability = 2,
        EditFromLocation = 3,
        EditFromLayout = 4,
        Edit = 5, // for edit reservation
        CreateFromLocationList = 6,
        EditFromBusinessHours = 7
    }
}