/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default function (obj: any) {
  return JSON.parse(JSON.stringify(obj))
}