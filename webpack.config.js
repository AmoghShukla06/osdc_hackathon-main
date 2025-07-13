var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs-extra"),
  env = require("./utils/env"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  TerserPlugin = require("terser-webpack-plugin");
var { CleanWebpackPlugin } = require("clean-webpack-plugin");
var ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
var ReactRefreshTypeScript = require("react-refresh-typescript");

const ASSET_PATH = process.env.ASSET_PATH || "/";

var alias = {};

// load the secrets
var secretsPath = path.join(__dirname, "secrets." + env.NODE_ENV + ".js");

var fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2",
];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

const isDevelopment = process.env.NODE_ENV !== "production";

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    newtab: [
      path.join(__dirname, "src", "assets", "css", "retro-theme.css"),
      path.join(__dirname, "src", "pages", "Newtab", "index.jsx"),
    ],
    options: [
      path.join(__dirname, "src", "assets", "css", "retro-theme.css"),
      path.join(__dirname, "src", "pages", "Options", "index.jsx"),
    ],
    popup: [
      path.join(__dirname, "src", "assets", "css", "retro-theme.css"),
      path.join(__dirname, "src", "pages", "Popup", "index.jsx"),
    ],
    panel: [
      path.join(__dirname, "src", "assets", "css", "retro-theme.css"),
      path.join(__dirname, "src", "pages", "Panel", "index.jsx"),
    ],
    background: path.join(__dirname, "src", "pages", "Background", "index.js"),
    contentScript: path.join(__dirname, "src", "pages", "Content", "index.js"),
    devtools: path.join(__dirname, "src", "pages", "Devtools", "index.js"),
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"), // Changed from 'build' to 'dist'
    clean: true,
    publicPath: ASSET_PATH,
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
        type: "asset/resource",
        exclude: /node_modules/,
        // loader: 'file-loader',
        // options: {
        //   name: '[name].[ext]',
        // },
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              getCustomTransformers: () => ({
                before: [
                  // Disable React Fast Refresh for Chrome extensions
                  // isDevelopment && ReactRefreshTypeScript()
                ].filter(Boolean),
              }),
              transpileOnly: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: "source-map-loader",
          },
          {
            loader: require.resolve("babel-loader"),
            options: {
              plugins: [
                // Disable React Fast Refresh for Chrome extensions
                // isDevelopment && require.resolve("react-refresh/babel"),
              ].filter(Boolean),
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: alias,
    extensions: fileExtensions
      .map((extension) => "." + extension)
      .concat([".js", ".jsx", ".ts", ".tsx", ".css"]),
  },
  plugins: [
    // Disable React Fast Refresh for Chrome extensions to prevent WebSocket connection errors
    // isDevelopment && new ReactRefreshWebpackPlugin(),
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.ProgressPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin({ NODE_ENV: "production" }),
    // Copy manifest.json to dist/ and inject version/description from package.json
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: path.join(__dirname, "dist"),
          force: true,
          transform: function (content, path) {
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
      ],
    }),
    // Copy all static assets and styles to dist/
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/pages/Content/content.styles.css",
          to: path.join(__dirname, "dist"),
          force: true,
        },
        {
          from: "src/pages/Content/clippy.styles.css",
          to: path.join(__dirname, "dist"),
          force: true,
        },
        {
          from: "src/assets/img/icon-128.png",
          to: path.join(__dirname, "dist"),
          force: true,
        },
        {
          from: "src/assets/img/icon-34.png",
          to: path.join(__dirname, "dist"),
          force: true,
        },
      ],
    }),
    // Copy all contents of public/ to dist/ if public/ exists
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
          noErrorOnMissing: true, // Don't error if public/ doesn't exist
          globOptions: {
            ignore: ["**/.DS_Store"],
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Newtab", "index.html"),
      filename: "newtab.html",
      chunks: ["newtab"],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Options", "index.html"),
      filename: "options.html",
      chunks: ["options"],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Popup", "index.html"),
      filename: "popup.html",
      chunks: ["popup"],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Devtools", "index.html"),
      filename: "devtools.html",
      chunks: ["devtools"],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Panel", "index.html"),
      filename: "panel.html",
      chunks: ["panel"],
      cache: false,
    }),
  ].filter(Boolean),
  infrastructureLogging: {
    level: "info",
  },
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map";
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}

module.exports = options;
