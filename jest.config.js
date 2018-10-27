module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  testEnvironment: "node",
  testRegex: `^.*\/test\/(?!.*\.d\.tsx?$).*\.tsx?$`,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
