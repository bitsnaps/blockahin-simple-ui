BR =
  getEntryId: ->
    entry_id = s(location.hash).strRightBack("/").value()
    Number entry_id

  loadFromCollection: (name, entry_id, coll_name, ctx, presenter) =>
    coll = StoreData[coll_name]
    elem = _(coll).find (e) ->
      entry_id == e.id
    elem = presenter elem if presenter
    ctx[name] = elem
    ctx.update()

    @store = ctx.opts.store
    @store.on 'update', (data) =>
      coll = data[coll_name]
      elem = _(coll).find (e) ->
        entry_id == e.id
      elem = presenter elem if presenter
      ctx[name] = elem
      ctx.update()
