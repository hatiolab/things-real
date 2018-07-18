/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default abstract class Command {
  protected params: any
  protected abstract execute(): void

  constructor(params?) {
    params && (this.params = Object.assign({}, params))
  }
}
