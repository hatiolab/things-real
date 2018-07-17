/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export function linear(progress) {
  return progress
}

export function quad(progress) {
  return Math.pow(progress, 2)
}

export function circ(progress) {
  return 1 - Math.sin(Math.acos(progress))
}

export function back(progress, options = { x: 1.5 }) {
  return Math.pow(progress, 2) * ((options.x + 1) * progress - options.x)
}

export function bounce(progress) {
  for (let a = 0, b = 1; 1; a += b, b /= 2) {
    if (progress >= (7 - 4 * a) / 11) {
      return - Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
    }
  }
}

export function elastic(progress, options = { x: 1.5 }) {
  return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * options.x / 3 * progress)
}

