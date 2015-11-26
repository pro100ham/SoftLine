using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;

namespace testWCF
{
    // ПРИМЕЧАНИЕ. Команду "Переименовать" в меню "Рефакторинг" можно использовать для одновременного изменения имени класса "FirstService" в коде, SVC-файле и файле конфигурации.
    // ПРИМЕЧАНИЕ. Чтобы запустить клиент проверки WCF для тестирования службы, выберите элементы FirstService.svc или FirstService.svc.cs в обозревателе решений и начните отладку.
    public class FirstService : IFirstService
    {
        public string DoWork()
        {
            return "Hi, this is WCF";
        }

        #region Члены IFirstService


        public int add(int x, int y)
        {
            return x + y;
        }

        #endregion
    }
}
