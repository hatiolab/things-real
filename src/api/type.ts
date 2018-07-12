import { ComponentModel } from '../component/model'

export enum Mode {
  VIEW,
  EDIT
}

export interface SceneModel {
  width: number,
  height: number,
  components?: ComponentModel[]
}