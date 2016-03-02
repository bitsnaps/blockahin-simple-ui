class User extends BAppModel
  constructor: ({ @id, @name, @publicKey, @location, @achievements, @birthDate, @gender, @nationality, @skills }) ->

  @attrs: ["id", "name", "publicKey", "location", "achievements", "birthDate", "gender", "nationality", "skills"]

  empls: ->
    employments = _(StoreData.empls).select (empl) =>
      empl.userId == @id
    employments.reverse()

  jobTitle: ->
    empl = @empls()[0]
    return "Employee" unless empl
    empl.role

class Org extends BAppModel
  constructor: ({ @id, @name, @publicKey, @orgType, @location, @industry }) ->

  @attrs: ["id", "name", "publicKey", "orgType", "location", "industry"]

class Empl extends BAppModel
  constructor: ({ @id, @userId, @orgId, @dateStart, @dateEnd, @role, @reportsTo, @budget, @desc, @approved, @approvedAt }) ->

  @collectionUp = -> "Employments"

  @attrs: ["id", "userId", "orgId", "dateStart", "dateEnd", "role", "reportsTo", "budget", "desc", "approved", "approvedAt"]

  @attrsSave: ["id", "userId", "orgId", "dateStart", "dateEnd", "role", "reportsTo", "budget", "desc"]

  # presentation (presenter logic)

  dateLocale: (date) ->
    return null if isNaN date
    date.toLocaleDateString()

  dateStartLoc: ->
    @dateLocale new Date @dateStart

  dateEndLoc: ->
    @dateLocale new Date @dateEnd

  dateRange: ->
    "from #{@dateStartLoc() || "unknown"} to #{@dateEndLoc() || "present"}"

  approvedAtString: ->
    date = new Date @approvedAt
    "approved on #{date.toLocaleDateString()}"

  @approve: (id) ->
    now = new Date().toISOString()
    API.post @collection(), "approve", { id: id, _approvedAt: now }
