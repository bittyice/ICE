using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.StockChangeLogs.Dtos
{
    public class GetAllInput
    {
        /// <summary>
        /// 关联记录
        /// </summary>
        [Required]
        public Guid RelationId { get; set; }
    }
}
