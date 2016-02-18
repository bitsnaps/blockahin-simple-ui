<!DOCTYPE html>
riot.tag2('html', '<head> <meta charset="utf-8"> <title>Blockedin</title> <meta content="width=device-width" name="viewport"> <link charset="utf-8" href="css/vendor/milligram.css" rel="stylesheet"> <link charset="utf-8" href="css/vendor/milligram-nav.css" rel="stylesheet"> <link charset="utf-8" href="bower_components/hint.css/hint.min.css" rel="stylesheet"> <link charset="utf-8" href="css/style.css" rel="stylesheet"> </head> <body> <div class="container"> <main-nav></main-nav> <div class="content"> <route></route> </div> <ab-footer></ab-footer> </div> </body>', '', '', function(opts) {


;(function(window, undefined) {
  'use strict';
var riot = { version: 'v2.3.13', settings: {} },

  __uid = 0,

  __virtualDom = [],

  __tagImpl = {},

  RIOT_PREFIX = 'riot-',
  RIOT_TAG = RIOT_PREFIX + 'tag',

  T_STRING = 'string',
  T_OBJECT = 'object',
  T_UNDEF  = 'undefined',
  T_FUNCTION = 'function',

  SPECIAL_TAGS_REGEX = /^(?:opt(ion|group)|tbody|col|t[rhd])$/,
  RESERVED_WORDS_BLACKLIST = ['_item', '_id', '_parent', 'update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one'],

  IE_VERSION = (window && window.document || {}).documentMode | 0

riot.observable = function(el) {

  el = el || {}

  var callbacks = {},
    slice = Array.prototype.slice,
    onEachEvent = function(e, fn) { e.replace(/\S+/g, fn) },
    defineProperty = function (key, value) {
      Object.defineProperty(el, key, {
        value: value,
        enumerable: false,
        writable: false,
        configurable: false
      })
    }

  defineProperty('on', function(events, fn) {
    if (typeof fn != 'function')  return el

    onEachEvent(events, function(name, pos) {
      (callbacks[name] = callbacks[name] || []).push(fn)
      fn.typed = pos > 0
    })

    return el
  })

  defineProperty('off', function(events, fn) {
    if (events == '*' && !fn) callbacks = {}
    else {
      onEachEvent(events, function(name) {
        if (fn) {
          var arr = callbacks[name]
          for (var i = 0, cb; cb = arr && arr[i]; ++i) {
            if (cb == fn) arr.splice(i--, 1)
          }
        } else delete callbacks[name]
      })
    }
    return el
  })

  defineProperty('one', function(events, fn) {
    function on() {
      el.off(events, on)
      fn.apply(el, arguments)
    }
    return el.on(events, on)
  })

  defineProperty('trigger', function(events) {

    var args = slice.call(arguments, 1),
      fns

    onEachEvent(events, function(name) {

      fns = slice.call(callbacks[name] || [], 0)

      for (var i = 0, fn; fn = fns[i]; ++i) {
        if (fn.busy) return
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fns[i] !== fn) { i-- }
        fn.busy = 0
      }

      if (callbacks['*'] && name != '*')
        el.trigger.apply(el, ['*', name].concat(args))

    })

    return el
  })

  return el

}

;(function(riot) {

var RE_ORIGIN = /^.+?\/+[^\/]+/,
  EVENT_LISTENER = 'EventListener',
  REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER,
  ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER,
  HAS_ATTRIBUTE = 'hasAttribute',
  REPLACE = 'replace',
  POPSTATE = 'popstate',
  HASHCHANGE = 'hashchange',
  TRIGGER = 'trigger',
  MAX_EMIT_STACK_LEVEL = 3,
  win = typeof window != 'undefined' && window,
  doc = typeof document != 'undefined' && document,
  hist = win && history,
  loc = win && (hist.location || win.location),
  prot = Router.prototype,
  clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
  started = false,
  central = riot.observable(),
  routeFound = false,
  debouncedEmit,
  base, current, parser, secondParser, emitStack = [], emitStackLevel = 0

function DEFAULT_PARSER(path) {
  return path.split(/[/?#]/)
}

function DEFAULT_SECOND_PARSER(path, filter) {
  var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
    args = path.match(re)

  if (args) return args.slice(1)
}

function debounce(fn, delay) {
  var t
  return function () {
    clearTimeout(t)
    t = setTimeout(fn, delay)
  }
}

function start(autoExec) {
  debouncedEmit = debounce(emit, 1)
  win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit)
  win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
  doc[ADD_EVENT_LISTENER](clickEvent, click)
  if (autoExec) emit(true)
}

function Router() {
  this.$ = []
  riot.observable(this)
  central.on('stop', this.s.bind(this))
  central.on('emit', this.e.bind(this))
}

function normalize(path) {
  return path[REPLACE](/^\/|\/$/, '')
}

function isString(str) {
  return typeof str == 'string'
}

function getPathFromRoot(href) {
  return (href || loc.href || '')[REPLACE](RE_ORIGIN, '')
}

function getPathFromBase(href) {
  return base[0] == '#'
    ? (href || loc.href || '').split(base)[1] || ''
    : getPathFromRoot(href)[REPLACE](base, '')
}

function emit(force) {

  var isRoot = emitStackLevel == 0
  if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return

  emitStackLevel++
  emitStack.push(function() {
    var path = getPathFromBase()
    if (force || path != current) {
      central[TRIGGER]('emit', path)
      current = path
    }
  })
  if (isRoot) {
    while (emitStack.length) {
      emitStack[0]()
      emitStack.shift()
    }
    emitStackLevel = 0
  }
}

function click(e) {
  if (
    e.which != 1
    || e.metaKey || e.ctrlKey || e.shiftKey
    || e.defaultPrevented
  ) return

  var el = e.target
  while (el && el.nodeName != 'A') el = el.parentNode
  if (
    !el || el.nodeName != 'A'
    || el[HAS_ATTRIBUTE]('download')
    || !el[HAS_ATTRIBUTE]('href')
    || el.target && el.target != '_self'
    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1
  ) return

  if (el.href != loc.href) {
    if (
      el.href.split('#')[0] == loc.href.split('#')[0]
      || base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0
      || !go(getPathFromBase(el.href), el.title || doc.title)
    ) return
  }

  e.preventDefault()
}

function go(path, title, shouldReplace) {
  if (hist) {
    path = base + normalize(path)
    title = title || doc.title

    shouldReplace
      ? hist.replaceState(null, title, path)
      : hist.pushState(null, title, path)

    doc.title = title
    routeFound = false
    emit()
    return routeFound
  }

  return central[TRIGGER]('emit', getPathFromBase(path))
}

prot.m = function(first, second, third) {
  if (isString(first) && (!second || isString(second))) go(first, second, third || false)
  else if (second) this.r(first, second)
  else this.r('@', first)
}

prot.s = function() {
  this.off('*')
  this.$ = []
}

prot.e = function(path) {
  this.$.concat('@').some(function(filter) {
    var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter))
    if (typeof args != 'undefined') {
      this[TRIGGER].apply(null, [filter].concat(args))
      return routeFound = true
    }
  }, this)
}

prot.r = function(filter, action) {
  if (filter != '@') {
    filter = '/' + normalize(filter)
    this.$.push(filter)
  }
  this.on(filter, action)
}

var mainRouter = new Router()
var route = mainRouter.m.bind(mainRouter)

route.create = function() {
  var newSubRouter = new Router()

  newSubRouter.m.stop = newSubRouter.s.bind(newSubRouter)

  return newSubRouter.m.bind(newSubRouter)
}

route.base = function(arg) {
  base = arg || '#'
  current = getPathFromBase()
}

route.exec = function() {
  emit(true)
}

route.parser = function(fn, fn2) {
  if (!fn && !fn2) {

    parser = DEFAULT_PARSER
    secondParser = DEFAULT_SECOND_PARSER
  }
  if (fn) parser = fn
  if (fn2) secondParser = fn2
}

route.query = function() {
  var q = {}
  var href = loc.href || current
  href[REPLACE](/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v })
  return q
}

route.stop = function () {
  if (started) {
    if (win) {
      win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit)
      win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
      doc[REMOVE_EVENT_LISTENER](clickEvent, click)
    }
    central[TRIGGER]('stop')
    started = false
  }
}

route.start = function (autoExec) {
  if (!started) {
    if (win) {
      if (document.readyState == 'complete') start(autoExec)

      else win[ADD_EVENT_LISTENER]('load', function() {
        setTimeout(function() { start(autoExec) }, 1)
      })
    }
    started = true
  }
}

route.base()
route.parser()

riot.route = route
})(riot)

var brackets = (function (UNDEF) {

  var
    REGLOB  = 'g',

    MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,
    STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,

    S_QBSRC = STRINGS.source + '|' +
      /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,

    DEFAULT = '{ }',

    FINDBRACES = {
      '(': RegExp('([()])|'   + S_QBSRC, REGLOB),
      '[': RegExp('([[\\]])|' + S_QBSRC, REGLOB),
      '{': RegExp('([{}])|'   + S_QBSRC, REGLOB)
    }

  var
    cachedBrackets = UNDEF,
    _regex,
    _pairs = []

  function _loopback (re) { return re }

  function _rewrite (re, bp) {
    if (!bp) bp = _pairs
    return new RegExp(
      re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
    )
  }

  function _create (pair) {
    var
      cvt,
      arr = pair.split(' ')

    if (pair === DEFAULT) {
      arr[2] = arr[0]
      arr[3] = arr[1]
      cvt = _loopback
    }
    else {
      if (arr.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) {
        throw new Error('Unsupported brackets "' + pair + '"')
      }
      arr = arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '))
      cvt = _rewrite
    }
    arr[4] = cvt(arr[1].length > 1 ? /{[\S\s]*?}/ : /{[^}]*}/, arr)
    arr[5] = cvt(/\\({|})/g, arr)
    arr[6] = cvt(/(\\?)({)/g, arr)
    arr[7] = RegExp('(\\\\?)(?:([[({])|(' + arr[3] + '))|' + S_QBSRC, REGLOB)
    arr[8] = pair
    return arr
  }

  function _reset (pair) {
    if (!pair) pair = DEFAULT

    if (pair !== _pairs[8]) {
      _pairs = _create(pair)
      _regex = pair === DEFAULT ? _loopback : _rewrite
      _pairs[9] = _regex(/^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/)
      _pairs[10] = _regex(/(^|[^\\]){=[\S\s]*?}/)
      _brackets._rawOffset = _pairs[0].length
    }
    cachedBrackets = pair
  }

  function _brackets (reOrIdx) {
    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _pairs[reOrIdx]
  }

  _brackets.split = function split (str, tmpl, _bp) {

    if (!_bp) _bp = _pairs

    var
      parts = [],
      match,
      isexpr,
      start,
      pos,
      re = _bp[6]

    isexpr = start = re.lastIndex = 0

    while (match = re.exec(str)) {

      pos = match.index

      if (isexpr) {

        if (match[2]) {
          re.lastIndex = skipBraces(match[2], re.lastIndex)
          continue
        }

        if (!match[3])
          continue
      }

      if (!match[1]) {
        unescapeStr(str.slice(start, pos))
        start = re.lastIndex
        re = _bp[6 + (isexpr ^= 1)]
        re.lastIndex = start
      }
    }

    if (str && start < str.length) {
      unescapeStr(str.slice(start))
    }

    return parts

    function unescapeStr (str) {
      if (tmpl || isexpr)
        parts.push(str && str.replace(_bp[5], '$1'))
      else
        parts.push(str)
    }

    function skipBraces (ch, pos) {
      var
        match,
        recch = FINDBRACES[ch],
        level = 1
      recch.lastIndex = pos

      while (match = recch.exec(str)) {
        if (match[1] &&
          !(match[1] === ch ? ++level : --level)) break
      }
      return match ? recch.lastIndex : str.length
    }
  }

  _brackets.hasExpr = function hasExpr (str) {
    return _brackets(4).test(str)
  }

  _brackets.loopKeys = function loopKeys (expr) {
    var m = expr.match(_brackets(9))
    return m ?
      { key: m[1], pos: m[2], val: _pairs[0] + m[3].trim() + _pairs[1] } : { val: expr.trim() }
  }

  _brackets.array = function array (pair) {
    return _create(pair || cachedBrackets)
  }

  var _settings
  function _setSettings (o) {
    var b
    o = o || {}
    b = o.brackets
    Object.defineProperty(o, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    })
    _settings = o
    _reset(b)
  }
  Object.defineProperty(_brackets, 'settings', {
    set: _setSettings,
    get: function () { return _settings }
  })

  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {}
  _brackets.set = _reset

  _brackets.R_STRINGS = STRINGS
  _brackets.R_MLCOMMS = MLCOMMS
  _brackets.S_QBLOCKS = S_QBSRC

  return _brackets

})()

var tmpl = (function () {

  var _cache = {}

  function _tmpl (str, data) {
    if (!str) return str

    return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
  }

  _tmpl.isRaw = function (expr) {
    return expr[brackets._rawOffset] === '='
  }

  _tmpl.haveRaw = function (src) {
    return brackets(10).test(src)
  }

  _tmpl.hasExpr = brackets.hasExpr

  _tmpl.loopKeys = brackets.loopKeys

  _tmpl.errorHandler = null

  function _logErr (err, ctx) {

    if (_tmpl.errorHandler) {

      err.riotData = {
        tagName: ctx && ctx.root && ctx.root.tagName,
        _riot_id: ctx && ctx._riot_id
      }
      _tmpl.errorHandler(err)
    }
  }

  function _create (str) {

    var expr = _getTmpl(str)
    if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr

    return new Function('E', expr + ';')
  }

  var
    RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
    RE_QBMARK = /\x01(\d+)~/g

  function _getTmpl (str) {
    var
      qstr = [],
      expr,
      parts = brackets.split(str.replace(/\u2057/g, '"'), 1)

    if (parts.length > 2 || parts[0]) {
      var i, j, list = []

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr = i & 1 ?

              _parseExpr(expr, 1, qstr) :

              '"' + expr
                .replace(/\\/g, '\\\\')
                .replace(/\r\n?|\n/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) list[j++] = expr

      }

      expr = j < 2 ? list[0] :
             '[' + list.join(',') + '].join("")'
    }
    else {

      expr = _parseExpr(parts[1], 0, qstr)
    }

    if (qstr[0])
      expr = expr.replace(RE_QBMARK, function (_, pos) {
        return qstr[pos]
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
      })

    return expr
  }

  var
    CS_IDENT = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/

  function _parseExpr (expr, asText, qstr) {

    if (expr[0] === '=') expr = expr.slice(1)

    expr = expr
          .replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? '\x01' + (qstr.push(s) - 1) + '~' : s
          })
          .replace(/\s+/g, ' ').trim()
          .replace(/\ ?([[\({},?\.:])\ ?/g, '$1')

    if (expr) {
      var
        list = [],
        cnt = 0,
        match

      while (expr &&
            (match = expr.match(CS_IDENT)) &&
            !match.index
        ) {
        var
          key,
          jsb,
          re = /,|([[{(])|$/g

        expr = RegExp.rightContext
        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1]

        while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re)

        jsb  = expr.slice(0, match.index)
        expr = RegExp.rightContext

        list[cnt++] = _wrapExpr(jsb, 1, key)
      }

      expr = !cnt ? _wrapExpr(expr, asText) :
          cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0]
    }
    return expr

    function skipBraces (jsb, re) {
      var
        match,
        lv = 1,
        ir = jsb === '(' ? /[()]/g : jsb === '[' ? /[[\]]/g : /[{}]/g

      ir.lastIndex = re.lastIndex
      while (match = ir.exec(expr)) {
        if (match[0] === jsb) ++lv
        else if (!--lv) break
      }
      re.lastIndex = lv ? expr.length : ir.lastIndex
    }
  }

  var
    JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
    JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
    JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/

  function _wrapExpr (expr, asText, key) {
    var tb

    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
      if (mvar) {
        pos = tb ? 0 : pos + match.length

        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
          match = p + '("' + mvar + JS_CONTEXT + mvar
          if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '['
        }
        else if (pos) {
          tb = !JS_NOPROPS.test(s.slice(pos))
        }
      }
      return match
    })

    if (tb) {
      expr = 'try{return ' + expr + '}catch(e){E(e,this)}'
    }

    if (key) {

      expr = (tb ?
          'function(){' + expr + '}.call(this)' : '(' + expr + ')'
        ) + '?"' + key + '":""'
    }
    else if (asText) {

      expr = 'function(v){' + (tb ?
          expr.replace('return ', 'v=') : 'v=(' + expr + ')'
        ) + ';return v||v===0?v:""}.call(this)'
    }

    return expr
  }

  _tmpl.parse = function (s) { return s }

  return _tmpl

})()

  tmpl.version = brackets.version = 'v2.3.20'

var mkdom = (function (checkIE) {

  var rootEls = {
      tr: 'tbody',
      th: 'tr',
      td: 'tr',
      tbody: 'table',
      col: 'colgroup'
    },
    reToSrc = /<yield\s+to=(['"])?@\1\s*>([\S\s]+?)<\/yield\s*>/.source,
    GENERIC = 'div'

  checkIE = checkIE && checkIE < 10

  function _mkdom(templ, html) {

    var match = templ && templ.match(/^\s*<([-\w]+)/),
      tagName = match && match[1].toLowerCase(),
      rootTag = rootEls[tagName] || GENERIC,
      el = mkEl(rootTag)

    el.stub = true

    if (html) templ = replaceYield(templ, html)

    if (checkIE && tagName && (match = tagName.match(SPECIAL_TAGS_REGEX)))
      ie9elem(el, templ, tagName, !!match[1])
    else
      el.innerHTML = templ

    return el
  }

  function ie9elem(el, html, tagName, select) {

    var div = mkEl(GENERIC),
      tag = select ? 'select>' : 'table>',
      child

    div.innerHTML = '<' + tag + html + '</' + tag

    child = $(tagName, div)
    if (child)
      el.appendChild(child)

  }

  function replaceYield(templ, html) {

    if (!/<yield\b/i.test(templ)) return templ

    var n = 0
    templ = templ.replace(/<yield\s+from=['"]([-\w]+)['"]\s*(?:\/>|>\s*<\/yield\s*>)/ig,
      function (str, ref) {
        var m = html.match(RegExp(reToSrc.replace('@', ref), 'i'))
        ++n
        return m && m[2] || ''
      })

    return n ? templ : templ.replace(/<yield\s*(?:\/>|>\s*<\/yield\s*>)/gi, html || '')
  }

  return _mkdom

})(IE_VERSION)

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

function unmountRedundant(items, tags) {

  var i = tags.length,
    j = items.length,
    t

  while (i > j) {
    t = tags[--i]
    tags.splice(i, 1)
    t.unmount()
  }
}

function moveNestedTags(child, i) {
  Object.keys(child.tags).forEach(function(tagName) {
    var tag = child.tags[tagName]
    if (isArray(tag))
      each(tag, function (t) {
        moveChildTag(t, tagName, i)
      })
    else
      moveChildTag(tag, tagName, i)
  })
}

function addVirtual(tag, src, target) {
  var el = tag._root, sib
  tag._virts = []
  while (el) {
    sib = el.nextSibling
    if (target)
      src.insertBefore(el, target._root)
    else
      src.appendChild(el)

    tag._virts.push(el)
    el = sib
  }
}

function moveVirtual(tag, src, target, len) {
  var el = tag._root, sib, i = 0
  for (; i < len; i++) {
    sib = el.nextSibling
    src.insertBefore(el, target._root)
    el = sib
  }
}

function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'),
    tagName = getTagName(dom),
    impl = __tagImpl[tagName] || { tmpl: dom.outerHTML },
    useRoot = SPECIAL_TAGS_REGEX.test(tagName),
    root = dom.parentNode,
    ref = document.createTextNode(''),
    child = getTag(dom),
    isOption = /option/gi.test(tagName),
    tags = [],
    oldItems = [],
    hasKeys,
    isVirtual = dom.tagName == 'VIRTUAL'

  expr = tmpl.loopKeys(expr)

  root.insertBefore(ref, dom)

  parent.one('before-mount', function () {

    dom.parentNode.removeChild(dom)
    if (root.stub) root = parent.root

  }).on('update', function () {

    var items = tmpl(expr.val, parent),

      frag = document.createDocumentFragment()

    if (!isArray(items)) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        }) : []
    }

    items.forEach(function(item, i) {

      var _mustReorder = mustReorder && item instanceof Object,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,

        tag = tags[pos]

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      if (
        !_mustReorder && !tag
        ||
        _mustReorder && !~oldPos || !tag
      ) {

        tag = new Tag(impl, {
          parent: parent,
          isLoop: true,
          hasImpl: !!__tagImpl[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item: item
        }, dom.innerHTML)

        tag.mount()
        if (isVirtual) tag._root = tag.root.firstChild

        if (i == tags.length) {
          if (isVirtual)
            addVirtual(tag, frag)
          else frag.appendChild(tag.root)
        }

        else {
          if (isVirtual)
            addVirtual(tag, root, tags[i])
          else root.insertBefore(tag.root, tags[i].root)
          oldItems.splice(i, 0, item)
        }

        tags.splice(i, 0, tag)
        pos = i
      } else tag.update(item)

      if (pos !== i && _mustReorder) {

        if (isVirtual)
          moveVirtual(tag, root, tags[i], dom.childNodes.length)
        else root.insertBefore(tag.root, tags[i].root)

        if (expr.pos)
          tag[expr.pos] = i

        tags.splice(i, 0, tags.splice(pos, 1)[0])

        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])

        if (!child) moveNestedTags(tag, i)
      }

      tag._item = item

      defineProperty(tag, '_parent', parent)

    }, true)

    unmountRedundant(items, tags)

    if (isOption) root.appendChild(frag)
    else root.insertBefore(frag, ref)

    if (child) parent.tags[tagName] = tags

    oldItems = items.slice()

  })

}

