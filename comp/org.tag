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
  <div class='s20'></div>
  <div class='row'>
    <div class='column'>
      <p>
        <strong>Industry:</strong>
        { org.industry }
      </p>
    </div>
  </div>
  <div class='row'>
    <div class='column'>
      <p>
        <strong>Location:</strong>
        { org.location }
      </p>
    </div>
  </div>
  <div class='row'>
    <div class='column'>
      <p>
        <strong>Extra:</strong>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum.
      </p>
    </div>
  </div>
  <div class='row'>
    <div class='column right'>
      <p>
        organization type
        <br>
        { org.orgType }
      </p>
      <p>
        publicKey
        <br>
        <span class='hint--bottom-left hint--rounded' data-hint='{ org.publicKey }'>{ org.publicKeyShort }</span>
      </p>
    </div>
  </div>
  <script>
    (function() {
      var org, org_id, present;
    
      present = function(org) {
        if (org) {
          org.publicKeyShort = org.publicKey.slice(0, 9) + "..." + org.publicKey.slice(-6);
        }
        return org;
      };
    
      org_id = s(location.hash).strRightBack("/").value();
    
      org_id = Number(org_id);
    
      this.orgs = StoreData.orgs;
    
      org = _(this.orgs).find((function(_this) {
        return function(o) {
          return org_id === o.id;
        };
      })(this));
    
      org = present(org);
    
      this.org = org;
    
      this.update();
    
      this.store = opts.store;
    
      this.store.on('update', (function(_this) {
        return function(data) {
          _this.orgs = data.orgs;
          org = _(_this.orgs).find(function(o) {
            return org_id === o.id;
          });
          org = present(org);
          _this.org = org;
          return _this.update();
        };
      })(this));
    
    }).call(this);
  </script>
</org>
