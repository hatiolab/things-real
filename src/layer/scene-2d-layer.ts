/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from '../components/component'
import Container from '../components/container'
import Layer from './layer'

import { warn } from '../core/logger'
import * as utils from '../core'

import InfoWindow from '../components/info-window'
import * as Popup from './action/popup'
import * as Emphasize from './action/emphasize'

import { License } from '../license/license'
// import { GESTURES, KEYEVENTS } from '../const'

const WATERMARK_DATA_URI = 'data:image/png;base64,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'

const SCALE_DEFAULT = { x: 1, y: 1 }
const TRANSLATE_DEFAULT = { x: 0, y: 0 }

export default class Scene2DLayer extends Layer {

  constructor(x, y) {
    super(x, y)
  }

  dispose() {
    super.dispose()

    delete this._canvas
    delete this._overlay
  }

  contains(x, y) {
    return true;
  }

  isRootModel() {
    return true
  }

  get stuck() {
    return true
  }

  get overlay() {

    if (!this._overlay) {

      var overlay = document.createElement('div')
      overlay.style.position = 'absolute';

      overlay.style['user-select'] = 'none';
      overlay.style['transform-origin'] = 'top left';

      this.element && this.element.appendChild(overlay)

      // 사용자 이벤트의 확산을 막는다.
      // GESTURES.forEach(function (event) {
      //   overlay.addEventListener(event, function (e) {
      //     e.stopPropagation();
      //   })
      // });

      // KEYEVENTS.forEach(function (event) {
      //   overlay.addEventListener(event, function (e) {
      //     e.stopPropagation();
      //   })
      // });

      this._overlay = overlay

      this._repositionOverlay()
    }

    return this._overlay
  }

  createElement() {
    var anchor = document.createElement('div')
    anchor.style.position = 'absolute';

    anchor.style['user-select'] = 'none';
    anchor.style.overflow = 'hidden';

    this._canvas = Component.createCanvas(1, 1);

    this._canvas.style.position = 'absolute';
    anchor.appendChild(this._canvas);

    if (this._overlay)
      anchor.appendChild(this._overlay)

    return anchor
  }

  resize() {
    this.fitSize(this.element)
    this.fitSize(this.canvas)
  }

  get canvas() {
    return this._canvas
  }

  /* Pixel하나가 차지하는 길이의 값 환산 */
  get MPP() {

    var { scale = { x: 1, y: 1 }, unit } = this.state

    switch (unit) {
      case 'mm':
      case 'cm':
        return 1 / this.app.PPM / scale.x
      case 'in':
        return 1 / this.app.PPI / scale.x
      case 'px':
      default:
        return 1 / scale.x
    }
  }

  /*
   * capturePath(path) 파라미터로 주어진 path를 포함하는 컨테이너를 찾는다.
   * @path
   * @excepts 컨테이너를 찾을 때 제외되는 대상이다.
   */

  capturePath(path, excepts) {

    var capturables = this.layout.capturables(this)

    for (let i = capturables.length - 1; i >= 0; i--) {
      let capturable = capturables[i]
      if (!capturable.isContainer())
        continue

      let found = capturable.capturePath(path, excepts);
      if (found)
        return found;
    }

    return false
  }

  get eventMap() {
    // TODO 이벤트핸들러의 이름이 디폴트 이벤트 핸들러와 같아서, 불필요하게 두번호출되는 문제가 없는지 혹은 의도적인지 확인할 것.
    return {
      '(self)': {
        '(all)': {
          change: this.onchanged,
          mouseenter: this.onmouseenter,
          mouseleave: this.onmouseleave,
          click: this.onclick
        }
      }
    }
  }

  postrender(ctx) {
    super.postrender(ctx);

    // 라이선스가 유효하지 않으면, 워터마크를 표시한다.
    if (!License.valid) {
      if (!this._watermark) {
        this._watermark = new Image()
        this._watermark.src = WATERMARK_DATA_URI
      }
      let watermark = this._watermark;
      ctx.globalAlpha = 0.5
      ctx.drawImage(watermark, this.state.width - watermark.width - 30, this.state.height - watermark.height - 30)
    }
  }

