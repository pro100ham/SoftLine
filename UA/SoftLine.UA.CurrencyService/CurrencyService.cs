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

namespace SoftLine.UA.CurrencyService
{
    public partial class CurrencyService : ServiceBase
    {
        private Timer timer1;

        public CurrencyService()
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
                if (DateTime.Now.ToString("HH") == "10")
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
                if (!EventLog.SourceExists("SoftLine.UA.CurrencyService"))
                {
                    EventLog.CreateEventSource("SoftLine.UA.CurrencyService", "SoftLine.UA.CurrencyService");
                }
                eventLog2.Source = "SoftLine.UA.CurrencyService";
                eventLog2.WriteEntry(log);
            }
            catch (Exception ex) 
            {
                eventLog2.Source = "SoftLine.UA.CurrencyService";
                eventLog2.WriteEntry(ex.Message);
            }
        }
    }
}
