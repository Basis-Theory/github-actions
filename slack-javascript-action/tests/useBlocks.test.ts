import useBlocks from "../src/useBlocks";
import { ConfigType } from "../src/useConfig";

describe("release notes", () => {
  test("Nothing will return nothing", () => {
    const githubReleaseNotes = ``;

    const slackReleaseNotes =
      useBlocks().releaseNotesToBlocks(githubReleaseNotes);

    expect(slackReleaseNotes).toMatchSnapshot();
  });

  test("Malformed changelog will just return the note", () => {
    const githubReleaseNotes = `## What's Changed\n * stuff`;

    const slackReleaseNotes =
      useBlocks().releaseNotesToBlocks(githubReleaseNotes);

    expect(slackReleaseNotes).toMatchSnapshot();
  });

  test("No bullets anywhere will just return the note", () => {
    const githubReleaseNotes = `## What's Changed\n no bullets \n any \n where`;

    const slackReleaseNotes =
      useBlocks().releaseNotesToBlocks(githubReleaseNotes);

    expect(slackReleaseNotes).toMatchSnapshot();
  });

  test("Correctly formed will return each as its own block and no urls", () => {
    const githubReleaseNotes = `## What's Changed \n * chore(deps): Upgrades dependencies by @dhudec in https://github.com/Basis-Theory/basistheory-vault-api/pull/1389 \n * supporting sessions in proxy by @jleon15 in https://github.com/Basis-Theory/basistheory-vault-api/pull/1390`;

    const slackReleaseNotes =
      useBlocks().releaseNotesToBlocks(githubReleaseNotes);

    expect(slackReleaseNotes).toMatchSnapshot();
  });
});

describe("get approval message", () => {
  test("Approval needed request for product", () => {
    const config: ConfigType = {
      job_status: undefined,
      message_id: undefined,
      release_notes: "",
      startedTimestamp: "",
      status: "",
      stoppedTimestamp: "",
      repository: "test-repo",
      version: "v42.0.0",
      author: "drewsue",
      action_url: "http://test-repo.com/action",
      channel: "C1234567890",
      mention_person: "drewsue",
    };

    const approvalMessage = useBlocks().getApprovalMessage(config);

    expect(approvalMessage).toMatchSnapshot();
  });

  test("Approval needed request for platform", () => {
    const config: ConfigType = {
      job_status: undefined,
      message_id: undefined,
      release_notes: "",
      startedTimestamp: "",
      status: "",
      stoppedTimestamp: "",
      repository: "test-repo",
      version: "v42.0.0",
      author: "drewsue",
      action_url: "http://test-repo.com/action",
      channel: "C1234567890",
      mention_person: "drewsue",
    };

    const approvalMessage = useBlocks().getApprovalMessage(config);

    expect(approvalMessage).toMatchSnapshot();
  });

  test("Updated approval message after it has been approved", () => {
    let releaseMessage = {
      ts: "1234567890.123456",
      channel: "C1234567890",
    };

    const config: ConfigType = {
      job_status: undefined,
      message_id: undefined,
      release_notes: "",
      startedTimestamp: "",
      status: "",
      stoppedTimestamp: "",
      repository: "test-repo",
      version: "v42.0.0",
      author: "drewsue",
      action_url: "http://test-repo.com/action",
      channel: "C1234567890",
      mention_person: "drewsue",
    };

    const approvalMessage = useBlocks().getApprovalMessage(
      config,
      releaseMessage,
      true
    );

    expect(approvalMessage).toMatchSnapshot();
  });
});

describe("get deploy message", () => {
  test("Deploying started message", () => {
    const config: ConfigType = {
      job_status: undefined,
      message_id: undefined,
      release_notes: "",
      status: "",
      stoppedTimestamp: "",
      repository: "test-repo",
      version: "v42.0.0",
      author: "drewsue",
      action_url: "http://test-repo.com/action",
      startedTimestamp: "2021-01-01T00:00:00Z",
      channel: "chan-123",
      mention_person: "drewsue",
    };

    const approvalMessage = useBlocks().getDeployMessage("Deploying", config);

    expect(approvalMessage).toMatchSnapshot();
  });

  test("Updated message when deploy is done", () => {
    const config: ConfigType = {
      job_status: undefined,
      message_id: undefined,
      release_notes: "",
      repository: "test-repo",
      version: "v42.0.0",
      author: "drewsue",
      action_url: "http://test-repo.com/action",
      status: "done",
      startedTimestamp: "2021-01-01T00:00:00Z",
      stoppedTimestamp: "2021-01-01T00:00:00Z",
      channel: "chan-123",
      mention_person: "drewsue",
    };

    const approvalMessage = useBlocks().getDeployMessage("Deploying", config);

    expect(approvalMessage).toMatchSnapshot();
  });
});
