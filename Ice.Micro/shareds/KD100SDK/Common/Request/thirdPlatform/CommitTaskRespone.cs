using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KD100SDK.Common.Request.thirdPlatform
{
    public class CommitTaskRespone
    {
        public int total { get; set; }

        public List<CommitTaskResponeTask> tasks { get; set; }
    }

    public class CommitTaskResponeTask { 
        public string taskId { get; set; }

        public string updateAtMin { get; set; }

        public string updateAtMax { get; set; }
    }
}
