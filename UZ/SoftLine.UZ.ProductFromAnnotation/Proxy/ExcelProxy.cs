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

        public string Product { get; set; }
    }

    public class ExcelProxyQuotedetail
    {
        public string Product { get; set; }

        public string exchangeRates { get; set; }

        public string baseamount { get; set; }

        public string priceperunit { get; set; }

        public string quantity { get; set; }

        public string new_usdprice { get; set; }

        public string new_totalpurchaseusd { get; set; }

        public string new_koef { get; set; }

        public string new_sellingusd { get; set; }

        public string new_generalsellingusd { get; set; }

        public string Vendor { get; set; }

        public string SKU { get; set; }
    }

    public class ExcelProxyQuote
    {
        public string totalamount { get; set; }

        public string new_usd { get; set; }

        public string new_summausd { get; set; }
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
