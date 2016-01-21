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
  new NotFoundRoute({tag: 'not-found'}),
])

riot.router.start()

console.log "test"

# riot.route (collection, id, action) ->
#   console.log "test"
#
# riot.route "/professionals", ->
#   console.log "PROF test"

# riot.route('#/professionals')
