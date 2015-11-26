using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;
using SoftLine.Models;
using SoftLine.UA.Notification.Proxy;

namespace SoftLine.UA.Notification.Service
{
    class InvoiceNotification
    {
        private IOrganizationService service
        {
            get
            {
                return new CRMConnector().Connect();
            }
        }

        private Service1 log = new Service1();

        public void CheckInvoiceEve()
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var correntInvoice = (from c in orgContext.CreateQuery<Invoice>()
                                      where (c.PaymentTermsCode.Value == 34 ||
                                             c.PaymentTermsCode.Value == 35)  &&
                                            c.DueDate >= Convert.ToDateTime(DateTime.Now.AddDays(1).ToString("dd.MM.yyyy 00:00:00")).ToUniversalTime() &&
                                             c.DueDate <= Convert.ToDateTime(DateTime.Now.AddDays(1).ToString("dd.MM.yyyy 23:59:59")).ToUniversalTime() &&
                                             (c.new_agreedlogistician == false ||
                                             c.new_agreedCFO == false ||
                                             c.new_agreedlawyer == false)
                                      select new ProxyToSendEmail
                                      {
                                          recordId = c.Id,
                                          Name = c.Name,
                                          agreementLaw = c.new_agreedlawyer == false ? c.new_lawyer : null,
                                          agreementLog = c.new_agreedlogistician == false ? c.new_Logist : null,
                                          agreementFin = c.new_agreedCFO == false ? c.new_CSO : null
                                      }).ToList();

                SendEmail(correntInvoice, service, 0);
            }
        }

        public void CheckInvoiceToday()
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var correntInvoice = (from c in orgContext.CreateQuery<Invoice>()
                                      where (c.PaymentTermsCode.Value == 34 ||
                                             c.PaymentTermsCode.Value == 35) &&
                                             c.DueDate >= Convert.ToDateTime(DateTime.Now.ToString("dd.MM.yyyy 00:00:00")).ToUniversalTime() &&
                                             c.DueDate <= Convert.ToDateTime(DateTime.Now.ToString("dd.MM.yyyy 23:59:59")).ToUniversalTime() &&
                                             (c.new_agreedlogistician == false ||
                                             c.new_agreedCFO == false ||
                                             c.new_agreedlawyer == false)
                                      select new ProxyToSendEmail
                                      {
                                          recordId = c.Id,
                                          Name = c.Name,
                                          agreementLaw = c.new_agreedlawyer == false ? c.new_lawyer : null,
                                          agreementLog = c.new_agreedlogistician == false ? c.new_Logist : null,
                                          agreementFin = c.new_agreedCFO == false ? c.new_CSO : null
                                      }).ToList();
                SendEmail(correntInvoice, service, 1);
            }
        }

        private void SendEmail(List<ProxyToSendEmail> listInvoice, IOrganizationService service, byte whatDay)
        {
            var Agreements = getAgreements();

            foreach (var item in Agreements)
            {
                Email mail = new Email();

                mail.Subject = "Просьба согласовать КИЗ";

                string link = string.Empty;

                var current = from p in listInvoice
                              where Equals(p.agreementLaw ,item)||
                                    Equals(p.agreementLog ,item)||
                                    Equals(p.agreementFin ,item)
                              select p;

                if (current.Count() == 0)
                    continue;

                foreach (var colection in current)
                {
                    link += string.Format("<p class='MsoNormal'><i><u><span lang='RU' style='color:rgb(0,112,192)'>" +
                                            /*"<a href=https://ukraine.crm.softlinegroup.com/main.aspx?etc=invoice&extraqs=%3f_gridType%3d4212%26etc%3d4212%26id%3d%257b{0}" +
                                                "%257d%26preloadcache%3d1406639059288%26rskey%3d307497509&histKey=417657088&newWindow=true&pagetype=entityrecord>{1}</a></span></u></i></p>",*/
                                            "<a href=https://ukraine.crm.softlinegroup.com/main.aspx?etn=invoice&pagetype=entityrecord&id=%7b{0}%7d>{1}</a></span></u></i></p>",
                                            colection.recordId.ToString(), colection.Name.ToString());
                }

                switch (whatDay)
                {
                    case 0:
                        mail.Description = string.Format(@"<div id=':3ua' class='Am Al editable LW-avf' hidefocus='true' aria-label='Текст'
g_editable='true' role='textbox' contenteditable='true' tabindex='1' itacorner='6,7:1,1,0,0' style='direction: ltr; min-height: 236px;'>
<p class='MsoNormal'><span lang='RU'>Уважаемый коллега, срок согласования КИЗ по счету(ам) истекает завтра. Просьба согласовать КИЗ.</span><o:p></o:p></p>          
<p class='MsoNormal'><i><u><span lang='RU' style='color: rgb(0, 112, 192);'>{0}</span></u></i></p>
                                                            <br></div>", link.ToString());
                        break;
                    case 1:
                        mail.Description = string.Format(@"<div id=':3ua' class='Am Al editable LW-avf' hidefocus='true' aria-label='Текст' 
g_editable='true' role='textbox' contenteditable='true' tabindex='1' itacorner='6,7:1,1,0,0' style='direction: ltr; min-height: 236px;'>
<p class='MsoNormal'><span lang='RU'>Уважаемый коллега, срок согласования КИЗ по счету(ам) истек. Просьба согласовать КИЗ.</span><o:p></o:p></p>          
<p class='MsoNormal'><i><u><span lang='RU' style='color: rgb(0, 112, 192);'>{0}</span></u></i></p>
                                                            <br></div>", link.ToString());
                        break;
                }

                mail.DirectionCode = true;
                SystemUser user = (SystemUser)service.Retrieve(SystemUser.EntityLogicalName, item.Id, new ColumnSet("fullname", "internalemailaddress"));


                if (user.InternalEMailAddress == null) continue;

                var activityParty2 = new ActivityParty
                {
                    PartyId = new EntityReference(SystemUser.EntityLogicalName,
                        new Guid("C49FE2C3-FB35-E511-80D7-005056820ECA")),
                };

                mail.From = new[] { activityParty2 };

                var activityParty1 = new ActivityParty
                {
                    AddressUsed = user.InternalEMailAddress
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
                catch (Exception)
                {

                }
            }
        }

        private List<EntityReference> getAgreements()
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                List<EntityReference> ownerUsers = (from i in orgContext.CreateQuery<new_constant>()
                                                    select new List<EntityReference>{
                                                      new EntityReference
                                                      {
                                                          Id = i.new_lawyer.Id,
                                                         LogicalName = i.new_lawyer.LogicalName,
                                                         Name = i.new_lawyer.Name,
                                                      }, 
                                                      new EntityReference
                                                      {
                                                          Id = i.new_Logist.Id,
                                                         LogicalName = i.new_Logist.LogicalName,
                                                         Name = i.new_Logist.Name,
                                                      }, 
                                                      new EntityReference
                                                      {
                                                          Id = i.new_financier.Id,
                                                         LogicalName = i.new_financier.LogicalName,
                                                         Name = i.new_financier.Name,
                                                      }
                                                    
                                                      }).FirstOrDefault();
                return ownerUsers;
            }
        }

        public bool Equals(EntityReference x, EntityReference y)
        {
            if (x != null)
                return x.Id.Equals(y.Id);
            else
                return false;
        }

        public int GetHashCode(EntityReference item)
        {
            return 0;
        }
    }
}
