
namespace iMyRestaurent.Models
{
    public class LayoutModel : InFlowModel
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; }
        public string TableText { get; set; }
        public TableWS[] Tables { get; set; }

        public string TablePositionText { get; set; }

        public bool IsReload { get; set; }


        // unoptimized code below 
        public string Name { get; set; }
        public string Title { get; set; }
        public TableListPosition[] tableListPos { get; set; }

        public LayoutModel()
            : base()
        {
        }
    }

    public class TableListPosition
    {
        public int ID { get; set; }

        public long Chairs { get; set; }
        public long Number { get; set; }

        public float ImageWidth { get; set; }

        public string TableID { get; set; }

        public float PositionX { get; set; }

        public float PositionY { get; set; }

        public int Order { get; set; }

        public int Avai { get; set; }
    }
}