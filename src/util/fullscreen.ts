/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default function fullscreen(element, callback?) {
  let doc = document as any

  function _fullscreen_callback(e) {
    callback && callback.call()

    if (!doc.fullscreen && !doc.mozFullScreen && !doc.webkitIsFullScreen && !doc.msFullscreenElement) {
      ["fullscreenchange", "mozfullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach(
        event => doc.removeEventListener(event, _fullscreen_callback)
      );
    }
  }

  ["fullscreenchange", "mozfullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach(
    event => doc.addEventListener(event, _fullscreen_callback)
  );

  if (element.requestFullScreen)
    element.requestFullScreen();
  else if (element.webkitRequestFullScreen)
    element.webkitRequestFullScreen();
  else if (element.mozRequestFullScreen)
    element.mozRequestFullScreen();
  else if (element.msRequestFullscreen)
    element.msRequestFullscreen();
}
