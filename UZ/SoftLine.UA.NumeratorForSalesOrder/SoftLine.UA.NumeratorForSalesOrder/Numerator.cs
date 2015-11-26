using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UA.NumeratorForSalesOrder
{
    public class Numerator : IPlugin
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
                        context.PrimaryEntityName != SalesOrder.EntityLogicalName)
                    return;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    var order = (Entity)context.InputParameters["Target"];

                    var neworder = order.ToEntity<SalesOrder>();

                    var constanta = (from i in orgContext.CreateQuery<new_constant>()
                                     select i).FirstOrDefault();

                    var user = (from i in orgContext.CreateQuery<SystemUser>()
                                where i.Id == order.GetAttributeValue<EntityReference>("ownerid").Id
                                select i).FirstOrDefault();

                    StringBuilder nomer = new StringBuilder();
                    nomer.Append(string.Format("{0}-{1}/СЛГУ-{2}", constanta.new_salesordernumber,
                                                                    DateTime.Now.Year.ToString(),
                                                                    user.new_abbreviation));

                    //var updateOrder = new SalesOrder(){
                    //    Id = order.Id,
                    //    OrderNumber = 
                    //}
                    neworder.new_ordernumber = nomer.ToString();

                    var updateConstanta = new new_constant()
                    {
                        Id = constanta.Id,
                        new_salesordernumber = (Convert.ToInt32(constanta.new_salesordernumber) + 1).ToString()
                    };
                    service.Update(updateConstanta);
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
