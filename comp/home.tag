<home>
  <div class='row'>
    <div class='column'>
      <h2>BlockedIn</h2>
    </div>
  </div>
  <div class='row'>
    <div class='column'>
      <p>
        BlockedIn is the right place to find your next position. If you are a Company looking to hire a new talent, that's the right place.
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies.
        <br>
        ctetur adipiscing elit. In consequat mauris et  elit. In consequat mauris et ante pretium ultricies.....
      </p>
    </div>
  </div>
  <div class='s20'></div>
  <div class='row'>
    <div class='column'>
      <h5>For Companies:</h5>
      <h3>Find a Professional</h3>
    </div>
  </div>
  <div class='row'>
    <div class='column'>
      <user-face each='{ users }'></user-face>
    </div>
  </div>
  <div class='s50'></div>
  <div class='row'>
    <div class='column'>
      <h5>For You:</h5>
      <h3>Find a Position</h3>
    </div>
  </div>
  <div class='row'>
    <div class='column'>
      <org-face each='{ orgs }'></org-face>
    </div>
  </div>
  <script>
    (function() {
      this.users = StoreData.users;
    
      this.store = opts.store;
    
      this.store.on('update', (function(_this) {
        return function(data) {
          _this.users = data.users.slice(0, 18);
          return _this.update();
        };
      })(this));
    
      this.orgs = StoreData.orgs;
    
      this.store = opts.store;
    
      this.store.on('update', (function(_this) {
        return function(data) {
          _this.orgs = data.orgs.slice(0, 18);
          return _this.update();
        };
      })(this));
    
    }).call(this);
  </script>
</home>
<user-face>
  <a class='hint--bottom hint--rounded' data-hint='{ jobTitle }' href='#/users/{ id }'>
    <img src='{ avatar }'>
  </a>
</user-face>
<org-face>
  <a class='hint--bottom hint--rounded' data-hint='{ name }' href='#/orgs/{ id }'>
    <img src='{ avatar }'>
  </a>
</org-face>
