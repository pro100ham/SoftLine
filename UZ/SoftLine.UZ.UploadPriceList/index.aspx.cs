using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using UploadPricelist;

namespace SoftLine.UZ.UploadPriceList
{
    public partial class index : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        protected void UploadFile(object sender, EventArgs e)
        {
            try
            {
                if (FileUpload.HasFile)
                {
                    Result.Visible = false;
                    Result.Text = string.Empty;
                    string[] validFileTypes = { "xls", "XLS", "xlsx", "XLSX" };
                    string ext = System.IO.Path.GetExtension(FileUpload.PostedFile.FileName);
                    bool isValidFile = false;
                    for (int i = 0; i < validFileTypes.Length; i++)
                    {
                        if (ext == "." + validFileTypes[i])
                        {
                            isValidFile = true;
                            break;
                        }
                    }

                    if (!isValidFile)
                    {
                        Result.Visible = true;
                        Result.Text = string.Format("Формат файла не соответствует Excel - {0}", FileUpload.FileName);
                        return;
                    }

                    System.ComponentModel.BackgroundWorker worker = new System.ComponentModel.BackgroundWorker();
                    worker.DoWork += new System.ComponentModel.DoWorkEventHandler(
                        delegate(object o, System.ComponentModel.DoWorkEventArgs args)
                        {
                            new PricelistProcessor(FileUpload.PostedFile.InputStream);
                        });

                    worker.RunWorkerAsync();

                    Result.Visible = true;
                    Result.Text = string.Format("Прайс отправлен в обработку - {0}", FileUpload.FileName);
                }

            }
            catch (Exception ex)
            {
                Result.Visible = true;
                Result.Text = string.Format("Error - {0} - {1}", FileUpload.FileName, ex.Message);
            }
        }
    }
}