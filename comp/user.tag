<user>
  <h2>{ user.name }</h2>
  <h4>{ user.jobTitle }</h4>
  <div class='row'>
    <div class='column'>
      <img src='{ user.avatarLg }'>
    </div>
    <div class='column'></div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum.
      { user.bio }
    </p>
  </div>
  <div class='s20'></div>
  <h3>Skills</h3>
  <div class='row'>
    <div class='column'>
      PHP ★★★★★
    </div>
    <div class='column'>
      CSS ★★★★
    </div>
    <div class='column'>
      HTML5 ★★★★
    </div>
    <div class='column'>
      MYSQL ★★★
    </div>
    <div class='column'>
      Linux ★★
    </div>
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
  <script>
    (function() {
      var user, user_id;
    
      user_id = s(location.hash).strRightBack("/").value();
    
      user_id = Number(user_id);
    
      user = _(Users).find(function(u) {
        return user_id === u.id;
      });
    
      this.user = user;
    
    }).call(this);
  </script>
</user>
