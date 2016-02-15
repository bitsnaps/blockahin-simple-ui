<org-edit>
  <h4>Edit organization:</h4>
  <h2>{ org.name }</h2>
  <form onsubmit='{ update }'>
    <h4>
      TODO
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
    
      this.prod_host = s(location.hostname).strLeft(".").value();
    
      entry_id = Number(this.prod_host[2]);
    
      BR.loadFromCollection("org", entry_id, "orgs", this);
    
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
</org-edit>
