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
using SoftLine.UA.ProductFromAnnotation.Service;

namespace SoftLine.UA.ProductFromAnnotation
{
    public class MainClass : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                if (context.MessageName.ToLower() != "create" ||
                    context.PrimaryEntityName != Annotation.EntityLogicalName)
                    return;

                var ann = (Entity)context.InputParameters["Target"];
                Annotation annotation = ann.ToEntity<Annotation>();

                if (!annotation.IsDocument.Value)
                    return;

                switch (annotation.ObjectId.LogicalName.ToLower())
                {
                    case "quote":
                        new QuoteProcesses().Processes(annotation, service);
                        break;
                    case "invoice":
                        new InvoiceProcesses().Processes(annotation, service);
                        break;
                    default:
                        return;
                }
                #region OldProcesses
                //if (annotation.ObjectId.LogicalName.ToLower() == "quote")
                //{
                //    new QuoteProcesses().Processes(annotation, service);
                //}

                //var exel = new ExcelReader().ExcelOpenSpreadsheets(annotation.DocumentBody.ToString(),
                //    annotation.FileName.ToString());

                //if (exel == null) return;

                //if (exel.Tables[0].Rows[1][0].ToString() != "SKU") return;

                //var data = new CreateNewProduct();
                //List<ExcelProxyQuote> quote = new List<ExcelProxyQuote>();
                //data.service = service;
                //data.mainQuoteId = new EntityReference
                //{
                //    Id = ann.GetAttributeValue<EntityReference>("objectid").Id,
                //    LogicalName = ann.GetAttributeValue<EntityReference>("objectid").LogicalName,
                //    Name = ann.GetAttributeValue<EntityReference>("objectid").Name
                //};

                //for (int i = 2; i < exel.Tables[0].Rows.Count; i++)
                //{
                //    var product = new ExcelProxyProduct();
                //    var quotedetail = new ExcelProxyQuotedetail();

                //    if (exel.Tables[0].Rows[i][0].ToString() != string.Empty)
                //    {
                //        product.SKU = exel.Tables[0].Rows[i][0].ToString();
                //        product.Vendor = exel.Tables[0].Rows[i][1].ToString();
                //        product.recomendetPriceUSD = exel.Tables[0].Rows[i][10].ToString();
                //        product.Product = exel.Tables[0].Rows[i][2].ToString();

                //        quotedetail.Product = exel.Tables[0].Rows[i][2].ToString();
                //        quotedetail.Count = exel.Tables[0].Rows[i][3].ToString();
                //        quotedetail.priceForOneHRN = exel.Tables[0].Rows[i][4].ToString();
                //        quotedetail.priceAllHRN = exel.Tables[0].Rows[i][5].ToString();
                //        quotedetail.buyPriceHRN = exel.Tables[0].Rows[i][6].ToString();
                //        quotedetail.buyPriceAllHRN = exel.Tables[0].Rows[i][7].ToString();
                //        quotedetail.buyPriceAllUSD = exel.Tables[0].Rows[i][11].ToString();
                //        quotedetail.exchangeRates = exel.Tables[0].Rows[i][12].ToString();

                //        quote.Add(new ExcelProxyQuote
                //        {
                //            Marza = exel.Tables[0].Rows[i][8].ToString(),
                //            MarzaPersent = exel.Tables[0].Rows[i][9].ToString(),
                //            discount = exel.Tables[0].Rows[i][13].ToString(),
                //            discountForPartners = exel.Tables[0].Rows[i][14].ToString(),
                //            exchangeRates = exel.Tables[0].Rows[i][12].ToString()
                //        });

                //        EntityReference idProduct = data.ProductFromSpec(product);

                //        if (idProduct == null)
                //        {
                //            throw new InvalidPluginExecutionException("Product not found");
                //        }
                //        if (data.CreateQuoteDetail(quotedetail, idProduct) == false)
                //        {
                //            throw new InvalidPluginExecutionException("QuoteDetail don`t create");
                //        }
                //    }
                //    else
                //    {
                //        break;
                //    }
                //}

                //decimal sum = (from i in quote
                //               select Convert.ToDecimal(i.Marza)).Sum();
                //decimal percent = (from i in quote
                //                   select Convert.ToDecimal(i.MarzaPersent)).Average();
                //decimal discount = (from i in quote
                //                    select Convert.ToDecimal(i.discount)).Average();
                //double rates = (from i in quote
                //                select Convert.ToDouble(i.exchangeRates)).Average();

                //using (var orgContext = new OrganizationServiceContext(service))
                //{
                //    var quoteMain = (from y in orgContext.CreateQuery<Quote>()
                //                     where y.Id == annotation.ObjectId.Id
                //                     select y).FirstOrDefault();

                //    var updateQuote = new Quote()
                //    {
                //        Id = annotation.ObjectId.Id,
                //        new_marginUSD = new Money((quoteMain.new_marginUSD == null ? decimal.Zero : quoteMain.new_marginUSD.Value) + sum),
                //        new_morginpercentage = percent == 0 ? 0 : (quoteMain.new_morginpercentage ?? 0 + percent) * 100,
                //        new_exchangerate = quoteMain.new_exchangerate ?? 0 + rates,
                //        DiscountPercentage = quoteMain.DiscountPercentage ?? 0 + discount
                //    };

                //    service.Update(updateQuote);
                //}
                #endregion
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
