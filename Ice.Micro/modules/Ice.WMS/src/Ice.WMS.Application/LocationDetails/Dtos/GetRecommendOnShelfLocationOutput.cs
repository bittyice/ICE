using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class GetRecommendOnShelfLocationOutput
    {
        public string MinQuantityLocation { get; set; }

        public string MaxQuantityLocation { get; set; }

        public string SomeShelfLiseLocation { get; set; }
    }
}