  _repositionOverlay() {
    var overlay = this._overlay

    if (!overlay)
      return

    var {
      translate = TRANSLATE_DEFAULT,
      scale = SCALE_DEFAULT,
      rotation = 0
    } = this.state

    var {
      left, top, width, height
    } = this.bounds

    overlay.style.left = left + 'px';
    overlay.style.top = top + 'px';
    /*
     * overlay가 마우스 이벤트를 받게되면, scale이 반영되지 않은 좌표로 이벤트가 발생하므로,
     * 마우스 이벤트를 직접 받지 못하도록 크기를 0로 유지한다.
     */
    // overlay.style['user-select'] = 'none';
    // overlay.style.width = 0 + 'px';
    // overlay.style.height = 0 + 'px';

    var transform = `rotate(${rotation}rad) scale(${scale.x}, ${scale.y})`;
    overlay.style['margin-left'] = translate.x + 'px';
    overlay.style['margin-top'] = translate.y + 'px';

    ['-webkit-', '-moz-', '-ms-', '-o-', ''].forEach(prefix => {
      overlay.style[prefix + 'transform'] = transform;
    })
  }

  onchange(after) {
    // Root Component는 id, class, text 속성을 가지지 않는다.
    var model = this._model;

    delete model.id;
    delete model.text;
    delete model.class;

    this._repositionOverlay()
  }

  onchanged(after, before, hint) {

    this.invalidate()
  }

  onmouseenter(event, hint) {
    if (!this.app || this.app.isEditMode)
      return

    if (!hint)
      return

    var source = hint.origin

    // model-layer는 hover event를 처리하지 않는다.
    if (source instanceof ModelLayer || !source.model.event || !source.model.event.hover)
      return

    var hoverEvtModel = source.model.event.hover

    if (hoverEvtModel.emphasize)
      Emphasize.emphasize(source)

    if (hoverEvtModel.infoWindow && !source.hidden)
      InfoWindow.show(source, hoverEvtModel.infoWindow, true /* auto close - no close button */)

    if (hoverEvtModel.target && hoverEvtModel.hasOwnProperty("value")) {
      // backup current value
      source._lastValue = this.root.variable(hoverEvtModel.target)
      this.root.variable(hoverEvtModel.target, hoverEvtModel.value)
    }
  }

  onmouseleave(event, hint) {
    if (!this.app || this.app.isEditMode)
      return

    if (!hint)
      return

    var source = hint.origin

    if (!source.model.event)
      return

    if (!source.model.event.hover)
      return

    var hoverEvtModel = source.model.event.hover

    if (!hoverEvtModel)
      return

    if (hoverEvtModel.emphasize)
      Emphasize.normalize(source)

    if (hoverEvtModel.infoWindow && !source.hidden)
      InfoWindow.hide(source, hoverEvtModel.infoWindow)

    if (hoverEvtModel.target && hoverEvtModel.hasOwnProperty("value")) {
      // restore last value
      this.root.variable(hoverEvtModel.target, source._lastValue)
      delete source._lastValue
    }
  }

  onclick(event, hint) {
    if (this.app.isEditMode)
      return

    if (!hint)
      return

    var source = hint.origin

    if (!source.model.event)
      return

    if (!source.model.event.tap)
      return

    var tapEvtModel = source.model.event.tap

    if (tapEvtModel.infoWindow && !source.hidden)
      InfoWindow.show(source, tapEvtModel.infoWindow)

    if (!tapEvtModel || !tapEvtModel.target)
      return

    if (/^\$/.test(tapEvtModel.target)) {
      this.root.variable(tapEvtModel.target.substring(1), source.substitute(tapEvtModel.value))
    } else if (tapEvtModel.target == 'popup') {
      Popup.show(source, tapEvtModel.value)
    } else {
      this.trigger(tapEvtModel.target, source.substitute(tapEvtModel.value))
    }
  }
}

ModelLayer.Popup = Popup;

Component.register('model-layer', ModelLayer)
