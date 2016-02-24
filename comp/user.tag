<user>
  <div class='row'>
    <div class='column'>
      <unsplash-cover store='{store}'></unsplash-cover>
    </div>
  </div>
  <div class='row'>
    <div class='column centered avatar-box'>
      <img class='avatar' src='{ user.avatarLg }'>
      <h2>{ user.name }</h2>
      <h4>{ user.jobTitle }</h4>
    </div>
    <div class='avatar-spacer'></div>
  </div>
  <div class='row'>
    <div class='column'>
      <p class='gray'>
        { user.bio }
      </p>
      <p>
        <strong>Location:</strong>
        { user.location }
      </p>
      <p>
        <strong>Nationality:</strong>
        { user.nationality }
      </p>
    </div>
  </div>
  <div class='s20'></div>
  <h3>Skills</h3>
  <div class='row'>
    <div class='column' each='{ skill, level in skills }'>
      { s.capitalize(skill) } { _(Number(level)).times(stars).join("") }
    </div>
    <div class='column'>
      { noSkillsMessage() }
    </div>
  </div>
  <div class='clear'></div>
  <div class='s30'></div>
  <h3>Positions</h3>
  <section each='{ empl in empls }'>
    <h5>{ empl.role }</h5>
    <h5>
      <a href='/#/orgs/{ empl.org.id }'>{ empl.org.name }</a>
    </h5>
    <p>
      { empl.desc || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies." }
    </p>
  </section>
  <div class='row'>
    <div class='column'>
      { noPosMessage() }
    </div>
  </div>
  <div class='gray'>
    <div class='s30'></div>
    <h3>Education</h3>
    <h5>Degree in Astrophysics</h5>
    <h5>UCL</h5>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis.
    </p>
  </div>
  <publicKeyUser store='{store}'></publicKeyUser>
  <script>
    (function() {
      var entry_id;
    
      entry_id = BR.getEntryId();
    
      BR.loadFromCollection("user", entry_id, this);
    
      this.stars = function(i) {
        return "★";
      };
    
      BR.prepare(opts, this, (function(_this) {
        return function() {
          var error, error1;
          _this.empls = _(StoreData.empl).select(function(empl) {
            return empl.userId === entry_id;
          });
          _(_this.empls).each(function(empl) {
            return empl.org = _(StoreData.orgs).find(function(org) {
              return empl.orgId === org.id;
            });
          });
          c.log(_this.empls);
          if (_this.user) {
            try {
              return _this.skills = JSON.parse(_this.user.skills);
            } catch (error1) {
              error = error1;
              return c.error("Skills JSON is invalid: " + error);
            }
          }
        };
      })(this));
    
      this.noSkillsMessage = function() {
        if (!this.skills || _(this.skills).keys().length === 0) {
          return "No skills present for this user.";
        }
      };
    
      this.noPosMessage = function() {
        if (!this.empls || this.empls.length === 0) {
          return "This user has no positions listed in his profile.";
        }
      };
    
    }).call(this);
  </script>
  <style>
    .avatar-box {
      position: absolute;
      top: 180px;
      left: 0; }
    
    .avatar-box img {
      border: 15px solid #FFF;
      box-shadow: 0 0 22px 0 #777; }
    
    .avatar-spacer {
      height: 180px; }
  </style>
</user>
<publicKeyUser>
  <div class='row'>
    <div class='column right'>
      <p>
        <div class='hint--bottom-left hint--rounded icon-mini' data-hint='{ user.publicKey }'>🔑</div>
        <br>
        <span class='hint--bottom-left hint--rounded' data-hint='{ user.publicKey }'>publicKey</span>
        <br>
        <span class='hint--bottom-left hint--rounded' data-hint='{ user.publicKey }'>{ user.publicKeyShort }</span>
      </p>
    </div>
  </div>
  <script>
    (function() {
      var entry_id;
    
      entry_id = BR.getEntryId();
    
      BR.loadFromCollection("user", entry_id, this, presentUser);
    
    }).call(this);
  </script>
</publicKeyUser>
