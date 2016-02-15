riot.mount '*'

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
