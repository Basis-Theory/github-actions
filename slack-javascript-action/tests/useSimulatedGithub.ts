import { jest } from "@jest/globals";
import * as core from "@actions/core";
import * as artifact from "@actions/artifact";
import { GithubContextType } from "../src/useConfig";
import { ArtifactClient } from "@actions/artifact";
// @ts-ignore
import fs from "fs";

afterEach(() => {
  delete process.env.SLACK_MESSAGE_ID;
  delete process.env.job_status;
  mockedEnvs.forEach((name) => delete process.env[name]);
  jest.useRealTimers();
});

const mockedEnvs: string[] = [];
let githubData: GithubContextType = {
  repository: "testing",
  run_id: "12",
  server_url: "http://test-repo.com",
  sha: "1234561234567890",
  actor: "drewsue",
  event: {
    commits: [
      {
        message: "test commit 1",
      },
      {
        message: "test commit 2",
      },
    ],
    repository: {
      name: "test-repo",
    },
    release: {
      tag_name: "v42.0.0",
      author: {
        login: "luvi",
      },
      body: "notes!",
    },
  },
};
export const coreData = {
  github: JSON.stringify(githubData),
  status: "done",
  "slack-api-token": "slack api key",
  channel: "C1234567890",
  "mention-person": "drewsue",
};

const setJobStatus = (status: string) => {
  process.env.job_status = status;
};

const useSimulatedGithub = (
  mockedCore: jest.Mocked<typeof core>,
  mockedArtifact: jest.Mocked<typeof artifact>
) => {
  return {
    setJobStatus,
    mockGetInput: (updateCoreData: any) => {
      mockedCore.getInput.mockClear();
      mockedCore.getInput.mockImplementation(
        (input: string | undefined = ""): any =>
          ({ ...coreData, ...updateCoreData }[input])
      );
      mockedCore.exportVariable.mockImplementation(
        (name: string, value: string) => {
          process.env[name] = value;
          mockedEnvs.push(name);
        }
      );
    },
    mockArtifact: () => {
      const fakeArtifact = {
        uploadArtifact: jest.fn(),
        downloadArtifact: jest.fn().mockImplementation(() => ({
          downloadPath: ".",
          artifactName: "release-message-information.config",
        })),
        downloadAllArtifacts: jest.fn(),
      } as ArtifactClient;

      mockedArtifact.create.mockImplementation(() => fakeArtifact);

      return fakeArtifact;
    },
    cleanUp: () => {
      mockedCore.getInput.mockClear();
      mockedCore.exportVariable.mockClear();
      mockedArtifact.create.mockClear();
      try {
        fs.unlinkSync("release-message-information.config");
      } catch (e) {}
    },
  };
};

export default useSimulatedGithub;
