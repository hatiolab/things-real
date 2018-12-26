/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export const SceneModelVersion = 2;

export type Class = { new (...args: any[]): any };

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Dimension {
  width?: number;
  height?: number;
  depth?: number;
}

export interface DataSpreadModel {
  accessor?: string;
  target: string;
  property: string;
  rule: "value" | "map" | "range" | "eval";
  param?: string | { [propName: string]: string };
}

export interface TextOptions {
  text?: string;
  textFormat?: string;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
}

export interface LineStyle {
  lineWidth?: number;
  strokeStyle?: any;
  lineDash?: string;
  lineCap?: string;
  lineJoin?: string;
}

export interface FillStyle {
  // type: 'gradient' | 'pattern',
  type: string;
  image?: string;
  [propName: string]: any;
}

export interface ActionModel {
  action: string;
  target: string;
  value?: string;
  emphasize?: boolean;
  restore?: boolean;
}

export interface EventModel {
  tap?: ActionModel;
  hover?: ActionModel;
}

export interface CameraModel {
  far?: number;
  near?: number;
  fov?: number;
  zoom?: number;
  active?: boolean;
  spectator?: boolean;
  aspect?: number;
}

export interface ComponentModel {
  type?: string;
  id?: string;
  class?: string;
  textOptions?: TextOptions;
  textStyle?: TextStyle;
  lineStyle?: LineStyle;
  // fillStyle?: FillStyle | string,
  dimension?: Dimension;
  translate?: Vector3;
  scale?: Vector3;
  rotate?: Vector3;
  data?: any;
  color?: any;
  style?: any;
  hidden?: boolean;
  templatePrefix?: string;
  components?: ComponentModel[];
  mappings?: DataSpreadModel[];
  options?: { [propName: string]: any };
  event?: EventModel;
  camera?: CameraModel;
  [propName: string]: any;
}

export interface NatureProperty {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  property?: { [propName: string]: any };
}

export interface Nature {
  mutable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  properties?: NatureProperty[];
  valueProperty?: string;
  "value-property"?: string;
}

export enum SceneMode {
  VIEW,
  EDIT
}

export enum FitMode {
  BOTH,
  RATIO
}

export enum CameraView {
  PERSPECTIVE = 1,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT
}

export interface SceneModel extends ComponentModel {
  width: number;
  height: number;
  version?: number;
}

export interface SceneConfig {
  targetEl: string | HTMLElement;
  mode?: SceneMode;
  model: SceneModel;
  fit?: FitMode;
}
