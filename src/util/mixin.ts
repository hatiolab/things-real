/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

// export default function mixin(base, mixins) {

//   if (mixins instanceof Array) {

//     mixins.forEach(mxn => mixin(base, mxn))

//   } else {

//     base.mixedIn = base.hasOwnProperty('mixedIn') ? base.mixedIn : []
//     base.mixingIn = base.hasOwnProperty('mixingIn') ? base.mixingIn : []

//     if (base.mixedIn.indexOf(mixins) >= 0)
//       return base;

//     if (base.mixingIn.indexOf(mixins) >= 0)
//       throw new Error(`found cyclic dependencies between ${base.mixingIn}`)

//     base.mixingIn.push(mixins)
//     mixins.call(base)
//     base.mixingIn.pop()
//     base.mixedIn.push(mixins)
//   }

//   return base
// }

export default function mixin(clazz, ...objects) {
  objects.forEach(object => Object.assign(clazz.prototype, object))
}
