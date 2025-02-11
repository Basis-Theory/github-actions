import { ConfigType } from "./useConfig";
import { SlackMessage } from "./slack.client";
import { COMPLETED_STATUSES } from "./github.helpers";

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
  completed: boolean = false,
  cancelled: boolean = false
): any => {
  let header_text = cancelled ? "*Cancelled* " : "";
  header_text += `${completed ? ":approved: ~" : ""}*Approval Requested`;
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
          text: `${completed ? "~" : ""
            }:git: \`${repository}\` @ \`${version}\`  | :technologist: ${author}${completed ? "~" : ""
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
  release_notes,
}: ConfigType): any => {
  let header_text = `:package: ${repository}@${version}`;
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: header_text,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `New Draft Version Created by: ${getDraftReleaseCollabs(
            release_notes
          )}`,
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
            text: "Open Release :github:",
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

interface GithubToSlack {
  [key: string]: string;
}

const getDraftReleaseCollabs = (release_notes: string): any => {
  const regex = /@[^ ]+/g;
  const githubToSlack: GithubToSlack = {
    "@drewsue": "SLACK_ID", //leave for tests
    "@armsteadj1": "U01GRDZ7XJ6",
    "@brigonzalez": "U01Q14S62GN",
    "@dhudec": "U029GBW14P3",
    "@djejaquino": "U01KFJLKV0F",
    "@greathouse": "U06NM3NG477",
    "@jleon15": "U02N976BDB6",
    "@JustJordanT": "U02G64KK6DC",
    "@kevinperaza": "U046MNLFEUW",
    "@lcschy": "U026LV447FG",
    "@mstrisoline": "U01PT4W3RM5",
  };

  let matches = release_notes.match(regex);

  const mentions = matches
    ?.map((u) => githubToSlack[u.trim()])
    .map((mention) => `<@${mention}>`)
    .join(" ");

  return `${mentions}`;
};

const getFailedMention = ({ slack_user_id }: ConfigType): any => {
  const mention = slack_user_id ? `@${slack_user_id}` : "!subteam^S03SRBLDYBZ";
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
          text: `Deploy started \`${startedTimestamp}\` ${COMPLETED_STATUSES.includes(status) ? `and finished \`${stoppedTimestamp}\`` : ""
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
