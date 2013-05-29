using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace iMyRestaurent.Shared
{
    public class CustomAuth : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (Common.Restaurant == null)
            {
                FormsAuthentication.SignOut();
                httpContext.Session.Clear();
                httpContext.Session.Abandon();
                return false;
            }
            return true;
        }

    }
}
