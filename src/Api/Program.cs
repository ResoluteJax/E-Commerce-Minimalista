using MinimalistECommerce.Api.Middleware;
using MinimalistECommerce.Infrastructure; 
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;


var builder = WebApplication.CreateBuilder(args);

// Configura o DbContext
builder.Services.AddInfrastructureServices(builder.Configuration);


//Defina uma Política e Adicione os Serviços CORS\\
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
   options.AddPolicy(name: MyAllowSpecificOrigins,
                    policy => 
                    {
                        policy.WithOrigins("http://localhost:5173") // Permite o servidor de dev do Vite
                        .AllowAnyHeader()  // Permite quaisquer cabeçalhos HTTP
                        .AllowAnyMethod(); // Permite quaisquer métodos HTTP (GET, POST, PUT, DELETE, etc.)
                    }); 
});
// Fim Defina uma Política e Adicione os Serviços CORS \\

// Configuração da Autenticação JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true; // Opcional: Salva o token no HttpContext após validação
    options.RequireHttpsMetadata = false; // Em desenvolvimento pode ser false, em produção true
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true, // Validar expiração do token
        ValidateIssuerSigningKey = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)) // Usa a chave do appsettings
    };
});


// Adiciona serviços ao container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

//Middleware Global de Exceções\\
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();


// Configura o pipeline de requisições HTTP.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers(); // Garante que as rotas dos seus Controllers sejam mapeadas

app.Run(); // Apenas UM app.Run() no final