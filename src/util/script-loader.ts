/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

/*
 * 1. SCRIPTS, STYLES 에는 각 소스별 상태를 관리한다.
 * SCRIPTS, STYLES : {
 *   'http://echarts.baidu.com/dist/echarts.min.js': true | false (true means loaded, false means not loaded yet)
 * }
 *
 * 2. PROMISES : 각 소스군별 pending resolver, reject 을 관리한다.
 * PROMISES: [{
 *   resolve,
 *   reject,
 *   srcs: ['src1', 'src2']
 * }]
 *
 * [특징]
 * 1. CORS 제약에서 자유롭다.
 * 2. 같은 스크립트를 반복해서 로드하지 않는다.
 * 3. 로드에 실패한 스크립트도 다시 반복해서 로드를 시도할 수 있다.
 */

// SystemJS를 활용하는 경우에는 다음과 같이 import 할 수 있다.
//
// import System from 'systemjs/dist/system-production'

var SCRIPTS = {}
var STYLES = {}

var PROMISES = []

function onload(e) {
  var types = e.target.tagName == 'SCRIPT' ? SCRIPTS : STYLES
  var src = e.target.src || e.target.href

  types[src] = true

  PROMISES.forEach((ready, index) => {
    let {
      resolve,
      scripts,
      styles
    } = ready

    if (types == SCRIPTS) {
      let idx = scripts.indexOf(src)
      if (idx > -1 && idx < scripts.length - 1)
        request_script(scripts[idx + 1])
    }

    for (let i = 0; i < scripts.length; i++)
      if (!SCRIPTS[scripts[i]])
        return

    if (styles) {
      for (let i = 0; i < styles.length; i++)
        if (!STYLES[styles[i]])
          return
    }

    resolve()

    PROMISES[index] = null
  })

  PROMISES = PROMISES.filter(x => x)
}

function onerror(e) {
  var src = e.target.src
  var types = e.target.tagName == 'SCRIPT' ? SCRIPTS : STYLES

  PROMISES.forEach((ready, index) => {
    let {
      reject,
      scripts,
      styles
    } = ready

    let done = false

    if (types === SCRIPTS) {
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i] == src) {
          done = true
          break;
        }
      }
    } else if (styles) {
      for (let i = 0; i < styles.length; i++) {
        if (styles[i] == src) {
          done = true
          break;
        }
      }
    }

    if (done) {
      reject(e)

      PROMISES[index] = null
    }
  })

  PROMISES = PROMISES.filter(x => x)

  delete types[src]
  document.head.removeChild(e.target)
}

function request_script(src) {

  SCRIPTS[src] = false;

  var script = document.createElement('script');
  script.onload = onload
  script.onerror = onerror

  script.type = 'text/javascript';
  script.src = src;
  document.head.appendChild(script)
}

function request_style(src) {

  STYLES[src] = false;

  var link = document.createElement('link');
  link.onload = onload
  link.onerror = onerror

  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.media = 'screen,print';
  link.href = src;

  document.head.appendChild(link)
}

export default class ScriptLoader {

  static load(scripts, styles) {

    if (typeof (scripts) == 'string')
      scripts = [scripts]
    if (typeof (styles) == 'string')
      styles = [styles]

    return new Promise(function (resolve, reject) {

      if ((scripts && !(scripts instanceof Array))
        || (styles && !(styles instanceof Array))) {
        reject('invalid sources for load')
        return
      }

      /* check state of each src */
      var done = true;

      // style first
      styles && styles.forEach(src => {
        if (!STYLES.hasOwnProperty(src))
          request_style(src)

        if (!STYLES[src])
          done = false
      })

      var first
      if (scripts && scripts.length > 0) {
        scripts.forEach(src => {
          if (!SCRIPTS.hasOwnProperty(src))
            first = first || src
          else if (!SCRIPTS[src])
            done = false
        })
      }

      if (first)
        request_script(first)
      else if (done) {
        resolve()
        return
      }

      PROMISES.push({ resolve, reject, scripts, styles })
    })
  }
}
