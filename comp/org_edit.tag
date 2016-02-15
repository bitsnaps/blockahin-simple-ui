<profile>
  <h4>Edit:</h4>
  <h2>{ org.name }</h2>
  <form onsubmit='{ update }'>
    <h4>
      bla
    </h4>
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
    
      entry_id = 3;
    
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
</profile>
