import { sendMessage } from "./slack.client";
import useBlocks from "./useBlocks";
import { ConfigType } from "./useConfig";

const draftReleaseIsReady = async (config: ConfigType) => {
  const message = await sendMessage(
    config.channel,
    useBlocks().getDraftReleaseReadyMessage(config)
  );

  return message.ts;
};

export { draftReleaseIsReady };
