using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UA.SetAgreementValue
{
    public class SetAgreements : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                Entity entity = (Entity)context.PostEntityImages["Post"];
                new_coordinationcontract agreementEntity = entity.ToEntity<new_coordinationcontract>();

                if (agreementEntity.new_contrsctorder.Id == null ||
                    agreementEntity.new_contrsctorder.Id == Guid.Empty) return;

                SalesOrder updateOrder = new SalesOrder();

                updateOrder.Id = agreementEntity.new_contrsctorder.Id;

                updateOrder.new_articipationof = agreementEntity.new_participationof;
                updateOrder.new_agreed= agreementEntity.new_agreed_fd;
                updateOrder.new_Dateofcoordination = agreementEntity.new_datecoordinationlac;

                updateOrder.new_participationlaw= agreementEntity.new_participationlaw;
                updateOrder.new_agreedlaw= agreementEntity.new_agreed_ld;
                updateOrder.new_Dateofcoordinationlaw= agreementEntity.new_Datecoordinationlaw;

                updateOrder.new_participationlo = agreementEntity.new_participationlo;
                updateOrder.new_agreedlog = agreementEntity.new_agreed_dd;
                updateOrder.new_Dateofcoordinationlog = agreementEntity.new_Datecoordinationlog;

                updateOrder.new_participationob = agreementEntity.new_participationob;
                updateOrder.new_agreed_ac = agreementEntity.new_agreed_ac;
                updateOrder.new_datecoordinationlac = agreementEntity.new_datecoordinationlac;

                updateOrder.new_participationsp = agreementEntity.new_participationsp;
                updateOrder.new_agreed_sd = agreementEntity.new_agreed_sd;
                updateOrder.new_datecoordinationsd = agreementEntity.new_datecoordinationsd;

                service.Update(updateOrder);
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
