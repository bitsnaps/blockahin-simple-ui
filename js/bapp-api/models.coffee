class User extends BAppModel
  constructor: ({ @id, @name, @publicKey, @location, @achievements, @birthDate, @gender, @nationality, @skills }) ->

  @attrs: ["id", "name", "publicKey", "location", "achievements", "birthDate", "gender", "nationality", "skills"]

class Org extends BAppModel
  constructor: ({ @id, @name, @publicKey, @orgType, @location, @industry }) ->

  @attrs: ["id", "name", "publicKey", "orgType", "location", "industry"]

class Empl extends BAppModel
  constructor: ({ @id, @userId, @orgId, @dateStart, @dateEnd, @role, @reportsTo, @budget, @desc }) ->

  @collectionUp = -> "Employments"

  @attrs: ["id", "userId", "orgId", "dateStart", "dateEnd", "role", "reportsTo", "budget", "desc"]
