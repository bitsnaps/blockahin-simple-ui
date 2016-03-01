<table-users>
  <p>Search</p>
  <input name='query' onkeyup='{ filterUsers }' placeholder='enter a skill or a location' type='text'>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Job title</th>
        </tr>
      </thead>
      <tr each='{users}'>
        <td>
          <a href='#/users/{ id }'>
            <img class='avatar' src='{ avatar }'>
          </a>
        </td>
        <td>
          <a href='#/users/{ id }'>
            { name }
          </a>
        </td>
        <td>{ jobTitle() }</td>
      </tr>
    </table>
  </input>
  <script>
    var matchString = (user) => {
      return s(`${user.name}|${user.jobTitle()}`).toLowerCase()
    }
    filterUsers() {
      this.users = _(StoreData.users).select((user) => {
        return matchString(user).include(this.query.value.toLowerCase())
      })
    }
    
    BR.prepare( opts, this, () => {
      this.users = StoreData.users
    })
  </script>
</table-users>
