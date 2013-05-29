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
    public class OptionModels
    {
        public string OptionID { get; set; }
        public string GroupID { get; set; }
        public string LangID { get; set; }
        public int PriLanguageID { get; set; }
        public string Contents { get; set; }
        public string optionName { get; set; }
        public string optionDesc { get; set; }
        public bool optionDisplayIcon { get; set; }
        public bool optionActive { get; set; }
        public bool IsAutoTrans { get; set; }
        public bool optionIsVeg { get; set; }
        public string XMLNameDesc { get; set; }
        public bool optionIsGF { get; set; }
        public string optionPrice { get; set; }
        public string optionType { get; set; }
        public string optionLimit { get; set; }
        public string optionSpiceLevel { get; set; }
        public string ImageID { get; set; }
        public HttpPostedFileBase optionIcon { get; set; }

        public OptionModels()
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