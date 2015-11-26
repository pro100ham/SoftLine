using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;

namespace SoftLine.UZ.NumeratorKP
{
    public class Numerator : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            OrganizationServiceContext orgContext = new OrganizationServiceContext(service);

            try
            {
                if (context.MessageName.ToLower() == "create")
                {
                    Entity entity = null;
                    entity = (Entity)context.InputParameters["Target"];

                    var constanta = (from p in orgContext.CreateQuery("new_constant")
                                     select p).FirstOrDefault();

                    string current_number = string.Empty;

                    if (entity.GetAttributeValue<OptionSetValue>("new_priznakkp").Value == 100000002)
                    {
                        if (!string.IsNullOrEmpty(entity.GetAttributeValue<string>("new_inc_number"))) return;

                        switch (constanta.GetAttributeValue<String>("new_numberkp").Length)
                        {
                            case 1:
                                current_number = String.Format("ОП - {0}000{1}", DateTime.Now.ToString("yy"),
                                            constanta.GetAttributeValue<String>("new_numberkp").ToString());
                                break;
                            case 2:
                                current_number = String.Format("ОП - {0}00{1}", DateTime.Now.ToString("yy"),
                                            constanta.GetAttributeValue<String>("new_numberkp").ToString());
                                break;
                            case 3:
                                current_number = String.Format("ОП - {0}0{1}", DateTime.Now.ToString("yy"),
                                            constanta.GetAttributeValue<String>("new_numberkp").ToString());
                                break;
                        }

                        entity.Attributes.Add("new_inc_number", current_number);

                        service.Update(entity);

                        Entity con = new Entity("new_constant");
                        con.Id = constanta.Id;
                        con.Attributes.Add("new_numberkp", (Convert.ToInt32(constanta.GetAttributeValue<String>("new_numberkp").ToString()) + 1).ToString());
                        service.Update(con);
                    }
                    else if (entity.GetAttributeValue<OptionSetValue>("new_priznakkp").Value == 100000001)
                    {
                        if (!string.IsNullOrEmpty(entity.GetAttributeValue<string>("new_inc_number"))) return;

                        current_number = String.Format("{0}/{1}",
                            constanta.GetAttributeValue<String>("new_slaps"), DateTime.Now.Year);

                        entity.Attributes.Add("new_inc_number", current_number);

                        service.Update(entity);

                        Entity con = new Entity("new_constant");
                        con.Id = constanta.Id;
                        con.Attributes.Add("new_slaps", (Convert.ToInt32(constanta.GetAttributeValue<String>("new_slaps")) + 1).ToString());
                        service.Update(con);
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

