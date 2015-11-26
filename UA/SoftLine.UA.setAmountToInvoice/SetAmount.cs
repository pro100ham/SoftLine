using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UA.setAmountToInvoice
{
    public class SetAmount : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                if (context.PrimaryEntityName != new_payment.EntityLogicalName)
                    return;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    var payment = (Entity)context.InputParameters["Target"];
                    var paymentCorrent = payment.ToEntity<new_payment>();
                    EntityReference correntInvoice = null;
                    correntInvoice = (from c in orgContext.CreateQuery<new_payment>()
                                      where c.Id == payment.Id
                                      select c.new_expense).FirstOrDefault() ?? payment.GetAttributeValue<EntityReference>("new_expense");

                    if (correntInvoice == null)
                    {
                        return;
                    }

                    if (context.MessageName.ToLower() != "delete")
                    {
                        var objPayment = (from i in orgContext.CreateQuery<new_payment>()
                                          where i.new_expense.Id == correntInvoice.Id
                                          select new
                                          {
                                              new_amountsreceived = i.new_amountsreceived ?? new Money(0),
                                              new_percentagepayment = i.new_percentagepayment ?? 0,
                                              new_postsummausd = i.new_postsummausd ?? 0
                                          }).ToList();
                        objPayment.Add(new
                                            {
                                                new_amountsreceived = paymentCorrent.new_amountsreceived ?? new Money(0),
                                                new_percentagepayment = paymentCorrent.new_percentagepayment ?? 0,
                                                new_postsummausd = paymentCorrent.new_postsummausd ?? 0
                                            });
                        var amount = objPayment.Sum(item => item.new_amountsreceived.Value);
                        var precent = objPayment.Sum(item => item.new_percentagepayment);
                        var amountUSD = objPayment.Sum(item => item.new_postsummausd);

                        Invoice updateEntity = new Invoice()
                        {
                            Id = correntInvoice.Id,
                            new_amountsreceived = new Money(amount),
                            new_percentage_amount = Convert.ToDouble(precent),
                            new_amountsreceived_usd = amountUSD
                        };
                        service.Update(updateEntity);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
