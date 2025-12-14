import type {
  AbstractConstructor,
  Predicate,
  TypeGuard,
} from "@infra-blocks/types";

/**
 * Traverses the causal chain of errors looking for an error that matches the provided predicate.
 *
 * The first test is done on the `err` parameter. If it matches, no causes are examined. If it does not
 * match and it has a `cause` attribute, the function will test against the cause, and so on.
 *
 * When the predicate is a type guard, that type is inferred as return type. Otherwise, the return type
 * is `unknown`. This is because Javascript allows anything to be thrown, and because the type of the
 * {@link Error.cause} attribute is `unknown`.
 *
 * @param err - The root error to examine.
 * @param predicate - A predicate, or a typeguard, to test each error against.
 *
 * @returns The first matching error in the causal chain, including the provided argument, or `undefined`
 * if none match.
 */
export function findCause<T>(
  err: unknown,
  predicate: TypeGuard<T>,
): T | undefined;
export function findCause(
  err: unknown,
  predicate: Predicate<unknown>,
): unknown | undefined;
export function findCause(
  err: unknown,
  predicate: Predicate<unknown>,
): unknown | undefined {
  if (predicate(err)) {
    return err;
  }
  if (err instanceof Error && err.cause != null) {
    return findCause(err.cause, predicate);
  }
  return undefined;
}

/**
 * This is a specialization of the {@link findCause} function that looks for an error
 * of the given instance type through the causal chain.
 *
 * The predicate used is an `instanceof` check against the provided constructor.
 *
 * @param err - The root error to examine.
 * @param ctor - The constructor function used in the `instanceof` check.
 * @returns A type-safe result of the instance type, or `undefined` if none match.
 */
export function findCauseByType<C extends AbstractConstructor>(
  err: unknown,
  ctor: C,
): InstanceType<C> | undefined {
  return findCause(err, (e): e is InstanceType<C> => e instanceof ctor);
}

/**
 * A convenience function for when extracting the cause is not required.
 *
 * It returns a boolean indicating whether the cause could be found
 * using {@link findCause}.
 *
 * Equivalent to `findCause(err, predicate) != null`.
 *
 * @param err - The root error to examine.
 * @param predicate - A predicate, to test each error against.
 *
 * @returns A boolean indicating whether a cause matching the predicate could be found.
 */
export function hasCause(err: unknown, predicate: Predicate<unknown>): boolean {
  return findCause(err, predicate) != null;
}

/**
 * A convenience function for when extracting the cause is not required.
 *
 * It returns a boolean indicating whether the cause could be found
 * using {@link findCauseByType}.
 *
 * Equivalent to `findCauseByType(err, ctor) != null`.
 *
 * @param err - The root error to examine.
 * @param ctor - The constructor function used in the `instanceof` check.
 *
 * @returns A boolean indicating whether a cause matching the constructor could be found.
 */
export function hasCauseByType<C extends AbstractConstructor>(
  err: unknown,
  ctor: C,
): boolean {
  return findCauseByType(err, ctor) != null;
}
