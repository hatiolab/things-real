/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default function objToVal(value) {
  while (value && typeof (value) === 'object') {
    let backup = value
    for (let p in value) {
      value = value[p]
      break;
    }
    if (value === backup) { // No properties case
      value = undefined
      break;
    }
  }
  return value
}
