<org>
  <div class='s20'></div>
  <div class='box main-box'>
    <div class='row'>
      <div class='left'>
        <img class='avatar' src='{ org.avatarLg }'>
      </div>
      <div class='left lpad'>
        <h2>
          { org.name }
        </h2>
        <p>
          { org.industry }
        </p>
        <p>
          { org.location }
        </p>
      </div>
      <div class='clear'></div>
    </div>
  </div>
  <div class='s30'></div>
  <div class='box'>
    <div class='row'>
      <div class='column'>
        <p class='gray'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum.
        </p>
      </div>
    </div>
  </div>
  <publicKeyOrg store='{store}'></publicKeyOrg>
  <script>
    (function() {
      var entry_id;
    
      entry_id = BR.getEntryId();
    
      BR.loadFromCollection("org", entry_id, this, presentOrg);
    
    }).call(this);
  </script>
</org>
<publicKeyOrg>
  <div class='row'>
    <div class='column right'>
      <div class='s20'></div>
      <p>
        organization type
        <br>
        { org.orgType }
      </p>
      <p>
        <div class='hint--bottom-left hint--rounded icon-mini' data-hint='{ org.publicKey }'>🔑</div>
        <br>
        <span class='hint--bottom-left hint--rounded' data-hint='{ org.publicKey }'>publicKey</span>
        <br>
        <span class='hint--bottom-left hint--rounded' data-hint='{ org.publicKey }'>{ org.publicKeyShort }</span>
      </p>
    </div>
  </div>
  <script>
    (function() {
      var entry_id;
    
      entry_id = BR.getEntryId();
    
      BR.loadFromCollection("org", entry_id, this, presentOrg);
    
    }).call(this);
  </script>
</publicKeyOrg>
