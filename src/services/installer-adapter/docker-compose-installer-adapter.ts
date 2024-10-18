export interface DockerComposeInstallerAdapter {
  install(version: string): Promise<void>;
}
