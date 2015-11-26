using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;



namespace SoftLine.InfoTera.Numerator
{
    public class Numerator : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = factory.CreateOrganizationService(context.UserId);

                if (context.MessageName == "Create")
                {
                    object blok = new object();
                    int? number;
                    new_constant counter = new new_constant();
                    Entity entity = (Entity)context.InputParameters["Target"];

                    string correntYear = DateTime.Now.ToString("yy");

                    lock (blok)
                    {
                        using (var orgContext = new OrganizationServiceContext(service))
                        {
                            var getCounterValue = (from c in orgContext.CreateQuery<new_constant>()
                                                   select c).FirstOrDefault();

                            switch (entity.LogicalName)
                            {
                                case new_purchase_order.EntityLogicalName:
                                    //new_purchase_order update = new new_purchase_order();
                                    number = getCounterValue.new_purchase_order;
                                    //update.new_name = $"{number}/{correntYear}";
                                    counter.new_purchase_order = ++number;
                                    //update.LogicalName = entity.LogicalName;
                                    //update.Id = entity.Id;
                                    //service.Update(update);
                                    if (entity.Attributes.Contains("new_name") == true)
                                        entity["new_name"] = $"{number}/{correntYear}";
                                    else
                                        entity.Attributes.Add("new_name", $"{number}/{correntYear}");
                                    break;
                                case new_purchase_order_change.EntityLogicalName:
                                    //new_purchase_order_change update1 = new new_purchase_order_change();
                                    number = getCounterValue.new_purchase_order_change;
                                    //update1.new_name = $"{number}/{correntYear}";
                                    counter.new_purchase_order_change = ++number;
                                    //update1.LogicalName = entity.LogicalName;
                                    //update1.Id = entity.Id;
                                    //service.Update(update1);
                                    if (entity.Attributes.Contains("new_name") == true)
                                        entity["new_name"] = $"{number}/{correntYear}";
                                    else
                                        entity.Attributes.Add("new_name", $"{number}/{correntYear}");
                                    break;
                                case new_purchase_deal.EntityLogicalName:
                                    number = getCounterValue.new_purchase_deal;
                                    counter.new_purchase_deal = ++number;
                                    if (entity.Attributes.Contains("new_name") == true)
                                        entity["new_name"] = $"{number}/{correntYear}";
                                    else
                                        entity.Attributes.Add("new_name", $"{number}/{correntYear}");
                                    break;
                                case new_purchase_task.EntityLogicalName:
                                    number = getCounterValue.new_purchase_deal;
                                    counter.new_purchase_task = ++number;
                                    if (entity.Attributes.Contains("new_name") == true)
                                        entity["new_name"] = $"{number}/{correntYear}";
                                    else
                                        entity.Attributes.Add("new_name", $"{number}/{correntYear}");
                                    break;
                                default:
                                    return;
                            }

                            counter.Id = getCounterValue.Id;
                            service.Update(counter);
                        }
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
