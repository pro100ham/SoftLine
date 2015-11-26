using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;
using SoftLine.UA.CurrencyService.Service;

namespace SoftLine.UA.CurrencyService
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

        private CurrencyService log = new CurrencyService();

        public void UpdateCurrency()
        {
            try
            {
                var md = new GetJsonCurrency().GetMBCurrency();
                var nbu = new GetJsonCurrency().GetNBUCurrency();

                if (md == null && nbu == null)
                {
                    log.AddLog("Second attempt");
                    md = new GetJsonCurrency().GetMBCurrency();
                    nbu = new GetJsonCurrency().GetNBUCurrency();
                    if (md == null && nbu == null)
                    {
                        log.AddLog("Bad Second attempt");
                        return;
                    }
                }

                DateTime date = Convert.ToDateTime(DateTime.Now.ToString("dd.MM.yyyy 11:00:00"));

                double USDmd, EURmd, RUBmd, USDnbu, EURnbu, RUBnbu;

                USDmd = 0;
                EURmd = 0;
                RUBmd = 0;
                USDnbu = 0;
                EURnbu = 0;
                RUBnbu = 0;

                foreach (var item in md)
                {
                    switch (item.currency)
                    {
                        case "usd":
                            USDmd = Convert.ToDouble(item.ask.Replace('.', ','));
                            break;
                        case "eur":
                            EURmd = Convert.ToDouble(item.ask.Replace('.', ','));
                            break;
                        case "rub":
                            RUBmd = Convert.ToDouble(item.ask.Replace('.', ','));
                            break;
                    }
                }

                foreach (var item in nbu)
                {
                    switch (item.currency)
                    {
                        case "usd":
                            USDnbu = Convert.ToDouble(item.bid.Replace('.', ','));
                            break;
                        case "eur":
                            EURnbu = Convert.ToDouble(item.bid.Replace('.', ','));
                            break;
                        case "rub":
                            RUBnbu = Convert.ToDouble(item.bid.Replace('.', ','));
                            break;
                    }
                }

                if (FindAndDeactivateEntity(date))
                {
                    var newRateUSD = new new_exchangerates()
                    {
                        new_name = "USD",
                        new_date = date,
                        TransactionCurrencyId = ToTransactionCurrency("USD"),
                        new_megbank = 1,
                        new_nbu = 1,
                    };
                    service.Create(newRateUSD);
                    var newRateEUR = new new_exchangerates()
                    {
                        new_name = "EUR",
                        new_date = date,
                        TransactionCurrencyId = ToTransactionCurrency("EUR"),
                        //new_nbu = EURnbu / USDnbu,
                        //new_megbank = EURmd / USDmd
                        new_nbu = EURnbu,
                        new_megbank = EURmd
                    };
                    service.Create(newRateEUR);
                    var newRateRUB = new new_exchangerates()
                    {
                        new_name = "RUB",
                        new_date = date,
                        TransactionCurrencyId = ToTransactionCurrency("RUB"),
                        //new_nbu = RUBnbu / USDnbu,
                        //new_megbank = RUBmd / USDmd
                        new_nbu = RUBnbu,
                        new_megbank = RUBmd
                    };
                    service.Create(newRateRUB);
                    var newRateUAH = new new_exchangerates()
                    {
                        new_name = "UAH",
                        new_date = date,
                        TransactionCurrencyId = ToTransactionCurrency("UAH"),
                        //new_nbu = 1 / USDnbu,
                        //new_megbank = 1 / USDmd
                        new_nbu = USDnbu,
                        new_megbank = USDmd
                    };
                    service.Create(newRateUAH);
                }
                else
                {
                    log.AddLog("All Currency is correct");
                }
            }
            catch (Exception ex)
            {
                log.AddLog(string.Format("Somethink is wrong in WorkClass: {0}", ex.Message));
            }
        }

        private EntityReference ToTransactionCurrency(string p)
        {
            using (var orgContext = new OrganizationServiceContext(this.service))
            {
                return (from i in orgContext.CreateQuery<TransactionCurrency>()
                        where i.ISOCurrencyCode == p
                        select i).FirstOrDefault().ToEntityReference();
            }
        }

        private bool FindAndDeactivateEntity(DateTime date)
        {
            using (var orgContext = new OrganizationServiceContext(this.service))
            {
                var currencyFromCrm = (from i in orgContext.CreateQuery<new_exchangerates>()
                                       where i.new_date < date
                                       && i.statecode == new_exchangeratesState.Active
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
                        EntityMoniker = new EntityReference(new_exchangerates.EntityLogicalName, item.Id),
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
