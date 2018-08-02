/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary ids.

var counter = 0

export default function uniqueId(prefix) {
  return `${prefix || ''}${++counter}`
}