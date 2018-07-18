/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export type Class = { new(...args: any[]): any; }

export interface ThreeDimension {
  x: number,
  y: number,
  z: number
}

export interface DataMappingModel {
  accessor?: string,
  target: string,
  property: string,
  rule: 'value' | 'map' | 'range' | 'eval',
  param?: string | { [propName: string]: string }
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
  templatePrefix?: string,
  components?: ComponentModel[],
  mappings?: DataMappingModel[],
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

export interface SceneModel extends ComponentModel {
  width: number,
  height: number
}

export interface SceneConfig {
  targetEl: string | HTMLElement
  mode?: SceneMode
  model: SceneModel
  fit?: FitMode
}
