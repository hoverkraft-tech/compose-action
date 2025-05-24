import { debug, info, warning } from "@actions/core";

export class LoggerService {
  warn(message: string): void {
    warning(message);
  }

  info(message: string): void {
    info(message);
  }

  debug(message: string) {
    debug(message);
  }

  getServiceLogger(level: LogLevel): (message: string) => void {
    switch (level) {
      case LogLevel.Debug:
        return this.debug;
      case LogLevel.Info:
        return this.info;
      default:
        return this.info;
    }
  }
}

export enum LogLevel {
  Debug = "debug",
  Info = "info",
}
