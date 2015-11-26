using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;
using SoftLine.UZ.CurrencyUpdate_service_;

namespace SoftLine.UA.CurrencyService.Service
{
    class GetJsonCurrency
    {
        CurrencyService log = new CurrencyService();
        private string md = "http://api.minfin.com.ua/mb/704ee38c21fa029c044881ce955b11cf43adfc90/";
        private string nbu = "http://api.minfin.com.ua/nbu/704ee38c21fa029c044881ce955b11cf43adfc90/";
        private string rub = "rub";
        private string eur = "eur";
        private string usd = "usd";

        public List<ExchangeRate> GetMBCurrency()
        {
            var request = (HttpWebRequest)WebRequest.Create(this.md);
            request.UserAgent = "CRM2013/1.0 (http://http://softline.ua/)";
            request.Method = "GET";
            using (var response = request.GetResponse())
            {
                using (Stream stream = response.GetResponseStream())
                {
                    StreamReader reader = new StreamReader(stream);
                    string content = reader.ReadToEnd();


                    List<ExchangeRate> responseData = new List<ExchangeRate>();

                    List<ExchangeRate> ParseData = JsonConvert.DeserializeObject<List<ExchangeRate>>(content);

                    if (ParseData.Count == 0)
                    {
                        log.AddLog("При оброботе данных MD.Отсутствует контент");
                        return null;
                    }

                    responseData.Add(ParseData.Where(da => da.currency == this.usd).OrderBy(da => da.date).Last());
                    responseData.Add(ParseData.Where(da => da.currency == this.rub).OrderBy(da => da.date).Last());
                    responseData.Add(ParseData.Where(da => da.currency == this.eur).OrderBy(da => da.date).Last());

                    return responseData;
                }
            }
        }

        public List<ExchangeRate> GetNBUCurrency()
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(this.nbu);
                request.UserAgent = "CRM2013/1.0 (http://http://softline.ua/)";
                request.Method = "GET";
                using (var response = request.GetResponse())
                {
                    using (Stream stream = response.GetResponseStream())
                    {
                        StreamReader reader = new StreamReader(stream);
                        string content = reader.ReadToEnd();


                        List<ExchangeRate> responseData = new List<ExchangeRate>();

                        dynamic ParseData = JsonConvert.DeserializeObject<dynamic>(content);

                        responseData.Add(new ExchangeRate
                        {
                            currency = this.rub,
                            date = ParseData.rub.date,
                            bid = ParseData.rub.bid
                        });
                        responseData.Add(new ExchangeRate
                        {
                            currency = this.eur,
                            date = ParseData.eur.date,
                            bid = ParseData.eur.bid
                        });
                        responseData.Add(new ExchangeRate
                        {
                            currency = this.usd,
                            date = ParseData.usd.date,
                            bid = ParseData.usd.bid
                        });

                        return responseData;
                    }
                }
            }
            catch (Exception ex)
            {
                log.AddLog("При оброботе данных NBU.Отсутствует контент");
                return null;
            }
        }
    }
}
