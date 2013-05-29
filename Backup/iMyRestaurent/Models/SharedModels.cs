using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using iMyRestaurent.Shared;
using iMyRestaurent.iRstSrv;

namespace iMyRestaurent.Models
{
    public class InFlowModel
    {
        public Mode Mode { get; set; }

        public string SummaryDate { get; set; }

        public string SummaryLocationID { get; set; }

        public double LayoutZoomScale { get; set; }

        public InFlowModel()
        {
            LayoutZoomScale = 1;
        }
    }

    public class TableWS : TableData
    {
        public double Size { get; set; }

        public double CoreSize { get; set; }

        public double FontSize { get; set; }

        public CssInfo Css { get; set; }

        public TableWS()
        {
            Css = new CssInfo();
        }
    }

    public class CssInfo
    {
        public string Layout { get; set; }

        public string Table { get; set; }

        public string Avail { get; set; }

        public string Number { get; set; }

        public string NumberText { get; set; }
    }
}