<sample>
  Timer:
  <h4>{ count }</h4>

  <script>
    this.count = Store.count

    this.time = opts.start || 0

    var timer = setInterval(Actions.tick.bind(this), 1000)

    // this.on('unmount', function() {
    //   clearInterval(timer)
    // })
  </script>

  <style scoped>
    :scope { font-size: 2rem }
    h3 { color: #444 }
    ul { color: #999 }
  </style>
</sample>
