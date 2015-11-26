using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UA.NumeratorForInvoice
{
    public class InvoiceNumerator : IPlugin
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
                        context.PrimaryEntityName != Invoice.EntityLogicalName)
                    return;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    var invoice = (Entity)context.InputParameters["Target"];
                    var newinvoice = invoice.ToEntity<Invoice>();

                    if (newinvoice.Name != null && !newinvoice.Name.Contains("СЛГУ"))
                    {
                        return;
                    }

                    var constanta = (from i in orgContext.CreateQuery<new_constant>()
                                     select i).FirstOrDefault();

                    var userAbbreviation = (from i in orgContext.CreateQuery<SystemUser>()
                                            where i.Id == newinvoice.OwnerId.Id
                                            select i.new_abbreviation).FirstOrDefault();
                    StringBuilder nomer = new StringBuilder();

                    nomer.Append(string.Format("{0}{1}-1", userAbbreviation, constanta.new_invoicenumder));
                    newinvoice.Name = nomer.ToString();

                    var updateConstanta = new new_constant()
                    {
                        Id = constanta.Id,
                        new_invoicenumder = (Convert.ToInt32(constanta.new_invoicenumder) + 1).ToString()
                    };
                    service.Update(updateConstanta);
                    orgContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
