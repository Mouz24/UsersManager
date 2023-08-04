using Entities.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Entities.DTOs;
using Contracts;

namespace Repository
{
    public class AuthenticationManager : IAuthenticationManager
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private User _user;

        public AuthenticationManager(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<string> CreateAccessToken()
        {
            var signingCredentials = GetSigningCredentials();
            var claims = await GetClaims();
            var tokenOptions = GenerateTokenOptions(signingCredentials, claims);

            return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
        }

        public string CreateRefreshToken()
        {
            var randomNumber = new byte[32];

            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);

                return Convert.ToBase64String(randomNumber);
            }
        }

        public async Task<bool> ValidateUser(UserForAuthenticationDTO user)
        {
            _user = await GetUser(user.UserName);

            return (_user != null && await _userManager.CheckPasswordAsync(_user, user.Password) && !_user.isBlocked);
        }

        public async Task UpdateLoginDate(UserForAuthenticationDTO user)
        {
            _user = await GetUser(user.UserName);
            _user.LastLoginDate = DateTime.UtcNow.AddHours(3);
        }

        public async Task AddRefreshToken(UserForAuthenticationDTO user, string refreshToken)
        {
            _user = await GetUser(user.UserName);
            _user.RefreshToken = refreshToken;
            _user.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(3).AddDays(7);
        }

        public async Task ReassignRefreshToken(string userName, string refreshToken)
        {
            _user = await GetUser(userName);
            _user.RefreshToken = refreshToken;
        }

        public async Task RevokeRefreshToken(string userName)
        {
            _user = await GetUser(userName);
            _user.RefreshToken = null;
        }

        private async Task<User> GetUser(string userName)
        {
            return await _userManager.FindByNameAsync(userName);
        }

        public async Task BlockUser(Guid Id)
        {
            _user = await _userManager.FindByIdAsync(Id.ToString("D"));
            _user.isBlocked = true;
        }

        public async Task UnblockUser(Guid Id)
        {
            _user = await _userManager.FindByIdAsync(Id.ToString("D"));
            _user.isBlocked = false;
        }

        public async Task AddUserRegistrationDate(UserForRegistrationDTO user)
        {
            _user = await GetUser(user.UserName); 
            _user.RegistrationDate = DateTime.UtcNow.AddHours(3);
        }

        public async Task<bool> ValidateExpiredTokenClaims(string userName, string refreshToken)
        {
            _user = await GetUser(userName);

            return (_user != null || _user.RefreshToken == refreshToken || _user.RefreshTokenExpiryTime > DateTime.UtcNow.AddHours(3));
        }

        private SigningCredentials GetSigningCredentials()
        {
            var key = Encoding.UTF8.GetBytes(_configuration.GetSection("JwtSettings").GetSection("SECRET").Value/*Environment.GetEnvironmentVariable("SECRET")*/);

            var secret = new SymmetricSecurityKey(key);

            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);
        }

        private async Task<List<Claim>> GetClaims()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, _user.UserName)
            };

            var roles = await _userManager.GetRolesAsync(_user);

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            return claims;
        }

        private JwtSecurityToken GenerateTokenOptions(SigningCredentials signingCredentials, List<Claim> claims)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");

            var tokenOptions = new JwtSecurityToken
            (
            issuer: jwtSettings.GetSection("validIssuer").Value,
            audience: jwtSettings.GetSection("validAudience").Value,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings.GetSection("expires").Value)),
            signingCredentials: signingCredentials
            );

            return tokenOptions;
        }

        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("JwtSettings").GetSection("SECRET").Value))
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            SecurityToken securityToken;

            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);

            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }
    }
}
