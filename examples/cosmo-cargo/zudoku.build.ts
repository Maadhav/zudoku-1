import os from "node:os";
import type { ZudokuBuildConfig } from "zudoku";

const cpuCount = os.cpus()?.length ?? 1;
const buildConfig: ZudokuBuildConfig = {
  processors: [
    async ({ file, schema }) => {
      schema.info.description = `${schema.info.description}\n\nThis schema was processed by a build processor in ${file}. See more in the [build configuration guide](https://zudoku.dev/docs/guides/processors).`;

      return schema;
    },
  ],
  prerender: {
    workers: Math.max(1, Math.floor(cpuCount * 0.75)),
  },
};

export default buildConfig;
