const SELF = o => o

export default function buildAccessor(accessor) {
  if (!accessor)
    return SELF;

  var accessors = String(accessor).trim().replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.').filter(accessor => !!accessor.trim())

  return accessors.length > 0 ? function (o) {
    return accessors.reduce((o, accessor) => o ? o[accessor] : undefined, o)
  } : SELF
}