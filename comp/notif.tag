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
          _this.evt = StoreData.evt;
          _this.klass = _this.evt ? "" : "hidden";
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
