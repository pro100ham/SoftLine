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
using SoftLine.InfoTera.MonitoringPrice.Service;

namespace SoftLine.InfoTera.MonitoringPrice
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
            this.timer1 = new Timer(60000);
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
                if (DateTime.Now.ToString("HH-mm") == "11-05")
                {
                    new MonitoringClass().Monitoring();
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
                if (!EventLog.SourceExists("SoftLine.InfoTera.Monitoring"))
                {
                    EventLog.CreateEventSource("SoftLine.InfoTera.Monitoring", "SoftLine.InfoTera.Monitoring");
                }
                eventLog1.Source = "SoftLine.InfoTera.Monitoring";
                eventLog1.WriteEntry(log);
            }
            catch { }
        }
    }
}
