using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using OfficeOpenXml;

namespace UploadPricelist
{
    public class PricelistProcessor
    {
        private static string MANUFACTURER_CELL_ADDRESS = "A3";
        private static string CREATEDON_CELL_ADDRESS = "F2";
        private static string PRICELIST_NAME_CELL_ADDRESS = "F3";
        private static string VENDOR_CELL_ADDRESS = "F1";

        private static int dbgCounter;

        private Stream stream;
        //private IFile uploadedFile;

        public PricelistProcessor(Stream stream)
        {
            this.stream = stream;

            var crmAssembly = new CrmAssembly();

            var package = new ExcelPackage(stream);
            //string filePath = args[0]; 
            //string filePath = "..\\..\\ABBYY_ManagerSoftLine.xlsx";
            //string filePath = "..\\..\\FileMaker_ManagerSoftLine.xlsx";
            //string filePath = "..\\..\\Embarcadero_ManagerSoftLine.xlsx";

            //var existingFile = new FileInfo(filePath);

            // Open and read the XlSX file.
            //package = new ExcelPackage(stream);

            // Get the work book in the file
            ExcelWorkbook workBook = package.Workbook;

            if (workBook == null)
            {
                return;
            }

            if (workBook.Worksheets.Count == 0)
            {
                return;
            }

            // Get the first worksheet
            ExcelWorksheet currentWorksheet = workBook.Worksheets.First();

            var productList = new List<IntermidiateProduct>();

            string Vendor = currentWorksheet.Cells[VENDOR_CELL_ADDRESS].Value.ToString();
            string Manufacturer = currentWorksheet.Cells[MANUFACTURER_CELL_ADDRESS].Value.ToString();
            string PricelistName = currentWorksheet.Cells[PRICELIST_NAME_CELL_ADDRESS].Value.ToString();
            DateTime CreatedOn =
                DateTime.FromOADate(Double.Parse(currentWorksheet.Cells[CREATEDON_CELL_ADDRESS].Value.ToString()));

            // Check to see if this same pricelist was allready uploaded.
            // We do this by getting a product of the same Vendor modified latest and comparing CreatedOn field to CreatedOn variable.

            //DateTime createdOnInCrm = crmAssembly.GetPricelistUpdateOnDateFromProductOfManufacturer(Manufacturer);
            DateTime createdOnInCrm = DateTime.Now.AddYears(-3);
            if (CreatedOn.ToUniversalTime() <= createdOnInCrm)
            {
                // This price-list is older than the one uploaded
                return;
            }

            ExcelRangeBase pnHeaderCell =
                currentWorksheet.Cells.Where(x => x.Value != null)
                                .Where(x => x.Value.ToString().Contains("SoftLineSKU"))
                                .FirstOrDefault();

            string currentRowStartAddress = getAddressOnTheBottom(pnHeaderCell.Address);
            string currentCellAddress = currentRowStartAddress;
            string borderStyle = "None";
            while (borderStyle == "None")
            {
                var product = new IntermidiateProduct();

                currentRowStartAddress = getAddressOnTheBottom(currentRowStartAddress);
                currentCellAddress = currentRowStartAddress;

                borderStyle = currentWorksheet.Cells[currentCellAddress].Style.Border.Bottom.Style.ToString();

                int cellColorIndex = currentWorksheet.Cells[currentCellAddress].Style.Fill.PatternColor.Indexed;
                if (cellColorIndex != 0)
                {
                    continue;
                }

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.SoftLineSku = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.VendorSku = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.SoftLineProductFamily = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.ProducFamily = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.ProductDescription = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.Version = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.Language = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.FullOrUpdate = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.BoxOrLicense = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.AeOrCom = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.Media = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.Os = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.LicenseLevel = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);
                currentCellAddress = getAddressOnTheRight(currentCellAddress);
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    try
                    {
                        product.SprPrice = Decimal.Parse(currentWorksheet.Cells[currentCellAddress].Value.ToString());
                    }
                    catch (Exception)
                    {
                    }
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    try
                    {
                        product.PdrPrice = Decimal.Parse(currentWorksheet.Cells[currentCellAddress].Value.ToString());
                    }
                    catch (Exception)
                    {
                    }
                }

                currentCellAddress = getAddressOnTheRight(currentCellAddress);
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    try
                    {
                        product.Retail1Frm = Decimal.Parse(currentWorksheet.Cells[currentCellAddress].Value.ToString());
                    }
                    catch (Exception)
                    {
                    }
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    try
                    {
                        product.Retail2Frm = Decimal.Parse(currentWorksheet.Cells[currentCellAddress].Value.ToString());
                    }
                    catch (Exception)
                    {
                    }
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.Type = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    try
                    {
                        product.VatPercent = Decimal.Parse(currentWorksheet.Cells[currentCellAddress].Value.ToString());
                    }
                    catch (Exception)
                    {
                    }
                }
                currentCellAddress = getAddressOnTheRight(currentCellAddress);

                if (currentWorksheet.Cells[currentCellAddress].Value != null)
                {
                    product.Currency = currentWorksheet.Cells[currentCellAddress].Value.ToString();
                }

                if (!product.IsEmpty())
                {
                    product.Vendor = Vendor;
                    product.Manufacturer = Manufacturer;
                    product.CreatedOn = CreatedOn;
                    product.PricelistName = PricelistName;
                    productList.Add(product);
                }

                Console.WriteLine("parsing product {0}", dbgCounter++);
            }
            package.Dispose();


            crmAssembly.CreateProducts(productList);
        }


        private static string getAddressOnTheBottom(string address)
        {
            string result = "";
            string pnAddress = address;
            string row = pnAddress[0].ToString();
            int column = int.Parse(pnAddress.Substring(1));
            column++;
            result = row + column.ToString();
            return result;
        }

        private static string getAddressOnTheRight(string address)
        {
            string result = "";
            string pnAddress = address;
            char row = pnAddress[0];
            row++;
            int column = int.Parse(pnAddress.Substring(1));
            result = row.ToString() + column.ToString();
            return result;
        }
    }
}