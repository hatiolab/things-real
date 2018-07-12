/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import ObjectBuilder from './object-builder'

const mapTo3D = new WeakMap();
const mapTo2D = new WeakMap();

setInterval(() => {
  console.log(mapTo3D, mapTo2D)
}, 5000);

export default class ObjectComponentBridge {

  static onadded(container, component) {
    var object = ObjectBuilder.build(component);
    var parent = mapTo3D.get(container);

    parent && parent.add(object);

    mapTo3D.set(component, object);
    mapTo2D.set(object, component);

    (component.components || []).forEach(child => ObjectComponentBridge.onadded(component, child))
  }

  static onremoved(container, component) {
    var object = mapTo3D.get(component);
    var parent = mapTo3D.get(container);

    (component.components || []).forEach(child => ObjectComponentBridge.onremoved(component, child))

    parent.remove(object);

    mapTo3D.delete(component);
    mapTo2D.delete(object);
  }

  static onchange(after, before, { origin: component, deliverer }) {
    var object = mapTo3D.get(component);

    // assert(object)
    object.onchange && object.onchange(after, before);

    component.invalidate();
  }

  static getObject3D(component) {
    return mapTo3D.get(component);
  }

  static getComponent(object) {
    return mapTo2D.get(object);
  }
}