var styleManager = (function(_riot) {

  if (!window) return {
    add: function () {},
    inject: function () {}
  }

  var styleNode = (function () {

    var newNode = mkEl('style')
    setAttr(newNode, 'type', 'text/css')

    var userNode = $('style[type=riot]')
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id
      userNode.parentNode.replaceChild(newNode, userNode)
    }
    else document.getElementsByTagName('head')[0].appendChild(newNode)

    return newNode
  })()

  var cssTextProp = styleNode.styleSheet,
    stylesToInject = ''

  Object.defineProperty(_riot, 'styleNode', {
    value: styleNode,
    writable: true
  })

  return {

    add: function(css) {
      stylesToInject += css
    },

    inject: function() {
      if (stylesToInject) {
        if (cssTextProp) cssTextProp.cssText += stylesToInject
        else styleNode.innerHTML += stylesToInject
        stylesToInject = ''
      }
    }
  }

})(riot)

function parseNamedElements(root, tag, childTags, forceParsingNamed) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      dom.isLoop = dom.isLoop ||
                  (dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each'))
                    ? 1 : 0

      if (childTags) {
        var child = getTag(dom)

        if (child && !dom.isLoop)
          childTags.push(initChildTag(child, {root: dom, parent: tag}, dom.innerHTML, tag))
      }

      if (!dom.isLoop || forceParsingNamed)
        setNamed(dom, tag, [])
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (tmpl.hasExpr(val)) {
      expressions.push(extend({ dom: dom, expr: val }, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType,
      attr

    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    attr = getAttr(dom, 'each')

    if (attr) { _each(dom, tag, attr); return false }

    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    if (getTag(dom)) return false

  })

}
function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
    opts = inherit(conf.opts) || {},
    parent = conf.parent,
    isLoop = conf.isLoop,
    hasImpl = conf.hasImpl,
    item = cleanUpData(conf.item),
    expressions = [],
    childTags = [],
    root = conf.root,
    fn = impl.fn,
    tagName = root.tagName.toLowerCase(),
    attr = {},
    propsInSyncWithParent = [],
    dom

  if (fn && root._tag) root._tag.unmount(true)

  this.isMounted = false
  root.isLoop = isLoop

  root._tag = this

  defineProperty(this, '_riot_id', ++__uid)

  extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item)

  each(root.attributes, function(el) {
    var val = el.value

    if (tmpl.hasExpr(val)) attr[el.name] = val
  })

  dom = mkdom(impl.tmpl, innerHTML)

  function updateOpts() {
    var ctx = hasImpl && isLoop ? self : parent || self

    each(root.attributes, function(el) {
      var val = el.value
      opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val
    })

    each(Object.keys(attr), function(name) {
      opts[toCamel(name)] = tmpl(attr[name], ctx)
    })
  }

  function normalizeData(data) {
    for (var key in item) {
      if (typeof self[key] !== T_UNDEF && isWritable(self, key))
        self[key] = data[key]
    }
  }

  function inheritFromParent () {
    if (!self.parent || !isLoop) return
    each(Object.keys(self.parent), function(k) {

      var mustSync = !contains(RESERVED_WORDS_BLACKLIST, k) && contains(propsInSyncWithParent, k)
      if (typeof self[k] === T_UNDEF || mustSync) {

        if (!mustSync) propsInSyncWithParent.push(k)
        self[k] = self.parent[k]
      }
    })
  }

  defineProperty(this, 'update', function(data) {

    data = cleanUpData(data)

    inheritFromParent()

    if (data && typeof item === T_OBJECT) {
      normalizeData(data)
      item = data
    }
    extend(self, data)
    updateOpts()
    self.trigger('update', data)
    update(expressions, self)

    rAF(function() { self.trigger('updated') })
    return this
  })

  defineProperty(this, 'mixin', function() {
    each(arguments, function(mix) {
      var instance

      mix = typeof mix === T_STRING ? riot.mixin(mix) : mix

      if (isFunction(mix)) {

        instance = new mix()

        mix = mix.prototype
      } else instance = mix

      each(Object.getOwnPropertyNames(mix), function(key) {

        if (key != 'init')
          self[key] = isFunction(instance[key]) ?
                        instance[key].bind(self) :
                        instance[key]
      })

      if (instance.init) instance.init.bind(self)()
    })
    return this
  })

  defineProperty(this, 'mount', function() {

    updateOpts()

    if (fn) fn.call(self, opts)

    parseExpressions(dom, self, expressions)

    toggle(true)

    if (impl.attrs || hasImpl) {
      walkAttributes(impl.attrs, function (k, v) { setAttr(root, k, v) })
      parseExpressions(self.root, self, expressions)
    }

    if (!self.parent || isLoop) self.update(item)

    self.trigger('before-mount')

    if (isLoop && !hasImpl) {

      self.root = root = dom.firstChild

    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) self.root = root = parent.root
    }

    if (isLoop)
      parseNamedElements(self.root, self.parent, null, true)

    if (!self.parent || self.parent.isMounted) {
      self.isMounted = true
      self.trigger('mount')
    }

    else self.parent.one('mount', function() {

      if (!isInStub(self.root)) {
        self.parent.isMounted = self.isMounted = true
        self.trigger('mount')
      }
    })
  })

  defineProperty(this, 'unmount', function(keepRootTag) {
    var el = root,
      p = el.parentNode,
      ptag

    self.trigger('before-unmount')

    __virtualDom.splice(__virtualDom.indexOf(self), 1)

    if (this._virts) {
      each(this._virts, function(v) {
        v.parentNode.removeChild(v)
      })
    }

    if (p) {

      if (parent) {
        ptag = getImmediateCustomParentTag(parent)

        if (isArray(ptag.tags[tagName]))
          each(ptag.tags[tagName], function(tag, i) {
            if (tag._riot_id == self._riot_id)
              ptag.tags[tagName].splice(i, 1)
          })
        else

          ptag.tags[tagName] = undefined
      }

      else
        while (el.firstChild) el.removeChild(el.firstChild)

      if (!keepRootTag)
        p.removeChild(el)
      else

        remAttr(p, 'riot-tag')
    }

    self.trigger('unmount')
    toggle()
    self.off('*')
    self.isMounted = false
    delete root._tag

  })

  function toggle(isMount) {

    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

    if (!parent) return
    var evt = isMount ? 'on' : 'off'

    if (isLoop)
      parent[evt]('unmount', self.unmount)
    else
      parent[evt]('update', self.update)[evt]('unmount', self.unmount)
  }

  parseNamedElements(dom, this, childTags)

}

function setEventHandler(name, handler, dom, tag) {

  dom[name] = function(e) {

    var ptag = tag._parent,
      item = tag._item,
      el

    if (!item)
      while (ptag && !item) {
        item = ptag._item
        ptag = ptag._parent
      }

    e = e || window.event

    if (isWritable(e, 'currentTarget')) e.currentTarget = dom
    if (isWritable(e, 'target')) e.target = e.srcElement
    if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode

    e.item = item

    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      if (e.preventDefault) e.preventDefault()
      e.returnValue = false
    }

    if (!e.preventUpdate) {
      el = item ? getImmediateCustomParentTag(ptag) : tag
      el.update()
    }

  }

}

function insertTo(root, node, before) {
  if (!root) return
  root.insertBefore(before, node)
  root.removeChild(node)
}

function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
      attrName = expr.attr,
      value = tmpl(expr.expr, tag),
      parent = expr.dom.parentNode

    if (expr.bool)
      value = value ? attrName : false
    else if (value == null)
      value = ''

    if (parent && parent.tagName == 'TEXTAREA') {
      value = ('' + value).replace(/riot-/g, '')

      parent.value = value
    }

    if (expr.value === value) return
    expr.value = value

    if (!attrName) {
      dom.nodeValue = '' + value
      return
    }

    remAttr(dom, attrName)

    if (isFunction(value)) {
      setEventHandler(attrName, value, dom, tag)

    } else if (attrName == 'if') {
      var stub = expr.stub,
        add = function() { insertTo(stub.parentNode, stub, dom) },
        remove = function() { insertTo(dom.parentNode, dom, stub) }

      if (value) {
        if (stub) {
          add()
          dom.inStub = false

          if (!isInStub(dom)) {
            walk(dom, function(el) {
              if (el._tag && !el._tag.isMounted)
                el._tag.isMounted = !!el._tag.trigger('mount')
            })
          }
        }

      } else {
        stub = expr.stub = stub || document.createTextNode('')

        if (dom.parentNode)
          remove()

        else (tag.parent || tag).one('updated', remove)

        dom.inStub = true
      }

    } else if (/^(show|hide)$/.test(attrName)) {
      if (attrName == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    } else if (attrName == 'value') {
      dom.value = value

    } else if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
      if (value)
        setAttr(dom, attrName.slice(RIOT_PREFIX.length), value)

    } else {
      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
      }

      if (value === 0 || value && typeof value !== T_OBJECT)
        setAttr(dom, attrName, value)

    }

  })

}

function each(els, fn) {
  for (var i = 0, len = (els || []).length, el; i < len; i++) {
    el = els[i]

    if (el != null && fn(el, i) === false) i--
  }
  return els
}

function isFunction(v) {
  return typeof v === T_FUNCTION || false
}

function remAttr(dom, name) {
  dom.removeAttribute(name)
}

function toCamel(string) {
  return string.replace(/-(\w)/g, function(_, c) {
    return c.toUpperCase()
  })
}

function getAttr(dom, name) {
  return dom.getAttribute(name)
}

function setAttr(dom, name, val) {
  dom.setAttribute(name, val)
}

function getTag(dom) {
  return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()]
}

function addChildTag(tag, tagName, parent) {
  var cachedTag = parent.tags[tagName]

  if (cachedTag) {

    if (!isArray(cachedTag))

      if (cachedTag !== tag)
        parent.tags[tagName] = [cachedTag]

    if (!contains(parent.tags[tagName], tag))
      parent.tags[tagName].push(tag)
  } else {
    parent.tags[tagName] = tag
  }
}

function moveChildTag(tag, tagName, newPos) {
  var parent = tag.parent,
    tags

  if (!parent) return

  tags = parent.tags[tagName]

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0])
  else addChildTag(tag, tagName, parent)
}

function initChildTag(child, opts, innerHTML, parent) {
  var tag = new Tag(child, opts, innerHTML),
    tagName = getTagName(opts.root),
    ptag = getImmediateCustomParentTag(parent)

  tag.parent = ptag

  tag._parent = parent

  addChildTag(tag, tagName, ptag)

  if (ptag !== parent)
    addChildTag(tag, tagName, parent)

  opts.root.innerHTML = ''

  return tag
}

function getImmediateCustomParentTag(tag) {
  var ptag = tag
  while (!getTag(ptag.root)) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}

function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value: value,
    enumerable: false,
    writable: false,
    configurable: false
  }, options))
  return el
}

function getTagName(dom) {
  var child = getTag(dom),
    namedTag = getAttr(dom, 'name'),
    tagName = namedTag && !tmpl.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()

  return tagName
}

function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {

        if (isWritable(src, key))
          src[key] = obj[key]
      }
    }
  }
  return src
}

function contains(arr, item) {
  return ~arr.indexOf(item)
}

function isArray(a) { return Array.isArray(a) || a instanceof Array }

function isWritable(obj, key) {
  var props = Object.getOwnPropertyDescriptor(obj, key)
  return typeof obj[key] === T_UNDEF || props && props.writable
}

function cleanUpData(data) {
  if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION))
    return data

  var o = {}
  for (var key in data) {
    if (!contains(RESERVED_WORDS_BLACKLIST, key))
      o[key] = data[key]
  }
  return o
}

function walk(dom, fn) {
  if (dom) {

    if (fn(dom) === false) return
    else {
      dom = dom.firstChild

      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}

function walkAttributes(html, fn) {
  var m,
    re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g

  while (m = re.exec(html)) {
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
  }
}

function isInStub(dom) {
  while (dom) {
    if (dom.inStub) return true
    dom = dom.parentNode
  }
  return false
}

function mkEl(name) {
  return document.createElement(name)
}

function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

function getNamedKey(dom) {
  return getAttr(dom, 'id') || getAttr(dom, 'name')
}

function setNamed(dom, parent, keys) {

  var key = getNamedKey(dom),
    isArr,

    add = function(value) {

      if (contains(keys, key)) return

      isArr = isArray(value)

      if (!value)

        parent[key] = dom

      else if (!isArr || isArr && !contains(value, dom)) {

        if (isArr)
          value.push(dom)
        else
          parent[key] = [value, dom]
      }
    }

  if (!key) return

  if (tmpl.hasExpr(key))

    parent.one('mount', function() {
      key = getNamedKey(dom)
      add(parent[key])
    })
  else
    add(parent[key])

}

function startsWith(src, str) {
  return src.slice(0, str.length) === str
}

var rAF = (function (w) {
  var raf = w.requestAnimationFrame    ||
            w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame

  if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {
    var lastTime = 0

    raf = function (cb) {
      var nowtime = Date.now(), timeout = Math.max(16 - (nowtime - lastTime), 0)
      setTimeout(function () { cb(lastTime = nowtime + timeout) }, timeout)
    }
  }
  return raf

})(window || {})

function mountTo(root, tagName, opts) {
  var tag = __tagImpl[tagName],

    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML

  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()

    if (!contains(__virtualDom, tag)) __virtualDom.push(tag)
  }

  return tag
}

riot.util = { brackets: brackets, tmpl: tmpl }

riot.mixin = (function() {
  var mixins = {}

  return function(name, mixin) {
    if (!mixin) return mixins[name]
    mixins[name] = mixin
  }

})()

riot.tag = function(name, html, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs
    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css
      css = ''
    } else attrs = ''
  }
  if (css) {
    if (isFunction(css)) fn = css
    else styleManager.add(css)
  }
  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

