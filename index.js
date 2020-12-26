process.env.DISABLE_WEBHOOK_EVENT_CHECK = 'true';

const path = require('path');

const core = require('@actions/core');

const { createProbot: probotCreate } = require('probot');

function createProbot({
  overrides = {},
  defaults = {},
  env = process.env,
}) {
  overrides.githubToken = process.env.GITHUB_TOKEN;
  return probotCreate({ overrides, defaults, env })
}

async function runProbot (...handlers, { probot = createProbot }) {
  await probot.load(handlers);

  // Process the event
  const event = process.env.GITHUB_EVENT_NAME;
  const payloadPath = process.env.GITHUB_EVENT_PATH;
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const payload = require(path.resolve(payloadPath));
  core.debug(`Receiving event ${JSON.stringify(event)}`);
  return probot.receive({
    id: process.env.GITHUB_RUN_ID,
    name: event,
    payload
  }).catch(err => {
    // setFailed logs the message and sets a failing exit code
    core.setFailed(`Action failed with error: ${err.message}`);
    throw err;
  });
}

exports.runProbot = runProbot

exports.createProbot = createProbot
