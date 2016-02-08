Store =
  count: 0

Actions =
  tick: () ->
    Store.count += 1
    @update
      count: Store.count


Route         = riot.router.Route
DefaultRoute  = riot.router.DefaultRoute
NotFoundRoute = riot.router.NotFoundRoute
RedirectRoute = riot.router.RedirectRoute
riot.mount '*'

riot.router.routes([
  new DefaultRoute({tag: 'example-cont'}),
  new Route({path: '/professionals', tag: 'table-users'}),
  new Route({path: '/companies',     tag: 'table-companies'}),
  new Route({path: '/universities',  tag: 'table-unis'}),
  new Route({path: '/profile',       tag: 'profile'}),
  new Route({path: '/users/:id', tag: 'user'}),
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


Org.all()
  .then (orgs) ->
    c.log "Orgs:", orgs
  .catch (error) ->
    c.error "Error: #{error}"
    
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
