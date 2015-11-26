using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;

namespace SoftLine.UA.Notification.Proxy
{
    class ProxyToSendEmail 
    {
        public Guid recordId { get; set; }

        public Microsoft.Xrm.Sdk.EntityReference agreementLaw { get; set; }

        public Microsoft.Xrm.Sdk.EntityReference agreementLog { get; set; }

        public Microsoft.Xrm.Sdk.EntityReference agreementFin { get; set; }

        public string Name { get; set; }
    }

    class ProxyToSendEmailExtended
    {

        public Guid recordId { get; set; }

        public string Name { get; set; }

        public EntityReference agreementLaw { get; set; }

        public EntityReference agreementLog { get; set; }

        public EntityReference agreementFin { get; set; }

        public EntityReference agreementAc { get; set; }

        public EntityReference agreementSd { get; set; }
    }
}
