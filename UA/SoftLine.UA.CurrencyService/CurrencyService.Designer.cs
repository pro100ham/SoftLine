namespace SoftLine.UA.CurrencyService
{
    partial class CurrencyService
    {
        /// <summary> 
        /// Требуется переменная конструктора.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Освободить все используемые ресурсы.
        /// </summary>
        /// <param name="disposing">истинно, если управляемый ресурс должен быть удален; иначе ложно.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Код, автоматически созданный конструктором компонентов

        /// <summary> 
        /// Обязательный метод для поддержки конструктора - не изменяйте 
        /// содержимое данного метода при помощи редактора кода.
        /// </summary>
        private void InitializeComponent()
        {
            this.eventLog2 = new System.Diagnostics.EventLog();
            ((System.ComponentModel.ISupportInitialize)(this.eventLog2)).BeginInit();
            // 
            // CurrencyService
            // 
            this.ServiceName = "CurrencyService";
            ((System.ComponentModel.ISupportInitialize)(this.eventLog2)).EndInit();

        }

        #endregion

        private System.Diagnostics.EventLog eventLog2;
    }
}
