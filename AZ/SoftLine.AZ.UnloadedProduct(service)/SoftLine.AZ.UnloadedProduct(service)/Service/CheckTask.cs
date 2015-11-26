using System;
using System.Linq;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;
using SoftLine.AZ.UnloadedProduct_service_.Proxy;
using System.Collections.Generic;
using Microsoft.Xrm.Sdk.Query;

namespace SoftLine.AZ.UnloadedProduct_service_.Service
{
    class CheckTask
    {
        private IOrganizationService service
        {
            get
            {
                return new CRMConnector().Connect();
            }
        }
        private Service1 Log = new Service1();

        public void CheckTasksItem()
        {
            try
            {
                using (var orgContext = new OrganizationServiceContext(this.service))
                {
                    var PrelistData = (from i in orgContext.CreateQuery<Task>()
                                       where i.ScheduledEnd >= DateTime.Today.AddDays(-1).ToUniversalTime() &&
                                       i.ScheduledEnd <= DateTime.Today.AddDays(1).ToUniversalTime()
                                       select i).ToList();
                    var validTask = PrelistData.Where(x => x.Subject.Contains("подходит срок очередного платежа, требуется выставить счет заказчику") && x.RegardingObjectId.LogicalName == "invoice");

                    if (validTask.Count() == 0)
                        return;

                    foreach (var item in validTask)
                    {
                        Email unloadEmail = new Email();

                        unloadEmail.Subject = string.Format("По Договору {0} подходит срок очередного платежа", item.RegardingObjectId.Name);

                        string link = string.Format(@"<a href=https://crm.softline.az/SoftlineInternationalLtd/userdefined/edit.aspx?etc=1090&id=%7b{0}%7d>{1}</a></span></u></i></p>",
                                            item.RegardingObjectId.Id.ToString(), item.RegardingObjectId.Name);
                        unloadEmail.Description = string.Format(@"<div id=':14b' class='Am Al editable LW-avf' hidefocus='true' aria-label='Текст повідомлення' 
g_editable='true' role='textbox' contenteditable='true' tabindex='1' style='direction: ltr; min-height: 306px;' itacorner='6,7:1,1,0,0'><div>Уважаемый коллега,
</div><div><br></div><div>по Договору {0} подходит срок очередного платежа, требуется выставить счет заказчику.&nbsp;<br></div><div><br></div><div>Заказ - {1}<br></div></div>"
                            , item.RegardingObjectId.Name, link);
                        unloadEmail.DirectionCode = true;
                        SystemUser user =
                            (SystemUser)service.Retrieve(SystemUser.EntityLogicalName, item.OwnerId.Id, new ColumnSet("internalemailaddress"));

                        if (user.InternalEMailAddress == null)
                        {
                            Log.AddLog(string.Format("Адрес Електроной почты отсутствует... ({0})", item.OwnerId.Name));
                            continue;
                        }

                        var activity1 = new ActivityParty
                        {
                            AddressUsed = user.InternalEMailAddress
                        };

                        var activity2 = new ActivityParty
                        {
                            AddressUsed = @"Anar.Aliyev@softlinegroup.com"
                        };
                        unloadEmail.Cc = new[] { activity2 };
                        unloadEmail.To = new[] { activity1 };


                        Guid createdEmailId = service.Create(unloadEmail);

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
                            Log.AddLog(ex.Message);
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                Log.AddLog(ex.Message);
            }
        }

    }
}
