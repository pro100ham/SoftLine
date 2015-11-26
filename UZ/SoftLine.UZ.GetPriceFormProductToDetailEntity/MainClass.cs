using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;

namespace SoftLine.UZ.GetPriceFormProductToDetailEntity
{
    public class MainClass : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            OrganizationServiceContext orgContext = new OrganizationServiceContext(service);

            if (context.MessageName.ToLower() == "create")
            {
                try
                {
                    Entity entity = null;
                    entity = (Entity)context.InputParameters["Target"];
                    //Entity preMessageImage = (Entity)context.PreEntityImages["Target"];

                    if (entity.GetAttributeValue<EntityReference>("productid") == null)
                        return;

                    var productId = entity.GetAttributeValue<EntityReference>("productid").Id;

                    var productPrice = (from p in orgContext.CreateQuery("product")
                                        where p.GetAttributeValue<Guid>("productid") == productId
                                        select new Proxy
                                        {
                                            Price = p.GetAttributeValue<Money>("standardcost"),
                                            Currency = p.GetAttributeValue<EntityReference>("transactioncurrencyid")
                                        }
                                        ).FirstOrDefault();

                    if (productPrice == null) { return; }

                    var currencyUSD = (from i in orgContext.CreateQuery("sl_exchangerate")
                                       where i.GetAttributeValue<EntityReference>("sl_transactioncurrencyid").Id == productPrice.Currency.Id
                                       && i.GetAttributeValue<OptionSetValue>("statecode") == new OptionSetValue(0)
                                       select i.GetAttributeValue<decimal>("sl_exchangerate")).FirstOrDefault();

                    decimal currentPrice = (productPrice.Price.Value * currencyUSD) + (productPrice.Price.Value * currencyUSD) * (decimal)0.03;

                    Entity UpdateEntity = new Entity(entity.LogicalName);
                    UpdateEntity.Id = entity.Id;
                    UpdateEntity.Attributes.Add("new_usdprice", currentPrice);
                    service.Update(UpdateEntity);
                }
                catch(Exception ex)
                {
                    throw new InvalidPluginExecutionException(ex.Message);
                }
            }
        }
    }

    public class Proxy
    {
        public Money Price { get; set; }

        public EntityReference Currency { get; set; }
    }
}
