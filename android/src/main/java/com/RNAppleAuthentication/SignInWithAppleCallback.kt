package com.RNAppleAuthentication

interface SignInWithAppleCallback {
  fun onSignInWithAppleSuccess(code: String, id_token: String, state: String, user: String)
  fun onSignInWithAppleFailure(error: Throwable)
  fun onSignInWithAppleCancel()
}

internal fun SignInWithAppleCallback.toFunction(): (SignInWithAppleResult) -> Unit = { result ->
  when (result) {
    is SignInWithAppleResult.Success -> onSignInWithAppleSuccess(result.code, result.id_token, result.state, result.user)
    is SignInWithAppleResult.Failure -> onSignInWithAppleFailure(result.error)
    is SignInWithAppleResult.Cancel -> onSignInWithAppleCancel()
  }
}
