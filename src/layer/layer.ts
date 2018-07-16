/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, Container } from '../component'
import * as Const from '../const'

export default class Layer extends Container {

  static support(dimension = '2d') {
    return String(dimension).toLowerCase() === '2d';
  }

  constructor(model, context) {
    super(model, context)

    model.translate = {
      x: 0,
      y: 0,
      ...model.translate
    }

    this._draw_reserved = false;

    this.__draw__ = () => {
      this._draw_reserved = false;

      this.trigger('redraw');
      this.reflow();
      this.draw();
    }

    this.throttle_render = () => {
      if (!this._draw_reserved)
        requestAnimationFrame(this.__draw__)
      this._draw_reserved = true;
    }
  }

  fitSize(element) {
    if (!this.target)
      return

    let style = getComputedStyle(this.target)

    let width = style ? parseFloat(style.getPropertyValue('width')) : this.target.offsetWidth
    let height = style ? parseFloat(style.getPropertyValue('height')) : this.target.offsetHeight

    element.setAttribute('width', width * Const.DPPX);
    element.setAttribute('height', height * Const.DPPX);

    element.style.width = width + 'px';
    element.style.height = height + 'px';
  }

  resize() {
    this.fitSize(this.element)
  }

  isLayer() {
    return true;
  }

  createElement() {
    var element = Component.createCanvas(1, 1);
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

    target.appendChild(this.element);
  }

  get canvas() {
    return this.element
  }

  dispose() {
    // TODO Dispose를 효율적으로 처리할 수 있는 방법을 고안한다.
    super.dispose()
    // window.removeEventListener('resize', this._onresize);

    this.target = null;
    this.element = null;
  }

  get selected() {

    return this.root.selected
  }

  set selected(sels) {

    this.root.selected = sels
  }

  get focused() {

    return this.root.focused
  }

  set focused(container) {

    this.root.focused = container
  }

  getContext() {
    if (!this._context2D)
      this._context2D = this.canvas && this.canvas.getContext('2d');

    return this._context2D;
  }

  /* 레어어의 draw는 외부에서 context를 제공하지 않으면, 자신의 캔바스의 컨텍스트를 이용해서 그린다. */
  draw(context) {
    if (!this.canvas)
      return;

    context = context || this.getContext();
    if (!context)
      return;

    super.draw(context);
  }

  prerender(context) {

    var {
      translate,
      scale = {
        x: 1,
        y: 1
      },
      rotation
    } = this.state;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    translate && context.translate(translate.x * Const.DPPX, translate.y * Const.DPPX);

    context.scale(scale.x * Const.DPPX, scale.y * Const.DPPX);
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

  move(toward) {

    var translate = this.get('translate') || { x: 0, y: 0 }

    this.set({
      translate: {
        x: translate.x + toward.x,
        y: translate.y + toward.y
      }
    })
  }
}
