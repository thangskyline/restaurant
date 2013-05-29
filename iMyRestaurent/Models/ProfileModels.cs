using iMyRestaurent.iRstSrv;
using System.Web;

namespace iMyRestaurent.Models
{
    public class ProfileModel : InFlowModel
    {
        public string Restaurant_Name { get; set; }
   
        public string Phone { get; set; }

        public string Fax { get; set; }

        public string Address1 { get; set; }

        public string Address2 { get; set; }

        public string Address3 { get; set; }

        public string Type { get; set; }

        public string BillingAddress1 { get; set; }

        public string BillingAddress2 { get; set; }

        public string BillingAddress3 { get; set; }

        public string ContactPerson { get; set; }

        public string[] RestaurantTypes { get; set; }

        public int RestaurantID { get; set; }

        public string SecretQuestion { get; set; }

        public string SecretAnswer { get; set; }

        public string Website { get; set; }

        public Image Image { get; set; }

        public bool IsDisplay { get; set; }

        public HttpPostedFileBase RestaurantImage { get; set; }
    }
}