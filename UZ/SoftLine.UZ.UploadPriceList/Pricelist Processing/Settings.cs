using System.Collections.Generic;

namespace UploadPricelist
{
    internal class Settings
    {
        private static Dictionary<string, string> settings;

        public static string GetAttribute(string attrName)
        {
            if (settings == null)
            {
                settings = new Dictionary<string, string>();

                settings.Add("uri", "https://uz.crm.softlinegroup.com/XRMServices/2011/Organization.svc");
                settings.Add("username", @"saoftline\savchinvv");
                settings.Add("password", "198ytdblbvr@");

                settings.Add("defaultUomScheduleName", "По количеству лицензий");
                settings.Add("defaultUomName", "1 лицензия");
            }
            return settings[attrName];
        }
    }
}