riot.tag2 = function(name, html, css, attrs, fn, bpair) {
  if (css) styleManager.add(css)

  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

riot.mount = function(selector, tagName, opts) {

  var els,
    allTags,
    tags = []

  function addRiotTags(arr) {
    var list = ''
    each(arr, function (e) {
      if (!/[^-\w]/.test(e))
        list += ',*[' + RIOT_TAG + '=' + e.trim() + ']'
    })
    return list
  }

  function selectAllTags() {
    var keys = Object.keys(__tagImpl)
    return keys + addRiotTags(keys)
  }

  function pushTags(root) {
    var last

    if (root.tagName) {
      if (tagName && (!(last = getAttr(root, RIOT_TAG)) || last != tagName))
        setAttr(root, RIOT_TAG, tagName)

      var tag = mountTo(root, tagName || root.getAttribute(RIOT_TAG) || root.tagName.toLowerCase(), opts)

      if (tag) tags.push(tag)
    } else if (root.length)
      each(root, pushTags)

  }

  styleManager.inject()

  if (typeof tagName === T_OBJECT) {
    opts = tagName
    tagName = 0
  }

  if (typeof selector === T_STRING) {
    if (selector === '*')

      selector = allTags = selectAllTags()
    else

      selector += addRiotTags(selector.split(','))

    els = selector ? $$(selector) : []
  }
  else

    els = selector

  if (tagName === '*') {

    tagName = allTags || selectAllTags()

    if (els.tagName)
      els = $$(tagName, els)
    else {

      var nodeList = []
      each(els, function (_el) {
        nodeList.push($$(tagName, _el))
      })
      els = nodeList
    }

    tagName = 0
  }

  if (els.tagName)
    pushTags(els)
  else
    each(els, pushTags)

  return tags
}

riot.update = function() {
  return each(__virtualDom, function(tag) {
    tag.update()
  })
}

riot.Tag = Tag

  if (typeof exports === T_OBJECT)
    module.exports = riot
  else if (typeof define === T_FUNCTION && typeof define.amd !== T_UNDEF)
    define(function() { return riot })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : void 0);

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("riot"));
	else if(typeof define === 'function' && define.amd)
		define(["riot"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("riot")) : factory(root["riot"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return   (function(modules) {

  	var installedModules = {};

  	function __webpack_require__(moduleId) {

  		if(installedModules[moduleId])
  			return installedModules[moduleId].exports;

  		var module = installedModules[moduleId] = {
  			exports: {},
  			id: moduleId,
  			loaded: false
  		};

  		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

  		module.loaded = true;

  		return module.exports;
  	}

  	__webpack_require__.m = modules;

  	__webpack_require__.c = installedModules;

  	__webpack_require__.p = "";

  	return __webpack_require__(0);
  })

  ([

  function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, __webpack_require__(1), __webpack_require__(2)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, require('riot'), require('extend'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, global.riot, global.extend);
	    global.router = mod.exports;
	  }
	})(this, function (module, riot, extend) {
	  var _slicedToArray = (function () {
	    function sliceIterator(arr, i) {
	      var _arr = [];
	      var _n = true;
	      var _d = false;
	      var _e = undefined;

	      try {
	        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	          _arr.push(_s.value);

	          if (i && _arr.length === i) break;
	        }
	      } catch (err) {
	        _d = true;
	        _e = err;
	      } finally {
	        try {
	          if (!_n && _i["return"]) _i["return"]();
	        } finally {
	          if (_d) throw _e;
	        }
	      }

	      return _arr;
	    }

	    return function (arr, i) {
	      if (Array.isArray(arr)) {
	        return arr;
	      } else if (Symbol.iterator in Object(arr)) {
	        return sliceIterator(arr, i);
	      } else {
	        throw new TypeError("Invalid attempt to destructure non-iterable instance");
	      }
	    };
	  })();

	  function _possibleConstructorReturn(self, call) {
	    if (!self) {
	      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	    }

	    return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
	  }

	  var _get = function get(object, property, receiver) {
	    if (object === null) object = Function.prototype;
	    var desc = Object.getOwnPropertyDescriptor(object, property);

	    if (desc === undefined) {
	      var parent = Object.getPrototypeOf(object);

	      if (parent === null) {
	        return undefined;
	      } else {
	        return get(parent, property, receiver);
	      }
	    } else if ("value" in desc) {
	      return desc.value;
	    } else {
	      var getter = desc.get;

	      if (getter === undefined) {
	        return undefined;
	      }

	      return getter.call(receiver);
	    }
	  };

	  function _inherits(subClass, superClass) {
	    if (typeof superClass !== "function" && superClass !== null) {
	      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
	    }

	    subClass.prototype = Object.create(superClass && superClass.prototype, {
	      constructor: {
	        value: subClass,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	  }

	  function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError("Cannot call a class as a function");
	    }
	  }

	  var _createClass = (function () {
	    function defineProperties(target, props) {
	      for (var i = 0; i < props.length; i++) {
	        var descriptor = props[i];
	        descriptor.enumerable = descriptor.enumerable || false;
	        descriptor.configurable = true;
	        if ("value" in descriptor) descriptor.writable = true;
	        Object.defineProperty(target, descriptor.key, descriptor);
	      }
	    }

	    return function (Constructor, protoProps, staticProps) {
	      if (protoProps) defineProperties(Constructor.prototype, protoProps);
	      if (staticProps) defineProperties(Constructor, staticProps);
	      return Constructor;
	    };
	  })();

	  var error = console && console.error || function () {};

	  var Router = (function () {
	    function Router() {
	      _classCallCheck(this, Router);

	      riot.router = this;
	      riot.observable(this);
	      this.interceptors = [this.processRoute.bind(this)];
	      this.handler = new InitialRoute();
	      this.current = new Context("").response;
	      this.process = this.process.bind(this);
	    }

	    _createClass(Router, [{
	      key: 'route',
	      value: function route(handler) {
	        this.handler = handler;
	      }
	    }, {
	      key: 'routes',
	      value: function routes(_routes) {
	        this.route(new InitialRoute().routes(_routes));
	      }
	    }, {
	      key: 'use',
	      value: function use(interceptor) {
	        this.interceptors.push(interceptor);
	      }
	    }, {
	      key: 'process',
	      value: function process() {
	        var params = Array.prototype.slice.call(arguments);
	        var uri = params.join("/");
	        if (uri[0] !== '/') uri = "/" + uri;
	        var context = new Context(uri);
	        if (!this.rootContext) this.rootContext = context;
	        this.processRequest(context);
	        return context;
	      }
	    }, {
	      key: 'processRequest',
	      value: function processRequest(context) {
	        this.processInterceptors(context);
	        return this.processResponse(context);
	      }
	    }, {
	      key: 'processResponse',
	      value: function processResponse(context) {
	        if (this.isRedirect(context)) {
	          return this.processRedirect(context);
	        }

	        var request = context.request;
	        var response = context.response;

	        if (!response.redirectTo) {
	          this.current = response;
	          this.rootContext = null;
	          this.trigger('route:updated', response);
	          return context;
	        }
	      }
	    }, {
	      key: 'isRedirect',
	      value: function isRedirect(context) {
	        return !!context.response.redirectTo;
	      }
	    }, {
	      key: 'processRedirect',
	      value: function processRedirect(context) {
	        var uri = context.response.redirectTo;
	        this.rootContext.addRedirect(uri);
	        this.navigateTo(uri);
	      }
	    }, {
	      key: 'navigateTo',
	      value: function navigateTo(uri) {
	        riot.route(uri);
	      }
	    }, {
	      key: 'processInterceptors',
	      value: function processInterceptors(context, preInterceptors, postInterceptors) {
	        var interceptors = (preInterceptors || []).concat(this.interceptors).concat(postInterceptors || []);

	        var next = function next() {
	          if (!context.stop) {
	            var processor = interceptors.shift();
	            var request = context.request;
	            var response = context.response;
	            if (processor) return processor(request, response, next, context);
	          }

	          return context;
	        };

	        return next();
	      }
	    }, {
	      key: 'processRoute',
	      value: function processRoute(request, response, next, context) {
	        this.handler.process(request, response, context);
	        return next();
	      }
	    }, {
	      key: 'start',
	      value: function start() {
	        riot.route(this.process);
	        riot.route.start();
	        this.exec();
	      }
	    }, {
	      key: 'exec',
	      value: function exec() {
	        riot.route.exec(this.process);
	      }
	    }]);

	    return Router;
	  })();

	  var Context = (function () {
	    function Context(request) {
	      _classCallCheck(this, Context);

	      this.request = typeof request === 'string' ? new Request(request) : request;
	      this.response = new Response(this.request);
	      this.redirectStack = [];
	    }

	    _createClass(Context, [{
	      key: 'addRedirect',
	      value: function addRedirect(uri) {
	        if (this.redirectStack.indexOf(uri) > -1) throw new Error("Cyclic redirection to " + uri + ". Stack = " + this.redirectStack);
	        this.redirectStack.push(uri);
	      }
	    }]);

	    return Context;
	  })();

	  var Handler = (function () {
	    function Handler() {
	      _classCallCheck(this, Handler);
	    }

	    _createClass(Handler, [{
	      key: 'matches',
	      value: function matches(request) {
	        return false;
	      }
	    }, {
	      key: 'process',
	      value: function process(request, response) {
	        var matcher = this.matches(request);
	        if (!matcher) return this.routeMiss(request, response);
	        return this.routeMatch(request, response, matcher);
	      }
	    }, {
	      key: 'routeMatch',
	      value: function routeMatch(request, response, matcher) {
	        response.add(matcher);
	        return true;
	      }
	    }, {
	      key: 'routeMiss',
	      value: function routeMiss(request, response) {
	        return false;
	      }
	    }, {
	      key: 'processRoutes',
	      value: function processRoutes(request, response, routes) {
	        if (routes && routes.length) {
	          var t = routes.length;

	          for (var i = 0; i < t; i++) {
	            var route = routes[i];
	            if (route.process(request, response)) return true;
	          }

	          return false;
	        }
	      }
	    }, {
	      key: 'createRequest',
	      value: function createRequest(request, matcher) {
	        return new ChildRequest(request, matcher);
	      }
	    }]);

	    return Handler;
	  })();

	  var Route = (function (_Handler) {
	    _inherits(Route, _Handler);

	    function Route(options) {
	      _classCallCheck(this, Route);

	      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Route).call(this, options));

	      options = options || {};
	      _this.tag = options.tag;
	      _this.api = options.api;
	      _this.path = options.path;
	      _this.name = options.name;
	      _this.updatable = options.updatable;
	      _this.pathParameterNames = [];

	      var path = _this.getPath().replace(/^\//, "");

	      _this.pattern = "^/?" + path.replace(/:([^/]+)/g, (function (ignored, group) {
	        this.pathParameterNames.push(group);
	        return "([^/]+)";
	      }).bind(_this)) + "(:?/|$)";
	      _this.regex = new RegExp(_this.pattern);
	      return _this;
	    }

	    _createClass(Route, [{
	      key: 'routes',
	      value: function routes(_routes2) {
	        var redirectRoutes = _routes2.filter(function (r) {
	          return r instanceof RedirectRoute;
	        });

	        var defaultRoutes = _routes2.filter(function (r) {
	          return r instanceof DefaultRoute;
	        });

	        var notFoundRoutes = _routes2.filter(function (r) {
	          return r instanceof NotFoundRoute;
	        });

	        var otherRoutes = _routes2.filter(function (r) {
	          return redirectRoutes.indexOf(r) === -1 && defaultRoutes.indexOf(r) === -1 && notFoundRoutes.indexOf(r) === -1;
	        });

	        if (notFoundRoutes.length > 1) error("Can't use more than one NotFoundRoute per route. --> " + this.getPath());
	        if (defaultRoutes.length > 1) error("Can't use more than one DefaultRoute per route. --> " + this.getPath());
	        this._routes = [].concat(redirectRoutes).concat(otherRoutes).concat(defaultRoutes).concat(notFoundRoutes);
	        return this;
	      }
	    }, {
	      key: 'matches',
	      value: function matches(request) {
	        var matcher = this.regex.exec(request.uri);

	        if (matcher) {
	          var params = {};

	          for (var i in this.pathParameterNames) {
	            var name = this.pathParameterNames[i];
	            params[name] = decodeURIComponent(matcher[parseInt(i, 10) + 1]);
	          }

	          return {
	            route: this,
	            tag: this.tag,
	            api: this.api,
	            found: matcher[0],
	            params: params
	          };
	        }

	        return false;
	      }
	    }, {
	      key: 'routeMatch',
	      value: function routeMatch(request, response, matcher) {
	        var matches = _get(Object.getPrototypeOf(Route.prototype), 'routeMatch', this).call(this, request, response, matcher);

	        this.processRoutes(request, response, matcher);
	        return matches;
	      }
	    }, {
	      key: 'processRoutes',
	      value: function processRoutes(request, response, matcher) {
	        return _get(Object.getPrototypeOf(Route.prototype), 'processRoutes', this).call(this, this.createRequest(request, matcher), response, this._routes);
	      }
	    }, {
	      key: 'getPath',
	      value: function getPath() {
	        return this.name || this.path || (typeof this.tag === 'string' ? this.tag : '');
	      }
	    }]);

	    return Route;
	  })(Handler);

	  var InitialRoute = (function (_Route) {
	    _inherits(InitialRoute, _Route);

	    function InitialRoute() {
	      _classCallCheck(this, InitialRoute);

	      return _possibleConstructorReturn(this, Object.getPrototypeOf(InitialRoute).apply(this, arguments));
	    }

	    return InitialRoute;
	  })(Route);

	  var ChildRequest = function ChildRequest(request, matcher) {
	    _classCallCheck(this, ChildRequest);

	    this.request = request;
	    this.matcher = matcher;
	    this.uri = this.request.uri.substring(matcher.found.length);
	    this.parentUri = this.request.uri.substring(0, matcher.found.length);
	  };

	  var NotFoundRoute = (function (_Handler2) {
	    _inherits(NotFoundRoute, _Handler2);

	    function NotFoundRoute(options) {
	      _classCallCheck(this, NotFoundRoute);

	      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(NotFoundRoute).call(this, options));

	      options = options || {};
	      _this3.tag = options.tag;
	      _this3.api = options.api;
	      return _this3;
	    }

	    _createClass(NotFoundRoute, [{
	      key: 'matches',
	      value: function matches(request) {
	        return {
	          route: this,
	          tag: this.tag,
	          api: this.api,
	          found: request.uri
	        };
	      }
	    }]);

	    return NotFoundRoute;
	  })(Handler);

	  var RedirectRoute = (function (_Handler3) {
	    _inherits(RedirectRoute, _Handler3);

	    function RedirectRoute(options) {
	      _classCallCheck(this, RedirectRoute);

	      var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(RedirectRoute).call(this, options));

	      options = options || {};
	      _this4.from = options.from;
	      _this4.to = options.to;
	      _this4.pattern = "(^/?)" + _this4.from + "(/|$)";
	      _this4.regex = new RegExp(_this4.pattern);
	      return _this4;
	    }

	    _createClass(RedirectRoute, [{
	      key: 'process',
	      value: function process(request, response) {
	        var uri = request.uri.replace(this.regex, "$1" + this.to + "$2");

	        if (uri !== request.uri) {
	          var parent = request.parentUri || "";
	          response.redirectTo = parent + uri;
	          return true;
	        }
	      }
	    }]);

	    return RedirectRoute;
	  })(Handler);

	  var DefaultRoute = (function (_Handler4) {
	    _inherits(DefaultRoute, _Handler4);

	    function DefaultRoute(options) {
	      _classCallCheck(this, DefaultRoute);

	      var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(DefaultRoute).call(this, options));

	      options = options || {};
	      _this5.tag = options.tag;
	      _this5.api = options.api;
	      return _this5;
	    }

	    _createClass(DefaultRoute, [{
	      key: 'matches',
	      value: function matches(request) {
	        var uri = request.uri.trim();
	        if (uri === "/" || uri === "") return {
	          route: this,
	          tag: this.tag,
	          api: this.api,
	          found: uri
	        };
	      }
	    }]);

	    return DefaultRoute;
	  })(Handler);

	  var Request = function Request(uri) {
	    _classCallCheck(this, Request);

	    this.uri = uri;
	  };

	  var Response = (function () {
	    function Response(request) {
	      _classCallCheck(this, Response);

	      this.uri = request.uri;
	      this.matches = [];
	      this.params = {};
	    }

	    _createClass(Response, [{
	      key: 'add',
	      value: function add(matcher) {
	        this.matches.push(matcher);
	        var params = matcher.params;

	        if (params) {
	          for (var key in params) {
	            if (params.hasOwnProperty(key)) {
	              this.params[key] = params[key];
	            }
	          }
	        }
	      }
	    }, {
	      key: 'get',
	      value: function get(index) {
	        return this.matches[index];
	      }
	    }, {
	      key: 'size',
	      value: function size() {
	        return this.matches.length;
	      }
	    }, {
	      key: 'isEmpty',
	      value: function isEmpty() {
	        return this.matches.length;
	      }
	    }]);

	    return Response;
	  })();

	  riot.tag('route', '<router-content></router-content>', function (opts) {
	    this.calculateLevel = (function (target) {
	      var level = 0;
	      if (target.parent) level += this.calculateLevel(target.parent);
	      if (target.opts.__router_level) level += target.opts.__router_level;
	      if (target.__router_tag) level += 1;
	      return level;
	    }).bind(this);

	    this.normalizeTag = function (tag, api, options) {
	      var result = tag(api, options);

	      if (typeof result === 'string') {
	        tag = result;
	      } else {
	        tag = result.tag || tag;
	        api = result.api || api;
	      }

	      return [tag, api, options];
	    };

	    this.unmountTag = function () {
	      if (this.instance) this.instance.unmount(true);
	    };

	    this.mountTag = function (tag, api, options) {
	      if (typeof tag === 'function') {
	        var _normalizeTag = this.normalizeTag(tag, api, options);

	        var _normalizeTag2 = _slicedToArray(_normalizeTag, 3);

	        tag = _normalizeTag2[0];
	        api = _normalizeTag2[1];
	        options = _normalizeTag2[2];
	      }

	      if (this.canUpdate(tag, api, options)) {
	        this.instance.update(api);
	      } else {
	        this.unmountTag();

	        if (tag) {
	          this.root.replaceChild(document.createElement(tag), this.root.children[0]);
	          this.instance = riot.mount(this.root.children[0], tag, api)[0];
	          this.instanceTag = tag;
	          this.instanceApi = api;
	        }
	      }
	    };

	    this.canUpdate = function (tag, api, options) {
	      if (!riot.router.config.updatable && !opts.updatable && !options.updatable || !this.instance || !this.instance.isMounted || this.instanceTag !== tag) return false;
	      return true;
	    };

	    this.updateRoute = (function () {
	      var mount = {
	        tag: null
	      };

	      if (riot.router && riot.router.current) {
	        var response = riot.router.current;

	        if (this.level <= response.size()) {
	          var matcher = response.get(this.level);

	          if (matcher) {
	            var params = matcher.params || {};
	            var api = extend(true, {}, matcher.api, params, {
	              __router_level: this.level
	            });
	            mount = {
	              tag: matcher.tag,
	              api: api,
	              updatable: matcher.route.updatable
	            };
	          }
	        }
	      }

	      if (mount.tag) this.mountTag(mount.tag, mount.api, mount);else this.unmountTag();
	    }).bind(this);

	    this.__router_tag = 'route';
	    this.level = this.calculateLevel(this);
	    riot.router.on('route:updated', this.updateRoute);
	    this.on('unmount', (function () {
	      riot.router.off('route:updated', this.updateRoute);
	      this.unmountTag();
	    }).bind(this));
	    this.on('mount', (function () {
	      this.updateRoute();
	    }).bind(this));
	  });
	  var router = new Router();
	  router.Route = Route;
	  router.DefaultRoute = DefaultRoute;
	  router.RedirectRoute = RedirectRoute;
	  router.NotFoundRoute = NotFoundRoute;
	  router._ = {
	    Response: Response,
	    Request: Request
	  };
	  router.config = {
	    updatable: false
	  };
	  riot.router = router;
	  module.exports = router;
	});

  },

  function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

  },

  function(module, exports) {

	'use strict';

	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;

	var isArray = function isArray(arr) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(arr);
		}

		return toStr.call(arr) === '[object Array]';
	};

	var isPlainObject = function isPlainObject(obj) {
		if (!obj || toStr.call(obj) !== '[object Object]') {
			return false;
		}

		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');

		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
			return false;
		}

		var key;
		for (key in obj) { }

		return typeof key === 'undefined' || hasOwn.call(obj, key);
	};

	module.exports = function extend() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0],
			i = 1,
			length = arguments.length,
			deep = false;

		if (typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};

			i = 2;
		} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
			target = {};
		}

		for (; i < length; ++i) {
			options = arguments[i];

			if (options != null) {

				for (name in options) {
					src = target[name];
					copy = options[name];

					if (target !== copy) {

						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}

							target[name] = extend(deep, clone, copy);

						} else if (typeof copy !== 'undefined') {
							target[name] = copy;
						}
					}
				}
			}
		}

		return target;
	};

  }
  ])
});
;

