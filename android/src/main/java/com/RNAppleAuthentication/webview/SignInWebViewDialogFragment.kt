package com.RNAppleAuthentication.webview

import android.annotation.SuppressLint
import android.content.DialogInterface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.webkit.WebView
import androidx.fragment.app.DialogFragment
import com.RNAppleAuthentication.FormInterceptorInterface
import com.RNAppleAuthentication.R
import com.RNAppleAuthentication.SignInWithAppleResult
import com.RNAppleAuthentication.SignInWithAppleService

@SuppressLint("SetJavaScriptEnabled")
internal class SignInWebViewDialogFragment : DialogFragment() {
  companion object {
    private const val AUTHENTICATION_ATTEMPT_KEY = "authenticationAttempt"
    private const val WEB_VIEW_KEY = "webView"

    fun newInstance(authenticationAttempt: SignInWithAppleService.AuthenticationAttempt): SignInWebViewDialogFragment {
      val fragment = SignInWebViewDialogFragment()
      fragment.arguments = Bundle().apply {
        putParcelable(AUTHENTICATION_ATTEMPT_KEY, authenticationAttempt)
      }
      return fragment
    }
  }

  private lateinit var authenticationAttempt: SignInWithAppleService.AuthenticationAttempt
  private var callback: ((SignInWithAppleResult) -> Unit)? = null
  private val webViewIfCreated: WebView? get() = view as? WebView

  fun configure(callback: (SignInWithAppleResult) -> Unit) {
    this.callback = callback
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    authenticationAttempt = arguments?.getParcelable(AUTHENTICATION_ATTEMPT_KEY)!!
    setStyle(STYLE_NORMAL, R.style.sign_in_with_apple_button_DialogTheme)
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    super.onCreateView(inflater, container, savedInstanceState)

    val webView = WebView(context).apply {
      settings.apply {
        javaScriptEnabled = true
        javaScriptCanOpenWindowsAutomatically = true
      }
    }

    val formInterceptorInterface = FormInterceptorInterface(authenticationAttempt.state, ::onCallback)
    webView.addJavascriptInterface(formInterceptorInterface, FormInterceptorInterface.NAME)

    webView.webViewClient = SignInWebViewClient(
      authenticationAttempt,
      FormInterceptorInterface.JS_TO_INJECT
    )

    if (savedInstanceState != null) {
      savedInstanceState.getBundle(WEB_VIEW_KEY)?.run {
        webView.restoreState(this)
      }
    } else {
      webView.loadUrl(authenticationAttempt.authenticationUri)
    }

    return webView
  }

  override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putBundle(
      WEB_VIEW_KEY,
      Bundle().apply {
        webViewIfCreated?.saveState(this)
      }
    )
  }

  override fun onStart() {
    super.onStart()
    dialog?.window?.setLayout(MATCH_PARENT, MATCH_PARENT)
  }

  override fun onCancel(dialog: DialogInterface) {
    super.onCancel(dialog)
    onCallback(SignInWithAppleResult.Cancel)
  }

  private fun onCallback(result: SignInWithAppleResult) {
    dialog?.dismiss()
    val callback = callback
    if (callback == null) {
      return
    }
    callback(result)
  }
}
