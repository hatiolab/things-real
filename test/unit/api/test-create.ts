import { expect } from 'chai'
import { create, SceneMode } from '../../../src'

describe('API create', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <div id='container'></div>
    `
  })

  it('should ...', async () => {

    const scene = await create({
      mode: SceneMode.VIEW,
      targetEl: 'container',
      model: {
        width: 800,
        height: 600
      }
    })

    expect(scene.sceneMode).to.equal(SceneMode.VIEW);
  })

})