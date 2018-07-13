export type Class = { new(...args: any[]): any; }

export interface ThreeDimension {
  x: number,
  y: number,
  z: number
}

export interface ComponentModel {
  type?: string,
  id?: string,
  class?: string,
  text?: string,
  translate?: ThreeDimension,
  scale?: ThreeDimension,
  rotate?: ThreeDimension,
  data?: any,
  color?: any,
  style?: any,
  components?: ComponentModel[],
  [propName: string]: any;
}

export enum SceneMode {
  VIEW,
  EDIT
}

export enum FitMode {
  BOTH,
  RATIO
}

export interface SceneModel {
  width: number,
  height: number,
  components?: ComponentModel[]
}

export interface SceneConfig {
  targetEl: string | HTMLElement
  mode?: SceneMode
  model: SceneModel
  fit?: FitMode
}
