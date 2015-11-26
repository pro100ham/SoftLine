using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UA.CreateProductFromInvoiceToPayment
{
    public class CreateProduct : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                if (context.PrimaryEntityName != new_paymentprovider.EntityLogicalName
                    || context.MessageName.ToLower() != "create")
                    return;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    var PaymentProvaider = (Entity)context.InputParameters["Target"];
                    var PaymentProvaiderCurrent = PaymentProvaider.ToEntity<new_paymentprovider>();
                    //new_paymentsprovider

                    if (PaymentProvaiderCurrent.new_invoice == null || PaymentProvaiderCurrent.new_provider == null)
                        return;

                    var listProductInvoice = (from i in orgContext.CreateQuery<InvoiceDetail>()
                                              where i.InvoiceId.Id == PaymentProvaiderCurrent.new_invoice.Id &&
                                              i.new_provider.Id == PaymentProvaiderCurrent.new_provider.Id
                                              select i).ToList();

                    if (listProductInvoice == null) return;

                    foreach (var item in listProductInvoice)
                    {
                        service.Create(new new_paymentsprovider()
                        {
                            new_isproductoverridden = item.IsProductOverridden,
                            new_productid = item.ProductId,
                            new_productdescription = item.ProductDescription,
                            new_numberorderatthesupplier = item.new_Numberorderatthesupplier,
                            new_manufacturer = item.new_manufacturer,
                            TransactionCurrencyId = item.TransactionCurrencyId,
                            new_purchaseprice = item.new_purchaseprice,
                            new_amountpurchase = item.new_amountpurchase,
                            new_pricepurchaseusd = item.new_pricepurchaseusd,
                            new_totalpurchaseusd = item.new_totalpurchaseusd,
                            new_quantity = item.Quantity,
                            new_paymentprovider = PaymentProvaiderCurrent.ToEntityReference(),
                            new_provider = item.new_provider,
                            new_nds = item.new_nds
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
