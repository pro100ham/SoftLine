using System;
using System.Net;
using System.ServiceModel.Description;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Client;
using Microsoft.Xrm.Client.Services;

namespace SoftLine.InfoTera.MonitoringPrice.Proxy
{
    class CRMConnector
    {
        public IOrganizationService Connect()
        {
            var connection = CrmConnection.Parse("Url=https://alinametel.crm4.dynamics.com; Username=pro100ham@AlinaMetel.onmicrosoft.com; Password=ytdblbvrf19*; ");
            var service = new OrganizationService(connection);
            return new CrmOrganizationServiceContext(connection);
        }
    }
}
