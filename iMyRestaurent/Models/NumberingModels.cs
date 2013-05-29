
namespace iMyRestaurent.Models
{
    public class TableNumbersModel
    {
        public int LocationID { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public TableListPosition[] tableListPos { get; set; }

        public int StartValue { get; set; }
        public int CurrentStart { get; set; }

        public bool IsEdit { get; set; }

        public TableNumbersModel()
            : base() { }
    }

    public class NumberingModel : InFlowModel
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; }

        public TableWS[] Tables { get; set; }

        public string TablePositionText { get; set; }

        public int StartNumber { get; set; }
    }
}