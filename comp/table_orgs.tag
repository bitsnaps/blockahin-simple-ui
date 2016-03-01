<table-orgs>
  <p>Search</p>
  <input name='query' onkeyup='{ filterOrgs }' placeholder='enter a company name, an industry or a location' type='text'>
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
  </input>
  <script>
    var matchString = (org) => {
      return s(`${org.name}|${org.industry}|${org.location}`).toLowerCase()
    }
    filterOrgs() {
      this.orgs = present(_(StoreData.orgs).select((org) => {
        return matchString(org).include(this.query.value.toLowerCase())
      }))
    }
    
    var present = (orgs) => {
      return _(orgs).map((org) => {
        org.employees = org.employees || Math.round(Math.random()*20+1)
        return org
      })
    }
    
    BR.prepare( opts, this, () => {
      this.orgs = present(StoreData.orgs)
    })
  </script>
</table-orgs>