var Zepto=function(){function L(t){return null==t?String(t):j[S.call(t)]||"object"}function Z(t){return"function"==L(t)}function _(t){return null!=t&&t==t.window}function $(t){return null!=t&&t.nodeType==t.DOCUMENT_NODE}function D(t){return"object"==L(t)}function M(t){return D(t)&&!_(t)&&Object.getPrototypeOf(t)==Object.prototype}function R(t){return"number"==typeof t.length}function k(t){return s.call(t,function(t){return null!=t})}function z(t){return t.length>0?n.fn.concat.apply([],t):t}function F(t){return t.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()}function q(t){return t in f?f[t]:f[t]=new RegExp("(^|\\s)"+t+"(\\s|$)")}function H(t,e){return"number"!=typeof e||c[F(t)]?e:e+"px"}function I(t){var e,n;return u[t]||(e=a.createElement(t),a.body.appendChild(e),n=getComputedStyle(e,"").getPropertyValue("display"),e.parentNode.removeChild(e),"none"==n&&(n="block"),u[t]=n),u[t]}function V(t){return"children"in t?o.call(t.children):n.map(t.childNodes,function(t){return 1==t.nodeType?t:void 0})}function B(n,i,r){for(e in i)r&&(M(i[e])||A(i[e]))?(M(i[e])&&!M(n[e])&&(n[e]={}),A(i[e])&&!A(n[e])&&(n[e]=[]),B(n[e],i[e],r)):i[e]!==t&&(n[e]=i[e])}function U(t,e){return null==e?n(t):n(t).filter(e)}function J(t,e,n,i){return Z(e)?e.call(t,n,i):e}function X(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function W(e,n){var i=e.className||"",r=i&&i.baseVal!==t;return n===t?r?i.baseVal:i:void(r?i.baseVal=n:e.className=n)}function Y(t){try{return t?"true"==t||("false"==t?!1:"null"==t?null:+t+""==t?+t:/^[\[\{]/.test(t)?n.parseJSON(t):t):t}catch(e){return t}}function G(t,e){e(t);for(var n=0,i=t.childNodes.length;i>n;n++)G(t.childNodes[n],e)}var t,e,n,i,C,N,r=[],o=r.slice,s=r.filter,a=window.document,u={},f={},c={"column-count":1,columns:1,"font-weight":1,"line-height":1,opacity:1,"z-index":1,zoom:1},l=/^\s*<(\w+|!)[^>]*>/,h=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,p=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,d=/^(?:body|html)$/i,m=/([A-Z])/g,g=["val","css","html","text","data","width","height","offset"],v=["after","prepend","before","append"],y=a.createElement("table"),x=a.createElement("tr"),b={tr:a.createElement("tbody"),tbody:y,thead:y,tfoot:y,td:x,th:x,"*":a.createElement("div")},w=/complete|loaded|interactive/,E=/^[\w-]*$/,j={},S=j.toString,T={},O=a.createElement("div"),P={tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},A=Array.isArray||function(t){return t instanceof Array};return T.matches=function(t,e){if(!e||!t||1!==t.nodeType)return!1;var n=t.webkitMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.matchesSelector;if(n)return n.call(t,e);var i,r=t.parentNode,o=!r;return o&&(r=O).appendChild(t),i=~T.qsa(r,e).indexOf(t),o&&O.removeChild(t),i},C=function(t){return t.replace(/-+(.)?/g,function(t,e){return e?e.toUpperCase():""})},N=function(t){return s.call(t,function(e,n){return t.indexOf(e)==n})},T.fragment=function(e,i,r){var s,u,f;return h.test(e)&&(s=n(a.createElement(RegExp.$1))),s||(e.replace&&(e=e.replace(p,"<$1></$2>")),i===t&&(i=l.test(e)&&RegExp.$1),i in b||(i="*"),f=b[i],f.innerHTML=""+e,s=n.each(o.call(f.childNodes),function(){f.removeChild(this)})),M(r)&&(u=n(s),n.each(r,function(t,e){g.indexOf(t)>-1?u[t](e):u.attr(t,e)})),s},T.Z=function(t,e){return t=t||[],t.__proto__=n.fn,t.selector=e||"",t},T.isZ=function(t){return t instanceof T.Z},T.init=function(e,i){var r;if(!e)return T.Z();if("string"==typeof e)if(e=e.trim(),"<"==e[0]&&l.test(e))r=T.fragment(e,RegExp.$1,i),e=null;else{if(i!==t)return n(i).find(e);r=T.qsa(a,e)}else{if(Z(e))return n(a).ready(e);if(T.isZ(e))return e;if(A(e))r=k(e);else if(D(e))r=[e],e=null;else if(l.test(e))r=T.fragment(e.trim(),RegExp.$1,i),e=null;else{if(i!==t)return n(i).find(e);r=T.qsa(a,e)}}return T.Z(r,e)},n=function(t,e){return T.init(t,e)},n.extend=function(t){var e,n=o.call(arguments,1);return"boolean"==typeof t&&(e=t,t=n.shift()),n.forEach(function(n){B(t,n,e)}),t},T.qsa=function(t,e){var n,i="#"==e[0],r=!i&&"."==e[0],s=i||r?e.slice(1):e,a=E.test(s);return $(t)&&a&&i?(n=t.getElementById(s))?[n]:[]:1!==t.nodeType&&9!==t.nodeType?[]:o.call(a&&!i?r?t.getElementsByClassName(s):t.getElementsByTagName(e):t.querySelectorAll(e))},n.contains=a.documentElement.contains?function(t,e){return t!==e&&t.contains(e)}:function(t,e){for(;e&&(e=e.parentNode);)if(e===t)return!0;return!1},n.type=L,n.isFunction=Z,n.isWindow=_,n.isArray=A,n.isPlainObject=M,n.isEmptyObject=function(t){var e;for(e in t)return!1;return!0},n.inArray=function(t,e,n){return r.indexOf.call(e,t,n)},n.camelCase=C,n.trim=function(t){return null==t?"":String.prototype.trim.call(t)},n.uuid=0,n.support={},n.expr={},n.map=function(t,e){var n,r,o,i=[];if(R(t))for(r=0;r<t.length;r++)n=e(t[r],r),null!=n&&i.push(n);else for(o in t)n=e(t[o],o),null!=n&&i.push(n);return z(i)},n.each=function(t,e){var n,i;if(R(t)){for(n=0;n<t.length;n++)if(e.call(t[n],n,t[n])===!1)return t}else for(i in t)if(e.call(t[i],i,t[i])===!1)return t;return t},n.grep=function(t,e){return s.call(t,e)},window.JSON&&(n.parseJSON=JSON.parse),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(t,e){j["[object "+e+"]"]=e.toLowerCase()}),n.fn={forEach:r.forEach,reduce:r.reduce,push:r.push,sort:r.sort,indexOf:r.indexOf,concat:r.concat,map:function(t){return n(n.map(this,function(e,n){return t.call(e,n,e)}))},slice:function(){return n(o.apply(this,arguments))},ready:function(t){return w.test(a.readyState)&&a.body?t(n):a.addEventListener("DOMContentLoaded",function(){t(n)},!1),this},get:function(e){return e===t?o.call(this):this[e>=0?e:e+this.length]},toArray:function(){return this.get()},size:function(){return this.length},remove:function(){return this.each(function(){null!=this.parentNode&&this.parentNode.removeChild(this)})},each:function(t){return r.every.call(this,function(e,n){return t.call(e,n,e)!==!1}),this},filter:function(t){return Z(t)?this.not(this.not(t)):n(s.call(this,function(e){return T.matches(e,t)}))},add:function(t,e){return n(N(this.concat(n(t,e))))},is:function(t){return this.length>0&&T.matches(this[0],t)},not:function(e){var i=[];if(Z(e)&&e.call!==t)this.each(function(t){e.call(this,t)||i.push(this)});else{var r="string"==typeof e?this.filter(e):R(e)&&Z(e.item)?o.call(e):n(e);this.forEach(function(t){r.indexOf(t)<0&&i.push(t)})}return n(i)},has:function(t){return this.filter(function(){return D(t)?n.contains(this,t):n(this).find(t).size()})},eq:function(t){return-1===t?this.slice(t):this.slice(t,+t+1)},first:function(){var t=this[0];return t&&!D(t)?t:n(t)},last:function(){var t=this[this.length-1];return t&&!D(t)?t:n(t)},find:function(t){var e,i=this;return e=t?"object"==typeof t?n(t).filter(function(){var t=this;return r.some.call(i,function(e){return n.contains(e,t)})}):1==this.length?n(T.qsa(this[0],t)):this.map(function(){return T.qsa(this,t)}):n()},closest:function(t,e){var i=this[0],r=!1;for("object"==typeof t&&(r=n(t));i&&!(r?r.indexOf(i)>=0:T.matches(i,t));)i=i!==e&&!$(i)&&i.parentNode;return n(i)},parents:function(t){for(var e=[],i=this;i.length>0;)i=n.map(i,function(t){return(t=t.parentNode)&&!$(t)&&e.indexOf(t)<0?(e.push(t),t):void 0});return U(e,t)},parent:function(t){return U(N(this.pluck("parentNode")),t)},children:function(t){return U(this.map(function(){return V(this)}),t)},contents:function(){return this.map(function(){return o.call(this.childNodes)})},siblings:function(t){return U(this.map(function(t,e){return s.call(V(e.parentNode),function(t){return t!==e})}),t)},empty:function(){return this.each(function(){this.innerHTML=""})},pluck:function(t){return n.map(this,function(e){return e[t]})},show:function(){return this.each(function(){"none"==this.style.display&&(this.style.display=""),"none"==getComputedStyle(this,"").getPropertyValue("display")&&(this.style.display=I(this.nodeName))})},replaceWith:function(t){return this.before(t).remove()},wrap:function(t){var e=Z(t);if(this[0]&&!e)var i=n(t).get(0),r=i.parentNode||this.length>1;return this.each(function(o){n(this).wrapAll(e?t.call(this,o):r?i.cloneNode(!0):i)})},wrapAll:function(t){if(this[0]){n(this[0]).before(t=n(t));for(var e;(e=t.children()).length;)t=e.first();n(t).append(this)}return this},wrapInner:function(t){var e=Z(t);return this.each(function(i){var r=n(this),o=r.contents(),s=e?t.call(this,i):t;o.length?o.wrapAll(s):r.append(s)})},unwrap:function(){return this.parent().each(function(){n(this).replaceWith(n(this).children())}),this},clone:function(){return this.map(function(){return this.cloneNode(!0)})},hide:function(){return this.css("display","none")},toggle:function(e){return this.each(function(){var i=n(this);(e===t?"none"==i.css("display"):e)?i.show():i.hide()})},prev:function(t){return n(this.pluck("previousElementSibling")).filter(t||"*")},next:function(t){return n(this.pluck("nextElementSibling")).filter(t||"*")},html:function(t){return 0 in arguments?this.each(function(e){var i=this.innerHTML;n(this).empty().append(J(this,t,e,i))}):0 in this?this[0].innerHTML:null},text:function(t){return 0 in arguments?this.each(function(e){var n=J(this,t,e,this.textContent);this.textContent=null==n?"":""+n}):0 in this?this[0].textContent:null},attr:function(n,i){var r;return"string"!=typeof n||1 in arguments?this.each(function(t){if(1===this.nodeType)if(D(n))for(e in n)X(this,e,n[e]);else X(this,n,J(this,i,t,this.getAttribute(n)))}):this.length&&1===this[0].nodeType?!(r=this[0].getAttribute(n))&&n in this[0]?this[0][n]:r:t},removeAttr:function(t){return this.each(function(){1===this.nodeType&&t.split(" ").forEach(function(t){X(this,t)},this)})},prop:function(t,e){return t=P[t]||t,1 in arguments?this.each(function(n){this[t]=J(this,e,n,this[t])}):this[0]&&this[0][t]},data:function(e,n){var i="data-"+e.replace(m,"-$1").toLowerCase(),r=1 in arguments?this.attr(i,n):this.attr(i);return null!==r?Y(r):t},val:function(t){return 0 in arguments?this.each(function(e){this.value=J(this,t,e,this.value)}):this[0]&&(this[0].multiple?n(this[0]).find("option").filter(function(){return this.selected}).pluck("value"):this[0].value)},offset:function(t){if(t)return this.each(function(e){var i=n(this),r=J(this,t,e,i.offset()),o=i.offsetParent().offset(),s={top:r.top-o.top,left:r.left-o.left};"static"==i.css("position")&&(s.position="relative"),i.css(s)});if(!this.length)return null;var e=this[0].getBoundingClientRect();return{left:e.left+window.pageXOffset,top:e.top+window.pageYOffset,width:Math.round(e.width),height:Math.round(e.height)}},css:function(t,i){if(arguments.length<2){var r,o=this[0];if(!o)return;if(r=getComputedStyle(o,""),"string"==typeof t)return o.style[C(t)]||r.getPropertyValue(t);if(A(t)){var s={};return n.each(t,function(t,e){s[e]=o.style[C(e)]||r.getPropertyValue(e)}),s}}var a="";if("string"==L(t))i||0===i?a=F(t)+":"+H(t,i):this.each(function(){this.style.removeProperty(F(t))});else for(e in t)t[e]||0===t[e]?a+=F(e)+":"+H(e,t[e])+";":this.each(function(){this.style.removeProperty(F(e))});return this.each(function(){this.style.cssText+=";"+a})},index:function(t){return t?this.indexOf(n(t)[0]):this.parent().children().indexOf(this[0])},hasClass:function(t){return t?r.some.call(this,function(t){return this.test(W(t))},q(t)):!1},addClass:function(t){return t?this.each(function(e){if("className"in this){i=[];var r=W(this),o=J(this,t,e,r);o.split(/\s+/g).forEach(function(t){n(this).hasClass(t)||i.push(t)},this),i.length&&W(this,r+(r?" ":"")+i.join(" "))}}):this},removeClass:function(e){return this.each(function(n){if("className"in this){if(e===t)return W(this,"");i=W(this),J(this,e,n,i).split(/\s+/g).forEach(function(t){i=i.replace(q(t)," ")}),W(this,i.trim())}})},toggleClass:function(e,i){return e?this.each(function(r){var o=n(this),s=J(this,e,r,W(this));s.split(/\s+/g).forEach(function(e){(i===t?!o.hasClass(e):i)?o.addClass(e):o.removeClass(e)})}):this},scrollTop:function(e){if(this.length){var n="scrollTop"in this[0];return e===t?n?this[0].scrollTop:this[0].pageYOffset:this.each(n?function(){this.scrollTop=e}:function(){this.scrollTo(this.scrollX,e)})}},scrollLeft:function(e){if(this.length){var n="scrollLeft"in this[0];return e===t?n?this[0].scrollLeft:this[0].pageXOffset:this.each(n?function(){this.scrollLeft=e}:function(){this.scrollTo(e,this.scrollY)})}},position:function(){if(this.length){var t=this[0],e=this.offsetParent(),i=this.offset(),r=d.test(e[0].nodeName)?{top:0,left:0}:e.offset();return i.top-=parseFloat(n(t).css("margin-top"))||0,i.left-=parseFloat(n(t).css("margin-left"))||0,r.top+=parseFloat(n(e[0]).css("border-top-width"))||0,r.left+=parseFloat(n(e[0]).css("border-left-width"))||0,{top:i.top-r.top,left:i.left-r.left}}},offsetParent:function(){return this.map(function(){for(var t=this.offsetParent||a.body;t&&!d.test(t.nodeName)&&"static"==n(t).css("position");)t=t.offsetParent;return t})}},n.fn.detach=n.fn.remove,["width","height"].forEach(function(e){var i=e.replace(/./,function(t){return t[0].toUpperCase()});n.fn[e]=function(r){var o,s=this[0];return r===t?_(s)?s["inner"+i]:$(s)?s.documentElement["scroll"+i]:(o=this.offset())&&o[e]:this.each(function(t){s=n(this),s.css(e,J(this,r,t,s[e]()))})}}),v.forEach(function(t,e){var i=e%2;n.fn[t]=function(){var t,o,r=n.map(arguments,function(e){return t=L(e),"object"==t||"array"==t||null==e?e:T.fragment(e)}),s=this.length>1;return r.length<1?this:this.each(function(t,u){o=i?u:u.parentNode,u=0==e?u.nextSibling:1==e?u.firstChild:2==e?u:null;var f=n.contains(a.documentElement,o);r.forEach(function(t){if(s)t=t.cloneNode(!0);else if(!o)return n(t).remove();o.insertBefore(t,u),f&&G(t,function(t){null==t.nodeName||"SCRIPT"!==t.nodeName.toUpperCase()||t.type&&"text/javascript"!==t.type||t.src||window.eval.call(window,t.innerHTML)})})})},n.fn[i?t+"To":"insert"+(e?"Before":"After")]=function(e){return n(e)[t](this),this}}),T.Z.prototype=n.fn,T.uniq=N,T.deserializeValue=Y,n.zepto=T,n}();window.Zepto=Zepto,void 0===window.$&&(window.$=Zepto),function(t){function l(t){return t._zid||(t._zid=e++)}function h(t,e,n,i){if(e=p(e),e.ns)var r=d(e.ns);return(s[l(t)]||[]).filter(function(t){return!(!t||e.e&&t.e!=e.e||e.ns&&!r.test(t.ns)||n&&l(t.fn)!==l(n)||i&&t.sel!=i)})}function p(t){var e=(""+t).split(".");return{e:e[0],ns:e.slice(1).sort().join(" ")}}function d(t){return new RegExp("(?:^| )"+t.replace(" "," .* ?")+"(?: |$)")}function m(t,e){return t.del&&!u&&t.e in f||!!e}function g(t){return c[t]||u&&f[t]||t}function v(e,i,r,o,a,u,f){var h=l(e),d=s[h]||(s[h]=[]);i.split(/\s/).forEach(function(i){if("ready"==i)return t(document).ready(r);var s=p(i);s.fn=r,s.sel=a,s.e in c&&(r=function(e){var n=e.relatedTarget;return!n||n!==this&&!t.contains(this,n)?s.fn.apply(this,arguments):void 0}),s.del=u;var l=u||r;s.proxy=function(t){if(t=j(t),!t.isImmediatePropagationStopped()){t.data=o;var i=l.apply(e,t._args==n?[t]:[t].concat(t._args));return i===!1&&(t.preventDefault(),t.stopPropagation()),i}},s.i=d.length,d.push(s),"addEventListener"in e&&e.addEventListener(g(s.e),s.proxy,m(s,f))})}function y(t,e,n,i,r){var o=l(t);(e||"").split(/\s/).forEach(function(e){h(t,e,n,i).forEach(function(e){delete s[o][e.i],"removeEventListener"in t&&t.removeEventListener(g(e.e),e.proxy,m(e,r))})})}function j(e,i){return(i||!e.isDefaultPrevented)&&(i||(i=e),t.each(E,function(t,n){var r=i[t];e[t]=function(){return this[n]=x,r&&r.apply(i,arguments)},e[n]=b}),(i.defaultPrevented!==n?i.defaultPrevented:"returnValue"in i?i.returnValue===!1:i.getPreventDefault&&i.getPreventDefault())&&(e.isDefaultPrevented=x)),e}function S(t){var e,i={originalEvent:t};for(e in t)w.test(e)||t[e]===n||(i[e]=t[e]);return j(i,t)}var n,e=1,i=Array.prototype.slice,r=t.isFunction,o=function(t){return"string"==typeof t},s={},a={},u="onfocusin"in window,f={focus:"focusin",blur:"focusout"},c={mouseenter:"mouseover",mouseleave:"mouseout"};a.click=a.mousedown=a.mouseup=a.mousemove="MouseEvents",t.event={add:v,remove:y},t.proxy=function(e,n){var s=2 in arguments&&i.call(arguments,2);if(r(e)){var a=function(){return e.apply(n,s?s.concat(i.call(arguments)):arguments)};return a._zid=l(e),a}if(o(n))return s?(s.unshift(e[n],e),t.proxy.apply(null,s)):t.proxy(e[n],e);throw new TypeError("expected function")},t.fn.bind=function(t,e,n){return this.on(t,e,n)},t.fn.unbind=function(t,e){return this.off(t,e)},t.fn.one=function(t,e,n,i){return this.on(t,e,n,i,1)};var x=function(){return!0},b=function(){return!1},w=/^([A-Z]|returnValue$|layer[XY]$)/,E={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};t.fn.delegate=function(t,e,n){return this.on(e,t,n)},t.fn.undelegate=function(t,e,n){return this.off(e,t,n)},t.fn.live=function(e,n){return t(document.body).delegate(this.selector,e,n),this},t.fn.die=function(e,n){return t(document.body).undelegate(this.selector,e,n),this},t.fn.on=function(e,s,a,u,f){var c,l,h=this;return e&&!o(e)?(t.each(e,function(t,e){h.on(t,s,a,e,f)}),h):(o(s)||r(u)||u===!1||(u=a,a=s,s=n),(r(a)||a===!1)&&(u=a,a=n),u===!1&&(u=b),h.each(function(n,r){f&&(c=function(t){return y(r,t.type,u),u.apply(this,arguments)}),s&&(l=function(e){var n,o=t(e.target).closest(s,r).get(0);return o&&o!==r?(n=t.extend(S(e),{currentTarget:o,liveFired:r}),(c||u).apply(o,[n].concat(i.call(arguments,1)))):void 0}),v(r,e,u,a,s,l||c)}))},t.fn.off=function(e,i,s){var a=this;return e&&!o(e)?(t.each(e,function(t,e){a.off(t,i,e)}),a):(o(i)||r(s)||s===!1||(s=i,i=n),s===!1&&(s=b),a.each(function(){y(this,e,s,i)}))},t.fn.trigger=function(e,n){return e=o(e)||t.isPlainObject(e)?t.Event(e):j(e),e._args=n,this.each(function(){e.type in f&&"function"==typeof this[e.type]?this[e.type]():"dispatchEvent"in this?this.dispatchEvent(e):t(this).triggerHandler(e,n)})},t.fn.triggerHandler=function(e,n){var i,r;return this.each(function(s,a){i=S(o(e)?t.Event(e):e),i._args=n,i.target=a,t.each(h(a,e.type||e),function(t,e){return r=e.proxy(i),i.isImmediatePropagationStopped()?!1:void 0})}),r},"focusin focusout focus blur load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function(e){t.fn[e]=function(t){return 0 in arguments?this.bind(e,t):this.trigger(e)}}),t.Event=function(t,e){o(t)||(e=t,t=e.type);var n=document.createEvent(a[t]||"Events"),i=!0;if(e)for(var r in e)"bubbles"==r?i=!!e[r]:n[r]=e[r];return n.initEvent(t,i,!0),j(n)}}(Zepto),function(t){function h(e,n,i){var r=t.Event(n);return t(e).trigger(r,i),!r.isDefaultPrevented()}function p(t,e,i,r){return t.global?h(e||n,i,r):void 0}function d(e){e.global&&0===t.active++&&p(e,null,"ajaxStart")}function m(e){e.global&&!--t.active&&p(e,null,"ajaxStop")}function g(t,e){var n=e.context;return e.beforeSend.call(n,t,e)===!1||p(e,n,"ajaxBeforeSend",[t,e])===!1?!1:void p(e,n,"ajaxSend",[t,e])}function v(t,e,n,i){var r=n.context,o="success";n.success.call(r,t,o,e),i&&i.resolveWith(r,[t,o,e]),p(n,r,"ajaxSuccess",[e,n,t]),x(o,e,n)}function y(t,e,n,i,r){var o=i.context;i.error.call(o,n,e,t),r&&r.rejectWith(o,[n,e,t]),p(i,o,"ajaxError",[n,i,t||e]),x(e,n,i)}function x(t,e,n){var i=n.context;n.complete.call(i,e,t),p(n,i,"ajaxComplete",[e,n]),m(n)}function b(){}function w(t){return t&&(t=t.split(";",2)[0]),t&&(t==f?"html":t==u?"json":s.test(t)?"script":a.test(t)&&"xml")||"text"}function E(t,e){return""==e?t:(t+"&"+e).replace(/[&?]{1,2}/,"?")}function j(e){e.processData&&e.data&&"string"!=t.type(e.data)&&(e.data=t.param(e.data,e.traditional)),!e.data||e.type&&"GET"!=e.type.toUpperCase()||(e.url=E(e.url,e.data),e.data=void 0)}function S(e,n,i,r){return t.isFunction(n)&&(r=i,i=n,n=void 0),t.isFunction(i)||(r=i,i=void 0),{url:e,data:n,success:i,dataType:r}}function C(e,n,i,r){var o,s=t.isArray(n),a=t.isPlainObject(n);t.each(n,function(n,u){o=t.type(u),r&&(n=i?r:r+"["+(a||"object"==o||"array"==o?n:"")+"]"),!r&&s?e.add(u.name,u.value):"array"==o||!i&&"object"==o?C(e,u,i,n):e.add(n,u)})}var i,r,e=0,n=window.document,o=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,s=/^(?:text|application)\/javascript/i,a=/^(?:text|application)\/xml/i,u="application/json",f="text/html",c=/^\s*$/,l=n.createElement("a");l.href=window.location.href,t.active=0,t.ajaxJSONP=function(i,r){if(!("type"in i))return t.ajax(i);var f,h,o=i.jsonpCallback,s=(t.isFunction(o)?o():o)||"jsonp"+ ++e,a=n.createElement("script"),u=window[s],c=function(e){t(a).triggerHandler("error",e||"abort")},l={abort:c};return r&&r.promise(l),t(a).on("load error",function(e,n){clearTimeout(h),t(a).off().remove(),"error"!=e.type&&f?v(f[0],l,i,r):y(null,n||"error",l,i,r),window[s]=u,f&&t.isFunction(u)&&u(f[0]),u=f=void 0}),g(l,i)===!1?(c("abort"),l):(window[s]=function(){f=arguments},a.src=i.url.replace(/\?(.+)=\?/,"?$1="+s),n.head.appendChild(a),i.timeout>0&&(h=setTimeout(function(){c("timeout")},i.timeout)),l)},t.ajaxSettings={type:"GET",beforeSend:b,success:b,error:b,complete:b,context:null,global:!0,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:u,xml:"application/xml, text/xml",html:f,text:"text/plain"},crossDomain:!1,timeout:0,processData:!0,cache:!0},t.ajax=function(e){var a,o=t.extend({},e||{}),s=t.Deferred&&t.Deferred();for(i in t.ajaxSettings)void 0===o[i]&&(o[i]=t.ajaxSettings[i]);d(o),o.crossDomain||(a=n.createElement("a"),a.href=o.url,a.href=a.href,o.crossDomain=l.protocol+"//"+l.host!=a.protocol+"//"+a.host),o.url||(o.url=window.location.toString()),j(o);var u=o.dataType,f=/\?.+=\?/.test(o.url);if(f&&(u="jsonp"),o.cache!==!1&&(e&&e.cache===!0||"script"!=u&&"jsonp"!=u)||(o.url=E(o.url,"_="+Date.now())),"jsonp"==u)return f||(o.url=E(o.url,o.jsonp?o.jsonp+"=?":o.jsonp===!1?"":"callback=?")),t.ajaxJSONP(o,s);var C,h=o.accepts[u],p={},m=function(t,e){p[t.toLowerCase()]=[t,e]},x=/^([\w-]+:)\/\//.test(o.url)?RegExp.$1:window.location.protocol,S=o.xhr(),T=S.setRequestHeader;if(s&&s.promise(S),o.crossDomain||m("X-Requested-With","XMLHttpRequest"),m("Accept",h||"*/*"),(h=o.mimeType||h)&&(h.indexOf(",")>-1&&(h=h.split(",",2)[0]),S.overrideMimeType&&S.overrideMimeType(h)),(o.contentType||o.contentType!==!1&&o.data&&"GET"!=o.type.toUpperCase())&&m("Content-Type",o.contentType||"application/x-www-form-urlencoded"),o.headers)for(r in o.headers)m(r,o.headers[r]);if(S.setRequestHeader=m,S.onreadystatechange=function(){if(4==S.readyState){S.onreadystatechange=b,clearTimeout(C);var e,n=!1;if(S.status>=200&&S.status<300||304==S.status||0==S.status&&"file:"==x){u=u||w(o.mimeType||S.getResponseHeader("content-type")),e=S.responseText;try{"script"==u?(1,eval)(e):"xml"==u?e=S.responseXML:"json"==u&&(e=c.test(e)?null:t.parseJSON(e))}catch(i){n=i}n?y(n,"parsererror",S,o,s):v(e,S,o,s)}else y(S.statusText||null,S.status?"error":"abort",S,o,s)}},g(S,o)===!1)return S.abort(),y(null,"abort",S,o,s),S;if(o.xhrFields)for(r in o.xhrFields)S[r]=o.xhrFields[r];var N="async"in o?o.async:!0;S.open(o.type,o.url,N,o.username,o.password);for(r in p)T.apply(S,p[r]);return o.timeout>0&&(C=setTimeout(function(){S.onreadystatechange=b,S.abort(),y(null,"timeout",S,o,s)},o.timeout)),S.send(o.data?o.data:null),S},t.get=function(){return t.ajax(S.apply(null,arguments))},t.post=function(){var e=S.apply(null,arguments);return e.type="POST",t.ajax(e)},t.getJSON=function(){var e=S.apply(null,arguments);return e.dataType="json",t.ajax(e)},t.fn.load=function(e,n,i){if(!this.length)return this;var a,r=this,s=e.split(/\s/),u=S(e,n,i),f=u.success;return s.length>1&&(u.url=s[0],a=s[1]),u.success=function(e){r.html(a?t("<div>").html(e.replace(o,"")).find(a):e),f&&f.apply(r,arguments)},t.ajax(u),this};var T=encodeURIComponent;t.param=function(e,n){var i=[];return i.add=function(e,n){t.isFunction(n)&&(n=n()),null==n&&(n=""),this.push(T(e)+"="+T(n))},C(i,e,n),i.join("&").replace(/%20/g,"+")}}(Zepto),function(t){t.fn.serializeArray=function(){var e,n,i=[],r=function(t){return t.forEach?t.forEach(r):void i.push({name:e,value:t})};return this[0]&&t.each(this[0].elements,function(i,o){n=o.type,e=o.name,e&&"fieldset"!=o.nodeName.toLowerCase()&&!o.disabled&&"submit"!=n&&"reset"!=n&&"button"!=n&&"file"!=n&&("radio"!=n&&"checkbox"!=n||o.checked)&&r(t(o).val())}),i},t.fn.serialize=function(){var t=[];return this.serializeArray().forEach(function(e){t.push(encodeURIComponent(e.name)+"="+encodeURIComponent(e.value))}),t.join("&")},t.fn.submit=function(e){if(0 in arguments)this.bind("submit",e);else if(this.length){var n=t.Event("submit");this.eq(0).trigger(n),n.isDefaultPrevented()||this.get(0).submit()}return this}}(Zepto),function(t){"__proto__"in{}||t.extend(t.zepto,{Z:function(e,n){return e=e||[],t.extend(e,t.fn),e.selector=n||"",e.__Z=!0,e},isZ:function(e){return"array"===t.type(e)&&"__Z"in e}});try{getComputedStyle(void 0)}catch(e){var n=getComputedStyle;window.getComputedStyle=function(t){try{return n(t)}catch(e){return null}}}}(Zepto);

;(function($){
  var slice = Array.prototype.slice

  function Deferred(func) {
    var tuples = [

          [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
          [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
          [ "notify", "progress", $.Callbacks({memory:1}) ]
        ],
        state = "pending",
        promise = {
          state: function() {
            return state
          },
          always: function() {
            deferred.done(arguments).fail(arguments)
            return this
          },
          then: function( ) {
            var fns = arguments
            return Deferred(function(defer){
              $.each(tuples, function(i, tuple){
                var fn = $.isFunction(fns[i]) && fns[i]
                deferred[tuple[1]](function(){
                  var returned = fn && fn.apply(this, arguments)
                  if (returned && $.isFunction(returned.promise)) {
                    returned.promise()
                      .done(defer.resolve)
                      .fail(defer.reject)
                      .progress(defer.notify)
                  } else {
                    var context = this === promise ? defer.promise() : this,
                        values = fn ? [returned] : arguments
                    defer[tuple[0] + "With"](context, values)
                  }
                })
              })
              fns = null
            }).promise()
          },

          promise: function(obj) {
            return obj != null ? $.extend( obj, promise ) : promise
          }
        },
        deferred = {}

    $.each(tuples, function(i, tuple){
      var list = tuple[2],
          stateString = tuple[3]

      promise[tuple[1]] = list.add

      if (stateString) {
        list.add(function(){
          state = stateString
        }, tuples[i^1][2].disable, tuples[2][2].lock)
      }

      deferred[tuple[0]] = function(){
        deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
        return this
      }
      deferred[tuple[0] + "With"] = list.fireWith
    })

    promise.promise(deferred)
    if (func) func.call(deferred, deferred)
    return deferred
  }

  $.when = function(sub) {
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
        remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
        deferred = remain === 1 ? sub : Deferred(),
        progressValues, progressContexts, resolveContexts,
        updateFn = function(i, ctx, val){
          return function(value){
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
            if (val === progressValues) {
              deferred.notifyWith(ctx, val)
            } else if (!(--remain)) {
              deferred.resolveWith(ctx, val)
            }
          }
        }

    if (len > 1) {
      progressValues = new Array(len)
      progressContexts = new Array(len)
      resolveContexts = new Array(len)
      for ( ; i < len; ++i ) {
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
          resolveValues[i].promise()
            .done(updateFn(i, resolveContexts, resolveValues))
            .fail(deferred.reject)
            .progress(updateFn(i, progressContexts, progressValues))
        } else {
          --remain
        }
      }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
    return deferred.promise()
  }

  $.Deferred = Deferred
})(Zepto)

;(function($){

  $.Callbacks = function(options) {
    options = $.extend({}, options)

    var memory,
        fired,
        firing,
        firingStart,
        firingLength,
        firingIndex,
        list = [],
        stack = !options.once && [],
        fire = function(data) {
          memory = options.memory && data
          fired = true
          firingIndex = firingStart || 0
          firingStart = 0
          firingLength = list.length
          firing = true
          for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
              memory = false
              break
            }
          }
          firing = false
          if (list) {
            if (stack) stack.length && fire(stack.shift())
            else if (memory) list.length = 0
            else Callbacks.disable()
          }
        },

        Callbacks = {
          add: function() {
            if (list) {
              var start = list.length,
                  add = function(args) {
                    $.each(args, function(_, arg){
                      if (typeof arg === "function") {
                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                      }
                      else if (arg && arg.length && typeof arg !== 'string') add(arg)
                    })
                  }
              add(arguments)
              if (firing) firingLength = list.length
              else if (memory) {
                firingStart = start
                fire(memory)
              }
            }
            return this
          },
          remove: function() {
            if (list) {
              $.each(arguments, function(_, arg){
                var index
                while ((index = $.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1)

                  if (firing) {
                    if (index <= firingLength) --firingLength
                    if (index <= firingIndex) --firingIndex
                  }
                }
              })
            }
            return this
          },
          has: function(fn) {
            return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
          },
          empty: function() {
            firingLength = list.length = 0
            return this
          },
          disable: function() {
            list = stack = memory = undefined
            return this
          },
          disabled: function() {
            return !list
          },
          lock: function() {
            stack = undefined;
            if (!memory) Callbacks.disable()
            return this
          },
          locked: function() {
            return !stack
          },
          fireWith: function(context, args) {
            if (list && (!fired || stack)) {
              args = args || []
              args = [context, args.slice ? args.slice() : args]
              if (firing) stack.push(args)
              else fire(args)
            }
            return this
          },
          fire: function() {
            return Callbacks.fireWith(this, arguments)
          },
          fired: function() {
            return !!fired
          }
        }

    return Callbacks
  }
})(Zepto)

(function() {

	function write(buffer, offs) {
		for (var i = 2; i < arguments.length; i++) {
			for (var j = 0; j < arguments[i].length; j++) {
				buffer[offs++] = arguments[i].charAt(j);
			}
		}
	}

	function byte2(w) {
		return String.fromCharCode((w >> 8) & 255, w & 255);
	}

	function byte4(w) {
		return String.fromCharCode((w >> 24) & 255, (w >> 16) & 255, (w >> 8) & 255, w & 255);
	}

	function byte2lsb(w) {
		return String.fromCharCode(w & 255, (w >> 8) & 255);
	}

	window.PNGlib = function(width,height,depth) {

		this.width   = width;
		this.height  = height;
		this.depth   = depth;

		this.pix_size = height * (width + 1);

		this.data_size = 2 + this.pix_size + 5 * Math.floor((0xfffe + this.pix_size) / 0xffff) + 4;

		this.ihdr_offs = 0;
		this.ihdr_size = 4 + 4 + 13 + 4;
		this.plte_offs = this.ihdr_offs + this.ihdr_size;
		this.plte_size = 4 + 4 + 3 * depth + 4;
		this.trns_offs = this.plte_offs + this.plte_size;
		this.trns_size = 4 + 4 + depth + 4;
		this.idat_offs = this.trns_offs + this.trns_size;
		this.idat_size = 4 + 4 + this.data_size + 4;
		this.iend_offs = this.idat_offs + this.idat_size;
		this.iend_size = 4 + 4 + 4;
		this.buffer_size  = this.iend_offs + this.iend_size;

		this.buffer  = new Array();
		this.palette = new Object();
		this.pindex  = 0;

		var _crc32 = new Array();

		for (var i = 0; i < this.buffer_size; i++) {
			this.buffer[i] = "\x00";
		}

		write(this.buffer, this.ihdr_offs, byte4(this.ihdr_size - 12), 'IHDR', byte4(width), byte4(height), "\x08\x03");
		write(this.buffer, this.plte_offs, byte4(this.plte_size - 12), 'PLTE');
		write(this.buffer, this.trns_offs, byte4(this.trns_size - 12), 'tRNS');
		write(this.buffer, this.idat_offs, byte4(this.idat_size - 12), 'IDAT');
		write(this.buffer, this.iend_offs, byte4(this.iend_size - 12), 'IEND');

		var header = ((8 + (7 << 4)) << 8) | (3 << 6);
		header+= 31 - (header % 31);

		write(this.buffer, this.idat_offs + 8, byte2(header));

		for (var i = 0; (i << 16) - 1 < this.pix_size; i++) {
			var size, bits;
			if (i + 0xffff < this.pix_size) {
				size = 0xffff;
				bits = "\x00";
			} else {
				size = this.pix_size - (i << 16) - i;
				bits = "\x01";
			}
			write(this.buffer, this.idat_offs + 8 + 2 + (i << 16) + (i << 2), bits, byte2lsb(size), byte2lsb(~size));
		}

		for (var i = 0; i < 256; i++) {
			var c = i;
			for (var j = 0; j < 8; j++) {
				if (c & 1) {
					c = -306674912 ^ ((c >> 1) & 0x7fffffff);
				} else {
					c = (c >> 1) & 0x7fffffff;
				}
			}
			_crc32[i] = c;
		}

		this.index = function(x,y) {
			var i = y * (this.width + 1) + x + 1;
			var j = this.idat_offs + 8 + 2 + 5 * Math.floor((i / 0xffff) + 1) + i;
			return j;
		}

		this.color = function(red, green, blue, alpha) {

			alpha = alpha >= 0 ? alpha : 255;
			var color = (((((alpha << 8) | red) << 8) | green) << 8) | blue;

			if (typeof this.palette[color] == "undefined") {
				if (this.pindex == this.depth) return "\x00";

				var ndx = this.plte_offs + 8 + 3 * this.pindex;

				this.buffer[ndx + 0] = String.fromCharCode(red);
				this.buffer[ndx + 1] = String.fromCharCode(green);
				this.buffer[ndx + 2] = String.fromCharCode(blue);
				this.buffer[this.trns_offs+8+this.pindex] = String.fromCharCode(alpha);

				this.palette[color] = String.fromCharCode(this.pindex++);
			}
			return this.palette[color];
		}

		this.getBase64 = function() {

			var s = this.getDump();

			var ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var c1, c2, c3, e1, e2, e3, e4;
			var l = s.length;
			var i = 0;
			var r = "";

			do {
				c1 = s.charCodeAt(i);
				e1 = c1 >> 2;
				c2 = s.charCodeAt(i+1);
				e2 = ((c1 & 3) << 4) | (c2 >> 4);
				c3 = s.charCodeAt(i+2);
				if (l < i+2) { e3 = 64; } else { e3 = ((c2 & 0xf) << 2) | (c3 >> 6); }
				if (l < i+3) { e4 = 64; } else { e4 = c3 & 0x3f; }
				r+= ch.charAt(e1) + ch.charAt(e2) + ch.charAt(e3) + ch.charAt(e4);
			} while ((i+= 3) < l);
			return r;
		}

		this.getDump = function() {

			var BASE = 65521;
			var NMAX = 5552;
			var s1 = 1;
			var s2 = 0;
			var n = NMAX;

			for (var y = 0; y < this.height; y++) {
				for (var x = -1; x < this.width; x++) {
					s1+= this.buffer[this.index(x, y)].charCodeAt(0);
					s2+= s1;
					if ((n-= 1) == 0) {
						s1%= BASE;
						s2%= BASE;
						n = NMAX;
					}
				}
			}
			s1%= BASE;
			s2%= BASE;
			write(this.buffer, this.idat_offs + this.idat_size - 8, byte4((s2 << 16) | s1));

			function crc32(png, offs, size) {
				var crc = -1;
				for (var i = 4; i < size-4; i += 1) {
					crc = _crc32[(crc ^ png[offs+i].charCodeAt(0)) & 0xff] ^ ((crc >> 8) & 0x00ffffff);
				}
				write(png, offs+size-4, byte4(crc ^ -1));
			}

			crc32(this.buffer, this.ihdr_offs, this.ihdr_size);
			crc32(this.buffer, this.plte_offs, this.plte_size);
			crc32(this.buffer, this.trns_offs, this.trns_size);
			crc32(this.buffer, this.idat_offs, this.idat_size);
			crc32(this.buffer, this.iend_offs, this.iend_size);

			return "\211PNG\r\n\032\n"+this.buffer.join('');
		}
	}

})();

(function() {
    Identicon = function(hash, size, margin){
        this.hash   = hash;
        this.size   = size   || 64;
        this.margin = margin || .08;
    }

    Identicon.prototype = {
        hash:   null,
        size:   null,
        margin: null,

        render: function(){
            var hash    = this.hash,
                size    = this.size,
                margin  = Math.floor(size * this.margin),
                cell    = Math.floor((size - (margin * 2)) / 5),
                image   = new PNGlib(size, size, 256);

            var bg      = image.color(240, 240, 240);

            var rgb     = this.hsl2rgb(parseInt(hash.substr(-7), 16) / 0xfffffff, .5, .7),
                fg      = image.color(rgb[0] * 255, rgb[1] * 255, rgb[2] * 255);

            var i, color;
            for (i = 0; i < 15; i++) {
                color = parseInt(hash.charAt(i), 16) % 2 ? bg : fg;
                if (i < 5) {
                    this.rectangle(2 * cell + margin, i * cell + margin, cell, cell, color, image);
                } else if (i < 10) {
                    this.rectangle(1 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
                    this.rectangle(3 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
                } else if (i < 15) {
                    this.rectangle(0 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
                    this.rectangle(4 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
                }
            }

            return image;
        },

        rectangle: function(x, y, w, h, color, image) {
            var i, j;
            for (i = x; i < x + w; i++) {
                for (j = y; j < y + h; j++) {
                    image.buffer[image.index(i, j)] = color;
                }
            }
        },

        hsl2rgb: function(h, s, b){
            h *= 6;
            s = [
                b += s *= b < .5 ? b : 1 - b,
                b - h % 1 * s * 2,
                b -= s *= 2,
                b,
                b + h % 1 * s,
                b + s
            ];

            return[
                s[ ~~h    % 6 ],
                s[ (h|16) % 6 ],
                s[ (h|8)  % 6 ]
            ];
        },

        toString: function(){
            return this.render().getBase64();
        }
    }

    window.Identicon = Identicon;
})();

(function(){function n(n){function t(t,r,e,u,i,o){for(;i>=0&&o>i;i+=n){var a=u?u[i]:i;e=r(e,t[a],a,t)}return e}return function(r,e,u,i){e=b(e,i,4);var o=!k(r)&&m.keys(r),a=(o||r).length,c=n>0?0:a-1;return arguments.length<3&&(u=r[o?o[c]:c],c+=n),t(r,e,u,o,c,a)}}function t(n){return function(t,r,e){r=x(r,e);for(var u=O(t),i=n>0?0:u-1;i>=0&&u>i;i+=n)if(r(t[i],i,t))return i;return-1}}function r(n,t,r){return function(e,u,i){var o=0,a=O(e);if("number"==typeof i)n>0?o=i>=0?i:Math.max(i+a,o):a=i>=0?Math.min(i+1,a):i+a+1;else if(r&&i&&a)return i=r(e,u),e[i]===u?i:-1;if(u!==u)return i=t(l.call(e,o,a),m.isNaN),i>=0?i+o:-1;for(i=n>0?o:a-1;i>=0&&a>i;i+=n)if(e[i]===u)return i;return-1}}function e(n,t){var r=I.length,e=n.constructor,u=m.isFunction(e)&&e.prototype||a,i="constructor";for(m.has(n,i)&&!m.contains(t,i)&&t.push(i);r--;)i=I[r],i in n&&n[i]!==u[i]&&!m.contains(t,i)&&t.push(i)}var u=this,i=u._,o=Array.prototype,a=Object.prototype,c=Function.prototype,f=o.push,l=o.slice,s=a.toString,p=a.hasOwnProperty,h=Array.isArray,v=Object.keys,g=c.bind,y=Object.create,d=function(){},m=function(n){return n instanceof m?n:this instanceof m?void(this._wrapped=n):new m(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=m),exports._=m):u._=m,m.VERSION="1.8.3";var b=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}},x=function(n,t,r){return null==n?m.identity:m.isFunction(n)?b(n,t,r):m.isObject(n)?m.matcher(n):m.property(n)};m.iteratee=function(n,t){return x(n,t,1/0)};var _=function(n,t){return function(r){var e=arguments.length;if(2>e||null==r)return r;for(var u=1;e>u;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;a>c;c++){var f=o[c];t&&r[f]!==void 0||(r[f]=i[f])}return r}},j=function(n){if(!m.isObject(n))return{};if(y)return y(n);d.prototype=n;var t=new d;return d.prototype=null,t},w=function(n){return function(t){return null==t?void 0:t[n]}},A=Math.pow(2,53)-1,O=w("length"),k=function(n){var t=O(n);return"number"==typeof t&&t>=0&&A>=t};m.each=m.forEach=function(n,t,r){t=b(t,r);var e,u;if(k(n))for(e=0,u=n.length;u>e;e++)t(n[e],e,n);else{var i=m.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},m.map=m.collect=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=Array(u),o=0;u>o;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},m.reduce=m.foldl=m.inject=n(1),m.reduceRight=m.foldr=n(-1),m.find=m.detect=function(n,t,r){var e;return e=k(n)?m.findIndex(n,t,r):m.findKey(n,t,r),e!==void 0&&e!==-1?n[e]:void 0},m.filter=m.select=function(n,t,r){var e=[];return t=x(t,r),m.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e},m.reject=function(n,t,r){return m.filter(n,m.negate(x(t)),r)},m.every=m.all=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},m.some=m.any=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},m.contains=m.includes=m.include=function(n,t,r,e){return k(n)||(n=m.values(n)),("number"!=typeof r||e)&&(r=0),m.indexOf(n,t,r)>=0},m.invoke=function(n,t){var r=l.call(arguments,2),e=m.isFunction(t);return m.map(n,function(n){var u=e?t:n[t];return null==u?u:u.apply(n,r)})},m.pluck=function(n,t){return m.map(n,m.property(t))},m.where=function(n,t){return m.filter(n,m.matcher(t))},m.findWhere=function(n,t){return m.find(n,m.matcher(t))},m.max=function(n,t,r){var e,u,i=-1/0,o=-1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],e>i&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(u>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},m.min=function(n,t,r){var e,u,i=1/0,o=1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],i>e&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(o>u||1/0===u&&1/0===i)&&(i=n,o=u)});return i},m.shuffle=function(n){for(var t,r=k(n)?n:m.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=m.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},m.sample=function(n,t,r){return null==t||r?(k(n)||(n=m.values(n)),n[m.random(n.length-1)]):m.shuffle(n).slice(0,Math.max(0,t))},m.sortBy=function(n,t,r){return t=x(t,r),m.pluck(m.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=x(r,e),m.each(t,function(e,i){var o=r(e,i,t);n(u,e,o)}),u}};m.groupBy=F(function(n,t,r){m.has(n,r)?n[r].push(t):n[r]=[t]}),m.indexBy=F(function(n,t,r){n[r]=t}),m.countBy=F(function(n,t,r){m.has(n,r)?n[r]++:n[r]=1}),m.toArray=function(n){return n?m.isArray(n)?l.call(n):k(n)?m.map(n,m.identity):m.values(n):[]},m.size=function(n){return null==n?0:k(n)?n.length:m.keys(n).length},m.partition=function(n,t,r){t=x(t,r);var e=[],u=[];return m.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},m.first=m.head=m.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:m.initial(n,n.length-t)},m.initial=function(n,t,r){return l.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},m.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:m.rest(n,Math.max(0,n.length-t))},m.rest=m.tail=m.drop=function(n,t,r){return l.call(n,null==t||r?1:t)},m.compact=function(n){return m.filter(n,m.identity)};var S=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=O(n);a>o;o++){var c=n[o];if(k(c)&&(m.isArray(c)||m.isArguments(c))){t||(c=S(c,t,r));var f=0,l=c.length;for(u.length+=l;l>f;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};m.flatten=function(n,t){return S(n,t,!1)},m.without=function(n){return m.difference(n,l.call(arguments,1))},m.uniq=m.unique=function(n,t,r,e){m.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=x(r,e));for(var u=[],i=[],o=0,a=O(n);a>o;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?m.contains(i,f)||(i.push(f),u.push(c)):m.contains(u,c)||u.push(c)}return u},m.union=function(){return m.uniq(S(arguments,!0,!0))},m.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=O(n);u>e;e++){var i=n[e];if(!m.contains(t,i)){for(var o=1;r>o&&m.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},m.difference=function(n){var t=S(arguments,!0,!0,1);return m.filter(n,function(n){return!m.contains(t,n)})},m.zip=function(){return m.unzip(arguments)},m.unzip=function(n){for(var t=n&&m.max(n,O).length||0,r=Array(t),e=0;t>e;e++)r[e]=m.pluck(n,e);return r},m.object=function(n,t){for(var r={},e=0,u=O(n);u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},m.findIndex=t(1),m.findLastIndex=t(-1),m.sortedIndex=function(n,t,r,e){r=x(r,e,1);for(var u=r(t),i=0,o=O(n);o>i;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},m.indexOf=r(1,m.findIndex,m.sortedIndex),m.lastIndexOf=r(-1,m.findLastIndex),m.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var E=function(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=j(n.prototype),o=n.apply(i,u);return m.isObject(o)?o:i};m.bind=function(n,t){if(g&&n.bind===g)return g.apply(n,l.call(arguments,1));if(!m.isFunction(n))throw new TypeError("Bind must be called on a function");var r=l.call(arguments,2),e=function(){return E(n,e,t,this,r.concat(l.call(arguments)))};return e},m.partial=function(n){var t=l.call(arguments,1),r=function(){for(var e=0,u=t.length,i=Array(u),o=0;u>o;o++)i[o]=t[o]===m?arguments[e++]:t[o];for(;e<arguments.length;)i.push(arguments[e++]);return E(n,r,this,this,i)};return r},m.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=m.bind(n[r],n);return n},m.memoize=function(n,t){var r=function(e){var u=r.cache,i=""+(t?t.apply(this,arguments):e);return m.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},m.delay=function(n,t){var r=l.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},m.defer=m.partial(m.delay,m,1),m.throttle=function(n,t,r){var e,u,i,o=null,a=0;r||(r={});var c=function(){a=r.leading===!1?0:m.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=m.now();a||r.leading!==!1||(a=f);var l=t-(f-a);return e=this,u=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||r.trailing===!1||(o=setTimeout(c,l)),i}},m.debounce=function(n,t,r){var e,u,i,o,a,c=function(){var f=m.now()-o;t>f&&f>=0?e=setTimeout(c,t-f):(e=null,r||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=m.now();var f=r&&!e;return e||(e=setTimeout(c,t)),f&&(a=n.apply(i,u),i=u=null),a}},m.wrap=function(n,t){return m.partial(t,n)},m.negate=function(n){return function(){return!n.apply(this,arguments)}},m.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},m.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},m.before=function(n,t){var r;return function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=null),r}},m.once=m.partial(m.before,2);var M=!{toString:null}.propertyIsEnumerable("toString"),I=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];m.keys=function(n){if(!m.isObject(n))return[];if(v)return v(n);var t=[];for(var r in n)m.has(n,r)&&t.push(r);return M&&e(n,t),t},m.allKeys=function(n){if(!m.isObject(n))return[];var t=[];for(var r in n)t.push(r);return M&&e(n,t),t},m.values=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},m.mapObject=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=u.length,o={},a=0;i>a;a++)e=u[a],o[e]=t(n[e],e,n);return o},m.pairs=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},m.invert=function(n){for(var t={},r=m.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},m.functions=m.methods=function(n){var t=[];for(var r in n)m.isFunction(n[r])&&t.push(r);return t.sort()},m.extend=_(m.allKeys),m.extendOwn=m.assign=_(m.keys),m.findKey=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=0,o=u.length;o>i;i++)if(e=u[i],t(n[e],e,n))return e},m.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;m.isFunction(t)?(u=m.allKeys(o),e=b(t,r)):(u=S(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;c>a;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},m.omit=function(n,t,r){if(m.isFunction(t))t=m.negate(t);else{var e=m.map(S(arguments,!1,!1,1),String);t=function(n,t){return!m.contains(e,t)}}return m.pick(n,t,r)},m.defaults=_(m.allKeys,!0),m.create=function(n,t){var r=j(n);return t&&m.extendOwn(r,t),r},m.clone=function(n){return m.isObject(n)?m.isArray(n)?n.slice():m.extend({},n):n},m.tap=function(n,t){return t(n),n},m.isMatch=function(n,t){var r=m.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;e>i;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof m&&(n=n._wrapped),t instanceof m&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(m.isFunction(o)&&o instanceof o&&m.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}r=r||[],e=e||[];for(var c=r.length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if(c=n.length,c!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=m.keys(n);if(c=l.length,m.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!m.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};m.isEqual=function(n,t){return N(n,t)},m.isEmpty=function(n){return null==n?!0:k(n)&&(m.isArray(n)||m.isString(n)||m.isArguments(n))?0===n.length:0===m.keys(n).length},m.isElement=function(n){return!(!n||1!==n.nodeType)},m.isArray=h||function(n){return"[object Array]"===s.call(n)},m.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},m.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){m["is"+n]=function(t){return s.call(t)==="[object "+n+"]"}}),m.isArguments(arguments)||(m.isArguments=function(n){return m.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(m.isFunction=function(n){return"function"==typeof n||!1}),m.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},m.isNaN=function(n){return m.isNumber(n)&&n!==+n},m.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===s.call(n)},m.isNull=function(n){return null===n},m.isUndefined=function(n){return n===void 0},m.has=function(n,t){return null!=n&&p.call(n,t)},m.noConflict=function(){return u._=i,this},m.identity=function(n){return n},m.constant=function(n){return function(){return n}},m.noop=function(){},m.property=w,m.propertyOf=function(n){return null==n?function(){}:function(t){return n[t]}},m.matcher=m.matches=function(n){return n=m.extendOwn({},n),function(t){return m.isMatch(t,n)}},m.times=function(n,t,r){var e=Array(Math.max(0,n));t=b(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},m.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},m.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=m.invert(B),R=function(n){var t=function(t){return n[t]},r="(?:"+m.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};m.escape=R(B),m.unescape=R(T),m.result=function(n,t,r){var e=null==n?void 0:n[t];return e===void 0&&(e=r),m.isFunction(e)?e.call(n):e};var q=0;m.uniqueId=function(n){var t=++q+"";return n?n+t:t},m.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};m.template=function(n,t,r){!t&&r&&(t=r),t=m.defaults({},t,m.templateSettings);var e=RegExp([(t.escape||K).source,(t.interpolate||K).source,(t.evaluate||K).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var o=new Function(t.variable||"obj","_",i)}catch(a){throw a.source=i,a}var c=function(n){return o.call(this,n,m)},f=t.variable||"obj";return c.source="function("+f+"){\n"+i+"}",c},m.chain=function(n){var t=m(n);return t._chain=!0,t};var P=function(n,t){return n._chain?m(t).chain():t};m.mixin=function(n){m.each(m.functions(n),function(t){var r=m[t]=n[t];m.prototype[t]=function(){var n=[this._wrapped];return f.apply(n,arguments),P(this,r.apply(m,n))}})},m.mixin(m),m.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=o[n];m.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],P(this,r)}}),m.each(["concat","join","slice"],function(n){var t=o[n];m.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),m.prototype.value=function(){return this._wrapped},m.prototype.valueOf=m.prototype.toJSON=m.prototype.value,m.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return m})}).call(this);

