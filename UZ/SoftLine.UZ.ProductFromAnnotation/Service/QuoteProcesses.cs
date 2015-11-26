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

namespace SoftLine.UZ.ProductFromAnnotation
{
    public class QuoteProcesses
    {
        public void Processes(Annotation annotation, IOrganizationService service)
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var quoteMain = (from y in orgContext.CreateQuery<Quote>()
                                 where y.Id == annotation.ObjectId.Id
                                 select y).FirstOrDefault();

                var exel = new ExcelReader().ExcelOpenSpreadsheets(annotation.DocumentBody.ToString(),
                          annotation.FileName.ToString());

                if (exel == null) return;

                var data = new CreateNewProduct();
                List<ExcelProxyQuote> quote = new List<ExcelProxyQuote>();
                data.service = service;
                data.mainEntityId = annotation.ObjectId;

                int line = 0;
                for (var i = 0; i < exel.Tables[0].Rows.Count; i++)
                {
                    if (exel.Tables[0].Rows[i][0].ToString() == "SKU")
                    {
                        line = i;
                        break;
                    }
                }

                for (int i = line + 1; i < exel.Tables[0].Rows.Count; i++)
                {
                    var product = new ExcelProxyProduct();
                    var quotedetail = new ExcelProxyQuotedetail();

                    if (exel.Tables[0].Rows[i][1].ToString() != string.Empty && exel.Tables[0].Rows[i][0].ToString() != "Итого:")
                    {
                        product.SKU = exel.Tables[0].Rows[i][0].ToString();
                        product.Vendor = exel.Tables[0].Rows[i][1].ToString();
                        product.Product = exel.Tables[0].Rows[i][2].ToString();

                        quotedetail.Product = exel.Tables[0].Rows[i][2].ToString();
                        quotedetail.Vendor = exel.Tables[0].Rows[i][1].ToString();
                        quotedetail.SKU = exel.Tables[0].Rows[i][0].ToString();
                        quotedetail.quantity = exel.Tables[0].Rows[i][3].ToString();
                        quotedetail.priceperunit = exel.Tables[0].Rows[i][4].ToString();
                        quotedetail.baseamount = exel.Tables[0].Rows[i][5].ToString();
                        quotedetail.new_usdprice = exel.Tables[0].Rows[i][6].ToString();
                        quotedetail.new_totalpurchaseusd = exel.Tables[0].Rows[i][7].ToString();
                        quotedetail.new_koef = exel.Tables[0].Rows[i][8].ToString();
                        quotedetail.new_sellingusd = exel.Tables[0].Rows[i][9].ToString();
                        quotedetail.new_generalsellingusd = exel.Tables[0].Rows[i][10].ToString();
                        quotedetail.exchangeRates = exel.Tables[0].Rows[i][11].ToString();

                        quote.Add(new ExcelProxyQuote
                        {
                            new_usd = exel.Tables[0].Rows[i][7].ToString(),
                            new_summausd = exel.Tables[0].Rows[i][10].ToString()
                        });

                        EntityReference idProduct = data.ProductFromSpec(product, quoteMain.PriceLevelId);

                        if (idProduct == null)
                        {
                            throw new InvalidPluginExecutionException("Product not found");
                        }
                        if (data.CreateQuoteDetail(quotedetail, idProduct) == false)
                        {
                            throw new InvalidPluginExecutionException("QuoteDetail don`t create");
                        }
                    }
                    else
                    {
                        break;
                    }
                }

                double usd = (from i in quote
                              select Convert.ToDouble(i.new_usd)).Sum();
                double summusd = (from i in quote
                                  select Convert.ToDouble(i.new_summausd)).Sum();

                var updateQuote = new Quote()
                    {
                        Id = annotation.ObjectId.Id,
                        new_usd = usd,
                        new_summausd = summusd
                    };

                service.Update(updateQuote);
            }
        }
    }
}
