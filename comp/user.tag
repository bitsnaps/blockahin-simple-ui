<user>
  <div class='row'>
    <div class='column'>
      <unsplash-cover store='{store}'></unsplash-cover>
    </div>
  </div>
  <div class='over-user'>
    <div class='box box-main'>
      <div class='row'>
        <div class='column'>
          <img class='avatar left' src='{ user.avatarLg }'>
          <div class='user-main-details left'>
            <h2>{ user.name }</h2>
            <h4>{ user.jobTitle() }</h4>
            <p>{ user.location }</p>
            <button>Send a message</button>
          </div>
          <div class='clear'></div>
        </div>
      </div>
      <div class='row'>
        <div class='column'>
          <div class='profile-link'>
            http://appii.io/profile.link
          </div>
        </div>
      </div>
    </div>
    <div class='s20'></div>
    <div class='box'>
      <h3>Background</h3>
      <div class='h3-space'></div>
      <div class='row'>
        <div class='column'>
          <p class='gray'>
            { user.bio || lipsum }
          </p>
          <p>
            <strong>Nationality:</strong>
            { user.nationality }
          </p>
        </div>
      </div>
    </div>
    <div class='s20'></div>
    <div class='box'>
      <h3>Skills</h3>
      <div class='h3-space'></div>
      <div class='row skills'>
        <div class='column' each='{ skill, level in skills }'>
          { s.capitalize(skill) } { _(Number(level)).times(stars).join("") }
        </div>
        <div class='column'>
          { noSkillsMessage() }
        </div>
      </div>
      <div class='clear'></div>
    </div>
    <div class='s50'></div>
    <div class='box'>
      <h3>Experience</h3>
      <div class='h3-space'></div>
      <section class='positions'>
        <div each='{ empl in empls }'>
          <h4>
            { empl.role != "-" ? empl.role : "Employee" }
            <span class="empl-status { empl.approved ? 'approved' : 'pending' } hint--bottom hint--rounded" data-hint='{ empl.approvedAtString() }'>
              { empl.approved ? '✓ approved' : '·	·	· &nbsp; pending approval' }
            </span>
          </h4>
          <h5>
            <a href='/#/orgs/{ empl.org.id }'>{ empl.org.name }</a>
          </h5>
          <p>{ empl.dateRange() }</p>
          <p>
            { empl.desc != "-" ? empl.desc : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies." }
          </p>
        </div>
      </section>
      <div class='row'>
        <div class='column'>
          { noPosMessage() }
        </div>
      </div>
    </div>
    <div class='s30'></div>
    <div class='box'>
      <div class='gray'>
        <h3>Education</h3>
        <div class='h3-space'></div>
        <h5>Degree in Astrophysics</h5>
        <h5>UCL</h5>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis.
        </p>
      </div>
    </div>
    <div class='s30'></div>
    <publicKeyUser store='{store}'></publicKeyUser>
  </div>
  <script>
    (function() {
      var entry_id;
    
      this.lipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sollicitudin, dui sit amet fermentum dapibus, dolor nulla sagittis tellus, vitae eleifend justo nisl imperdiet quam. Aenean et ornare velit. In est eros, sollicitudin id porta at, consequat quis quam. Accusamus rerum autem quas et asperiores cupiditate quasi libero. Qui et voluptatem rem omnis. Error et deleniti impedit culpa. Atque sunt consequatur dolore quisquam dolorem sequi. Voluptatem ea consequatur reiciendis corrupti eligendi.";
    
      entry_id = BR.getEntryId();
    
      BR.loadFromCollection("user", entry_id, this);
    
      this.stars = function(i) {
        return "★";
      };
    
      BR.prepare(opts, this, (function(_this) {
        return function() {
          var error, error1;
          _this.empls = _(StoreData.empls).select(function(empl) {
            return empl.userId === entry_id;
          });
          _(_this.empls).each(function(empl) {
            return empl.org = _(StoreData.orgs).find(function(org) {
              return empl.orgId === org.id;
            });
          });
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
