<blockchain>
  <div class='blocks'>
    <h1>Blockchain</h1>
    <div class='block' each='{ block in blocks }'>
      <h5>
        Block # { block.number }
        <span>- hash: { block.hash }</span>
      </h5>
      <p>
        <strong>Mined by:</strong>
        { block.miner }
      </p>
      <p>
        <strong>Timestamp:</strong>
        { new Date(block.timestamp*1000).toDateString() } - { new Date(block.timestamp*1000).toTimeString() }
      </p>
      <h5>Transactions:</h5>
      <div class='tx' each='{ tx in block.transactions }'>
        <p>
          <strong>Hash:</strong>
          { tx.hash }
        </p>
        <p>
          <strong>From:</strong>
          { tx.from }
        </p>
        <p>
          <strong>To:</strong>
          { tx.to }
        </p>
        <p>
          <strong>Smart Contract: { tx.method.contract } - Method: { tx.method.name }</strong>
        </p>
        <h5>
          Values:
          <val each='{ name, value in tx.method.values }'></val>
        </h5>
        <div class='s20'></div>
      </div>
      <div class='s50'></div>
    </div>
  </div>
  <style>
    .block span {
      font-size: 0.8em;
    }
    .tx {
      padding-left: 30px;
    }
    
    .block .tx {
    }
    
    .block p {
      margin-bottom: 10px;
    }
  </style>
  <script>
    (function() {
      this.blocks = [];
    
      API.blocksLog()["catch"](function(err) {
        return c.error(err);
      }).then((function(_this) {
        return function(log) {
          _this.blocks = log;
          return _this.update();
        };
      })(this));
    
    }).call(this);
  </script>
</blockchain>
<val>
  <span>
    <strong>{ s.ltrim(name, "_") }:</strong>
    <raw content='{ autolink(tx.method.contract, name, value) }, '></raw>
  </span>
  <script>
    (function() {
      this.genLink = function(contract, value) {
        return this.innerHTML = "<a href='/#/" + contract + "/" + value + "'>" + value + "</a>";
      };
    
      this.genLinkAssoc = function(name, value) {
        var section;
        name = s.ltrim(name, "_");
        name = s.rtrim(name, "Id");
        section = name + "s";
        return this.innerHTML = "<a href='/#/" + section + "/" + value + "'>" + name + "[ " + value + " ]</a>";
      };
    
      this.autolink = function(contract, name, value) {
        contract = contract.toLowerCase();
        switch (name) {
          case "_publicKey":
            return this.genLink(contract, value);
          case "_userId":
          case "_orgId":
            return this.genLinkAssoc(name, value);
          default:
            return value;
        }
      };
    
    }).call(this);
  </script>
</val>
<raw>
  <span></span>
  <script>
    (function() {
      this.updateContent = function() {
        return this.root.innerHTML = opts.content;
      };
    
      this.on('update', function() {
        return this.updateContent();
      });
    
      this.updateContent();
    
    }).call(this);
  </script>
</raw>
