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
    public class Work
    {
        private IOrganizationService service
        {
            get
            {
                return new CRMConnector().Connect();
            }
        }

        private Service1 Log = new Service1();
        public List<EmailProxy> listData;

        public void CheckIvoiceDetail()
        {
            try
            {
                listData = TakeDataList();

                if (listData != null)
                {
                    SendEmail(listData);
                }
                else
                {
                    Log.AddLog("Выборка не дала результат");
                }
            }
            catch (Exception ex)
            {
                Log.AddLog(ex.Message);
            }
        }

        private List<EmailProxy> TakeDataList()
        {
            using (var orgContext = new OrganizationServiceContext(this.service))
            {
                var PrelistData = (from i in orgContext.CreateQuery<InvoiceDetail>()
                                   where i.new_Data_razmescheniya != null
                                   && i.ActualDeliveryOn != null
                                   && i.new_Fact_date_otgryzki == null
                                   && i.InvoiceId != null
                                   && i.new_shipping == false
                                   && i.ActualDeliveryOn <= DateTime.Now.ToUniversalTime()
                                   && i.CreatedOn > DateTime.Parse("10-03-2015").ToUniversalTime()
                                   select i).ToList();

                if (PrelistData == null)
                    return null;

                return (from c in PrelistData
                        select new EmailProxy
                                        {
                                            EntityOwner = c.OwnerId,
                                            InvoiceDetail = new EntityReference
                                            {
                                                Id = c.Id,
                                                LogicalName = c.LogicalName
                                            },
                                            InvoiceAccount = c.new_sopplierid,
                                            NumberInvoice = (from p in orgContext.CreateQuery<Invoice>()
                                                             where p.Id == c.InvoiceId.Id
                                                             select p.new_invoice_number).FirstOrDefault(),
                                            Number = c.new__number_invoice_supplier,
                                            Product = c.ProductId.Name,
                                            InvoiceId = c.InvoiceId.Id
                                        }).ToList();
            }
        }

        private void SendEmail(List<EmailProxy> listData)
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                try
                {
                    foreach (var item in listData)
                    {
                        Email unloadEmail = new Email();

                        var client = (Invoice)service.Retrieve(Invoice.EntityLogicalName, item.InvoiceId, new ColumnSet("customerid"));

                        //Тема письма: «Уведомление о неотгруженном в срок заказе. 
                        //Сущность  - invoice поле new_invoice_number,  Сущность  - invoice поле - customerid
                        unloadEmail.Subject = string.Format("Уведомление о неотгруженном в срок заказе. {0} , {1}",
                            item.NumberInvoice, client.CustomerId == null ? "" : client.CustomerId.Name);

                        //Заказы по нижеуказанным данным не поступили в ожидаемый срок. 
                        //Сущность invoicedetail,  Сущность invoicedetail поле new_sopplierid, Сущность invoicedetail поле new_sopplierid_invoice_supplier
                        //Требуемые действия Логиста: 
                        //1) связаться с поставщиком для решения вопроса с поставкой
                        //2) предоставить ответственному менеджеру информацию о причинах задержки и обновленной дате отгрузки заказа
                        //Требуемые действия ответственного менеджера: 
                        //1) связаться с заказчиком, извиниться и сообщить о задержке заказа предоставив информацию о новых датах отгрузки

                        //link ----<http://crm2011:5555/SoftlineInternationalLtd/userdefined/edit.aspx?etc=1091&id=%7b{0}%7d>

                        string link = string.Format(/*@"<p class='MsoNormal'><i><u><span lang='RU' style='color:rgb(0,112,192)'>" +*/
                                           @"<a href=http://crm2011:5555/SoftlineInternationalLtd/userdefined/edit.aspx?etc=1091&id=%7b{0}%7d>{1}</a></span></u></i></p>",
                                            item.InvoiceDetail.Id.ToString(), item.Product);
                        unloadEmail.Description = string.Format(@"<div id=':1df' class='Am Al editable LW-avf' hidefocus='true' aria-label='Текст повідомлення' g_editable='true' role='textbox' contenteditable='true' tabindex='1' itacorner='6,7:1,1,0,0' style='direction: ltr; min-height: 240px;'><p class='MsoNormal' style='background-image: initial; background-repeat: initial;'><b><i><span style='color: black;'>Заказы
по нижеуказанным данным не поступили в ожидаемый срок.</span></i></b></p>
<p class='MsoNormal' style='background-image: initial; background-repeat: initial;'><span lang='EN-US' style='color: black;'>{0}, {1}</span><span lang='EN-US' style='color: black;'>, {2}</span></p>
<p class='MsoNormal' style='background-image: initial; background-repeat: initial;'><b><i><span style='color: black;'>Требуемые
действия Логиста: </span></i></b></p>
<p style='background-image: initial; background-repeat: initial;'><span style='color: black;'>1)</span><span style='color: rgb(40, 40, 40);'> </span><span style='color: black;'>связаться с поставщиком для решения вопроса с поставкой</span><span style='color: rgb(40, 40, 40);'></span></p>
<p style='background-image: initial; background-repeat: initial;'><span style='color: black;'>2)</span><span style='color: rgb(40, 40, 40);'> </span><span style='color: black;'>предоставить ответственному менеджеру информацию о причинах
задержки и обновленной дате отгрузки заказа</span></p>
<p class='MsoNormal' style='background-image: initial; background-repeat: initial;'><b><i><span style='color: black;'>Требуемые
действия ответственного менеджера: </span></i></b><span style='color: rgb(40, 40, 40);'></span></p>
<p style='background-image: initial; background-repeat: initial;'><span style='color: black;'>1)</span><span style='color: rgb(40, 40, 40);'> </span><span style='color: black;'>связаться с заказчиком, извиниться и сообщить о задержке
заказа предоставив информацию о новых датах отгрузки</span><span style='color: rgb(40, 40, 40);'></span></p><p style='background-image: initial; background-repeat: initial;'><span style='color: rgb(40, 40, 40);'>Ссылка для перехода &nbsp;- {3}</span><span style='color: black;'><br></span></p></div>"
                            , item.Product, item.InvoiceAccount == null ? "" : item.InvoiceAccount.Name, item.Number, link);
                        unloadEmail.DirectionCode = true;
                        SystemUser user =
                            (SystemUser)service.Retrieve(SystemUser.EntityLogicalName, item.EntityOwner.Id, new ColumnSet("internalemailaddress"));

                        if (user.InternalEMailAddress == null)
                        {
                            Log.AddLog(string.Format("Адрес Електроной почты отсутствует... ({0})", item.EntityOwner.Name));
                            continue;
                        }

                        var activity1 = new ActivityParty
                        {
                            AddressUsed = user.InternalEMailAddress
                        };

                        var activity2 = new ActivityParty
                        {
                            AddressUsed = @"Teymur.Dzhafarov@softlinegroup.com"
                        };

                        unloadEmail.To = new[] { activity1 };
                        unloadEmail.Cc = new[] {  activity2 };

                        Guid createdEmailId = service.Create(unloadEmail);

                        service.Update(new InvoiceDetail
                        {
                            Id = item.InvoiceDetail.Id,
                            new_shipping = true
                        });


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
                catch (Exception ex)
                {
                    Log.AddLog(ex.Message);
                }
            }
        }
    }
}
