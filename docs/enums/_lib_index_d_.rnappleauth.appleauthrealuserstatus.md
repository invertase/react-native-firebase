
# Enumeration: AppleAuthRealUserStatus

Possible values for the real user indicator.

**`url`** https://developer.apple.com/documentation/authenticationservices/asuserdetectionstatus

## Index

### Enumeration members

* [LIKELY_REAL](_lib_index_d_.rnappleauth.appleauthrealuserstatus.md#likely_real)
* [UNKNOWN](_lib_index_d_.rnappleauth.appleauthrealuserstatus.md#unknown)
* [UNSUPPORTED](_lib_index_d_.rnappleauth.appleauthrealuserstatus.md#unsupported)

## Enumeration members

###  LIKELY_REAL

• **LIKELY_REAL**:

*Defined in [lib/index.d.ts:165](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L165)*

A hint that there's high confidence that the user is real.

___

###  UNKNOWN

• **UNKNOWN**:

*Defined in [lib/index.d.ts:160](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L160)*

Could not determine the value.

New users in the ecosystem will get this value as well, so you should not blacklist but
instead treat these users as any new user through standard email sign up flows

___

###  UNSUPPORTED

• **UNSUPPORTED**:

*Defined in [lib/index.d.ts:152](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L152)*

Not supported on current platform, ignore the value.
