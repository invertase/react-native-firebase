package com.RNAppleAuthentication;

import android.app.Activity;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import com.RNAppleAuthentication.SignInWithAppleCallback;
import com.RNAppleAuthentication.SignInWithAppleConfiguration;
import com.RNAppleAuthentication.SignInWithAppleService;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.security.MessageDigest;

public class AppleAuthenticationAndroidModule extends ReactContextBaseJavaModule {
    private static final String E_NOT_CONFIGURED_ERROR = "E_NOT_CONFIGURED_ERROR";
    private static final String E_SIGNIN_FAILED_ERROR = "E_SIGNIN_FAILED_ERROR";
    private static final String E_SIGNIN_CANCELLED_ERROR = "E_SIGNIN_CANCELLED_ERROR";

    private final ReactApplicationContext reactContext;

    private @Nullable
    SignInWithAppleConfiguration configuration;

    public AppleAuthenticationAndroidModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNAppleAuthModuleAndroid";
    }

    private static String bytesToHex(byte[] hash) {
        StringBuffer hexString = new StringBuffer();
        for (int i=0; i < hash.length; i++) {
            hexString.append(Character.forDigit((hash[i] >> 4) & 0xF, 16));
            hexString.append(Character.forDigit((hash[i] & 0xF), 16));
        }
        return hexString.toString();
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> ResponseType = new HashMap<>();
        ResponseType.put("ALL", SignInWithAppleConfiguration.ResponseType.ALL.toString());
        ResponseType.put("CODE", SignInWithAppleConfiguration.ResponseType.CODE.toString());
        ResponseType.put("ID_TOKEN", SignInWithAppleConfiguration.ResponseType.ID_TOKEN.toString());

        final Map<String, Object> Scope = new HashMap<>();
        Scope.put("ALL", SignInWithAppleConfiguration.Scope.ALL.toString());
        Scope.put("EMAIL", SignInWithAppleConfiguration.Scope.EMAIL.toString());
        Scope.put("NAME", SignInWithAppleConfiguration.Scope.NAME.toString());

        final Map<String, Object> constants = new HashMap<>();
        constants.put(E_NOT_CONFIGURED_ERROR, E_NOT_CONFIGURED_ERROR);
        constants.put(E_SIGNIN_FAILED_ERROR, E_SIGNIN_FAILED_ERROR);
        constants.put(E_SIGNIN_CANCELLED_ERROR, E_SIGNIN_CANCELLED_ERROR);

        constants.put("ResponseType", ResponseType);
        constants.put("Scope", Scope);

        return constants;
    }

    private @Nullable
    FragmentManager getFragmentManagerHelper() {
        Activity activity = getCurrentActivity();
        if (activity == null || !(activity instanceof FragmentActivity)) {
            return null;
        }
        return ((FragmentActivity) activity).getSupportFragmentManager();
    }

    @ReactMethod
    public void configure(ReadableMap configObject) {
        String clientId = "";
        String redirectUri = "";
        SignInWithAppleConfiguration.Scope scope = SignInWithAppleConfiguration.Scope.ALL;
        SignInWithAppleConfiguration.ResponseType responseType = SignInWithAppleConfiguration.ResponseType.ALL;
        String state = UUID.randomUUID().toString();
        String nonce = "";

        if (configObject.hasKey("clientId")) {
            clientId = configObject.getString("clientId");
        }

        if (configObject.hasKey("redirectUri")) {
            redirectUri = configObject.getString("redirectUri");
        }

        if (configObject.hasKey("scope")) {
            String scopeString = configObject.getString("scope");
            if (scopeString != null) {
                scope = SignInWithAppleConfiguration.Scope.valueOf(scopeString);
            }
        }

        if (configObject.hasKey("responseType")) {
            String responseTypeString = configObject.getString("responseType");
            if (responseTypeString != null) {
                responseType = SignInWithAppleConfiguration.ResponseType.valueOf(responseTypeString);
            }
        }

        if (configObject.hasKey("state")) {
            state = configObject.getString("state");
        }

        if (configObject.hasKey("nonce")) {
            // SHA256 of the nonce to keep in line with the iOS library (and avoid confusion)
            try {
              MessageDigest md = MessageDigest.getInstance("SHA-256");
              md.update(configObject.getString("nonce").getBytes());
              byte[] digest = md.digest();
              nonce = bytesToHex(digest);
            } catch (Exception e) {
            }
        }

        this.configuration = new SignInWithAppleConfiguration.Builder()
                .clientId(clientId)
                .redirectUri(redirectUri)
                .responseType(SignInWithAppleConfiguration.ResponseType.ALL)
                .scope(SignInWithAppleConfiguration.Scope.ALL)
                .state(state)
                .nonce(nonce)
                .build();
    }

    @ReactMethod
    public void signIn(final Promise promise) {
        if (this.configuration == null) {
            promise.reject(E_NOT_CONFIGURED_ERROR);
            return;
        }
        FragmentManager fragmentManager = this.getFragmentManagerHelper();

        if (fragmentManager == null) {
            promise.reject(E_NOT_CONFIGURED_ERROR);
            return;
        }

        SignInWithAppleCallback callback = new SignInWithAppleCallback() {
            @Override
            public void onSignInWithAppleSuccess(@NonNull String code, @NonNull String id_token, @NonNull String state, @NonNull String user) {
                WritableMap response = Arguments.createMap();
                response.putString("code", code);
                response.putString("id_token", id_token);
                response.putString("state", state);

                try {
                    JSONObject userJSON = new JSONObject(user);
                    WritableMap userMap = Arguments.createMap();
                    if (userJSON.has("name")) {
                        JSONObject nameJSON = userJSON.getJSONObject("name");
                        WritableMap nameMap = Arguments.createMap();
                        if (nameJSON.has("firstName")) {
                            nameMap.putString("firstName", nameJSON.getString("firstName"));
                        }
                        if (nameJSON.has("lastName")) {
                            nameMap.putString("lastName", nameJSON.getString("lastName"));
                        }
                        if (nameMap.hasKey("firstName") || nameMap.hasKey("lastName")) {
                            userMap.putMap("name", nameMap);
                        }
                    }
                    if (userJSON.has("email")) {
                        userMap.putString("email", userJSON.getString("email"));
                    }
                    if (userMap.hasKey("name") || userMap.hasKey("email")) {
                        response.putMap("user", userMap);
                    }
                } catch (Exception e) {
                }
                promise.resolve(response);
            }

            @Override
            public void onSignInWithAppleFailure(@NonNull Throwable error) {
                promise.reject(E_SIGNIN_FAILED_ERROR, error);
            }

            @Override
            public void onSignInWithAppleCancel() {
                promise.reject(E_SIGNIN_CANCELLED_ERROR);
            }
        };

        String fragmentTag = "SignInWithAppleButton-$id-SignInWebViewDialogFragment";
        SignInWithAppleService service = new SignInWithAppleService(
                fragmentManager,
                fragmentTag,
                configuration,
                callback
        );

        service.show();
    }
}
