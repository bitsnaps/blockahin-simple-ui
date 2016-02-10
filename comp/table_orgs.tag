<table-orgs>
  <p>Search</p>
  <input name='query' onkeyup='{ filterOrgs }' placeholder='enter a skill or a location' type='text'>
    <dtable>
      <org-row each='{ orgs }'></org-row>
    </dtable>
  </input>
  <script>
    var matchString = (org) => {
      return s(`${org.name}|${org.jobTitle}`).toLowerCase()
    }
    filterOrgs() {
      this.orgs = _(Orgs).select((org) => {
        return matchString(org).include(this.query.value)
      })
    }
    
    var self = this
    
    this.on('mount', function() {
      $("dtable").prepend("    \
        <org-row>             \
          <dtd></dtd>          \
          <dtd>Name</dtd>      \
          <dtd>Employees</dtd> \
        </org-row>            \
      ")
    })
    
    this.orgs = StoreData.orgs
    
    var self = this
    this.store = opts.store
    this.store.on('update', function(data) {
     self.orgs = data.orgs
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
  <dtd>{ employees }</dtd>
</org-row>
