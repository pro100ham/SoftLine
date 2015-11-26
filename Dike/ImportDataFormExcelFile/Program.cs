using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ImportDataFormExcelFile;
using Excel;
using System.Data;
using SoftLine.Models;
using Microsoft.Xrm.Client.Services;
using Microsoft.Xrm.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;

namespace ImportDataFormExcelFile
{
    class Program
    {
        static CrmConnection connection = CrmConnection.Parse("Url=https://dikecrm.crm4.dynamics.com; Username=vitaliy@dikecrm.onmicrosoft.com; Password=KirillX6?;");

        static void Main(string[] args)
        {
            СозданиеЗадач();
        }

        private static void СозданиеЗадач() //  < ----- )))))))))))))))))))))))))
        {
            var service = new OrganizationService(connection);
            var dataFromXmlx = new Program().ExcelOpenSpreadsheets(@"C:\Users\savchinvv\Desktop\Задачи.xlsx");

            for (int i = 2; i < dataFromXmlx.Tables[0].Rows.Count; i++)
            {
                var newTask = new SoftLine.Models.Task()
                {
                    Subject = dataFromXmlx.Tables[0].Rows[i][0].ToString(),
                    RegardingObjectId = ToSpravaEntity(dataFromXmlx.Tables[0].Rows[i][1].ToString()),
                    PriorityCode = ToOptionSetValue(dataFromXmlx.Tables[0].Rows[i][2].ToString()),
                    ScheduledEnd = FindDate(dataFromXmlx.Tables[0].Rows[i][3].ToString()),
                    ScheduledStart = FindDate(dataFromXmlx.Tables[0].Rows[i][4].ToString()),
                    ActualDurationMinutes = ToInt32(dataFromXmlx.Tables[0].Rows[i][5].ToString()),
                    Description = dataFromXmlx.Tables[0].Rows[i][6].ToString(),
                    PercentComplete = ToInt32(dataFromXmlx.Tables[0].Rows[i][7].ToString()),
                    ActualStart = FindDate(dataFromXmlx.Tables[0].Rows[i][9].ToString()),
                    ActualEnd = FindDate(dataFromXmlx.Tables[0].Rows[i][10].ToString())
                };
                var id = service.Create(newTask);
                Console.WriteLine("{0} - созданая Задача", dataFromXmlx.Tables[0].Rows[i][0].ToString());
                bool? status = false;
                if (dataFromXmlx.Tables[0].Rows[i][8].ToString() == "Завершено")
                {
                    status = ChangeStateCode(id);
                }
                Console.WriteLine("Задача = StatusChange->{0}", status ?? null);
            }
        }

        private static bool? ChangeStateCode(Guid id)
        {
            var service = new OrganizationService(connection);
            SetStateRequest state = new SetStateRequest();
            state.State = new OptionSetValue((int)TaskState.Completed);
            state.Status =
                new OptionSetValue(5);
            state.EntityMoniker = new EntityReference()
                                                        {
                                                            Id = id,
                                                            LogicalName = SoftLine.Models.Task.EntityLogicalName
                                                        };
            SetStateResponse stateSet = (SetStateResponse)service.Execute(state);
            SoftLine.Models.Task task =
                service.Retrieve(SoftLine.Models.Task.EntityLogicalName, id, new ColumnSet("statecode")).ToEntity<SoftLine.Models.Task>();
            if (task.StateCode == TaskState.Completed)
            {
                return true;
            }
            return null;
        }

        private static OptionSetValue ToOptionSetValue(string p)
        {
            /*Низкий - 0
            Обычный - 1
            Высокий - 2*/
            switch(p)
            {
                case "Низкий":
                    return new OptionSetValue(0);
                case "Высокий":
                    return new OptionSetValue(2);
                default:
                    return new OptionSetValue(1);
            }
        }

