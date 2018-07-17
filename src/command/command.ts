/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default abstract class Command {
  protected params
  protected excute

  constructor(params?) {
    params && (this.params = Object.assign({}, params))
  }
}
