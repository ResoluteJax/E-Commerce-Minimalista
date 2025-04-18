using MinimalistECommerce.Infrastructure; 

var builder = WebApplication.CreateBuilder(args);

// Configura o DbContext
builder.Services.AddInfrastructureServices(builder.Configuration);

// Adiciona serviços ao container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configura o pipeline de requisições HTTP.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers(); // Garante que as rotas dos seus Controllers sejam mapeadas

app.Run(); // Apenas UM app.Run() no final