        private static void SetAnnotationToSprava()
        {
            var service = new OrganizationService(connection);
            var dataFromXmlx = new Program().ExcelOpenSpreadsheets(@"C:\Users\savchinvv\Desktop\Примечания.xlsx");

            for (int i = 2; i < dataFromXmlx.Tables[0].Rows.Count; i++)
            {
                if (!string.IsNullOrWhiteSpace(dataFromXmlx.Tables[0].Rows[i][0].ToString()))
                {
                    var sprava = ToSpravaEntity(dataFromXmlx.Tables[0].Rows[i][1].ToString());
                    if (sprava != null)
                    {
                        var createAnn = new Annotation()
                        {
                            NoteText = dataFromXmlx.Tables[0].Rows[i][0].ToString(),
                            ObjectId = sprava,
                            ObjectTypeCode = new_spravastr.EntityLogicalName
                        };
                        service.Create(createAnn);
                        Console.WriteLine("{0} - добавлен Анотатион", dataFromXmlx.Tables[0].Rows[i][1].ToString());
                    }
                }
            }
        }

        private static EntityReference ToSpravaEntity(string p)
        {
            var context = new CrmOrganizationServiceContext(connection);
            var sprava = (from m in context.CreateQuery<new_spravastr>()
                          where m.new_businessnumber == p
                          select m).FirstOrDefault();
            if (sprava == null)
            {
                Console.WriteLine("{0} Ненайден дело", p);
                return null;
            }
            else
            {
                return sprava.ToEntityReference();
            }

        }

        private static void LoadSprava()
        {
            var service = new OrganizationService(connection);
            var context = new CrmOrganizationServiceContext(connection);

            var dataFromXmlx = new Program().ExcelOpenSpreadsheets(@"C:\Users\savchinvv\Desktop\Дела_юр.xlsx");

            for (int i = 37; i < dataFromXmlx.Tables[0].Rows.Count; i++)
            {
                var newSprava = new new_spravastr()
                {
                    new_businessnumber = dataFromXmlx.Tables[0].Rows[i][0].ToString(),
                    new_nameid = FindClient(dataFromXmlx.Tables[0].Rows[i][1].ToString()),
                    new_partnercustomer = FindAccount(dataFromXmlx.Tables[0].Rows[i][2].ToString()),
                    new_typeofbusiness = EntityForm(dataFromXmlx.Tables[0].Rows[i][3].ToString()),
                    new_type_of_business = CheckType(dataFromXmlx.Tables[0].Rows[i][4].ToString()),
                    new_priority = ToInt32(dataFromXmlx.Tables[0].Rows[i][5].ToString()),
                    new_state = FindState(dataFromXmlx.Tables[0].Rows[i][6].ToString()),
                    new_creationdate = FindDate(dataFromXmlx.Tables[0].Rows[i][7].ToString()),
                    new_liquidated = FindBit(dataFromXmlx.Tables[0].Rows[i][8].ToString()),
                    new_gai = FindGos(dataFromXmlx.Tables[0].Rows[i][9].ToString()),
                    new_datedtp = FindDate(dataFromXmlx.Tables[0].Rows[i][10].ToString()),
                    new_Dateagreement = FindDate(dataFromXmlx.Tables[0].Rows[i][11].ToString()),
                    new_date_of_birth = FindDate(dataFromXmlx.Tables[0].Rows[i][12].ToString()),
                    new_date_death = FindDate(dataFromXmlx.Tables[0].Rows[i][13].ToString()),
                    new_pledge = dataFromXmlx.Tables[0].Rows[i][14].ToString(),
                    new_property1 = dataFromXmlx.Tables[0].Rows[i][15].ToString(),
                    new_property2 = dataFromXmlx.Tables[0].Rows[i][16].ToString(),
                    new_taxnumber = dataFromXmlx.Tables[0].Rows[i][17].ToString(),
                    new_code = dataFromXmlx.Tables[0].Rows[i][18].ToString(),
                    new_placedtp = dataFromXmlx.Tables[0].Rows[i][19].ToString(),
                    new_locality = dataFromXmlx.Tables[0].Rows[i][20].ToString(),
                    new_home = dataFromXmlx.Tables[0].Rows[i][21].ToString(),
                    new_Place_of_work_1 = dataFromXmlx.Tables[0].Rows[i][22].ToString(),
                    new_Place_of_work_2 = dataFromXmlx.Tables[0].Rows[i][23].ToString(),
                    new_Companyname = dataFromXmlx.Tables[0].Rows[i][24].ToString(),
                    new_insurancecompany = dataFromXmlx.Tables[0].Rows[i][25].ToString(),
                    new_taxaddress = dataFromXmlx.Tables[0].Rows[i][26].ToString(),
                    new_heir1 = FindClient(dataFromXmlx.Tables[0].Rows[i][27].ToString()),
                    new_heir2 = FindClient(dataFromXmlx.Tables[0].Rows[i][28].ToString()),
                    new_heir3 = FindClient(dataFromXmlx.Tables[0].Rows[i][29].ToString()),
                    new_Credit_agreement = dataFromXmlx.Tables[0].Rows[i][30].ToString(),
                    new_Social_security_number = dataFromXmlx.Tables[0].Rows[i][31].ToString(),
                    new_litigationnumber = dataFromXmlx.Tables[0].Rows[i][32].ToString(),
                    new_guarantor1 = FindClient(dataFromXmlx.Tables[0].Rows[i][33].ToString()),
                    new_guarantor2 = FindClient(dataFromXmlx.Tables[0].Rows[i][34].ToString()),
                    new_guarantor3 = FindClient(dataFromXmlx.Tables[0].Rows[i][35].ToString()),
                    new_amount_loan = ToDouble(dataFromXmlx.Tables[0].Rows[i][36].ToString()),
                    new_spouse = FindClient(dataFromXmlx.Tables[0].Rows[i][37].ToString()),
                    new_accident1 = FindClient(dataFromXmlx.Tables[0].Rows[i][38].ToString()),
                    new_accident2 = FindClient(dataFromXmlx.Tables[0].Rows[i][39].ToString()),
                    new_accident3 = FindClient(dataFromXmlx.Tables[0].Rows[i][40].ToString()),
                    new_accident4 = FindClient(dataFromXmlx.Tables[0].Rows[i][41].ToString()),
                    new_institution = FindGos(dataFromXmlx.Tables[0].Rows[i][42].ToString()),
                    new_amount = ToDouble(dataFromXmlx.Tables[0].Rows[i][43].ToString())
                };
                service.Create(newSprava);
                Console.WriteLine("{0} Обработан и создан: {1}", i, dataFromXmlx.Tables[0].Rows[i][0].ToString());
            }
        }

