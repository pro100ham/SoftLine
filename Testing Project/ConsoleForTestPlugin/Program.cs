using System;
using System.Linq;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;

namespace ConsoleForTestPlugin
{
    class Program
    {
        static void Main(string[] args)
        {
            DateTime fromDate = Convert.ToDateTime(DateTime.Now.ToString("dd.MM.yyyy 00:00:00")).ToUniversalTime(); DateTime.Now.AddDays(1).Date.ToUniversalTime();
            DateTime toDate = Convert.ToDateTime(DateTime.Now.ToString("dd.MM.yyyy 23:59:59")).ToUniversalTime();DateTime.Now.Date.ToUniversalTime();






            /*
            string UserName = @"softline\savchinvv";
            string Password = @"ytdblbvrf19*";

            var creds = new ClientCredentials();
            creds.UserName.UserName = UserName;
            creds.UserName.Password = Password;

            ServicePointManager.ServerCertificateValidationCallback = delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
            OrganizationServiceProxy serviceProxy = new OrganizationServiceProxy(new Uri(@"https://ukraine.crm.softlinegroup.com/XrmServices/2011/Organization.svc"), null, creds, null);

            serviceProxy.EnableProxyTypes();
            serviceProxy.Authenticate();
            var service = (IOrganizationService)serviceProxy;

            using (var orgContext = new OrganizationServiceContext(service))
            {
                    List<SoftLine.Models.Annotation> Entity = (from i in orgContext.CreateQuery<SoftLine.Models.Annotation>()
                                                              select i).ToList();
                    foreach (var item in Entity)
                    {
                        if (item.ObjectId.LogicalName == "invoice")
                        {
                            EntityReference Owner = GetOwnerFromEntity<SoftLine.Models.Invoice>(item.ObjectId.Id, orgContext);
                            //new SoftLine.UA.ProductFromAnnotation.InvoiceProcesses().Processes((SoftLine.Models.Annotation)item, (IOrganizationService)service);
                        }
                    }

            }*/

            //if (correntInvoice == null)
            //{
            //    return;
            //}

            //var objPayment = (from i in orgContext.CreateQuery<new_payment>()
            //                  where i.new_expense.Id == correntInvoice.Id
            //                  select new
            //                  {
            //                      new_amountsreceived = i.new_amountsreceived ?? new Money(0),
            //                      new_percentagepayment = i.new_percentagepayment ?? 0
            //                  }).ToList();
            //var amount = objPayment.Sum(item => item.new_amountsreceived.Value);
            //var precent = objPayment.Sum(item => item.new_percentagepayment);

            //Invoice updateEntity = new Invoice()
            //{
            //    Id = correntInvoice.Id,
            //    new_amountsreceived = new Money(amount),
            //    new_percentage_amount = precent
            //};
            //service.Update(updateEntity);



            //string now = DateTime.UtcNow.Date.ToString("dd'/'MM'/'yyyy");

            //XDocument doc = new XDocument(); ;
            //string url = String.Format(@"http://www.cbr.ru/scripts/XML_daily.asp?date_req={0}", now);
            //string xml;

            //using (var webClient = new WebClient())
            //{
            //    xml = webClient.DownloadString(url);
            //}

            //doc.Add(XDocument.Parse(xml));

            //string date = doc.Element("ValCurs").Attribute("Date").Value;

            //var rates = (from i in doc.Element("ValCurs").Elements("Valute")
            //             where i.Element("CharCode").Value == "USD" ||
            //             i.Element("CharCode").Value == "EUR" ||
            //             i.Element("CharCode").Value == "UZS"
            //             select new
            //             {
            //                 IsoCode = i.Element("CharCode").Value,
            //                 Nominal = i.Element("Nominal").Value,
            //                 ExchangeValue = i.Element("Value").Value,
            //                 RelevanceDate = date,
            //                 CurrencyNation = new Program().getNationCurrency(i.Element("CharCode").Value)
            //             }).ToList();


            //    string[] isocode = { "usd", "eur", "rub" };
            //    List<XDocument> doc = new List<XDocument>();
            //    string xml = "";
            //    foreach (var item in isocode)
            //    {
            //        string urlNationalBank = String.Format(@"http://www.cbu.uz/section/rates/widget/xml/{0}", item);
            //        using (var webClient = new WebClient())
            //        {
            //            xml = webClient.DownloadString(urlNationalBank);
            //            doc.Add(XDocument.Parse(xml));
            //        }
            //    }


            //    var a = (from c in doc.Elements("response")
            //             select c.Element("rate").Value).ToList();

        }

        //public string getNationCurrency(string name)
        //{
        //    if (name == "UZS")
        //        return "1";

        //    string urlNationalBank = String.Format(@"http://www.cbu.uz/section/rates/widget/xml/{0}", name);
        //    string xml1;
        //    using (var webClient = new WebClient())
        //    {
        //        xml1 = webClient.DownloadString(urlNationalBank);
        //    }

        //    XDocument doc1 = XDocument.Parse(xml1);
        //    return (from c in doc1.Elements("response")
        //            select c.Element("rate").Value).FirstOrDefault();
        //}

        static EntityReference GetOwnerFromEntity<T>(Guid guid, OrganizationServiceContext service) where T : Entity
        {
            return (from i in service.CreateQuery<T>()
                        where i.Id == guid
                        select i.GetAttributeValue<EntityReference>("ownerid")).FirstOrDefault();
        }
    }


}
