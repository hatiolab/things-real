/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import rotation from './animations/rotation'
import vibration from './animations/vibration'
import heartbeat from './animations/heartbeat'
import moving from './animations/moving'
import outline from './animations/outline'
import fade from './animations/fade'

var registry = {
  rotation,
  vibration,
  heartbeat,
  moving,
  outline,
  fade
}

export default function compile(client, animationConfig) {
  var clazz = registry[animationConfig.type];

  if(!clazz)
    return null;

  return new clazz(client, animationConfig)
}
