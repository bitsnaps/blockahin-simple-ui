class User extends BAppModel
  constructor: ({ @id, @name, @publicKey, @location, @achievements, @birthDate, @gender, @nationality }) ->

  args: ["id", "name", "publicKey", "location", "achievements", "birthDate", "gender", "nationality"]

class Org extends BAppModel
  constructor: ({ @id, @name, @publicKey, @orgType, @location, @industry }) ->

  args: ["id", "name", "publicKey", "orgType", "location", "industry"]

class Employment extends BAppModel
  constructor: ({ @id, @userId, @orgId, @role, @dateStart, @dateEnd, @reportsTo, @budget, @skills }) ->

  args: ["id", "userId", "orgId", "role", "dateStart", "dateEnd", "reportsTo", "budget", "skills"]
