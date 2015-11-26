using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using SoftLine.UA.CurrencyService.Service;

namespace SoftLine.UA.CurrencyService
{
    static class Program
    {
        /// <summary>
        /// Главная точка входа для приложения.
        /// </summary>
        static void Main()
        {
            //new CurrencyUpdateClass().UpdateCurrency();
            ServiceBase[] ServicesToRun;
            ServicesToRun = new ServiceBase[] 
            { 
                new CurrencyService() 
            };
            ServiceBase.Run(ServicesToRun);
        }
    }
}
