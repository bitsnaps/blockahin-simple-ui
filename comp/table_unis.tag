<table-unis>
  <div class='box'>
    <p>Search</p>
    <input name='query' onkeyup='{ filterUnis }' placeholder='enter a university name or a location' type='text'>
    <div class='s10'></div>
  </div>
  <div class='s30'></div>
  <div class='box'>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Location</th>
        </tr>
      </thead>
      <tr each='{unis}'>
        <td>
          <a href='#/unis/{ id }'>
            <img class='avatar' src='{ avatar }'>
          </a>
        </td>
        <td>
          <a href='#/unis/{ id }'>
            { name }
          </a>
        </td>
        <td>{ location }</td>
      </tr>
    </table>
  </div>
  <script>
    (function() {
      var UNIS, matchString, present;
    
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
    
      present = function(unis) {
        return _(unis).map(function(uni) {
          uni.employees = uni.employees || Math.round(Math.random() * 20 + 1);
          return uni;
        });
      };
    
      matchString = function(uni) {
        return s(uni.name + "|" + uni.location).toLowerCase();
      };
    
      this.filterUnis = (function(_this) {
        return function() {
          return _this.unis = _(UNIS).select(function(uni) {
            return matchString(uni).include(_this.query.value.toLowerCase());
          });
        };
      })(this);
    
      BR.prepare(opts, this, (function(_this) {
        return function() {
          return _this.unis = present(UNIS);
        };
      })(this));
    
    }).call(this);
  </script>
</table-unis>