        private static int? ToInt32(string p)
        {
            return p == string.Empty ? (int?)null : Convert.ToInt32(p);
        }

        private static double? ToDouble(string p)
        {
            return p == string.Empty ? 0 : Convert.ToDouble(p);
        }

        private static EntityReference FindGos(string p)
        {
            //new_gosorgan
            var context = new CrmOrganizationServiceContext(connection);
            var gos = (from i in context.CreateQuery<new_gosorgan>()
                       where i.new_name == p
                       select i).FirstOrDefault();
            if (gos == null)
            {
                return null;
            }
            else
            {
                return gos.ToEntityReference();
            }
        }

        private static bool? FindBit(string p)
        {
            return p == "Да" ? true : false;
        }

        private static Nullable<DateTime> FindDate(string p)
        {
            return p == string.Empty ? (DateTime?)null : Convert.ToDateTime(p);
        }

        private static OptionSetValue EntityForm(string p)
        {
            return p == "Страхова" ? new OptionSetValue(100000000) : new OptionSetValue(100000001);
        }

        private static EntityReference FindAccount(string p)
        {
            var context = new CrmOrganizationServiceContext(connection);

            var account = (from i in context.CreateQuery<Account>()
                           where i.Name == p
                           select i).FirstOrDefault();
            if (account == null)
            {
                return null;
            }
            else
            {
                return account.ToEntityReference();
            }
        }

