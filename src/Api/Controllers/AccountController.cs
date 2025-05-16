// src/Api/Controllers/AccountController.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Para ILogger
using System.Linq; // Para .Select()
using System.Threading.Tasks;
using MinimalistECommerce.Application.Dtos; // Nossos DTOs
using MinimalistECommerce.Domain.Entities;  // Nossa entidade Customer

using System.IdentityModel.Tokens.Jwt; // Para JwtSecurityTokenHandler
using System.Security.Claims;        // Para Claims
using System.Text;                   // Para Encoding
using Microsoft.IdentityModel.Tokens; // Para SymmetricSecurityKey e SigningCredentials
using Microsoft.Extensions.Configuration; // Para IConfiguration

namespace MinimalistECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Rota base será /api/account
    public class AccountController : ControllerBase
    {
        private readonly UserManager<Customer> _userManager;
        private readonly SignInManager<Customer> _signInManager;
        private readonly ILogger<AccountController> _logger;
        private readonly IConfiguration _configuration;

        // Modifique o construtor para incluir IConfiguration
        public AccountController(
    UserManager<Customer> userManager,
    SignInManager<Customer> signInManager,
    ILogger<AccountController> logger,
    IConfiguration configuration)
{

            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // POST: api/account/register
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<AuthResponseDto>> RegisterUser([FromBody] RegisterUserDto registerDto)
        {
            _logger.LogInformation("Tentativa de registro para o e-mail: {Email}", registerDto.Email);

            if (registerDto == null || !ModelState.IsValid)
            {
                var modelStateErrors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new AuthResponseDto { IsSuccess = false, Message = "Dados de registro inválidos.", Errors = modelStateErrors });
            }

            var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
            if (userExists != null)
            {
                _logger.LogWarning("Tentativa de registro com e-mail já existente: {Email}", registerDto.Email);
                return StatusCode(StatusCodes.Status409Conflict,
                    new AuthResponseDto { IsSuccess = false, Message = "Usuário já cadastrado com este e-mail." });
            }

            var newUser = new Customer
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                UserName = registerDto.Email,
                DefaultShippingAddress = registerDto.DefaultShippingAddress,
            };

            var result = await _userManager.CreateAsync(newUser, registerDto.Password);

            if (result.Succeeded)
            {
                _logger.LogInformation("Usuário {Email} registrado com sucesso. ID: {UserId}", newUser.Email, newUser.Id);
                
                var tokenString = GenerateJwtToken(newUser);
                var tokenExpiryDate = DateTime.UtcNow.AddHours(1);

                return Ok(new AuthResponseDto
                {
                    IsSuccess = true,
                    Message = "Usuário registrado com sucesso!",
                    UserId = newUser.Id,
                    Email = newUser.Email,
                    FullName = newUser.FullName,
                    Token = tokenString,
                    ExpiresOn = tokenExpiryDate

                });
            }
            else
            {
                foreach (var error in result.Errors)
                {
                    _logger.LogError("Erro de registro do Identity: {Code} - {Description}", error.Code, error.Description);
                }
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Falha no registro do usuário.",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }
        }

        // POST: api/account/login
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthResponseDto>> LoginUser([FromBody] LoginUserDto loginDto)
        {
            _logger.LogInformation("Tentativa de login para o e-mail: {Email}", loginDto.Email);

            if (loginDto == null || !ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto { IsSuccess = false, Message = "Dados de login inválidos." });
            }

            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
            {
                _logger.LogWarning("Tentativa de login para usuário não encontrado: {Email}", loginDto.Email);
                return Unauthorized(new AuthResponseDto { IsSuccess = false, Message = "E-mail ou senha inválidos." });
            }

            var result = await _signInManager.PasswordSignInAsync(user, loginDto.Password, isPersistent: false, lockoutOnFailure: false);

             if (result.Succeeded)
            {
                _logger.LogInformation("Usuário {Email} logado com sucesso.", loginDto.Email);

                var tokenString = GenerateJwtToken(user); // Gera o token
                var tokenExpiryDate = DateTime.UtcNow.AddHours(1); // Define a expiração

                return Ok(new AuthResponseDto
                {
                    IsSuccess = true,
                    Message = "Login bem-sucedido!",
                    UserId = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Token = tokenString,       // Usa a variável local tokenString
                    ExpiresOn = tokenExpiryDate // Usa a variável local tokenExpiryDate
                });
            }

            // // Estas checagens mais específicas de falha podem ser reativadas se o lockout/confirmação forem implementados:
            // if (result.IsLockedOut)
            // {
            //     _logger.LogWarning("Usuário {Email} está bloqueado.", loginDto.Email);
            //     return Unauthorized(new AuthResponseDto { IsSuccess = false, Message = "Conta bloqueada." });
            // }
            // if (result.IsNotAllowed)
            // {
            //     _logger.LogWarning("Login não permitido para {Email} (ex: e-mail não confirmado).", loginDto.Email);
            //     return Unauthorized(new AuthResponseDto { IsSuccess = false, Message = "Login não permitido." });
            // }

            _logger.LogWarning("Falha na tentativa de login para {Email} (senha inválida ou usuário não pode logar).", loginDto.Email);
            return Unauthorized(new AuthResponseDto { IsSuccess = false, Message = "E-mail ou senha inválidos." });
        }

private string GenerateJwtToken(Customer user)
{
    var jwtKey = _configuration["Jwt:Key"];
    var issuer = _configuration["Jwt:Issuer"];
    var audience = _configuration["Jwt:Audience"];

    _logger.LogInformation("Gerando token JWT. Key: '{JwtKey}', Issuer: '{Issuer}', Audience: '{Audience}'", jwtKey, issuer, audience);

    if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
    {
        _logger.LogError("Configurações JWT (Key, Issuer ou Audience) não encontradas ou vazias no appsettings.");
        // Retornar null ou string vazia aqui faria o token ser nulo na resposta,
        // em vez de lançar exceção, o que poderia explicar o 200 OK com token null.
        // Lançar a exceção é geralmente melhor para indicar um problema de configuração.
        throw new InvalidOperationException("Configurações JWT (Key, Issuer ou Audience) não podem ser nulas ou vazias.");
    }

    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

    var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Email!),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(JwtRegisteredClaimNames.Email, user.Email!),
        new Claim("uid", user.Id)
    };

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddHours(1),
        Issuer = issuer,
        Audience = audience,
        SigningCredentials = credentials
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);
    var tokenStringResult = tokenHandler.WriteToken(token);

    _logger.LogInformation("Token JWT gerado com sucesso (primeiros 10 chars): {TokenStart}", tokenStringResult.Substring(0, Math.Min(10, tokenStringResult.Length)));
    return tokenStringResult;
}



    }
}