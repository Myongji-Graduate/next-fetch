import { FetchAXDefaultOptions } from '.';

export function mergeOptions(
  ...args: FetchAXDefaultOptions[]
): FetchAXDefaultOptions {
  const result: FetchAXDefaultOptions = { ...args[0] };

  for (let i = 1; i < args.length; i++) {
    const props = args[i];

    for (const key in props) {
      const a = result[key];
      const b = props[key];

      if (typeof a === 'function' && typeof b === 'function') {
        result[key] = chainInterceptor(a, b);
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }
  return result;
}

export function chainInterceptor<T>(
  ...interceptors: (((arg: T) => Promise<T> | T) | undefined)[]
): ((arg: T) => Promise<T>) | undefined {
  if (interceptors.filter((interceptor) => interceptor).length === 0) return;
  return async (arg: T) => {
    let result = arg;
    for (let interceptor of interceptors) {
      if (interceptor && typeof interceptor === 'function') {
        result = await interceptor(result);
      }
    }
    return result;
  };
}
