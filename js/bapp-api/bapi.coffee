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
API = new BApi host

c.log api.get()

# c.log User.all()


# TODO: post

#
# methodPost = (name) ->
#   host = "http://#{bappHost}"
#   "#{host}/api/#{contractName}/#{name}"
#
# postJSON = (url, params, callback) ->
#   $.post url, params, callback, 'json'
#
# formElem = $("form#contact")
# formElem.on "submit", (evt) ->
#   evt.preventDefault()
#   setLoading()
#
#   params = formElem.serializeArray()
#
#   values = {
#     values: [email    , firstName, lastName ]
#     types:  ["bytes32", "bytes32", "bytes32"]
#   }
#
#   c.log "addContact(#{values.values.join(", ")}) called!"
#
#   postJSON methodPost("addContact"), values, (resp) ->
#     c.log "addContact() //=> '#{JSON.stringify resp}'"
#     if resp.success
#       c.log "Success!!"
