<user-edit>
  <div class='right'>
    <a class='button' href='/#/users/{ user.id }'>View Profile</a>
  </div>
  <h4>Edit your profile:</h4>
  <h2>{ user.name }</h2>
  <form id='user_form' onsubmit='{ update }'>
    <div class='row'>
      <div class='column overlay_cont'>
        <label class='normal'>
          <img class='avatar' src='{ user.avatarLg }'>
          <div class='icon overlay white'>📷</div>
          <input type='file'>
        </label>
      </div>
      <div class='column column-80'>
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
        Gender
        <input name='gender' placeholder='M / F' type='text' value='{ user.gender }'>
      </label>
    </fieldset>
    <input class='left button-primary' onclick='{ update }' type='submit' value='Save'>
    <div class='spinner'>
      <div class='rect1'></div>
      <div class='rect2'></div>
      <div class='rect3'></div>
      <div class='rect4'></div>
      <div class='rect5'></div>
    </div>
    <div class='message'>{ message }</div>
  </form>
  <div class='clear'></div>
  <section>
    <h1>Positions</h1>
    <a class='button' onclick=''>Add Position</a>
    <form>
      <fieldset>
        <label>
          Company
          <select name='org[name]'>
            <option each='{ org in orgs }'>
              { org.name }
            </option>
          </select>
        </label>
        <label>
          From
          <input name='dateStart' placeholder='{ today }' type='text' value='{ emp.dateStart }'>
        </label>
        <label>
          To
          <input name='dateEnd' placeholder='{ today }' type='text' value='{ emp.dateEnd }'>
        </label>
        <label>
          Role
          <input name='role' placeholder='Your position' type='text' value='{ emp.role }'>
        </label>
        <label>
          Description (opt.)
          <textarea name='desc' placeholder='You can describe your role briefly' type='text' value='{ emp.desc }'></textarea>
        </label>
        <input class='left button-primary' onclick='{ update }' type='submit' value='Save'>
      </fieldset>
    </form>
  </section>
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
    
      entry_id = 2;
    
      BR.loadFromCollection("user", entry_id, this);
    
      BR.bindUpdateEntityForm("user", entry_id, this);
    
      this.orgs = StoreData.orgs;
    
      this.store = opts.store;
    
      this.store.on('update', (function(_this) {
        return function(data) {
          _this.orgs = StoreData.orgs;
          return _this.update();
        };
      })(this));
    
      this.today = new Date().toLocaleDateString();
    
      this.emp = {};
    
    }).call(this);
  </script>
</user-edit>
