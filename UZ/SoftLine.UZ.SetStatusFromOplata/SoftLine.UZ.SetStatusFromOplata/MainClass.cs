using System;
using System.Linq;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UZ.SetStatusFromOplata
{
    public class MainClass : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                if (context.MessageName.ToLower() != "create" ||
                        context.PrimaryEntityName != new_oplata.EntityLogicalName)
                    return;

                var oplata = (Entity)context.InputParameters["Target"];

                if (oplata.GetAttributeValue<EntityReference>("new_sdelkaid") == null)
                    return;

                new_oplata newoplata = oplata.ToEntity<new_oplata>();

                var sdelka = oplata.GetAttributeValue<EntityReference>("new_sdelkaid");
                var dogovor = oplata.GetAttributeValue<EntityReference>("new_dogovorid");

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    var sumEntity = (from i in orgContext.CreateQuery<new_oplata>()
                                     where i.new_dogovorid.Id == dogovor.Id
                                     select i).ToList();

                    var sumProc = (from d in sumEntity
                                   select d.new_discount_predoplatu).ToArray().Sum();

                    var sumSumma = (from p in sumEntity
                                    select p.new_summa.Value).ToArray().Sum();

                    var sumSummaUsd = (from p in sumEntity
                                       select p.new_summausd).ToArray().Sum();


                    if (sumProc < 100)
                    {
                        var dogovorUpdate = new SalesOrder()
                        {
                            Id = dogovor.Id,
                            new_Receivedamount = new Money(sumSumma),
                            new_amount = sumProc,
                            new_summa = sumSummaUsd
                        };
                        service.Update(dogovorUpdate);
                    }
                    else if (sumProc == 100)
                    {
                        //int newStatus = (int)SalesOrderState.Fulfilled;
                        //var request = new FulfillSalesOrderRequest
                        //{
                        //    OrderClose = new OrderClose
                        //    {
                        //        SalesOrderId = new EntityReference { LogicalName = SalesOrder.EntityLogicalName, Id = dogovor.Id }

                        //    },
                        //    Status = new OptionSetValue(100001)
                        //};
                        //service.Execute(request);
                        var dogovorUpdate = new SalesOrder()
                        {
                            Id = dogovor.Id,
                            new_Receivedamount = new Money(sumSumma),
                            new_amount = sumProc,
                            StatusCode = new OptionSetValue(100000000) //100 001
                        };                        
                        service.Update(dogovorUpdate);
                    }
                    else if (sumProc > 100)
                    {
                        //var dogovorUpdate = new SalesOrder()
                        //{
                        //    Id = dogovor.Id,
                        //    new_Receivedamount = new Money(sumSumma),
                        //    new_amount = sumProc
                        //};
                        //service.Update(dogovorUpdate);
                        throw new InvalidPluginExecutionException("Поступившая сумма не соответствует Общей сумме сделки. Проверьте введенные данные.");
                    }
                    orgContext.SaveChanges();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
