// Profile validation constants and helpers matching backend constraints

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MIN_LENGTH = 5;
export const EMAIL_MAX_LENGTH = 320;

export interface ValidationError {
  field: "name" | "email";
  message: string;
}

/**
 * Validates a name string according to backend rules
 */
export function validateName(name: string): ValidationError | null {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { field: "name", message: "Name is required" };
  }

  if (trimmed.length < NAME_MIN_LENGTH) {
    return {
      field: "name",
      message: `Name must be at least ${NAME_MIN_LENGTH} characters`,
    };
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return {
      field: "name",
      message: `Name must not exceed ${NAME_MAX_LENGTH} characters`,
    };
  }

  return null;
}

/**
 * Validates an email string according to backend rules
 * Returns null if email is empty (optional field)
 */
export function validateEmail(email: string): ValidationError | null {
  const trimmed = email.trim();

  // Email is optional, so empty is valid
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length < EMAIL_MIN_LENGTH) {
    return {
      field: "email",
      message: `Email must be at least ${EMAIL_MIN_LENGTH} characters`,
    };
  }

  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return {
      field: "email",
      message: `Email must not exceed ${EMAIL_MAX_LENGTH} characters`,
    };
  }

  // Basic email format validation
  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return {
      field: "email",
      message: "Email must contain exactly one @ symbol",
    };
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain) {
    return { field: "email", message: "Invalid email format" };
  }

  if (!domain.includes(".")) {
    return { field: "email", message: "Email domain must contain a dot" };
  }

  return null;
}

/**
 * Validates a complete profile
 */
export function validateProfile(profile: {
  name: string;
  email?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const nameError = validateName(profile.name);
  if (nameError) {
    errors.push(nameError);
  }

  if (profile.email) {
    const emailError = validateEmail(profile.email);
    if (emailError) {
      errors.push(emailError);
    }
  }

  return errors;
}
