<notif>
  <div class='{ klass }' id='notif' onclick='{ hide }'>
    <span>{ label }</span>
    <span class='close'>x</span>
  </div>
  <script>
    (function() {
      this.label = "";
    
      this.klass = "hidden";
    
      this.hide = function() {
        return this.klass = "hidden";
      };
    
      this.store = opts.store;
    
      this.store.on('update', (function(_this) {
        return function(data) {
          var evtPresent;
          _this.evt = StoreData.evt;
          evtPresent = _(["tx_latest", "tx_pending"]).include(_this.evt);
          _this.klass = evtPresent ? "" : "hidden";
          if (_this.evt === "tx_latest") {
            _this.label = "Confirmed!";
          }
          if (_this.evt === "tx_pending") {
            _this.label = "Pending...";
          }
          return _this.update();
        };
      })(this));
    
    }).call(this);
  </script>
</notif>
