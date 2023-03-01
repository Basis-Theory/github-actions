import { getInput, setOutput } from "@actions/core";
import { sendMessage, updateMessage } from "./slack.client";

export const slackMessage = async () => {
  const channel: string = getInput("channel");
  const blocks: string = getInput("blocks");
  const text: string = getInput("text");
  const updateMessageId: string = getInput("update-message-id");
  const threadMessageId: string = getInput("thread-message-id");

  let message;
  if (updateMessageId) {
    message = await updateMessage(channel, updateMessageId, blocks, text);
  } else {
    message = await sendMessage(channel, blocks, text, threadMessageId);
  }

  if (message) {
    setOutput("message_id", message.ts);
  }

  return message;
};

slackMessage().then(console.log).catch(console.error);
