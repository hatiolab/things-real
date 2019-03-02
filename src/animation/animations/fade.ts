/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from "./animation";

export default class Fade extends Animation {
  step(delta) {
    var { startAlpha = 1, endAlpha = 0 } = this.config;

    var min = Math.max(Math.min(startAlpha, endAlpha, 1), 0);
    var max = Math.min(Math.max(startAlpha, endAlpha, 1), 1);
    var range = (max - min) * 2;
    var fade;

    if (delta < 0.5) fade = range * delta;
    else fade = (1 - delta) * range;

    this.client.alpha = (this._state.alpha || 1) * fade;
  }
}
