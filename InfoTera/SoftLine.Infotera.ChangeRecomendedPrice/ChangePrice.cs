namespace SoftLine.Infotera.ChangeRecomendedPrice
{
    using System;
    using Microsoft.Xrm.Sdk;
    using Microsoft.Xrm.Sdk.Client;
    using System.Collections.Generic;
    using System.Linq;

    /// <summary>
    /// Main class
    /// </summary>
    public class ChangePrice : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext) serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory) serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);

            Entity _correntEntity;

            using ( var orgContext = new OrganizationServiceContext(service) )
            {
                if ( context.MessageName.ToLower() == "create" )
                {
                    _correntEntity = (Entity) context.InputParameters["Target"];
                }
                else if ( context.MessageName.ToLower() == "update" )
                {
                    _correntEntity = context.PostEntityImages["Post"];
                }
                else
                {
                    return;
                }

                new_aprove_price _proxyentity = _correntEntity.ToEntity<new_aprove_price>();

                if ( _proxyentity.new_cropid == null ||
                    _proxyentity.new_approve == false )
                {
                    return;
                }

                if ( _proxyentity.new_recom_purchase_price_nikolaev == null &&
                    _proxyentity.new_recom_purchase_price_odessa == null )
                {
                    return;
                }

                List<new_port> _portList = (from port in orgContext.CreateQuery<new_port>()
                                            where port.new_name == "Одеса" ||
                                            port.new_name == "Миколаїв"
                                            select port).ToList();

                PurchaseOrderUpdateMethod(_proxyentity, _portList, orgContext, service);
                PurchaseTaskUpdateMethod(_proxyentity, _portList, orgContext, service);
                PurchaseCropUpdateMethod(_proxyentity, _portList, orgContext, service);
                PurchaseDealUpdateMethod(_proxyentity, _portList, orgContext, service);
            }
        }

        private void PurchaseDealUpdateMethod(new_aprove_price _proxyentity, List<new_port> _portList, OrganizationServiceContext orgContext, IOrganizationService service)
        {
            List<new_purchase_deal> _cdealListForUpdate = (from i in orgContext.CreateQuery<new_purchase_deal>()
                                                           where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                           (i.new_purchase_deal_stage == new OptionSetValue(100000000) ||
                                                           i.new_purchase_deal_stage == new OptionSetValue(100000002) ||
                                                           i.new_purchase_deal_stage == new OptionSetValue(100000001)) &&
                                                           i.new_opportunity_status == new OptionSetValue(100000000)
                                                           select i).ToList();

            foreach ( var item in _cdealListForUpdate )
            {
                new_purchase_deal _updateDeal = new new_purchase_deal();
                _updateDeal.Id = item.Id;
                if ( item.new_ship_portid == null )
                    continue;
                if ( _portList.Where(x => x.Id == item.new_ship_portid.Id)?.FirstOrDefault()?.new_name == "Одеса" )
                {
                    _updateDeal.new_recommended_price = _proxyentity.new_recom_purchase_price_odessa;
                }
                else if ( _portList.Where(x => x.Id == item.new_ship_portid.Id)?.FirstOrDefault()?.new_name == "Миколаїв" )
                {
                    _updateDeal.new_recommended_price = _proxyentity.new_recom_purchase_price_nikolaev;
                }
                service.Update(_updateDeal);
            }
        }

        private void PurchaseCropUpdateMethod(new_aprove_price _proxyentity, List<new_port> _portList, OrganizationServiceContext orgContext, IOrganizationService service)
        {
            List<Guid> _cropListForUpdate = (from i in orgContext.CreateQuery<new_purchase_crop>()
                                             where i.new_crop.Id == _proxyentity.new_cropid.Id &&
                                             i.new_offer_status == new OptionSetValue(100000000)
                                             select i.Id).ToList();

            foreach ( var item in _cropListForUpdate )
            {
                new_purchase_crop _updateCrop = new new_purchase_crop();
                _updateCrop.Id = item;
                _updateCrop.new_recom_price_mykolaiv = _proxyentity.new_recom_purchase_price_nikolaev;
                _updateCrop.new_recom_price_odesa = _proxyentity.new_recom_purchase_price_odessa;
                service.Update(_updateCrop);
            }
        }

        private void PurchaseTaskUpdateMethod(new_aprove_price _proxyentity, List<new_port> _portList, OrganizationServiceContext orgContext, IOrganizationService service)
        {
            List<new_purchase_task> _taskListForUpdate = (from i in orgContext.CreateQuery<new_purchase_task>()
                                                          where i.new_product.Id == _proxyentity.new_cropid.Id &&
                                                          i.new_status == new OptionSetValue(100000000)
                                                          select i).ToList();

            foreach ( var item in _taskListForUpdate )
            {
                new_purchase_task _updateTask = new new_purchase_task();
                _updateTask.Id = item.Id;
                if ( item.new_port == null )
                    continue;
                if ( _portList.Where(x => x.Id == item.new_port.Id).FirstOrDefault().new_name == "Одеса" )
                {
                    _updateTask.new_aprove_purchase_price = _proxyentity.new_recom_purchase_price_odessa;
                }
                else if ( _portList.Where(x => x.Id == item.new_port.Id).FirstOrDefault().new_name == "Миколаїв" )
                {
                    _updateTask.new_aprove_purchase_price = _proxyentity.new_recom_purchase_price_nikolaev;
                }
                service.Update(_updateTask);
            }
        }

        private void PurchaseOrderUpdateMethod(new_aprove_price _proxyentity, List<new_port> _portList, OrganizationServiceContext orgContext, IOrganizationService service)
        {
            List<new_purchase_order> _orderListForUpdate = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                            where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                            (i.new_status == new OptionSetValue(100000000) ||
                                                             i.new_status == new OptionSetValue(100000001))
                                                            select i).ToList();
            if ( _orderListForUpdate != null )
            {
                foreach ( var item in _orderListForUpdate )
                {
                    new_purchase_order_change _newChangeOrder = new new_purchase_order_change();
                    _newChangeOrder.new_cropid = item.new_cropid;
                    _newChangeOrder.new_purchase_price = item.new_purchase_price;
                    _newChangeOrder.new_purchase_order = new EntityReference() { Id = item.Id, LogicalName = item.LogicalName };
                    service.Create(_newChangeOrder);

                    new_purchase_order _updateOrder = new new_purchase_order();
                    _updateOrder.Id = item.Id;
                    if ( item.new_portid == null )
                        continue;
                    if ( _portList.Where(x => x.Id == item.new_portid.Id).FirstOrDefault().new_name == "Одеса" )
                    {
                        _updateOrder.new_purchase_price = _proxyentity.new_recom_purchase_price_odessa;
                    }
                    else if ( _portList.Where(x => x.Id == item.new_portid.Id).FirstOrDefault().new_name == "Миколаїв" )
                    {
                        _updateOrder.new_purchase_price = _proxyentity.new_recom_purchase_price_nikolaev;
                    }

                    service.Update(_updateOrder);
                }
            }
        }
    }
}
