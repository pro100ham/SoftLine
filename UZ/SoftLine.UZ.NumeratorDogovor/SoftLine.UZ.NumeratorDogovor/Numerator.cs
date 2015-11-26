using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;

namespace SoftLine.UZ.NumeratorDogovor
{
    public class Numerator : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {            
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            OrganizationServiceContext orgContext = new OrganizationServiceContext(service);
            ITracingService trace = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            if (context.MessageName.ToLower() == "create")
            {
                Entity entity = null;
                entity = (Entity)context.InputParameters["Target"];

                var constanta = (from p in orgContext.CreateQuery("new_constant")
                                 select p).FirstOrDefault();

                string current_number = String.Format("SL-P-{0}",
                            constanta.GetAttributeValue<String>("new_dogovor").ToString());

                entity.Attributes.Add("new_agreem_number", current_number);

                service.Update(entity);

                Entity con = new Entity("new_constant");
                con.Id = constanta.Id;
                con.Attributes.Add("new_dogovor", (Convert.ToInt32(constanta.GetAttributeValue<String>("new_dogovor").ToString()) + 1).ToString());
                service.Update(con);
            }
        }
    }
}
