<unsplash-cover>
  <img class='unsplash' src='https://unsplash.it/1200/250/?image={Number(entry_id) || user.id}'>
  <div class='unsplash-spacer'></div>
  <script>
    (function() {
      var entry_id;
    
      entry_id = BR.getEntryId();
    
      this.entry_id = entry_id;
    
      BR.loadFromCollection("user", entry_id, this, presentUser);
    
    }).call(this);
  </script>
  <style>
    .unsplash {
      width: 100%;
      left: 0;
      top: 50px;
      position: absolute;
      z-index: 0;
      border-bottom: 3px solid #DDD; }
    
    .unsplash-spacer {
      height: 250px; }
  </style>
</unsplash-cover>
