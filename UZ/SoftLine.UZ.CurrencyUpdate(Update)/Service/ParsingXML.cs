using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using SoftLine.UZ.CurrencyUpdate_Update_;

namespace SoftLine.UZ.CurrencyUpdate_service_.Service
{
    class ParsingXML
    {
        private Service1 Log = new Service1();

        public List<ExchangeRateDTO> getNationCurrency()
        {
            string now = DateTime.UtcNow.Date.ToString("dd'/'MM'/'yyyy");
            string[] isocode = { "usd", "eur", "rub" };
            List<XDocument> doc = new List<XDocument>();
            string xml = "";
            foreach (var item in isocode)
            {
                string urlNationalBank = String.Format(@"http://www.cbu.uz/section/rates/widget/xml/{0}", item);
                using (var webClient = new WebClient())
                {
                    xml = webClient.DownloadString(urlNationalBank);
                    doc.Add(XDocument.Parse(xml));
                }
            }

            List<ExchangeRateDTO> list = (from c in doc.Elements("response")
                    select new ExchangeRateDTO
                    {
                        ExchangeValue = c.Element("rate").Value.Replace('.',','),
                        IsoCode = c.Element("symbol").Value,
                        Nominal = c.Element("size").Value,
                        RelevanceDate = now
                    }).ToList();
            return list;
        }

        public List<ExchangeRateDTO> DownloadRatesFile()
        {
            try
            {
                string now = DateTime.UtcNow.Date.ToString("dd'/'MM'/'yyyy");
                string url = String.Format(@"http://www.cbr.ru/scripts/XML_daily.asp?date_req={0}", now);
                string xml;
                Log.AddLog("Try download currency");

                using (var webClient = new WebClient())
                {
                    xml = webClient.DownloadString(url);
                }

                XDocument doc = XDocument.Parse(xml);

                string date = doc.Element("ValCurs").Attribute("Date").Value;

                List<ExchangeRateDTO> rates = (from i in doc.Element("ValCurs").Elements("Valute")
                                               where i.Element("CharCode").Value == "USD" ||
                                               i.Element("CharCode").Value == "EUR" ||
                                               i.Element("CharCode").Value == "UZS"
                                               select new ExchangeRateDTO
                                                   {
                                                       IsoCode = i.Element("CharCode").Value,
                                                       Nominal = i.Element("Nominal").Value,
                                                       ExchangeValue = i.Element("Value").Value,
                                                       RelevanceDate = date
                                                   }).ToList();

                return rates;
            }
            catch (Exception ex)
            {
                Log.AddLog(string.Format("Somethink is wrong in ParceXML: {0}", ex.Message));
                return null;
            }
        }
    }
}
