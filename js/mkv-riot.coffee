BR =
  getEntryId: ->
    entry_id = s(location.hash).strRightBack("/").value()
    Number entry_id

  loadFromCollection: (name, entry_id, ctx, presenter) =>
    coll_name = BR.pluralize name
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

  appendNewObjToColl: (obj, coll_name) =>
    coll = StoreData[coll_name]
    last = _(coll).last()
    coll.push obj
    obj.id = last.id + 1
    # klass.count()
    #   .then (count) =>
    #     obj.id = count+1
    #   .catch (error) ->
    #     c.error "Error: Cannot #{action} current #{name}:", error
    #     c.error error.stack

  bindSaveEntityForm: (action, name, entry_id, ctx) =>
    coll_name = BR.pluralize name
    form = "form##{name}_form"

    @message = ""
    ctx.on 'mount', (data) =>
      spinner = $ "#{form} .spinner"

      $("#{form} input[type=submit]").on "click", (evt) =>
        spinner.css
          visibility: "visible"

        obj = ctx[name]
        klass = G[s.capitalize name]
        values = $("#{form}").serializeArray()
        _(values).each (entry) ->
          obj[entry.name] = entry.value

        c.log "#{name}.#{action}()", obj
        klass[action](obj)
          .then (resp) =>
            c.log "#{name} updated:", resp
            spinner.css
              visibility: "hidden"
            $("#{form} .message").html "saved!"
            BR.appendNewObjToColl obj, coll_name if action == "create"
          .catch (error) ->
            c.error "Error: Cannot #{action} current #{name}:", error
            c.error error.stack

  bindCreateEntityForm: (name, ctx) =>
    BR.bindSaveEntityForm "create", name, null, ctx

  bindUpdateEntityForm: (name, entry_id, ctx) =>
    BR.bindSaveEntityForm "update", name, entry_id, ctx

  # utils
  #
  pluralize: (word) ->
    if s(word).endsWith('y')
      word = word.substring word.length - 1
      "#{word}ies"
    else
      "#{word}s"
