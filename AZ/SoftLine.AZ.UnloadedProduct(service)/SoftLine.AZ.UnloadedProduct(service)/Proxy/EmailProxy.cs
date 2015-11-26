using System;
using Microsoft.Xrm.Sdk;

namespace SoftLine.AZ.UnloadedProduct_service_.Proxy
{
    public class EmailProxy
    {
        public EntityReference EntityOwner { get; set; }

        public EntityReference InvoiceAccount { get; set; }

        public string NumberInvoice { get; set; }

        public EntityReference InvoiceDetail { get; set; }

        public string Product { get; set; }

        public string Number { get; set; }

        public Guid InvoiceId { get; set; }
    }
}
