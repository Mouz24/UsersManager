using AutoMapper;
using Contracts;
using Entities.DTOs;
using Entities.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AuthenticationManager.Controllers
{
    [Route("api")]
    [ApiController]
    public class RegistrationController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly IAuthenticationManager _authManager;
        private readonly IRepositoryBase _repository;

        public RegistrationController(UserManager<User> userManager, IAuthenticationManager authManager, IRepositoryBase repository, IMapper mapper)
        {
            _userManager = userManager;
            _authManager = authManager;
            _repository = repository;
            _mapper = mapper;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> RegisterUser([FromBody] UserForRegistrationDTO userForRegistration)
        {
            if (!ModelState.IsValid)
            {
                return UnprocessableEntity(ModelState);
            }

            var user = _mapper.Map<User>(userForRegistration);

            var result = await _userManager.CreateAsync(user, userForRegistration.Password);
            if (!result.Succeeded && result.Errors.Count() > 0)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                }

                return BadRequest(ModelState);
            }

            await _authManager.AddUserRegistrationDate(userForRegistration);

            await _repository.SaveAsync();

            return StatusCode(201);
        }

    }
}
