<main-nav>
  <nav class='navigation'>
    <notif store='{ opts.store }'></notif>
    <section class='container'>
      <a class='navigation-title float-left' href='#/'>
        <h1 class='title'>
          <img class='logo' src='/img/appii_logo.png'>
        </h1>
      </a>
      <ul class='navigation-list float-left'>
        <li class='navigation-item'>
          <a class='navigation-link' href='#/professionals'>Professionals</a>
        </li>
        <li class='navigation-item'>
          <a class='navigation-link' href='#/organizations'>Companies</a>
        </li>
        <li class='navigation-item'>
          <a class='navigation-link' href='#/universities'>Universities</a>
        </li>
      </ul>
      <ul class='navigation-list float-right'>
        <li class='navigation-item' if="{ dev || prod_host == 'appii1' }">
          <a class='navigation-link' href='#/user'>Profile</a>
        </li>
        <li class='navigation-item' if="{ dev || prod_host != 'appii1' }">
          <a class='navigation-link' href='#/org'>Organization</a>
        </li>
      </ul>
    </section>
  </nav>
  <script>
    (function() {
      this.dev = location.hostname === "localhost";
    
      this.prod_host = s(location.hostname).strLeft(".").value();
    
      console.log("dev", this.dev, "host", this.prod_host);
    
    }).call(this);
  </script>
</main-nav>
