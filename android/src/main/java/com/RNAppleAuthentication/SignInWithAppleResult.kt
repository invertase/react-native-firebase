package com.RNAppleAuthentication

sealed class SignInWithAppleResult {
  data class Success(val code: String, val id_token: String, val state: String, val user: String) : SignInWithAppleResult()
  data class Failure(val error: Throwable) : SignInWithAppleResult()

  object Cancel : SignInWithAppleResult()
}