!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var r;"undefined"!=typeof window?r=window:"undefined"!=typeof global?r=global:"undefined"!=typeof self&&(r=self),r.s=e()}}(function(){return function e(r,t,n){function i(o,p){if(!t[o]){if(!r[o]){var u="function"==typeof require&&require;if(!p&&u)return u(o,!0);if(a)return a(o,!0);throw new Error("Cannot find module '"+o+"'")}var c=t[o]={exports:{}};r[o][0].call(c.exports,function(e){var t=r[o][1][e];return i(t?t:e)},c,c.exports,e,r,t,n)}return t[o].exports}for(var a="function"==typeof require&&require,o=0;o<n.length;o++)i(n[o]);return i}({1:[function(e,r){var t=e("./trim"),n=e("./decapitalize");r.exports=function(e,r){return e=t(e).replace(/[-_\s]+(.)?/g,function(e,r){return r?r.toUpperCase():""}),r===!0?n(e):e}},{"./decapitalize":10,"./trim":63}],2:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){e=t(e);var n=r?e.slice(1).toLowerCase():e.slice(1);return e.charAt(0).toUpperCase()+n}},{"./helper/makeString":21}],3:[function(e,r){var t=e("./helper/makeString");r.exports=function(e){return t(e).split("")}},{"./helper/makeString":21}],4:[function(e,r){r.exports=function(e,r){return null==e?[]:(e=String(e),r=~~r,r>0?e.match(new RegExp(".{1,"+r+"}","g")):[e])}},{}],5:[function(e,r){var t=e("./capitalize"),n=e("./camelize"),i=e("./helper/makeString");r.exports=function(e){return e=i(e),t(n(e.replace(/[\W_]/g," ")).replace(/\s/g,""))}},{"./camelize":1,"./capitalize":2,"./helper/makeString":21}],6:[function(e,r){var t=e("./trim");r.exports=function(e){return t(e).replace(/\s\s+/g," ")}},{"./trim":63}],7:[function(e,r){var t=e("./helper/makeString"),n="ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźž",i="aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzz";n+=n.toUpperCase(),i+=i.toUpperCase(),i=i.split(""),n+="ß",i.push("ss"),r.exports=function(e){return t(e).replace(/.{1}/g,function(e){var r=n.indexOf(e);return-1===r?e:i[r]})}},{"./helper/makeString":21}],8:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){return e=t(e),r=t(r),0===e.length||0===r.length?0:e.split(r).length-1}},{"./helper/makeString":21}],9:[function(e,r){var t=e("./trim");r.exports=function(e){return t(e).replace(/([A-Z])/g,"-$1").replace(/[-_\s]+/g,"-").toLowerCase()}},{"./trim":63}],10:[function(e,r){var t=e("./helper/makeString");r.exports=function(e){return e=t(e),e.charAt(0).toLowerCase()+e.slice(1)}},{"./helper/makeString":21}],11:[function(e,r){function t(e){for(var r=e.match(/^[\s\\t]*/gm),t=r[0].length,n=1;n<r.length;n++)t=Math.min(r[n].length,t);return t}var n=e("./helper/makeString");r.exports=function(e,r){e=n(e);var i,a=t(e);return 0===a?e:(i="string"==typeof r?new RegExp("^"+r,"gm"):new RegExp("^[ \\t]{"+a+"}","gm"),e.replace(i,""))}},{"./helper/makeString":21}],12:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/toPositive");r.exports=function(e,r,i){return e=t(e),r=""+r,i="undefined"==typeof i?e.length-r.length:Math.min(n(i),e.length)-r.length,i>=0&&e.indexOf(r,i)===i}},{"./helper/makeString":21,"./helper/toPositive":23}],13:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/escapeChars"),i="[";for(var a in n)i+=a;i+="]";var o=new RegExp(i,"g");r.exports=function(e){return t(e).replace(o,function(e){return"&"+n[e]+";"})}},{"./helper/escapeChars":18,"./helper/makeString":21}],14:[function(e,r){r.exports=function(){var e={};for(var r in this)this.hasOwnProperty(r)&&!r.match(/^(?:include|contains|reverse|join|map)$/)&&(e[r]=this[r]);return e}},{}],15:[function(e,r){"use strict";function t(e){return this instanceof t?void(this._wrapped=e):new t(e)}function n(e,r){"function"==typeof r&&(t.prototype[e]=function(){var e=[this._wrapped].concat(Array.prototype.slice.call(arguments)),n=r.apply(null,e);return"string"==typeof n?new t(n):n})}function i(e){n(e,function(r){var t=Array.prototype.slice.call(arguments,1);return String.prototype[e].apply(r,t)})}t.VERSION="3.2.2",t.isBlank=e("./isBlank"),t.stripTags=e("./stripTags"),t.capitalize=e("./capitalize"),t.decapitalize=e("./decapitalize"),t.chop=e("./chop"),t.trim=e("./trim"),t.clean=e("./clean"),t.cleanDiacritics=e("./cleanDiacritics"),t.count=e("./count"),t.chars=e("./chars"),t.swapCase=e("./swapCase"),t.escapeHTML=e("./escapeHTML"),t.unescapeHTML=e("./unescapeHTML"),t.splice=e("./splice"),t.insert=e("./insert"),t.replaceAll=e("./replaceAll"),t.include=e("./include"),t.join=e("./join"),t.lines=e("./lines"),t.dedent=e("./dedent"),t.reverse=e("./reverse"),t.startsWith=e("./startsWith"),t.endsWith=e("./endsWith"),t.pred=e("./pred"),t.succ=e("./succ"),t.titleize=e("./titleize"),t.camelize=e("./camelize"),t.underscored=e("./underscored"),t.dasherize=e("./dasherize"),t.classify=e("./classify"),t.humanize=e("./humanize"),t.ltrim=e("./ltrim"),t.rtrim=e("./rtrim"),t.truncate=e("./truncate"),t.prune=e("./prune"),t.words=e("./words"),t.pad=e("./pad"),t.lpad=e("./lpad"),t.rpad=e("./rpad"),t.lrpad=e("./lrpad"),t.sprintf=e("./sprintf"),t.vsprintf=e("./vsprintf"),t.toNumber=e("./toNumber"),t.numberFormat=e("./numberFormat"),t.strRight=e("./strRight"),t.strRightBack=e("./strRightBack"),t.strLeft=e("./strLeft"),t.strLeftBack=e("./strLeftBack"),t.toSentence=e("./toSentence"),t.toSentenceSerial=e("./toSentenceSerial"),t.slugify=e("./slugify"),t.surround=e("./surround"),t.quote=e("./quote"),t.unquote=e("./unquote"),t.repeat=e("./repeat"),t.naturalCmp=e("./naturalCmp"),t.levenshtein=e("./levenshtein"),t.toBoolean=e("./toBoolean"),t.exports=e("./exports"),t.escapeRegExp=e("./helper/escapeRegExp"),t.wrap=e("./wrap"),t.map=e("./map"),t.strip=t.trim,t.lstrip=t.ltrim,t.rstrip=t.rtrim,t.center=t.lrpad,t.rjust=t.lpad,t.ljust=t.rpad,t.contains=t.include,t.q=t.quote,t.toBool=t.toBoolean,t.camelcase=t.camelize,t.mapChars=t.map,t.prototype={value:function(){return this._wrapped}};for(var a in t)n(a,t[a]);n("tap",function(e,r){return r(e)});var o=["toUpperCase","toLowerCase","split","replace","slice","substring","substr","concat"];for(var p in o)i(o[p]);r.exports=t},{"./camelize":1,"./capitalize":2,"./chars":3,"./chop":4,"./classify":5,"./clean":6,"./cleanDiacritics":7,"./count":8,"./dasherize":9,"./decapitalize":10,"./dedent":11,"./endsWith":12,"./escapeHTML":13,"./exports":14,"./helper/escapeRegExp":19,"./humanize":24,"./include":25,"./insert":26,"./isBlank":27,"./join":28,"./levenshtein":29,"./lines":30,"./lpad":31,"./lrpad":32,"./ltrim":33,"./map":34,"./naturalCmp":35,"./numberFormat":36,"./pad":37,"./pred":38,"./prune":39,"./quote":40,"./repeat":41,"./replaceAll":42,"./reverse":43,"./rpad":44,"./rtrim":45,"./slugify":46,"./splice":47,"./sprintf":48,"./startsWith":49,"./strLeft":50,"./strLeftBack":51,"./strRight":52,"./strRightBack":53,"./stripTags":54,"./succ":55,"./surround":56,"./swapCase":57,"./titleize":58,"./toBoolean":59,"./toNumber":60,"./toSentence":61,"./toSentenceSerial":62,"./trim":63,"./truncate":64,"./underscored":65,"./unescapeHTML":66,"./unquote":67,"./vsprintf":68,"./words":69,"./wrap":70}],16:[function(e,r){var t=e("./makeString");r.exports=function(e,r){return e=t(e),0===e.length?"":e.slice(0,-1)+String.fromCharCode(e.charCodeAt(e.length-1)+r)}},{"./makeString":21}],17:[function(e,r){var t=e("./escapeRegExp");r.exports=function(e){return null==e?"\\s":e.source?e.source:"["+t(e)+"]"}},{"./escapeRegExp":19}],18:[function(e,r){var t={"¢":"cent","£":"pound","¥":"yen","€":"euro","©":"copy","®":"reg","<":"lt",">":"gt",'"':"quot","&":"amp","'":"#39"};r.exports=t},{}],19:[function(e,r){var t=e("./makeString");r.exports=function(e){return t(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")}},{"./makeString":21}],20:[function(e,r){var t={nbsp:" ",cent:"¢",pound:"£",yen:"¥",euro:"€",copy:"©",reg:"®",lt:"<",gt:">",quot:'"',amp:"&",apos:"'"};r.exports=t},{}],21:[function(e,r){r.exports=function(e){return null==e?"":""+e}},{}],22:[function(e,r){r.exports=function(e,r){if(1>r)return"";for(var t="";r>0;)1&r&&(t+=e),r>>=1,e+=e;return t}},{}],23:[function(e,r){r.exports=function(e){return 0>e?0:+e||0}},{}],24:[function(e,r){var t=e("./capitalize"),n=e("./underscored"),i=e("./trim");r.exports=function(e){return t(i(n(e).replace(/_id$/,"").replace(/_/g," ")))}},{"./capitalize":2,"./trim":63,"./underscored":65}],25:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){return""===r?!0:-1!==t(e).indexOf(r)}},{"./helper/makeString":21}],26:[function(e,r){var t=e("./splice");r.exports=function(e,r,n){return t(e,r,0,n)}},{"./splice":47}],27:[function(e,r){var t=e("./helper/makeString");r.exports=function(e){return/^\s*$/.test(t(e))}},{"./helper/makeString":21}],28:[function(e,r){var t=e("./helper/makeString"),n=[].slice;r.exports=function(){var e=n.call(arguments),r=e.shift();return e.join(t(r))}},{"./helper/makeString":21}],29:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){"use strict";if(e=t(e),r=t(r),e===r)return 0;if(!e||!r)return Math.max(e.length,r.length);for(var n=new Array(r.length+1),i=0;i<n.length;++i)n[i]=i;for(i=0;i<e.length;++i){for(var a=i+1,o=0;o<r.length;++o){var p=a;a=n[o]+(e.charAt(i)===r.charAt(o)?0:1);var u=p+1;a>u&&(a=u),u=n[o+1]+1,a>u&&(a=u),n[o]=p}n[o]=a}return a}},{"./helper/makeString":21}],30:[function(e,r){r.exports=function(e){return null==e?[]:String(e).split(/\r\n?|\n/)}},{}],31:[function(e,r){var t=e("./pad");r.exports=function(e,r,n){return t(e,r,n)}},{"./pad":37}],32:[function(e,r){var t=e("./pad");r.exports=function(e,r,n){return t(e,r,n,"both")}},{"./pad":37}],33:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/defaultToWhiteSpace"),i=String.prototype.trimLeft;r.exports=function(e,r){return e=t(e),!r&&i?i.call(e):(r=n(r),e.replace(new RegExp("^"+r+"+"),""))}},{"./helper/defaultToWhiteSpace":17,"./helper/makeString":21}],34:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){return e=t(e),0===e.length||"function"!=typeof r?e:e.replace(/./g,r)}},{"./helper/makeString":21}],35:[function(e,r){r.exports=function(e,r){if(e==r)return 0;if(!e)return-1;if(!r)return 1;for(var t=/(\.\d+|\d+|\D+)/g,n=String(e).match(t),i=String(r).match(t),a=Math.min(n.length,i.length),o=0;a>o;o++){var p=n[o],u=i[o];if(p!==u){var c=+p,s=+u;return c===c&&s===s?c>s?1:-1:u>p?-1:1}}return n.length!=i.length?n.length-i.length:r>e?-1:1}},{}],36:[function(e,r){r.exports=function(e,r,t,n){if(isNaN(e)||null==e)return"";e=e.toFixed(~~r),n="string"==typeof n?n:",";var i=e.split("."),a=i[0],o=i[1]?(t||".")+i[1]:"";return a.replace(/(\d)(?=(?:\d{3})+$)/g,"$1"+n)+o}},{}],37:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/strRepeat");r.exports=function(e,r,i,a){e=t(e),r=~~r;var o=0;switch(i?i.length>1&&(i=i.charAt(0)):i=" ",a){case"right":return o=r-e.length,e+n(i,o);case"both":return o=r-e.length,n(i,Math.ceil(o/2))+e+n(i,Math.floor(o/2));default:return o=r-e.length,n(i,o)+e}}},{"./helper/makeString":21,"./helper/strRepeat":22}],38:[function(e,r){var t=e("./helper/adjacent");r.exports=function(e){return t(e,-1)}},{"./helper/adjacent":16}],39:[function(e,r){var t=e("./helper/makeString"),n=e("./rtrim");r.exports=function(e,r,i){if(e=t(e),r=~~r,i=null!=i?String(i):"...",e.length<=r)return e;var a=function(e){return e.toUpperCase()!==e.toLowerCase()?"A":" "},o=e.slice(0,r+1).replace(/.(?=\W*\w*$)/g,a);return o=o.slice(o.length-2).match(/\w\w/)?o.replace(/\s*\S+$/,""):n(o.slice(0,o.length-1)),(o+i).length>e.length?e:e.slice(0,o.length)+i}},{"./helper/makeString":21,"./rtrim":45}],40:[function(e,r){var t=e("./surround");r.exports=function(e,r){return t(e,r||'"')}},{"./surround":56}],41:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/strRepeat");r.exports=function i(e,r,a){if(e=t(e),r=~~r,null==a)return n(e,r);for(var i=[];r>0;i[--r]=e);return i.join(a)}},{"./helper/makeString":21,"./helper/strRepeat":22}],42:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r,n,i){var a=i===!0?"gi":"g",o=new RegExp(r,a);return t(e).replace(o,n)}},{"./helper/makeString":21}],43:[function(e,r){var t=e("./chars");r.exports=function(e){return t(e).reverse().join("")}},{"./chars":3}],44:[function(e,r){var t=e("./pad");r.exports=function(e,r,n){return t(e,r,n,"right")}},{"./pad":37}],45:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/defaultToWhiteSpace"),i=String.prototype.trimRight;r.exports=function(e,r){return e=t(e),!r&&i?i.call(e):(r=n(r),e.replace(new RegExp(r+"+$"),""))}},{"./helper/defaultToWhiteSpace":17,"./helper/makeString":21}],46:[function(e,r){var t=e("./trim"),n=e("./dasherize"),i=e("./cleanDiacritics");r.exports=function(e){return t(n(i(e).replace(/[^\w\s-]/g,"-").toLowerCase()),"-")}},{"./cleanDiacritics":7,"./dasherize":9,"./trim":63}],47:[function(e,r){var t=e("./chars");r.exports=function(e,r,n,i){var a=t(e);return a.splice(~~r,~~n,i),a.join("")}},{"./chars":3}],48:[function(e,r){var t=e("./helper/strRepeat"),n=Object.prototype.toString,i=function(){function e(e){return n.call(e).slice(8,-1).toLowerCase()}var r=t,a=function(){return a.cache.hasOwnProperty(arguments[0])||(a.cache[arguments[0]]=a.parse(arguments[0])),a.format.call(null,a.cache[arguments[0]],arguments)};return a.format=function(t,n){var a,o,p,u,c,s,l,f=1,h=t.length,g="",m=[];for(o=0;h>o;o++)if(g=e(t[o]),"string"===g)m.push(t[o]);else if("array"===g){if(u=t[o],u[2])for(a=n[f],p=0;p<u[2].length;p++){if(!a.hasOwnProperty(u[2][p]))throw new Error(i('[_.sprintf] property "%s" does not exist',u[2][p]));a=a[u[2][p]]}else a=u[1]?n[u[1]]:n[f++];if(/[^s]/.test(u[8])&&"number"!=e(a))throw new Error(i("[_.sprintf] expecting number but found %s",e(a)));switch(u[8]){case"b":a=a.toString(2);break;case"c":a=String.fromCharCode(a);break;case"d":a=parseInt(a,10);break;case"e":a=u[7]?a.toExponential(u[7]):a.toExponential();break;case"f":a=u[7]?parseFloat(a).toFixed(u[7]):parseFloat(a);break;case"o":a=a.toString(8);break;case"s":a=(a=String(a))&&u[7]?a.substring(0,u[7]):a;break;case"u":a=Math.abs(a);break;case"x":a=a.toString(16);break;case"X":a=a.toString(16).toUpperCase()}a=/[def]/.test(u[8])&&u[3]&&a>=0?"+"+a:a,s=u[4]?"0"==u[4]?"0":u[4].charAt(1):" ",l=u[6]-String(a).length,c=u[6]?r(s,l):"",m.push(u[5]?a+c:c+a)}return m.join("")},a.cache={},a.parse=function(e){for(var r=e,t=[],n=[],i=0;r;){if(null!==(t=/^[^\x25]+/.exec(r)))n.push(t[0]);else if(null!==(t=/^\x25{2}/.exec(r)))n.push("%");else{if(null===(t=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(r)))throw new Error("[_.sprintf] huh?");if(t[2]){i|=1;var a=[],o=t[2],p=[];if(null===(p=/^([a-z_][a-z_\d]*)/i.exec(o)))throw new Error("[_.sprintf] huh?");for(a.push(p[1]);""!==(o=o.substring(p[0].length));)if(null!==(p=/^\.([a-z_][a-z_\d]*)/i.exec(o)))a.push(p[1]);else{if(null===(p=/^\[(\d+)\]/.exec(o)))throw new Error("[_.sprintf] huh?");a.push(p[1])}t[2]=a}else i|=2;if(3===i)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");n.push(t)}r=r.substring(t[0].length)}return n},a}();r.exports=i},{"./helper/strRepeat":22}],49:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/toPositive");r.exports=function(e,r,i){return e=t(e),r=""+r,i=null==i?0:Math.min(n(i),e.length),e.lastIndexOf(r,i)===i}},{"./helper/makeString":21,"./helper/toPositive":23}],50:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){e=t(e),r=t(r);var n=r?e.indexOf(r):-1;return~n?e.slice(0,n):e}},{"./helper/makeString":21}],51:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){e=t(e),r=t(r);var n=e.lastIndexOf(r);return~n?e.slice(0,n):e}},{"./helper/makeString":21}],52:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){e=t(e),r=t(r);var n=r?e.indexOf(r):-1;return~n?e.slice(n+r.length,e.length):e}},{"./helper/makeString":21}],53:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){e=t(e),r=t(r);var n=r?e.lastIndexOf(r):-1;return~n?e.slice(n+r.length,e.length):e}},{"./helper/makeString":21}],54:[function(e,r){var t=e("./helper/makeString");r.exports=function(e){return t(e).replace(/<\/?[^>]+>/g,"")}},{"./helper/makeString":21}],55:[function(e,r){var t=e("./helper/adjacent");r.exports=function(e){return t(e,1)}},{"./helper/adjacent":16}],56:[function(e,r){r.exports=function(e,r){return[r,e,r].join("")}},{}],57:[function(e,r){var t=e("./helper/makeString");r.exports=function(e){return t(e).replace(/\S/g,function(e){return e===e.toUpperCase()?e.toLowerCase():e.toUpperCase()})}},{"./helper/makeString":21}],58:[function(e,r){var t=e("./helper/makeString");r.exports=function(e){return t(e).toLowerCase().replace(/(?:^|\s|-)\S/g,function(e){return e.toUpperCase()})}},{"./helper/makeString":21}],59:[function(e,r){function t(e,r){var t,n,i=e.toLowerCase();for(r=[].concat(r),t=0;t<r.length;t+=1)if(n=r[t]){if(n.test&&n.test(e))return!0;if(n.toLowerCase()===i)return!0}}var n=e("./trim");r.exports=function(e,r,i){return"number"==typeof e&&(e=""+e),"string"!=typeof e?!!e:(e=n(e),t(e,r||["true","1"])?!0:t(e,i||["false","0"])?!1:void 0)}},{"./trim":63}],60:[function(e,r){r.exports=function(e,r){if(null==e)return 0;var t=Math.pow(10,isFinite(r)?r:0);return Math.round(e*t)/t}},{}],61:[function(e,r){var t=e("./rtrim");r.exports=function(e,r,n,i){r=r||", ",n=n||" and ";var a=e.slice(),o=a.pop();return e.length>2&&i&&(n=t(r)+n),a.length?a.join(r)+n+o:o}},{"./rtrim":45}],62:[function(e,r){var t=e("./toSentence");r.exports=function(e,r,n){return t(e,r,n,!0)}},{"./toSentence":61}],63:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/defaultToWhiteSpace"),i=String.prototype.trim;r.exports=function(e,r){return e=t(e),!r&&i?i.call(e):(r=n(r),e.replace(new RegExp("^"+r+"+|"+r+"+$","g"),""))}},{"./helper/defaultToWhiteSpace":17,"./helper/makeString":21}],64:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r,n){return e=t(e),n=n||"...",r=~~r,e.length>r?e.slice(0,r)+n:e}},{"./helper/makeString":21}],65:[function(e,r){var t=e("./trim");r.exports=function(e){return t(e).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()}},{"./trim":63}],66:[function(e,r){var t=e("./helper/makeString"),n=e("./helper/htmlEntities");r.exports=function(e){return t(e).replace(/\&([^;]+);/g,function(e,r){var t;return r in n?n[r]:(t=r.match(/^#x([\da-fA-F]+)$/))?String.fromCharCode(parseInt(t[1],16)):(t=r.match(/^#(\d+)$/))?String.fromCharCode(~~t[1]):e})}},{"./helper/htmlEntities":20,"./helper/makeString":21}],67:[function(e,r){r.exports=function(e,r){return r=r||'"',e[0]===r&&e[e.length-1]===r?e.slice(1,e.length-1):e}},{}],68:[function(e,r){var t=e("./sprintf");r.exports=function(e,r){return r.unshift(e),t.apply(null,r)}},{"./sprintf":48}],69:[function(e,r){var t=e("./isBlank"),n=e("./trim");r.exports=function(e,r){return t(e)?[]:n(e,r).split(r||/\s+/)}},{"./isBlank":27,"./trim":63}],70:[function(e,r){var t=e("./helper/makeString");r.exports=function(e,r){e=t(e),r=r||{};var n,i=r.width||75,a=r.seperator||"\n",o=r.cut||!1,p=r.preserveSpaces||!1,u=r.trailingSpaces||!1;if(0>=i)return e;if(o){var c=0;for(n="";c<e.length;)c%i==0&&c>0&&(n+=a),n+=e.charAt(c),c++;if(u)for(;c%i>0;)n+=" ",c++;return n}var s=e.split(" "),l=0;for(n="";s.length>0;){if(1+s[0].length+l>i&&l>0){if(p)n+=" ",l++;else if(u)for(;i>l;)n+=" ",l++;n+=a,l=0}l>0&&(n+=" ",l++),n+=s[0],l+=s[0].length,s.shift()}if(u)for(;i>l;)n+=" ",l++;return n}},{"./helper/makeString":21}]},{},[15])(15)});

