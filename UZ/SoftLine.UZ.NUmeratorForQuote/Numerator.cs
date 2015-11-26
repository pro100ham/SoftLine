using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;

namespace SoftLine.UZ.NUmeratorForQuote
{
    public class Numerator : IPlugin
    {
        // Comment     
        //       При выборе значения поля "new_priznakkp" Aps либо UZ, 
        //    автоматически заполняется поле new_inc_number, по следующим кретериям :
        //    1. Aps = 1
        //    Формат: 564/14 
        //    Первая часть до "/" это поочередная нумерация...нп 001, 002 итд. 
        //         Вторая часть это год. В этом случае 2014

        //    2. Местные КП/UZ = 100 000 000
        //    Формат: ОП-140242
        //    Первые две цифры (14) это год...в этом случае 2014. 
        //    остальные 4 это поочередная нумерация...нп 0001, 0002 итд.
        //

        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            if (context.MessageName.ToLower() == "create")
            {
                try
                {
                    Entity entity = null;
                    entity = (Entity)context.InputParameters["Target"];

                    using (var orgContext = new OrganizationServiceContext(service))
                    {
                        var constanta = (from p in orgContext.CreateQuery("new_constant")
                                         select p).FirstOrDefault();

                        if (constanta == null)
                            throw new InvalidPluginExecutionException("Неудалось найти сущность \"Константа\"");


                        string current_number = string.Empty;
                        var status = entity.GetAttributeValue<OptionSetValue>("new_priznakkp");

                        if (status.Value == 100000001)
                        {
                            current_number = String.Format("{0}/{1}",
                                constanta.GetAttributeValue<String>("new_slaps"), DateTime.Now.Year);
                            entity.Attributes.Add("new_inc_number", current_number);

                            service.Update(entity);

                            Entity con = new Entity("new_constant");
                            con.Id = constanta.Id;
                            con.Attributes.Add("new_slaps", (Convert.ToInt32(constanta.GetAttributeValue<String>("new_slaps").ToString()) + 1).ToString());
                            service.Update(con);
                        }
                        else if (status.Value == 100000002)
                        {
                            current_number = String.Format("ОП-",
                                constanta.GetAttributeValue<String>("new_numberkp").ToString());
                            entity.Attributes.Add("new_inc_number", current_number);

                            service.Update(entity);

                            Entity con = new Entity("new_constant");
                            con.Id = constanta.Id;
                            con.Attributes.Add("new_numberkp", (Convert.ToInt32(constanta.GetAttributeValue<String>("new_numberkp").ToString()) + 1).ToString());
                            service.Update(con);
                        }
                        else if (status.Value == 100000000)
                        {
                            throw new InvalidPluginExecutionException("Выберите признак КП");
                        }
                    }
                }
                catch(Exception ex)
                {
                    throw new InvalidPluginExecutionException(ex.Message);
                }
            }
        }
    }
}
