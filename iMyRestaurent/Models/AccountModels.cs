using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using iMyRestaurent.Shared;

namespace iMyRestaurent.Models
{
    public enum AfterLoginAction
    {
        ToSummaryPage,
        ToChangePasswordPage,
        ShowError
    }

    public class LoginModel
    {
        public string RestaurantID { get; set; }

        public string UserName { get; set; }

        [DataType(DataType.Password)]
        public string Password { get; set; }

        public bool Remember { get; set; }
    }

    public class RegisterModel
    {
        private string userEmailID;

        [DisplayName("Email (Login)")]
        [Required]
        [RegularExpression(Constants.EmailRegex, ErrorMessage = "Your email is invalid. Please check again!")]
        public string UserEmailID
        {
            get
            {
                return userEmailID;
            }
            set
            {
                userEmailID = value == null ? "" : value.Trim();
            }
        }

        public bool IsRedirect { get; set; }
    }

    public class ForgotModel
    {
        public string RestaurantID { get; set; }

        public string UserName { get; set; }

        public string SecretAnswer { get; set; }

        [DataType(DataType.Password)]
        public string NewPassword { get; set; }
    }

    public class ChangePasswordModel : InFlowModel
    {
        public string RestaurantID { get; set; }

        public string UserName { get; set; }

        [DataType(DataType.Password)]
        public string OldPassword { get; set; }

        [DataType(DataType.Password)]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        public string RetypeNewPassword { get; set; }
    }
}
