Route         = riot.router.Route
DefaultRoute  = riot.router.DefaultRoute
NotFoundRoute = riot.router.NotFoundRoute
RedirectRoute = riot.router.RedirectRoute
store = new Store()
#riot.mount 'main-nav'#, store: store
riot.mount '*'#, store: store

api = { store: store }
riot.router.routes([
  new DefaultRoute({tag: 'example-cont', api: api}),
  new Route({path: '/professionals', tag: 'table-users', api: api}),
  new Route({path: '/organizations', tag: 'table-orgs', api: api}),
  new Route({path: '/universities',  tag: 'table-unis', api: api}),
  new Route({path: '/profile',       tag: 'profile', api: api}),
  new Route({path: '/users/:id',     tag: 'user', api: api}),
  new NotFoundRoute({tag: 'not-found'}),
])

riot.router.start()

console.log "Riot started"

# riot.route (collection, id, action) ->
#   console.log "test"
#
# riot.route "/professionals", ->
#   console.log "PROF test"

# riot.route('#/professionals')

# ---------------------------




# Org.all()
#   .then (orgs) =>
#     window.Orgs = orgs
#     instances = riot.update()
#     c.log "instances:", instances
#   .catch (error) ->
#     c.error "Error: #{error}"

# ------------

# Org.get(1)
#   .then (user) ->
#     c.log "User:", user
#   .catch (error) ->
#     c.error "Error: #{error}"

# ------------

# TODO: handle not-found
#
# User.get(1)
#   .then (user) ->
#     c.log "User:", user
#   .catch (error) ->
#     c.error "Error: #{error}"


# Org.get(1)
#   .then (user) ->
#     c.log "Org:", user
#   .catch (error) ->
#     c.error "Error: #{error}"


# ---------------------------
