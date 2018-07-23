/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Command from './command'

export default class CommandChange extends Command {

  execute() {
    this.params.changes.forEach(change => change.component.set(change.after))
  }

  static before(components) {

    return components.map(component => {
      return {
        component
      }
    })
  }

  static after(changes, commander) {
    commander.execute(null, false)
  }

  static around(commander, changeFunc, self?) {
    changeFunc.call(self)

    commander.execute(null, false)
  }

}
