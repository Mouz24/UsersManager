using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Contracts
{
    public interface IAuthenticationManager
    {
        Task<bool> ValidateUser(UserForAuthenticationDTO user);
        Task<bool> ValidateExpiredTokenClaims(string userName, string refreshToken);
        Task<string> CreateAccessToken();
        string CreateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
        Task ReassignRefreshToken(string userName, string refreshToken);
        Task AddRefreshToken(UserForAuthenticationDTO user, string refreshToken);
        Task RevokeRefreshToken(string userName);
        Task UpdateLoginDate(UserForAuthenticationDTO user);
        Task AddUserRegistrationDate(UserForRegistrationDTO user);
        Task BlockUser(Guid Id);
        Task UnblockUser(Guid Id);
    }
}
