
namespace iMyRestaurent.Models
{
    public class AvailabilityModel : InFlowModel
    {
        public string LocationName { get; set; }

        public int LocationID { get; set; }

        public TableWS[] Tables { get; set; }

        public AvailabilityModel()
            : base()
        {
        }
    }

    public class SaveAvailabilityModel
    {
        public int LocationID { get; set; }

        public string Tables { get; set; }

        public string Statuses { get; set; }
    }
}