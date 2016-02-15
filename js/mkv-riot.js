// Generated by CoffeeScript 1.10.0
var BR;

BR = {
  getEntryId: function() {
    var entry_id;
    entry_id = s(location.hash).strRightBack("/").value();
    return Number(entry_id);
  },
  loadFromCollection: (function(_this) {
    return function(name, entry_id, coll, ctx, presenter) {
      var elem;
      _this.coll = StoreData[coll];
      elem = _(_this.coll).find(function(e) {
        return entry_id === e.id;
      });
      if (presenter) {
        elem = presenter(elem);
      }
      _this[name] = elem;
      ctx.update();
      _this.store = ctx.opts.store;
      return _this.store.on('update', function(data) {
        _this.coll = data[coll];
        elem = _(_this.coll).find(function(e) {
          return entry_id === e.id;
        });
        if (presenter) {
          elem = presenter(elem);
        }
        _this[name] = elem;
        return ctx.update();
      });
    };
  })(this)
};
