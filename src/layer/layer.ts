/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { EventSource } from '../event'
import { RootContainer } from '../component'
import { Scene } from '../scene'
import * as THREE from 'three'

export default class Layer extends EventSource {

  protected owner: Scene
  protected _rootContainer: RootContainer
  protected _target: HTMLElement
  protected element: HTMLElement

  private draw_reserved: boolean = false

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
    if (!this.draw_reserved) {
      requestAnimationFrame(() => {
        this.draw_reserved = false;

        this.trigger('redraw');
        this.render();
      })
    }
    this.draw_reserved = true;
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
        this.render()
      })

      this.invalidate()
    }
  }

  fitSize(element) {
    if (!this.target)
      return

    requestAnimationFrame(() => {

      let style = getComputedStyle(this.target)

      let width = style ? parseFloat(style.getPropertyValue('width')) : this.target.offsetWidth
      let height = style ? parseFloat(style.getPropertyValue('height')) : this.target.offsetHeight

      element.setAttribute('width', width);
      element.setAttribute('height', height);

      element.style.width = width + 'px';
      element.style.height = height + 'px';

      this.invalidate()
    })
  }

  resize() {
    this.fitSize(this.element)
  }

  protected createElement(): HTMLElement {
    var element = document.createElement('canvas');
    element.width = this.rootContainer.width;
    element.height = this.rootContainer.height;

    element.style.position = 'absolute';

    return element;
  }

  get target() {

    return this._target
  }

  set target(target) {
    if (this._target && this.element)
      this._target.removeChild(this.element);

    this._target = target;

    if (!target)
      return;

    if (!this.element)
      this.element = this.createElement();

    /*
     * 캔바스의 크기 결정 순서
     * 1. model의 설정에 크기 정보가 있다면, 그에 따라 상위 엘리먼트의 크기를 조정한다.
     * 2. 부모 엘리먼트의 크기에 따라 캔바스의 폭과 높이를 맞춘다.
     * 3. 캔바스의 스타일은 무조건, 부모 엘리먼트의 100%로 한다.
     */

    this.resize()

    target.appendChild(this.element)

    this.ready()

    this.render()
  }

  get canvas(): HTMLCanvasElement {
    return this.element as HTMLCanvasElement
  }

  // get selected() {

  //   return this.root.selected
  // }

  // set selected(sels) {

  //   this.root.selected = sels
  // }

  // get focused() {

  //   return this.root.focused
  // }

  // set focused(container) {

  //   this.root.focused = container
  // }

  getContext() {
    return (this.element as HTMLCanvasElement).getContext('2d');
  }

  /* 레어어의 draw는 외부에서 context를 제공하지 않으면, 자신의 캔바스의 컨텍스트를 이용해서 그린다. */
  render(context?) {
    // if (!this.element)
    //   return;

    // this.renderer.render(this.rootContainer.object3D, this.camera);

    // context = context || this.getContext();
    // if (!context)
    //   return;

    // this.rootContainer.render(context)
  }

  prerender(context) {

    var {
      translate,
      scale = {
        x: 1,
        y: 1
      },
      rotation
    } = this.rootContainer.state;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    translate && context.translate(translate.x, translate.y);

    context.scale(scale.x, scale.y);
    rotation && context.rotate(rotation);
  }

  get rotatePoint() {

    // 레이어의 중심은 원점이다.
    return {
      x: 0,
      y: 0
    }
  }

  /* contains는 보통 자식 클래스에서 오버라이드 해야한다. */
  contains(x, y) {
    return false;
  }

  invalidate() {
    /*
     * throttle 로직으로 호출을 최소화
     * 빈번히 반복되는 invalidate()에 대해 비효율적으로 render()가 호출되는 것을 방지하기 위함
     */
    this.throttle_render();
  }
}
