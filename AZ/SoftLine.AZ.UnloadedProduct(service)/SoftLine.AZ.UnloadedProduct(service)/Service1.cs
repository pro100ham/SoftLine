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
using SoftLine.AZ.UnloadedProduct_service_.Service;

namespace SoftLine.AZ.UnloadedProduct_service_
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
            this.timer1.Elapsed += new ElapsedEventHandler(TaskInvoiceDeteil);
            this.timer1.Enabled = true;
        }

        protected override void OnStop()
        {
            this.timer1.Elapsed -= new ElapsedEventHandler(TaskInvoiceDeteil);
            AddLog("stop");
        }

        public void TaskInvoiceDeteil(object source, ElapsedEventArgs e)
        {
            this.timer1.Enabled = false;

            AddLog("Start Service");
            try
            {
                if (DateTime.Now.ToString("HH") == "10")
                {
                    new Work().CheckIvoiceDetail();
                    new CheckTask().CheckTasksItem();
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
                if (!EventLog.SourceExists("SoftLine.AZ.UnloadedProduct(service)"))
                {
                    EventLog.CreateEventSource("SoftLine.AZ.UnloadedProduct(service)", "SoftLine.AZ.UnloadedProduct(service)");
                }
                eventLog1.Source = "SoftLine.AZ.UnloadedProduct(service)";
                eventLog1.WriteEntry(log);
            }
            catch { }
        }
    }
}
