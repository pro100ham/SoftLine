using System;

namespace UploadPricelist
{
    internal class IntermidiateProduct
    {
        public DateTime CreatedOn { get; set; }
        public string Vendor { get; set; }
        public string SoftLineSku { get; set; }
        public string VendorSku { get; set; }
        public string SoftLineProductFamily { get; set; }
        public string ProducFamily { get; set; }
        public string ProductDescription { get; set; }
        public string Version { get; set; }
        public string Language { get; set; }
        public string FullOrUpdate { get; set; }
        public string BoxOrLicense { get; set; }
        public string AeOrCom { get; set; }
        public string Media { get; set; }
        public string Os { get; set; }
        public string LicenseLevel { get; set; }
        public decimal? SprPrice { get; set; }
        public decimal? PdrPrice { get; set; }
        public decimal? Retail1Frm { get; set; }
        public decimal? Retail2Frm { get; set; }
        public string Type { get; set; }
        public decimal? VatPercent { get; set; }
        public string Currency { get; set; }
        public string PricelistName { get; set; }
        public string Manufacturer { get; set; }

        public bool IsEmpty()
        {
            return SoftLineSku == null;
        }
    }
}