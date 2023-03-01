import useConfig from "./useConfig";
import { approvalWasGranted, askForApproval } from "./approval.helpers";
import {
  alertDeployDone,
  alertDeployStarting,
  threadReleaseNotes,
} from "./deploy.helpers";

export const deploy_notifier = async () => {
  const config = useConfig();

  if (config.status === "request") {
    return await askForApproval(config);
  } else if (config.status === "done" || config.message_id) {
    return await alertDeployDone(config);
  } else {
    const message = await alertDeployStarting(config);
    const releaseNotes = await threadReleaseNotes({
      ...config,
      message_id: message.ts,
    });
    const approvalGranted = await approvalWasGranted(config, message);

    return { message, releaseNotes, approvalGranted };
  }
};
