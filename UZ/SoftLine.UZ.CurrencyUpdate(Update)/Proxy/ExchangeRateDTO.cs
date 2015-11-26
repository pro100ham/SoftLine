using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SoftLine.UZ.CurrencyUpdate_service_
{
    class ExchangeRateDTO
    {
        public string IsoCode { get; set; }

        public string Nominal { get; set; }

        public string ExchangeValue { get; set; }

        public string RelevanceDate { get; set; }
    }
}
