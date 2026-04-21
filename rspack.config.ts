import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));

export default defineConfig({
  entry: {
    index: path.resolve(__dirname, "src/frontend.tsx"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProd ? "[name].[contenthash].js" : "[name].js",
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
                  development: !isProd,
                  refresh: !isProd,
                },
              },
            },
          },
        },
        type: "javascript/auto",
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
        type: "javascript/auto",
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      filename: "index.html",
      minify: isProd,
    }),
    new rspack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      "process.env.PROJECT_NAME": JSON.stringify(pkg.name),
      "process.env.SITE_URL": JSON.stringify(process.env.SITE_URL || "http://localhost:3000"),
      // Support bracket notation
      "process.env['NODE_ENV']": JSON.stringify(process.env.NODE_ENV || "development"),
      "process.env['PROJECT_NAME']": JSON.stringify(pkg.name),
      "process.env['SITE_URL']": JSON.stringify(process.env.SITE_URL || "http://localhost:3000"),
      'process.env["NODE_ENV"]': JSON.stringify(process.env.NODE_ENV || "development"),
      'process.env["PROJECT_NAME"]': JSON.stringify(pkg.name),
      'process.env["SITE_URL"]': JSON.stringify(process.env.SITE_URL || "http://localhost:3000"),
      // Fallback for process itself
      process: "({ env: {} })",
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        { from: path.resolve(__dirname, "src/logo.svg"), to: "logo.svg" },
        { from: path.resolve(__dirname, "sitemap.xml"), to: "sitemap.xml", noErrorOnMissing: true },
        { from: path.resolve(__dirname, "robots.txt"), to: "robots.txt", noErrorOnMissing: true },
        // Copy MathJax library (SVG output)
        {
          from: path.resolve(__dirname, "node_modules/mathjax-full/es5"),
          to: "mathjax",
          noErrorOnMissing: true,
          globOptions: {
            ignore: ["**/input/**", "**/output/**", "**/adaptors/**", "**/handlers/**"],
          },
        },
        // Copy Mermaid library
        {
          from: path.resolve(__dirname, "node_modules/mermaid/dist"),
          to: "mermaid",
          noErrorOnMissing: true,
          globOptions: { ignore: ["**/src/**"] },
        },
      ],
    }),
    ...(isProd ? [] : [new ReactRefreshRspackPlugin()]),
  ],
  devtool: isProd ? false : "source-map",
  stats: "errors-warnings",
  infrastructureLogging: {
    level: "warn",
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: true,
    },
  },
  optimization: isProd
    ? {
        minimize: true,
      }
    : undefined,
});
