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
    
    this.on('mount', function() {
      $("dtable").prepend("    \
        <org-row>             \
          <dtd></dtd>          \
          <dtd>Name</dtd>      \
          <dtd>Employees</dtd> \
        </org-row>            \
      ")
    })
    
    this.orgs = Orgs
  </script>
</table-orgs>
<org-row>
  <dtd>
    <a href='#/orgs/{ id }'>
      <img src='{ avatar }'>
    </a>
  </dtd>
  <dtd>
    <a href='#/orgs/{ id }'>
      { name }
    </a>
  </dtd>
  <dtd>{ employees }</dtd>
</org-row>
