namespace CRM_Experiments
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Microsoft.Xrm.Sdk;
    using Microsoft.Xrm.Sdk.Client;
    using Microsoft.Crm.Sdk.Messages;
    using System.ServiceModel.Description;
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    using System.Net.Security;

    class CrmService
    {
        IOrganizationService _service;
        public crmContext XrmContext;
        EntityReference _defaultUomReference = null;
        EntityReference _defaultUomScheduleReference = null;
        EntityReference _defaultCurrencyReference = null;

        private static Dictionary<string, Guid> CurrencyIsoCodeGuid = new Dictionary<string, Guid>();
        private static Dictionary<string, decimal> CurrencyIsoCodeExhangeRate = new Dictionary<string, decimal>();

        public CrmService()
        {
            _service = GetService();
            XrmContext = new crmContext(_service);
        }

        public CrmService(IOrganizationService service)
        {
            _service = service;
            XrmContext = new crmContext(_service);
        }

        public EntityReference DefaultCurrencyId
        {
            get
            {
                if (_defaultCurrencyReference == null)
                {
                    _defaultCurrencyReference = GetUsdReference();
                }
                return _defaultCurrencyReference;
            }
        }

        public Guid Create(Entity entity)
        {
            try
            {
                return _service.Create(entity);
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        public void Update(Entity entity)
        {
            try
            {
                XrmContext.UpdateObject(entity);
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        private IOrganizationService GetService()
        {
            // Get services and contexten
            IOrganizationService service;
            OrganizationServiceProxy serviceProxy;

            try
            {
                var creds = new ClientCredentials();
                creds.UserName.UserName = @"SL\s_crm";
                creds.UserName.Password = @"Pa$$w0rd";

                ServicePointManager.ServerCertificateValidationCallback = delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
                serviceProxy = new OrganizationServiceProxy(new Uri(@"https://crm.softline.az/SoftlineInternationalLtd/XRMServices/2011/Organization.svc"), null, creds, null);

                serviceProxy.EnableProxyTypes();
                serviceProxy.Authenticate();
                service = (IOrganizationService)serviceProxy;

                /*IServiceConfiguration<IOrganizationService> orgConfigInfo =
                    ServiceConfigurationFactory.CreateConfiguration<IOrganizationService>(
                        new Uri("https://crm.softline.az/SoftlineInternationalLtd/XRMServices/2011/Organization.svc")
                    );
                var creds = new System.ServiceModel.Description.ClientCredentials();
                creds.Windows.ClientCredential =
                    new System.Net.NetworkCredential(
                        @"SL\s_crm", @"Pa$$w0rd"
                    );*/

                //IServiceConfiguration<IOrganizationService> orgConfigInfo =
                //    ServiceConfigurationFactory.CreateConfiguration<IOrganizationService>(
                //        new Uri("http://192.168.1.127/softline1/XRMServices/2011/Organization.svc")
                //    );
                //var creds = new System.ServiceModel.Description.ClientCredentials();
                //creds.Windows.ClientCredential =
                //    new System.Net.NetworkCredential(
                //        @"crm2011net\crmdemoadmin", @"1234Qwer"
                //    );

               /* using (serviceProxy = new OrganizationServiceProxy(orgConfigInfo, creds))
                {
                    serviceProxy.ServiceConfiguration.CurrentServiceEndpoint.Behaviors.Add(new ProxyTypesBehavior());
                    service = (IOrganizationService)serviceProxy;
                }*/
            }
            catch (Exception ex)
            {
                throw;
            }

            return service;
        }

        private EntityReference GetUsdReference()
        {
            Guid usdGuid = (from c in XrmContext.TransactionCurrencySet
                            where c.ISOCurrencyCode == "USD"
                            select c.TransactionCurrencyId).FirstOrDefault() ?? Guid.Empty;

            if (usdGuid == Guid.Empty)
            {
                throw new Exception("No USD TransactionCurrency??");
            }

            return new EntityReference(TransactionCurrency.EntityLogicalName, usdGuid);
        }

        internal void UpdateWebResource(string name, string dataString)
        {
            WebResource depScript = XrmContext.WebResourceSet.Where(x => x.Name == name).FirstOrDefault();

            byte[] byties = System.Text.Encoding.UTF8.GetBytes(dataString);

            depScript.Content = Convert.ToBase64String(byties);

            Update(depScript);
        }

        internal string GetWebResource(string name)
        {
            WebResource depScript = XrmContext.WebResourceSet.Where(x => x.Name == name).FirstOrDefault();
            return System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(depScript.Content));
        }

        internal void Save()
        {
            XrmContext.SaveChanges();
        }


        public EntityReference GetCurrencyReferenceByIsoCode(string code)
        {
            if (code == null)
            {
                code = "USD";
                return GetCurrencyReferenceByIsoCode(code);
            }

            code = code.ToUpper();

            Guid usdGuid = (from c in XrmContext.TransactionCurrencySet
                            where c.ISOCurrencyCode == code
                            select c.TransactionCurrencyId).FirstOrDefault() ?? Guid.Empty;

            if (usdGuid == Guid.Empty)
            {
                throw new ArgumentException(string.Format("No {0} Transaction Currency found in CRM!", code));
            }

            if (!CurrencyIsoCodeGuid.Keys.Contains(code))
            {
                CurrencyIsoCodeGuid.Add(code, usdGuid);
            }

            return new EntityReference(TransactionCurrency.EntityLogicalName, CurrencyIsoCodeGuid[code]);
        }

        public void DeactivateExchangeRateById(Guid id)
        {
            SetStateRequest deactivateRequest = new SetStateRequest() {
                EntityMoniker = new EntityReference(sl_ExchangeRate.EntityLogicalName, id),
                State = new OptionSetValue(1),
                Status = new OptionSetValue(-1)
                
            };

            _service.Execute(deactivateRequest);
        }
    }
}
