using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel.Description;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;
//using Quotes.CreateSpecificationFromAnnotation;


namespace UploadPricelist
{
    internal class CrmAssembly
    {
        private static readonly Dictionary<string, Guid> CurrencyIsoCodeGuid = new Dictionary<string, Guid>();

        private static readonly Dictionary<string, decimal> CurrencyIsoCodeExhangeRate =
            new Dictionary<string, decimal>();

        private readonly crmContext XrmContext;
        private readonly IOrganizationService _service;
        private readonly string defaultUomName = Settings.GetAttribute("defaultUomName");
        private readonly string defaultUomScheduleName = Settings.GetAttribute("defaultUomScheduleName");

        //private EntityReference _defaultCurrency;
        private EntityReference _defaultUom;
        private EntityReference _defaultUomSchedule;

        public CrmAssembly()
        {
            _service = GetService();
            XrmContext = new crmContext(_service);
        }

        public EntityReference DefaultUomReference
        {
            get
            {
                if (_defaultUom == null)
                {
                    _defaultUom = GetDefaultUomReference();
                }

                return _defaultUom;
            }
            private set { }
        }

        public EntityReference DefaultUoMScheduleReference
        {
            get
            {
                if (_defaultUomSchedule == null)
                {
                    _defaultUomSchedule = GetDefaultUomScheduleReference();
                }

                return _defaultUomSchedule;
            }
            private set { }
        }

        internal void CreateProducts(List<IntermidiateProduct> products)
        {
            if (products.Count == 0)
            {
                return;
            }

            DateTime startTime = DateTime.Now;

            foreach (IntermidiateProduct product in products)
            {
                // If price list product is active in CRM
                Product existingCrmProduct =
                    XrmContext
                        .ProductSet
                        .Where(x => x.ProductNumber == product.SoftLineSku)
                        .SingleOrDefault();
                if (existingCrmProduct != null)
                {
                    existingCrmProduct.Price =
                        new Money(ConvertValueByCurrencyCodeToUsdValue(product.SprPrice ?? 0, product.Currency));
                    existingCrmProduct.new_PdrPrice =
                        new Money(ConvertValueByCurrencyCodeToUsdValue(product.PdrPrice ?? 0, product.Currency));
                    existingCrmProduct.new_Retail1Frm =
                        new Money(ConvertValueByCurrencyCodeToUsdValue(product.Retail1Frm ?? 0, product.Currency));
                    existingCrmProduct.new_Retail2Frm =
                        new Money(ConvertValueByCurrencyCodeToUsdValue(product.Retail2Frm ?? 0, product.Currency));
                    existingCrmProduct.new_createdon = product.CreatedOn.ToUniversalTime();
                    existingCrmProduct.TransactionCurrencyId = GetCurrencyReferenceByIsoCode("USD");
                    //existingCrmProduct.new_softlinesku = product.SoftLineSku;
                    //existingCrmProduct.new_manufacturername = product.Manufacturer;

                    existingCrmProduct.VendorPartNumber = product.VendorSku;
                    existingCrmProduct.new_Name_price_Softline = product.PricelistName;
                    // Update product
                    XrmContext.UpdateObject(existingCrmProduct);

                    if (existingCrmProduct.StateCode == ProductState.Inactive)
                    {
                        ActivateProductById(existingCrmProduct.ProductId ?? Guid.Empty);
                        Console.WriteLine("Activate {0}", existingCrmProduct.ProductNumber);
                    }
                }
                else
                {
                    string productName =
                        (product.ProductDescription.Length > 720)
                            ? product.ProductDescription.Substring(0, 710)
                            : product.ProductDescription;

                    var productToCreate =
                        new Product
                            {
                                QuantityDecimal = 2,
                                DefaultUoMId = DefaultUomReference,
                                DefaultUoMScheduleId = DefaultUoMScheduleReference,
                                new_createdon = product.CreatedOn.ToUniversalTime(),
                                VendorName = product.Vendor,
                                //new_manufacturername = product.Manufacturer,
                                ProductNumber = product.SoftLineSku, //important
                                VendorPartNumber = product.VendorSku,
                                new_producfamily = product.SoftLineProductFamily,
                                Name = productName, // imporant!
                                Description = product.ProductDescription,
                                new_version = product.Version,
                                new_language = product.Language,
                                new_fullorupdate = product.FullOrUpdate,
                                new_boxorlicense = product.BoxOrLicense,
                                new_aeorcom = product.AeOrCom,
                                new_media = product.Media,
                                new_os = product.Os,
                                new_licenselevel = product.LicenseLevel,
                                //point
                                //license comment
                                Price =
                                    new Money(ConvertValueByCurrencyCodeToUsdValue(product.SprPrice ?? 0,
                                                                                   product.Currency ?? "USD")),
                                new_PdrPrice =
                                    new Money(ConvertValueByCurrencyCodeToUsdValue(product.PdrPrice ?? 0,
                                                                                   product.Currency ?? "USD")),
                                //w
                                new_Retail1Frm =
                                    new Money(ConvertValueByCurrencyCodeToUsdValue(product.Retail1Frm ?? 0,
                                                                                   product.Currency ?? "USD")),
                                new_Retail2Frm =
                                    new Money(ConvertValueByCurrencyCodeToUsdValue(product.Retail2Frm ?? 0,
                                                                                   product.Currency ?? "USD")),
                                new_type = product.Type,
                                new_vatpercent = (product.VatPercent ?? 0),
                                TransactionCurrencyId = GetCurrencyReferenceByIsoCode("USD"),
                                new_Name_price_Softline = product.PricelistName
                            };
                    _service.Create(productToCreate);
                }
                XrmContext.SaveChanges();
            }

            // Get all active products that were not updated and deactivate them
            List<Guid?> productsToDeactivate =
                XrmContext
                    .ProductSet
                    .Where(x =>
                           x.StateCode == ProductState.Active &&
                          // x.new_manufacturername == products[0].Manufacturer &&
                           x.new_createdon < products[0].CreatedOn.ToUniversalTime())
                    .Select(x => x.ProductId)
                    .ToList();
            foreach (var pro in productsToDeactivate)
            {
                DeactivateProductById(pro ?? Guid.Empty);
                Console.WriteLine("Deactivated {0}", pro);
            }

            Console.WriteLine("{0} {1}", startTime, DateTime.Now);
            //Console.ReadLine();
        }

