using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UZ.CurrencyUpdate_service_.Service
{
    class CurrencyUpdateClass
    {
        private IOrganizationService service
        {
            get
            {
                return new CRMConnector().Connect();
            }
        }

        private MainService Log = new MainService();
        private int _ToCrmUTCDate = -2;

        public void UpdateCurrency()
        {
            try
            {
                var XmlDataList = new ParsingXML().DownloadRatesFile();
                var XmlDataListNational = new ParsingXML().getNationCurrency();
                if (XmlDataList == null)
                {
                    Log.AddLog("Second attempt");
                    XmlDataList = new ParsingXML().DownloadRatesFile();
                    if (XmlDataList == null)
                    {
                        Log.AddLog("Bad Second attempt");
                        return;
                    }
                }
                if (XmlDataListNational == null)
                {
                    Log.AddLog("Second attempt /2");
                    XmlDataListNational = new ParsingXML().getNationCurrency();
                    if (XmlDataListNational == null)
                    {
                        Log.AddLog("Bad Second attempt /2");
                        return;
                    }
                }


                DateTime date = Convert.ToDateTime(XmlDataList.First().RelevanceDate);

                decimal USD, EUR, UZS, USDNational, EURNational, RUBNational;

                USD = Convert.ToDecimal(XmlDataList.Find(x => x.IsoCode.Contains("USD")).ExchangeValue) / Convert.ToDecimal(XmlDataList.Find(x => x.IsoCode.Contains("USD")).Nominal);
                EUR = Convert.ToDecimal(XmlDataList.Find(x => x.IsoCode.Contains("EUR")).ExchangeValue) / Convert.ToDecimal(XmlDataList.Find(x => x.IsoCode.Contains("EUR")).Nominal);
                UZS = Convert.ToDecimal(XmlDataList.Find(x => x.IsoCode.Contains("UZS")).ExchangeValue) / Convert.ToDecimal(XmlDataList.Find(x => x.IsoCode.Contains("UZS")).Nominal);

                USDNational = Convert.ToDecimal(XmlDataListNational.Find(y => y.IsoCode.Contains("USD")).ExchangeValue);
                EURNational = Convert.ToDecimal(XmlDataListNational.Find(y => y.IsoCode.Contains("EUR")).ExchangeValue);
                RUBNational = Convert.ToDecimal(XmlDataListNational.Find(y => y.IsoCode.Contains("RUB")).ExchangeValue);

                if (FindAndDeactivateEntity(date))
                {
                    var newRateUSD = new sl_ExchangeRate()
                    {
                        sl_RelevanceDate = date,
                        sl_TransactionCurrencyId = ToTransactionCurrency("USD", decimal.One),
                        sl_ExchangeRate1 = decimal.One,
                        new_national_currency = USDNational
                    };
                    service.Create(newRateUSD);
                    var newRateEUR = new sl_ExchangeRate()
                    {
                        sl_RelevanceDate = date,
                        sl_TransactionCurrencyId = ToTransactionCurrency("EUR", EUR / USD),
                        sl_ExchangeRate1 = EUR / USD,
                        new_national_currency = EURNational
                    };
                    service.Create(newRateEUR);
                    var newRateUZS = new sl_ExchangeRate()
                    {
                        sl_RelevanceDate = date,
                        sl_TransactionCurrencyId = ToTransactionCurrency("UZS", UZS / USD),
                        sl_ExchangeRate1 = UZS / USD,
                        new_national_currency = decimal.One
                    };
                    service.Create(newRateUZS);
                    var newRateRUB = new sl_ExchangeRate()
                    {
                        sl_RelevanceDate = date,
                        sl_TransactionCurrencyId = ToTransactionCurrency("RUB", decimal.One / USD),
                        sl_ExchangeRate1 = decimal.One / USD,
                        new_national_currency = RUBNational
                    };
                    service.Create(newRateRUB);
                }
                else
                {
                    Log.AddLog("All Currency is correct");
                }
            }
            catch (Exception ex)
            {
                Log.AddLog(string.Format("Somethink is wrong in WorkClass: {0}", ex.Message));
            }
        }

        private EntityReference ToTransactionCurrency(string p, decimal? value)
        {
            using (var orgContext = new OrganizationServiceContext(this.service))
            {
                if (p == "USD")
                {
                    return (from i in orgContext.CreateQuery<TransactionCurrency>()
                            where i.ISOCurrencyCode == p
                            select i).FirstOrDefault().ToEntityReference();
                }
                var TransactionCurrencyId = (from i in orgContext.CreateQuery<TransactionCurrency>()
                                             where i.ISOCurrencyCode == p
                                             select i.Id).FirstOrDefault();

                TransactionCurrency entityForUpdate = new TransactionCurrency()
                {
                    Id = TransactionCurrencyId,
                    LogicalName = TransactionCurrency.EntityLogicalName,
                    ExchangeRate = value
                };

                service.Update(entityForUpdate);
                return entityForUpdate.ToEntityReference();
            }
        }

        private bool FindAndDeactivateEntity(DateTime date)
        {
            using (var orgContext = new OrganizationServiceContext(this.service))
            {
                var currencyFromCrm = (from i in orgContext.CreateQuery<sl_ExchangeRate>()
                                       where i.sl_RelevanceDate < date.ToUniversalTime().AddHours(_ToCrmUTCDate)
                                       && i.statecode == sl_ExchangeRateState.Active
                                       select i).ToList();

                if (currencyFromCrm.Count == 0)
                {
                    return false;
                }

                // деактивация устаревших курсов State = Close 

                foreach (var item in currencyFromCrm)
                {
                    SetStateRequest deactivateRequest = new SetStateRequest()
                    {
                        EntityMoniker = new EntityReference(sl_ExchangeRate.EntityLogicalName, item.Id),
                        State = new OptionSetValue(1),
                        Status = new OptionSetValue(-1)
                    };
                    orgContext.Execute(deactivateRequest);
                }
                return true;
            }
        }
    }
}