(function ($) {
    'use strict';

    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function binl_md5(x, len) {

        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return md5;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = md5;
    } else {
        $.md5 = md5;
    }
}(this));

riot.tag2('main-nav', '<nav class="navigation"> <section class="container"> <a class="navigation-title float-left" href="#/"> <svg class="img" height="16" version="1.1" viewbox="0 0 16 16" width="16"> <path class="logo-svgpath" d="M16 6.707c0-3.139-0.919-5.687-2.054-5.707 0.005-0 0.009-0 0.014-0h-1.296c0 0-3.044 2.287-7.425 3.184-0.134 0.708-0.219 1.551-0.219 2.523s0.085 1.816 0.219 2.523c4.382 0.897 7.425 3.184 7.425 3.184h1.296c-0.005 0-0.009-0-0.014-0.001 1.136-0.020 2.054-2.567 2.054-5.707zM13.513 11.551c-0.147 0-0.305-0.152-0.387-0.243-0.197-0.22-0.387-0.562-0.55-0.989-0.363-0.957-0.564-2.239-0.564-3.611s0.2-2.655 0.564-3.611c0.162-0.428 0.353-0.77 0.55-0.99 0.081-0.091 0.24-0.243 0.387-0.243s0.305 0.152 0.387 0.243c0.197 0.22 0.387 0.562 0.55 0.99 0.363 0.957 0.564 2.239 0.564 3.611s-0.2 2.655-0.564 3.611c-0.162 0.428-0.353 0.77-0.55 0.989-0.081 0.091-0.24 0.243-0.387 0.243zM3.935 6.707c0-0.812 0.060-1.6 0.173-2.33-0.74 0.102-1.39 0.161-2.193 0.161-1.048 0-1.048 0-1.048 0l-0.867 1.479v1.378l0.867 1.479c0 0 0 0 1.048 0 0.803 0 1.453 0.059 2.193 0.161-0.113-0.729-0.173-1.518-0.173-2.33zM5.752 10.034l-2-0.383 1.279 5.024c0.066 0.26 0.324 0.391 0.573 0.291l1.852-0.741c0.249-0.1 0.349-0.374 0.222-0.611l-1.926-3.581zM13.513 8.574c-0.057 0-0.118-0.059-0.149-0.094-0.076-0.085-0.149-0.217-0.212-0.381-0.14-0.369-0.217-0.863-0.217-1.392s0.077-1.023 0.217-1.392c0.063-0.165 0.136-0.297 0.212-0.381 0.031-0.035 0.092-0.094 0.149-0.094s0.118 0.059 0.149 0.094c0.076 0.085 0.149 0.217 0.212 0.381 0.14 0.369 0.217 0.863 0.217 1.392s-0.077 1.023-0.217 1.392c-0.063 0.165-0.136 0.297-0.212 0.381-0.031 0.035-0.092 0.094-0.149 0.094z"></path> </svg> <h1 class="title">BlockedIn</h1> </a> <ul class="navigation-list float-left"> <li class="navigation-item"> <a class="navigation-link" href="#/professionals">Professionals</a> </li> <li class="navigation-item"> <a class="navigation-link" href="#/organizations">Organizations</a> </li> <li class="navigation-item"> <a class="navigation-link" href="#/universities">Universities</a> </li> </ul> <ul class="navigation-list float-right"> <li class="navigation-item" if="{dev || prod_host == \'bi1\'}"> <a class="navigation-link" href="#/user">Profile</a> </li> <li class="navigation-item" if="{dev || prod_host != \'bi1\'}"> <a class="navigation-link" href="#/org">Organization</a> </li> </ul> </section> </nav>', '', '', function(opts) {
    (function() {
      this.dev = location.hostname === "localhost";

      this.prod_host = s(location.hostname).strLeft(".").value();

      console.log("dev", this.dev, "host", this.prod_host);

    }).call(this);
}, '{ }');

