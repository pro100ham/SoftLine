using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;

namespace SoftLine.UA.NumeratorForSupplementary
{
    public class NumeratorClass : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                if (context.MessageName.ToLower() != "create")
                    return;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    var supp = (Entity)context.InputParameters["Target"];

                    if (supp.GetAttributeValue<EntityReference>("new_contractorder") == null ||
                        supp.GetAttributeValue<EntityReference>("new_contractorder").Id == null)
                        return;

                    var count = service.Retrieve("salesorder", supp.GetAttributeValue<EntityReference>("new_contractorder").Id, new Microsoft.Xrm.Sdk.Query.ColumnSet(new[] { "new_agreemnumber" }));
                    if (count != null)
                    {
                        var number = count.GetAttributeValue<string>("new_agreemnumber") ?? "1";
                        supp["new_name"] = number;
                        orgContext.ClearChanges();
                        orgContext.Attach(supp);
                        orgContext.UpdateObject(supp);

                        Entity upOrder = new Entity();
                        upOrder.Id = supp.GetAttributeValue<EntityReference>("new_contractorder").Id;
                        upOrder.LogicalName = supp.GetAttributeValue<EntityReference>("new_contractorder").LogicalName;
                        upOrder.Attributes.Add("new_agreemnumber", (Convert.ToInt32(number) + 1).ToString());

                        service.Update(upOrder);
                        orgContext.SaveChanges();
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
