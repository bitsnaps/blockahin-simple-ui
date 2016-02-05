# TODO: move out

class BAppModel

  modelName: ->
    @c = console
    @constructor.name

  @new: (args) ->
    new G[@name](args)

  @get: (id) ->
    @c.error @errApiNotFound unless API
    collection = @pluralize @name
    API.get(collection, "get", id)
      .then (value) =>
        @new({ id: value[0], name: value[1] })
      .catch (error) ->
        c.error "Error: #{error}"

  @all: ->
    a = @new({ id: 1 })
    a

  @create: ->

  @update: ->

  # utils

  @pluralize: (word) ->
    if s(word).endsWith('y')
      word = word.substring word.length - 1
      "#{word}ies"
    else
      "#{word}s"


  # errors

  errApiNotFound: "API not found, please instantiate it via: 'var API = new BApi(host)'"
