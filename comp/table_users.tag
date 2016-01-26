<table-users>

  <p>Search</p>
  <input name="query" type="text" onkeyup="{ filterUsers }" placeholder="enter a skill or a location">

  Skills

  <dtable>
    <user-row each={ users }></user-row>
  </dtable>

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

  <style>
    dtable{
      display:table;
      width: 100%;
      margin-bottom: 2.5rem;
    }
    ddtr, user-row{
      display:table-row;
    }
    dtd, dth {
      display:table-cell;
      border-bottom: 0.1rem solid #e1e1e1;
      padding: 1.2rem 1.5rem;
      text-align: left;
      vertical-align: middle;
    }
    dth:first-child, dtd:first-child {
      padding-left: 0;
    }
    dth:last-child, dtd:last-child {
      padding-right: 0;
    }
  </style>

</table-users>

<user-row>
  <dtd>
    <a href="#/users/{ id }">
      <img src="{ avatar }" />
    </a>
  </dtd>
  <dtd>
    <a href="#/users/{ id }">
      { name }
    </a>
  </dtd>
  <dtd>{ jobTitle }</dtd>

  <style>

  </style>
</user-row>
