export interface IPoint {
  top: number;
  left: number;
}

export interface IRectangle {
  top: number;
  left: number;
  height: number;
  width: number;
  bottom: number;
  right: number;
}

export interface IFrame {
  rect: IRectangle;
  content: object;
  id: string;
}

export interface IMovie {
  frameList: IFrame[];
  assumedHeight: number;
}

export interface IScreen {
  rectRelativeToWorld: IRectangle;
  rectRelativeToMovie: IRectangle;
}

export interface IListItem {
  id: string;
}

export type IRenderedFrameHeight = Record<string, number>;
