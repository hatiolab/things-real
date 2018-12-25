/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Class } from "../../types";

var registry: { [key: string]: Class } = {};

function register(type: string | string[], clazz: Class): Class {
  if (!clazz) return;

  if (type instanceof Array) {
    type.forEach(t => register(t, clazz));
  } else {
    registry[type] = clazz;
  }
}

function getClass(type: string): Class {
  return registry[type];
}

function getTypeByClassname(classname: string): Class {
  return Object.values(registry).find(clazz => {
    return clazz.prototype.constructor.name == classname;
  });
}

export default {
  register,
  getClass,
  getTypeByClassname
};
