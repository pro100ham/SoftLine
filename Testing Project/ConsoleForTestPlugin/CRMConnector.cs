using System;
using System.Net;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using System.ServiceModel.Description;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;

namespace SoftLine.UZ.CurrencyUpdate_service_
{
    class CRMConnector
    {
        #region
        public static string UserName = @"softline\savchinvv";
        public static string Password = @"1(*ytdblbvrf";
        #endregion

        public IOrganizationService Connect()
        {
            var creds = new ClientCredentials();
            creds.UserName.UserName = UserName;
            creds.UserName.Password = Password;

            ServicePointManager.ServerCertificateValidationCallback = delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
            OrganizationServiceProxy serviceProxy = new OrganizationServiceProxy(new Uri(@"http://msk02crm13web06/UkraineTest13/XrmServices/2011/Organization.svc"), null, creds, null);

            serviceProxy.EnableProxyTypes();
            serviceProxy.Authenticate();
            return (IOrganizationService)serviceProxy;
        }
    }
}
