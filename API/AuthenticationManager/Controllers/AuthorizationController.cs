using AutoMapper;
using Contracts;
using Entities.DTOs;
using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AuthenticationManager.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthorizationController : ControllerBase
    {
        private readonly IAuthenticationManager _authManager;
        private readonly IRepositoryBase _repository;

        public AuthorizationController(IAuthenticationManager authManager, IRepositoryBase repository)
        {
            _authManager = authManager;
            _repository = repository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Authenticate([FromBody] UserForAuthenticationDTO user)
        {
            if (!await _authManager.ValidateUser(user))
            {
                return Unauthorized();
            }

            var accessToken = await _authManager.CreateAccessToken();

            var refreshToken = _authManager.CreateRefreshToken();

            await _authManager.AddRefreshToken(user, refreshToken);

            await _authManager.UpdateLoginDate(user);

            await _repository.SaveAsync();

            return Ok(new AuthenticatedResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }
    }
    

}