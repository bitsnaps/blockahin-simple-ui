<home>
  <div class='row'>
    <div class='column'>
      <img class='hero full' src='/img/home_hero.jpg'>
    </div>
  </div>
  <div class='box'>
    <div class='row'>
      <div class='column'>
        <p>
          APPII is the right place to find your next position. If you are a Company looking to hire a new talent, that's the right place.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies.
          <br>
          ctetur adipiscing elit. In consequat mauris et  elit. In consequat mauris et ante pretium ultricies.....
          <br>
        </p>
      </div>
    </div>
  </div>
  <div class='s30'></div>
  <div class='box'>
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
    <div class='s20'></div>
  </div>
  <div class='s30'></div>
  <div class='box'>
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
  </div>
  <script>
    (function() {
      BR.prepare(opts, this, (function(_this) {
        return function() {
          return _this.users = StoreData.users.slice(0, 8);
        };
      })(this));
    
      BR.prepare(opts, this, (function(_this) {
        return function() {
          return _this.orgs = StoreData.orgs.slice(0, 8);
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
