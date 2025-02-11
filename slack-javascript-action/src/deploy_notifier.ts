import useConfig from "./useConfig";
import {
  approvalWasGrantedOrRejected,
  askForApproval,
} from "./approval.helpers";
import {
  alertDeployDone,
  alertDeployStarting,
  threadReleaseNotes,
} from "./deploy.helpers";
import { draftReleaseIsReady } from "./draft_release_ready.helpers";
import { COMPLETED_STATUSES } from "./github.helpers";

export const deploy_notifier = async () => {
  const config = useConfig();

  if (config.type === "draft-release-ready") {
    return await draftReleaseIsReady(config);
  } else {
    if (config.status === "request") {
      return await askForApproval(config);
    } else if (
      COMPLETED_STATUSES.includes(config.status) ||
      config.message_id
    ) {
      return await alertDeployDone(config);
    } else {
      const message = await alertDeployStarting(config);
      const releaseNotes = await threadReleaseNotes({
        ...config,
        message_id: message.ts,
      });
      const approvalGranted = await approvalWasGrantedOrRejected(
        config,
        message
      );

      return { message, releaseNotes, approvalGranted };
    }
  }
};
