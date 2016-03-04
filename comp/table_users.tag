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
    (function() {
      var matchString;
    
      matchString = function(user) {
        return s(user.name + "|" + (user.jobTitle())).toLowerCase();
      };
    
      this.filterUsers = (function(_this) {
        return function() {
          return _this.users = _(StoreData.users).select(function(user) {
            return matchString(user).include(_this.query.value.toLowerCase());
          });
        };
      })(this);
    
      BR.prepare(opts, this, (function(_this) {
        return function() {
          return _this.users = StoreData.users;
        };
      })(this));
    
    }).call(this);
  </script>
</table-users>
