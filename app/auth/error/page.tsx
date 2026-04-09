export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessages: Record<string, string> = {
    Callback: 'There was a problem with the authentication provider.',
    OAuthSignin: 'Error connecting to the OAuth provider.',
    OAuthCallback: 'Error in the OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth user account.',
    EmailCreateAccount: 'Could not create email user account.',
    Callback: 'There was a callback error.',
    OAuthAccountNotLinked: 'Email already associated with another account.',
    EmailSignInError: 'Email sign-in failed.',
    CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
    SessionCallback: 'Session callback error.',
    default: 'An unexpected error occurred.',
  };

  const error = searchParams.error || 'default';
  const message = errorMessages[error] || errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
        </div>

        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{message}</div>
        </div>

        <div className="text-center">
          <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