riot.tag2('home', '<div class="row"> <div class="column"> <h2>BlockedIn</h2> </div> </div> <div class="row"> <div class="column"> <p> BlockedIn is the right place to find your next position. If you are a Company looking to hire a new talent, that\'s the right place. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. <br> ctetur adipiscing elit. In consequat mauris et elit. In consequat mauris et ante pretium ultricies..... </p> </div> </div> <div class="s20"></div> <div class="row"> <div class="column"> <h5>For Companies:</h5> <h3>Find a Professional</h3> </div> </div> <div class="row"> <div class="column"> <user-face each="{users}"></user-face> </div> </div> <div class="s50"></div> <div class="row"> <div class="column"> <h5>For You:</h5> <h3>Find a Position</h3> </div> </div> <div class="row"> <div class="column"> <org-face each="{orgs}"></org-face> </div> </div>', '', '', function(opts) {
    (function() {
      this.users = StoreData.users;

      this.store = opts.store;

      this.store.on('update', (function(_this) {
        return function(data) {
          _this.users = data.users;
          return _this.update();
        };
      })(this));

      this.orgs = StoreData.orgs;

      this.store = opts.store;

      this.store.on('update', (function(_this) {
        return function(data) {
          _this.orgs = data.orgs;
          return _this.update();
        };
      })(this));

    }).call(this);
}, '{ }');
riot.tag2('user-face', '<a class="hint--bottom hint--rounded" data-hint="{jobTitle}" href="#/users/{id}"> <img riot-src="{avatar}"> </a>', '', '', function(opts) {
}, '{ }');
riot.tag2('org-face', '<a class="hint--bottom hint--rounded" data-hint="{name}" href="#/orgs/{id}"> <img riot-src="{avatar}"> </a>', '', '', function(opts) {
}, '{ }');

riot.tag2('form-cont', '<h2>Register</h2> <form> <fieldset> <label> First name <input type="text" placeholder=""> </label> <label> Last name <input type="text" placeholder=""> </label> <label> Email <input placeholder="you@email.com" type="email"> </label> <label> Bio <textarea placeholder=""></textarea> </label> <input class="button-primary" type="submit" value="Sign up"> </fieldset> </form>', '', '', function(opts) {
});

riot.tag2('ab-table', '<table> <thead> <tr> <th>a</th> <th>b</th> </tr> </thead> <tbody> <tr> <td> <img src="http://api.randomuser.me/portraits/thumb/women/39.jpg"> <a href="#/users/1">Stephen Curry</a> </td> <td>27</td> </tr> <tr> <td><a href="#/users/2">Klay Thompson<a></td> <td>25</td> </tr> </tbody> </table>', '', '', function(opts) {
});

riot.tag2('table-users', '<p>Search</p> <input name="query" onkeyup="{filterUsers}" placeholder="enter a skill or a location" type="text"> <dtable> <user-row each="{users}"></user-row> </dtable> </input>', '', '', function(opts) {
    var matchString = (user) => {
      return s(`${user.name}|${user.jobTitle}`).toLowerCase()
    }
    this.filterUsers = function() {
      this.users = _(StoreData.users).select((user) => {
        return matchString(user).include(this.query.value)
      })
    }.bind(this)

    this.on('mount', function() {
      $("dtable").prepend("    \
        <user-row>             \
          <dtd></dtd>          \
          <dtd>Name</dtd>      \
          <dtd>Job title</dtd> \
        </user-row>            \
      ")
    })

    this.users = StoreData.users

    var self = this
    this.store = opts.store
    this.store.on('update', function(data) {
      self.users = data.users
      self.update()
    })
}, '{ }');
riot.tag2('user-row', '<dtd> <a href="#/users/{id}"> <img class="avatar" riot-src="{avatar}"> </a> </dtd> <dtd> <a href="#/users/{id}"> {name} </a> </dtd> <dtd>{jobTitle}</dtd>', '', '', function(opts) {
}, '{ }');

riot.tag2('table-orgs', '<p>Search</p> <input name="query" onkeyup="{filterOrgs}" placeholder="enter a skill or a location" type="text"> <dtable> <org-row each="{orgs}"></org-row> </dtable> </input>', '', '', function(opts) {
    var matchString = (org) => {
      return s(`${org.name}`).toLowerCase()
    }
    this.filterOrgs = function() {
      this.orgs = _(Orgs).select((org) => {
        return matchString(org).include(this.query.value)
      })
    }.bind(this)

    var present = (orgs) => {
      return _(orgs).map((org) => {
        org.employees = org.employees || Math.round(Math.random()*20+1)
        return org
      })
    }

    var self = this

    this.on('mount', function() {
      $("dtable").prepend("    \
        <org-row>             \
          <dtd></dtd>          \
          <dtd>Name</dtd>      \
          <dtd>Industry</dtd> \
          <dtd>Location</dtd> \
          <dtd>Employees</dtd> \
        </org-row>            \
      ")
    })

    this.orgs = present(StoreData.orgs)

    var self = this
    this.store = opts.store
    this.store.on('update', function(data) {
     self.orgs = present(data.orgs)
     self.update()
    })
}, '{ }');
riot.tag2('org-row', '<dtd> <a href="#/orgs/{id}"> <img class="avatar" riot-src="{avatar}"> </a> </dtd> <dtd> <a href="#/orgs/{id}"> {name} </a> </dtd> <dtd>{industry}</dtd> <dtd>{location}</dtd> <dtd>{employees}</dtd>', '', '', function(opts) {
}, '{ }');

riot.tag2('table-unis', '<table> <thead> <tr> <th>Name</th> </tr> </thead> <tbody> <tr> <td>UCL</td> </tr> <tr> <td>Oxford University</td> </tr> </tbody> </table>', '', '', function(opts) {
});

riot.tag2('sample', 'Timer: <h4>{count}</h4>', 'sample,[riot-tag="sample"] { font-size: 2rem } sample h3,[riot-tag="sample"] h3 { color: #444 } sample ul,[riot-tag="sample"] ul { color: #999 }', '', function(opts) {
    this.count = Store.count

    this.time = opts.start || 0

    var timer = setInterval(Actions.tick.bind(this), 1000)

}, '{ }');

riot.tag2('ab-footer', '<div class="s80"></div> <footer class="footer"> <section class="container"> <p>© {time} - Applied Blockchain ltd. - Register as: <a href="/#/users/new">User</a> / <a href="/#/orgs/new">Organization or University</a> </p> </section> </footer>', '', '', function(opts) {
    this.time = new Date().getFullYear()
}, '{ }');

riot.tag2('user', '<h2>{user.name}</h2> <h4>{user.jobTitle}</h4> <div class="row"> <div class="column"> <img class="avatar" riot-src="{user.avatarLg}"> </div> <div class="column column-80"> <p class="gray"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum. {user.bio} </p> <p> <strong>Location:</strong> {user.location} </p> <p> <strong>Nationality:</strong> {user.nationality} </p> </div> </div> <div class="s20"></div> <div class="gray"> <h3>Skills</h3> <div class="row"> <div class="column"> PHP ★★★★★ </div> <div class="column"> CSS ★★★★ </div> <div class="column"> HTML5 ★★★★ </div> <div class="column"> MYSQL ★★★ </div> <div class="column"> Linux ★★ </div> </div> <div class="row"> <div class="column"> Apache ★★★ </div> <div class="column"> Nginx ★ </div> <div class="column"> Photoshop ★★★★ </div> <div class="column"> Illustrator ★★★ </div> <div class="column"></div> </div> <div class="clear"></div> <div class="s30"></div> <h3>Positions</h3> <h5>PHP Developer</h5> <h5>ACME</h5> <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. </p> <div class="s30"></div> <h3>Education</h3> <h5>Degree in Astrophysics</h5> <h5>UCL</h5> <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. </p> </div>', '', '', function(opts) {
    (function() {
      var entry_id;

      entry_id = BR.getEntryId();

      BR.loadFromCollection("user", entry_id, this);

    }).call(this);
}, '{ }');

riot.tag2('org', '<h2>{org.name}</h2> <div class="row"> <div class="column"> <img class="avatar" riot-src="{org.avatarLg}"> </div> <div class="column"></div> <p class="gray"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum. </p> </div> <div class="s20"></div> <div class="row"> <div class="column"> <p> <strong>Industry:</strong> {org.industry} </p> </div> </div> <div class="row"> <div class="column"> <p> <strong>Location:</strong> {org.location} </p> </div> </div> <div class="row"> <div class="column"> <p class="gray"> <strong>Extra:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum. </p> </div> </div> <div class="row"> <div class="column right"> <p> organization type <br> {org.orgType} </p> <p> publicKey <br> <span class="hint--bottom-left hint--rounded" data-hint="{org.publicKey}">{org.publicKeyShort}</span> </p> </div> </div>', '', '', function(opts) {
    (function() {
      var entry_id, present;

      present = function(org) {
        if (org) {
          org.publicKeyShort = org.publicKey.slice(0, 9) + "..." + org.publicKey.slice(-6);
        }
        return org;
      };

      entry_id = BR.getEntryId();

      BR.loadFromCollection("org", entry_id, this, present);

    }).call(this);
}, '{ }');

