// common/decorators/observability/observed.decorator.ts
import { MetricsService } from '@/common/modules/observability/metrics/metrics.service';
import { TracingService } from '@/common/modules/observability/tracing/tracing.service';

const OBSERVED = Symbol('observed');

interface ObservableInstance {
  tracingService: TracingService;
  metricsService?: MetricsService;
}

function wrap(
  original: (...args: unknown[]) => unknown,
  name: string,
): (...args: unknown[]) => Promise<unknown> {
  async function wrapped(this: ObservableInstance, ...args: unknown[]): Promise<unknown> {
    const { spanId } = this.tracingService.startSpan(name);
    try {
      const result = await original.apply(this, args);
      this.metricsService?.increment(`${name}_total`, 1, { status: 'success' });
      return result;
    } catch (error) {
      this.metricsService?.increment(`${name}_total`, 1, { status: 'error' });
      throw error;
    } finally {
      this.tracingService.endSpan(spanId);
    }
  }
  (wrapped as { [OBSERVED]?: boolean })[OBSERVED] = true;
  return wrapped;
}

/**
 * Wraps a method, or every method on a class, in a tracing span plus a
 * success/error metric counter. Same decorator either way — apply it to
 * one method for an explicit span name, or to the class to cover every
 * method automatically (mirrors @UseGuards()).
 *
 * @param name - Span name. Only meaningful on a method — ignored on a
 * class, since one shared name would collapse every method's metrics
 * into a single series. Each auto-wrapped method gets `Class.method`.
 */
export function Observed(name?: string): MethodDecorator & ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator target's
  // shape is unknowable at this call site; TS's own decorator signatures require it.
  return ((target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey !== undefined && descriptor) {
      const spanName = name ?? `${target.constructor.name}.${String(propertyKey)}`;
      descriptor.value = wrap(descriptor.value, spanName);
      return descriptor;
    }

    const proto = target.prototype;
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor') continue;
      const propDescriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (!propDescriptor || typeof propDescriptor.value !== 'function') continue;
      if (propDescriptor.value[OBSERVED]) continue; // method already carries its own @Observed
      propDescriptor.value = wrap(propDescriptor.value, `${target.name}.${key}`);
      Object.defineProperty(proto, key, propDescriptor);
    }
    return target;
  }) as MethodDecorator & ClassDecorator;
}