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

  bindUpdateEntityForm: (name, entry_id, ctx, presenter) =>
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

        c.log "Updating #{name}:", obj
        klass.update(obj)
          .then (resp) =>
            c.log "#{name} updated:", resp
            spinner.css
              visibility: "hidden"
            $("#{form} .message").html "saved!"
          .catch (error) ->
            c.log "Error updating current #{name}:", error

  # utils
  #
  pluralize: (word) ->
    if s(word).endsWith('y')
      word = word.substring word.length - 1
      "#{word}ies"
    else
      "#{word}s"
