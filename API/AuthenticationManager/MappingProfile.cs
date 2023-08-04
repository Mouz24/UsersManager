using AutoMapper;
using Entities.DTOs;
using Entities.Models;

namespace AuthenticationManager
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserForRegistrationDTO>();
            CreateMap<UserForRegistrationDTO, User>();
        }
    }
}
