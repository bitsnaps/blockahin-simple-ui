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
      this.users = _(Users).select((user) => {
        return matchString(user).include(this.query.value)
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
    
    this.users = Users
  </script>
</table-users>
<user-row>
  <dtd>
    <a href='#/users/{ id }'>
      <img src='{ avatar }'>
    </a>
  </dtd>
  <dtd>
    <a href='#/users/{ id }'>
      { name }
    </a>
  </dtd>
  <dtd>{ jobTitle }</dtd>
</user-row>
