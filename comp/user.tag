<user>
  <div class='row'>
    <div class='column'>
      <unsplash-cover></unsplash-cover>
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
  <div class='gray'>
    <h3>Skills</h3>
    <div class='row'>
      <div class='column' each='{ skills }'></div>
      <!-- skills = { php: 5, css: 4, } -->
      <!--
        <div class='column'>
          PHP ★★★★★
        </div>
        <div class='column'>
          CSS ★★★★
        </div>
      -->
    </div>
    <div class='row'>
      <div class='column'>
        Apache ★★★
      </div>
      <div class='column'>
        Nginx ★
      </div>
      <div class='column'>
        Photoshop ★★★★
      </div>
      <div class='column'>
        Illustrator ★★★
      </div>
      <div class='column'></div>
    </div>
    <div class='clear'></div>
    <div class='s30'></div>
    <h3>Positions</h3>
    <h5>PHP Developer</h5>
    <h5>ACME</h5>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis.
    </p>
    <div class='s30'></div>
    <h3>Education</h3>
    <h5>Degree in Astrophysics</h5>
    <h5>UCL</h5>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis.
    </p>
  </div>
  <script>
    (function() {
      var entry_id;
    
      entry_id = BR.getEntryId();
    
      BR.loadFromCollection("user", entry_id, this);
    
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
