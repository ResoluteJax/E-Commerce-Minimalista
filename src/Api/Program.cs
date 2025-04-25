using MinimalistECommerce.Api.Middleware;
using MinimalistECommerce.Infrastructure; 

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

app.UseAuthorization();

app.MapControllers(); // Garante que as rotas dos seus Controllers sejam mapeadas

app.Run(); // Apenas UM app.Run() no final