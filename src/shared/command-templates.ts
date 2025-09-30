import { PodProfile } from './types';

export class CommandTemplateService {
  /**
   * Substitute variables in a command template with actual values
   */
  static substituteVariables(
    command: string,
    pod: PodProfile,
    sshKeyPath: string
  ): string {
    return command
      .replace(/<ip>/g, pod.ip)
      .replace(/<port>/g, pod.port.toString())
      .replace(/<localPort>/g, pod.localPort.toString())
      .replace(/<sshUrl>/g, pod.sshUrl)
      .replace(/<sshKeyPath>/g, sshKeyPath);
  }

  /**
   * Build SSH connection command
   * Template: ssh <sshUrl> -i <sshKeyPath>
   */
  static buildSSHCommand(pod: PodProfile, sshKeyPath: string): string {
    return `ssh ${pod.sshUrl} -i ${sshKeyPath}`;
  }

  /**
   * Build SSH tunnel command
   * Template: ssh -N -L <localPort>:127.0.0.1:7860 -i <sshKeyPath> -p <port> root@<ip>
   */
  static buildTunnelCommand(
    pod: PodProfile,
    sshKeyPath: string,
    remotePort: number = 7860
  ): string {
    return `ssh -N -L ${pod.localPort}:127.0.0.1:${remotePort} -i ${sshKeyPath} -p ${pod.port} root@${pod.ip}`;
  }

  /**
   * Build SCP download command
   * Template: scp -P <port> -i <sshKeyPath> root@<ip>:<remoteFile> <localTarget>
   */
  static buildDownloadCommand(
    pod: PodProfile,
    sshKeyPath: string,
    remoteFile: string,
    localTarget: string
  ): string {
    return `scp -P ${pod.port} -i ${sshKeyPath} root@${pod.ip}:${remoteFile} "${localTarget}"`;
  }

  /**
   * Build SCP upload command
   * Template: scp -P <port> -i <sshKeyPath> <localFile> root@<ip>:<remoteTarget>
   */
  static buildUploadCommand(
    pod: PodProfile,
    sshKeyPath: string,
    localFile: string,
    remoteTarget: string
  ): string {
    return `scp -P ${pod.port} -i ${sshKeyPath} "${localFile}" root@${pod.ip}:${remoteTarget}`;
  }

  /**
   * Extract variables from a command template
   */
  static extractVariables(command: string): string[] {
    const matches = command.match(/<\w+>/g);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Check if a command has variables
   */
  static hasVariables(command: string): boolean {
    return /<\w+>/.test(command);
  }
}