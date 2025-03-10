FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
COPY . .
EXPOSE 11180
ENTRYPOINT ["dotnet", "Ice.Micro.HttpApi.Host.dll", "--urls", "http://0.0.0.0:11180"]