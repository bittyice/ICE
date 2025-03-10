using AutoMapper;
using Ice.AI.Core;
using Ice.AI.Dtos;

namespace Ice.AI;

public class AIApplicationAutoMapperProfile : Profile
{
    public AIApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */

        CreateMap<Gpt, GptDto>();
        CreateMap<Questionnaire, QuestionnaireDto>();
        CreateMap<QuestionnaireResult, QuestionnaireResultDto>();
        CreateMap<QaTag, QaTagDto>();
        CreateMap<CsText, CsTextDto>();
        CreateMap<Client, ClientDto>();
    }
}
