/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { EventSource } from '../event'
import { RootContainer } from '../component'
import { Scene } from '../scene'

export default abstract class Layer extends EventSource {

  protected owner: Scene
  protected _rootContainer: RootContainer
  protected _target: HTMLElement
  protected element: HTMLElement

  private _draw_reserved: boolean = false
  private _resizeTimeout

  constructor(owner: Scene) {
    super()

    this.owner = owner
    this.setRootContainer(owner.rootContainer)
  }

  dispose() {
    this.setRootContainer()
    this.target = null;
    this.element = null;
  }

  ready() {
    /** Target Element에 attach된 후, render() 전에 호출됨. */
  }

  private throttle_render() {
    if (!this._draw_reserved) {
      requestAnimationFrame(() => {
        this._draw_reserved = false;

        this.trigger('redraw');
        this.render();
      })
    }
    this._draw_reserved = true;
  }

  get rootContainer() {
    return this._rootContainer
  }

  setRootContainer(rootContainer?) {
    if (this._rootContainer) {
      this._rootContainer.off('render')
      this._rootContainer.dispose()
      delete this._rootContainer
    }

    if (rootContainer) {
      this._rootContainer = rootContainer

      this._rootContainer.on('render', () => {
        this.invalidate()
      })

      this.invalidate()
    }
  }

  onresize(width, height) { }

  /**
   * 부모 엘리먼트의 크기가 변화했을 때, 호출한다.
   * 부모 엘리먼트의 크기를 1초 간격으로 쫓아가며 자신의 크기를 변화시킨다.
   * 자신의 크기를 변화시키면서, onresize 콜백으로 변화에 따른 부수적인 작업을 할 수 있도록 한다.
   * 1초 동안 부모 엘리먼트의 크기변화가 없으면, resize를 멈춘다.
   */
  resize() {
    if (this._resizeTimeout !== undefined) {
      clearTimeout(this._resizeTimeout)
      delete this._resizeTimeout
    }

    if (!this.target)
      return

    var oldwidth
    var oldheight

    var checker = () => {

      let width = this.target.offsetWidth
      let height = this.target.offsetHeight

      if (oldwidth == width && oldheight == height) {
        return
      }

      this.element.style.width = width + 'px'
      this.element.style.height = height + 'px'

      this.onresize && this.onresize(width, height)
      this.invalidate()

      oldwidth = width
      oldheight = height

      // 최종 마무리는 확실하게
      this._resizeTimeout = setTimeout(checker, 500)
    }

    // 최초 반응은 빠르게.
    requestAnimationFrame(checker)
  }

  protected abstract buildOverlays()

  get target() {

    return this._target
  }

  set target(target) {
    if (this._target && this.element) {
      this._target.removeChild(this.element);
    }

    this._target = target;

    if (!target)
      return;

    if (!this.element) {
      this.element = document.createElement('div')
      this.element.style.position = 'absolute'

      this.buildOverlays()
    }

    target.appendChild(this.element)

    this.resize()

    this.ready()
  }

  protected abstract render(context?)

  protected prerender(context?) { }

  /**
   * 화면을 갱신하는 render() 함수호출을 최소화하기 위한 기능을 함.
   * 화면을 그리는 로직은 render() 에서 구현하지만,
   * 화면을 갱신하기 위해서는 invalidate() 를 호출하라.
   */
  public invalidate() {
    // throttle 로직으로 호출을 최소화
    // 빈번히 반복되는 invalidate()에 대해 비효율적으로 render()가 호출되는 것을 방지하기 위함
    this.throttle_render();
  }
}
