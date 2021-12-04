const webpack = require("webpack"),
                path = require("path")

module.exports = {
    target: "web",
    entry: {
        background: './background.js',
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: './',
        filename: '[name].bundle.js',
    },
};
