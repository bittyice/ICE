using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.AI.Services.QuestionnaireResults
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? TagName { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }
    }
}
