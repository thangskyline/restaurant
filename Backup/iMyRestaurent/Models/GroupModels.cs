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
    public class GroupModels
    {
        public string GroupID { get; set; }
        public string ItemID { get; set; }
        public string LangID { get; set; }
        public int PriLanguageID { get; set; }
        public string Contents { get; set; }
        public string groupName { get; set; }
        public string groupDesc { get; set; }
        public bool groupDisplayIcon { get; set; }
        public bool groupActive { get; set; }
        public string XMLNameDesc { get; set; }
        public bool IsAutoTrans { get; set; }
        public bool groupIsVeg { get; set; }
        public bool groupIsGF { get; set; }
        public string groupPrice { get; set; }
        public string GroupTypeID { get; set; }
        public string groupLimit { get; set; }
        public string groupSpiceLevel { get; set; }
        public string ImageID { get; set; }
        public HttpPostedFileBase groupIcon { get; set; }

        public GroupModels()
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