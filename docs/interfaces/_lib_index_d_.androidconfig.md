
# Interface: AndroidConfig

## Hierarchy

* **AndroidConfig**

## Index

### Properties

* [clientId](_lib_index_d_.androidconfig.md#clientid)
* [nonce](_lib_index_d_.androidconfig.md#optional-nonce)
* [redirectUri](_lib_index_d_.androidconfig.md#redirecturi)
* [responseType](_lib_index_d_.androidconfig.md#optional-responsetype)
* [scope](_lib_index_d_.androidconfig.md#optional-scope)
* [state](_lib_index_d_.androidconfig.md#optional-state)

## Properties

###  clientId

• **clientId**: *string*

*Defined in [lib/index.d.ts:506](../../lib/index.d.ts#L506)*

The developer’s client identifier, as provided by WWDR.

___

### `Optional` nonce

• **nonce**? : *undefined | string*

*Defined in [lib/index.d.ts:525](../../lib/index.d.ts#L525)*

A String value used to associate a client session with an ID token and mitigate replay attacks.
This value will be SHA256 hashed by the library before being sent to Apple.

___

###  redirectUri

• **redirectUri**: *string*

*Defined in [lib/index.d.ts:510](../../lib/index.d.ts#L510)*

The URI to which the authorization redirects. It must include a domain name, and can’t be an
IP address or localhost.

___

### `Optional` responseType

• **responseType**? : *[AndroidResponseType](../enums/_lib_index_d_.androidresponsetype.md)*

*Defined in [lib/index.d.ts:513](../../lib/index.d.ts#L513)*

The type of response requested.

___

### `Optional` scope

• **scope**? : *[AndroidScope](../enums/_lib_index_d_.androidscope.md)*

*Defined in [lib/index.d.ts:516](../../lib/index.d.ts#L516)*

The amount of user information requested from Apple.

___

### `Optional` state

• **state**? : *undefined | string*

*Defined in [lib/index.d.ts:519](../../lib/index.d.ts#L519)*

The current state of the request.
