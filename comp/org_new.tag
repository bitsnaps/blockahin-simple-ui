<org-new>
  <h4>New organization:</h4>
  <h2>{ org.name }</h2>
  <form id='org_form' onsubmit='{ update }'>
    <h5>
      <input class='big-text' name='name' placeholder='Organization Name' required type='text' value='{ user.name }'>
    </h5>
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
        <div class='row'>
          <div class='column column-20'>
            <label>
              <strong>Industry:</strong>
            </label>
          </div>
          <div class='column column-80'>
            <input name='industry' placeholder='Business industry' type='text' value='{ org.industry }'>
          </div>
        </div>
      </div>
    </div>
    <fieldset>
      <label>
        Email
        <input name='email' placeholder='you@email.com' type='email'>
      </label>
      <input class='left button-primary' onclick='{ update }' type='submit' value='Register'>
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
      this.org = new Org({});
    
      BR.bindCreateEntityForm("org", this);
    
    }).call(this);
  </script>
</org-new>
