/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

const FULLSCREEN_EVENTS = [
  "fullscreenchange",
  "mozfullscreenchange",
  "webkitfullscreenchange",
  "MSFullscreenChange"
]

export default function fullscreen(element, callback?) {
  let doc = document as any

  function _fullscreen_callback(e) {
    callback && callback.call()

    if (!doc.fullscreen && !doc.mozFullScreen && !doc.webkitIsFullScreen && !doc.msFullscreenElement) {
      FULLSCREEN_EVENTS.forEach(
        event => doc.removeEventListener(event, _fullscreen_callback)
      )
    }
  }

  FULLSCREEN_EVENTS.forEach(
    event => doc.addEventListener(event, _fullscreen_callback)
  )

  if (element.requestFullScreen)
    element.requestFullScreen();
  else if (element.webkitRequestFullScreen)
    element.webkitRequestFullScreen();
  else if (element.mozRequestFullScreen)
    element.mozRequestFullScreen();
  else if (element.msRequestFullscreen)
    element.msRequestFullscreen();
}
