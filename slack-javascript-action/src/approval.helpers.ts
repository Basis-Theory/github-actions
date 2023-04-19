import { sendMessage, SlackMessage, updateMessage } from "./slack.client";
import useBlocks from "./useBlocks";
import { ConfigType } from "./useConfig";
import fs from "fs";
import * as artifact from "@actions/artifact";
import { threadReleaseNotes } from "./deploy.helpers";

const FILE_NAME = "release-message-information.config";

const askForApproval = async (config: ConfigType) => {
  const message = await sendMessage(
    config.channel,
    useBlocks().getApprovalMessage(config)
  );
  const releaseNotes = await threadReleaseNotes({
    ...config,
    message_id: message.ts,
  });

  fs.writeFileSync(
    "./release-message-information.config",
    JSON.stringify({
      channel: config.channel,
      message_id: message.ts,
    }),
    { encoding: "utf8" }
  );
  await artifact.create().uploadArtifact(FILE_NAME, [`./${FILE_NAME}`], ".");

  return message.ts;
};

const approvalWasGranted = async (
  config: ConfigType,
  release_message: SlackMessage
): Promise<string | undefined> => {
  const messageBlocks = useBlocks().getApprovalMessage(
    config,
    release_message,
    true
  );

  try {
    const downloadResponse = await artifact
      .create()
      .downloadArtifact(FILE_NAME, ".");
    const fileLocation = `${downloadResponse.downloadPath}/${FILE_NAME}`;
    const content = fs.readFileSync(fileLocation, {
      encoding: "utf8",
    });
    fs.unlink(fileLocation, () => {});
    const { message_id, channel } = JSON.parse(content);

    let message;
    if (message_id) {
      message = await updateMessage(channel, message_id, messageBlocks, "");
    }

    return message?.ts;
  } catch (e) {
    console.info("Problem updating file:", e);
  }

  return undefined;
};

export { askForApproval, approvalWasGranted };
