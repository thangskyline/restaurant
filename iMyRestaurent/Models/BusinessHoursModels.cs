using System.Collections.Generic;
using System.Web;
using System;

namespace iMyRestaurent.Models
{
    public class MenuInput
    {
        public List<iRstSrv.SittingTime> SittingTimes { get; set; }

        public string Name { get; set; }

        public bool IsEmpty { get; set; }

        public int SittingID { get; set; }

        public int Index { get; set; }
    }

    public class BizHourModel: InFlowModel
    {
        public string Token { get; set; }

        public int MenuInputCount { get; set; }

        public int LocationID { get; set; }

        public string LocationName { get; set; }
    }

    public class AddMenuModel : InFlowModel
    {
        public string Token { get; set; }
        public int LocationID { get; set; }
        public string LocationName { get; set; }
    }

    public class OverrideModel
    {
        public int DayID { get; set; }
        public int OverrideID { get; set; }
        public int IsOverride { get; set; }
        public int EventID { get; set; }
    }

    public class ImageModel
    {
        public string Src { get; set; }
        public int ID { get; set; }
        public string Name { get; set; }
    }

    public class AddImageModel
    {
        public IEnumerable<HttpPostedFileBase> Images { get; set; }

        public int TotalNo { get; set; }

        public string EventID { get; set; }

        public string ImageNames { get; set; }
    }

    public class ChangeImageModel
    {
        public HttpPostedFileBase Image { get; set; }

        public string EventID { get; set; }

        public string ImageID { get; set; }

        public int ImageIndex { get; set; }

        public string ImageName { get; set; }
    }

    
}