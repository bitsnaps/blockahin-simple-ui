<user-new>
  <h4>Register:</h4>
  <form id='user_form' onsubmit='{ update }'>
    <label>
      <h2>
        <input class='big-text' name='jobTitle' placeholder='Your First and Last Name' type='text' value='{ user.name }'>
      </h2>
    </label>
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
          Bio:
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
      this.user = new User({});
    
      BR.bindCreateEntityForm("user", this);
    
    }).call(this);
  </script>
</user-new>
