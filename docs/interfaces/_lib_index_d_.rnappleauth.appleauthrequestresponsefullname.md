# Interface: AppleAuthRequestResponseFullName

An optional full name shared by the user.

These fields are populated with values that the user authorized.

## What is it?

The response object (`responseObject.fullname`) passed back from apple as the credential provider.

```js
import appleAuth, {
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';

async function onPressAppleButton() {
  /**
   * responseObject may contain the following depending on the user's input when authenticating:
   * responseObject.fullname.familyName
   * responseObject.fullname.givenName
   * responseObject.fullname.middleName
   * responseObject.fullname.namePrefix
   * responseObject.fullname.nameSuffix
   * responseObject.fullname.nickname
   */

  const responseObject = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  });
}
```

## Index

### Properties

- [familyName](_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md#familyname)
- [givenName](_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md#givenname)
- [middleName](_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md#middlename)
- [namePrefix](_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md#nameprefix)
- [nameSuffix](_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md#namesuffix)
- [nickname](_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md#nickname)

## Properties

### familyName

• **familyName**: _string | null_

_Defined in [lib/index.d.ts:258](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L258)_

Name passed from one generation to another to indicate lineage, e.g. Appleseed

---

### givenName

• **givenName**: _string | null_

_Defined in [lib/index.d.ts:248](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L248)_

Name bestowed upon an individual by one's parents, e.g. Johnathan

---

### middleName

• **middleName**: _string | null_

_Defined in [lib/index.d.ts:253](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L253)_

Secondary given name chosen to differentiate those with the same first name, e.g. Maple

---

### namePrefix

• **namePrefix**: _string | null_

_Defined in [lib/index.d.ts:243](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L243)_

Pre-nominal letters denoting title, salutation, or honorific, e.g. Dr., Mr.

---

### nameSuffix

• **nameSuffix**: _string | null_

_Defined in [lib/index.d.ts:263](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L263)_

Post-nominal letters denoting degree, accreditation, or other honor, e.g. Esq., Jr., Ph.D.

---

### nickname

• **nickname**: _string | null_

_Defined in [lib/index.d.ts:268](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L268)_

Name substituted for the purposes of familiarity, e.g. "Johnny"
