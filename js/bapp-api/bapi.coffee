# setup code
c =  console || { log: -> }

G = window # global namespace

class BApi
  constructor: (@host) ->
    @host = "http://#{@host}"
    @root = "#{@host}/api"

  methodGet: (contractName, name, values) ->
    query = ""
    query = $.param(values) if values?
    "#{@root}/#{contractName}/#{name}?#{query}"

  get: (contract, methodName, values) ->
    new Promise (resolve, reject) =>
      c.log "#{methodName}(#{JSON.stringify values}) called!"
      $.getJSON @methodGet(contract, methodName, values)
        .fail reject
        .then (val) ->
          console.log "GET { contract: #{contract}, methodName: #{methodName}, values: #{values} } ( GET /contract/:contractId/:method?:PARAMS(:values)) })"
          resolve val.value

# --------------

# api = API
# api.get("users", "get", 1)
#   .then (value) ->
#     c.log value
#   .fail (error) ->
#     c.error "Error: #{error}"


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
