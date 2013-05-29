using iMyRestaurent.iRstSrv;

namespace iMyRestaurent.Services
{
    public class iRstSrvClient
    {
        private iRstSrvClient()
        {
        }

        private static iRstSrvSoap client;

        public static iRstSrvSoap Get()
        {
            if (client == null)
            {
                client = new iRstSrvSoapClient();
            }
            return client;
        }
    }
}