<user-edit>
  <div class='right'>
    <a class='button' href='/#/users/{ user.id }'>View Profile</a>
  </div>
  <h4>Edit your profile:</h4>
  <h2>{ user.name }</h2>
  <form id='user_form' onsubmit='{ update }'>
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
    </fieldset>
    <div class='column overlay_cont'>
      <label class='normal'>
        <p>Cover Photo (optional)</p>
        <img class='avatar' src='https://placeholdit.imgix.net/~text?bg=999&amp;txtclr=fff&amp;txt=Upload+a+Cover+Photo&amp;txtsize=25&amp;w=1200&amp;h=200&amp;fm=png' width='100%'>
        <input type='file'>
      </label>
    </div>
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
    
    }).call(this);
  </script>
</user-edit>
