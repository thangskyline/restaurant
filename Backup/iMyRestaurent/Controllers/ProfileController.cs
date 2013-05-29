using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using iMyRestaurent.iRstSrv;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    [HandleError]
    public class ProfileController : Controller
    {
        //
        // GET: /Profile/
        [CustomAuth]
        public ActionResult Index()
        {
            return RedirectToAction("Index", "Summary");
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Create()
        {

            ProfileModel model = new ProfileModel()
            {
                Mode = Mode.Create,
                RestaurantID = Utils.GetRestaurentID()
            };

            // get list of restaurent type
            getRestaurantTypes(ref model);

            return View("Profile", model);
        }

        [HttpGet]
        public ActionResult Edit(string Confirm)
        {
            // auto login
            if (Confirm != null)
            {
                string Token = Confirm.Substring(0, 32);
                string RestaurantID = Confirm.Substring(32);

                //string oldPassword = oldpassword;
                if (Token != "")
                {
                    var response = iRstSrvClient.Get().RestaurantUserPWDChange_Auto_Check_00_00_001(RestaurantID, Token);
                    if (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                    {
                        Session[Constants.Token] = response.ReturnToken;

                        ///////////////////////
                        var infoResponse = iRstSrvClient.Get().RestaurantGetByID_00_00_004(RestaurantID, response.ReturnToken);

                        if (infoResponse.Error == null || infoResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                        {
                            Common.Restaurant = infoResponse.Restaurant;
                            Session[Constants.Username] = response.Username;
                        }
                        ////////////////////
                        ProfileModel model = new ProfileModel();
                        model.Mode = Mode.Edit;

                        //return Edit(model);
                        return Create();
                    }
                    else
                    {
                        return RedirectToAction("Login", "Account");
                    }
                }
                else
                {
                    return RedirectToAction("Login", "Account");
                }
            }
            else
            {
                return RedirectToAction("Login", "Account");
            }

            
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Edit(ProfileModel model)
        {
            // get list of restaurent type
            getRestaurantTypes(ref model);

            // load current info from session
            loadProfile(ref model);

            return View("Profile", model);
        }

        private void loadProfile(ref ProfileModel model)
        {
            // assign properties using reflection

            Type profileType = typeof(RestaurantData);
            Type modelType = typeof(ProfileModel);

            PropertyInfo[] properties = profileType.GetProperties();

            foreach (var property in properties)
            {
                try
                {
                    var value = property.GetValue(Common.Restaurant, null);
                    modelType.GetProperty(property.Name).SetValue(model, value, null);
                }
                catch { }
            }

        }

        private void getRestaurantTypes(ref ProfileModel model)
        {
            model.RestaurantTypes = iRstSrvClient.Get().RestaurantGetAllType_00_00_001(Common.RestaurantID, Common.Token).RestaurantTypes;
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Save(ProfileModel model)
        {
            string imageData = model.RestaurantImage == null ? string.Empty : Convert.ToBase64String(MenuController.ReadFully(model.RestaurantImage.InputStream));

            // call api to save to db
            var response = iRstSrvClient.Get().RestaurantProfileEdit_00_00_004(model.Restaurant_Name, model.Phone, model.Fax, string.Empty,
                model.Address1, model.Address2, model.Address3, string.Empty, model.SecretQuestion, model.SecretAnswer,
                string.Empty, model.Type, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                model.BillingAddress1, model.BillingAddress2, model.BillingAddress3, string.Empty, model.ContactPerson,
                Common.RestaurantID, string.IsNullOrEmpty(model.Website) ? string.Empty : model.Website.Trim(), imageData, model.IsDisplay ? "1" : "0", Common.Token);

            // store new profile in session
            var data = iRstSrvClient.Get().RestaurantGetByID_00_00_004(Common.RestaurantID, Common.Token);

            Session[Constants.RestaurantData] = data.Restaurant;

            return Json(new { IsSucceed = Utils.CheckAPIResponse(response) });

        }

        [HttpPost]
        [CustomAuth]
        public ActionResult Delete(string ImageID)
        {
            var deleteResponse = iRstSrvClient.Get().RestaurantImageDeleting_00_00_004(Common.RestaurantID, ImageID, Common.Token);

            var isSucceed = Utils.CheckAPIResponse(deleteResponse);

            if (isSucceed)
            {
                Common.Restaurant.Image = null;
            }

            return Json(new { IsSucceed = isSucceed });
        }
    }
}
