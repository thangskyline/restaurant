using System.Web;
using System.Web.Mvc;
using iMyRestaurent.iRstSrv;
using iMyRestaurent.Shared;
using System.Collections.Generic;

namespace iMyRestaurent.Models
{
    public class MenuModels
    {
        public string MenuID { get; set; }
        public string TypeID { get; set; }
        public string GroupTypeID { get; set; }
        public string menuName { get; set; }
        public string menuDesc { get; set; }

        public bool menuDisplayImage { get; set; }
        public bool menuActive { get; set; }

        public MenuBasic[] menus { get; set; }
        public SelectList styleSheets { get; set; }
        public SelectList currencies { get; set; }
        //public SelectList languages { get; set; }
        public Language[] languages { get; set; }
        public SelectList menutypes { get; set; }
        public SelectList grouptypes { get; set; }
        public MenuModels() : base() { }
        public LocationMenuSettings[] locations { get; set; }
        public MenuType[] MenuTypes { get; set; }
    }

    public class Content
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Desc { get; set; }
        public string Shortname { get; set; }
    }
    public class LocationContent
    {
        public int LocationID { get; set; }
        public string DeliveryZone { get; set; }
        public string Delivable { get; set; }
        public string IsBlockOrder { get; set; }
        public string PickUp { get; set; }
    }

    public class MenuModel
    {
        public HttpPostedFileBase MenuIcon { get; set; }
        public HttpPostedFileBase MenuImage { get; set; }
        public string Contents { get; set; }
        public string CSSID { get; set; }
        public string CurrencyID { get; set; }
        public int PriLanguageID { get; set; }
        public int SeLanguageID { get; set; }
        public bool IsAutoTrans { get; set; }
        public string MenuID { get; set; }
        public int[] TypeID { get; set; }
        public bool MenuDisplayImage { get; set; }
        public bool MenuActive { get; set; }
        public bool MenuDisplayIcon { get; set; }
    }

    public class BuildXmlResult
    {
        public string Xml { get; set; }
        public Content PrimaryContent { get; set; }
        public bool IsSucceed { get; set; }
        public IList<Content> Contents { get; set; }

        public static BuildXmlResult Fail
        {
            get
            {
                return new BuildXmlResult()
                {
                    IsSucceed = false
                };
            }
        }

        public BuildXmlResult()
        {
        }

        public BuildXmlResult(string xml, Content primaryContent, IList<Content> contents)
        {
            this.Xml = xml;
            this.PrimaryContent = primaryContent;
            this.IsSucceed = true;
            this.Contents = contents;
        }
    }

    public class MenuDetailModel : Menu
    {
        public string RestaurantName { get; set; }
        public string RestaurantAddress { get; set; }

        public MenuDetailModel() : base() { }

        public MenuDetailModel(Menu clone)
        {
            // bind restaurant-name
            this.RestaurantName = Common.Restaurant.Restaurant_Name;

            // bind restaurant-address
            this.RestaurantAddress = Common.Restaurant.Address1;
            if (!string.IsNullOrEmpty(Common.Restaurant.Address2))
            {
                this.RestaurantAddress += ", " + Common.Restaurant.Address2;
            }
            if (!string.IsNullOrEmpty(Common.Restaurant.Address3))
            {
                this.RestaurantAddress += ", " + Common.Restaurant.Address3;
            }
            if (!string.IsNullOrEmpty(Common.Restaurant.Address4))
            {
                this.RestaurantAddress += ", " + Common.Restaurant.Address4;
            }

            // clone object
            var props = typeof(Menu).GetProperties();
            var cloneType = typeof(MenuDetailModel);

            foreach (var prop in props)
            {
                try
                {
                    object value = prop.GetValue(clone, null);
                    cloneType.GetProperty(prop.Name).SetValue(this, value, null);
                }
                catch { }
            }
        }
    }

    public class LanguageUpdateModel
    {
        public string MenuID { get; set; }
        public string LangID { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsSecondary { get; set; }
    }

    public class SectionModel
    {

        public string Contents { get; set; }

        public int PriLanguageID { get; set; }

        public bool IsAutoTrans { get; set; }

        public string SectionID { get; set; }

        public HttpPostedFileBase Icon { get; set; }

        public string SectionName { get; set; }

        public string LangID { get; set; }

        public string ParentID { get; set; }

        public string MenuID { get; set; }

        public bool DisplayIcon { get; set; }

        public bool IsActive { get; set; }        

        public string ImageID { get; set; }
    }
}