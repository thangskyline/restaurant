using System;
using System.Text;
using System.Web.Mvc;
using iMyRestaurent.Models;
using iMyRestaurent.Services;
using iMyRestaurent.Shared;
using System.Web.Security;

namespace iMyRestaurent.Controllers
{
    public class AccountController : Controller
    {
        public ActionResult Index()
        {
            return RedirectToAction("Login");
        }

        [HttpGet]
        public ActionResult Login()
        {
            Clear();
            try
            {
                //Check if the browser support cookies 
                if (Request.Browser.Cookies)
                {
                    //Check if the cookies with name PBLOGIN exist on user's machine 
                    if (Request.Cookies.Get(Constants.COOKIES_PBLOGIN).Value != null)
                    {
                        //Pass the user name and password to the VerifyLogin method 
                        string cookies = Request.Cookies.Get(Constants.COOKIES_PBLOGIN).Value;
                        // Get value in cookies
                        string[] arrRet = cookies.Split(new char[] { '#' });
                        LoginModel loginModel = new LoginModel();

                        try
                        {
                            if (Convert.ToBoolean(arrRet[3]))
                            {
                                loginModel.RestaurantID = arrRet[0];
                                loginModel.UserName = arrRet[1];
                                loginModel.Password = arrRet[2];
                                loginModel.Remember = true;

                                return View(loginModel);
                            }
                        }
                        catch { }
                        //this.VerifyLogin(Request.Cookies("PBLOGIN")("UNAME").ToString(), Request.Cookies("PBLOGIN")("UPASS").ToString());
                    }
                }

                // Clear Profile temp in Profile Screen
                if (Session[Constants.ProfileTemp] != null) Session[Constants.ProfileTemp] = null;
            }
            catch { }
            return View();
        }

        [HttpPost]
        public ActionResult Login(LoginModel model)
        {
            // Login in screen [Login]
            switch (DoLogin(model))
            {
                case AfterLoginAction.ToSummaryPage:
                    // show summary screen
                    return RedirectToAction("Index", "Summary");
                case AfterLoginAction.ToChangePasswordPage:
                    // show change pass screen
                    return RedirectToAction("ChangePassword");
                default:
                    Clear();
                    ViewBag.ErrorMessage = Msg.M001;
                    return View(model);
            }
        }

        private void Clear()
        {
            FormsAuthentication.SignOut();
            Session.Clear();
            Session.Abandon();
        }

