# setup code
c =  console || { log: -> }

G = window # global namespace

class BApi
  constructor: (@host) ->
    @host = "http://#{@host}"
    @root = "#{@host}/api"

  methodGet: (contractName, name, values) ->
    query = $.param(values)
    "#{@root}/#{contractName}/#{name}?#{query}"

  getOld: (contract, methodName, id) ->
    values = {
      values: [id]
      types:  ["uint256"]
    }

    c.log "#{methodName}(#{values.values.join(", ")}) called!"
    new Promise (resolve, reject) =>
      $.getJSON @methodGet(contract, methodName, values)
        .fail reject
        .then (val) ->
          console.log "GET { contract: #{contract}, methodName: #{methodName}, values: #{values} } ( GET /contract/:contractId/:method?:PARAMS(:values)) })"
          resolve val.value

  # TODO: change id to values
  # values: {
  #   id: "antani",
  # }
  #
  # values: {
  #   id: 1,
  # }
  get: (contract, methodName, values) ->
    values = {
      values: [id]
      types:  ["uint256"]
    }

    c.log "#{methodName}(#{values.values.join(", ")}) called!"
    new Promise (resolve, reject) =>
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
