<org>
  <h2>{ org.name }</h2>
  <div class='row'>
    <div class='column'>
      <img class='avatar' src='{ org.avatarLg }'>
    </div>
    <div class='column'></div>
    <p class='gray'>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum.
    </p>
  </div>
  <div class='s20'></div>
  <div class='row'>
    <div class='column'>
      <p>
        <strong>Industry:</strong>
        { org.industry }
      </p>
    </div>
  </div>
  <div class='row'>
    <div class='column'>
      <p>
        <strong>Location:</strong>
        { org.location }
      </p>
    </div>
  </div>
  <div class='row'>
    <div class='column'>
      <p class='gray'>
        <strong>Extra:</strong>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum.
      </p>
    </div>
  </div>
  <div class='row'>
    <div class='column right'>
      <p>
        organization type
        <br>
        { org.orgType }
      </p>
      <p>
        publicKey
        <br>
        <span class='hint--bottom-left hint--rounded' data-hint='{ org.publicKey }'>{ org.publicKeyShort }</span>
      </p>
    </div>
  </div>
  <script>
    (function() {
      var entry_id, present;
    
      present = function(org) {
        if (org) {
          org.publicKeyShort = org.publicKey.slice(0, 9) + "..." + org.publicKey.slice(-6);
        }
        return org;
      };
    
      entry_id = BR.getEntryId();
    
      BR.loadFromCollection("org", entry_id, this, present);
    
    }).call(this);
  </script>
</org>
