import { sendMessage } from "./slack.client";
import useBlocks from "./useBlocks";
import { ConfigType } from "./useConfig";

const draftReleaseIsReady = async (config: ConfigType) => {
  const message = await sendMessage(
    config.channel,
    useBlocks().getDraftReleaseReadyMessage(config)
  );

  const { blocks, text } = useBlocks().getDraftReleaseCollabs(config);
  await sendMessage(config.channel, blocks, text, message.ts);

  return message.ts;
};

export { draftReleaseIsReady };
