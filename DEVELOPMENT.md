# things-real

3D modeling library

## scene

Scene은 모델(root-container)과 Viewer(layer)를 생성, 관리한다.

Scene은 API를 제공하는 facade 객체이다.

### constructor

- constructor : 생성자
- dispose : 소멸자

### properties

- target (getter/setter): Scene이 렌더링되는 HTMLElement
- refProvider (getter): Scene 내부에 다른 Scene 모델을 제공하는 제공자
- mode (getter): Scene의 Rendering 모드 (VIEWER/MODELER)
- model (getter/setter): Scene 모델
- sceneModelVersion(): Scene 모델의 버전 정보 (1/1.1/2)
- root (getter): Scene의 root 모델
- fitMode (getter): Scene target에 표현되는 모드
- rootContainer (getter) : root 속성과 같다.
- commander (getter) : redo/undo 처리를 위한 커맨더
- transformMode (setter) : 모델러의 transform 모드를 변경하기 위해 사용된다.
- activeCamera (setter) : Active Camera를 변경하기 위해 사용된다.
- baseUrl (getter/setter) : 리소스 fetch를 위한 baseUrl
- selected (getter/setter) : 모델러에서 선택된 컴포넌트들을 조회하거나, 선택상태로 변경한다.
- identities (getter) : id가 설정된 컴포넌트들의 id 리스트를 조회한다

### method

- fit(mode: FitMode)
- findAll(selector: string): Component[]
- findById(id: string): Component
- setProperties(targets: string, properties: string | object, value?: any) : target 컴포넌트들의 속성을 변경하거나 조회한다.
- setData(targets: string, value: any) : target 컴포넌트들의 data를 변경하거나 조회한다.
- toggleData(targets: string) : target 컴포넌트들의 data(true / false)를 토글한다.
- tristateData(targets: string) : target 컴포넌트들의 data(1 / 2 / 3)를 순차적으로 토글한다.
- add(components: ComponentModel | ComponentModel[]) : root 에 컴포넌트들을 추가한다.
- remove(components: Component | Component[]) : 컴포넌트들을 모델에서 제거한다.
- copy() : 선택된 컴포넌트들을 복사한다.
- cut() : 선택된 컴포넌트들을 잘라낸다.
- paste(copied) : copied 된 컴포넌트들을 삽입한다.
- undo() : 최근 작업을 취소한다.
- redo() : 취소된 작업을 다시 수행한다.
- undoableChange(changeFunc) : 취소가능한 묶음 작업을 수행한다.
- resize() : Scene의 FitMode에 맞춰서 화면크기를 재조정한다.
- fullscreen(mode?: FitMode) : FitMode에 맞춰서 fullscreen에 표현한다.

## root-container

트리구조 컴포넌트 모델의 최상위 ROOT 컨테이너이다.
컴포넌트들의 이벤트 시스템을 관리하는 event engine을 내장한다.
Object3DScene을 내장한다.
CSS3DRenderer용 CSS3DScene을 내장한다.
데이타 프로세싱을 위해 TemplateMap과 IndexMap을 관리한다.

## properties

- width : SceneModel의 width. Scene(2차원)의 폭을 의미함
- height : SceneModel의 height. Scene(2차원)의 높이를 의미함
- refProvider : Reference Provider
- activeCamera : (N/A)

## methods

- invalidate : Scene 화면을 갱신하도록 'render' 이벤트를 발생시킨다.

### component lifecycle

- created : component가 최최 생성되었다. 아직까지는 부모/자식 관계가 형성되지 않았다.
- added : 부모 컴포넌트에 추가되었다.
- ready : 최상위 부모 컴포넌트로부터 자식 컴포넌트들까지 구성이 완료되었다.
- removed : 부모 컴포넌트로부터 분리되었다.
- disposed : 완전히 파괴되었다.

## layer

모델을 렌더링하는 역할을 하는 뷰어 객체이다.
개발자는 layer를 직접 접근할 수 없다.(API와 이벤트를 통해서 사용된다.)
Owner Scene에 대한 참조를 가지고 있다.
Root Container에 대한 참조를 가지고 있다.

### properties

- ownerScene : Owner Scene
- rootContainer : Root Container
- target : target HTMLElement
- cameraControl (getter)
- activeCamera (getter/setter)
- lights

### methods

- invalidate()
- inactivateCamera(camera?: CameraView | THREE.Camera)
- activateCamera(camera?: CameraView | THREE.Camera)

### viewer-layer

### modeler-layer
