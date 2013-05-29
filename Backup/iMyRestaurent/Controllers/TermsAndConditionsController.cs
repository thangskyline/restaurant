using System.Web.Mvc;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Controllers
{
    public class TermsAndConditionsController : Controller
    {
        //
        // GET: /TermsAndConditions/
        [CustomAuth]
        public ActionResult Index()
        {
            return View();
        }

    }
}
