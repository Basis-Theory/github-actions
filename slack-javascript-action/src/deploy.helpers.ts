import { sendMessage, updateMessage } from "./slack.client";
import * as core from "@actions/core";
import useBlocks from "./useBlocks";
import { ConfigType } from "./useConfig";
import { approvalWasGrantedOrRejected } from "./approval.helpers";
import { CANCELLED_STATUSES, FAILURE_STATUSES } from "./github.helpers";
import { SUCCESS_STATUSES } from "./github.helpers";
const alertDeployStarting = async (config: ConfigType) => {
  const message = await sendMessage(
    config.channel,
    useBlocks().getDeployMessage(`:rocket: Deploy Started`, config)
  );

  core.exportVariable("SLACK_MESSAGE_ID", message.ts);

  return message;
};

const getDoneHeading = ({ job_status, status }: ConfigType) => {
  if (
    (job_status === "success" || SUCCESS_STATUSES.includes(status)) &&
    ![...CANCELLED_STATUSES, ...FAILURE_STATUSES].includes(status)
  ) {
    return `:white_check_mark: Deploy Success`;
  } else if (CANCELLED_STATUSES.includes(status)) {
    return `:octagonal_sign: Deploy Cancelled`;
  } else if (job_status === "failure" || FAILURE_STATUSES.includes(status)) {
    return `:no_entry_sign: Deploy Failure`;
  }
  return `:shrug: Deploy Status Unknown`;
};

const alertDeployDone = async (config: ConfigType) => {
  const { message_id, job_status }: ConfigType = config;
  let deployMessage = useBlocks().getDeployMessage(
    getDoneHeading(config),
    config
  );

  let message;
  if (message_id) {
    message = await updateMessage(config.channel, message_id, deployMessage);
  } else {
    message = await sendMessage(config.channel, deployMessage);
  }

  if (
    CANCELLED_STATUSES.includes(config.status) ||
    job_status === "cancelled"
  ) {
    await approvalWasGrantedOrRejected(config, undefined, true);
  }

  if (FAILURE_STATUSES.includes(config.status) || job_status === "failure") {
    await sendMessage(
      config.channel,
      useBlocks().getFailedMention(config),
      "",
      message.ts
    );
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
