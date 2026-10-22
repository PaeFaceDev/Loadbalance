FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Warehouse.Domain/Warehouse.Domain.csproj Warehouse.Domain/
COPY src/Warehouse.Application/Warehouse.Application.csproj Warehouse.Application/
COPY src/Warehouse.Infrastructure/Warehouse.Infrastructure.csproj Warehouse.Infrastructure/
COPY src/Warehouse.Api/Warehouse.Api.csproj Warehouse.Api/

RUN dotnet restore Warehouse.Api/Warehouse.Api.csproj

COPY src/ ./
RUN dotnet publish Warehouse.Api/Warehouse.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Warehouse.Api.dll"]
