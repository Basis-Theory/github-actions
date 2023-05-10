import { sendMessage, updateMessage } from "./slack.client";
import * as core from "@actions/core";
import useBlocks from "./useBlocks";
import { ConfigType } from "./useConfig";

const alertDeployStarting = async (config: ConfigType) => {
  const message = await sendMessage(
    config.channel,
    useBlocks().getDeployMessage(`:rocket: Deploy Started`, config)
  );

  core.exportVariable("SLACK_MESSAGE_ID", message.ts);

  return message;
};

const getDoneHeading = (job_status: string | undefined) => {
  if (job_status === "success") {
    return `:white_check_mark: Deploy Success`;
  } else if (job_status === "failure") {
    return `:no_entry_sign: Deploy Failure`;
  }
  return `:octagonal_sign: Deploy Cancelled`;
};

const alertDeployDone = async (config: ConfigType) => {
  const { message_id, job_status, mention_person }: ConfigType = config;
  let deployMessage = useBlocks().getDeployMessage(
    getDoneHeading(job_status),
    config
  );

  let message;
  if (message_id) {
    message = await updateMessage(config.channel, message_id, deployMessage);
  } else {
    message = await sendMessage(config.channel, deployMessage);
  }

  if(job_status === "failure" && mention_person) {
    await sendMessage(config.channel, undefined, `<${mention_person}>`, message.ts);
  }

  return message.ts;
};

const threadReleaseNotes = async ({
  channel,
  message_id,
  release_notes,
}: ConfigType) => {
  const message = await sendMessage(
    channel,
    useBlocks().releaseNotesToBlocks(release_notes),
    `${release_notes}`,
    message_id
  );

  return message;
};

export { alertDeployStarting, alertDeployDone, threadReleaseNotes };
