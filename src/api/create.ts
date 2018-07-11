export default async function create({
  targetEl = 'scene',
  mode = 'view',
  model = {}
} = {}) {
  return {
    targetEl,
    mode,
    model
  };
}
