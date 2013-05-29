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
    public class ItemModels
    {
        public string ItemID { get; set; }
        public string LangID { get; set; }
        public int PriLanguageID { get; set; }
        public string ToSubOrSec { get; set; }
        public string SectionID { get; set; }
        public string itemName { get; set; }
        public string itemDesc { get; set; }
        public string Contents { get; set; }
        public bool itemDisplayIcon { get; set; }
        public bool itemDisplayImage { get; set; }
        public bool itemActive { get; set; }
        public bool IsAutoTrans { get; set; }
        public string XMLNameDesc { get; set; }
        public bool itemIsVeg { get; set; }
        public bool itemIsGF { get; set; }
        public string itemPrice { get; set; }
        public string itemSpiceLevel { get; set; }
        public string ImageID { get; set; }
        public HttpPostedFileBase itemIcon { get; set; }
        public HttpPostedFileBase itemImage { get; set; }

        public ItemModels()
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