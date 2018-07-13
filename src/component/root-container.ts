import Component from './component'
import Container from './container'

export default class RootContainer extends Container {
}

Component.register('root', RootContainer)


// rebuildContentModel(contentModel) {
//   this._disposeAllResources()

//   this.eventEngine = new Event.Engine(this);

//   /*
//    * 컨텐츠 모델 레이어를 새로 구축한다
//    */
//   contentModel.type = this._app.dimension == '2d' ? 'model-layer' : 'three-model-layer';

//   var variables = contentModel.variables
//   delete contentModel.variables

//   this.model_layer = Model.compile(contentModel, this.app);

//   // target Element 아래에 기본 레이어를 만든다.
//   // 기본 레이어는 모델을 표현할 바탕 canvas 로 만들어진다.
//   this.model_layer.target = this.target_element;

//   // TODO 이걸 제거할 수 있어야 한다.
//   this.addComponent(this.model_layer);

//   // TODO 이 곳은 하위 호환을 위한 작업이다. 삭제되어야 한다.
//   if (variables)
//     this.buildVariables(variables);

//   /* layer 정보에 맞춰서 assist layer 객체들을 생성한다. */
//   this.assist_layers = (this.model.layers || [])
//     .filter(layer => {
//       let clazz = Component.register(layer.type);
//       return clazz.support(this._app.dimension)
//     })
//     .map(layer => {
//       let compiled = Model.compile(layer, this.app);
//       compiled.target = this.target_element;

//       this.addComponent(compiled);

//       return compiled;
//     });

//   /* Event Handler Map을 추가한다. */
//   this.assist_handlers = (this.model.handlers || [])
//     .map(eventMapName => { return EventMap.EventMap.get(eventMapName, this._app.dimension) })
//     .filter(eventMap => !!eventMap).map(eventMap => {
//       /* Listener로 임의의 오브젝트를 만들어서 제공한다. */
//       let handler = {}
//       this.eventEngine.add(handler, eventMap);

//       return handler
//     });

//   // TODO 모든 레이어들이 설치된 후에 동시에 added 이벤트가 발생하도록 보장하는 방법이 필요하다.
//   // this.model_layer.trigger('added', this, this.model_layer, 0)

//   this._ready = true;
//   this.traverse(component => component.ready())
// }