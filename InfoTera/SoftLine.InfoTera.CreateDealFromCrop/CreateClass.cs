using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SoftLine.InfoTera.CreateDealFromCrop
{
    public class CreateClass : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext) serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory) serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);

            if ( context.MessageName.ToLower() != "update" )
                return;

            var _preImage = context.PreEntityImages["Pre"];
            var _postImage = context.PostEntityImages["Post"];

        }
    }
}
