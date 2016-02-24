<unsplash-cover>
  <img class='unsplash' src='https://unsplash.it/1200/250/?image={entry_id}'>
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
      z-index: 0; }
    
    .unsplash-spacer {
      height: 250px; }
  </style>
</unsplash-cover>
