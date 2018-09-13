import { expect } from 'chai'
import { Scene, SceneMode } from '../../../src'

describe('Scene', () => {

  var sceneModel;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id='container'></div>
    `

    sceneModel = {
      mode: SceneMode.VIEW,
      targetEl: 'container',
      model: {
        width: 800,
        height: 600,
        components: [{
          type: 'container',
          id: 'parent',
          components: [{
            type: 'component',
            id: 'child'
          }]
        }]
      }
    }
  })

  it('컨테이너 HTMLElement의 id를 targetEl로 넘길 수 있어야한다.', async () => {

    const scene = new Scene({
      ...sceneModel,
      targetEl: 'container',
    });

    expect(scene.mode).to.equal(SceneMode.VIEW);
  })

  it('컨테이너 HTMLElement를 targetEl로 넘길 수 있어야한다.', async () => {

    const scene = new Scene({
      ...sceneModel,
      targetEl: document.getElementById('container'),
    });

    expect(scene.mode).to.equal(SceneMode.VIEW);
  })

  it('주어진 모델을 모두 포함하는 최상위 컨테이너가 되어야 한다.', () => {

    const scene = new Scene(sceneModel);

    const root = scene.rootContainer;

    root.components.length.should.equal(1);
    root.components[0].get('type').should.equal('container');
    root.components[0].get('id').should.equal('parent');
  });

  it('빌드된 이후에 model 속성값 내부에는 components 속성값을 갖지 않아야 한다.', () => {

    const scene = new Scene(sceneModel);

    const root = scene.rootContainer;

    expect(root.model.components).to.be.undefined;
    (typeof root.model.components).should.equal('undefined');
    expect(root.components[0].model.components).to.be.undefined;
    root.components.length.should.equal(1);
    root.components[0].get('type').should.equal('container');
    root.components[0].get('id').should.equal('parent');
  });
})