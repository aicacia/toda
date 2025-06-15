import EventEmitter from 'eventemitter3';

export interface WorkerEventEmitterMessage<EventTypes extends WorkerEventEmitterEventTypes> {
  event: EventEmitter.EventNames<EventTypes>;
  args: EventEmitter.EventArgs<EventTypes, EventEmitter.EventNames<EventTypes>>;
}

export interface WorkerEventEmitterEventTypes {
  workererror(event: ErrorEvent): void;
  messageerror(event: MessageEvent<unknown>): void;
}

export class WorkerEventEmitter<
  EventTypes extends WorkerEventEmitterEventTypes = WorkerEventEmitterEventTypes,
  Context = unknown
> extends EventEmitter<EventTypes, Context> {
  readonly worker: Worker;

  constructor(worker: Worker) {
    super();
    this.worker = worker;
    this.listen();
  }

  emit<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.EventArgs<EventTypes, T>
  ): boolean {
    this.worker.postMessage({
      event,
      args
    } as WorkerEventEmitterMessage<EventTypes>);
    return true;
  }

  listen() {
    this.worker.addEventListener('error', this.#onError);
    this.worker.addEventListener('message', this.#onMessage);
    this.worker.addEventListener('messageerror', this.#onMessageError);
  }

  unlisten() {
    this.worker.removeEventListener('error', this.#onError);
    this.worker.removeEventListener('message', this.#onMessage);
    this.worker.removeEventListener('messageerror', this.#onMessageError);
  }

  #onError = (event: ErrorEvent) => {
    // @ts-ignore
    super.emit('workererror', event);
  };
  #onMessage = (event: MessageEvent<unknown>) => {
    if (isWorkerMessage<EventTypes>(event.data)) {
      super.emit(event.data.event, ...event.data.args);
    }
  };
  #onMessageError = (event: MessageEvent<unknown>) => {
    // @ts-ignore
    super.emit('messageerror', event);
  };
}

export function isWorkerMessage<EventTypes extends WorkerEventEmitterEventTypes>(value: unknown): value is WorkerEventEmitterMessage<EventTypes> {
  return value !== null && typeof value === 'object' && 'event' in value && 'args' in value && Array.isArray(value.args);
}