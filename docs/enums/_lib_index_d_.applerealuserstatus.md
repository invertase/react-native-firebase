
# Enumeration: AppleRealUserStatus

## Index

### Enumeration members

* [LIKELY_REAL](_lib_index_d_.applerealuserstatus.md#likely_real)
* [UNKNOWN](_lib_index_d_.applerealuserstatus.md#unknown)
* [UNSUPPORTED](_lib_index_d_.applerealuserstatus.md#unsupported)

## Enumeration members

###  LIKELY_REAL

• **LIKELY_REAL**: = 2

*Defined in [lib/index.d.ts:199](../../lib/index.d.ts#L199)*

A hint that there's high confidence that the user is real.

___

###  UNKNOWN

• **UNKNOWN**: = 1

*Defined in [lib/index.d.ts:194](../../lib/index.d.ts#L194)*

Could not determine the value.

New users in the ecosystem will get this value as well, so you should not blacklist but
instead treat these users as any new user through standard email sign up flows

___

###  UNSUPPORTED

• **UNSUPPORTED**: = 0

*Defined in [lib/index.d.ts:186](../../lib/index.d.ts#L186)*

Not supported on current platform, ignore the value.
