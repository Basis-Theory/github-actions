import { getInput, exportVariable } from "@actions/core";

export type ConfigType = {
  repository: string;
  version: string;
  release_notes: string;
  author: string;
  type: string;
  action_url: string;
  message_id: string | undefined;
  startedTimestamp: string;
  stoppedTimestamp: string;
  status: string;
  job_status: string | undefined;
  channel: string;
  mention_person: string | undefined;
};

export type GithubContextCommitType = {
  message: string;
};

export type GithubContextType = {
  actor: string;
  sha: string;
  server_url: string;
  repository: string;
  run_id: string;
  event: {
    commits?: GithubContextCommitType[];
    repository: {
      name: string;
    };
    release?: {
      tag_name: string;
      body: string;
      author: {
        login: string;
      };
    };
  };
};

const getVersion = (githubContext: GithubContextType): string =>
  githubContext.event.release
    ? githubContext.event.release.tag_name
    : githubContext.sha.slice(0, 6);

const getReleaseNotes = (githubContext: GithubContextType): string => {
  if (githubContext.event.release) {
    return githubContext.event.release.body;
  }

  if (githubContext.event.commits) {
    return githubContext.event.commits
      .map((commit) => commit.message)
      .join("*");
  }

  return "no release notes";
};

const getAuthor = (githubContext: GithubContextType): string =>
  githubContext.event.release &&
  !githubContext.event.release.author.login.includes("github-actions")
    ? githubContext.event.release.author.login
    : githubContext.actor;

const getDateTime = (): string => {
  return Intl.DateTimeFormat("en", {
    timeZone: "America/Chicago",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  })
    .format(new Date())
    .replace(/\u202F/g, " ");
};

const getStartedTimestamp = (): string => {
  if (process.env.STARTED_TIMESTAMP) {
    return process.env.STARTED_TIMESTAMP;
  }
  exportVariable("STARTED_TIMESTAMP", getDateTime());

  return getDateTime();
};

const getStoppedTimestamp = (): string => getDateTime();

const useConfig = (): ConfigType => {
  console.log(JSON.stringify(JSON.parse(getInput("github")), null, 2));
  const githubContext: GithubContextType = JSON.parse(getInput("github"));
  const status = getInput("status");
  const type = getInput("type");
  const channel = getInput("channel");
  const mention_person = getInput("mention-person");
  const job_status = process.env.job_status;
  const startedTimestamp = getStartedTimestamp();
  const stoppedTimestamp = getStoppedTimestamp();

  return {
    repository: githubContext.event.repository.name,
    version: getVersion(githubContext),
    release_notes: getReleaseNotes(githubContext),
    author: getAuthor(githubContext),
    action_url: `${githubContext.server_url}/${githubContext.repository}/actions/runs/${githubContext.run_id}`,
    message_id: process.env.SLACK_MESSAGE_ID,
    startedTimestamp,
    stoppedTimestamp,
    status,
    type,
    job_status,
    channel,
    mention_person,
  };
};

export default useConfig;
