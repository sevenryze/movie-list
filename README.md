# Table of Content

<!-- prettier-ignore-start -->

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [Table of Content](#table-of-content)
* [Install](#install)
* [Usage](#usage)
	* [Use the `window` object as the global scroller](#use-the-window-object-as-the-global-scroller)
	* [Use the wrapper div element as local scroller](#use-the-wrapper-div-element-as-local-scroller)
* [API](#api)
	* [`MovieList`](#movielist)
* [Build and Test](#build-and-test)

<!-- /code_chunk_output -->

<!-- prettier-ignore-end -->

# Install

The only component exposed to external is `MovieList`. And use install script like below:

```bash
npm install --save @sevenryze/movie-scroll
```

# Usage

## Use the `window` object as the global scroller

```JavaScript
<MovieList
  ref={this.movieListInstanceRef}
  data={this.state.data}
  assumedHeight={400}
  bufferHeightRatio={0}
>
  {(item: any, index: number) => <Showcase item={item} index={index} />}
</MovieList>
```

## Use the wrapper div element as local scroller

```JavaScript
<MovieList
  ref={this.movieListInstanceRef}
  data={this.state.data}
  assumedHeight={400}
  bufferHeightRatio={0}
  useWrapperDivAsScreen={{
    className: "list"
  }}
>
  {(item: any, index: number) => <Showcase item={item} index={index} />}
</MovieList>

/*
  .list {
    margin: 5rem auto;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    height: calc(100vh - 300px);
  }
*/
```

# API

This lib exposes only one public class: `MovieList`.

## `MovieList`

```JavaScript
<MovieList
  ref={this.movieListInstanceRef}
  data={this.state.data}
  assumedHeight={400}
  bufferHeightRatio={0.5}
  useWrapperDivAsScreen={{
    className: "list"
  }}
>

ref.storeMovie();
ref.restoreMovie();
```

- `data: any[]`: The list data. Must contain an ID field.
- `assumedHeight: number`: The height used when the items are not actually rendered.
- `bufferHeightRatio: number`: How many buffer we want to use?
- `useWrapperDivAsScreen`: Whether use wrapper div as local scroller, and if use, please supply a css className.
- `ref.storeMovie: () => void`: Call to get the internal movie object. Used For cache and restore.
- `ref.restoreMovie: (movie) => void`: Send the cached movie object to internal. **Make sure** to keep sync between movie object and your data object.

# Build and Test

Build? you shall use this one and forget other hand-tired works.

---

<h2 align="center">Maintainer</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150" src="https://avatars.githubusercontent.com/sevenryze?v=3">
        <a href="https://github.com/sevenryze">Seven Ryze</a>
      </td>
    </tr>
  </tbody>
</table>
