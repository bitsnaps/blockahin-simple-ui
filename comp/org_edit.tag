<org-edit>
  <h4>Edit organization:</h4>
  <h2>{ org.name }</h2>
  <form onsubmit='{ update }'>
    <h4>
      TODO
    </h4>
  </form>
  <style scoped>
    :scope *[contentEditable]  {
      display: block;
      margin-bottom: 12px;
    }
    :scope label {
      margin-top: 10px;
    }
    :scope input[type=file] {
      display: none;
    }
  </style>
  <script>
    (function() {
      var entry_id;
    
      this.prod_host = s(location.hostname).strLeft(".").value();
    
      entry_id = Number(this.prod_host[2]);
    
      BR.loadFromCollection("org", entry_id, this);
    
      BR.bindUpdateEntityForm("org", entry_id, this);
    
    }).call(this);
  </script>
</org-edit>
