using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;

namespace testWCF
{
    // ПРИМЕЧАНИЕ. Команду "Переименовать" в меню "Рефакторинг" можно использовать для одновременного изменения имени интерфейса "IFirstService" в коде и файле конфигурации.
    [ServiceContract]
    public interface IFirstService
    {
        [OperationContract]
        string DoWork();

        [OperationContract]
        int add(int x , int y);
    }
}
