import typescript from 'rollup-plugin-typescript2';
import * as ts from 'typescript';

export default {
  input: 'insightflow-sdk.ts',
  output: {
    file: 'dist/insightflow-sdk.umd.js',
    format: 'umd',
    name: 'InsightFlowSDK',
    sourcemap: true
  },
  external: [],
  plugins: [
    typescript({
      typescript: ts,
      tsconfig: 'tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          target: 'es2017',
          module: 'es2015',
          declaration: false,
          declarationMap: false
        }
      }
    })
  ]
}; 