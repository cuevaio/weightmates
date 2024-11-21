/* eslint-disable @typescript-eslint/no-explicit-any */
// Singleton function to ensure only unique instance are created

export function singleton<Value>(name: string, value: () => Value): Value {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalAny: any = global;
  globalAny.__singletons = globalAny.__singletons || {};

  if (!globalAny.__singletons[name]) {
    globalAny.__singletons[name] = value();
  }

  return globalAny.__singletons[name];
}
