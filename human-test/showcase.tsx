import React from "react";

export class Showcase extends React.Component<{
  item: {
    id: string;
    height: number;
  };
  index: number;
}> {
  public render() {
    return (
      <div
        className="item"
        style={{
          // minHeight: item.height,
          ...(this.props.index % 2 !== 0 ? { backgroundColor: "#ccc" } : {})
        }}
        js-index={this.props.index}
      >
        {this.props.index + ` ----------- ` + "Very good!  ".repeat(this.props.item.height + 100)}
      </div>
    );
  }
}
