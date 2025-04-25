using System.Net;
using System.Text.Json;

namespace MinimalistECommerce.Api.Middleware
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        // Injetamos o próximo middleware no pipeline e o logger
        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Tenta executar o próximo middleware no pipeline
                await _next(context);
            }
            catch (Exception ex)
            {
                // Se uma exceção não tratada ocorrer, ela será capturada aqui
                _logger.LogError(ex, "Ocorreu um exceção não tratada: {Message}", ex.Message);

                 // Prepara a resposta de erro
                 context.Response.ContentType = "application/json";
                 context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; //status 500

                // Cria um objeto de resposta de erro simples
                // IMPORTANTE: Em produção, evite expor ex.Message ou ex.StackTrace
                // Poderíamos verificar o ambiente (Development/Production) aqui para mudar a resposta
                var response = new
                {
                    StatusCode = context.Response.StatusCode,
                    Message = "Ocorreu um erro interno no servidor. Tente novamente mais tarde.",
                    Detailed = ex.Message // Apenas para exemplo - REMOVER/AJUSTAR para Produção
                };

                // Escreve a resposta JSON
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        }
    }

}