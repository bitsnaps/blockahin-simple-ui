<uni>
  <div class='s20'></div>
  <div class='box main-box'>
    <div class='row'>
      <div class='left'>
        <img class='avatar' src='{ uni.avatar }'>
      </div>
      <div class='left lpad'>
        <h2>
          { uni.name }
        </h2>
        <p>
          { uni.location }
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
  <script>
    (function() {
      var UNIS, entry_id;
    
      UNIS = [
        {
          id: 1,
          name: "UCL",
          location: "London, UK",
          avatar: identicon({
            id: 21
          })
        }, {
          id: 2,
          name: "Imperial College London",
          location: "London, UK",
          avatar: identicon({
            id: 22
          })
        }, {
          id: 3,
          name: "London Metropolitan University",
          location: "London, UK",
          avatar: identicon({
            id: 23
          })
        }
      ];
    
      entry_id = BR.getEntryId();
    
      c.log(UNIS[entry_id - 1]);
    
      this.uni = UNIS[entry_id - 1];
    
    }).call(this);
  </script>
</uni>
