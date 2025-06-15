import { homeDir, join } from '@tauri-apps/api/path';

export interface PackageJSON {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly main: string;
  readonly view?: string;
}

export interface Config {
  readonly url: string;
  readonly packageJSON: PackageJSON;
}

export async function extensionsPath() {
  return await join(await homeDir(), '.toda', 'extensions');
}