# :electric_plug: `probot-actions-adapter`

> An adapter that takes a [Probot](https://probot.github.io/) app and makes it compatible with [GitHub Actions](https://github.com/features/actions)

<a href="https://github.com/probot/actions-adapter"><img alt="GitHub Actions status" src="https://github.com/probot/actions-adapter/workflows/Build/badge.svg"></a>

## Installation

```shell
npm i -S probot-actions-adapter
```

## Usage

1. Add an `action.js` to your Probot project, like [the one shown below](#example-actionjs)
1. Add an `action.yml` to your Probot project, like [the one shown below](#example-actionyml)
1. _Vendor in_ your `node_modules`, as [recommended by the official Actions documentation](https://help.github.com/en/articles/creating-a-javascript-action#commit-and-push-your-action-to-github)
1. Optional, but recommended, update your project's README with an example workflow showing how to consume your action

### Example `action.js`

```javascript
// Require the adapter
const adapt = require('probot-actions-adapter');

// Require your Probot app's entrypoint, usually this is just index.js
const probot = require('./index');

// Adapt the Probot app for Actions
// This also acts as the main entrypoint for the Action
adapt(probot);
```

### Example `action.yml`

```yaml
name: 'Probot app name'
description: 'Probot app description.'
runs:
  using: 'node12'
  main: 'action.js'
```

See [the documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions) for `action.yml` syntax details.

## Caveats

This adapter is designed to work well with Probot apps that are essentially stateless webhook handlers.

A few other limitations exist:

1. The adapter will _only_ work for Probot apps that receive webhook events that Actions also receives: https://help.github.com/en/articles/events-that-trigger-workflows
1. The adapter will _only_ work for Probot apps with a permissions set that is less than, or equivalent to the permission set attached to the `GITHUB_TOKEN`: https://help.github.com/en/articles/virtual-environments-for-github-actions#token-permissions

If that's you, then great! :rocket:
