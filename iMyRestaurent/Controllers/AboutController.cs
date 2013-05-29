using System.Web.Mvc;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    public class AboutController : Controller
    {
        //
        // GET: /About/

        [CustomAuth]
        public ActionResult Index()
        {
            return View();
        }

    }
}
