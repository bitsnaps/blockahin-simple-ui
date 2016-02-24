class User extends BAppModel
  constructor: ({ @id, @name, @publicKey, @location, @achievements, @birthDate, @gender, @nationality, @skills }) ->

  @attrs: ["id", "name", "publicKey", "location", "achievements", "birthDate", "gender", "nationality", "skills"]

class Org extends BAppModel
  constructor: ({ @id, @name, @publicKey, @orgType, @location, @industry }) ->

  @attrs: ["id", "name", "publicKey", "orgType", "location", "industry"]

class Employment extends BAppModel
  constructor: ({ @id, @userId, @orgId, @role, @dateStart, @dateEnd, @reportsTo, @budget, @desc }) ->

  @attrs: ["id", "userId", "orgId", "role", "dateStart", "dateEnd", "reportsTo", "budget", "desc"]
