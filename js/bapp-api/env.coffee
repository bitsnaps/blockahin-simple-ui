host = document.location.hostname

APP_ENV = if host == "localhost" then "dev" else "prod"

bappHost = if APP_ENV
  "localhost:3001"
else
  "api.#{host}"

host = bappHost
API = new BApi host
