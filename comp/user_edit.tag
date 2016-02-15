<user-edit>
  <h4>Edit your profile:</h4>
  <h2>{ user.name }</h2>
  <form onsubmit='{ update }'>
    <h4>
      <input class='big-text' name='jobTitle' placeholder='Your current Job Title' type='text' value='{ user.jobTitle }'>
    </h4>
    <div class='row'>
      <div class='column overlay_cont'>
        <label class='normal'>
          <img class='avatar' src='{ user.avatarLg }'>
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
              <strong>Location:</strong>
            </label>
          </div>
          <div class='column column-80'>
            <input name='location' placeholder='Your City, Planet Earth' type='text' value='{ user.location }'>
          </div>
        </div>
        <div class='row'>
          <div class='column column-20'>
            <label>
              <strong>Nationality:</strong>
            </label>
          </div>
          <div class='column column-80'>
            <input name='nationality' placeholder='Your country of Origin' type='text' value='{ user.nationality }'>
          </div>
        </div>
      </div>
    </div>
    <fieldset>
      <label>
        Email
        <input name='email' placeholder='you@email.com' type='email'>
      </label>
      <label>
        Gender
        <input name='gender' placeholder='M / F' type='text' value='{ user.gender }'>
      </label>
      <label>
        Cover letter
        <textarea placeholder='A generic cover letter you want to send to your ideal employer, why you are suited for the job.'></textarea>
      </label>
      <input class='left button-primary' onclick='{ update }' type='submit' value='Save'>
      <div class='spinner'>
        <div class='rect1'></div>
        <div class='rect2'></div>
        <div class='rect3'></div>
        <div class='rect4'></div>
        <div class='rect5'></div>
      </div>
      <div class='message'>{ message }</div>
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
      var entry_id;
    
      -(entry_id = 2);
    
      BR.loadFromCollection("user", entry_id, "users", this);
    
      this.message = "";
    
      this.on('mount', (function(_this) {
        return function(data) {
          var spinner;
          spinner = $(".spinner");
          return $("input[type=submit]").on("click", function(evt) {
            var newValues, userValues, values;
            spinner.css({
              visibility: "visible"
            });
            values = $("profile form").serializeArray();
            newValues = {};
            _(values).each(function(entry) {
              return newValues[entry.name] = entry.value;
            });
            _(newValues).each(function(value, key) {
              if (_this.user.hasAttribute(key)) {
                return _this.user[key] = value;
              }
            });
            userValues = {};
            _(_this.user).each(function(value, key) {
              if (_this.user.hasAttribute(key)) {
                return userValues[key] = value;
              }
            });
            c.log("Updating user:", _this.user);
            return User.update(userValues).then(function(resp) {
              c.log("User updated:", resp);
              spinner.css({
                visibility: "hidden"
              });
              return $(".message").html("saved!");
            })["catch"](function(error) {
              return c.log("Error updating current User:", error);
            });
          });
        };
      })(this));
    
    }).call(this);
  </script>
</user-edit>
