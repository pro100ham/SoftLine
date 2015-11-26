using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using System.ServiceModel;
using ExcelfromAnnotation;
using SoftLine.Models;
using ExcelfromAnnotation.Service;
using ExcelfromAnnotation.Proxy;
using Microsoft.Xrm.Sdk.Client;

namespace SoftLine.UA.ProductFromAnnotation
{
    public class InvoiceProcesses
    {
        public void Processes(Annotation annotation, IOrganizationService service)
        {
            var exel = new ExcelReader().ExcelOpenSpreadsheets(annotation.DocumentBody.ToString(),
          annotation.FileName.ToString());

            if (exel == null) return;

            if (exel.Tables[0].Rows[1][0].ToString() != "SKU") return;

            var data = new CreateNewProduct();
            List<ExcelProxyInvoice> invoice = new List<ExcelProxyInvoice>();
            data.service = service;
            data.mainEntityId = annotation.ObjectId;
            for (int i = 2; i < exel.Tables[0].Rows.Count; i++)
            {
                var product = new ExcelProxyProduct();
                var invoicedetail = new ExcelProxyInvoiceDetail();

                if (exel.Tables[0].Rows[i][0].ToString() != string.Empty && exel.Tables[0].Rows[i][0].ToString() != "Итого:")
                {
                    product.SKU = exel.Tables[0].Rows[i][0].ToString();
                    product.Vendor = exel.Tables[0].Rows[i][1].ToString();
                    product.recomendetPriceUSD = exel.Tables[0].Rows[i][10].ToString();
                    product.Product = exel.Tables[0].Rows[i][2].ToString();

                    invoicedetail.Product = exel.Tables[0].Rows[i][2].ToString();
                    invoicedetail.Count = exel.Tables[0].Rows[i][3].ToString();
                    invoicedetail.Priceperunit = exel.Tables[0].Rows[i][4].ToString();
                    invoicedetail.Baseamount = exel.Tables[0].Rows[i][5].ToString();
                    invoicedetail.Purchaseprice = exel.Tables[0].Rows[i][6].ToString();
                    invoicedetail.Amountpurchase = exel.Tables[0].Rows[i][7].ToString();
                    invoicedetail.Pricepurchaseusd = exel.Tables[0].Rows[i][11].ToString();
                    invoicedetail.Exchangerates = exel.Tables[0].Rows[i][13].ToString();
                    invoicedetail.totalUSD = exel.Tables[0].Rows[i][12].ToString();

                    invoice.Add(new ExcelProxyInvoice
                    {
                        Marza = exel.Tables[0].Rows[i][8].ToString(),
                        MarzaPersent = exel.Tables[0].Rows[i][9].ToString(),
                        totalUSD = exel.Tables[0].Rows[i][12].ToString(),
                        exchangeRates = exel.Tables[0].Rows[i][13].ToString()
                    });

                    EntityReference idProduct = data.ProductFromSpec(product);

                    if (idProduct == null)
                    {
                        throw new InvalidPluginExecutionException("Product not found");
                    }
                    if (data.CreateInvoiceDetail(invoicedetail, idProduct) == false)
                    {
                        throw new InvalidPluginExecutionException("InvoiceDetail don`t create");
                    }
                }
                else
                {
                    break;
                }
            }

            decimal sum = (from i in invoice
                           select Convert.ToDecimal(i.Marza)).Sum();
            decimal percent = (from i in invoice
                               select Convert.ToDecimal(i.MarzaPersent)).Average();
            decimal totalUSD = (from i in invoice
                                select Convert.ToDecimal(i.totalUSD)).Sum();
            double rates = (from i in invoice
                            select Convert.ToDouble(i.exchangeRates)).Average();

            using (var orgContext = new OrganizationServiceContext(service))
            {
                var invoiceMain = (from y in orgContext.CreateQuery<Invoice>()
                                 where y.Id == annotation.ObjectId.Id
                                 select y).FirstOrDefault();

                var updateInvoice = new Invoice()
                {
                    Id = annotation.ObjectId.Id,
                    //new_marginUSD = invoiceMain.new_marginUSD + (double)sum,
                    //new_morginpercentage = percent == 0 ? 0 : (invoiceMain.new_morginpercentage ?? 0 + percent),
                    new_USD = invoiceMain.new_USD + (double)totalUSD,
                    //new_exchangerate = invoiceMain.new_exchangerate ?? 0 + rates
                };

                service.Update(updateInvoice);
            }
        }
    }
}
