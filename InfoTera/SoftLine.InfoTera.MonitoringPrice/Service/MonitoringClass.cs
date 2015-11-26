using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.InfoTera.MonitoringPrice.Proxy;
using SoftLine.Models;

namespace SoftLine.InfoTera.MonitoringPrice.Service
{
    class MonitoringClass
    {
        private IOrganizationService service
        {
            get
            {
                return new CRMConnector().Connect();
            }
        }

        public void Monitoring()
        {
            try
            {
                using (var orgContext = new OrganizationServiceContext(service))
                {
                    List<MonitoringColection> listRecords;
                    List<Product> CultivationColection = GetProductFromCRM(orgContext);
                    List<TopCollection> TopSelected;

                    listRecords = (from i in orgContext.CreateQuery<new_monitoring>()
                                   where i.statecode == new_monitoringState.Active
                                   select new MonitoringColection
                                   {
                                       MonitoringRecordId = i.Id,
                                       PriceOfNikolaev = i.new_purchase_price_nikolaev,
                                       PriceOfOdessa = i.new_purchase_price_odessa,
                                       Cultivation = i.new_cropid
                                   }).ToList();

                    if (listRecords.Count == 0 || CultivationColection.Count == 0)
                        return;

                    foreach (var item in CultivationColection)
                    {

                    }
                   // TopPriceOddesa = new TopCollection { TopPrice = listRecords.Max(x => x.PriceOfOdessa), MonitoringRecordId = listRecords.Max(x => x.MonitoringRecordId) };
                    //TopPriceNIkolaev = new TopCollection { TopPrice = listRecords.Max(x => x.PriceOfNikolaev), MonitoringRecordId = listRecords.Max(x => x.MonitoringRecordId) };
                }
            }
            catch (InvalidPluginExecutionException ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }

        private List<Product> GetProductFromCRM(OrganizationServiceContext orgContext)
        {
            return (from c in orgContext.CreateQuery<Product>()
                    select c).ToList();
        }
    }
}
