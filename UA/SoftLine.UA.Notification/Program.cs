using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using SoftLine.UA.Notification.Service;

namespace SoftLine.UA.Notification
{
    static class Program
    {
        /// <summary>
        /// Главная точка входа для приложения.
        /// </summary>
        static void Main()
        {
            //new InvoiceNotification().CheckInvoiceEve();
            //new InvoiceNotification().CheckInvoiceToday();
            //new SalesOrderNotification().CheckSalesOrderEve();
            //new SalesOrderNotification().CheckSalesOrderToday();
            //new AgreementNotification().CheckAgreementEve();
            //new AgreementNotification().CheckAgreementToday();
            ServiceBase[] ServicesToRun;
            ServicesToRun = new ServiceBase[] 
            { 
                new Service1() 
            };
            ServiceBase.Run(ServicesToRun);
        }
    }
}
