<approvables>
  <section>
    <h1>Positions to Approve</h1>
    <div class='row'>
      <div class='column'>
        { noEmplMessage() }
      </div>
    </div>
    <section class='empl' data-id='{ empl.id }' each='{empl in empls}'>
      <h1>
        <a href='/#/users/{ empl.user.id }'>{ empl.user.name } (# {empl.user.id})</a>
      </h1>
      <h2>{ empl.role }</h2>
      <p>{ empl.dateRange() }</p>
      <div>
        <a class='button left' data-id='{ empl.id }' href='javascript:void(0)' onclick='{ approve }'>Approve</a>
        <div class='spinner'>
          <div class='rect1'></div>
          <div class='rect2'></div>
          <div class='rect3'></div>
          <div class='rect4'></div>
          <div class='rect5'></div>
        </div>
        <div class='message'></div>
        <div class='clear'></div>
      </div>
    </section>
  </section>
  <script>
    (function() {
      var entry_id;
    
      this.prod_host = s(location.hostname).strLeft(".").value();
    
      entry_id = Number(this.prod_host[5]) || 1;
    
      BR.prepare(opts, this, (function(_this) {
        return function() {
          _this.empls = _(StoreData.empls).select(function(empl) {
            return empl.orgId === entry_id && !empl.approved;
          });
          return _(_this.empls).each(function(empl) {
            return empl.user = _(StoreData.users).find(function(user) {
              return empl.userId === user.id;
            });
          });
        };
      })(this));
    
      this.approve = function(evt) {
        var data, emplElem, spinner;
        data = evt.target.dataset;
        emplElem = ".empl[data-id='" + data.id + "']";
        spinner = $(emplElem + " .spinner");
        spinner.css({
          visibility: "visible"
        });
        return Empl.approve(data.id).then(function(res) {
          spinner.css({
            visibility: "hidden"
          });
          return $(emplElem + " .message").html("Employment approved!");
        })["catch"](function(err) {
          return c.error("Error approving employment " + data.id, err);
        });
      };
    
      this.reject = function() {};
    
      this.noEmplMessage = function() {
        if (!this.empls || this.empls.length === 0) {
          return "You don't have any positions to approve yet, please check this page later.";
        }
      };
    
    }).call(this);
  </script>
</approvables>