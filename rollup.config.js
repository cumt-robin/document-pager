import terser from '@rollup/plugin-terser';
import fastGlob from "fast-glob";
import url from "url";
import del from "rollup-plugin-delete";

const ROOT_PATH = url.fileURLToPath(new URL("./", import.meta.url));

const getInputs = async (glob = "src/**/*.js", options = {}) => {
  const entries = await fastGlob(glob, {
    absolute: true,
    onlyFiles: true,
    ignore: ["node_modules"],
    ...options,
  });
  return entries;
};

const inputs = await getInputs(["src/*.js"], { cwd: ROOT_PATH });

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: inputs,
    output: [
      {
        dir: "esm",
        format: "esm",
      },
    ],
    plugins: [
      del({
        targets: ["esm/**/*"],
      }),
    ],
  },
  {
    input: "src/index.js",
    output: [
      {
        file: "dist/index.esm.js",
        format: "esm",
      },
      {
        file: "dist/index.bundle.js",
        format: "umd",
        name: "DocumentPager",
      },
    ],
    plugins: [
      del({
        targets: "dist/**/*",
      }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          toplevel: true
        }
      }),
    ],
  },
];
