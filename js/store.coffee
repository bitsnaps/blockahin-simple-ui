Users = [
    id:       1
    name:     "Stephanie Curry"
    avatar:   "http://api.randomuser.me/portraits/thumb/women/0.jpg"
    avatarLg: "http://api.randomuser.me/portraits/med/women/0.jpg"
    jobTitle: "Software Developer"
  ,
    id:       2
    name:     "Klay Thompson"
    avatar:   "http://api.randomuser.me/portraits/thumb/men/3.jpg"
    avatarLg: "http://api.randomuser.me/portraits/med/men/3.jpg"
    jobTitle: "Graphic Designer"
  ,
    id:       3
    name:     "Catherine Thompson"
    avatar:   "http://api.randomuser.me/portraits/thumb/women/2.jpg"
    avatarLg: "http://api.randomuser.me/portraits/med/women/2.jpg"
    jobTitle: "Engineer"
  ,
    id:       4
    name:     "Garret Albert"
    avatar:   "http://api.randomuser.me/portraits/thumb/men/1.jpg"
    avatarLg: "http://api.randomuser.me/portraits/med/men/1.jpg"
    jobTitle: "Mathematician"
  ,
    id:       5
    name:     "Carla Farad"
    avatar:   "http://api.randomuser.me/portraits/thumb/women/4.jpg"
    avatarLg: "http://api.randomuser.me/portraits/med/women/4.jpg"
    jobTitle: "Biologist"
  ,
]


# Org.all()

Orgs = [
    id:        1
    name:      "test1"
    employees: 1
  ,
    id:        2
    name:      "test2"
    employees: 3
  ,
]

identicon = (entity, size) ->
  sizePx = 80
  sizePx = 150 if size == "large"
  id = md5 entity.id.toString()
  icon = new Identicon(id, sizePx).toString()
  "data:image/png;base64,#{icon}"

genAvatars = (entities) ->
  _(entities).map (entity) ->
    entity.avatar   = identicon entity
    entity.avatarLg = identicon entity, "large"
    entity

Orgs = genAvatars Orgs

Unis = [

]
