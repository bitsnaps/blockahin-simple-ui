<table-users>
  <p>Search</p>
  <input name='query' onkeyup='{ filterUsers }' placeholder='enter a skill or a location' type='text'>
    <dtable>
      <user-row each='{ users }'></user-row>
    </dtable>
  </input>
  <script>
    var matchString = (user) => {
      return s(`${user.name}|${user.jobTitle}`).toLowerCase()
    }
    filterUsers() {
      this.users = _(StoreData.users).select((user) => {
        return matchString(user).include(this.query.value.toLowerCase())
      })
    }
    
    this.on('mount', function() {
      $("dtable").prepend("    \
        <user-row>             \
          <dtd></dtd>          \
          <dtd>Name</dtd>      \
          <dtd>Job title</dtd> \
        </user-row>            \
      ")
    })
    
    this.users = StoreData.users
    
    var self = this
    this.store = opts.store
    this.store.on('update', function(data) {
      self.users = data.users
      self.update()
    })
  </script>
</table-users>
<user-row>
  <dtd>
    <a href='#/users/{ id }'>
      <img class='avatar' src='{ avatar }'>
    </a>
  </dtd>
  <dtd>
    <a href='#/users/{ id }'>
      { name }
    </a>
  </dtd>
  <dtd>{ jobTitle }</dtd>
</user-row>
