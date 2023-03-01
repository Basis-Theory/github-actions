import * as core from "@actions/core";
import axios from "axios";

export type SlackMessage = {
  ts: string;
  channel: string;
};

const getSlackAPIKey = () => core.getInput("slack-api-token");

const sendMessage = (
  channel: string,
  blocks: any,
  text: string = "",
  thread_ts: string = ""
): Promise<SlackMessage> =>
  axios
    .post(
      "https://slack.com/api/chat.postMessage",
      {
        channel,
        blocks,
        text,
        thread_ts,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSlackAPIKey()}`,
        },
      }
    )
    .then((res: any) => res.data);

const updateMessage = (
  channel: string,
  ts: string,
  blocks: any,
  text: string = ""
): Promise<SlackMessage> =>
  axios
    .post(
      "https://slack.com/api/chat.update",
      {
        channel,
        ts,
        blocks,
        text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSlackAPIKey()}`,
        },
      }
    )
    .then((res: any) => res.data);

export { sendMessage, updateMessage };
