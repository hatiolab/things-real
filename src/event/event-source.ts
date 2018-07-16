/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { once, isEmpty } from 'lodash'

type Handler = { callback: Function, context: object }
type HandlerMap = { [s: string]: Handler[]; }

export default class EventSource {

  private handlerMap: HandlerMap = {}
  private delegators: EventSource[] = []

  /*
   * on
   *
   * params:
   * - name
   * - callback
   * - context
   */
  on(name: string, callback: Function, context?: object): void {
    var handlers = this.handlerMap[name] || (this.handlerMap[name] = [])
    handlers.push({
      callback,
      context
    })
  }

  /**
   * Bind an event to only be triggered a single time. After the first time
   * the callback is invoked, it will be removed.
   */
  once(name: string, callback: Function, context?: object): void {
    var handler = once((...args) => {
      this.off(name, handler)
      handler['origin'](...args)
    })

    handler['origin'] = callback

    this.on(name, handler, context)
  }

  /**
   * Remove one or many callbacks. If `context` is null, removes all
   * callbacks with that function. If `callback` is null, removes all
   * callbacks for the event. If `name` is null, removes all bound
   * callbacks for all events.
   */
  off(name: string, callback?: Function, context?: object) {
    if (!name) {
      this.handlerMap = {}
      return
    }

    if (!callback && !context) {
      delete this.handlerMap[name]
    }

    var handlers: Handler[] = this.handlerMap[name]
    if (!handlers) {
      return
    }

    var removals = []
    for (let i = 0; i < handlers.length; i++) {
      let handler: Handler = handlers[i]
      if (callback
        && callback !== handler.callback
        && callback !== handler.callback['origin']) {
        continue
      }
      if (context && context !== handler.context) {
        continue
      }
      removals.push(handler)
    }

    removals.forEach(handler => {
      let idx = handlers.indexOf(handler)
      handlers.splice(idx, 1)
    })

    if (handlers.length == 0)
      delete this.handlerMap[name]
  }

  delegate_on(delegator: EventSource) {
    this.delegators.push(delegator)
  }

  delegate_off(delegator: EventSource) {
    var idx = this.delegators.indexOf(delegator)
    idx >= 0 && this.delegators.splice(idx, 1)
  }

  private delegateEvents(name: string, ...rest) {
    this.delegators.forEach(delegator => delegator.delegate(name, ...rest))
  }

  private triggerEvents(handlers: Handler[], ...args) {
    handlers.forEach(handler => handler.callback.call(handler.context || this, ...args))
  }

  delegate(name: string, ...rest) {
    this.delegateEvents(name, ...rest)

    if (isEmpty(this.handlerMap)) {
      return
    }

    // change deliverer hint
    rest[rest.length - 1] = { ...rest[rest.length - 1], deliverer: this }

    var handlers: Handler[] = this.handlerMap[name]
    var handlersForAll: Handler[] = this.handlerMap['(all)']

    if (handlers) {
      this.triggerEvents(handlers, ...rest)
    }

    if (handlersForAll) {
      this.triggerEvents(handlersForAll, ...rest)
    }
  }
  /**
   * Trigger one or many events, firing all bound callbacks. Callbacks are
   * passed the same arguments as `trigger` is, apart from the event name
   * (unless you're listening on `"(all)"`, which will cause your callback to
   * receive the true name of the event as the first argument).
   * 
   * @param name 
   */
  trigger(name: string, ...originRest) {
    var rest = originRest.slice()
    rest.push({
      origin: this,
      deliverer: this,
      name
    })

    this.delegate(name, ...rest)
  }
}
