
import { Context } from './Context';
import { WorkerEventEmitter, type WorkerEventEmitterEventTypes, type Config } from '@toda/core';

export type ExtensionFunction = (context: Context) => Promise<void> | void;

export async function extension(fn: ExtensionFunction) {
  const emitter = new WorkerEventEmitter<ExtensionWorkerEventEmitterEventTypes>(self as never);
  let context: Context;
  emitter.once('config', async (config) => {
    try {
      context = new Context(config);
      await fn(context);
    } catch (err) {
      emitter.emit('extensionerror', err);
    }
  });
  emitter.on('command', async (name) => {
    try {
      await context.commands.call(name);
    } catch (err) {
      emitter.emit('extensionerror', err);
    }
  });
  emitter.emit('ready');
}

export interface ExtensionWorkerEventEmitterEventTypes extends WorkerEventEmitterEventTypes {
  ready(): void;
  config(config: Config): void;
  extensionerror(err: unknown): void;
  command(name: string): void;
}