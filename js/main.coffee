riot.mount '*', store: store

riot.router.routes(ROUTES)

riot.router.start()

console.log "Riot started"

# BApi#update:
#
# user = new User id: 1, name: "test3"
#
# User.update(user)
#   .then (user) ->
#     c.log "User:", user


# TODO: handle not-found
#
# BApi#get:
#
# User.get(1)
#   .then (user) ->
#     c.log "User:", user
#   .catch (error) ->
#     c.error "Error: #{error}"
#
# BApi#all:
#


# Notifier


updateStatus = (status) ->
  StoreData.evt = status
  store.update StoreData

updateStatusDebounced = _.debounce updateStatus

PENDING_TXST = null # pending tx status


# Socket:

wsHost = "localhost:3001"
wsHost = bappHost if APP_ENV == "prod"
socket = new WebSocket "ws://#{wsHost}"

socket.onopen = (event) ->
  c.log "PING"

socket.onmessage = (event) ->
  status = event.data
  c.log "WS EVENT RECEIVED: #{status}"

  if status
    updateStatusDebounced status

    if status == "tx_pending"
      PENDING_TXST = true
      _.delay ->
        updateStatusDebounced null if PENDING_TXST
      , 10000

    if status == "tx_latest"
      if PENDING_TXST
        updateStatus status
      PENDING_TXST = null

      _.delay ->
        updateStatusDebounced null
      , 3000
