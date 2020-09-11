package com.RNAppleAuthentication

import android.net.Uri
import android.os.Parcel
import android.os.Parcelable
import androidx.fragment.app.FragmentManager
import com.RNAppleAuthentication.webview.SignInWebViewDialogFragment

class SignInWithAppleService(
  private val fragmentManager: FragmentManager,
  private val fragmentTag: String,
  private val configuration: SignInWithAppleConfiguration,
  private val callback: (SignInWithAppleResult) -> Unit
) {
  constructor(
    fragmentManager: FragmentManager,
    fragmentTag: String,
    configuration: SignInWithAppleConfiguration,
    callback: SignInWithAppleCallback
  ) : this(fragmentManager, fragmentTag, configuration, callback.toFunction())

  init {
    val fragmentIfShown = fragmentManager.findFragmentByTag(fragmentTag) as? SignInWebViewDialogFragment
    fragmentIfShown?.configure(callback)
  }

  internal data class AuthenticationAttempt(
    val authenticationUri: String,
    val redirectUri: String,
    val state: String
  ) : Parcelable {
    constructor(parcel: Parcel) : this(
      parcel.readString() ?: "invalid",
      parcel.readString() ?: "invalid",
      parcel.readString() ?: "invalid"
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
      parcel.writeString(authenticationUri)
      parcel.writeString(redirectUri)
      parcel.writeString(state)
    }

    override fun describeContents(): Int {
      return 0
    }

    companion object CREATOR : Parcelable.Creator<AuthenticationAttempt> {
      override fun createFromParcel(parcel: Parcel) = AuthenticationAttempt(parcel)
      override fun newArray(size: Int): Array<AuthenticationAttempt?> = arrayOfNulls(size)

      /**
       * Build an Apple URL that supports `form_post` by intercepting the response
       * with `FormInterceptorInterface`.
       * [Sign In With Apple Javascript SDK](https://developer.apple.com/documentation/signinwithapplejs/configuring_your_webpage_for_sign_in_with_apple).
       */
      fun create(configuration: SignInWithAppleConfiguration): AuthenticationAttempt {
        val authenticationUri = Uri
          .parse("https://appleid.apple.com/auth/authorize")
          .buildUpon().apply {
            appendQueryParameter("client_id", configuration.clientId)
            appendQueryParameter("redirect_uri", configuration.redirectUri)
            appendQueryParameter("response_type", configuration.responseType)
            appendQueryParameter("scope", configuration.scope)
            appendQueryParameter("response_mode", "form_post")
            appendQueryParameter("state", configuration.state)
            if (!configuration.nonce.isBlank()) {
              appendQueryParameter("nonce", configuration.nonce)
            }
          }
          .build()
          .toString()

        return AuthenticationAttempt(authenticationUri, configuration.redirectUri, configuration.state)
      }
    }
  }

  fun show() {
    val fragment = SignInWebViewDialogFragment.newInstance(AuthenticationAttempt.create(configuration))
    fragment.configure(callback)
    fragment.show(fragmentManager, fragmentTag)
  }
}
