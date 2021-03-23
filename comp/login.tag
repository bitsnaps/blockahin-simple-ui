<login>

  <h4>Sign In</h4>

  <form id='login_form' onsubmit='{ update }'>
    <h5>
      <input class='big-text' name='name' placeholder='User Name' required type='text' value='{ user.name }'>
    </h5>
    <fieldset>
      <h5>
        <input class='big-text' name='email' placeholder='your@email.com' type='email'>
      </h5>
      <input class='left button-primary' onclick='{ update }' type='submit' value='Login'>
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

    }).call(this);
  </script>

</login>