        private AfterLoginAction DoLogin(LoginModel model)
        {
            model.RestaurantID = model.RestaurantID.Trim();
            model.UserName = model.UserName.Trim();

            var response = iRstSrvClient.Get().RestaurantLogin_00_00_001(model.RestaurantID, model.UserName, model.Password, Utils.Token(model.UserName));

            if (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
            {
                Session[Constants.Token] = response.ReturnToken;

                #region Set cookie

                try
                {
                    //Check if the browser support cookies 
                    if (Request.Browser.Cookies && model.Remember)
                    {
                        //Check if the cookie with name PBLOGIN exist on user's machine 
                        if ((Request.Cookies.Get(Constants.COOKIES_PBLOGIN) == null))
                        {
                            //Create a cookie with expiry of 30 days 
                            Response.Cookies.Get(Constants.COOKIES_PBLOGIN).Expires = DateTime.Now.AddDays(30);
                            //Write username to the cookie 
                            Response.Cookies.Get(Constants.COOKIES_PBLOGIN).Value = model.RestaurantID + "#" + model.UserName + "#" + model.Password + "#" + model.Remember.ToString();
                        }
                        //If the cookie already exist then wirte the user name and password on the cookie 
                        else
                        {
                            //Write username to the cookie 
                            Response.Cookies.Get(Constants.COOKIES_PBLOGIN).Value = model.RestaurantID + "#" + model.UserName + "#" + model.Password + "#" + model.Remember.ToString();
                        }
                    }
                    else
                    {
                        Response.Cookies.Get(Constants.COOKIES_PBLOGIN).Value = model.RestaurantID + "#" + model.UserName + "#" + model.Password + "#" + model.Remember.ToString();
                        Request.Cookies.Remove(Constants.COOKIES_PBLOGIN);
                    }
                }
                catch { }

                #endregion

                // get restaurent information
                var infoResponse = iRstSrvClient.Get().RestaurantGetByID_00_00_004(model.RestaurantID, Common.Token);

                if (infoResponse.Error == null || infoResponse.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                {
                    Common.Restaurant = infoResponse.Restaurant;
                    Session[Constants.Username] = model.UserName;
                    FormsAuthentication.SetAuthCookie(model.UserName, true);

                    if (response.Active == 1)
                    {
                        return AfterLoginAction.ToSummaryPage;
                    }
                    else
                    {
                        return AfterLoginAction.ToChangePasswordPage;
                    }
                }
            }

            return AfterLoginAction.ShowError;
        }

        [HttpGet]
        public ActionResult Register()
        {
            return View(new RegisterModel()
            {
                IsRedirect = false
            });
        }

        [HttpPost]
        public ActionResult Register(RegisterModel model)
        {
            if (Utils.IsValidEmail(model.UserEmailID))
            {
                string ret = string.Empty; ;

                //Call API: Register restaurant account
                var response = iRstSrvClient.Get().RestaurantRegisterNew_00_00_001(model.UserEmailID, Utils.Token(model.UserEmailID));

                if (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                {
                    ViewBag.ErrorMessage = String.Empty;
                    model.IsRedirect = true;

                    // Redirect to Login Screen
                    return View(model);
                }
                else
                {
                    ViewBag.ErrorMessage = Msg.M004;
                    return View(model);
                }
            }
            else
            {
                ViewBag.ErrorMessage = "Your email is invalid. Please check again!";
                return View();
            }
        }

        #region Forgot password

        [HttpGet]
        public ActionResult Forgot()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Forgot(ForgotModel model)
        {
            if (string.IsNullOrEmpty(model.NewPassword))
            {
                return View(model);
            }

            // trimming
            model.RestaurantID = model.RestaurantID.Trim();
            model.UserName = model.UserName.Trim();

            // Login in screen [Login]
            LoginModel en = new LoginModel();
            en.UserName = model.UserName;
            en.Password = model.NewPassword;
            en.RestaurantID = model.RestaurantID;
            switch (DoLogin(en))
            {
                case AfterLoginAction.ToSummaryPage:
                    // show summary screen
                    return RedirectToAction("Index", "Summary");
                case AfterLoginAction.ToChangePasswordPage:
                    // show change pass screen
                    return RedirectToAction("ChangePassword");
                default:
                    ViewBag.ErrorMessage = Msg.M001;
                    return View(model);
            }
        }

        [HttpPost]
        public ActionResult DisplayPassword(string restId, string username, string answer)
        {
            var getOldPasswordResponse = iRstSrvClient.Get().UserGetForgotPassword_00_00_002(restId, username, answer.Trim(), Utils.Token(username));

            if (Utils.CheckAPIResponse(getOldPasswordResponse))
            {
                return Json(new
                {
                    IsSucceed = true,
                    Password = getOldPasswordResponse.OldPassword
                });
            }
            else
            {
                return Json(new { IsSucceed = false });
            }
        }

        [HttpPost]
        public ActionResult SendQuestion(string restId, string username)
        {
            if (Utils.IsValidEmail(username))
            {
                var response = iRstSrvClient.Get().UserGetScrtQuestion_00_00_001(restId, username, Utils.Token(username));

                return Json(new { IsSucceed = response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError });
            }
            else
            {
                return Json(new { IsSucceed = false });
            }
        }

        /// <summary>
        /// Gen password random
        /// </summary>
        /// <returns></returns>
        private string GenPassword()
        {
            string tmp = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            char[] arrChar = tmp.ToCharArray();
            // init random generator 
            Random rnd = new Random();

            // get random value (0 <= n < 3) 
            int r = rnd.Next(3);

            // pull out string from array 
            StringBuilder sbPass = new StringBuilder();
            for (int i = 0; i < 6; i++)
            {
                sbPass.Append(arrChar[rnd.Next(arrChar.Length)]);
            }
            return sbPass.ToString();
        }

        #endregion

        #region Change password

        [HttpGet]        
        public ActionResult ChangePassword(string Confirm)
        {
            try
            {
                if (Confirm != null)
                {
                    string[] words = Confirm.Split('|');
                    string firstChars = words[0];
                    string Token = firstChars.Substring(0, 32);
                    string RestaurantID = firstChars.Substring(32);


                    string oldPassword = words[1];
                    //string oldPassword = oldpassword;
                    if (Token != "" && oldPassword != "")
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
                            ChangePasswordModel model = new ChangePasswordModel()
                            {
                                Mode = Mode.Create,
                                OldPassword = oldPassword
                            };

                            return ChangePassword(model);
                        }
                        else
                        {
                            return RedirectToAction("Login");
                        }
                    }
                    else
                    {
                        return RedirectToAction("Login");
                    }
                }
                else
                {
                    ChangePasswordModel model = new ChangePasswordModel()
                    {
                        Mode = Mode.Create
                    };
                    return ChangePassword(model);
                }
                
            }
            catch {
                return RedirectToAction("Login");
            }
            
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult ChangePassword(ChangePasswordModel model)
        {
            return View(model);
        }

        [HttpPost]
        [CustomAuth]
        public ActionResult ChangePasswordAPI(ChangePasswordModel model)
        {
            string message = "";

            if (model.NewPassword == model.RetypeNewPassword)
            {
                // Call API Change password
                var response = iRstSrvClient.Get().RestaurantUserPWDChange_00_00_001(Utils.GetRestaurentID().ToString(), Utils.GetUsername(), model.OldPassword, model.NewPassword, Utils.GetToken());

                if (response.Error == null || response.Error.ErrorCode == iRstSrv.ErrorCodes.NoneError)
                {
                    if (response.UserID == -1)
                    {
                        message = Msg.M011;
                    }
                    else
                    {
                        Session[Constants.Token] = response.ReturnToken;
                    }
                }
                else
                {
                    message = Msg.M013;
                }
            }
            else
            {
                message = Msg.M012;
            }

            return Json(new { IsSucceed = string.IsNullOrEmpty(message), Message = message });
        }

        #endregion

        public ActionResult Logoff()
        {
            Clear();
            return RedirectToAction("Login");
        }
    }
}
