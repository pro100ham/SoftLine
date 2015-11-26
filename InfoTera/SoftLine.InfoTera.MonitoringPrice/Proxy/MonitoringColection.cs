using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;

namespace SoftLine.InfoTera.MonitoringPrice.Proxy
{
    class MonitoringColection
    {
        public Guid MonitoringRecordId { get; set; }

        public Money PriceOfOdessa { get; set; }

        public Money PriceOfNikolaev { get; set; }

        public EntityReference Cultivation { get; set; }
    }
}
