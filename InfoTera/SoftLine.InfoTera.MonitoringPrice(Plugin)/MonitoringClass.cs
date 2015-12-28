using System;
using System.Linq;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;

/// <summary>
/// АВТОМАТИЧНЕ СТВОРЕННЯ ЗАПИСУ «ЗАТВЕРДЖЕННЯ ЦІНИ»
/// </summary>

namespace SoftLine.InfoTera.MonitoringPrice
{
    public class MonitoringClass : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                IPluginExecutionContext context = (IPluginExecutionContext) serviceProvider.GetService(typeof(IPluginExecutionContext));
                IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory) serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

                if ( context.PrimaryEntityName != new_monitoring.EntityLogicalName )
                    return;

                Entity entity = null;
                if ( context.MessageName.ToLower() == "create" )
                {
                    entity = (Entity) context.InputParameters["Target"];

                }
                else if ( context.MessageName.ToLower() == "update" )
                {
                    entity = (Entity) context.PostEntityImages["Post"];
                }
                else
                {
                    return;
                }

                var correnctEntity = entity.ToEntity<new_monitoring>();
                if ( !isTrust(correnctEntity.new_accountid, service) )
                    return;

                if ( correnctEntity.new_cropid == null )
                    return;

                /* if (DateTime.Now < DateTime.Now.Date.AddHours(11).AddMinutes(05))*/
                using ( var orgContext = new OrganizationServiceContext(service) )
                {
                    var haveAprove = CheckaprovedEntity(orgContext, correnctEntity.new_cropid.Id);
                    var currency = getCurrency(orgContext) ?? 0;
                    var margin = getMargin(orgContext) ?? new Money(0);
                    double nikolaevUSD = 0;
                    Money nikolaevRec = new Money(0);
                    double odesaUSD = 0;
                    Money odesaRec = new Money(0);
                    double odesaRecUSD = 0;
                    double nikolaevRecUSD = 0;

                    if ( correnctEntity.new_purchase_price_nikolaev != null &&
                        correnctEntity.new_purchase_price_nikolaev.Value != 0 )
                    {
                        nikolaevUSD = (double) correnctEntity.new_purchase_price_nikolaev?.Value / currency;
                        nikolaevRec = new Money(correnctEntity.new_purchase_price_nikolaev.Value - margin.Value);
                        nikolaevRecUSD = (double) nikolaevRec.Value / currency;
                    }
                    if ( correnctEntity.new_purchase_price_odessa != null &&
                        correnctEntity.new_purchase_price_odessa.Value != 0 )
                    {
                        odesaUSD = (double) correnctEntity.new_purchase_price_odessa?.Value / currency;
                        odesaRec = new Money(correnctEntity.new_purchase_price_odessa.Value - margin.Value);
                        odesaRecUSD = (double) odesaRec.Value / currency;
                    }

                    if ( haveAprove == null )
                    {
                        var checkPurchase = (from i in orgContext.CreateQuery<new_aprove_price>()
                                             where i.CreatedOn >= DateTime.Now.Date.ToUniversalTime() &&
                                                  i.CreatedOn <= DateTime.Now.AddDays(1).Date.ToUniversalTime() &&
                                                  i.new_cropid.Id == correnctEntity.new_cropid.Id &&
                                                  i.new_aproved != new OptionSetValue(100000002)
                                             select i).FirstOrDefault();

                        if ( checkPurchase == null )
                        {
                            new_aprove_price CreateRecord = new new_aprove_price()
                            {
                                new_max_purchase_price_odessa = correnctEntity.new_purchase_price_odessa,
                                new_max_purchase_price_nikolaev = correnctEntity.new_purchase_price_nikolaev,
                                new_cropid = correnctEntity.new_cropid,
                                new_aproved = new OptionSetValue(100000001),
                                new_trader_Odesaid = correnctEntity.new_accountid,
                                new_trader_Mykolaivid = correnctEntity.new_accountid,

                                new_dollar_rate = currency,
                                new_max_purchase_mykolaiv_usd = nikolaevUSD,
                                new_dollar_purchase_price_nikolaev = nikolaevRecUSD,
                                new_recom_purchase_price_nikolaev = nikolaevRec,
                                new_recom_purchase_price_odessa = odesaRec,
                                new_max_purchase_odesa_usd = odesaUSD,
                                new_dollar_purchase_price_odessa = odesaRecUSD,
                                new_purchase_margin = margin
                            };
                            service.Create(CreateRecord);
                        }
                        else
                        {
                            new_aprove_price UpdateRecord = new new_aprove_price();
                            UpdateRecord.Id = checkPurchase.Id;
                            bool flag = false;

                            if ( checkPurchase.new_max_purchase_price_odessa?.Value < correnctEntity.new_purchase_price_odessa?.Value )
                            {
                                UpdateRecord.new_max_purchase_price_odessa = correnctEntity.new_purchase_price_odessa;
                                UpdateRecord.new_trader_Odesaid = correnctEntity.new_accountid;
                                UpdateRecord.new_aproved = new OptionSetValue(100000001);
                                UpdateRecord.new_trader_Odesaid = correnctEntity.new_accountid;
                                UpdateRecord.new_recom_purchase_price_odessa = odesaRec;
                                UpdateRecord.new_max_purchase_odesa_usd = odesaUSD;
                                UpdateRecord.new_dollar_purchase_price_odessa = odesaRecUSD;
                                UpdateRecord.new_purchase_margin = margin;
                                UpdateRecord.new_dollar_rate = currency;
                                flag = true;
                            }
                           /* else
                            {
                                UpdateRecord.new_max_purchase_price_odessa = checkPurchase.new_max_purchase_price_odessa;
                                UpdateRecord.new_trader_Odesaid = checkPurchase.new_trader_Odesaid;
                                UpdateRecord.new_dollar_rate = checkPurchase.new_dollar_rate;
                                UpdateRecord.new_max_purchase_odesa_usd = checkPurchase.new_max_purchase_mykolaiv_usd;
                                UpdateRecord.new_dollar_purchase_price_odessa = checkPurchase.new_dollar_purchase_price_nikolaev;
                                UpdateRecord.new_recom_purchase_price_odessa = checkPurchase.new_recom_purchase_price_nikolaev;
                                UpdateRecord.new_purchase_margin = checkPurchase.new_purchase_margin;
                            }*/

                            if ( checkPurchase.new_max_purchase_price_nikolaev?.Value < correnctEntity.new_purchase_price_nikolaev?.Value )
                            {
                                UpdateRecord.new_max_purchase_price_nikolaev = correnctEntity.new_purchase_price_nikolaev;
                                UpdateRecord.new_trader_Mykolaivid = correnctEntity.new_accountid;
                                UpdateRecord.new_aproved = new OptionSetValue(100000001);
                                UpdateRecord.new_trader_Mykolaivid = correnctEntity.new_accountid;
                                UpdateRecord.new_dollar_rate = currency;
                                UpdateRecord.new_max_purchase_mykolaiv_usd = nikolaevUSD;
                                UpdateRecord.new_dollar_purchase_price_nikolaev = nikolaevRecUSD;
                                UpdateRecord.new_recom_purchase_price_nikolaev = nikolaevRec;
                                UpdateRecord.new_purchase_margin = margin;
                                flag = true;
                            }
                           /* else
                            {
                                UpdateRecord.new_max_purchase_price_nikolaev = checkPurchase.new_max_purchase_price_nikolaev;
                                UpdateRecord.new_trader_Mykolaivid = checkPurchase.new_trader_Mykolaivid;
                                UpdateRecord.new_dollar_rate = checkPurchase.new_dollar_rate;
                                UpdateRecord.new_max_purchase_mykolaiv_usd = checkPurchase.new_max_purchase_mykolaiv_usd;
                                UpdateRecord.new_dollar_purchase_price_nikolaev = checkPurchase.new_dollar_purchase_price_nikolaev;
                                UpdateRecord.new_recom_purchase_price_nikolaev = checkPurchase.new_recom_purchase_price_nikolaev;
                                UpdateRecord.new_purchase_margin = checkPurchase.new_purchase_margin;
                            }*/
                            if ( flag )
                            {
                                service.Update(UpdateRecord);
                            }
                        }
                    }
                    else
                    {
                        new_aprove_price CreateRecord = new new_aprove_price();
                        bool flag = false;

                        if ( haveAprove.new_max_purchase_price_odessa?.Value < correnctEntity.new_purchase_price_odessa?.Value )
                        {
                            CreateRecord.new_max_purchase_price_odessa = correnctEntity.new_purchase_price_odessa;
                            CreateRecord.new_trader_Odesaid = correnctEntity.new_accountid;
                            CreateRecord.new_aproved = new OptionSetValue(100000001);
                            CreateRecord.new_cropid = correnctEntity.new_cropid;
                            CreateRecord.new_dollar_rate = currency;
                            CreateRecord.new_max_purchase_odesa_usd = odesaUSD;
                            CreateRecord.new_recom_purchase_price_odessa = odesaRec;
                            CreateRecord.new_dollar_purchase_price_odessa = odesaRecUSD;
                            CreateRecord.new_purchase_margin = margin;
                            flag = true;
                        }
                        else
                        {
                            CreateRecord.new_max_purchase_price_odessa = haveAprove.new_max_purchase_price_odessa;
                            CreateRecord.new_trader_Odesaid = haveAprove.new_trader_Odesaid;
                        }
                        if ( haveAprove.new_max_purchase_price_nikolaev?.Value < correnctEntity.new_purchase_price_nikolaev?.Value )
                        {
                            CreateRecord.new_max_purchase_price_nikolaev = correnctEntity.new_purchase_price_nikolaev;
                            CreateRecord.new_trader_Mykolaivid = correnctEntity.new_accountid;
                            CreateRecord.new_aproved = new OptionSetValue(100000001);
                            CreateRecord.new_cropid = correnctEntity.new_cropid;
                            CreateRecord.new_dollar_rate = currency;
                            CreateRecord.new_max_purchase_mykolaiv_usd = nikolaevUSD;
                            CreateRecord.new_recom_purchase_price_nikolaev = nikolaevRec;
                            CreateRecord.new_dollar_purchase_price_nikolaev = nikolaevRecUSD;
                            CreateRecord.new_purchase_margin = margin;
                            flag = true;
                        }
                        else
                        {
                            CreateRecord.new_max_purchase_price_nikolaev = haveAprove.new_max_purchase_price_nikolaev;
                            CreateRecord.new_trader_Mykolaivid = haveAprove.new_trader_Mykolaivid;
                        }
                        if ( flag )
                        {
                            service.Create(CreateRecord);
                            new_aprove_price updateToClose = new new_aprove_price();
                            updateToClose.Id = haveAprove.Id;
                            //updateToClose.new_aproved = new OptionSetValue(100000002);
                            service.Update(updateToClose);
                        }
                    }
                }
            }
            catch ( Exception ex )
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }

        private Money getMargin(OrganizationServiceContext orgContext)
        {
            return (from com in orgContext.CreateQuery<new_constant>()
                    select com.new_purchase_margin).FirstOrDefault();
        }

        private double? getCurrency(OrganizationServiceContext orgContext)
        {
            return (from c in orgContext.CreateQuery<new_currency_rate>()
                    orderby c.CreatedOn descending
                    select c.new_USdollar).First();
        }

        private bool isTrust(EntityReference new_accountid, IOrganizationService service)
        {
            var isTrust = service.Retrieve("account", new_accountid.Id, new ColumnSet("new_trust"));

            if ( isTrust == null || isTrust.GetAttributeValue<bool?>("new_trust") == null )
                return false;

            return isTrust.GetAttributeValue<bool>("new_trust");
        }

        private new_aprove_price CheckaprovedEntity(OrganizationServiceContext orgContext, Guid id)
        {
            var findAprovePurchase = (from i in orgContext.CreateQuery<new_aprove_price>()
                                      where i.CreatedOn >= DateTime.Now.Date.ToUniversalTime() &&
                                           i.CreatedOn <= DateTime.Now.AddDays(1).Date.ToUniversalTime() &&
                                           i.new_cropid.Id == id &&
                                           i.new_aproved == new OptionSetValue(100000000)
                                      select i).FirstOrDefault();
            return findAprovePurchase;
        }
    }
}
