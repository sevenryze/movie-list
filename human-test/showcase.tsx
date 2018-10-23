import React from "react";

export class Showcase extends React.Component<{
  item: any;
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
        {this.props.index + ` ----------- ` + "好".repeat(this.props.item.height + 100)}
      </div>
    );
  }
}