        private static Microsoft.Xrm.Sdk.OptionSetValue FindState(string p)
        {
            switch (p)
            {
                case "Запрос в суд":
                    return new OptionSetValue(100000002);
                case "Исполнительное производство":
                    return new OptionSetValue(100000008);
                case "Судебное рассмотрение":
                    return new OptionSetValue(100000005);
                case "Подготовка иска / На оплате сбора":
                    return new OptionSetValue(100000003);
                case "Заявление об открытии исполнительного производства":
                    return new OptionSetValue(100000013);
                case "Апелляционное обжалование":
                    return new OptionSetValue(100000006);
                case "Жалоба ГИС":
                    return new OptionSetValue(100000011);
                case "Запрос в ГАИ":
                    return new OptionSetValue(100000001);
                case "Заявление в ГИС":
                    return new OptionSetValue(100000014);
                case "Исполнительное / криминальное производство":
                    return new OptionSetValue(100000010);
                case "Кассационное обжалование":
                    return new OptionSetValue(100000007);
                case "Криминальное производство":
                    return new OptionSetValue(100000009);
                case "Направление иска в суд":
                    return new OptionSetValue(100000004);
                case "Претензия/кредиторское требование":
                    return new OptionSetValue(100000015);
                case "Принял в работу":
                    return new OptionSetValue(100000000);
                case "Решение в нашу пользу":
                    return new OptionSetValue(100000016);
                case "Взыскание в ГИС":
                    return new OptionSetValue(100000012);
                default:
                    return null;
            }
        }

        private static bool? CheckType(string p)
        {
            return p == "юр." ? true : false;
        }

        private static EntityReference FindClient(string p)
        {
            if (p == string.Empty)
                return null;

            var context = new CrmOrganizationServiceContext(connection);

            Contact client = null; ;

            var splitP = p.Split();
            switch (splitP.Length)
            {
                case 4:
                    client = (from c in context.CreateQuery<Contact>()
                              where c.FullName == splitP[0] + " " + splitP[3]
                              select c).FirstOrDefault();
                    break;
                case 3:
                    client = (from c in context.CreateQuery<Contact>()
                              where c.FullName == splitP[0] + " " + splitP[2]
                              select c).FirstOrDefault();
                    break;
                case 2:
                    client = (from c in context.CreateQuery<Contact>()
                              where c.FullName == p
                              select c).FirstOrDefault();
                    break;
                case 1:
                    client = (from c in context.CreateQuery<Contact>()
                              where c.LastName == p
                              select c).FirstOrDefault();
                    break;
                default:
                    client = null;
                    break;
            }


            if (client == null)
            {
                if (splitP.Length == 4)
                {
                    client = (from c in context.CreateQuery<Contact>()
                              where c.FullName == splitP[0] + " " + splitP[1] + " " + splitP[3]
                              select c).FirstOrDefault();
                }
                else
                {
                    client = (from c in context.CreateQuery<Contact>()
                              where c.FullName == p
                              select c).FirstOrDefault();
                }
                if (client == null)
                {
                    Console.WriteLine("{0} Ненайден контакт", p);
                    return null;
                }
                return client.ToEntityReference();
            }
            else
            {
                return client.ToEntityReference();
            }
        }

        public DataSet ExcelOpenSpreadsheets(string thisFileName)
        {
            try
            {
                string fileExtension = Path.GetExtension(thisFileName);

                FileStream a = File.Open(thisFileName, FileMode.Open);

                IExcelDataReader excelReader = null;
                string caseSwitch = fileExtension;
                switch (caseSwitch)
                {
                    case ".xlsx":
                        excelReader = ExcelReaderFactory.CreateOpenXmlReader(a);
                        break;
                    case ".xls":
                        excelReader = ExcelReaderFactory.CreateBinaryReader(a);
                        break;
                    default:
                        return null;
                }
                DataSet tableExcel = excelReader.AsDataSet();
                excelReader.Close();
                return tableExcel;
            }
            catch
            {
                return null;
            }
        }
    }
}
