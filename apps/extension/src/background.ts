import { createLogger } from "@dp/utils";

const logger = createLogger("extension-background");

export const startBackgroundWorker = (): void => {
  logger.info("Starting extension background worker");
};

startBackgroundWorker();
