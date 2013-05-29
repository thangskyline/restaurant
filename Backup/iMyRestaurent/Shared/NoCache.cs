using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace iMyRestaurent.Shared
{
    public class NoCache
    {
        #region singleton

        private static NoCache instance;

        public static NoCache Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new NoCache();
                }

                return instance;
            }
        }

        #endregion

        private NoCache() { }

        public string Url(UrlHelper helper, string path)
        {
            string salt = DateTime.Now.Ticks.ToString();
            return string.Format("{0}?v={1}", helper.Content(path), salt);
        }

        public MvcHtmlString Javascript(UrlHelper helper, string path)
        {
            return MvcHtmlString.Create(string.Format("<script type=\"text/javascript\" src=\"{0}\" charset=\"utf-8\"></script>", Url(helper, path)));
        }

        public MvcHtmlString Css(UrlHelper helper, string path)
        {
            return MvcHtmlString.Create(string.Format("<link rel=\"Stylesheet\" type=\"text/css\" href=\"{0}\" />", Url(helper, path)));
        }
    }
}