package com.RNAppleAuthentication

data class SignInWithAppleConfiguration private constructor(
  val clientId: String,
  val redirectUri: String,
  val scope: String,
  val responseType: String,
  val state: String,
  val nonce: String
) {
  class Builder {
    private lateinit var clientId: String
    private lateinit var redirectUri: String
    private lateinit var scope: String
    private lateinit var responseType: String
    private lateinit var state: String
    private lateinit var nonce: String

    fun clientId(clientId: String) = apply {
      this.clientId = clientId
    }

    fun redirectUri(redirectUri: String) = apply {
      this.redirectUri = redirectUri
    }

    fun scope(scope: Scope) = apply {
      this.scope = scope.signal()
    }

    fun responseType(type: ResponseType) = apply {
      this.responseType = type.signal()
    }

    fun state(state: String) = apply {
      this.state = state
    }

    fun nonce(nonce: String) = apply {
      this.nonce = nonce
    }

    fun build() = SignInWithAppleConfiguration(clientId, redirectUri, scope, responseType, state, nonce)
  }

  enum class ResponseType {
    CODE {
      override fun signal() = "code"
    },

    ID_TOKEN {
      override fun signal() = "id_token"
    },

    ALL {
      override fun signal() = "code id_token"
    };

    abstract fun signal(): String
  }

  enum class Scope {
    NAME {
      override fun signal() = "name"
    },

    EMAIL {
      override fun signal() = "email"
    },

    ALL {
      override fun signal() = "name email"
    };

    abstract fun signal(): String
  }
}
