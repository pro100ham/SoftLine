using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;

namespace SoftLine.InfoTera.MonitoringPrice.Proxy
{
    class TopCollection
    {
        public Guid MonitoringRecordId { get; set; }

        public Money TopPriceOdessa { get; set; }

        public Money TopPriceNikolaev { get; set; }

        public EntityReference Cultivation { get; set; }
    }
}
