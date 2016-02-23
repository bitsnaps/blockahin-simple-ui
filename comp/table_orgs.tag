<table-orgs>
  <p>Search</p>
  <input name='query' onkeyup='{ filterOrgs }' placeholder='enter a company name, an industry or a location' type='text'>
    <dtable>
      <org-row each='{ orgs }'></org-row>
    </dtable>
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
    
    var self = this
    
    this.on('mount', function() {
      $("dtable").prepend("    \
        <org-row>             \
          <dtd></dtd>          \
          <dtd>Name</dtd>      \
          <dtd>Industry</dtd> \
          <dtd>Location</dtd> \
          <dtd>Employees</dtd> \
        </org-row>            \
      ")
    })
    
    this.orgs = present(StoreData.orgs)
    
    var self = this
    this.store = opts.store
    this.store.on('update', function(data) {
     self.orgs = present(data.orgs)
     self.update()
    })
  </script>
</table-orgs>
<org-row>
  <dtd>
    <a href='#/orgs/{ id }'>
      <img class='avatar' src='{ avatar }'>
    </a>
  </dtd>
  <dtd>
    <a href='#/orgs/{ id }'>
      { name }
    </a>
  </dtd>
  <dtd>{ industry }</dtd>
  <dtd>{ location }</dtd>
  <dtd>{ employees }</dtd>
</org-row>
