/**
 * Maps Firebase authentication error codes to i18n translation keys.
 * Never outputs raw error codes or stack traces to the user.
 */
export function getFriendlyAuthErrorMessage(errorCode?: string): string {
  if (!errorCode) return 'auth.errors.generic';

  switch (errorCode) {
    case 'auth/invalid-email':
      return 'auth.errors.invalidEmail';
    case 'auth/user-disabled':
      return 'auth.errors.userDisabled';
    case 'auth/user-not-found':
      return 'auth.errors.userNotFound';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'auth.errors.wrongPassword';
    case 'auth/email-already-in-use':
      return 'auth.errors.emailInUse';
    case 'auth/weak-password':
      return 'auth.errors.weakPassword';
    case 'auth/too-many-requests':
      return 'auth.errors.tooManyAttempts';
    case 'auth/network-request-failed':
      return 'auth.errors.networkError';
    case 'auth/popup-closed-by-user':
      return 'auth.errors.popupClosed';
    case 'auth/popup-blocked':
      return 'auth.errors.popupBlocked';
    case 'auth/unconfigured':
      return 'auth.errors.notConfigured';
    default:
      return 'auth.errors.generic';
  }
}

