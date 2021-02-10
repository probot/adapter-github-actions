const nock = require("nock");

const { run } = require("../index");
const app = require("./fixtures/app");

nock.disableNetConnect();

describe("@probot/adapter-github-actions", () => {
  beforeEach(() => {
    process.env = {};
  });
  test("happy path", async () => {
    process.env.GITHUB_TOKEN = "token123";
    process.env.GITHUB_RUN_ID = "1";
    process.env.GITHUB_EVENT_NAME = "push";
    process.env.GITHUB_EVENT_PATH = require.resolve("./fixtures/push.json");

    const mock = nock("https://api.github.com")
      .post(
        "/repos/probot/adapter-github-actions/commits/headcommitsha123/comments",
        (requestBody) => {
          expect(requestBody).toStrictEqual({
            body: "Hello from test/fixtures/app.js",
          });

          return true;
        }
      )
      .reply(201, {});

    const output = [];
    storeOutput = (data) => output.push(data);
    const origWrite = process.stdout.write;
    process.stdout.write = jest.fn(storeOutput);
    await run(app);
    process.stdout.write = origWrite;
    expect(output).toStrictEqual([
      "This is an info message\n",
      "::warning::This is a warning message\n",
    ]);

    expect(mock.activeMocks()).toStrictEqual([]);
  });

  test("GITHUB_TOKEN not set", async () => {
    const output = [];
    storeOutput = (data) => output.push(data);
    const origWrite = process.stdout.write;
    process.stdout.write = jest.fn(storeOutput);
    await run(app);
    process.stdout.write = origWrite;
    expect(output).toStrictEqual([
      "::error::[probot/adapter-github-actions] a token must be passed as `env.GITHUB_TOKEN` or `with.GITHUB_TOKEN` or `with.token`, see https://github.com/probot/adapter-github-actions#usage\n",
    ]);
  });

  test("GITHUB_RUN_ID not set", async () => {
    process.env.GITHUB_TOKEN = "token123";

    const output = [];
    storeOutput = (data) => output.push(data);
    const origWrite = process.stdout.write;
    process.stdout.write = jest.fn(storeOutput);
    await run(app);
    process.stdout.write = origWrite;
    expect(output).toStrictEqual([
      "::error::[probot/adapter-github-actions] GitHub Action default environment variables missing: GITHUB_RUN_ID, GITHUB_EVENT_NAME, GITHUB_EVENT_PATH. See https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables\n",
    ]);
  });

  test("error response", async () => {
    process.env.GITHUB_TOKEN = "token123";
    process.env.GITHUB_RUN_ID = "1";
    process.env.GITHUB_EVENT_NAME = "push";
    process.env.GITHUB_EVENT_PATH = require.resolve("./fixtures/push.json");

    const mock = nock("https://api.github.com")
      .post(
        "/repos/probot/adapter-github-actions/commits/headcommitsha123/comments",
        (requestBody) => {
          expect(requestBody).toStrictEqual({
            body: "Hello from test/fixtures/app.js",
          });

          return true;
        }
      )
      .reply(403, {
        error: "nope",
      });

    const output = [];
    storeOutput = (data) => output.push(data);
    const origWrite = process.stdout.write;
    process.stdout.write = jest.fn(storeOutput);
    await run(app);
    process.stdout.write = origWrite;

    expect(output[2].startsWith('::error::{"error":"nope"}%0A{%0A')).toBe(true);

    expect(mock.activeMocks()).toStrictEqual([]);
  });

  test("unknown log level", async () => {
    process.env.GITHUB_TOKEN = "token123";
    process.env.GITHUB_RUN_ID = "1";
    process.env.GITHUB_EVENT_NAME = "push";
    process.env.GITHUB_EVENT_PATH = require.resolve("./fixtures/push.json");

    const output = [];
    storeOutput = (data) => output.push(data);
    const origWrite = process.stdout.write;
    process.stdout.write = jest.fn(storeOutput);
    await run((app) => app.log.info({ level: "unknown" }, "oopsies"));
    process.stdout.write = origWrite;

    expect(output).toStrictEqual([
      '::error::"unknown" is not a known log level - oopsies\n',
    ]);
  });
});