riot.tag2('user-edit', '<h4>Edit your profile:</h4> <h2>{user.name}</h2> <form id="user_form" onsubmit="{update}"> <h4> <input class="big-text" name="jobTitle" placeholder="Your current Job Title" type="text" value="{user.jobTitle}"> </h4> <div class="row"> <div class="column overlay_cont"> <label class="normal"> <img class="avatar" riot-src="{user.avatarLg}"> <div class="icon overlay white">📷</div> <input type="file"> </label> </div> <div class="column column-80"> <p class="border" contenteditable> Bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consequat mauris et ante pretium ultricies. Curabitur eget ante eu enim efficitur congue. Praesent non condimentum turpis. In ultricies ipsum in sapien rutrum, eu ultricies mauris interdum. {user.bio} </p> <div class="row"> <div class="column column-20"> <label> <strong>Location:</strong> </label> </div> <div class="column column-80"> <input name="location" placeholder="Your City, Planet Earth" type="text" value="{user.location}"> </div> </div> <div class="row"> <div class="column column-20"> <label> <strong>Nationality:</strong> </label> </div> <div class="column column-80"> <input name="nationality" placeholder="Your country of Origin" type="text" value="{user.nationality}"> </div> </div> </div> </div> <fieldset> <label> Email <input name="email" placeholder="you@email.com" type="email"> </label> <label> Gender <input name="gender" placeholder="M / F" type="text" value="{user.gender}"> </label> <label> Cover letter <textarea placeholder="A generic cover letter you want to send to your ideal employer, why you are suited for the job."></textarea> </label> <input class="left button-primary" onclick="{update}" type="submit" value="Save"> <div class="spinner"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div> <div class="message">{message}</div> </fieldset> </form>', 'user-edit *[contentEditable],[riot-tag="user-edit"] *[contentEditable] { display: block; margin-bottom: 12px; } user-edit label,[riot-tag="user-edit"] label { margin-top: 10px; } user-edit input[type=file],[riot-tag="user-edit"] input[type=file] { display: none; }', '', function(opts) {
    (function() {
      var entry_id;

      entry_id = 2;

      BR.loadFromCollection("user", entry_id, this);

      BR.bindUpdateEntityForm("user", entry_id, this);

    }).call(this);
}, '{ }');

riot.tag2('org-edit', '<h4>Edit organization:</h4> <h2>{org.name}</h2> <form id="org_form" onsubmit="{update}"> <div class="row"> <div class="column overlay_cont"> <label class="normal"> <img class="avatar" riot-src="{org.avatarLg}"> <div class="icon overlay white">📷</div> <input type="file"> </label> </div> <div class="column column-80"> <div class="row"> <div class="column column-20"> <label> <strong>Location:</strong> </label> </div> <div class="column column-80"> <input name="location" placeholder="Your City, Planet Earth" type="text" value="{org.location}"> </div> </div> <div class="row"> <div class="column column-20"> <label> <strong>Industry:</strong> </label> </div> <div class="column column-80"> <input name="industry" placeholder="Business industry" type="text" value="{org.industry}"> </div> </div> </div> </div> <fieldset> <label> Email <input name="email" placeholder="you@email.com" type="email"> </label> <input class="left button-primary" onclick="{update}" type="submit" value="Save"> <div class="spinner"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div> <div class="message">{message}</div> </fieldset> </form>', 'org-edit *[contentEditable],[riot-tag="org-edit"] *[contentEditable] { display: block; margin-bottom: 12px; } org-edit label,[riot-tag="org-edit"] label { margin-top: 10px; } org-edit input[type=file],[riot-tag="org-edit"] input[type=file] { display: none; }', '', function(opts) {
    (function() {
      var entry_id, present;

      this.prod_host = s(location.hostname).strLeft(".").value();

      entry_id = Number(this.prod_host[2]) || 1;

      present = function(org) {
        if (org) {
          org = genOrgAvatar(org);
        }
        return org;
      };

      BR.loadFromCollection("org", entry_id, this, present);

      BR.bindUpdateEntityForm("org", entry_id, this);

    }).call(this);
}, '{ }');

riot.tag2('user-new', '<h3>Register:</h3> <form id="user_form" onsubmit="{update}"> <h5> <input class="big-text" name="name" placeholder="Your First and Last Name" required type="text" value="{user.name}"> </h5> <input class="big-text" name="jobTitle" placeholder="Your current Job Title" type="text" value="{user.jobTitle}"> <div class="row"> <div class="column overlay_cont"> <label class="normal"> <img class="avatar" riot-src="{user.avatarLg}"> <div class="icon overlay white">📷</div> <input type="file"> </label> </div> <div class="column column-80"> <p class="border" contenteditable> Bio: {user.bio} </p> <div class="row"> <div class="column column-20"> <label> <strong>Location:</strong> </label> </div> <div class="column column-80"> <input name="location" placeholder="Your City, Planet Earth" type="text" value="{user.location}"> </div> </div> <div class="row"> <div class="column column-20"> <label> <strong>Nationality:</strong> </label> </div> <div class="column column-80"> <input name="nationality" placeholder="Your country of Origin" type="text" value="{user.nationality}"> </div> </div> </div> </div> <fieldset> <label> Email <input name="email" placeholder="you@email.com" type="email"> </label> <label> Gender <input name="gender" placeholder="M / F" type="text" value="{user.gender}"> </label> <label> Cover letter <textarea placeholder="A generic cover letter you want to send to your ideal employer, why you are suited for the job."></textarea> </label> <input class="left button-primary" onclick="{update}" type="submit" value="Register"> <div class="spinner"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div> <div class="message">{message}</div> </fieldset> </form>', 'user-new *[contentEditable],[riot-tag="user-new"] *[contentEditable] { display: block; margin-bottom: 12px; } user-new label,[riot-tag="user-new"] label { margin-top: 10px; } user-new input[type=file],[riot-tag="user-new"] input[type=file] { display: none; }', '', function(opts) {
    (function() {
      this.user = new User({});

      BR.bindCreateEntityForm("user", this);

    }).call(this);
}, '{ }');

riot.tag2('org-new', '<h4>Edit organization:</h4> <h2>{org.name}</h2> <form id="org_form" onsubmit="{update}"> <div class="row"> <div class="column overlay_cont"> <label class="normal"> <img class="avatar" riot-src="{org.avatarLg}"> <div class="icon overlay white">📷</div> <input type="file"> </label> </div> <div class="column column-80"> <div class="row"> <div class="column column-20"> <label> <strong>Location:</strong> </label> </div> <div class="column column-80"> <input name="location" placeholder="Your City, Planet Earth" type="text" value="{org.location}"> </div> </div> <div class="row"> <div class="column column-20"> <label> <strong>Industry:</strong> </label> </div> <div class="column column-80"> <input name="industry" placeholder="Business industry" type="text" value="{org.industry}"> </div> </div> </div> </div> <fieldset> <label> Email <input name="email" placeholder="you@email.com" type="email"> </label> <input class="left button-primary" onclick="{update}" type="submit" value="Register"> <div class="spinner"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div> <div class="message">{message}</div> </fieldset> </form>', 'org-new *[contentEditable],[riot-tag="org-new"] *[contentEditable] { display: block; margin-bottom: 12px; } org-new label,[riot-tag="org-new"] label { margin-top: 10px; } org-new input[type=file],[riot-tag="org-new"] input[type=file] { display: none; }', '', function(opts) {
    (function() {
      var entry_id, present;

      this.prod_host = s(location.hostname).strLeft(".").value();

      entry_id = Number(this.prod_host[2]) || 1;

      present = function(org) {
        if (org) {
          org = genOrgAvatar(org);
        }
        return org;
      };

      BR.loadFromCollection("org", entry_id, this, present);

      BR.bindUpdateEntityForm("org", entry_id, this);

    }).call(this);
}, '{ }');

riot.tag2('not-found', '<h2>404</h2> <p>Not found</p>', '', '', function(opts) {
});

var BApi, G, c;

c = console || {
  log: function() {}
};

G = window;

BApi = (function() {
  function BApi(host) {
    this.host = host;
    this.host = "http://" + this.host;
    this.root = this.host + "/api";
  }

  BApi.prototype.methodGet = function(contractName, name, values) {
    var query;
    query = "";
    if (values != null) {
      query = $.param(values);
    }
    return this.root + "/" + contractName + "/" + name + "?" + query;
  };

  BApi.prototype.methodPost = function(contractName, name) {
    return this.root + "/" + contractName + "/" + name;
  };

  BApi.prototype.get = function(contract, methodName, values) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        c.log("BApi#" + contract + "." + methodName + " " + (JSON.stringify(values)));
        return $.getJSON(_this.methodGet(contract, methodName, values)).fail(reject).then(function(val) {
          return resolve(val.value);
        });
      };
    })(this));
  };

  BApi.prototype.post = function(contract, methodName, values) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        c.log("BApi#" + contract + "." + methodName + " " + (JSON.stringify(values)));
        return $.post(_this.methodPost(contract, methodName), values).fail(reject).then(function(val) {
          return resolve(val.value);
        });
      };
    })(this));
  };

  return BApi;

})();

var BAppModel;

BAppModel = (function() {
  function BAppModel() {}

  BAppModel.prototype.modelName = function() {
    this.c = console;
    return this.constructor.name;
  };

  BAppModel.prototype.hasAttribute = function(attr) {
    return _(this.attrs).include(attr);
  };

  BAppModel.klass = function() {
    return G[this.name];
  };

  BAppModel["new"] = function(args) {
    return new G[this.name](args);
  };

  BAppModel.collectionUp = function() {
    return this.pluralize(this.name);
  };

  BAppModel.collection = function() {
    return this.collectionUp().toLowerCase();
  };

  BAppModel.get = function(id) {
    if (!API) {
      this.c.error(this.errApiNotFound);
    }
    return API.get(this.collection(), "get", {
      id: id
    }).then((function(_this) {
      return function(values) {
        return _this["new"](values);
      };
    })(this))["catch"](function(error) {
      c.error("Error: " + error);
      return reject(error);
    });
  };

  BAppModel.all = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return API.get(_this.collection(), "get" + (_this.collectionUp()) + "Count").then(function(count) {
          var promises;
          promises = _this.allGet(count);
          return _this.allResolve(promises, resolve, reject);
        })["catch"](function(error) {
          c.error("Error: " + error);
          return reject(error);
        });
      };
    })(this));
  };

  BAppModel.create = function(values) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (!API) {
          _this.c.error(_this.errApiNotFound);
        }
        values = _this.filterValues(values, _this);
        values = _this.convertValuesForSave(values);
        delete values.id;
        return API.post(_this.collection(), "create", values).then(function(resp) {
          return resolve(resp);
        })["catch"](function(error) {
          c.error("Error: " + error);
          return reject(error);
        });
      };
    })(this));
  };

  BAppModel.update = function(values) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (!API) {
          _this.c.error(_this.errApiNotFound);
        }
        values = _this.filterValues(values, _this);
        values = _this.convertValuesForSave(values);
        return API.post(_this.collection(), "update", values).then(function(resp) {
          return resolve(resp);
        })["catch"](function(error) {
          c.error("Error: " + error);
          return reject(error);
        });
      };
    })(this));
  };

  BAppModel.filterValues = function(values, ctx) {
    var newVals;
    newVals = {};
    _(ctx.attrs).each(function(attr) {
      var val;
      if (_(ctx.attrs).include(attr)) {
        val = values[attr];
      }
      if (!val) {
        val = "-";
      }
      return newVals[attr] = val;
    });
    return newVals;
  };

  BAppModel.convertValuesForSave = function(values) {
    var newVals;
    newVals = {};
    _(values).map(function(value, key) {
      if (key === "id") {
        return newVals[key] = value;
      } else {
        return newVals["_" + key] = value;
      }
    });
    return newVals;
  };

  BAppModel.pluralize = function(word) {
    if (s(word).endsWith('y')) {
      word = word.substring(word.length - 1);
      return word + "ies";
    } else {
      return word + "s";
    }
  };

  BAppModel.allGet = function(count) {
    var i, id, promises, ref;
    promises = [];
    if (count > 0) {
      for (id = i = 1, ref = count; 1 <= ref ? i <= ref : i >= ref; id = 1 <= ref ? ++i : --i) {
        promises.push(API.get(this.collection(), "get", {
          id: id
        }));
      }
    }
    return promises;
  };

  BAppModel.allResolve = function(promises, resolve, reject) {
    return Promise.all(promises).then((function(_this) {
      return function(collectionResp) {
        var collection, i, len, values;
        collection = [];
        for (i = 0, len = collectionResp.length; i < len; i++) {
          values = collectionResp[i];
          collection.push(_this["new"](values));
        }
        return resolve(collection);
      };
    })(this))["catch"](function(error) {
      c.error("Error: " + error);
      return reject(error);
    });
  };

  BAppModel.prototype.errApiNotFound = "API not found, please instantiate it via: 'var API = new BApi(host)'";

  return BAppModel;

})();

var Employment, Org, User,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

User = (function(superClass) {
  extend(User, superClass);

  function User(arg) {
    this.id = arg.id, this.name = arg.name, this.publicKey = arg.publicKey, this.location = arg.location, this.achievements = arg.achievements, this.birthDate = arg.birthDate, this.gender = arg.gender, this.nationality = arg.nationality;
  }

  User.attrs = ["id", "name", "publicKey", "location", "achievements", "birthDate", "gender", "nationality"];

  return User;

})(BAppModel);

Org = (function(superClass) {
  extend(Org, superClass);

  function Org(arg) {
    this.id = arg.id, this.name = arg.name, this.publicKey = arg.publicKey, this.orgType = arg.orgType, this.location = arg.location, this.industry = arg.industry;
  }

  Org.attrs = ["id", "name", "publicKey", "orgType", "location", "industry"];

  return Org;

})(BAppModel);

Employment = (function(superClass) {
  extend(Employment, superClass);

  function Employment(arg) {
    this.id = arg.id, this.userId = arg.userId, this.orgId = arg.orgId, this.role = arg.role, this.dateStart = arg.dateStart, this.dateEnd = arg.dateEnd, this.reportsTo = arg.reportsTo, this.budget = arg.budget, this.skills = arg.skills;
  }

  Employment.attrs = ["id", "userId", "orgId", "role", "dateStart", "dateEnd", "reportsTo", "budget", "skills"];

  return Employment;

})(BAppModel);

var API, bappHost, host;

host = document.location.hostname;

bappHost = host === "localhost" ? "localhost:3001" : "api." + host;

host = bappHost;

API = new BApi(host);

var BR;

BR = {
  getEntryId: function() {
    var entry_id;
    entry_id = s(location.hash).strRightBack("/").value();
    return Number(entry_id);
  },
  loadFromCollection: (function(_this) {
    return function(name, entry_id, ctx, presenter) {
      var coll, coll_name, elem;
      coll_name = BR.pluralize(name);
      coll = StoreData[coll_name];
      elem = _(coll).find(function(e) {
        return entry_id === e.id;
      });
      if (presenter) {
        elem = presenter(elem);
      }
      ctx[name] = elem;
      ctx.update();
      _this.store = ctx.opts.store;
      return _this.store.on('update', function(data) {
        coll = data[coll_name];
        elem = _(coll).find(function(e) {
          return entry_id === e.id;
        });
        if (presenter) {
          elem = presenter(elem);
        }
        ctx[name] = elem;
        return ctx.update();
      });
    };
  })(this),
  bindSaveEntityForm: (function(_this) {
    return function(action, name, entry_id, ctx) {
      var coll_name, form;
      coll_name = BR.pluralize(name);
      form = "form#" + name + "_form";
      _this.message = "";
      return ctx.on('mount', function(data) {
        var spinner;
        spinner = $(form + " .spinner");
        return $(form + " input[type=submit]").on("click", function(evt) {
          var klass, obj, values;
          spinner.css({
            visibility: "visible"
          });
          obj = ctx[name];
          klass = G[s.capitalize(name)];
          values = $("" + form).serializeArray();
          _(values).each(function(entry) {
            return obj[entry.name] = entry.value;
          });
          c.log(name + "." + action + "()", obj);
          return klass[action](obj).then(function(resp) {
            var coll;
            c.log(name + " updated:", resp);
            spinner.css({
              visibility: "hidden"
            });
            $(form + " .message").html("saved!");
            if (action === "create") {
              coll = StoreData[coll_name];
              return coll.push(obj);
            }
          })["catch"](function(error) {
            c.error("Error: Cannot " + action + " current " + name + ":", error);
            return c.error(error.stack);
          });
        });
      });
    };
  })(this),
  bindCreateEntityForm: (function(_this) {
    return function(name, ctx) {
      return BR.bindSaveEntityForm("create", name, null, ctx);
    };
  })(this),
  bindUpdateEntityForm: (function(_this) {
    return function(name, entry_id, ctx) {
      return BR.bindSaveEntityForm("update", name, entry_id, ctx);
    };
  })(this),
  pluralize: function(word) {
    if (s(word).endsWith('y')) {
      word = word.substring(word.length - 1);
      return word + "ies";
    } else {
      return word + "s";
    }
  }
};

var Orgs, Store, StoreData, TMP_JOB_TITLES, Unis, Users, addTmpJobTitle, fetchUserAvatars, genOrgAvatar, genOrgAvatars, identicon;

Users = [];

Orgs = [];

Orgs = _(Orgs).map((function(_this) {
  return function(entity) {
    return new Org(entity);
  };
})(this));

identicon = function(entity, size) {
  var icon, id, sizePx;
  sizePx = 80;
  if (size === "large") {
    sizePx = 150;
  }
  id = md5(entity.id.toString());
  icon = new Identicon(id, sizePx).toString();
  return "data:image/png;base64," + icon;
};

genOrgAvatar = function(entity) {
  entity.avatar = identicon(entity);
  entity.avatarLg = identicon(entity, "large");
  return entity;
};

genOrgAvatars = function(entities) {
  return _(entities).map(function(entity) {
    return genOrgAvatar(entity);
  });
};

fetchUserAvatars = function(users) {
  return _(users).map(function(user) {
    var gender;
    gender = user.gender.toLowerCase() === "f" ? "women" : "men";
    user.avatar = "http://api.randomuser.me/portraits/thumb/" + gender + "/" + user.id + ".jpg";
    user.avatarLg = "http://api.randomuser.me/portraits/med/" + gender + "/" + user.id + ".jpg";
    return user;
  });
};

TMP_JOB_TITLES = ["Graphic Designer", "Software Developer", "Mathematician", "Biologist", "Engineer", "Trader", "Accountant", "Video Editor", "Cameraman", "Illustrator", "SEO", "Social Media Expert", "Copywriter", "Writer", "Editor"];

addTmpJobTitle = function(users) {
  return _(users).map(function(user) {
    user.jobTitle = _.sample(TMP_JOB_TITLES);
    return user;
  });
};

Unis = [];

StoreData = {
  users: Users,
  orgs: Orgs,
  unis: Unis
};

Store = function() {
  this.update = function(StoreData) {
    return this.trigger('update', StoreData);
  };
  riot.observable(this);
  setTimeout((function(_this) {
    return function() {
      return _this.update(StoreData);
    };
  })(this), 0);
  Org.all().then((function(_this) {
    return function(orgs) {
      orgs = genOrgAvatars(orgs);
      StoreData.orgs = orgs;
      return _this.update(StoreData);
    };
  })(this))["catch"](function(error) {
    return c.error("Error: " + error);
  });
  User.all().then((function(_this) {
    return function(users) {
      users = fetchUserAvatars(users);
      users = addTmpJobTitle(users);
      StoreData.users = users;
      return _this.update(StoreData);
    };
  })(this))["catch"](function(error) {
    return c.error("Error: " + error);
  });
  return this;
};

var DefaultRoute, NotFoundRoute, ROUTES, RedirectRoute, Route, api, store;

Route = riot.router.Route;

DefaultRoute = riot.router.DefaultRoute;

NotFoundRoute = riot.router.NotFoundRoute;

RedirectRoute = riot.router.RedirectRoute;

store = new Store();

api = {
  store: store
};

ROUTES = [
  new DefaultRoute({
    tag: 'home',
    api: api
  }), new Route({
    path: '/professionals',
    tag: 'table-users',
    api: api
  }), new Route({
    path: '/organizations',
    tag: 'table-orgs',
    api: api
  }), new Route({
    path: '/universities',
    tag: 'table-unis',
    api: api
  }), new Route({
    path: '/user',
    tag: 'user-edit',
    api: api
  }), new Route({
    path: '/users/new',
    tag: 'user-new',
    api: api
  }), new Route({
    path: '/users/:id',
    tag: 'user',
    api: api
  }), new Route({
    path: '/org',
    tag: 'org-edit',
    api: api
  }), new Route({
    path: '/orgs/new',
    tag: 'org-new',
    api: api
  }), new Route({
    path: '/orgs/:id',
    tag: 'org',
    api: api
  }), new NotFoundRoute({
    tag: 'not-found'
  })
];

riot.mount('*');

riot.router.routes(ROUTES);

riot.router.start();

console.log("Riot started");
});
