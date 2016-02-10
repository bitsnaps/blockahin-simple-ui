<profile>
  <h2>Edit your profile: { user.name }</h2>
  <h4>{ user.jobTitle }</h4>
  <div class='row'>
    <div class='column overlay_cont'>
      <label class='normal'>
        <img src='{ user.avatarLg }'>
        <div class='icon overlay white'>📷</div>
        <input type='file'>
      </label>
    </div>
    <div class='column column-80'>
      <p class='border' contentEditable>
        Bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum.
        { user.bio }
      </p>
      <div class='row'>
        <div class='column column-20'>
          <label>
            Location:
          </label>
        </div>
        <div class='column column-80'>
          <div class='border' contentEditable>
            { user.location }
          </div>
        </div>
      </div>
      <div class='row'>
        <div class='column column-20'>
          <label>
            Nationality:
          </label>
        </div>
        <div class='column column-80'>
          <div class='border' contentEditable>
            { user.nationality }
          </div>
        </div>
      </div>
    </div>
  </div>
  <form>
    <fieldset>
      <label>
        Email
        <input placeholder='you@email.com' type='email'>
      </label>
      <label>
        Gender
        <input placeholder='M / F' type='text' value='{ user.gender }'>
      </label>
      <label>
        Cover letter
        <textarea placeholder='A generic cover letter you want to send to your ideal employer, why you are suited for the job.'></textarea>
      </label>
      <input class='button-primary' type='submit' value='Save'>
    </fieldset>
  </form>
  <style scoped>
    :scope *[contentEditable]  {
      display: block;
      margin-bottom: 12px;
    }
    :scope label {
      margin-top: 10px;
    }
    :scope input[type=file] {
      display: none;
    }
  </style>
  <script>
    (function() {
      var self, user, user_id;
    
      user_id = 2;
    
      self = this;
    
      this.users = StoreData.users;
    
      user = _(self.users).find(function(u) {
        return user_id === u.id;
      });
    
      self.user = user;
    
      self.update();
    
      this.store = opts.store;
    
      this.store.on('update', function(data) {
        self.users = data.users;
        user = _(self.users).find(function(u) {
          return user_id === u.id;
        });
        self.user = user;
        return self.update();
      });
    
    }).call(this);
  </script>
</profile>
