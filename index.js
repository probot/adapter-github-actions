process.env.DISABLE_WEBHOOK_EVENT_CHECK = 'true';

const path = require('path');
const uuid = require('uuid');

const core = require('@actions/core');

const { Probot } = require('probot');

module.exports = (...handlers) => {
  // Setup Probot app
  const githubToken = process.env.GITHUB_TOKEN;
  const probot = new Probot({ githubToken });
  probot.setup(handlers);

  // Process the event
  const event = process.env.GITHUB_EVENT_NAME;
  const payloadPath = process.env.GITHUB_EVENT_PATH;
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const payload = require(path.resolve(payloadPath));
  core.debug(`Receiving event ${JSON.stringify(event)}`);
  return probot.receive({ name: event, payload, id: uuid.v4() }).catch(err => {
    // setFailed logs the message and sets a failing exit code
    core.setFailed(`Action failed with error: ${err.message}`);
    throw err;
  });
};
