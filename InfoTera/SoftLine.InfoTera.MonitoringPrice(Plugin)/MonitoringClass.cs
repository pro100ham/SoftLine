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

                /* if (DateTime.Now < DateTime.Now.Date.AddHours(11).AddMinutes(05))*/
                using ( var orgContext = new OrganizationServiceContext(service) )
                {
                    var haveAprove = CheckaprovedEntity(orgContext, correnctEntity.new_cropid.Id);

                    if ( haveAprove == null )
                    {

                        var checkPurchase = (from i in orgContext.CreateQuery<new_aprove_price>()
                                             where i.CreatedOn >= DateTime.Now.Date.ToUniversalTime() &&
                                                  i.CreatedOn <= DateTime.Now.AddDays(1).Date.ToUniversalTime() &&
                                                  i.new_cropid.Id == correnctEntity.new_cropid.Id &&
                                                  i.new_aproved != new OptionSetValue(100000002)
                                             select new new_aprove_price
                                             {
                                                 Id = i.Id,
                                                 new_max_purchase_price_odessa = i.new_max_purchase_price_odessa == null ? new Money(0) : i.new_max_purchase_price_odessa,
                                                 new_max_purchase_price_nikolaev = i.new_max_purchase_price_nikolaev == null ? new Money(0) : i.new_max_purchase_price_nikolaev,
                                                 new_cropid = i.new_cropid,
                                                 new_trader_Mykolaivid = i.new_trader_Mykolaivid,
                                                 new_trader_Odesaid = i.new_trader_Odesaid
                                             }).FirstOrDefault();

                        if ( checkPurchase == null )
                        {
                            new_aprove_price CreateRecord = new new_aprove_price()
                            {
                                new_max_purchase_price_odessa = correnctEntity.new_purchase_price_odessa,
                                new_max_purchase_price_nikolaev = correnctEntity.new_purchase_price_nikolaev,
                                new_cropid = correnctEntity.new_cropid,
                                new_aproved = new OptionSetValue(100000001),
                                new_trader_Odesaid = correnctEntity.new_accountid,
                                new_trader_Mykolaivid = correnctEntity.new_accountid
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
                                flag = true;
                            }
                            else
                            {
                                UpdateRecord.new_max_purchase_price_odessa = checkPurchase.new_max_purchase_price_odessa;
                                UpdateRecord.new_trader_Odesaid = checkPurchase.new_trader_Odesaid;
                            }

                            if ( checkPurchase.new_max_purchase_price_nikolaev?.Value < correnctEntity.new_purchase_price_nikolaev?.Value )
                            {
                                UpdateRecord.new_max_purchase_price_nikolaev = correnctEntity.new_purchase_price_nikolaev;
                                UpdateRecord.new_trader_Mykolaivid = correnctEntity.new_accountid;
                                UpdateRecord.new_aproved = new OptionSetValue(100000001);
                                UpdateRecord.new_trader_Mykolaivid = correnctEntity.new_accountid;
                                flag = true;
                            }
                            else
                            {
                                UpdateRecord.new_max_purchase_price_nikolaev = checkPurchase.new_max_purchase_price_nikolaev;
                                UpdateRecord.new_trader_Mykolaivid = checkPurchase.new_trader_Mykolaivid;
                            }
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

        private bool isTrust(EntityReference new_accountid, IOrganizationService service)
        {
            var isTrust = service.Retrieve("account", new_accountid.Id, new ColumnSet("new_trust"));

            if ( isTrust == null || isTrust.GetAttributeValue<bool?>("new_trust") == null)
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
                                      select new new_aprove_price
                                      {
                                          Id = i.Id,
                                          new_max_purchase_price_odessa = i.new_max_purchase_price_odessa == null ? new Money(0) : i.new_max_purchase_price_odessa,
                                          new_max_purchase_price_nikolaev = i.new_max_purchase_price_nikolaev == null ? new Money(0) : i.new_max_purchase_price_nikolaev,
                                          new_cropid = i.new_cropid,
                                          new_trader_Mykolaivid = i.new_trader_Mykolaivid,
                                          new_trader_Odesaid = i.new_trader_Odesaid
                                      }).FirstOrDefault();
            return findAprovePurchase;
        }
    }
}