        private decimal ConvertValueByCurrencyCodeToUsdValue(decimal value, string currencyCode)
        {
            decimal exchangeRate = GetExchangeRateByCurrencyCode(currencyCode);

            return value*exchangeRate;
        }

        private decimal GetExchangeRateByCurrencyCode(string currencyCode)
        {
            if (currencyCode == null)
            {
                currencyCode = "USD";
                return GetExchangeRateByCurrencyCode(currencyCode);
            }
            currencyCode.ToUpper();

            decimal? exchangeRate =
                XrmContext
                    .TransactionCurrencySet
                    .Where(x => x.ISOCurrencyCode == currencyCode)
                    .Select(x => x.ExchangeRate)
                    .FirstOrDefault();

            if (exchangeRate == null)
            {
                throw new ArgumentNullException(string.Format("{0}'s exchange rate is not set in CRM.",
                                                              currencyCode ?? "NULL"));
            }

            if (!CurrencyIsoCodeExhangeRate.Keys.Contains(currencyCode))
            {
                CurrencyIsoCodeExhangeRate.Add(currencyCode, exchangeRate ?? 0);
            }

            return CurrencyIsoCodeExhangeRate[currencyCode];
        }

        /// <summary>
        ///     Get an update date of any active product of this vendor.
        /// </summary>
        /// <remarks>
        ///     All active products have the same PricelistUpdatedOn value, so this date will be he date of the latest pricelist.
        ///     If there are no such products -- return minimum dateTime, i.e. "pricelist has never been updated".
        /// </remarks>
        /// <param name="manufacturerName"></param>
        /// <returns></returns>
        internal DateTime GetPricelistUpdateOnDateFromProductOfManufacturer(string manufacturerName)
        {
            DateTime updatedOn =
                XrmContext
                    .ProductSet
                    //.Where(x => x.new_manufacturername == manufacturerName && x.StateCode == ProductState.Active)
                    .Select(x => x.new_createdon)
                    .FirstOrDefault() ?? DateTime.MinValue;

            return updatedOn;
        }

        private IOrganizationService GetService()
        {
            // Get services and contexten
            IOrganizationService service;
            OrganizationServiceProxy serviceProxy;

            IServiceConfiguration<IOrganizationService> orgConfigInfo =
                ServiceConfigurationFactory.CreateConfiguration<IOrganizationService>(
                    new Uri(Settings.GetAttribute("uri"))
                    );
            var creds = new ClientCredentials();
            creds.Windows.ClientCredential =
                new NetworkCredential(
                    Settings.GetAttribute("username"), Settings.GetAttribute("password")
                    );

            using (serviceProxy = new OrganizationServiceProxy(orgConfigInfo, creds))
            {
                serviceProxy.ServiceConfiguration.CurrentServiceEndpoint.Behaviors.Add(new ProxyTypesBehavior());
                service = serviceProxy;
            }
            return service;
        }

        private void DeactivateProductById(Guid Id)
        {
            var setStateProductRequest = new SetStateRequest
                {
                    State = new OptionSetValue(1),
                    Status = new OptionSetValue(2),
                    EntityMoniker = new EntityReference(Product.EntityLogicalName, Id)
                };
            _service.Execute(setStateProductRequest);
        }

        private void ActivateProductById(Guid Id)
        {
            var setStateProductRequest = new SetStateRequest
                {
                    State = new OptionSetValue(0),
                    Status = new OptionSetValue(1),
                    EntityMoniker = new EntityReference(Product.EntityLogicalName, Id)
                };
            _service.Execute(setStateProductRequest);
        }

        private EntityReference GetCurrencyReferenceByIsoCode(string code)
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

        private EntityReference GetDefaultUomReference()
        {
            UoM defaultUom = (from uom in XrmContext.UoMSet
                              where uom.Name == defaultUomName
                              select uom).FirstOrDefault();
            return new EntityReference(UoM.EntityLogicalName, defaultUom.UoMId ?? Guid.Empty);
        }

        public EntityReference GetDefaultUomScheduleReference()
        {
            UoMSchedule defaultUomSchedule = (from uoms in XrmContext.UoMScheduleSet
                                              where uoms.Name == defaultUomScheduleName
                                              select uoms).FirstOrDefault();
            var defaultUomScheduleReference = new EntityReference(defaultUomSchedule.LogicalName,
                                                                  defaultUomSchedule.UoMScheduleId.Value);

            return defaultUomScheduleReference;
        }
    }
}