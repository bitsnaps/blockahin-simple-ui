BR =
  getEntryId: ->
    entry_id = s(location.hash).strRightBack("/").value()
    Number entry_id

  loadFromCollection: (name, entry_id, coll, ctx, presenter) =>
    @coll = StoreData[coll]
    elem = _(@coll).find (e) ->
      entry_id == e.id
    elem = presenter elem if presenter
    @[name] = elem
    ctx.update()

    @store = ctx.opts.store
    @store.on 'update', (data) =>
      @coll = data[coll]
      elem = _(@coll).find (e) ->
        entry_id == e.id
      elem = presenter elem if presenter
      @[name] = elem
      ctx.update()
