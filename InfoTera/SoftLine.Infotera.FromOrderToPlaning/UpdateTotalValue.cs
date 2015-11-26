using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SoftLine.Infotera.FromOrderToPlaning
{
    public class UpdateTotalValue : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);

            switch (context.MessageName.ToLower())
            {
                case "create":
                    CreateMethod(context, service);
                    break;
                case "update":
                    UpdateMethod(context, service);
                    break;
                case "delete":
                    DeleteMethod(context, service);
                    break;
                default:
                    return;
            }
        }
        private void DeleteMethod(IPluginExecutionContext context, IOrganizationService service)
        {
            bool _havePlan = false;
            Entity _correntEntity;

            using (var orgContext = new OrganizationServiceContext(service))
            {
                _correntEntity = (Entity)context.PreEntityImages["Pre"];
                new_purchase_order _proxyentity = _correntEntity.ToEntity<new_purchase_order>();
                if (_proxyentity.new_cropid == null || _proxyentity.new_volume == null || _proxyentity.new_volume.Value == 0 || _proxyentity.new_approve_purchase_order == false || _proxyentity.new_yearid == null)
                    return;

                _havePlan = _proxyentity.new_line_planningid == null ? false : true;

                EntityReference _planingToUpdate = FindPlaning(orgContext, _proxyentity.new_cropid, _proxyentity.new_yearid);

                if (_planingToUpdate != null)
                {
                    double? _sumOfVolume = (from i in orgContext.CreateQuery<new_purchase_order>()
                                            where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                            i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                            i.new_status != new OptionSetValue(100000002) &&
                                            i.new_approve_purchase_order == true
                                            select i.new_volume).ToList().Sum();

                    _sumOfVolume = _sumOfVolume - _proxyentity.new_volume;

                    new_line_purchase_planning _UpdatePlan = new new_line_purchase_planning()
                    {
                        Id = _planingToUpdate.Id,
                        new_total_volume_tn = _sumOfVolume
                    };

                    List<new_port> _portList = (from port in orgContext.CreateQuery<new_port>()
                                                where port.new_name == "Одеса" ||
                                                port.new_name == "Миколаїв"
                                                select port).ToList();

                    foreach (var item in _portList)
                    {
                        double? _sumOfVolumeFromPort = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                        where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                        i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                                        i.new_status != new OptionSetValue(100000002) &&
                                                        i.new_portid.Id == item.Id &&
                                            i.new_approve_purchase_order == true
                                                        select i.new_volume).ToList().Sum();
                        if (item.new_name == "Одеса")
                        {
                            _UpdatePlan.new_volume_Odesa = _sumOfVolumeFromPort;
                        }
                        else if (item.new_name == "Миколаїв")
                        {
                            _UpdatePlan.new_volume_Mykolaiv = _sumOfVolumeFromPort;
                        }
                    }

                    service.Update(_UpdatePlan);
                }
            }
        }

        private void UpdateMethod(IPluginExecutionContext context, IOrganizationService service)
        {
            //Проверяем статус на анульовано и удаляем количество с общего плана 
            if (WillChangeStatus(context, service))
            {
                return;
            }

            bool _havePlan = false;
            Entity _correntEntity;

            using (var orgContext = new OrganizationServiceContext(service))
            {
                _correntEntity = (Entity)context.PostEntityImages["Post"];
                new_purchase_order _proxyentity = _correntEntity.ToEntity<new_purchase_order>();
                if (_proxyentity.new_cropid == null || _proxyentity.new_volume == null || _proxyentity.new_volume.Value == 0 || _proxyentity.new_approve_purchase_order == false || _proxyentity.new_yearid == null)
                    return;

                _havePlan = _proxyentity.new_line_planningid == null ? false : true;

                EntityReference _planingToUpdate = FindPlaning(orgContext, _proxyentity.new_cropid, _proxyentity.new_yearid);

                if (_planingToUpdate != null)
                {
                    double? _sumOfVolume = (from i in orgContext.CreateQuery<new_purchase_order>()
                                            where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                            i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                            i.new_status != new OptionSetValue(100000002) &&
                                            i.new_approve_purchase_order == true
                                            select i.new_volume).ToList().Sum();


                    new_line_purchase_planning _UpdatePlan = new new_line_purchase_planning()
                    {
                        Id = _planingToUpdate.Id,
                        new_total_volume_tn = _sumOfVolume
                    };

                    List<new_port> _portList = (from port in orgContext.CreateQuery<new_port>()
                                                where port.new_name == "Одеса" ||
                                                port.new_name == "Миколаїв"
                                                select port).ToList();

                    foreach (var item in _portList)
                    {
                        double? _sumOfVolumeFromPort = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                        where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                        i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                                        i.new_status != new OptionSetValue(100000002) &&
                                                        i.new_portid.Id == item.Id &&
                                            i.new_approve_purchase_order == true
                                                        select i.new_volume).ToList().Sum();
                        if (item.new_name == "Одеса")
                        {
                            _UpdatePlan.new_volume_Odesa = _sumOfVolumeFromPort;
                        }
                        else if (item.new_name == "Миколаїв")
                        {
                            _UpdatePlan.new_volume_Mykolaiv = _sumOfVolumeFromPort;
                        }
                    }

                    service.Update(_UpdatePlan);
                }
                else
                {
                    double? _sumOfVolume = (from i in orgContext.CreateQuery<new_purchase_order>()
                                            where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                            i.new_status != new OptionSetValue(100000002)
                                            select i.new_volume).ToList().Sum();

                    new_line_purchase_planning _createPlan = new new_line_purchase_planning()
                    {
                        new_total_volume_tn = _sumOfVolume,
                        new_cropid = _proxyentity.new_cropid,
                        new_planningid = _proxyentity.new_yearid
                    };

                    List<new_port> _portList = (from port in orgContext.CreateQuery<new_port>()
                                                where port.new_name == "Одеса" ||
                                                port.new_name == "Миколаїв"
                                                select port).ToList();

                    foreach (var item in _portList)
                    {
                        double? _sumOfVolumeFromPort = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                        where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                        i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                                        i.new_status != new OptionSetValue(100000002) &&
                                                        i.new_portid.Id == item.Id &&
                                                        i.new_approve_purchase_order == true
                                                        select i.new_volume).ToList().Sum();

                        if (item.new_name == "Одеса")
                        {
                            _createPlan.new_volume_Odesa = _sumOfVolumeFromPort;
                        }
                        else if (item.new_name == "Миколаїв")
                        {
                            _createPlan.new_volume_Mykolaiv = _sumOfVolumeFromPort;
                        }
                    }

                    Guid _newRecordId = service.Create(_createPlan);
                    _proxyentity.new_line_planningid = new EntityReference() { Id = _newRecordId, LogicalName = new_line_purchase_planning.EntityLogicalName };
                }
            }
        }

        private bool WillChangeStatus(IPluginExecutionContext context, IOrganizationService service)
        {
            var _pre = (Entity)context.PreEntityImages["Pre"];
            var _post = (Entity)context.PostEntityImages["Post"];

            if (_pre.GetAttributeValue<OptionSetValue>("new_staus")?.Value == _post.GetAttributeValue<OptionSetValue>("new_staus")?.Value)
            {
                //Status  небыл обновлен 
                return false;
            }
            else if
               (_pre.GetAttributeValue<OptionSetValue>("new_staus")?.Value != _post.GetAttributeValue<OptionSetValue>("new_staus")?.Value &&
               _post.GetAttributeValue<OptionSetValue>("new_staus")?.Value == 100000002)
            {
                DeleteMethod(context, service);
                return true;
            }
            else
            {
                return false;
            }
        }

        private void CreateMethod(IPluginExecutionContext context, IOrganizationService service)
        {
            try
            {
                bool _havePlan = false;
                Entity _correntEntity;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    _correntEntity = (Entity)context.InputParameters["Target"];
                    new_purchase_order _proxyentity = _correntEntity.ToEntity<new_purchase_order>();
                    if (_proxyentity.new_cropid == null || _proxyentity.new_volume == null || _proxyentity.new_volume.Value == 0 ||
                        _proxyentity.new_approve_purchase_order != false || _proxyentity.new_yearid == null)
                    {
                        return;
                    }


                    _havePlan = _proxyentity.new_line_planningid == null ? false : true;

                    EntityReference _planingToUpdate = FindPlaning(orgContext, _proxyentity.new_cropid, _proxyentity.new_yearid);

                    if (_planingToUpdate != null)
                    {
                        double? _sumOfVolume = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                                i.new_status != new OptionSetValue(100000002) &&
                                                i.new_approve_purchase_order == true
                                                select i.new_volume).ToList().Sum();

                        new_line_purchase_planning _UpdatePlan = new new_line_purchase_planning()
                        {
                            Id = _planingToUpdate.Id,
                            new_total_volume_tn = _sumOfVolume
                        };

                        List<new_port> _portList = (from port in orgContext.CreateQuery<new_port>()
                                                    where port.new_name == "Одеса" ||
                                                    port.new_name == "Миколаїв"
                                                    select port).ToList();

                        foreach (var item in _portList)
                        {
                            double? _sumOfVolumeFromPort = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                            where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                            i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                                            i.new_status != new OptionSetValue(100000002) &&
                                                            i.new_portid.Id == item.Id &&
                                                            i.new_approve_purchase_order == true
                                                            select i.new_volume).ToList().Sum();
                            if (item.new_name == "Одеса")
                            {
                                _UpdatePlan.new_volume_Odesa = _sumOfVolumeFromPort;
                            }
                            else if (item.new_name == "Миколаїв")
                            {
                                _UpdatePlan.new_volume_Mykolaiv = _sumOfVolumeFromPort;
                            }
                        }

                        service.Update(_UpdatePlan);

                        _proxyentity.new_line_planningid = new EntityReference() { Id = _UpdatePlan.Id, LogicalName = new_line_purchase_planning.EntityLogicalName };
                    }
                    else
                    {
                        double? _sumOfVolume = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                i.new_status != new OptionSetValue(100000002)
                                                select i.new_volume).ToList().Sum();

                        new_line_purchase_planning _createPlan = new new_line_purchase_planning()
                        {
                            new_total_volume_tn = _sumOfVolume,
                            new_cropid = _proxyentity.new_cropid,
                            new_planningid = _proxyentity.new_yearid
                        };

                        List<new_port> _portList = (from port in orgContext.CreateQuery<new_port>()
                                                    where port.new_name == "Одеса" ||
                                                    port.new_name == "Миколаїв"
                                                    select port).ToList();

                        foreach (var item in _portList)
                        {
                            double? _sumOfVolumeFromPort = (from i in orgContext.CreateQuery<new_purchase_order>()
                                                            where i.new_cropid.Id == _proxyentity.new_cropid.Id &&
                                                            i.new_yearid.Id == _proxyentity.new_yearid.Id &&
                                                            i.new_status != new OptionSetValue(100000002) &&
                                                            i.new_portid.Id == item.Id &&
                                                            i.new_approve_purchase_order == true
                                                            select i.new_volume).ToList().Sum();

                            if (item.new_name == "Одеса")
                            {
                                _createPlan.new_volume_Odesa = _sumOfVolumeFromPort;
                            }
                            else if (item.new_name == "Миколаїв")
                            {
                                _createPlan.new_volume_Mykolaiv = _sumOfVolumeFromPort;
                            }
                        }

                        Guid _newRecordId = service.Create(_createPlan);
                        _proxyentity.new_line_planningid = new EntityReference() { Id = _newRecordId, LogicalName = new_line_purchase_planning.EntityLogicalName };
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }

        private EntityReference FindPlaning(OrganizationServiceContext orgContext, EntityReference new_cropid, EntityReference new_yearid)
        {
            var _searchEntity = (from c in orgContext.CreateQuery<new_line_purchase_planning>()
                                 where c.new_cropid.Id == new_cropid.Id &&
                                 c.new_planningid.Id == new_yearid.Id
                                 select c).FirstOrDefault();

            return _searchEntity == null ? null : _searchEntity.ToEntityReference();

        }
    }
}
