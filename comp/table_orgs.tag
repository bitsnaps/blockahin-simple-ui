<table-orgs>
  <div class='box'>
    <p>Search</p>
    <input name='query' onkeyup='{ filterOrgs }' placeholder='enter a company name, an industry or a location' type='text'>
    <div class='s10'></div>
  </div>
  <div class='s30'></div>
  <div class='box'>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Industry</th>
          <th>Location</th>
          <th>Employees</th>
        </tr>
      </thead>
      <tr each='{orgs}'>
        <td>
          <a href='#/orgs/{ id }'>
            <img class='avatar' src='{ avatar }'>
          </a>
        </td>
        <td>
          <a href='#/orgs/{ id }'>
            { name }
          </a>
        </td>
        <td>{ industry }</td>
        <td>{ location }</td>
        <td>{ employees }</td>
      </tr>
    </table>
  </div>
  <script>
    (function() {
      var matchString, present;
    
      present = function(orgs) {
        return _(orgs).map(function(org) {
          org.employees = org.employees || Math.round(Math.random() * 20 + 1);
          return org;
        });
      };
    
      matchString = function(org) {
        return s(org.name + "|" + org.industry + "|" + org.location).toLowerCase();
      };
    
      this.filterOrgs = (function(_this) {
        return function() {
          return _this.orgs = _(StoreData.orgs).select(function(org) {
            return matchString(org).include(_this.query.value.toLowerCase());
          });
        };
      })(this);
    
      BR.prepare(opts, this, (function(_this) {
        return function() {
          return _this.orgs = present(StoreData.orgs);
        };
      })(this));
    
    }).call(this);
  </script>
</table-orgs>
