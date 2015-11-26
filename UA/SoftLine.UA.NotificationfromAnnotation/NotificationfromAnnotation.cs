using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using System.ServiceModel;
using SoftLine.Models;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Crm.Sdk.Messages;

namespace SoftLine.UA.NotificationfromAnnotation
{
    public class NotificationfromAnnotation : IPlugin
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
                    context.PrimaryEntityName != Annotation.EntityLogicalName)
                    return;

                var ann = (Entity)context.PostEntityImages["Post"];
                Annotation annotation = ann.ToEntity<Annotation>();

                if (annotation.IsDocument.Value)
                    return;

                EntityReference Owner, RegardingObjectId = null;
                string Subject, Description = string.Empty;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    switch (annotation.ObjectId.LogicalName.ToLower())
                    {
                        case new_supplementaryagreement.EntityLogicalName /*Доп. соглашения*/:
                            Owner = GetOwnerFromEntity<new_supplementaryagreement>(annotation.ObjectId.Id, service);
                            Description = (string.Format("По процедуре согласования Дополнительного соглашения  пользователем {0} создано примечание. " + System.Environment.NewLine, annotation.OwnerId.Name));
                            Description += ("Текст примечания : ");
                            Description += ("\"" + annotation.NoteText + "\"");
                            Subject = "Создано примечание к Доп. соглашения №" + (from i in orgContext.CreateQuery<new_supplementaryagreement>()
                                                                                  where i.Id == annotation.ObjectId.Id
                                                                                  select i.GetAttributeValue<string>("new_name")).FirstOrDefault();
                            RegardingObjectId = new EntityReference { Id = annotation.ObjectId.Id, LogicalName = new_supplementaryagreement.EntityLogicalName };
                            break;
                        case Invoice.EntityLogicalName:
                            Owner = GetOwnerFromEntity<Invoice>(annotation.ObjectId.Id, service);
                            Description = (string.Format("По Вашему КИЗ пользователем {0} создано примечание. " + System.Environment.NewLine, annotation.OwnerId.Name));
                            Description += ("Текст примечания : ");
                            Description += ("\"" + annotation.NoteText + "\"");
                            Subject = "Создано примечание к КИЗ №" + (from i in orgContext.CreateQuery<Invoice>()
                                                                      where i.Id == annotation.ObjectId.Id
                                                                      select i.GetAttributeValue<string>("name")).FirstOrDefault();
                            RegardingObjectId = new EntityReference { Id = annotation.ObjectId.Id, LogicalName = Invoice.EntityLogicalName };
                            break;
                        case new_coordinationcontract.EntityLogicalName /*Согласование договора*/:
                            Owner = GetOwnerFromEntity<new_coordinationcontract>(annotation.ObjectId.Id, service);
                            Description = (string.Format("По процедуре согласования Договора пользователем {0} создано примечание. " + System.Environment.NewLine, annotation.OwnerId.Name));
                            Description += ("Текст примечания : ");
                            Description += ("\"" + annotation.NoteText + "\"");
                            Subject = "Создано примечание к согласования Договора №" + (from i in orgContext.CreateQuery<new_coordinationcontract>()
                                                                                        where i.Id == annotation.ObjectId.Id
                                                                                        select i.GetAttributeValue<string>("new_name")).FirstOrDefault();
                            RegardingObjectId = new EntityReference { Id = annotation.ObjectId.Id, LogicalName = new_coordinationcontract.EntityLogicalName };
                            break;
                        default:
                            return;
                    }
                    Email mail = new Email();

                    mail.Subject = Subject;
                    mail.Description = Description.ToString();
                    mail.DirectionCode = true;
                    mail.RegardingObjectId = RegardingObjectId;
                    SystemUser userTo = (SystemUser)service.Retrieve(SystemUser.EntityLogicalName, Owner.Id, new ColumnSet("fullname", "internalemailaddress"));

                    if (userTo.InternalEMailAddress == null) return;

                    var activityParty1 = new ActivityParty
                    {
                        AddressUsed = userTo.InternalEMailAddress
                    };

                    mail.To = new[] { activityParty1 };

                    Guid createdEmailId = service.Create(mail);

                    var sendEmailreq = new SendEmailRequest
                    {
                        EmailId = createdEmailId,
                        TrackingToken = "",
                        IssueSend = true
                    };
                    try
                    {
                        service.Execute(sendEmailreq);
                    }
                    catch (Exception ex)
                    {
                        throw new InvalidPluginExecutionException(ex.Message);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }

        private EntityReference GetOwnerFromEntity<T>(Guid guid, IOrganizationService service) where T : Entity
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                return (from i in orgContext.CreateQuery<T>()
                        where i.Id == guid
                        select i.GetAttributeValue<EntityReference>("ownerid")).FirstOrDefault();
            }
        }

        private string GetEntityName<T>(Guid guid, IOrganizationService service) where T : Entity
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                return (from i in orgContext.CreateQuery<T>()
                        where i.Id == guid
                        select i.GetAttributeValue<string>("new_name")).FirstOrDefault();
            }
        }
    }
}
