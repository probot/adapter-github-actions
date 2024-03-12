import { inspect } from "util";

import through from "through2";
import core from "@actions/core";
import pino from "pino";

const LEVEL_TO_ACTIONS_CORE_LOG_METHOD = {
  trace: "debug",
  debug: "debug",
  info: "info",
  warn: "warning",
  error: "error",
  fatal: "error",
};

export const transport = through.obj(function (chunk, enc, cb) {
  const { level, hostname, pid, msg, time, ...meta } = JSON.parse(chunk);
  const levelLabel = pino.levels.labels[level] || level;
  const logMethodName = LEVEL_TO_ACTIONS_CORE_LOG_METHOD[levelLabel];

  const output = [
    msg,
    Object.keys(meta).length ? inspect(meta, { depth: Infinity }) : "",
  ]
    .join("\n")
    .trim();

  if (logMethodName in core) {
    core[logMethodName](output);
  } else {
    core.error(`"${level}" is not a known log level - ${output}`);
  }

  cb();
});
