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
using SoftLine.UZ.CurrencyUpdate_service_.Service;

namespace SoftLine.UZ.CurrencyUpdate_service_
{
    public partial class MainService : ServiceBase
    {
        private Timer timer1;

        public MainService()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            AddLog("start");
            this.timer1 = new Timer(3600000);
            this.timer1.Elapsed += new ElapsedEventHandler(TaskUpdateCurrecy);
            this.timer1.Enabled = true;
        }

        protected override void OnStop()
        {
            this.timer1.Elapsed -= new ElapsedEventHandler(TaskUpdateCurrecy);
            AddLog("stop");
        }

        public void TaskUpdateCurrecy(object source, ElapsedEventArgs e)
        {
            this.timer1.Enabled = false;

            AddLog("Start Service");
            try
            {
                if (DateTime.Now.ToString("HH") == "09" || DateTime.Now.ToString("HH") == "14")
                {
                    new CurrencyUpdateClass().UpdateCurrency();
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
                if (!EventLog.SourceExists("SoftLine.UZ.CurrencyUpdate(service)"))
                {
                    EventLog.CreateEventSource("SoftLine.UZ.CurrencyUpdate(service)", "SoftLine.UZ.CurrencyUpdate(service)");
                }
                eventLog1.Source = "SoftLine.UZ.CurrencyUpdate(service)";
                eventLog1.WriteEntry(log);
            }
            catch { }
        }
    }
}
