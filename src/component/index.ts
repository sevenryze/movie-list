import { appendFrames, prefixFrames, createMovie } from "./movie";
export { IMovie } from "./movie";
export { MovieList } from "./movie-list";

export class MovieOP {
  public static appendFrames = appendFrames;
  public static prefixFrames = prefixFrames;
  public static createMovie = createMovie;
}
