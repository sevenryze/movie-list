const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

/**********************************************************************************************************************/
module.exports = {
  mode: "development",

  entry: {
    app: "./src/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./js/[name].js"
  },

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", "*"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              plugins: ["react-hot-loader/babel"]
            }
          },
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "./media/[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html")
    })
  ],

  devServer: {
    host: "0.0.0.0"
  },

  devtool: "inline-sourcemap"
};
