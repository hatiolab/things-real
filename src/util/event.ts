/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { once as lodashOnce, isEmpty } from 'lodash'
import uniqueId from './uniqueId'

// # Regular expression used to split event strings.
var eventSplitter = /\s+/

// Implement fancy features of the Event API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
function eventApi(obj, action, name, rest) {
  if (!name)
    return true

  // Handle event maps
  if (typeof (name) == 'object') {
    for (let key in name) {
      let val = name[key]
      obj[action].apply(obj, [key, val])
    }
    return false
  }

  // Handle space separated event names
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter)

    names.forEach(val => obj[action].apply(obj, [val].concat(rest)))
    return false
  }

  return true
}

const METHODS = ['on', 'off', 'once', 'delegate_on', 'delegate_off', 'trigger', 'listenTo']

var Event = {

  withEvent: function () {
    METHODS.forEach(method => this[method] = Event[method])
  },

  /*
   * on
   *
   * params:
   * - name
   * - callback
   * - context
   */
  on: function (name, callback, context) {
    if (!eventApi(this, 'on', name, [callback, context]) || !callback)
      return this

    this._listeners || (this._listeners = {});
    var events = this._listeners[name] || (this._listeners[name] = [])
    events.push({
      callback: callback,
      context: context,
      ctx: context || this
    })

    return this
  },

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, it will be removed.
  once: function (name, callback, context) {
    if (!eventApi(this, 'once', name, [callback, context]) || !callback)
      return this

    var self = this

    var once = lodashOnce(function () {
      self.off(name, once)
      callback.apply(self, arguments)
    })

    once._callback = callback

    this.on(name, once, context)
  },

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  off: function (name, callback, context) {
    if (!this._listeners || !eventApi(this, 'off', name, [callback, context]))
      return this

    if (!name && !callback && !context) {
      this._listeners = undefined
      return this
    }

    var names;

    if (name) {
      names = [name]
    } else {
      names = Object.keys(this._listeners)
    }

    for (let i = 0; i < names.length; i++) {
      let name = names[i]
      let events = this._listeners[name]
      if (events) {
        let retain = []
        this._listeners[name] = retain
        if (callback || context) {
          for (let j = 0; j < events.length; j++) {
            let ev = events[j]
            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) || (context && context !== ev.context)) {
              retain.push(ev)
            }
          }
        }
        if (!retain.length)
          delete this._listeners[name]
      }
    }
    return this
  },

  delegate_on: function (delegator) {
    this._delegators || (this._delegators = [])
    this._delegators.push(delegator)

    return this
  },

  delegate_off: function (delegator) {
    if (!this._delegators)
      return this

    var index = this._delegators.indexOf(delegator)
    index >= 0 && this._delegators.splice(index, 1)

    return this
  },

  delegate: function () {
    if (this._delegators && this._delegators.length > 0)
      delegateEvents(this._delegators, arguments)

    if (!this._listeners)
      return this

    var hint_idx = arguments.length - 1

    var hint = arguments[hint_idx];
    arguments[hint_idx] = {
      origin: hint.origin,
      name: hint.name,
      deliverer: this
    };

    var listeners = this._listeners[hint.name]
    var listenersForAll = this._listeners['(all)']

    if (listeners)
      triggerEvents(listeners, arguments)

    if (listenersForAll)
      triggerEvents(listenersForAll, arguments)

    return this
  },

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"(all)"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  trigger: function (name) {
    var args = [].slice.call(arguments, 1)

    args.push({
      origin: this,
      name: name,
      deliverer: this
    })

    if (this._delegators && this._delegators.length > 0)
      delegateEvents(this._delegators, args)

    if (!this._listeners)
      return this

    if (!eventApi(this, 'trigger', name, args))
      return this

    var listeners = this._listeners[name]
    var listenersForAll = this._listeners['(all)']

    if (listeners)
      triggerEvents(listeners, args)

    if (listenersForAll)
      triggerEvents(listenersForAll, args)

    return this
  },

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  stopListening: function (obj, name, callback) {
    var listeningTo = this._listeningTo

    if (!listeningTo)
      return this

    var remove = !name && !callback

    if (!callback && typeof (name) == 'object')
      callback = this

    if (obj) {
      listeningTo = {}
      listeningTo[obj._listenId] = obj
    }

    for (let id in listeningTo) {
      let obj = listeningTo[id]
      obj.off(name, callback, this)

      if (remove || isEmpty(obj._events))
        delete this._listeningTo[id]
    }

    return this
  }

}

function triggerEvents(listeners, args) {
  listeners.forEach(listener => listener.callback.apply(listener.ctx, args))
}

function delegateEvents(delegators, args) {
  delegators.forEach(delegator => Event.delegate.apply(delegator, args))
}

var listenMethods = {
  listenTo: 'on',
  listenToOnce: 'once'
}

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
for (let method in listenMethods) {
  var implementation = listenMethods[method]

  Event[method] = function (obj, name, callback) {
    if (!this._listeningTo)
      this._listeningTo = {}

    var listeningTo = this._listeningTo

    if (!obj._listenId)
      obj._listenId = uniqueId('l')

    var id = obj._listenId
    listeningTo[id] = obj

    if (!callback && typeof (name) == 'object')
      callback = this

    obj[implementation](name, callback, this)

    return this
  }
}

export default Event
