import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { transformSync } from "@swc/core"

const extensionsRegex = /\.m?ts$/

export async function load(url, context, nextLoad) {
  if (extensionsRegex.test(url)) {
    const rawSource = readFileSync(fileURLToPath(url), 'utf-8');

    const { code } = transformSync(rawSource, {
      filename: url,
      jsc: {
        target: "es2021",
        parser: {
          syntax: 'typescript'
        }
      },
      module: {
        type: 'es6'
      }
    })

    return {
      format: "module",
      shortCircuit: true,
      source: code
    }
  }

  // Assume files without extension (e.g. tsc) are 'commonjs'
  context.format ||= 'commonjs'

  // Let Node.js handle all other URLs
  return nextLoad(url, context)
}