<org>
  <h2>{ org.name }</h2>
  <div class='row'>
    <div class='column'>
      <img class='avatar' src='{ org.avatarLg }'>
    </div>
    <div class='column'></div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum.
    </p>
  </div>
  <script>
    (function() {
      var org, org_id, self;
    
      org_id = s(location.hash).strRightBack("/").value();
    
      org_id = Number(org_id);
    
      self = this;
    
      this.orgs = StoreData.orgs;
    
      org = _(self.orgs).find(function(o) {
        return org_id === o.id;
      });
    
      self.org = org;
    
      self.update();
    
      this.store = opts.store;
    
      this.store.on('update', function(data) {
        self.orgs = data.orgs;
        org = _(self.orgs).find(function(o) {
          return org_id === o.id;
        });
        self.org = org;
        return self.update();
      });
    
    }).call(this);
  </script>
</org>
