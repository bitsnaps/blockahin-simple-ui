<table-users>
  <dtable>
    <user-row each={ users }></user-row>
  </dtable>

  <script>
    this.on('mount', function() {
      $("dtable").prepend("    \
        <user-row>             \
          <dtd></dtd>          \
          <dtd>Name</dtd>      \
          <dtd>Job title</dtd> \
        </user-row>            \
      ")
    })

    this.users = [
      {
        id:       1,
        name:     "Shepanie Curry",
        avatar:   "http://api.randomuser.me/portraits/thumb/women/0.jpg",
        jobTitle: "Software Developer",
      },
      {
        id:       2,
        name:     "Klay Thompson",
        avatar:   "http://api.randomuser.me/portraits/thumb/men/3.jpg",
        jobTitle: "Graphic Designer",
      },
      {
        id:       3,
        name:     "Catherine Thompson",
        avatar:   "http://api.randomuser.me/portraits/thumb/women/2.jpg",
        jobTitle: "Engineer",
      },
      {
        id:       4,
        name:     "Garret Albert",
        avatar:   "http://api.randomuser.me/portraits/thumb/men/1.jpg",
        jobTitle: "Mathematician",
      },
      {
        id:       5,
        name:     "Carla Farad",
        avatar:   "http://api.randomuser.me/portraits/thumb/women/4.jpg",
        jobTitle: "Biologist",
      },
    ]
  </script>

  <style>
    dtable{
      display:table;
      width: 100%;
      margin-bottom: 2.5rem;
    }
    ddtr, user-row{
      display:table-row;
    }
    dtd, dth {
      display:table-cell;
      border-bottom: 0.1rem solid #e1e1e1;
      padding: 1.2rem 1.5rem;
      text-align: left;
      vertical-align: middle;
    }
    dth:first-child, dtd:first-child {
      padding-left: 0;
    }
    dth:last-child, dtd:last-child {
      padding-right: 0;
    }
  </style>

</table-users>

<user-row>
  <dtd>
    <a href="#/users/{ id }">
      <img src="{ avatar }" />
    </a>
  </dtd>
  <dtd>
    <a href="#/users/{ id }">
      { name }
    </a>
  </dtd>
  <dtd>{ jobTitle }</dtd>

  <style>

  </style>
</user-row>
