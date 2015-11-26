using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xrm.Sdk;
using System.IO;
using System.Net;
using System.Xml.Linq;


namespace CRM_Experiments
{
    class Program
    {
        internal static CrmService CustomService { get; set; }

        static void Main(string[] args)
        {
            CustomService = new CrmService();

            Console.WriteLine("Connection esteblished...");

            List<TransactionCurrency> currencies =
                CustomService
                .XrmContext
                .TransactionCurrencySet
                .ToList();

            List<ExchangeRateDTO> eRateDtos = DownloadRatesFile();

            DateTime relevanceDate = GetRelevanceDate(eRateDtos.First());

            DeactivateAllExchangeRates(CustomService, relevanceDate);

            decimal usdRate = findUsdToAznRate(eRateDtos);

            foreach (var rate in eRateDtos)
            {
                if (rate.IsoCode.ToUpper() == "USD")
                {
                    rate.IsoCode = "AZN";
                }

                TransactionCurrency currentCurrency =
                    currencies
                    .SingleOrDefault(x =>
                        x.ISOCurrencyCode.ToUpper() == rate.IsoCode.ToUpper());

                if (currentCurrency == null)
	            {
		             continue;
	            }

                sl_ExchangeRate newRate = new sl_ExchangeRate();

                if (rate.IsoCode != "AZN")
                {
                    newRate = new sl_ExchangeRate()
                    {
                        sl_RelevanceDate = relevanceDate,
                        sl_TransactionCurrencyId = currentCurrency.ToEntityReference(),
                        sl_ExchangeRate1 = 1 / decimal.Parse(rate.ExchangeValue.Replace('.', ',')) * usdRate, // eur/azn / usd/azn
                    };
                }
                else
                {
                    newRate = new sl_ExchangeRate()
                    {
                        sl_RelevanceDate = relevanceDate,
                        sl_TransactionCurrencyId = new EntityReference(TransactionCurrency.EntityLogicalName, currentCurrency.TransactionCurrencyId.Value),
                        sl_ExchangeRate1 = decimal.Parse(rate.ExchangeValue.Replace('.', ','))
                    };
                }

                CustomService.Create(newRate);

                Console.WriteLine("Created exchange rate of {0} = {1}", currentCurrency.ISOCurrencyCode, newRate.sl_ExchangeRate1);
            }

            Console.WriteLine("Update complete!");
        }

        private static DateTime GetRelevanceDate(ExchangeRateDTO rate)
        {
            var date = rate.RelevanceDate.Split('.');
            DateTime result = new DateTime(int.Parse(date[2]), int.Parse(date[1]), int.Parse(date[0]), 12, 0, 0);

            return result;
        }

        private static void DeactivateAllExchangeRates(CrmService CustomService, DateTime relevanceDate)
        {
            List<sl_ExchangeRate> activeRates =
                CustomService.XrmContext
                .sl_ExchangeRateSet
                .Where(x =>
                    x.statecode == sl_ExchangeRateState.Active &&
                    x.sl_RelevanceDate <= relevanceDate)
                .ToList();

            foreach (var rate in activeRates)
            {
                CustomService.DeactivateExchangeRateById(rate.sl_ExchangeRateId.Value);
            }
        }

        private static decimal findUsdToAznRate(List<ExchangeRateDTO> eRateDtos)
        {
            ExchangeRateDTO usdRateDto =
                eRateDtos
                .Where(x =>
                    x.IsoCode.ToUpper() == "USD")
                .Single();

            decimal usdToAznRate = decimal.Parse(usdRateDto.ExchangeValue.Replace('.', ',')) / decimal.Parse(usdRateDto.Nominal.Replace('.', ','));

            //decimal usdToAznRate = Convert.ToDecimal(usdRateDto.ExchangeValue) / Convert.ToDecimal(usdRateDto.Nominal);

            return usdToAznRate;
        }

        public static List<ExchangeRateDTO> DownloadRatesFile()
        {
            DateTime now = DateTime.UtcNow.Date;
            string url = String.Format("http://www.cbar.az/currencies/{0:D2}.{1:D2}.{2}.xml", now.Day, now.Month, now.Year);
            string xml;
            using (var webClient = new WebClient())
            {
                xml = webClient.DownloadString(url);
            }

            XDocument doc = XDocument.Parse(xml);

            string date = doc.Element("ValCurs").Attribute("Date").Value;

            List<ExchangeRateDTO> rates =
                doc
                .Element("ValCurs")
                .Elements("ValType")
                .Where(x =>
                    x.Attribute("Type").Value == "Xarici valyutalar")
                .Single()
                .Elements("Valute")
                .Select(x =>
                    new ExchangeRateDTO{
                        IsoCode = x.Attribute("Code").Value,
                        Nominal = x.Element("Nominal").Value,
                        ExchangeValue = x.Element("Value").Value,
                        RelevanceDate = date
                    })
                .ToList();
            
            return rates;
        }

    }
}
