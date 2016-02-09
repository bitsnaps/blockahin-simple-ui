# TODO: move out

class BAppModel

  modelName: ->
    @c = console
    @constructor.name

  @new: (args) ->
    new G[@name](args)

  @collectionUp = -> @pluralize @name
  @collection   = -> @collectionUp().toLowerCase()

  @get: (id) ->
    @c.error @errApiNotFound unless API
    API.get(@collection(), "get", { id: id })
      .then (values) =>
        @new(values)
      .catch (error) ->
        c.error "Error: #{error}"

  @all: ->
    new Promise (resolve, reject) =>
      API.get(@collection(), "get#{@collectionUp()}Count")
        .catch reject
        .then (count) =>
          promises = @allGet count
          @allResolve promises, resolve, reject

  @create: ->

  @update: ->

  # utils

  @pluralize: (word) ->
    if s(word).endsWith('y')
      word = word.substring word.length - 1
      "#{word}ies"
    else
      "#{word}s"

  # internal

  @allGet: (count) ->
    promises = []
    if count > 0
      for id in [1..count]
        promises.push API.get(@collection(), "get", { id: id })
    promises

  @allResolve: (promises, resolve, reject) ->
    Promise.all(promises)
      .catch reject
      .then (collectionResp) =>
        collection = []
        for values in collectionResp
          collection.push @new(values)
        resolve collection

  # errors

  errApiNotFound: "API not found, please instantiate it via: 'var API = new BApi(host)'"
