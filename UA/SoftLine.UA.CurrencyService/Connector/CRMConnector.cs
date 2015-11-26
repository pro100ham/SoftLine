using System;
using System.Net;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using System.ServiceModel.Description;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;

namespace SoftLine.UA.CurrencyService
{
    class CRMConnector
    {
        #region
        public static string UserName = @"softline\SVCCRMUKR";
        public static string Password = @"swovnv!1";
        #endregion

        public IOrganizationService Connect()
        {
            var creds = new ClientCredentials();
            creds.UserName.UserName = UserName;
            creds.UserName.Password = Password;

            ServicePointManager.ServerCertificateValidationCallback = delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
            OrganizationServiceProxy serviceProxy = new OrganizationServiceProxy(new Uri(@"https://ukraine.crm.softlinegroup.com/XrmServices/2011/Organization.svc"), null, creds, null);

            serviceProxy.EnableProxyTypes();
            serviceProxy.Authenticate();
            return (IOrganizationService)serviceProxy;
        }
    }
}
