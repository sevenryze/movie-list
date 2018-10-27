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
  content: IListItem;
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

  [index: string]: any;
}

export type IRenderedFrameHeight = Record<string, number>;
