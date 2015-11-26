using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ExcelfromAnnotation.Proxy
{
    public class ExcelProxyProduct
    {
        public string SKU { get; set; }

        public string Vendor { get; set; }

        public string recomendetPriceUSD { get; set; }

        public string Product { get; set; }
    }

    public class ExcelProxyQuotedetail
    {
        public string Product { get; set; }

        public string Count { get; set; }

        public string priceForOneHRN { get; set; }

        public string priceAllHRN { get; set; }

        public string buyPriceHRN { get; set; }

        public string buyPriceAllHRN { get; set; }

        public string buyPriceAllUSD { get; set; }

        public string exchangeRates { get; set; }

        public string totalUSD { get; set; }
    }

    public class ExcelProxyQuote
    {
        public string Marza { get; set; }

        public string MarzaPersent { get; set; }

        public string exchangeRates { get; set; }

        public string discount { get; set; }

        public string discountForPartners { get; set; }
    }

    public class ExcelProxyInvoiceDetail
    {
        public string Product { get; set; }

        public string Count { get; set; }

        public string Priceperunit { get; set; }

        public string Baseamount { get; set; }

        public string Purchaseprice { get; set; }

        public string Amountpurchase { get; set; }

        public string Pricepurchaseusd { get; set; }

        public string Exchangerates { get; set; }

        public string totalUSD { get; set; }
    }

    public class ExcelProxyInvoice
    {
        public string Marza { get; set; }

        public string MarzaPersent { get; set; }

        public string exchangeRates { get; set; }

        public string totalUSD { get; set; }
    }
}
