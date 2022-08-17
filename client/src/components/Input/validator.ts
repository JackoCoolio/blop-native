import { userExists } from "../../lib/commands"

export type ValidationState = "valid" | "invalid" | "unknown"
// export type ValidationState<T> = {
//   state: "valid" | "invalid" | "unknown",
//   reason: T
// }

/**
 * A validator for an input field.
 */
export type Validator = (value: string) => Promise<ValidationState>
export type MaybeCallbackValidator =
  | Validator
  | [Validator, (result: ValidationState) => void]

/**
 * Returns the inverse of the given validation state.
 * @param state the validation state
 * @returns the inverse of `state`
 */
export function invertValidation(state: ValidationState): ValidationState {
  switch (state) {
    case "valid":
      return "invalid"
    case "invalid":
      return "valid"
    default:
      return "unknown"
  }
}

/**
 * Returns "valid" if `state` is "valid" or "invalid" if `state` is "invalid" or "unknown".
 * @param state the validation state
 * @returns "valid" if `state` is "valid", "invalid" otherwise
 */
export function excludeUnknownValidationState(
  state: ValidationState,
): Exclude<ValidationState, "unknown"> {
  return state === "unknown" ? "invalid" : state
}

/**
 * Calculates the appropriate validation state for the given value.
 * @param value the value to validate
 * @param validators the validators to use
 * @returns a validation state
 */
export async function calculateValidation(
  value: string,
  validators: MaybeCallbackValidator[] | undefined,
): Promise<ValidationState> {
  if (!validators) {
    return "valid"
  }

  try {
    const results = await Promise.all(
      validators.map((validator) => {
        if (typeof validator === "function") {
          return validatorWrapper(value, validator, () => ({}))
        }
        return validatorWrapper(value, validator[0], validator[1])
      }),
    )

    // if we've reached this point, all validators have returned valid/unknown

    const anyUnknown = results.some((result) => result === "unknown")

    // if any validators are unknown, the result is unknown
    if (anyUnknown) {
      return "unknown"
    }

    return "valid"
  } catch (e) {
    return "invalid"
  }
}

/**
 * Calls a validator and throws an error if it fails (calling `reject`).
 * This is useful for `Promise.all()`, because it will short-circuit if one of the promises is rejected.
 * @param value the value to validate
 * @param validator the validator to use
 */
export async function validatorWrapper( // TODO: come up with a better name
  value: string,
  validator: Validator,
  callback: (result: ValidationState) => void,
): Promise<Exclude<ValidationState, "invalid">> {
  const valid = await validator(value)
  callback(valid)

  if (valid === "invalid") {
    throw null
  }
  return valid
}

/**
 * A validator that checks if the value is a username that exists.
 * @param value the value to validate
 * @returns true if the value is an existing username
 */
export const userExistsValidator = async (value: string) => {
  const exists = await userExists(value)

  if (exists) {
    return "valid"
  } else {
    return "invalid"
  }
}

/**
 * A validator that checks if the value is not a username that exists.
 * @param value the value to validate
 * @returns true if value is not an existing username
 */
export const userDoesNotExistValidator = async (value: string) => {
  return invertValidation(await userExistsValidator(value))
}

/**
 * Creates a validator that checks if the value is not within an excluded list.
 * @param excluded values that should be considered invalid
 * @returns a validator that returns "valid" if the value is not in the excluded list, and "invalid" otherwise
 */
export const createExclusionValidator = (...excluded: string[]) => {
  return async (value: string) => {
    if (excluded.includes(value)) {
      return "invalid"
    } else {
      return "valid"
    }
  }
}

/**
 * Creates a validator that checks if the length of the value is within a given range.
 * @param min minimum length of the value, or nullish to ignore
 * @param max maximum length of the value, or nullish to ignore
 * @returns a validator that returns "valid" if the value is within the specified range, and "invalid" otherwise
 */
export const createLengthValidator = (
  min: MaybeNullish<number>,
  max?: MaybeNullish<number>,
) => {
  return async (value: string) => {
    if (typeof min === "number" && value.length < min) {
      return "invalid"
    }
    if (typeof max === "number" && value.length > max) {
      return "invalid"
    }
    return "valid"
  }
}
