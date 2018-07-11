/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

const ERROR = '[ERROR]'
const WARN = '[WARN]'
const DEBUG = '[DEBUG]'

export var error = (...args) => {
  var trace = [];
  args.forEach(arg => arg && arg.stack && trace.push(arg.stack));
  console.error(ERROR, ...args, trace.join(' '));
}

export var warn = (...args) => {
  var trace = [];
  args.forEach(arg => arg && arg.stack && trace.push(arg.stack));
  console.warn(WARN, ...args, trace.join(' '));
}

export var debug = (...args) => console.log(DEBUG, ...args)
