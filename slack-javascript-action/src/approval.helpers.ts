import { sendMessage, SlackMessage, updateMessage } from "./slack.client";
import useBlocks from "./useBlocks";
import { ConfigType } from "./useConfig";
import fs from "fs";
import { DefaultArtifactClient } from "@actions/artifact";
import { threadReleaseNotes } from "./deploy.helpers";

const FILE_NAME = "release-message-information";

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
    FILE_NAME,
    JSON.stringify({
      channel: config.channel,
      message_id: message.ts,
    }),
    { encoding: "utf8" }
  );
  const artifactClient = new DefaultArtifactClient();
  await artifactClient.uploadArtifact(FILE_NAME, [`./${FILE_NAME}`], ".");

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
    const artifactClient = new DefaultArtifactClient();
    const { artifact } = await artifactClient.getArtifact(FILE_NAME);
    if (artifact) {
      const { downloadPath } = await artifactClient.downloadArtifact(
        artifact.id
      );

      const fileLocation = `${downloadPath}/${FILE_NAME}`;
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
    }
  } catch (e) {
    console.info("Problem updating file:", e);
  }

  return undefined;
};

export { askForApproval, approvalWasGranted };
