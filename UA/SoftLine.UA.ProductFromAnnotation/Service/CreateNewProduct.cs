using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ExcelfromAnnotation.Proxy;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace ExcelfromAnnotation.Service
{
    class CreateNewProduct
    {
        public IOrganizationService service { get; set; }

        public EntityReference mainEntityId { get; set; }

        public EntityReference ProductFromSpec(ExcelProxyProduct product)
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var finder = (from c in orgContext.CreateQuery<Product>()
                              where c.ProductNumber == product.SKU
                              select c).FirstOrDefault();

                if (finder != null)
                {
                    var entityProduct = new Product()
                    {
                        Id = finder.Id,
                        ProductNumber = product.SKU,
                        Name = product.Product,
                        Price = new Money(Convert.ToDecimal(product.recomendetPriceUSD)),
                        DefaultUoMScheduleId = (from i in orgContext.CreateQuery<UoMSchedule>()
                                                where i.Name == "Единица измерения по умолчанию"
                                                // where i.Id == new Guid("AFB0C13B-11DA-49D0-8767-A71F1AA593BF")//Единица измерения по умолчанию name
                                                select new EntityReference
                                                {
                                                    Id = i.Id,
                                                    LogicalName = i.LogicalName,
                                                    Name = i.Name
                                                }).FirstOrDefault(),

                        DefaultUoMId = (from i in orgContext.CreateQuery<UoM>()
                                        where i.Name == "Базовая единица"
                                        //where i.Id == new Guid("28FD5C9C-22F7-419C-BBBC-720523DD3666") //Базовая единица
                                        select new EntityReference
                                        {
                                            Id = i.Id,
                                            LogicalName = i.LogicalName,
                                            Name = i.Name
                                        }).FirstOrDefault(),
                        new_manufacturer = findVendor(product.Vendor)
                    };

                    try
                    {
                        service.Update(entityProduct);
                        return new EntityReference
                        {
                            Id = entityProduct.Id,
                            Name = entityProduct.Name,
                            LogicalName = entityProduct.LogicalName
                        };
                    }
                    catch
                    {
                        return null;
                    }
                }
                else
                {
                    return CreateProduct(product);
                }
            }
        }

        public EntityReference CreateProduct(ExcelProxyProduct product)
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {

                Product entityProduct = new Product()
                {
                    Id = Guid.NewGuid(),
                    ProductNumber = product.SKU,
                    Name = product.Product,
                    Price = new Money(Convert.ToDecimal(product.recomendetPriceUSD)),
                    DefaultUoMScheduleId = (from i in orgContext.CreateQuery<UoMSchedule>()
                                            where i.Name == "Единица измерения по умолчанию"
                                            //where i.Id == new Guid("AFB0C13B-11DA-49D0-8767-A71F1AA593BF")
                                            select new EntityReference
                                            {
                                                Id = i.Id,
                                                LogicalName = i.LogicalName,
                                                Name = i.Name
                                            }).FirstOrDefault(),

                    DefaultUoMId = (from i in orgContext.CreateQuery<UoM>()
                                    where i.Name == "Базовая единица"
                                    //where i.Id == new Guid("28FD5C9C-22F7-419C-BBBC-720523DD3666")
                                    select new EntityReference
                                    {
                                        Id = i.Id,
                                        LogicalName = i.LogicalName,
                                        Name = i.Name
                                    }).FirstOrDefault(),
                    new_manufacturer = findVendor(product.Vendor)
                };

                try
                {
                    ///////////////////////////////////////     
                    Guid idNewProduct = service.Create(entityProduct);

                    var productPriceLevel = new ProductPriceLevel()
                    {
                        PriceLevelId = (from i in orgContext.CreateQuery<PriceLevel>()
                                        where i.Name == "Default UAH Pricelist" //Default USD Pricelist
                                        select new EntityReference
                                        {
                                            LogicalName = PriceLevel.EntityLogicalName,
                                            Id = i.Id,
                                            Name = i.Name
                                        }).FirstOrDefault(),
                        UoMId = (from i in orgContext.CreateQuery<UoM>()
                                 where i.Name == "Базовая единица"
                                 select new EntityReference
                                 {
                                     Id = i.Id,
                                     LogicalName = i.LogicalName,
                                     Name = i.Name
                                 }).FirstOrDefault(),
                        Amount = new Money(Convert.ToDecimal(product.recomendetPriceUSD)),
                        ProductId = new EntityReference
                        {
                            Id = idNewProduct,
                            LogicalName = Product.EntityLogicalName,
                            Name = product.Product
                        }
                    };

                    var idProductPriceLevel = service.Create(productPriceLevel);

                    var updateNewProduct = new Product()
                    {
                        Id = idNewProduct,
                        PriceLevelId = (from i in orgContext.CreateQuery<PriceLevel>()
                                        where i.Name == "Default USD Pricelist"
                                        select new EntityReference
                                        {
                                            LogicalName = PriceLevel.EntityLogicalName,
                                            Id = i.Id,
                                            Name = i.Name
                                        }).FirstOrDefault()
                    };
                    service.Update(updateNewProduct);

                    return new EntityReference
                    {
                        Id = idNewProduct,
                        Name = entityProduct.Name,
                        LogicalName = entityProduct.LogicalName
                    };
                    ///////////////////////////////////////

                }
                catch
                {
                    return null;
                }

            }
        }

        private EntityReference findVendor(string name)
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                EntityReference vendor = (from q in orgContext.CreateQuery<new_Vendor>()
                                          where q.new_name == name
                                          select new EntityReference
                                          {
                                              Id = q.Id,
                                              Name = q.new_name,
                                              LogicalName = q.LogicalName
                                          }).FirstOrDefault();
                if (vendor == null)
                {
                    // Create vendor
                    var newid = service.Create(new new_Vendor
                    {
                        new_name = name
                    });
                    return new EntityReference
                    {
                        Id = newid,
                        Name = name,
                        LogicalName = new_Vendor.EntityLogicalName
                    };
                }
                else
                {
                    return vendor;
                }
            }
        }

        public bool CreateQuoteDetail(ExcelProxyQuotedetail quotedetail, EntityReference product)
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var newquoteDetail = new QuoteDetail()
                {
                    ProductId = product,
                    IsPriceOverridden = true,
                    Quantity = Convert.ToInt32(quotedetail.Count),
                    PricePerUnit = new Money(Convert.ToDecimal(quotedetail.priceForOneHRN)),
                    new_priceprocurementUAH = new Money(Convert.ToDecimal(quotedetail.buyPriceHRN)),
                    new_totalpurchaseUAH = new Money(Convert.ToDecimal(quotedetail.buyPriceAllHRN)),
                    new_pricepurchaseusd = Convert.ToDouble(quotedetail.buyPriceAllUSD),
                    QuoteId = mainEntityId,
                    new_kursspeka = Convert.ToDouble(quotedetail.exchangeRates),
                    new_viborkurs = new OptionSetValue(100000003),
                    new_totalpurchaseusd = Convert.ToDouble(quotedetail.totalUSD),
                    UoMId = (from i in orgContext.CreateQuery<UoM>()
                             where i.Name == "Базовая единица"
                             //where i.Id == new Guid("28FD5C9C-22F7-419C-BBBC-720523DD3666")
                             select new EntityReference
                             {
                                 Id = i.Id,
                                 LogicalName = i.LogicalName,
                                 Name = i.Name
                             }).FirstOrDefault()
                };

                try
                {
                    service.Create(newquoteDetail);
                }
                catch (Exception ex)
                {
                    throw new InvalidPluginExecutionException(ex.Message);
                }
            }
            return true;
        }

        public bool CreateInvoiceDetail(ExcelProxyInvoiceDetail invoicedetail, EntityReference product)
        {
            using (var orgContext = new OrganizationServiceContext(service))
            {
                var newinvoiceeDetail = new InvoiceDetail()
                {
                    ProductId = product,
                    IsPriceOverridden = true,
                    Quantity = Convert.ToInt32(invoicedetail.Count),
                    PricePerUnit = new Money(Convert.ToDecimal(invoicedetail.Priceperunit)),
                    new_purchaseprice = new Money(Convert.ToDecimal(invoicedetail.Purchaseprice)),
                    new_amountpurchase = new Money(Convert.ToDecimal(invoicedetail.Amountpurchase)),
                    new_pricepurchaseusd = Convert.ToDouble(invoicedetail.Pricepurchaseusd),
                    InvoiceId = mainEntityId,
                    new_kursspeka = Convert.ToDouble(invoicedetail.Exchangerates),
                    new_viborkurs = new OptionSetValue(100000003),
                    new_totalpurchaseusd = Convert.ToDouble(invoicedetail.totalUSD),
                    UoMId = (from i in orgContext.CreateQuery<UoM>()
                             where i.Name == "Базовая единица"
                             //where i.Id == new Guid("28FD5C9C-22F7-419C-BBBC-720523DD3666")
                             select new EntityReference
                             {
                                 Id = i.Id,
                                 LogicalName = i.LogicalName,
                                 Name = i.Name
                             }).FirstOrDefault()
                };

                try
                {
                    service.Create(newinvoiceeDetail);
                }
                catch (Exception ex)
                {
                    throw new InvalidPluginExecutionException(ex.Message);
                }
            }
            return true;
        }
    }
}
