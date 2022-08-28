const webpack = require("webpack"),
                path = require("path"),
                {CleanWebpackPlugin} = require("clean-webpack-plugin"),
                CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
    entry: {
        content_script: './content-script.js',
        background: './background.js',
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: './',
        filename: '[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin({
            verbose: true,
            cleanStaleWebpackAssets: true,
            protectWebpackAssets: false,
            cleanAfterEveryBuildPatterns: ['*LICENSE.txt']
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './manifest.json',
                    to: path.resolve(__dirname, 'build'),
                    force: true,
                    transform: function (content, path) {
                        return Buffer.from(
                            JSON.stringify({
                              description: process.env.npm_package_description,
                              version: process.env.npm_package_version,
                              ...JSON.parse(content.toString()),
                            })
                        );
                    }
                },
                {from: './css', to: path.resolve(__dirname, 'build/css'), force: true},
                {from: './icon_16.png', to: path.resolve(__dirname, 'build'), force: true},
                {from: './icon_48.png', to: path.resolve(__dirname, 'build'), force: true},
                {from: './icon_128.png', to: path.resolve(__dirname, 'build'), force: true}
            ]
        }),
    ],
};
