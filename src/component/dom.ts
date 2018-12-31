/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "./component";

import RealObjectDomElement from "./threed/real-object-dom-element";

export default class DOMComponent extends Component {
  private _domElement;

  static get type() {
    return "dom";
  }

  /**
   * property isDomComponent
   * readonly
   */
  get isDomComponent(): boolean {
    return true;
  }

  buildObject3D() {
    return new RealObjectDomElement(this);
  }

  /* isDomComponent 가 true인 경우는 cssObject3D getter를 구현해야 한다. */
  get cssObject3D() {
    return (this.object3D as any).cssObject3D;
  }

  get domElement() {
    if (!this._domElement) {
      this._domElement = this.createDOMElement();
    }
    return this._domElement;
  }

  createDOMElement() {
    var { tagName, options = {} } = this.state;

    var element =
      tagName !== "svg"
        ? document.createElement(tagName)
        : document.createElementNS("http://www.w3.org/2000/svg", "svg");
    Object.keys(options).forEach(prop => {
      element[prop] = options[prop];
    });

    return element;
  }
}

Component.register(DOMComponent.type, DOMComponent);
