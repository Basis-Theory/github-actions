import { ConfigType } from "./useConfig";
import { SlackMessage } from "./slack.client";

const releaseNotesToBlocks = (release_notes: string): any => {
  const fullChangelogRegex = /Full Changelog.*/i;
  release_notes = release_notes
    .replace("## What's Changed", "")
    .replace(fullChangelogRegex, "")
    .replace("\r\n", "")
    .trim();

  if (release_notes === "") return [];

  const note_blocks = release_notes
    .split("*")
    .filter((item) => item !== "")
    .map((item) => {
      const urlRegex = /(.*) in (.*)/i;
      const match = urlRegex.exec(item);
      let note = !match ? item.trim() : match[1].trim();

      return {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `• ${note}`,
        },
      };
    });

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: " :loud_sound: *Release Notes* :loud_sound:",
      },
    },
    ...note_blocks,
  ];
};

const getApprovalMessage = (
  { repository, version, author, action_url, mention_person }: ConfigType,
  release_message: SlackMessage | undefined = undefined,
  completed: boolean = false
): any => {
  let header_text = `${completed ? ":approved: ~" : ""}*Approval Requested`;
  header_text += mention_person ? ` from <${mention_person}>*` : "*";
  header_text += completed ? `~` : "";

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: header_text,
      },
    },
    {
      type: "context",
      elements: [
        {
          text: `${
            completed ? "~" : ""
          }:git: \`${repository}\` @ \`${version}\`  | :technologist: ${author}${
            completed ? "~" : ""
          }`,
          type: "mrkdwn",
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: completed ? "Open Deploy :slack:" : "Open Action :github:",
            emoji: true,
          },
          url: completed
            ? `https://basistheory.slack.com/archives/${release_message?.channel}/${release_message?.ts}`
            : action_url,
        },
      ],
    },
    {
      type: "divider",
    },
  ];
};

const getDraftReleaseReadyMessage = ({
  repository,
  version,
}: ConfigType): any => {
  let header_text = `:package: New Draft Version Created: ${repository}@${version}`;

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: header_text,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Open Release :slack:",
            emoji: true,
          },
          url: `https://github.com/Basis-Theory/${repository}/releases/edit/${version}`,
        },
      ],
    },
    {
      type: "divider",
    },
  ];
};

const getFailedMention = ({ mention_person }: ConfigType): any => {
  const mention = mention_person ? mention_person : "!subteam^S04RC9KQ77F";
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<${mention}>`,
      },
    },
  ];
};

const getDeployMessage = (
  heading: string,
  {
    repository,
    version,
    author,
    action_url,
    status,
    startedTimestamp,
    stoppedTimestamp,
  }: ConfigType
): any => [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: heading,
    },
  },
  {
    type: "context",
    elements: [
      {
        text: `:git: \`${repository}\` @ \`${version}\`  | :technologist: ${author}`,
        type: "mrkdwn",
      },
    ],
  },
  {
    type: "context",
    elements: [
      {
        text: `Deploy started \`${startedTimestamp}\` ${
          status === "done" ? `and finished \`${stoppedTimestamp}\`` : ""
        }`,
        type: "mrkdwn",
      },
    ],
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Open Action  :github:",
          emoji: true,
        },
        url: action_url,
      },
    ],
  },
  {
    type: "divider",
  },
];

const useBlocks = () => ({
  releaseNotesToBlocks,
  getApprovalMessage,
  getDraftReleaseReadyMessage,
  getDeployMessage,
  getFailedMention,
});

export default useBlocks;
