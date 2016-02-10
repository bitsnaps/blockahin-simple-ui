Users = []

# Org.all()

Orgs = []

Orgs = _(Orgs).map (entity) =>
  new Org(entity)

identicon = (entity, size) ->
  sizePx = 80
  sizePx = 150 if size == "large"
  id = md5 entity.id.toString()
  icon = new Identicon(id, sizePx).toString()
  "data:image/png;base64,#{icon}"

genOrgAvatars = (entities) ->
  _(entities).map (entity) ->
    entity.avatar   = identicon entity
    entity.avatarLg = identicon entity, "large"
    entity

fetchUserAvatars = (users) ->
  _(users).map (user) ->
    gender = if user.gender.toLowerCase() == "f" then "women" else "men"
    user.avatar   = "http://api.randomuser.me/portraits/thumb/#{gender}/#{user.id}.jpg"
    user.avatarLg = "http://api.randomuser.me/portraits/med/#{gender}/#{user.id}.jpg"
    user

TMP_JOB_TITLES = ["Graphic Designer", "Software Developer", "Mathematician", "Biologist", "Engineer", "Trader", "Accountant", "Video Editor", "Cameraman", "Illustrator", "SEO", "Social Media Expert", "Copywriter", "Writer", "Editor"]



addTmpJobTitle  = (users) ->
  _(users).map (user) ->
    user.jobTitle = _.sample TMP_JOB_TITLES
    user

# Orgs = genAvatars Orgs

Unis = []

StoreData =
  users: Users
  orgs:  Orgs
  unis:  Unis

Store = ->
  @update = (StoreData) ->
    this.trigger 'update', StoreData

  riot.observable this
  setTimeout =>
    @update StoreData
  , 0


  # initialState ----------------------------

  Org.all()
    .then (orgs) =>
      orgs = genOrgAvatars orgs
      StoreData.orgs = orgs
      @update StoreData
    .catch (error) ->
      c.error "Error: #{error}"

  User.all()
    .then (users) =>
      users = fetchUserAvatars users
      users = addTmpJobTitle users
      StoreData.users = users
      @update StoreData
    .catch (error) ->
      c.error "Error: #{error}"

  # -----------------------------------------

  return this
