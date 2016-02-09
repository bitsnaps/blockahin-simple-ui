host = document.location.hostname
bappHost = if host == "localhost"
  "localhost:3001"
else
  "api.#{host}"

host = bappHost
API = new BApi host
