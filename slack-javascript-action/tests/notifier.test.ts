import * as core from "@actions/core";
import * as artifact from "@actions/artifact";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { jest } from "@jest/globals";
import { deploy_notifier } from "../src/deploy_notifier";
import useSimulatedGithub, { coreData } from "./useSimulatedGithub";
import useSlackMock from "./useSlackMock";
jest.mock("@actions/core");
jest.mock("@actions/artifact");
const mockedCore = core as jest.Mocked<typeof core>;
const mockedArtifact = artifact as jest.Mocked<typeof artifact>;

const { mockGetInput, setJobStatus, mockArtifact, cleanUp } =
  useSimulatedGithub(mockedCore, mockedArtifact);
const { mockCreateMessage, mockUpdateMessage } = useSlackMock(
  new MockAdapter(axios)
);

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2020, 3, 1, 0, 0, 0, 0));

  mockCreateMessage();
  mockUpdateMessage();
  mockArtifact();
});

afterEach(() => {
  jest.useRealTimers();
  cleanUp();
});

const requestDeploy = async (channel = coreData.channel) => {
  mockGetInput({ status: "request", channel });
  return await deploy_notifier();
};

const startDeploy = async () => {
  mockGetInput({ status: "start" });
  return await deploy_notifier();
};

const deploySuccessful = async () => {
  mockGetInput({ status: "done" });
  setJobStatus("success");
  return await deploy_notifier();
};

const deployCancelled = async () => {
  mockGetInput({ status: "done" });
  setJobStatus("cancelled");
  return await deploy_notifier();
};

const deployFailed = async () => {
  mockGetInput({ status: "done" });
  setJobStatus("failure");
  return await deploy_notifier();
};

const draftRelease = async () => {
  mockGetInput({ type: "draft-release-ready" });
  return await deploy_notifier();
};


describe("draft created", () => {
  test("send draft release ready", async () => {
    expect(await draftRelease()).toMatchSnapshot();
  });
});

describe("build success", () => {
  test("send request for approval", async () => {
    expect(await requestDeploy()).toMatchSnapshot();
  });

  test("start deploy with no request", async () => {
    expect(await startDeploy()).toMatchSnapshot();
  });

  test("start deploy with request", async () => {
    await requestDeploy();
    expect(await startDeploy()).toMatchSnapshot();
  });

  test("happy path request, start, success", async () => {
    await requestDeploy("request_channel123");
    await startDeploy();
    expect(await deploySuccessful()).toMatchSnapshot();
  });

  test("send new message if nothing to update on finish", async () => {
    expect(await deploySuccessful()).toMatchSnapshot();
  });
});

describe("build cancelled", () => {
  test("send new message cancelled message if nothing to update on finish", async () => {
    expect(await deployCancelled()).toMatchSnapshot();
  });

  test("happy path request, start, cancelled", async () => {
    await requestDeploy();
    await startDeploy();

    expect(await deployCancelled()).toMatchSnapshot();
  });
});

describe("failed build", () => {
  test("send new message when none exists", async () => {
    expect(await deployFailed()).toMatchSnapshot();
  });
});
