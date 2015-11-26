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
    public class Main : IPlugin
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
                    //case "invoice":
                    //    new InvoiceProcesses().Processes(annotation, service);
                    //    break;
                    default:
                        return;
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
