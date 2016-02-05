# configs
bappHost     = "localhost:3001"

contractName = 'contact_form'

# setup code
c =  console || { log: -> }

G = window # global namespace

class BApi
  constructor: (@host) ->
    #

  methodGet: (contractName, name, values) ->
    host = "http://#{@host}"
    query = $.param(values)
    "#{host}/api/#{contractName}/#{name}?#{query}"

  get: ->
    contract = "users"
    methodName = "get"
    values = {
      values: [1]
      types:  ["uint256"]
    }

    c.log "#{methodName}(#{values.values.join(", ")}) called!"
    $.getJSON @methodGet(contract, methodName, values), (lastName) ->
      lastName = lastName.value
      c.log "getLast() //=> '#{lastName}'"



host = bappHost
api = new BApi host

c.log api.get()

# c.log User.all()

methodPost = (name) ->
  host = "http://#{bappHost}"
  "#{host}/api/#{contractName}/#{name}"

# TODO: TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
# TODO: a better option is to get the type from the parameter name     # TODO
# TODO: TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO


postJSON = (url, params, callback) ->
  $.post url, params, callback, 'json'

formElem = $("form#contact")

getParam = (param, params) ->
  par = _(params).find (p) ->
    p.name == param
  par.value

spinner = $ ".spinner"
info    = $ ".message"
submit  = $ "form#contact input[type='submit']"

setLoading = ->
  submit.attr "disabled", true
  spinner.css
    visibility: "visible"
  info.html "loading..."

setLoaded = (contract_address) ->
  spinner.css
    visibility: "hidden"
  info.html "We have received your message and we'll contact you shortly."

formElem.on "submit", (evt) ->
  evt.preventDefault()
  setLoading()

  params = formElem.serializeArray()

  values = {
    values: [email    , firstName, lastName ]
    types:  ["bytes32", "bytes32", "bytes32"]
  }

  c.log "addContact(#{values.values.join(", ")}) called!"

  postJSON methodPost("addContact"), values, (resp) ->
    c.log "addContact() //=> '#{JSON.stringify resp}'"
    if resp.success
      c.log "Success!!"
