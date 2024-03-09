export * from "probot";
import { createProbot } from "probot";
import pino from "pino";
import { readFileSync } from "node:fs";

import { transport } from "./pino-transport-github-actions.js";

export async function run(app) {
  const log = pino({}, transport);

  const githubToken =
    process.env.GITHUB_TOKEN ||
    process.env.INPUT_GITHUB_TOKEN ||
    process.env.INPUT_TOKEN;

  if (!githubToken) {
    log.error(
      "[probot/adapter-github-actions] a token must be passed as `env.GITHUB_TOKEN` or `with.GITHUB_TOKEN` or `with.token`, see https://github.com/probot/adapter-github-actions#usage"
    );
    return;
  }

  const envVariablesMissing = [
    "GITHUB_RUN_ID",
    "GITHUB_EVENT_NAME",
    "GITHUB_EVENT_PATH",
  ].filter((name) => !process.env[name]);

  if (envVariablesMissing.length) {
    log.error(
      `[probot/adapter-github-actions] GitHub Action default environment variables missing: ${envVariablesMissing.join(
        ", "
      )}. See https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables`
    );
    return;
  }

  const probot = createProbot({
    overrides: {
      githubToken,
      log,
    },
  });

  await probot.load(app);

  return probot
    .receive({
      id: process.env.GITHUB_RUN_ID,
      name: process.env.GITHUB_EVENT_NAME,
      payload: JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH)),
    })
    .catch((error) => {
      probot.log.error(error);
    });
}
