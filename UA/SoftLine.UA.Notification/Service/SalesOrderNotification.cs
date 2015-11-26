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
    class SalesOrderNotification
    {
        private IOrganizationService service
        {
            get
            {
                return new CRMConnector().Connect();
            }
        }

        private Service1 log = new Service1();

        public void CheckSalesOrderEve()
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var correntSales = (from c in orgContext.CreateQuery<SalesOrder>()
                                    where c.new_Termagreement >= Convert.ToDateTime(DateTime.Now.AddDays(1).ToString("dd.MM.yyyy 00:00:00")).ToUniversalTime() &&
                                           c.new_Termagreement <= Convert.ToDateTime(DateTime.Now.AddDays(1).ToString("dd.MM.yyyy 23:59:59")).ToUniversalTime() &&
                                             (c.new_articipationof == new OptionSetValue(100000000) ||
                                             c.new_participationlaw == new OptionSetValue(100000000) ||
                                             c.new_participationlo == new OptionSetValue(100000000) ||
                                             c.new_participationob == new OptionSetValue(100000000) ||
                                             c.new_participationsp == new OptionSetValue(100000000))
                                    select new ProxyToSendEmailExtended
                                    {
                                        recordId = c.Id,
                                        Name = c.Name,
                                        agreementLaw = (c.new_agreedlaw == false && Equals(c.new_participationlaw, new OptionSetValue(100000000))) ? c.new_lawdepartment : null,
                                        agreementLog = (c.new_agreedlog == false && Equals(c.new_participationlo, new OptionSetValue(100000000))) ? c.new_logistics : null,
                                        agreementFin = (c.new_agreed == false && Equals(c.new_articipationof, new OptionSetValue(100000000))) ? c.new_financedepartment : null,
                                        agreementAc = (c.new_agreed_ac == false && Equals(c.new_participationob, new OptionSetValue(100000000))) ? c.new_accountant : null,
                                        agreementSd = (c.new_agreed_sd == false && Equals(c.new_participationsp, new OptionSetValue(100000000))) ? c.new_salesdepartment : null
                                    }).ToList();

                SendEmail(correntSales, service, 0);
            }
        }

        public void CheckSalesOrderToday()
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var correntSales = (from c in orgContext.CreateQuery<SalesOrder>()
                                    where c.new_Termagreement >= Convert.ToDateTime(DateTime.Now.ToString("dd.MM.yyyy 00:00:00")).ToUniversalTime() &&
                                           c.new_Termagreement <= Convert.ToDateTime(DateTime.Now.ToString("dd.MM.yyyy 23:59:59")).ToUniversalTime() &&
                                           (c.new_articipationof == new OptionSetValue(100000000) ||
                                           c.new_participationlaw == new OptionSetValue(100000000) ||
                                           c.new_participationlo == new OptionSetValue(100000000) ||
                                           c.new_participationob == new OptionSetValue(100000000) ||
                                           c.new_participationsp == new OptionSetValue(100000000))
                                    select new ProxyToSendEmailExtended
                                    {
                                        recordId = c.Id,
                                        Name = c.Name,
                                        agreementLaw = (c.new_agreedlaw == false && Equals(c.new_participationlaw, new OptionSetValue(100000000))) ? c.new_lawdepartment : null,
                                        agreementLog = (c.new_agreedlog == false && Equals(c.new_participationlo, new OptionSetValue(100000000))) ? c.new_logistics : null,
                                        agreementFin = (c.new_agreed == false && Equals(c.new_articipationof, new OptionSetValue(100000000))) ? c.new_financedepartment : null,
                                        agreementAc = (c.new_agreed_ac == false && Equals(c.new_participationob, new OptionSetValue(100000000))) ? c.new_accountant : null,
                                        agreementSd = (c.new_agreed_sd == false && Equals(c.new_participationsp, new OptionSetValue(100000000))) ? c.new_salesdepartment : null
                                    }).ToList();

                SendEmail(correntSales, service, 1);
            }
        }

        private void SendEmail(List<ProxyToSendEmailExtended> listSales, IOrganizationService service, byte whatDay)
        {
            var Agreements = getAgreements();

            foreach (var item in Agreements)
            {
                Email mail = new Email();

                mail.Subject = "Просьба согласовать Договор либо внести комментарии";

                string link = string.Empty;

                var current = from p in listSales
                              where Equals(p.agreementLaw, item) ||
                                    Equals(p.agreementLog, item) ||
                                    Equals(p.agreementFin, item) ||
                                    Equals(p.agreementAc, item) ||
                                    Equals(p.agreementSd, item)
                              select p;

                if (current.Count() == 0)
                    continue;

                foreach (var colection in current)
                {
                    link += string.Format("<p class='MsoNormal'><i><u><span lang='RU' style='color:rgb(0,112,192)'>" +
                        /*"<a href=https://ukraine.crm.softlinegroup.com/main.aspx?etc=SalesOrder&extraqs=%3f_gridType%3d4212%26etc%3d4212%26id%3d%257b{0}" +
                            "%257d%26preloadcache%3d1406639059288%26rskey%3d307497509&histKey=417657088&newWindow=true&pagetype=entityrecord>{1}</a></span></u></i></p>",*/
                                            "<a href=https://ukraine.crm.softlinegroup.com/main.aspx?etn=SalesOrder&pagetype=entityrecord&id=%7b{0}%7d>{1}</a></span></u></i></p>",
                                            colection.recordId.ToString(), colection.Name.ToString());
                }

                switch (whatDay)
                {
                    case 0:
                        mail.Description = string.Format(@"<div id=':3ua' class='Am Al editable LW-avf' hidefocus='true' aria-label='Текст'
g_editable='true' role='textbox' contenteditable='true' tabindex='1' itacorner='6,7:1,1,0,0' style='direction: ltr; min-height: 236px;'>
<p class='MsoNormal'><span lang='RU'>Уважаемый коллега, срок согласования договора(ов) истекает завтра. Просьба согласовать Договор либо внести комментарии.</span><o:p></o:p></p>          
<p class='MsoNormal'><i><u><span lang='RU' style='color: rgb(0, 112, 192);'>{0}</span></u></i></p>
                                                            <br></div>", link.ToString());
                        break;
                    case 1:
                        mail.Description = string.Format(@"<div id=':3ua' class='Am Al editable LW-avf' hidefocus='true' aria-label='Текст' 
g_editable='true' role='textbox' contenteditable='true' tabindex='1' itacorner='6,7:1,1,0,0' style='direction: ltr; min-height: 236px;'>
<p class='MsoNormal'><span lang='RU'>Уважаемый коллега, срок согласования договора(ов) истекает сегодня. Просьба согласовать Договор либо внести комментарии.</span><o:p></o:p></p>          
<p class='MsoNormal'><i><u><span lang='RU' style='color: rgb(0, 112, 192);'>{0}</span></u></i></p>
                                                            <br></div>", link.ToString());
                        break;
                }

                mail.DirectionCode = true;
                SystemUser user = (SystemUser)service.Retrieve(SystemUser.EntityLogicalName, item.Id, new ColumnSet("fullname", "internalemailaddress"));


                if (user.InternalEMailAddress == null) continue;

                var activityParty1 = new ActivityParty
                {
                    AddressUsed = user.InternalEMailAddress
                };

                var activityParty2 = new ActivityParty
                {
                    PartyId = new EntityReference(SystemUser.EntityLogicalName,
                        new Guid("C49FE2C3-FB35-E511-80D7-005056820ECA")),
                };

                mail.From = new[] { activityParty2 };
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
                                                      },
                                                      new EntityReference
                                                      {
                                                          Id = i.new_accountant.Id,
                                                         LogicalName = i.new_accountant.LogicalName,
                                                         Name = i.new_accountant.Name,
                                                      },
                                                      new EntityReference
                                                      {
                                                          Id = i.new_salesdepartment.Id,
                                                         LogicalName = i.new_salesdepartment.LogicalName,
                                                         Name = i.new_salesdepartment.Name,
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

        public bool Equals(OptionSetValue x, OptionSetValue y)
        {
            if (x != null)
                return x.Value.Equals(y.Value);
            else
                return false;
        }

        public int GetHashCode(EntityReference item)
        {
            return 0;
        }
    }
}
