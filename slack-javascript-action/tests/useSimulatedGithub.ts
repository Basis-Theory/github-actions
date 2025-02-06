import { jest } from "@jest/globals";
import * as core from "@actions/core";
import * as artifact from "@actions/artifact";
import { GithubContextType } from "../src/useConfig";
import { ArtifactClient, DefaultArtifactClient } from "@actions/artifact";
// @ts-ignore
import fs from "fs";

afterEach(() => {
  delete process.env.SLACK_MESSAGE_ID;
  delete process.env.job_status;
  delete process.env.GITHUB_REPOSITORY;
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
      body: "@drewsue notes!",
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
  process.env.GITHUB_REPOSITORY = "luvi/test-repo";
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
      let mockedArtifact: any;
      const fakeArtifact = {
        uploadArtifact: jest.fn(() => {
          mockedArtifact = {
            artifact: {
              id: "1234567890",
            },
          };
          return mockedArtifact;
        }),
        getArtifact: jest.fn().mockImplementation(() => ({
          artifact: mockedArtifact,
        })),
        downloadArtifact: jest.fn().mockImplementation(() => ({
          downloadPath: ".",
          artifactName: "release-message-information",
        })),
        downloadAllArtifacts: jest.fn(),
        listArtifacts: jest.fn(),
        deleteArtifact: jest.fn(),
      } as ArtifactClient;

      jest
        .spyOn(DefaultArtifactClient.prototype, "uploadArtifact")
        .mockImplementation(fakeArtifact.uploadArtifact);
      jest
        .spyOn(DefaultArtifactClient.prototype, "getArtifact")
        .mockImplementation(fakeArtifact.getArtifact);
      jest
        .spyOn(DefaultArtifactClient.prototype, "downloadArtifact")
        .mockImplementation(fakeArtifact.downloadArtifact);

      return fakeArtifact;
    },
    cleanUp: () => {
      mockedCore.getInput.mockClear();
      mockedCore.exportVariable.mockClear();
      // DefaultArtifactClient.mockClear();
      jest.restoreAllMocks();
      try {
        fs.unlinkSync("release-message-information");
      } catch (e) { }
    },
  };
};

export default useSimulatedGithub;
