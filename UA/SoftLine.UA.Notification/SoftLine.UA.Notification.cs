using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using SoftLine.UA.Notification.Service;

namespace SoftLine.UA.Notification
{
    public partial class Service1 : ServiceBase
    {
        private Timer timer1;

        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            AddLog("start");
            this.timer1 = new Timer(3600000);
            this.timer1.Elapsed += new ElapsedEventHandler(TaskNotification);
            this.timer1.Enabled = true;
        }

        protected override void OnStop()
        {
            this.timer1.Elapsed -= new ElapsedEventHandler(TaskNotification);
            AddLog("stop");
        }

        public void TaskNotification(object source, ElapsedEventArgs e)
        {
            this.timer1.Enabled = false;

            AddLog("Start Service");
            try
            {
                if (DateTime.Now.ToString("HH") == "09")
                {
                    new InvoiceNotification().CheckInvoiceEve();
                    new InvoiceNotification().CheckInvoiceToday();
                    new SalesOrderNotification().CheckSalesOrderEve();
                    new SalesOrderNotification().CheckSalesOrderToday();
                    new AgreementNotification().CheckAgreementEve();
                    new AgreementNotification().CheckAgreementToday();
                }
                else
                {
                    AddLog("I wait my time");
                }
            }
            catch (Exception ex)
            {
                AddLog(ex.ToString());
            }
            finally
            {
                this.timer1.Enabled = true;
            }
        }

        public void AddLog(string log)
        {
            try
            {
                if (!EventLog.SourceExists("SoftLine.UA.Notification"))
                {
                    EventLog.CreateEventSource("SoftLine.UA.Notification", "SoftLine.UA.Notification");
                }
                eventLog1.Source = "SoftLine.UA.Notification";
                eventLog1.WriteEntry(log);
            }
            catch (Exception ex)
            {
                eventLog1.Source = "SoftLine.UA.Notification";
                eventLog1.WriteEntry(ex.Message);
            }
        }
    }
}
