<org-edit>
  <h4>Edit organization:</h4>
  <h2>{ org.name }</h2>
  <form id='org_form' onsubmit='{ update }'>
    <div class='row'>
      <div class='column overlay_cont'>
        <label class='normal'>
          <img class='avatar' src='{ org.avatarLg }'>
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
            <input name='location' placeholder='Your City, Planet Earth' type='text' value='{ org.location }'>
          </div>
        </div>
      </div>
    </div>
    <fieldset>
      <label>
        Email
        <input name='email' placeholder='you@email.com' type='email'>
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
      var entry_id, present;
    
      this.prod_host = s(location.hostname).strLeft(".").value();
    
      entry_id = Number(this.prod_host[2]) || 1;
    
      present = function(org) {
        if (org) {
          org = genOrgAvatar(org);
        }
        return org;
      };
    
      BR.loadFromCollection("org", entry_id, this, present);
    
      BR.bindUpdateEntityForm("org", entry_id, this);
    
    }).call(this);
  </script>
</org-edit>
