using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Excel;
using Microsoft.Xrm.Sdk;

namespace ExcelfromAnnotation.Service
{
    class ExcelReader
    {
        public DataSet ExcelOpenSpreadsheets(object document, string nameFile)
        {
            try
            {
                var inMemoryFile = Convert.FromBase64String(document.ToString());
                var theMemStream = new MemoryStream();
                theMemStream.Write(inMemoryFile, 0, inMemoryFile.Length);

                string fileExtension = Path.GetExtension(nameFile);

                IExcelDataReader excelReader = null;

                switch (fileExtension)
                {
                    case ".xlsx":
                        excelReader = ExcelReaderFactory.CreateOpenXmlReader(theMemStream);
                        break;
                    case ".xls":
                        excelReader = ExcelReaderFactory.CreateBinaryReader(theMemStream);
                        break;
                    default:
                        return null;
                }
                DataSet tableExcel = excelReader.AsDataSet();
                excelReader.Close();

                return tableExcel;
            }
            catch(Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
