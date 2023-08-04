using Contracts;
using Entities.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthenticationManager.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IAuthenticationManager _authManager;
        private readonly IRepositoryBase _repository;

        public UsersController(UserManager<User> userManager, IAuthenticationManager authManager, IRepositoryBase repository)
        {
            _userManager = userManager;
            _authManager = authManager;
            _repository = repository;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .Select(user => new
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    RegistrationDate = user.RegistrationDate,
                    LastLoginDate = user.LastLoginDate,
                    isBlocked = user.isBlocked
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize]
        [HttpPut("block")]
        public async Task<IActionResult> BlockUser([FromBody]ICollection<Guid> Ids)
        {
            foreach (var Id in Ids)
            {
                await _authManager.BlockUser(Id);
            }

            await _repository.SaveAsync();

            return NoContent();
        }

        [Authorize]
        [HttpPut("unblock")]
        public async Task<IActionResult> UnblockUser([FromBody]ICollection<Guid> Ids)
        {
            foreach (var Id in Ids)
            {
                await _authManager.UnblockUser(Id);
            }

            await _repository.SaveAsync();

            return NoContent();
        }

        [Authorize]
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUser([FromBody]ICollection<Guid> Ids)
        {
            foreach (var Id in Ids)
            {
                var user = await _userManager.FindByIdAsync(Id.ToString("D"));
                if (user == null)
                {
                    return NotFound();
                }

                await _userManager.DeleteAsync(user);
            }

            await _repository.SaveAsync();

            return NoContent();
        }
    }
}
