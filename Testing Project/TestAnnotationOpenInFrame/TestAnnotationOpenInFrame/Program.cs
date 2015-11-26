using System.Linq;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using System.Collections.Generic;
using System;
using System.ServiceModel.Description;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
using System.Net;
using SoftLine.Models;
using Google.GData.Client;
using Google.Documents;
using Google.Apis.Drive.v2;
using Google.Apis.Auth.OAuth2;
using System.Threading;
using Google.Apis.Util.Store;
using Google.Apis.Services;
using Google.Apis.Drive.v2.Data;

namespace TestAnnotationOpenInFrame
{
    class Program
    {
        static void Main(string[] args)
        {
            //new Program().ss();

            string UserName = @"softline\savchinvv";
            string Password = @"IH@veToBeABoss";
            var creds = new ClientCredentials();
            creds.UserName.UserName = UserName;
            creds.UserName.Password = Password;

            ServicePointManager.ServerCertificateValidationCallback = delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
            OrganizationServiceProxy serviceProxy = new OrganizationServiceProxy(new Uri(@"http://msk02crm13web06/UkraineTest13/XRMServices/2011/Organization.svc"), null, creds, null);

            serviceProxy.EnableProxyTypes();
            serviceProxy.Authenticate();
            var serviceCRM = (IOrganizationService)serviceProxy; ;
            using (var orgContext = new OrganizationServiceContext(serviceCRM))
            {
                var ann = (from q in orgContext.CreateQuery<Annotation>()
                           select q).FirstOrDefault();

                //if (!ann.IsDocument.Value || ann.ObjectId.LogicalName.ToLower() != "quote") return;

                var tempFile = SaveFile(ann.FileName, ann.DocumentBody);

                //Scopes for use with the Google Drive API
                string[] scopes = new string[] { DriveService.Scope.Drive,
                                 DriveService.Scope.DriveFile};
                // here is where we Request the user to give us access, or use the Refresh Token that was previously stored in %AppData%
                UserCredential credential =
                            GoogleWebAuthorizationBroker
                                          .AuthorizeAsync(new ClientSecrets
                                          {
                                              ClientId = @"560656622534-clntle0fod1nerinp6tp9o0ovdnnq570.apps.googleusercontent.com"
                                          ,
                                              ClientSecret = "zkYePr5TCLt9JwL9gSJGd5PZ",
                                          }
                                                          , scopes
                                                          , Environment.UserName
                                                          , CancellationToken.None
                                                          , new FileDataStore("Daimto.GoogleDrive.Auth.Store")
                                                          ).Result;

                DriveService service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "Drive API Sample",
                });
                var file = uploadFile(service, tempFile,"Drive");
            }
        }

        private static string GetMimeType(string fileName)
        {
            string mimeType = "application/unknown";
            string ext = System.IO.Path.GetExtension(fileName).ToLower();
            Microsoft.Win32.RegistryKey regKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
            if (regKey != null && regKey.GetValue("Content Type") != null)
                mimeType = regKey.GetValue("Content Type").ToString();
            return mimeType;
        }

        public static File uploadFile(DriveService _service, string _uploadFile, string _parent)
        {

            if (System.IO.File.Exists(_uploadFile))
            {
                File body = new File();
                body.Title = System.IO.Path.GetFileName(_uploadFile);
                body.Description = "File uploaded by Diamto Drive Sample";
                body.MimeType = GetMimeType(_uploadFile);
                body.Parents = new List<ParentReference>() { new ParentReference() { Id = _parent } };

                // File's content.
                byte[] byteArray = System.IO.File.ReadAllBytes(_uploadFile);
                System.IO.MemoryStream stream = new System.IO.MemoryStream(byteArray);
                try
                {
                    FilesResource.InsertMediaUpload request = _service.Files.Insert(body, stream, GetMimeType(_uploadFile));
                    request.Upload();
                    return request.ResponseBody;
                }
                catch (Exception e)
                {
                    Console.WriteLine("An error occurred: " + e.Message);
                    return null;
                }
            }
            else
            {
                Console.WriteLine("File does not exist: " + _uploadFile);
                return null;
            }

        }


        private static string SaveFile(string fileName, string noteBody)
        {
            string outputFileName = @"C:\Users\savchinvv\Desktop\" + fileName;

            if (!string.IsNullOrEmpty(noteBody))
            {
                // Download the attachment in the current execution folder.
                byte[] fileContent = Convert.FromBase64String(noteBody);
                System.IO.File.WriteAllBytes(outputFileName, fileContent);
            }
            else
            {
                throw new InvalidPluginExecutionException("File content is empty or cannot be retrieved");
            }

            return outputFileName;
        }

        private void ss()
        {
            GDataCredentials credentials = new GDataCredentials("pro100ham@gmail.com", "198ytdblbvrfpa$$w0rd");
            RequestSettings settings = new RequestSettings("Testing", credentials);
            settings.AutoPaging = true;
            settings.PageSize = 100;
            DocumentsRequest documentsRequest = new DocumentsRequest(settings);
            Feed<Document> documentFeed = documentsRequest.GetDocuments();

            Document doc = new Document();
            foreach (Document document in documentFeed.Entries)
            {
            }

            documentsRequest.CreateDocument(new Document());
        }
    }
}
