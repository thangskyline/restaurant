using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;
using System.Web.Script.Serialization;
using iMyRestaurent.iRstSrv;
using System.Configuration;

namespace iMyRestaurent.Controllers
{
    public class MenuController : Controller
    {
        #region iMyMenu v1

        [HttpPost]
        public ActionResult GetImages(string EventID)
        {
            var getImagesResponse = iRstSrvClient.Get().MenuTypeImagesGetListAll_00_00_002(Common.RestaurantID, EventID, Common.Token);

            if (Utils.CheckAPIResponse(getImagesResponse))
            {
                return Json(new
                {
                    IsSucceed = true,
                    Images = getImagesResponse.MenuImagesList
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
        [HttpPost]
        public ActionResult Preview(string MenuID,string LangID)
        {
            try
            {
                var MenuMetaData = iRstSrvClient.Get().MenuMetaDataGetAllList(Common.RestaurantID, Common.Token);
                if (Utils.CheckAPIResponse(MenuMetaData))
                {
                    var menu = iRstSrvClient.Get().MenuGetDetails_00_00_002(Common.RestaurantID, MenuID, MenuMetaData.Languages.Where(x => x.Name == "English").FirstOrDefault().LangID.ToString(), Common.Token);
                    if (Utils.CheckAPIResponse(menu))
                    {
                        return Json(new
                        {
                            IsSucceed = true,
                            Menu = new MenuDetailModel(menu.Menu),
                            Languages = MenuMetaData.Languages
                        });
                    }
                    return Json(Common.JsonFail);
                }
                else
                {
                    return Json(Common.JsonFail);
                }   
            }
            catch
            {
                return Json(Common.JsonFail);
            }
        }
        [HttpPost]
        public ActionResult GetImageByID(string ImageID)
        {
            var getImageResponse = iRstSrvClient.Get().MenuTypeImageGetByImageID_00_00_001(Common.RestaurantID, ImageID, Common.Token);

            if (Utils.CheckAPIResponse(getImageResponse) && getImageResponse.MenuImage != null)
            {
                return Json(new
                {
                    IsSucceed = true,
                    ImageSrc = string.Format(StringFormats.ImageSrc, getImageResponse.MenuImage.ImageData),
                    ImageName = getImageResponse.MenuImage.ImageName,
                    ImageID = getImageResponse.MenuImage.ImageID
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        public ActionResult EditImageName(string EventID, string ImageID, string ImageName)
        {
            var editNameResponse = iRstSrvClient.Get().MenuTypeImageEditName_00_00_001(Common.RestaurantID, ImageID, ImageName.Trim(), Common.Token);

            return Json(new
            {
                IsSucceed = Utils.CheckAPIResponse(editNameResponse)
            });
        }

        [HttpPost]
        public ActionResult AddFiles(AddImageModel model)
        {
            if (model.Images != null)
            {
                var images = model.Images.ToArray();
                int continueIndex = model.TotalNo - images.Length;

                StringBuilder xmlBuilder = new StringBuilder();
                StringBuilder imageDataBuilder = new StringBuilder();

                string[] imageNames = model.ImageNames.Split('|');

                xmlBuilder.Append("<imagelist>");

                for (int index = 0; index < images.Length; index++)
                {
                    var image = images[index];

                    var extension = image.FileName.Substring(image.FileName.LastIndexOf('.'));

                    // stream -> byte[]
                    byte[] bytes = ReadFully(image.InputStream);

                    // byte[] -> base64
                    string base64 = Convert.ToBase64String(bytes);

                    // create xml node
                    xmlBuilder.Append("<image>");
                    xmlBuilder.AppendFormat("<imagename>{0}</imagename>", imageNames[index]);
                    xmlBuilder.AppendFormat("<order>{0}</order>", index + continueIndex);
                    xmlBuilder.AppendFormat("<extension>{0}</extension>", extension);
                    xmlBuilder.Append("</image>");

                    string separator = index + 1 < images.Length ? "@Im@ge#" : string.Empty;

                    imageDataBuilder.AppendFormat("{0}@@rder#{1}@@XT#{2}{3}", index + continueIndex, extension, base64, separator);
                }

                xmlBuilder.Append("</imagelist>");

                var addImageResponse = iRstSrvClient.Get().MenuTypeImageAddList_00_00_002(Common.RestaurantID, xmlBuilder.ToString(),
                    imageDataBuilder.ToString(), model.EventID, Common.Token);

                if (Utils.CheckAPIResponse(addImageResponse))
                {
                    return Json(new { IsSucceed = true, ImageIDs = addImageResponse.MenuImageList });
                }
                else
                {
                    return Json(new { IsSucceed = false });
                }
            }
            return Json(new { });
        }

        [HttpPost]
        public ActionResult ChangeFile(ChangeImageModel model)
        {
            StringBuilder xmlBuilder = new StringBuilder();
            StringBuilder imageDataBuilder = new StringBuilder();

            xmlBuilder.Append("<imagelist>");

            // stream -> byte[]
            byte[] bytes = ReadFully(model.Image.InputStream);

            // byte[] -> base64
            string base64 = Convert.ToBase64String(bytes);

            var extension = model.Image.FileName.Substring(model.Image.FileName.LastIndexOf('.'));

            // create xml node
            xmlBuilder.Append("<image>");
            xmlBuilder.AppendFormat("<imagename>{0}</imagename>", model.ImageName);
            xmlBuilder.AppendFormat("<imageid>{0}</imageid>", model.ImageID);
            xmlBuilder.AppendFormat("<extension>{0}</extension>", extension);
            xmlBuilder.Append("</image>");

            imageDataBuilder.AppendFormat("{0}@IMGID#{1}@@XT#{2}", model.ImageID, extension, base64);

            xmlBuilder.Append("</imagelist>");

            var changeImageResponse = iRstSrvClient.Get().MenuTypeImageUpdateList_00_00_002(Common.RestaurantID, xmlBuilder.ToString(), imageDataBuilder.ToString(), model.EventID, Common.Token);

            return Json(new
            {
                IsSucceed = Utils.CheckAPIResponse(changeImageResponse),
                Index = model.ImageIndex,
                Url = changeImageResponse.MenuImageList[0].URLPath
            });
        }

        public static byte[] ReadFully(Stream input)
        {
            byte[] buffer = new byte[16 * 1024];
            using (MemoryStream ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }

        [HttpPost]
        public ActionResult DeleteImage(string imageId)
        {
            try
            {
                var deleteResponse = iRstSrvClient.Get().MenuTypeImageDelete_00_00_001(Common.RestaurantID, imageId, Common.Token);

                return Json(new { IsSucceed = Utils.CheckAPIResponse(deleteResponse) });
            }
            catch { }

            return Json(Common.JsonFail);
        }

        [HttpPost]
        public ActionResult Copy(string SourceEventID, string TargetEventID)
        {
            try
            {
                var copyResponse = iRstSrvClient.Get().MenuTypeImageCopyList_00_00_002(Common.RestaurantID, SourceEventID, TargetEventID, Common.Token);

                return Json(new
                {
                    IsSucceed = Utils.CheckAPIResponse(copyResponse)
                });
            }
            catch { }

            return Json(Common.JsonFail);
        }

        #endregion

        [CustomAuth]
        public ActionResult OldEditor1()
        {
            MenuModels model = new MenuModels();
            var responseLocations = iRstSrvClient.Get().MenuLocationSettingsGet(Common.RestaurantID, Common.Token);
            var MenuMetaData = iRstSrvClient.Get().MenuMetaDataGetAllList(Common.RestaurantID, Common.Token);
            model.grouptypes = new SelectList(MenuMetaData.GroupTypes, "TypeID", "Name");
            model.styleSheets = new SelectList(MenuMetaData.StyleSheets, "CSSID", "Name");
            model.currencies = new SelectList(MenuMetaData.Currencies, "CurrencyID", "ShortName");
            model.locations = responseLocations.LocationSettingsList;
            model.languages = MenuMetaData.Languages;
            model.menutypes = new SelectList(MenuMetaData.MenuTypes, "TypeID", "Name");
            model.MenuTypes = MenuMetaData.MenuTypes;
            //load menu list
            var MenuList = iRstSrvClient.Get().MenuGetList(Common.RestaurantID, MenuMetaData.Languages.Where(x => x.Name == "English").FirstOrDefault().LangID.ToString(), Common.Token);

            model.menus = MenuList.Menus;
            return View(model);
        }
        [CustomAuth]
        public ActionResult Editor()
        {
            MenuModels model = new MenuModels();
            var responseLocations = iRstSrvClient.Get().MenuLocationSettingsGet(Common.RestaurantID, Common.Token);
            var MenuMetaData = iRstSrvClient.Get().MenuMetaDataGetAllList(Common.RestaurantID, Common.Token);
            model.grouptypes = new SelectList(MenuMetaData.GroupTypes, "TypeID", "Name");
            model.styleSheets = new SelectList(MenuMetaData.StyleSheets, "CSSID", "Name");
            model.currencies = new SelectList(MenuMetaData.Currencies, "CurrencyID", "ShortName");
            model.locations = responseLocations.LocationSettingsList;
            model.languages = MenuMetaData.Languages;
            model.menutypes = new SelectList(MenuMetaData.MenuTypes, "TypeID", "Name");
            model.MenuTypes = MenuMetaData.MenuTypes;
            //load menu list
            var MenuList = iRstSrvClient.Get().MenuGetList(Common.RestaurantID, MenuMetaData.Languages.Where(x => x.Name == "English").FirstOrDefault().LangID.ToString(), Common.Token);

            model.menus = MenuList.Menus;
            return View(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetContent(string MenuID, string LangID)
        {
            var response = iRstSrvClient.Get().MenuGetNameDescList(Common.RestaurantID, MenuID, LangID, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                return Json(new
                {
                    IsSucceed = true,
                    Content = response
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
        [HttpPost]
        [CustomAuth]
        public ActionResult GetLocationList()
        {
            var response = iRstSrvClient.Get().MenuLocationSettingsGet(Common.RestaurantID, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                return Json(new
                {
                    IsSucceed = true,
                    Locations = response.LocationSettingsList
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
        [HttpPost]
        [CustomAuth]
        public ActionResult SetLocationList(string LocationJson)
        {
            string xmlLocationSetting = BuildLocationXML(LocationJson);
            if (!xmlLocationSetting.Equals("fail"))
            {
                var response = iRstSrvClient.Get().MenuLocationSettingsSet(Common.RestaurantID, xmlLocationSetting, Common.Token);

                if (Utils.CheckAPIResponse(response))
                {
                    return Json(new
                    {
                        IsSucceed = true
                    });
                }
                else
                {
                    return Json(Common.JsonFail);
                }
            }
            else
            {
                return Json(Common.JsonFail);
            }
            
        }
        private string BuildLocationXML(string json)
        {
            try
            {
                // deserialize json
                var serializer = new JavaScriptSerializer();
                var contents = serializer.Deserialize<IList<LocationContent>>(json);
                // create xml
                StringBuilder xmlBuilder = new StringBuilder();
                xmlBuilder.Append("<locationlist>");
                
                foreach (var content in contents)
                {
                    xmlBuilder.Append("<locationsetting>");
                    xmlBuilder.AppendFormat("<locationid>{0}</locationid>", content.LocationID);
                    xmlBuilder.AppendFormat("<deliveryzone>{0}</deliveryzone>", content.DeliveryZone);
                    xmlBuilder.AppendFormat("<delivable>{0}</delivable>", content.Delivable);
                    xmlBuilder.AppendFormat("<isblockorder>{0}</isblockorder>", content.IsBlockOrder);
                    xmlBuilder.AppendFormat("<pickup>{0}</pickup>", content.PickUp);
                    xmlBuilder.Append("</locationsetting>");
                }
                
                xmlBuilder.Append("</locationlist>");
                return xmlBuilder.ToString();
            }
            catch
            {
                return "fail";
            }
        }
        private BuildXmlResult BuildXML(string json, int priLangID, bool autoTrans, bool includePrimaryLang)
        {
            try
            {
                // deserialize json
                var serializer = new JavaScriptSerializer();
                var contents = serializer.Deserialize<IList<Content>>(json);

                // create xml
                StringBuilder xmlBuilder = new StringBuilder();

                xmlBuilder.Append("<namedesclist>");

                // get primary content
                Content primaryContent = contents.Where(it => it.ID == priLangID).FirstOrDefault();

                if (includePrimaryLang && primaryContent != null)
                {
                    xmlBuilder.Append("<namedesc>");
                    xmlBuilder.AppendFormat("<name>{0}</name>", primaryContent.Name);
                    xmlBuilder.AppendFormat("<desc>{0}</desc>", primaryContent.Desc);
                    xmlBuilder.AppendFormat("<langid>{0}</langid>", primaryContent.ID);
                    xmlBuilder.Append("</namedesc>");
                }

                // translate all other languages based on primary content when auto-translate is checked
                if (autoTrans)
                {
                    // get all language
                    var metaData = iRstSrvClient.Get().MenuMetaDataGetAllList(Common.RestaurantID, Common.Token);

                    var otherLanguages = metaData.Languages.Where(it => it.LangID != priLangID);

                    contents = new List<Content>();
                    contents.Add(primaryContent);

                    foreach (var lang in otherLanguages)
                    {
                        var transName = Translate(primaryContent.Name, primaryContent.Shortname, lang.ShortName);
                        var transDesc = Translate(primaryContent.Desc, primaryContent.Shortname, lang.ShortName);
                        contents.Add(new Content()
                        {
                            ID = lang.LangID,
                            Name = transName,
                            Desc = transDesc,
                            Shortname = lang.ShortName
                        });
                        xmlBuilder.Append("<namedesc>");
                        xmlBuilder.AppendFormat("<name>{0}</name>", transName);
                        xmlBuilder.AppendFormat("<desc>{0}</desc>", transDesc);
                        xmlBuilder.AppendFormat("<langid>{0}</langid>", lang.LangID);
                        xmlBuilder.Append("</namedesc>");
                    }
                }
                else
                {
                    foreach (var content in contents)
                    {
                        if (content.ID != priLangID)
                        {
                            xmlBuilder.Append("<namedesc>");
                            xmlBuilder.AppendFormat("<name>{0}</name>", content.Name);
                            xmlBuilder.AppendFormat("<desc>{0}</desc>", content.Desc);
                            xmlBuilder.AppendFormat("<langid>{0}</langid>", content.ID);
                            xmlBuilder.Append("</namedesc>");
                        }
                    }
                }

                // add close tag
                xmlBuilder.Append("</namedesclist>");
                return new BuildXmlResult(xmlBuilder.ToString(), primaryContent, contents);
            }
            catch
            {
                return BuildXmlResult.Fail;
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult AddMenu(MenuModel model)//
        {
            // build xml
            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, false);

            if (xmlBuilder.IsSucceed)
            {
                // build image data
                string iconData = model.MenuIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.MenuIcon.InputStream));
                string imageData = model.MenuImage == null ? string.Empty : Convert.ToBase64String(ReadFully(model.MenuImage.InputStream));

                // call api
                var response = iRstSrvClient.Get().MenuAddNew_00_00_003(Common.RestaurantID,
                    xmlBuilder.PrimaryContent.Name, xmlBuilder.PrimaryContent.Desc,
                    model.PriLanguageID.ToString(), model.SeLanguageID.ToString(), model.CurrencyID, model.CSSID,
                    GenXMLTypeList(model.TypeID), imageData, model.MenuDisplayImage ? "1" : "0", iconData, model.MenuDisplayIcon ? "1" : "0",
                    model.MenuActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

                if (Utils.CheckAPIResponse(response))
                {
                    return Json(new
                    {
                        IsSucceed = true,
                        ActionType = "add",
                        MenuID = response.MenuID,
                        MenuName = xmlBuilder.PrimaryContent.Name
                    });
                }
            }

            return Json(Common.JsonFail);
        }

        private string GenXMLTypeList(int[] ids)
        {
            StringBuilder xml = new StringBuilder();
            xml.Append("<typelist>");
            foreach (var id in ids)
            {
                xml.AppendFormat("<type><typeid>{0}</typeid></type>", id);
            }
            xml.Append("</typelist>");

            return xml.ToString();
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult UpdateMenu(MenuModel model)
        {
            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, true);

            string iconData = model.MenuIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.MenuIcon.InputStream));
            string imageData = model.MenuImage == null ? string.Empty : Convert.ToBase64String(ReadFully(model.MenuImage.InputStream));

            var response = iRstSrvClient.Get().MenuUpdating_00_00_003(Common.RestaurantID, model.MenuID, model.CurrencyID, model.CSSID,
                GenXMLTypeList(model.TypeID), imageData, model.MenuDisplayImage ? "1" : "0", iconData, model.MenuDisplayIcon ? "1" : "0",
                model.MenuActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

            //var response = iRstSrvClient.Get().MenuUpdating_00_00_002(Common.RestaurantID, model.MenuID, model.CurrencyID, model.CSSID, model.TypeID,
            //    imageData, model.MenuDisplayImage ? "1" : "0", iconData, model.MenuDisplayImage ? "1" : "0",
            //    model.MenuActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                // create menu data
                Menu menu = new Menu();
                menu.MenuID = response.MenuID;
                menu.IsActive = model.MenuActive ? 1 : 0;
                menu.TypeIDList = model.TypeID;
                menu.CSSID = Convert.ToInt32(model.CSSID);
                menu.CurrencyID = Convert.ToInt32(model.CurrencyID);

                var names = new List<NameContent>();
                var descs = new List<DescContent>();

                foreach (var content in xmlBuilder.Contents)
                {
                    names.Add(new NameContent() { LangID = content.ID, Content = content.Name });
                    descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc });
                }

                menu.Names = names.ToArray();
                menu.Descs = descs.ToArray();


                // need to update IconID, ImageID
                if (string.IsNullOrEmpty(response.IconPath))
                {
                    menu.Icon = null;
                }
                else
                {
                    menu.Icon = new Image() { ImageID = -1, ImagePath = response.IconPath, IsDisplay = model.MenuDisplayImage ? 1 : 0 };
                }

                if (string.IsNullOrEmpty(response.ImagePath))
                {
                    menu.Image = null;
                }
                else
                {
                    menu.Image = new Image() { ImageID = -1, ImagePath = response.IconPath, IsDisplay = model.MenuDisplayImage ? 1 : 0 };
                }

                return Json(new
                {
                    IsSucceed = true,
                    ActionType = "update",
                    Menu = menu
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult AddSection(SectionModel model)
        {
            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, false);

            if (xmlBuilder.IsSucceed)
            {
                // build image data
                string iconData = model.Icon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.Icon.InputStream));

                // call api
                var response = iRstSrvClient.Get().MenuSectionAddNew_00_00_003(Common.RestaurantID, xmlBuilder.PrimaryContent.Name, xmlBuilder.PrimaryContent.Desc,
                    model.PriLanguageID.ToString(), model.ParentID == null ? string.Empty : model.ParentID,
                    model.MenuID, iconData, model.DisplayIcon ? "1" : "0", iconData, model.DisplayIcon ? "1" : "0",
                     model.IsActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

                if (Utils.CheckAPIResponse(response))
                {

                    // create menu data
                    MenuSection section = new MenuSection();
                    section.SectionID = response.SectionID;
                    section.IsActive = model.IsActive ? 1 : 0;

                    var names = new List<NameContent>();
                    var descs = new List<DescContent>();

                    foreach (var content in xmlBuilder.Contents)
                    {
                        int IsPrimary = 0;
                        if (model.PriLanguageID == content.ID)
                            IsPrimary = 1;
                        names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                        descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                    }

                    section.Names = names.ToArray();
                    section.Descs = descs.ToArray();

                    // need to update IconID, ImageID
                    if (string.IsNullOrEmpty(response.IconPath))
                    {
                        section.Icon = null;
                    }
                    else
                    {
                        section.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.DisplayIcon ? 1 : 0 };
                    }

                    return Json(new
                    {
                        IsSucceed = true,
                        ActionType = "add",
                        Section = section,
                        SectionName = xmlBuilder.PrimaryContent.Name
                    });
                }
                else
                {
                    return Json(Common.JsonFail);
                }
            }

            return Json(Common.JsonFail);
        }
        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteImageIcon(string ImageID)//
        {
            var respIcon = iRstSrvClient.Get().MenuImageDeleting(Common.RestaurantID, ImageID, Common.Token);
            if (Utils.CheckAPIResponse(respIcon))
            {
                return Json(new
                {
                    IsSucceed = true
                });
            }
            return Json(Common.JsonFail);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult UpdateSection(SectionModel model)//
        {
            string imageisDisplay = model.DisplayIcon ? "1" : "0";//ok
            string iconisDisplay = model.DisplayIcon ? "1" : "0";//ok
            string isActive = model.IsActive ? "1" : "0";//ok
            //string LangID = model.LangID;

            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, true);

            //string imageData = model.Icon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.Icon.InputStream));
            string iconData = model.Icon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.Icon.InputStream));

            var response = iRstSrvClient.Get().MenuSectionUpdating_00_00_003(Common.RestaurantID, model.SectionID, iconData, imageisDisplay, iconData, iconisDisplay, isActive, xmlBuilder.Xml, Common.Token);

            //if insert thanh cong 
            if (Utils.CheckAPIResponse(response))
            {

                // create section data
                MenuSection section = new MenuSection();
                section.SectionID = response.SectionID;
                section.IsActive = model.IsActive ? 1 : 0;

                var names = new List<NameContent>();
                var descs = new List<DescContent>();

                foreach (var content in xmlBuilder.Contents)
                {
                    int IsPrimary = 0;
                    if (model.PriLanguageID == content.ID)
                        IsPrimary = 1;
                    names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                    descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                }

                section.Names = names.ToArray();
                section.Descs = descs.ToArray();

                // need to update IconID, ImageID
                if (string.IsNullOrEmpty(response.IconPath))
                {
                    section.Icon = null;
                }
                else
                {
                    section.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.DisplayIcon ? 1 : 0 };
                }

                return Json(new
                {
                    IsSucceed = true,
                    ActionType = "update",
                    Section = section,
                    SectionName = xmlBuilder.PrimaryContent.Name
                });
            }
            else
            {
                return Json(new { IsSucceed = false, errorDetail = "" });
            }

        }

        [HttpPost]
        [CustomAuth]
        public ActionResult UpdateItem(ItemModels model)//
        {
            string isVeg = model.itemIsVeg ? "1" : "0";
            string spiceLevel = model.itemSpiceLevel;
            string isGF = model.itemIsGF ? "1" : "0";
            string Price = model.itemPrice;
            if (Price == null)
                Price = "0";
            string imageisDisplay = model.itemDisplayImage ? "1" : "0";//ok
            string iconisDisplay = model.itemDisplayIcon ? "1" : "0";//ok
            string isActive = model.itemActive ? "1" : "0";//ok

            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, true);

            string imageData = model.itemImage == null ? string.Empty : Convert.ToBase64String(ReadFully(model.itemImage.InputStream));
            string iconData = model.itemIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.itemIcon.InputStream));
            //if (model.DelIcon)
            //{
            //    var respIcon = iRstSrvClient.Get().MenuImageDeleting(Common.RestaurantID, model.ImageID, Common.Token);
            //}
            var response = iRstSrvClient.Get().MenuItemUpdating_00_00_003(Common.RestaurantID, model.ItemID == null ? string.Empty : model.ItemID,
                     imageData, model.itemDisplayImage ? "1" : "0", iconData, model.itemDisplayIcon ? "1" : "0",
                     isVeg, spiceLevel, Price, isGF, model.itemActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

            //if insert thanh cong 
            if (Utils.CheckAPIResponse(response))
            {

                // create menu data
                MenuItem item = new MenuItem();
                item.ItemID = response.ItemID;
                item.IsActive = model.itemActive ? 1 : 0;
                item.IsVeg = model.itemIsVeg ? 1 : 0;
                item.IsGF = model.itemIsGF ? 1 : 0;
                item.SpiceLevel = Convert.ToInt32(model.itemSpiceLevel);
                item.Price = Convert.ToDecimal(model.itemPrice);

                var names = new List<NameContent>();
                var descs = new List<DescContent>();

                foreach (var content in xmlBuilder.Contents)
                {
                    int IsPrimary = 0;
                    if (model.PriLanguageID == content.ID)
                        IsPrimary = 1;
                    names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                    descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                }

                item.Names = names.ToArray();
                item.Descs = descs.ToArray();

                // need to update IconID, ImageID
                if (string.IsNullOrEmpty(response.ImagePath))
                {
                    item.Image = null;
                }
                else
                {
                    item.Image = new Image() { ImageID = response.ImageID, ImagePath = response.ImagePath, IsDisplay = model.itemDisplayImage ? 1 : 0 };
                }
                if (string.IsNullOrEmpty(response.IconPath))
                {
                    item.Icon = null;
                }
                else
                {
                    item.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.itemDisplayIcon ? 1 : 0 };
                }

                return Json(new
                {
                    IsSucceed = true,
                    ActionType = "update",
                    Item = item,
                    ItemName = xmlBuilder.PrimaryContent.Name,
                    To = model.ToSubOrSec
                });
            }
            else
            {
                return Json(new { IsSucceed = false, errorDetail = "" });
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult UpdateGroup(GroupModels model)//
        {
            string limit = model.groupLimit;
            string GroupTypeID = model.GroupTypeID;
            string isVeg = model.groupIsVeg ? "1" : "0";
            string spiceLevel = model.groupSpiceLevel;
            string isGF = model.groupIsGF ? "1" : "0";
            string Price = model.groupPrice;
            if (Price == null)
                Price = "0";
            if (limit == null || limit == "0")
                limit = "1";
            string imageisDisplay = model.groupDisplayIcon ? "1" : "0";//ok
            string iconisDisplay = model.groupDisplayIcon ? "1" : "0";//ok
            string isActive = model.groupActive ? "1" : "0";//ok

            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, true);

            //string imageData = model.groupIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.groupIcon.InputStream));
            string iconData = model.groupIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.groupIcon.InputStream));
            //if (model.DelIcon)
            //{
            //    var respIcon = iRstSrvClient.Get().MenuImageDeleting(Common.RestaurantID, model.ImageID, Common.Token);
            //}
            var response = iRstSrvClient.Get().MenuGroupUpdating_00_00_003(Common.RestaurantID, model.GroupID == null ? string.Empty : model.GroupID,
                     GroupTypeID, iconData, model.groupDisplayIcon ? "1" : "0", iconData, model.groupDisplayIcon ? "1" : "0",
                     isVeg, spiceLevel, Price, isGF, limit, model.groupActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

            //if insert thanh cong 
            if (Utils.CheckAPIResponse(response))
            {

                // create menu data
                MenuGroup group = new MenuGroup();
                group.GroupID = response.GroupID;
                group.IsActive = model.groupActive ? 1 : 0;
                group.IsVeg = model.groupIsVeg ? 1 : 0;
                group.IsGF = model.groupIsGF ? 1 : 0;
                group.SpiceLevel = Convert.ToInt32(model.groupSpiceLevel);
                group.Price = Convert.ToDecimal(model.groupPrice);
                group.Limit = Convert.ToInt32(model.groupLimit);
                group.TypeID = Convert.ToInt32(model.GroupTypeID);
                var names = new List<NameContent>();
                var descs = new List<DescContent>();

                foreach (var content in xmlBuilder.Contents)
                {
                    int IsPrimary = 0;
                    if (model.PriLanguageID == content.ID)
                        IsPrimary = 1;
                    names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                    descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                }

                group.Names = names.ToArray();
                group.Descs = descs.ToArray();

                // need to update IconID, ImageID
                if (string.IsNullOrEmpty(response.IconPath))
                {
                    group.Icon = null;
                }
                else
                {
                    group.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.groupDisplayIcon ? 1 : 0 };
                }

                return Json(new
                {
                    IsSucceed = true,
                    ActionType = "update",
                    Group = group,
                    GroupName = xmlBuilder.PrimaryContent.Name
                });
            }
            else
            {
                return Json(new { IsSucceed = false, errorDetail = "" });
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult UpdateOption(OptionModels model)//
        {
            string limit = model.optionLimit;
            string isVeg = model.optionIsVeg ? "1" : "0";
            string spiceLevel = model.optionSpiceLevel;
            string isGF = model.optionIsGF ? "1" : "0";
            string Price = model.optionPrice;
            if (Price == null)
                Price = "0";
            string imageisDisplay = model.optionDisplayIcon ? "1" : "0";//ok
            string iconisDisplay = model.optionDisplayIcon ? "1" : "0";//ok
            string isActive = model.optionActive ? "1" : "0";//ok

            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, true);

            //string imageData = model.optionIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.optionIcon.InputStream));
            string iconData = model.optionIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.optionIcon.InputStream));
            //if (model.DelIcon)
            //{
            //    var respIcon = iRstSrvClient.Get().MenuImageDeleting(Common.RestaurantID, model.ImageID, Common.Token);
            //}
            var response = iRstSrvClient.Get().MenuOptionUpdating_00_00_003(Common.RestaurantID, model.OptionID == null ? string.Empty : model.OptionID,
                      iconData, model.optionDisplayIcon ? "1" : "0",
                     isVeg, spiceLevel, Price, isGF, model.optionActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

            //if insert thanh cong 
            if (Utils.CheckAPIResponse(response))
            {

                // create menu data
                MenuOption option = new MenuOption();
                option.OptionID = response.OptionID;
                option.IsActive = model.optionActive ? 1 : 0;
                option.IsVeg = model.optionIsVeg ? 1 : 0;
                option.IsGF = model.optionIsGF ? 1 : 0;
                option.SpiceLevel = Convert.ToInt32(model.optionSpiceLevel);
                option.Price = Convert.ToDecimal(model.optionPrice);

                var names = new List<NameContent>();
                var descs = new List<DescContent>();

                foreach (var content in xmlBuilder.Contents)
                {
                    int IsPrimary = 0;
                    if (model.PriLanguageID == content.ID)
                        IsPrimary = 1;
                    names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                    descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                }

                option.Names = names.ToArray();
                option.Descs = descs.ToArray();

                // need to update IconID, ImageID
                if (string.IsNullOrEmpty(response.IconPath))
                {
                    option.Icon = null;
                }
                else
                {
                    option.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.optionDisplayIcon ? 1 : 0 };
                }

                return Json(new
                {
                    IsSucceed = true,
                    ActionType = "update",
                    Option = option,
                    OptionName = xmlBuilder.PrimaryContent.Name
                });
            }
            else
            {
                return Json(new { IsSucceed = false, errorDetail = "" });
            }

        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetSection(string MenuID)
        {
            string RestaurantID = Common.RestaurantID;
            string LangID = "100000";
            var sections = iRstSrvClient.Get().MenuSectionGetList(RestaurantID, MenuID, LangID, Common.Token);
            return Json(sections.MenuSections, JsonRequestBehavior.AllowGet); //sections.MenuSections[0].
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetSubSection(string SectionID)
        {
            string RestaurantID = Common.RestaurantID;
            string LangID = "100000";
            var subsections = iRstSrvClient.Get().MenuSubSectionGetList(RestaurantID, SectionID, LangID, Common.Token);
            return Json(subsections.MenuSubSections, JsonRequestBehavior.AllowGet); //sections.MenuSections[0].
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult GetMenuDetail(string LangID, string MenuID)
        {
            var apiResponse = iRstSrvClient.Get().MenuGetDetails_00_00_002(Common.RestaurantID, MenuID, LangID, Common.Token);
            //apiResponse.Menu.Sections
            //apiResponse.Menu.Sections = apiResponse.Menu.Sections.OrderBy(x => x.DisplayOrder);
            if (Utils.CheckAPIResponse(apiResponse))
            {
                // build xml structure here

                return Json(new
                {
                    IsSucceed = true,
                    Menu = new MenuDetailModel(apiResponse.Menu)
                });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        //public ActionResult AddItem(int? SectionID, string itemName)
        public ActionResult AddItem(ItemModels model)
        {
            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, false);

            string isVeg = model.itemIsVeg ? "1" : "0";//ok
            string spiceLevel = model.itemSpiceLevel;
            string isGF = model.itemIsGF ? "1" : "0";//ok
            string Price = model.itemPrice;
            if (Price == null)
                Price = "0";
            //string imageData = string.Empty;
            if (xmlBuilder.IsSucceed)
            {
                // build image data
                string iconData = model.itemIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.itemIcon.InputStream));
                string imageData = model.itemImage == null ? string.Empty : Convert.ToBase64String(ReadFully(model.itemImage.InputStream));
                // call api
                var response = iRstSrvClient.Get().MenuItemAddNew_00_00_003(Common.RestaurantID, xmlBuilder.PrimaryContent.Name, xmlBuilder.PrimaryContent.Desc,
                    model.PriLanguageID.ToString(), model.SectionID == null ? string.Empty : model.SectionID,
                     imageData, model.itemDisplayImage ? "1" : "0", iconData, model.itemDisplayIcon ? "1" : "0",
                    isVeg, spiceLevel, Price, isGF, model.itemActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

                if (Utils.CheckAPIResponse(response))
                {

                    // create menu data
                    MenuItem item = new MenuItem();
                    item.ItemID = response.ItemID;
                    item.IsActive = model.itemActive ? 1 : 0;
                    item.IsVeg = model.itemIsVeg ? 1 : 0;
                    item.IsGF = model.itemIsGF ? 1 : 0;
                    item.SpiceLevel = Convert.ToInt32(model.itemSpiceLevel);
                    item.Price = Convert.ToDecimal(model.itemPrice);
                    var names = new List<NameContent>();
                    var descs = new List<DescContent>();

                    foreach (var content in xmlBuilder.Contents)
                    {
                        int IsPrimary = 0;
                        if (model.PriLanguageID == content.ID)
                            IsPrimary = 1;
                        names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                        descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                    }

                    item.Names = names.ToArray();
                    item.Descs = descs.ToArray();

                    // need to update IconID, ImageID
                    if (string.IsNullOrEmpty(response.ImagePath))
                    {
                        item.Image = null;
                    }
                    else
                    {
                        item.Image = new Image() { ImageID = response.ImageID, ImagePath = response.ImagePath, IsDisplay = model.itemDisplayImage ? 1 : 0 };
                    }
                    if (string.IsNullOrEmpty(response.IconPath))
                    {
                        item.Icon = null;
                    }
                    else
                    {
                        item.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.itemDisplayIcon ? 1 : 0 };
                    }
                    return Json(new
                    {
                        IsSucceed = true,
                        ActionType = "add",
                        Item = item,
                        ItemName = xmlBuilder.PrimaryContent.Name,
                        To = model.ToSubOrSec
                    });


                }
                else
                {
                    return Json(Common.JsonFail);
                }
            }

            return Json(Common.JsonFail);



            //string RestaurantID = Common.RestaurantID;//ok
            //string itemName = model.itemName;//ok
            //string itemDesc = model.itemDesc;//ok
            //string sectionID = model.SectionID;
            //string imageisDisplay = model.itemDisplayIcon ? "1" : "0";//ok
            //string iconisDisplay = model.itemDisplayIcon ? "1" : "0";//ok
            //string isAction = model.itemActive ? "1" : "0";//ok
            //string LangID = model.LangID;
            //string iconData = string.Empty;
            //string DisplayOrder = string.Empty;
            //string isVeg = model.itemIsVeg ? "1" : "0";//ok
            //string spiceLevel = model.itemSpiceLevel;
            //string isGF = model.itemIsGF ? "1" : "0";//ok
            //string Price = model.itemPrice;
            //string imageData = string.Empty;
            //if (model.itemIcon != null)
            //    imageData = writeImage(model.itemIcon);
            //var item = iRstSrvClient.Get().MenuItemAddNew_00_00_001 (RestaurantID, itemName, itemDesc, LangID, sectionID,
            //     imageData, imageisDisplay, imageData, iconisDisplay, DisplayOrder, isVeg, spiceLevel, Price, isGF, isAction, Common.Token);
            ////if insert thanh cong 
            //if (Utils.CheckAPIResponse(item))
            //{
            //    iRstSrv.MenuItem rsItem = new iRstSrv.MenuItem();
            //    rsItem.ItemID = item.ItemID;
            //    if (item.IconPath != null)
            //    {
            //        iRstSrv.Image icon = new iRstSrv.Image();
            //        icon.ImagePath = item.IconPath;
            //        icon.IsDisplay = Convert.ToInt32(iconisDisplay);
            //        rsItem.Icon = icon;
            //    }
            //    iRstSrv.NameContent name = new iRstSrv.NameContent();
            //    name.Content = itemName;
            //    name.LangID = Convert.ToInt32(LangID);
            //    name.IsPrimary = 1;
            //    iRstSrv.NameContent[] names = new iRstSrv.NameContent[1];
            //    names[0] = name;

            //    rsItem.Names = names;
            //    //rsItem.Desc = itemDesc;
            //    rsItem.IsVeg = Convert.ToInt32(isVeg);
            //    rsItem.IsGF = Convert.ToInt32(isGF);
            //    rsItem.SpiceLevel = Convert.ToInt32(spiceLevel);
            //    rsItem.Price = Convert.ToDecimal(Price);
            //    rsItem.IsActive = Convert.ToInt32(isAction);
            //    return Json(new { IsSucceed = true, ActionType = "Add", Item = rsItem });
            //}
            //else
            //{
            //    return Json(new { IsSucceed = false, errorDetail = "" });
            //}
        }

        [HttpPost]
        [CustomAuth]
        //public ActionResult AddGroup(int ItemID, string groupName)
        public ActionResult AddGroup(GroupModels model)
        {
            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, false);

            string limit = model.groupLimit;
            string GroupTypeID = model.GroupTypeID;
            string isVeg = model.groupIsVeg ? "1" : "0";//ok
            string spiceLevel = model.groupSpiceLevel;
            string isGF = model.groupIsGF ? "1" : "0";//ok
            string Price = model.groupPrice;
            if (Price == null)
                Price = "0";
            if (limit == null || limit == "0")
                limit = "1";
            //string imageData = string.Empty;
            if (xmlBuilder.IsSucceed)
            {
                // build image data
                string iconData = model.groupIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.groupIcon.InputStream));

                // call api
                var response = iRstSrvClient.Get().MenuGroupAddNew_00_00_003(Common.RestaurantID, xmlBuilder.PrimaryContent.Name, xmlBuilder.PrimaryContent.Desc,
                    model.PriLanguageID.ToString(), model.ItemID == null ? string.Empty : model.ItemID, GroupTypeID,
                     iconData, model.groupDisplayIcon ? "1" : "0", iconData, model.groupDisplayIcon ? "1" : "0",
                     isVeg, spiceLevel, Price, isGF, limit, model.groupActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

                if (Utils.CheckAPIResponse(response))
                {

                    // create menu data
                    MenuGroup group = new MenuGroup();
                    group.GroupID = response.GroupID;
                    group.IsActive = model.groupActive ? 1 : 0;
                    group.IsVeg = model.groupIsVeg ? 1 : 0;
                    group.IsGF = model.groupIsGF ? 1 : 0;
                    group.SpiceLevel = Convert.ToInt32(model.groupSpiceLevel);
                    group.Price = Convert.ToDecimal(model.groupPrice);
                    group.Limit = Convert.ToInt32(model.groupLimit);
                    group.TypeID = Convert.ToInt32(model.GroupTypeID);

                    var names = new List<NameContent>();
                    var descs = new List<DescContent>();

                    foreach (var content in xmlBuilder.Contents)
                    {
                        int IsPrimary = 0;
                        if (model.PriLanguageID == content.ID)
                            IsPrimary = 1;
                        names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                        descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                    }

                    group.Names = names.ToArray();
                    group.Descs = descs.ToArray();

                    // need to update IconID, ImageID
                    if (string.IsNullOrEmpty(response.IconPath))
                    {
                        group.Icon = null;
                    }
                    else
                    {
                        group.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.groupDisplayIcon ? 1 : 0 };
                    }

                    return Json(new
                    {
                        IsSucceed = true,
                        ActionType = "add",
                        Group = group,
                        GroupName = xmlBuilder.PrimaryContent.Name
                    });


                }
                else
                {
                    return Json(Common.JsonFail);
                }
            }

            return Json(Common.JsonFail);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteMenu(string MenuID)
        {
            var deleteMenu = iRstSrvClient.Get().MenuDeleting(Common.RestaurantID, MenuID, Common.Token);
            if (Utils.CheckAPIResponse(deleteMenu))
            {
                return Json(new { IsSucceed = true, ActionType = "Delete" });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteSection(string SectionID)
        {
            var deleteSection = iRstSrvClient.Get().MenuSectionDeleting(Common.RestaurantID, SectionID, Common.Token);
            if (Utils.CheckAPIResponse(deleteSection))
            {
                return Json(new { IsSucceed = true, ActionType = "Delete" });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteItem(string ItemID)
        {
            var deleteItem = iRstSrvClient.Get().MenuItemDeleting(Common.RestaurantID, ItemID, Common.Token);
            if (Utils.CheckAPIResponse(deleteItem))
            {
                return Json(new { IsSucceed = true, ActionType = "Delete" });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteGroup(string GroupID)
        {
            var deleteGroup = iRstSrvClient.Get().MenuGroupDeleting(Common.RestaurantID, GroupID, Common.Token);
            if (Utils.CheckAPIResponse(deleteGroup))
            {
                return Json(new { IsSucceed = true, ActionType = "Delete" });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult DeleteOption(string OptionID)
        {
            var deleteOption = iRstSrvClient.Get().MenuOptionDeleting(Common.RestaurantID, OptionID, Common.Token);
            if (Utils.CheckAPIResponse(deleteOption))
            {
                return Json(new { IsSucceed = true, ActionType = "Delete" });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        private string WriteImage(HttpPostedFileBase image)
        {
            var extension = image.FileName.Substring(image.FileName.LastIndexOf('.'));
            // stream -> byte[]
            byte[] bytes = ReadFully(image.InputStream);
            // byte[] -> base64
            return Convert.ToBase64String(bytes);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult ChangeDispayOrder(string FirstID, string SecondID, string Type)
        {
            if (Type == "SubSection")
            {
                Type = "Section";
            }
            var response = iRstSrvClient.Get().MenuSetDisplayOrders(Common.RestaurantID, FirstID, SecondID, Type, Common.Token);
            if (Utils.CheckAPIResponse(response))
            {
                return Json(new { IsSucceed = true });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult AddOption(OptionModels model)
        {
            var xmlBuilder = BuildXML(model.Contents, model.PriLanguageID, model.IsAutoTrans, false);

            string limit = model.optionLimit;
            string isVeg = model.optionIsVeg ? "1" : "0";//ok
            string spiceLevel = model.optionSpiceLevel;
            string isGF = model.optionIsGF ? "1" : "0";//ok
            string Price = model.optionPrice;
            if (Price == null)
                Price = "0";
            //string imageData = string.Empty;
            if (xmlBuilder.IsSucceed)
            {
                // build image data
                string iconData = model.optionIcon == null ? string.Empty : Convert.ToBase64String(ReadFully(model.optionIcon.InputStream));

                // call api
                var response = iRstSrvClient.Get().MenuOptionAddNew_00_00_003(Common.RestaurantID, xmlBuilder.PrimaryContent.Name, xmlBuilder.PrimaryContent.Desc,
                    model.PriLanguageID.ToString(), model.GroupID == null ? string.Empty : model.GroupID,
                     iconData, model.optionDisplayIcon ? "1" : "0",
                     isVeg, spiceLevel, Price, isGF, model.optionActive ? "1" : "0", xmlBuilder.Xml, Common.Token);

                if (Utils.CheckAPIResponse(response))
                {

                    // create menu data
                    MenuOption option = new MenuOption();
                    option.OptionID = response.OptionID;
                    option.IsActive = model.optionActive ? 1 : 0;
                    option.IsVeg = model.optionIsVeg ? 1 : 0;
                    option.IsGF = model.optionIsGF ? 1 : 0;
                    option.SpiceLevel = Convert.ToInt32(model.optionSpiceLevel);
                    option.Price = Convert.ToDecimal(model.optionPrice);

                    var names = new List<NameContent>();
                    var descs = new List<DescContent>();

                    foreach (var content in xmlBuilder.Contents)
                    {
                        int IsPrimary = 0;
                        if (model.PriLanguageID == content.ID)
                            IsPrimary = 1;
                        names.Add(new NameContent() { LangID = content.ID, Content = content.Name, IsPrimary = IsPrimary });
                        descs.Add(new DescContent() { LangID = content.ID, Content = content.Desc, IsPrimary = IsPrimary });
                    }

                    option.Names = names.ToArray();
                    option.Descs = descs.ToArray();

                    // need to update IconID, ImageID
                    if (string.IsNullOrEmpty(response.IconPath))
                    {
                        option.Icon = null;
                    }
                    else
                    {
                        option.Icon = new Image() { ImageID = response.IconID, ImagePath = response.IconPath, IsDisplay = model.optionDisplayIcon ? 1 : 0 };
                    }

                    return Json(new
                    {
                        IsSucceed = true,
                        ActionType = "add",
                        Option = option,
                        OptionName = xmlBuilder.PrimaryContent.Name
                    });
                }
                else
                {
                    return Json(Common.JsonFail);
                }
            }

            return Json(Common.JsonFail);
        }

        private AdmAccessToken GetToken()
        {
            //if (Token == null)
            //{
            string apiID = ConfigurationManager.AppSettings["BingAPIClientID"];
            string apiCode = ConfigurationManager.AppSettings["BingApiClientCode"];

            String strTranslatorAccessURI = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";
            String strRequestDetails = string.Format("grant_type=client_credentials&client_id={0}&client_secret={1}&scope=http://api.microsofttranslator.com", HttpUtility.UrlEncode(apiID), HttpUtility.UrlEncode(apiCode));

            System.Net.WebRequest webRequest = System.Net.WebRequest.Create(strTranslatorAccessURI);
            webRequest.ContentType = "application/x-www-form-urlencoded";
            webRequest.Method = "POST";

            byte[] bytes = System.Text.Encoding.ASCII.GetBytes(strRequestDetails);
            webRequest.ContentLength = bytes.Length;
            using (System.IO.Stream outputStream = webRequest.GetRequestStream())
            {
                outputStream.Write(bytes, 0, bytes.Length);
            }
            System.Net.WebResponse webResponse = webRequest.GetResponse();

            System.Runtime.Serialization.Json.DataContractJsonSerializer serializer = new System.Runtime.Serialization.Json.DataContractJsonSerializer(typeof(AdmAccessToken));
            //Get deserialized object from JSON stream 
            Token = (AdmAccessToken)serializer.ReadObject(webResponse.GetResponseStream());

            //}
            return Token;
        }

        private static AdmAccessToken Token = null;

        private string Translate(string input, string source, string destination)
        {
            try
            {
                //BingTrans.LanguageServiceClient client = new BingTrans.LanguageServiceClient();
                //return client.Translate("6dLsMjUZlv3ILCUXVQ2WKaRoCtaSvS4ejs8qVGpcm/o=", textToTranslate, sourceLanguage, targetLanguage);
                var token = GetToken();

                string headerValue = "Bearer " + token.access_token;
                string txtToTranslate = input;
                string uri = "http://api.microsofttranslator.com/v2/Http.svc/Translate?text=" + System.Web.HttpUtility.UrlEncode(txtToTranslate) + "&from=" + source + "&to=" + destination;
                System.Net.WebRequest translationWebRequest = System.Net.WebRequest.Create(uri);
                translationWebRequest.Headers.Add("Authorization", headerValue);
                System.Net.WebResponse response = null;
                response = translationWebRequest.GetResponse();
                System.IO.Stream stream = response.GetResponseStream();
                System.Text.Encoding encode = System.Text.Encoding.GetEncoding("utf-8");
                System.IO.StreamReader translatedStream = new System.IO.StreamReader(stream, encode);
                System.Xml.XmlDocument xTranslation = new System.Xml.XmlDocument();
                xTranslation.LoadXml(translatedStream.ReadToEnd());
                return System.Web.HttpUtility.UrlDecode(xTranslation.LastChild.InnerText).Length == 0 ? input : System.Web.HttpUtility.UrlDecode(xTranslation.LastChild.InnerText);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult UpdateLanguage(LanguageUpdateModel model)
        {
            var response = iRstSrvClient.Get().MenuLanguagesUpdating(Common.RestaurantID, model.MenuID, model.LangID,
                model.IsPrimary ? "1" : "0", model.IsSecondary ? "1" : "0", Common.Token);

            if (Utils.CheckAPIResponse(response))
            {
                return Json(new { IsSucceed = true });
            }
            else
            {
                return Json(Common.JsonFail);
            }
        }
    }

    public class AdmAccessToken
    {
        public string access_token { get; set; }
        public string token_type { get; set; }
        public string expires_in { get; set; }
        public string scope { get; set; }
    }
}
