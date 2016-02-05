# TODO: move out

class BAppModel
  modelName: ->
    @constructor.name

  @new: (args) ->
    new G[@name](args)

  @all: ->
    a = @new({ id: 1 })
    a

  @get: ->

  @create: ->

  @update: ->
