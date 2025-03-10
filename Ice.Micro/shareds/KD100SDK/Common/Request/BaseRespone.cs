using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KD100SDK.Common.Request
{
    public class CommonRespone {
        public bool result { get; set; }

        public string? message { get; set; }
    }

    public class BaseRespone<T> where T : class
    {
        public bool result { get; set; }

        public int returnCode { get; set; }

        public string? message { get; set; }

        public T? data { get; set; }
    }
}
