using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using iMyRestaurent.Shared;
using iMyRestaurent.iRstSrv;
using System.Web.Mvc;

namespace iMyRestaurent.Models
{
    public class SectionModels
    {
        public string SectionID { get; set; }
        public string LangID { get; set; }
        public string menuID { get; set; }
        public string parentID { get; set; }
        public string sectionName { get; set; }
        public string sectionDesc { get; set; }
        public bool sectionDisplayIcon { get; set; }
        public bool sectionActive { get; set; }
        public bool IsAutoTrans { get; set; }
        public string XMLNameDesc { get; set; }
        public HttpPostedFileBase sectionIcon { get; set; }
       
        public SectionModels()
            : base()
        {

        }
    }

    //public class StyleSheet
    //{
    //    public int StyleSheetID { get; set; }        
    //    public int StyleSheetName { get; set; }        
    //}


}