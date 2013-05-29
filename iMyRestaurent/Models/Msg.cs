namespace iMyRestaurent.Models
{
    public class Msg
    {
        public const string M001 = "Your login was not successful! Please enter the correct login ID, Username or Password and try again!";
        public const string M002 = "Your email is invalid. Please check again!";
        public const string M003 = "Your new login ID and password has been emailed to you. Please use this ID and password to login!";
        public const string M004 = "Registering is not successful!";
        public const string M005 = "A major step forward in managing your restaurant and getting customers to make table reservations from Smartphone devices or your website.";
        public const string M006 = "";
        public const string M007 = "Your answer is incorrect!";
        public const string M008 = "Please input your email!";
        public const string M009 = "Please input your RestaurantID!";
        public const string M010 = "Something is able to be inputted wrong!";
        public const string M011 = "You did not provide the correct password!";
        public const string M012 = "The two passwords do not match!";
        public const string M013 = "Your password DID NOT change!";
        public const string M014 = "Table reservation has been cancelled successfully!";
        public const string M015 = "Operation failed, error code: {0}, please try again";
        public const string M016 = "This guest is now blocked from all future reservations at your restaurant! On the iMyTable application this guest will no longer be able to find any vacant tables to reserve!";
        public const string M017 = "Report the guest as a no show has been sent to iMyRestaurant!";
        public const string M018 = "Save successful!";

        public const string M021 = "iMyRestaurant - Create Restaurant Profile";
        public const string M022 = "iMyRestaurant - Edit Restaurant Profile";
        public const string M024 = "The table you have selected do not have enough chairs for the number of guests! Do you want to continue with this move?";
        public const string M025 = "You are moving {0} ({1} guest(s)) from table no. {2} with {3} chairs to table no. {4} with {5} chairs. Are you sure you want to make this change?";
        public const string M026 = "You are moving {0} ({1} guest(s)) from table no. {2} with {3} chairs to table no. {4} with {5} chairs. The time of the reservation has been changed and is now from {6} to {7}. Are you sure you want to make this change?";
        public const string M027 = "The time of the reservation has been changed and is now from {0} to {1}. Are you sure you want to make this change?";
        public const string M028 = "Invalid move as there is already a reservation on this table at this time! Please move the guest to a vacant table.";

        /*
         * {0}: LayoutCode
         * {1}: GuestNo
         * {2}: Date
         * {3}: StartTime
         * {4}: EndTime
         */
        public const string M038 = "Table no. {0} for {1} guests. Time slot {2} from {3} to {4}. Do you want to reserve this table?";
    }
}