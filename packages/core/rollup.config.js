import terser from "@rollup/plugin-terser";
import fastGlob from "fast-glob";
import url from "url";
import del from "rollup-plugin-delete";
import typescript from "@rollup/plugin-typescript";

const ROOT_PATH = url.fileURLToPath(new URL("./", import.meta.url));

const getInputs = async (glob = "src/**/*.ts", options = {}) => {
  const entries = await fastGlob(glob, {
    absolute: true,
    onlyFiles: true,
    ignore: ["node_modules"],
    ...options,
  });
  return entries;
};

const inputs = await getInputs(["src/*.ts"], { cwd: ROOT_PATH });

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
      typescript({
        compilerOptions: {
          declaration: true,
          declarationDir: "esm",
        },
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.esm.js",
        format: "esm",
      },
      {
        file: "dist/index.js",
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
          drop_debugger: true,
        },
        mangle: {
          toplevel: true,
        },
      }),
      typescript({
        compilerOptions: {
          declaration: true,
          declarationDir: "dist",
        },
      }),
    ],
  },
];
