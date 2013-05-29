using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using log4net;

namespace iMyRestaurent
{
    public class CustomHandleErrorAttribute : HandleErrorAttribute
    {
        private readonly ILog log = LogManager.GetLogger(typeof(CustomHandleErrorAttribute));
        public override void OnException(ExceptionContext filterContext)
        {
            if (!(filterContext.Exception is NoLogException))
            {
                log.Error("Error occurred: ", filterContext.Exception);
            }
        }
    }

    /// <summary>
    /// Exception to use when do not need to log error
    /// </summary>
    public class NoLogException : Exception
    {
    }
}
