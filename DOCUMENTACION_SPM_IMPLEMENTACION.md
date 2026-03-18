# Documentacion Completa: Soporte Dual SPM + CocoaPods para Firebase en React Native

> **Fecha:** 2026-03-17
> **Rama:** `feature/spm-dependency-support`
> **Repositorio:** `jsnavarroc/react-native-firebase` (fork de `invertase/react-native-firebase`)
> **Firebase SDK:** 12.10.0
> **React Native minimo para SPM:** 0.75+

---

## Tabla de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura de la Solucion](#2-arquitectura-de-la-solucion)
3. [Cambios Realizados](#3-cambios-realizados)
4. [Referencia de Funciones y Parametros](#4-referencia-de-funciones-y-parametros)
5. [Guia de Integracion — Proyecto Legacy](#5-guia-de-integracion--proyecto-legacy)
6. [Guia de Integracion — Proyectos que requieren actualizar SPM](#6-guia-de-integracion--proyectos-que-requieren-actualizar-spm)
7. [Glosario](#7-glosario)

---

## 1. Resumen Ejecutivo

### Que problema resuelve

Cuando Apple lanzo **Xcode 26** (2026), introdujo un cambio importante: el compilador Swift ahora usa **"modulos explicitos"** por defecto. Esto significa que el compilador necesita saber exactamente donde esta cada modulo (cada libreria) antes de compilar.

El problema es que **Firebase iOS SDK**, cuando se instala a traves de **CocoaPods** (el gestor de dependencias tradicional de iOS), tiene modulos internos (`FirebaseCoreInternal`, `FirebaseSharedSwift`) que **no estan expuestos como productos publicos**. En Xcode 16, esto no era un problema porque el compilador los encontraba automaticamente. En Xcode 26, el compilador ya no los busca por su cuenta y lanza errores de compilacion.

**La solucion:** Usar **Swift Package Manager (SPM)** como metodo principal para resolver dependencias de Firebase. SPM es el gestor de paquetes nativo de Apple y maneja correctamente la visibilidad de modulos internos. Como alternativa, se mantiene CocoaPods para proyectos que lo necesiten, con un workaround (`SWIFT_ENABLE_EXPLICIT_MODULES=NO`).

### Que se implemento

Un **sistema de resolucion dual de dependencias** que permite elegir entre SPM y CocoaPods para Firebase, de forma transparente, sin cambiar el codigo de la app. El sistema:

1. **Detecta automaticamente** si SPM esta disponible (React Native >= 0.75)
2. **Usa SPM por defecto** cuando esta disponible
3. **Cae a CocoaPods** cuando SPM no esta disponible o cuando se desactiva explicitamente
4. **No requiere cambios** en el codigo JavaScript/TypeScript de la app
5. **No requiere cambios** en el codigo nativo (Objective-C/Swift) de la app

### Puntos criticos antes de integrar

| Punto | Detalle |
|-------|---------|
| **Linkage** | SPM requiere **dynamic linkage**. CocoaPods requiere **static linkage**. No se pueden mezclar. |
| **Xcode 26** | Si usas CocoaPods con Xcode 26, DEBES agregar `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'` en tu Podfile post_install. |
| **React Native < 0.75** | Solo funciona con CocoaPods (SPM no esta disponible en versiones anteriores). |
| **Simbolos duplicados** | Si usas SPM con `static linkage`, cada pod embebe los productos SPM de Firebase → linker error por simbolos duplicados. Por eso SPM = dynamic. |
| **FirebaseCoreExtension** | Algunos paquetes (Messaging, Crashlytics) necesitan `FirebaseCoreExtension` como dependencia explicita en CocoaPods, pero SPM lo resuelve automaticamente como dependencia transitiva. |

---

## 2. Arquitectura de la Solucion

### 2.1 Diagrama del Flujo de Decision

```
                    ┌─────────────────────────┐
                    │    pod install / build  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Podspec carga          │
                    │  firebase_spm.rb        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ ¿spm_dependency() esta  │
                    │  definida? (RN >= 0.75) │
                    └──────┬──────────┬───────┘
                           │          │
                          SI         NO
                           │          │
              ┌────────────▼──┐   ┌──▼─────────────────┐
              │ ¿$RNFirebase  │   │ Usar CocoaPods     │
              │  DisableSPM   │   │ spec.dependency()  │
              │  esta activo? │   └────────────────────┘
              └───┬───────┬───┘
                  │       │
                 SI      NO
                  │       │
     ┌────────────▼──┐  ┌─▼──────────────────┐
     │ Usar CocoaPods│  │ Usar SPM           │
     │ (forzado)     │  │ spm_dependency()   │
     └───────────────┘  └────────────────────┘
```

### 2.2 Componentes del Sistema

El sistema tiene **5 componentes** que interactuan entre si:

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENTE CENTRAL                           │
│  packages/app/firebase_spm.rb                                   │
│  → Define la funcion firebase_dependency()                      │
│  → Lee la URL de SPM desde package.json                         │
│  → Decide automaticamente: SPM o CocoaPods                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ es requerido por
          ┌──────────────────┼────────────────┐
          │                  │                │
  ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
  │  16 Podspecs │  │ package.json │  │  43 archivos │
  │  (*.podspec) │  │  sdkVersions │  │  nativos iOS │
  │              │  │              │  │  (.h, .m)    │
  │ Cada uno     │  │ Define:      │  │              │
  │ llama a      │  │ - version    │  │ Usan #if     │
  │ firebase_    │  │   Firebase   │  │ __has_include│
  │ dependency() │  │ - URL SPM    │  │ para imports │
  └──────────────┘  └──────────────┘  │ duales       │
          │                           └──────────────┘
          │
  ┌───────▼──────────────────────────────────────────┐
  │  CI/CD: tests_e2e_ios.yml                        │
  │  → Prueba AMBOS modos en cada PR                 │
  │  → Matriz: spm × cocoapods × debug × release     │
  └──────────────────────────────────────────────────┘
```

### 2.3 Decisiones de Diseno y su Justificacion

| Decision | Justificacion |
|----------|--------------|
| **SPM como default** | Apple impulsa SPM como el estandar. Xcode 26 funciona mejor con SPM. La comunidad iOS esta migrando a SPM. |
| **Mantener CocoaPods como fallback** | Muchos proyectos legacy dependen de CocoaPods. React Native < 0.75 no soporta SPM. Algunos setups (static frameworks) necesitan CocoaPods. |
| **Una sola funcion helper** | En lugar de modificar cada podspec individualmente, se centraliza la logica en `firebase_dependency()`. Si cambia la logica, se cambia en un solo lugar. |
| **URL de SPM en package.json** | Single source of truth: la version de Firebase y la URL de SPM estan en un solo archivo. Evita desincronizacion entre paquetes. |
| **Flag `$RNFirebaseDisableSPM`** | Escape hatch: si algo falla con SPM, el usuario puede volver a CocoaPods con una sola linea en el Podfile. |
| **Dynamic linkage para SPM** | Evita que cada pod embeba una copia de los productos SPM de Firebase (lo que causa "duplicate symbols" en static). |
| **`SWIFT_ENABLE_EXPLICIT_MODULES=NO` para CocoaPods** | Permite que el compilador Swift use descubrimiento implicito de modulos (como Xcode 16), evitando errores con modulos internos de Firebase. |
| **`#if __has_include` en codigo nativo** | Permite que el mismo archivo .m/.h compile tanto con SPM (headers de framework) como con CocoaPods (@import). Sin cambios en el codigo de la app. |

---

## 3. Cambios Realizados

### 3.1 `packages/app/firebase_spm.rb` — El Cerebro del Sistema

- **Que es:** Un archivo Ruby que define una funcion helper
- **Donde:** `packages/app/firebase_spm.rb`
- **Por que existe:** Porque cada paquete de react-native-firebase (auth, analytics, messaging, etc.) tiene un archivo `.podspec` que declara sus dependencias iOS. Antes, cada uno hacia `s.dependency 'Firebase/Auth', version` directamente. Ahora, todos llaman a `firebase_dependency()` que decide si usar SPM o CocoaPods.
- **Para que sirve:** Centralizar la logica de decision SPM vs CocoaPods en un solo lugar
- **Como funciona:**

```ruby
# PASO 1: Lee la URL del repositorio SPM de Firebase desde package.json
# Esto se ejecuta UNA sola vez cuando se carga el archivo
$firebase_spm_url ||= begin
  app_package_path = File.join(__dir__, 'package.json')
  app_package = JSON.parse(File.read(app_package_path))
  app_package['sdkVersions']['ios']['firebaseSpmUrl']
  # Resultado: "https://github.com/firebase/firebase-ios-sdk.git"
end

# PASO 2: Funcion que cada podspec llama
def firebase_dependency(spec, version, spm_products, pods)

  # Condicion 1: ¿Existe la funcion spm_dependency?
  #   → SI existe si React Native >= 0.75 (ellos la agregaron)
  #   → NO existe si React Native < 0.75
  #
  # Condicion 2: ¿El usuario NO definio $RNFirebaseDisableSPM?
  #   → Si el usuario puso $RNFirebaseDisableSPM = true en su Podfile,
  #     esta variable EXISTE y la condicion es falsa

  if defined?(spm_dependency) && !defined?($RNFirebaseDisableSPM)
    # RUTA SPM: Registra la dependencia via Swift Package Manager
    spm_dependency(spec,
      url: $firebase_spm_url,
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: version },
      products: spm_products
    )
  else
    # RUTA COCOAPODS: Registra la dependencia via CocoaPods tradicional
    pods = [pods] unless pods.is_a?(Array)  # Normaliza a array
    pods.each do |pod|
      spec.dependency pod, version
    end
  end
end
```

**Detalle linea por linea:**

| Linea | Codigo | Que hace |
|-------|--------|----------|
| 22 | `$firebase_spm_url \|\|= begin` | Variable global Ruby. El `\|\|=` significa "asigna solo si no tiene valor". Se ejecuta una vez. |
| 23 | `File.join(__dir__, 'package.json')` | Construye la ruta al package.json del paquete `app`. `__dir__` es el directorio donde esta este archivo. |
| 24 | `JSON.parse(File.read(...))` | Lee y parsea el JSON del package.json |
| 25 | `['sdkVersions']['ios']['firebaseSpmUrl']` | Extrae la URL: `https://github.com/firebase/firebase-ios-sdk.git` |
| 44 | `def firebase_dependency(spec, version, spm_products, pods)` | Define la funcion con 4 parametros |
| 45 | `if defined?(spm_dependency) && !defined?($RNFirebaseDisableSPM)` | Doble condicion: SPM disponible Y no deshabilitado |
| 46 | `if defined?(Pod) && defined?(Pod::UI)` | Guard: solo imprime log si estamos dentro de CocoaPods (no en tests) |
| 50-54 | `spm_dependency(spec, url:..., requirement:..., products:...)` | Llama a la funcion de React Native para registrar dependencia SPM |
| 65 | `pods = [pods] unless pods.is_a?(Array)` | Si `pods` es un string, lo convierte a array de un elemento |
| 66-68 | `pods.each { \|pod\| spec.dependency pod, version }` | Registra cada pod como dependencia CocoaPods |

### 3.2 `packages/app/__tests__/firebase_spm_test.rb` — Tests Unitarios

- **Que es:** Archivo de tests en Ruby usando el framework Minitest
- **Donde:** `packages/app/__tests__/firebase_spm_test.rb`
- **Por que existe:** Para verificar que la logica de decision SPM vs CocoaPods funciona correctamente en CI sin necesidad de un proyecto iOS real
- **Para que sirve:** Detectar regresiones si alguien modifica `firebase_spm.rb`
- **Como funciona:**

```ruby
# MockSpec simula un Pod::Specification de CocoaPods
# Captura las llamadas a .dependency() para poder verificarlas
class MockSpec
  attr_reader :dependencies  # Array donde se guardan las dependencias registradas

  def dependency(name, version)
    @dependencies << { name: name, version: version }
  end
end
```

**Los 5 tests:**

| Test | Que verifica | Como lo verifica |
|------|-------------|-----------------|
| `test_cocoapods_single_pod` | Que cuando SPM NO esta disponible, se usa CocoaPods con un solo pod | Llama a `firebase_dependency` sin definir `spm_dependency`. Verifica que `spec.dependencies` tiene 1 entrada: `Firebase/Auth` |
| `test_cocoapods_multiple_pods` | Que cuando SPM NO esta disponible, se registran multiples pods | Pasa un array `['Firebase/Crashlytics', 'FirebaseCoreExtension']`. Verifica que ambos se registran. |
| `test_spm_single_product` | Que cuando SPM SI esta disponible, se llama a `spm_dependency` | Define un mock de `spm_dependency` como metodo global. Verifica que se llama con los parametros correctos (URL, version, products). |
| `test_spm_multiple_products_ignores_cocoapods_extras` | Que SPM solo usa los productos SPM, no los pods extra | Pasa `['FirebaseCrashlytics']` como SPM y `['Firebase/Crashlytics', 'FirebaseCoreExtension']` como CocoaPods. Verifica que solo `FirebaseCrashlytics` se registra via SPM. |
| `test_reads_spm_url_from_package_json` | Que la URL se lee correctamente del package.json | Verifica que `$firebase_spm_url == 'https://github.com/firebase/firebase-ios-sdk.git'` |

### 3.3 `packages/app/package.json` — Fuente de Verdad

- **Que es:** El package.json del paquete `@react-native-firebase/app`
- **Donde:** `packages/app/package.json`
- **Que se agrego:** Un campo `firebaseSpmUrl` dentro de `sdkVersions.ios`
- **Por que:** Para que la URL del repositorio SPM de Firebase este en un solo lugar, no hardcodeada en multiples archivos
- **Para que sirve:** `firebase_spm.rb` lee este campo para saber de donde descargar Firebase via SPM

```json
{
  "sdkVersions": {
    "ios": {
      "firebase": "12.10.0",
      "firebaseSpmUrl": "https://github.com/firebase/firebase-ios-sdk.git",
      "iosTarget": "15.0",
      "macosTarget": "10.15",
      "tvosTarget": "15.0"
    }
  }
}
```

| Campo | Tipo | Que es |
|-------|------|--------|
| `firebase` | String | Version del Firebase iOS SDK. Usada por todos los podspecs. |
| `firebaseSpmUrl` | String | URL del repositorio git de Firebase para SPM. |
| `iosTarget` | String | Version minima de iOS soportada. |
| `macosTarget` | String | Version minima de macOS soportada. |
| `tvosTarget` | String | Version minima de tvOS soportada. |

### 3.4 Los 16 Archivos `.podspec` — Consumidores del Helper

Cada paquete de react-native-firebase tiene un archivo `.podspec` que le dice a CocoaPods como instalarlo. **Todos fueron modificados** para usar `firebase_dependency()` en lugar de `s.dependency` directo.

**Antes (metodo original):**
```ruby
# En RNFBAuth.podspec
s.dependency 'Firebase/Auth', firebase_sdk_version
```

**Despues (con soporte SPM):**
```ruby
# En RNFBAuth.podspec
require '../app/firebase_spm'  # Carga el helper
firebase_dependency(s, firebase_sdk_version, ['FirebaseAuth'], 'Firebase/Auth')
```

**Tabla completa de los 16 paquetes:**

| Paquete | Podspec | Productos SPM | Pods CocoaPods | Notas |
|---------|---------|---------------|----------------|-------|
| **app** | `RNFBApp.podspec` | `['FirebaseCore']` | `'Firebase/CoreOnly'` | Paquete base, requerido por todos |
| **auth** | `RNFBAuth.podspec` | `['FirebaseAuth']` | `'Firebase/Auth'` | Autenticacion |
| **analytics** | `RNFBAnalytics.podspec` | `['FirebaseAnalytics']` | `'FirebaseAnalytics/Core'` | Tiene logica extra para IdentitySupport |
| **messaging** | `RNFBMessaging.podspec` | `['FirebaseMessaging']` | `['Firebase/Messaging', 'FirebaseCoreExtension']` | Necesita 2 pods en CocoaPods |
| **crashlytics** | `RNFBCrashlytics.podspec` | `['FirebaseCrashlytics']` | `['Firebase/Crashlytics', 'FirebaseCoreExtension']` | Necesita 2 pods en CocoaPods |
| **firestore** | `RNFBFirestore.podspec` | `['FirebaseFirestore']` | `'Firebase/Firestore'` | Base de datos NoSQL |
| **database** | `RNFBDatabase.podspec` | `['FirebaseDatabase']` | `'Firebase/Database'` | Realtime Database |
| **storage** | `RNFBStorage.podspec` | `['FirebaseStorage']` | `'Firebase/Storage'` | Almacenamiento de archivos |
| **functions** | `RNFBFunctions.podspec` | `['FirebaseFunctions']` | `'Firebase/Functions'` | Cloud Functions |
| **perf** | `RNFBPerf.podspec` | `['FirebasePerformance']` | `'Firebase/Performance'` | Performance Monitoring |
| **app-check** | `RNFBAppCheck.podspec` | `['FirebaseAppCheck']` | `'Firebase/AppCheck'` | Verificacion de integridad |
| **installations** | `RNFBInstallations.podspec` | `['FirebaseInstallations']` | `'Firebase/Installations'` | IDs de instalacion |
| **remote-config** | `RNFBRemoteConfig.podspec` | `['FirebaseRemoteConfig']` | `'Firebase/RemoteConfig'` | Configuracion remota |
| **in-app-messaging** | `RNFBInAppMessaging.podspec` | `['FirebaseInAppMessaging-Beta']` | `'Firebase/InAppMessaging'` | Mensajes in-app |
| **app-distribution** | `RNFBAppDistribution.podspec` | `['FirebaseAppDistribution-Beta']` | `'Firebase/AppDistribution'` | Distribucion de apps |
| **ml** | `RNFBML.podspec` | *(deshabilitado)* | *(deshabilitado)* | Machine Learning (comentado) |

**¿Por que Messaging y Crashlytics necesitan 2 pods en CocoaPods pero solo 1 producto en SPM?**

Porque `FirebaseCoreExtension` es una dependencia **transitiva** en SPM — cuando instalas `FirebaseMessaging` via SPM, SPM automaticamente incluye `FirebaseCoreExtension`. Pero en CocoaPods, cada dependencia debe declararse explicitamente.

### 3.5 Los 43 Archivos Nativos iOS — Imports Duales

- **Que son:** Archivos `.h` (headers) y `.m`/`.mm` (implementacion) en Objective-C
- **Donde:** Dentro de `packages/*/ios/RNFB*/`
- **Por que se modificaron:** Porque SPM y CocoaPods exponen los headers de Firebase de formas diferentes
- **Para que sirve:** Para que el mismo codigo compile tanto con SPM como con CocoaPods

**Patron de import dual:**

```objc
// ANTES (solo CocoaPods):
#import <Firebase/Firebase.h>  // Header umbrella que incluye todo

// DESPUES (SPM + CocoaPods):
#if __has_include(<Firebase/Firebase.h>)
  // Ruta 1: CocoaPods — el header umbrella existe
  #import <Firebase/Firebase.h>
#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)
  // Ruta 2: SPM — cada modulo tiene su propio header
  #import <FirebaseAuth/FirebaseAuth.h>
  #import <FirebaseCore/FirebaseCore.h>
#else
  // Ruta 3: @import (modulos Clang) — fallback final
  @import FirebaseCore;
  @import FirebaseAuth;
#endif
```

**Explicacion del patron:**

| Directiva | Que hace | Cuando se usa |
|-----------|----------|--------------|
| `#if __has_include(<Firebase/Firebase.h>)` | Pregunta al compilador: "¿existe este header en el proyecto?" | En compilacion. Si CocoaPods instalo Firebase, este header existe. |
| `#import <Firebase/Firebase.h>` | Importa el header umbrella de Firebase (incluye TODO) | Solo con CocoaPods, porque CocoaPods crea este header que agrupa todo. |
| `#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)` | Pregunta: "¿existe el header individual del modulo?" | En compilacion. Si SPM instalo FirebaseAuth, este header existe. |
| `#import <FirebaseAuth/FirebaseAuth.h>` | Importa el header especifico del modulo | Con SPM, porque cada producto SPM tiene su propio namespace. |
| `@import FirebaseAuth;` | Import de modulo Clang (Objective-C modules) | Fallback: funciona en ambos modos pero requiere que modules este habilitado. |

**Archivos modificados por paquete:**

| Paquete | Archivos | Headers importados |
|---------|----------|-------------------|
| auth | `RNFBAuthModule.h`, `RNFBAuthModule.m` | `FirebaseCore`, `FirebaseAuth` |
| analytics | `RNFBAnalyticsModule.m` | `FirebaseCore`, `FirebaseAnalytics` |
| messaging | `RNFBMessagingModule.m`, `RNFBMessagingSerializer.m` | `FirebaseCore`, `FirebaseMessaging` |
| crashlytics | `RNFBCrashlyticsModule.m`, `RNFBCrashlyticsInitProvider.h`, `RNFBCrashlyticsInitProvider.m`, `RNFBCrashlyticsNativeHelper.m` | `FirebaseCore`, `FirebaseCrashlytics`, `FirebaseCoreExtension` |
| firestore | `RNFBFirestoreCommon.h`, `RNFBFirestoreCollectionModule.h`, `RNFBFirestoreSerialize.h`, `RNFBFirestoreSerialize.m`, `RNFBFirestoreQuery.h` | `FirebaseCore`, `FirebaseFirestore` |
| database | `RNFBDatabaseCommon.h`, `RNFBDatabaseQuery.h`, `RNFBDatabaseQueryModule.h`, `RNFBDatabaseReferenceModule.m`, `RNFBDatabaseOnDisconnectModule.m` | `FirebaseCore`, `FirebaseDatabaseInternal` |
| storage | `RNFBStorageModule.m`, `RNFBStorageCommon.h` | `FirebaseCore`, `FirebaseStorage` |
| functions | `RNFBFunctionsModule.mm` | `FirebaseCore`, `FirebaseFunctions` |
| perf | `RNFBPerfModule.m` | `FirebaseCore`, `FirebasePerformance` |
| app-check | `RNFBAppCheckProvider.h`, `RNFBAppCheckModule.m` | `FirebaseCore`, `FirebaseAppCheck` |
| installations | `RNFBInstallationsModule.m` | `FirebaseCore`, `FirebaseInstallations` |
| remote-config | `RNFBRemoteConfigModule.m` | `FirebaseCore`, `FirebaseRemoteConfig` |
| in-app-messaging | `RNFBInAppMessagingModule.m` | `FirebaseCore`, `FirebaseInAppMessaging` |
| app-distribution | `RNFBAppDistributionModule.m` | `FirebaseCore`, `FirebaseAppDistribution` |
| app | `RNFBUtilsModule.m`, `RNFBJSON.m`, `RNFBMeta.m`, `RNFBPreferences.m`, `RNFBSharedUtils.m`, `RNFBRCTAppDelegate.m` | `FirebaseCore` |

### 3.6 `.github/workflows/tests_e2e_ios.yml` — CI con Matriz Dual

- **Que es:** Archivo de GitHub Actions que define los tests end-to-end de iOS
- **Donde:** `.github/workflows/tests_e2e_ios.yml`
- **Por que se modifico:** Para probar AMBOS modos (SPM y CocoaPods) en cada Pull Request
- **Para que sirve:** Garantizar que ningun cambio rompa ninguno de los dos modos

**Cambio clave 1 — Matriz ampliada:**

```yaml
# ANTES: solo probaba debug y release
let buildmode = ['debug', 'release'];

# DESPUES: tambien prueba SPM y CocoaPods
let buildmode = ['debug', 'release'];
let depResolution = ['spm', 'cocoapods'];  # NUEVO
```

Esto genera **4 combinaciones** de jobs E2E:
- `iOS (debug, spm, 0)`
- `iOS (debug, cocoapods, 0)`
- `iOS (release, spm, 0)`
- `iOS (release, cocoapods, 0)`

**Cambio clave 2 — Step "Configure Dependency Resolution Mode":**

```yaml
- name: Configure Dependency Resolution Mode
  run: |
    if [[ "${{ matrix.dep-resolution }}" == "cocoapods" ]]; then
      echo "Configuring CocoaPods-only mode (disabling SPM)"
      cd tests/ios

      # 1. Cambia linkage de dynamic a static
      sed -i '' "s/^linkage = 'dynamic'/linkage = 'static'/" Podfile

      # 2. Inyecta la flag $RNFirebaseDisableSPM = true al inicio del Podfile
      printf '%s\n' '$RNFirebaseDisableSPM = true' | cat - Podfile > Podfile.tmp && mv Podfile.tmp Podfile

      # 3. Remueve SWIFT_ENABLE_EXPLICIT_MODULES (no necesario sin SPM en CI)
      sed -i '' "/SWIFT_ENABLE_EXPLICIT_MODULES/d" Podfile

      echo "Podfile configured for CocoaPods-only mode"
    else
      echo "Using default SPM mode (dynamic linkage)"
    fi
```

**Explicacion paso a paso de cada comando:**

| # | Comando | Que hace | Por que |
|---|---------|----------|---------|
| 1 | `sed -i '' "s/^linkage = 'dynamic'/linkage = 'static'/"` | Busca la linea `linkage = 'dynamic'` y la reemplaza por `linkage = 'static'` | CocoaPods necesita static linkage para evitar problemas con frameworks |
| 2 | `printf '%s\n' '$RNFirebaseDisableSPM = true' \| cat - Podfile > Podfile.tmp && mv Podfile.tmp Podfile` | Prepone `$RNFirebaseDisableSPM = true` al inicio del Podfile | Activa el flag que hace que `firebase_dependency()` use CocoaPods |
| 3 | `sed -i '' "/SWIFT_ENABLE_EXPLICIT_MODULES/d"` | Elimina cualquier linea que contenga `SWIFT_ENABLE_EXPLICIT_MODULES` | En modo CocoaPods en CI, no necesitamos este workaround |

**¿Por que `printf | cat` en lugar de `sed -i`?**

El comando `sed -i '' "/^platform :ios/i\\\n$RNFirebaseDisableSPM = true\n"` (insertar antes de una linea) requiere texto multi-linea. Dentro de un bloque YAML `run: |`, las lineas sin indentacion rompen el YAML. `printf | cat` es un workaround portable que funciona dentro de YAML sin problemas de indentacion.

### 3.7 `tests/ios/Podfile` — Podfile de Tests con Workaround Xcode 26

- **Que es:** El Podfile del proyecto de tests E2E
- **Donde:** `tests/ios/Podfile`
- **Por que se modifico:** Para soportar modo SPM por defecto y agregar el workaround de Xcode 26
- **Para que sirve:** Es el archivo que CocoaPods lee para saber que dependencias instalar en el proyecto de tests

**Lineas clave:**

```ruby
# Linea 48 — Linkage dinamico para SPM
linkage = 'dynamic'  # En modo CocoaPods, CI lo cambia a 'static'

# Lineas 100-110 — Workaround Xcode 26
# Xcode 26 habilita modulos explicitos por defecto, pero los targets
# internos de Firebase SPM (FirebaseCoreInternal, FirebaseSharedSwift)
# no estan expuestos como productos publicos.
# Esto NO desactiva SPM — solo le dice al compilador Swift que use
# descubrimiento implicito de modulos (comportamiento de Xcode 16).
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
  end
end
```

**¿Que es `SWIFT_ENABLE_EXPLICIT_MODULES`?**

Es un build setting de Xcode que controla como el compilador Swift encuentra los modulos:
- `YES` (default en Xcode 26): El compilador SOLO encuentra modulos que estan explicitamente declarados. Si un modulo no esta listado como "publico", no lo encuentra.
- `NO` (default en Xcode 16): El compilador busca modulos automaticamente en todas las rutas de busqueda. Esto es mas permisivo pero menos estricto.

Firebase tiene modulos internos que no son publicos. Con `YES`, Xcode 26 no los encuentra → error de compilacion. Con `NO`, funciona como antes.

---

## 4. Referencia de Funciones y Parametros

### 4.1 `firebase_dependency(spec, version, spm_products, pods)`

**Proposito:** Registra una dependencia de Firebase en un podspec, eligiendo automaticamente entre SPM y CocoaPods.

**Parametros:**

| Parametro | Tipo Ruby | Requerido | Descripcion | Ejemplo |
|-----------|-----------|-----------|-------------|---------|
| `spec` | `Pod::Specification` | Si | El objeto podspec (el `s` en el DSL de podspec). Representa al paquete que se esta configurando. | `s` (viene del contexto del podspec) |
| `version` | `String` | Si | Version del Firebase iOS SDK a usar. Debe coincidir con la version en package.json. | `'12.10.0'` |
| `spm_products` | `Array<String>` | Si | Lista de nombres de productos SPM de Firebase. Estos nombres son los que aparecen en el `Package.swift` del firebase-ios-sdk. | `['FirebaseAuth']` o `['FirebaseCrashlytics']` |
| `pods` | `String` o `Array<String>` | Si | Nombre(s) de las dependencias CocoaPods. Puede ser un string (1 dependencia) o un array (multiples). Estos nombres son los que aparecen en el Podspec de Firebase. | `'Firebase/Auth'` o `['Firebase/Messaging', 'FirebaseCoreExtension']` |

**Valor de retorno:** `nil` — La funcion no retorna valor. Su efecto es lateral: registra la dependencia en el sistema (SPM o CocoaPods).

**Ejemplo de uso en un podspec:**

```ruby
# RNFBAuth.podspec
require '../app/firebase_spm'

Pod::Spec.new do |s|
  # ... configuracion del podspec ...

  firebase_sdk_version = appPackage['sdkVersions']['ios']['firebase']

  # Registra FirebaseAuth como dependencia
  # - Si SPM: llama spm_dependency(s, url: "...", products: ['FirebaseAuth'])
  # - Si CocoaPods: llama s.dependency('Firebase/Auth', '12.10.0')
  firebase_dependency(s, firebase_sdk_version, ['FirebaseAuth'], 'Firebase/Auth')
end
```

**Ejemplo con multiples dependencias CocoaPods:**

```ruby
# RNFBCrashlytics.podspec
firebase_dependency(s, firebase_sdk_version,
  ['FirebaseCrashlytics'],                            # SPM: solo necesita este
  ['Firebase/Crashlytics', 'FirebaseCoreExtension']   # CocoaPods: necesita ambos
)
```

### 4.2 Variable Global `$firebase_spm_url`

**Proposito:** Almacena la URL del repositorio git de Firebase iOS SDK para SPM.

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `String` (variable global Ruby) |
| **Valor default** | `nil` (se asigna al cargar `firebase_spm.rb`) |
| **Valor despues de cargar** | `'https://github.com/firebase/firebase-ios-sdk.git'` |
| **Se puede sobreescribir** | Si. Si defines `$firebase_spm_url = 'otra-url'` ANTES de cargar `firebase_spm.rb`, usara tu URL. |

**Caso de uso para sobreescribir:**

```ruby
# En tu Podfile, antes de cualquier pod install:
$firebase_spm_url = 'https://github.com/mi-empresa/firebase-ios-sdk-fork.git'
# Ahora todos los paquetes RNFB usaran tu fork de Firebase
```

### 4.3 Variable Global `$RNFirebaseDisableSPM`

**Proposito:** Flag para forzar el uso de CocoaPods y deshabilitar SPM.

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Cualquiera (se checa con `defined?()`, no con valor) |
| **Valor default** | No definida (SPM habilitado) |
| **Como activar** | `$RNFirebaseDisableSPM = true` en tu Podfile |
| **Efecto** | `firebase_dependency()` siempre usara CocoaPods |

**IMPORTANTE:** La funcion checa `defined?($RNFirebaseDisableSPM)`, NO el valor. Esto significa que incluso `$RNFirebaseDisableSPM = false` DESACTIVA SPM, porque la variable esta "definida". Para habilitar SPM, simplemente no definas esta variable.

### 4.4 Funcion `spm_dependency` (proporcionada por React Native)

**NO esta definida en este proyecto.** Es una funcion que React Native (>= 0.75) inyecta durante el proceso de `pod install`. Si existe, significa que el entorno soporta SPM.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `spec` | `Pod::Specification` | Podspec al que agregar la dependencia |
| `url:` | `String` | URL del repositorio git del paquete Swift |
| `requirement:` | `Hash` | Restriccion de version. Formato: `{ kind: 'upToNextMajorVersion', minimumVersion: '12.10.0' }` |
| `products:` | `Array<String>` | Lista de productos SPM a incluir |

---

## 5. Guia de Integracion — Proyecto Legacy

> **Proyecto legacy** = Un proyecto que usa React Native con CocoaPods y NO tiene soporte SPM.

### 5.1 Requisitos previos

| Requisito | Minimo | Recomendado |
|-----------|--------|-------------|
| React Native | 0.73+ | 0.75+ (para SPM) |
| Xcode | 15.0 | 26+ |
| CocoaPods | 1.14+ | 1.16+ |
| iOS target | 15.0+ | 15.1+ |
| Ruby | 2.7+ | 3.0+ |

### 5.2 Paso a paso

#### Paso 1: Actualizar `@react-native-firebase` a la version con soporte SPM

```bash
# En tu proyecto React Native
yarn add @react-native-firebase/app@latest
yarn add @react-native-firebase/auth@latest
# ... repite para cada modulo que uses
```

#### Paso 2: Decidir — ¿SPM o CocoaPods?

**Usa SPM si:**
- React Native >= 0.75
- Xcode 26+
- No tienes dependencias que requieran static linkage
- Quieres el modo recomendado por Apple

**Usa CocoaPods si:**
- React Native < 0.75
- Tienes `use_frameworks! :linkage => :static` en tu Podfile
- Tienes otras dependencias incompatibles con SPM
- Prefieres no cambiar nada (modo legacy)

#### Paso 3A: Configuracion para SPM (recomendado)

```ruby
# ios/Podfile

# Asegurate de tener dynamic linkage
linkage = 'dynamic'
use_frameworks! :linkage => linkage.to_sym

target 'TuApp' do
  # ... tus pods ...

  post_install do |installer|
    # OBLIGATORIO para Xcode 26+
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      end
    end
  end
end
```

Luego:
```bash
cd ios && pod install
```

Deberias ver mensajes como:
```
[react-native-firebase] RNFBApp: Using SPM for Firebase dependency resolution (products: FirebaseCore)
[react-native-firebase] RNFBAuth: Using SPM for Firebase dependency resolution (products: FirebaseAuth)
```

#### Paso 3B: Configuracion para CocoaPods (legacy)

```ruby
# ios/Podfile — ANTES de las declaraciones de target

$RNFirebaseDisableSPM = true  # Fuerza CocoaPods

# Static linkage (requerido para CocoaPods)
linkage = 'static'
use_frameworks! :linkage => linkage.to_sym

target 'TuApp' do
  # ... tus pods ...

  post_install do |installer|
    # OBLIGATORIO si usas Xcode 26+
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      end
    end
  end
end
```

Deberias ver:
```
[react-native-firebase] RNFBApp: SPM disabled ($RNFirebaseDisableSPM = true), using CocoaPods for Firebase dependencies
```

#### Paso 4: Verificar que compila

```bash
cd ios && xcodebuild -workspace TuApp.xcworkspace -scheme TuApp -sdk iphonesimulator build
```

### 5.3 Posibles conflictos

| Conflicto | Sintoma | Solucion |
|-----------|---------|----------|
| **Duplicate symbols** | `duplicate symbol '_FIRApp' in ...` | Estas usando SPM con static linkage. Cambia a `dynamic` o activa `$RNFirebaseDisableSPM` |
| **Module not found** | `No such module 'FirebaseAuth'` | Falta `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'` en Xcode 26 |
| **Header not found** | `'Firebase/Firebase.h' file not found` | El modo actual (SPM) no genera ese header umbrella. Los archivos nativos ya usan `#if __has_include` para manejar esto. |
| **Pod::UI undefined** | `NameError: uninitialized constant Pod` | Estas ejecutando `firebase_spm.rb` fuera de CocoaPods (en tests). El guard `defined?(Pod)` ya lo maneja. |
| **Version mismatch** | `unable to satisfy version requirement` | Asegurate que la version en `package.json` de `@react-native-firebase/app` coincide con tus pods. |

### 5.4 Checklist post-integracion

- [ ] `pod install` completa sin errores
- [ ] Los mensajes de log muestran el modo correcto (SPM o CocoaPods)
- [ ] El proyecto compila en Xcode sin errores
- [ ] La app inicia y `Firebase.configure()` se ejecuta
- [ ] Las funciones de Firebase (auth, analytics, etc.) funcionan
- [ ] Los tests existentes pasan

---

## 6. Guia de Integracion — Proyectos que requieren actualizar SPM

### 6.1 ¿Que es SPM?

**Swift Package Manager (SPM)** es el gestor de paquetes nativo de Apple, integrado en Xcode. A diferencia de CocoaPods (que es una herramienta de terceros), SPM esta construido dentro de Xcode y Swift.

| Aspecto | CocoaPods | SPM |
|---------|-----------|-----|
| **Instalacion** | `gem install cocoapods` | Ya viene con Xcode |
| **Archivo config** | `Podfile` | `Package.swift` |
| **Lock file** | `Podfile.lock` | `Package.resolved` |
| **Resolucion** | Centralizada (trunk server) | Descentralizada (git repos) |
| **Tipo** | Ruby gem externo | Herramienta nativa Apple |

### 6.2 Dependencias y versiones minimas

| Dependencia | Version Minima | Razon |
|-------------|---------------|-------|
| `react-native` / `react-native-tvos` | 0.75.0 | Primera version que expone `spm_dependency()` en el runtime de CocoaPods |
| `@react-native-firebase/app` | Version con soporte SPM (esta PR) | Necesita `firebase_spm.rb` |
| Xcode | 15.0 (funcional), 26+ (recomendado) | SPM esta integrado desde Xcode 11, pero Xcode 26 cambia el compilador |
| Firebase iOS SDK | 12.10.0+ | Version testeada con este sistema |
| CocoaPods | 1.14+ | Para que `spm_dependency()` funcione correctamente en el contexto de pod install |

### 6.3 Instrucciones paso a paso

#### Paso 1: Verificar version de React Native

```bash
node -p "require('./package.json').dependencies['react-native']"
# o para tvOS:
node -p "require('./package.json').dependencies['react-native-tvos']"
```

Si es < 0.75, necesitas hacer upgrade de React Native primero. SPM no esta disponible en versiones anteriores.

#### Paso 2: Verificar linkage en tu Podfile

Abre `ios/Podfile` y busca:
```ruby
use_frameworks! :linkage => :static
```

Si tienes `:static`, necesitas cambiarlo a `:dynamic` para SPM:
```ruby
use_frameworks! :linkage => :dynamic
```

**ADVERTENCIA:** Cambiar de static a dynamic puede afectar otras dependencias. Verifica que todas tus dependencias soporten dynamic linkage.

#### Paso 3: Remover `$RNFirebaseDisableSPM` si existe

Si tu Podfile tiene esta linea, eliminala:
```ruby
$RNFirebaseDisableSPM = true  # ELIMINAR ESTA LINEA
```

#### Paso 4: Agregar workaround Xcode 26 (si aplica)

En tu Podfile `post_install`:
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
    end
  end
end
```

#### Paso 5: Limpiar y reinstalar

```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
```

#### Paso 6: Verificar en la salida de pod install

Busca estas lineas:
```
[react-native-firebase] RNFBApp: Using SPM for Firebase dependency resolution (products: FirebaseCore)
```

Si ves "Using SPM", el modo SPM esta activo.

Si ves "SPM not available", tu version de React Native no soporta SPM.

### 6.4 Errores comunes y soluciones

| Error | Causa | Solucion |
|-------|-------|----------|
| `duplicate symbol` durante linkeo | SPM + static linkage | Cambiar a `dynamic` linkage |
| `No such module 'FirebaseCore'` | Xcode 26 con explicit modules | Agregar `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'` |
| `spm_dependency is not defined` | RN < 0.75 | Actualizar React Native a >= 0.75 o usar CocoaPods con `$RNFirebaseDisableSPM = true` |
| `multiple commands produce Firebase.framework` | Conflicto entre SPM y CocoaPods para Firebase | Asegurate de NO tener `pod 'Firebase/Core'` manual en tu Podfile si SPM esta activo |
| `unable to resolve package` | URL de SPM incorrecta | Verificar `firebaseSpmUrl` en `packages/app/package.json` |
| `trueplatform :ios` en CI | Bug del sed multiline en YAML | Ya resuelto. Usar `printf \| cat` en lugar de `sed -i insert` |
| Pod install loop / conflicto de versiones | Version de Firebase no coincide entre SPM y CocoaPods | Asegurate de usar la misma version en `package.json` y cualquier pod manual |

### 6.5 Rollback a CocoaPods

Si SPM no funciona, puedes volver a CocoaPods en 30 segundos:

```ruby
# Agrega al inicio de tu Podfile:
$RNFirebaseDisableSPM = true

# Cambia linkage a static:
use_frameworks! :linkage => :static
```

```bash
cd ios && rm -rf Pods && pod install
```

---

## 7. Glosario

| Termino | Definicion |
|---------|-----------|
| **SPM (Swift Package Manager)** | Herramienta de Apple para gestionar dependencias en proyectos iOS/macOS. Viene integrada en Xcode. Es el reemplazo moderno de CocoaPods. |
| **CocoaPods** | Herramienta de terceros (escrita en Ruby) para gestionar dependencias en iOS. Fue el estandar durante anos. Usa un archivo `Podfile` para declarar dependencias. |
| **Podspec (.podspec)** | Archivo de configuracion que describe una libreria distribuida via CocoaPods. Define nombre, version, archivos fuente, dependencias, etc. |
| **Podfile** | Archivo en la raiz del directorio `ios/` que declara que dependencias necesita tu proyecto. CocoaPods lo lee durante `pod install`. |
| **Linkage (static vs dynamic)** | Define como se enlazan las librerias al binario final. **Static**: el codigo de la libreria se copia dentro de tu app. **Dynamic**: la libreria es un archivo separado que se carga en runtime. |
| **Framework** | En iOS, una forma de empaquetar una libreria con sus headers, recursos y metadatos. Puede ser static o dynamic. |
| **Header (.h)** | Archivo que declara la interfaz publica de una libreria en Objective-C/C. Le dice al compilador que funciones/clases existen. |
| **Implementation (.m, .mm)** | Archivo con el codigo real (implementacion) en Objective-C (.m) o Objective-C++ (.mm). |
| **`#if __has_include`** | Directiva del preprocesador de C/Objective-C que pregunta: "¿existe este archivo en las rutas de busqueda?" Retorna true/false. Se evalua en tiempo de compilacion. |
| **`@import`** | Forma moderna de importar un modulo en Objective-C. Equivalente a `#import` pero mas eficiente (usa modulos Clang). |
| **Modulos explicitos** | Feature de Xcode 26: el compilador solo reconoce modulos que estan explicitamente declarados. Modulos internos/transitivos no se encuentran automaticamente. |
| **Modulos implicitos** | Comportamiento anterior a Xcode 26: el compilador busca modulos en todas las rutas de busqueda, incluyendo transitivos. |
| **Dependencia transitiva** | Una dependencia que no declaras directamente, pero que es requerida por una dependencia que si declaraste. Ejemplo: si usas `FirebaseMessaging` y este necesita `FirebaseCoreExtension`, entonces `FirebaseCoreExtension` es transitiva. |
| **`defined?()` (Ruby)** | Operador Ruby que verifica si una expresion esta definida. Retorna una descripcion de la expresion (string) o `nil`. NO lanza error si no esta definida. |
| **Variable global Ruby (`$var`)** | Variable que comienza con `$` en Ruby. Es accesible desde cualquier parte del programa. Se usa aqui para configuracion compartida entre archivos. |
| **`spm_dependency()`** | Funcion que React Native (>= 0.75) inyecta en el contexto de CocoaPods durante `pod install`. Permite que un podspec declare una dependencia SPM. |
| **YAML block scalar (`\|`)** | En archivos YAML, `\|` indica un bloque de texto multi-linea donde se preservan los saltos de linea. Usado en GitHub Actions para scripts multi-linea. |
| **Umbrella header** | Un archivo `.h` que importa todos los headers de un framework. CocoaPods crea `Firebase/Firebase.h` que incluye todo. SPM no genera este archivo. |
| **Xcode build setting** | Configuracion que controla como Xcode compila tu proyecto. Se define en el archivo `.xcodeproj` o via CocoaPods `post_install`. Ejemplo: `SWIFT_ENABLE_EXPLICIT_MODULES`. |
| **CI/CD** | Continuous Integration / Continuous Deployment. Sistema automatizado que compila, testea y despliega codigo en cada cambio. Aqui se usa GitHub Actions. |
| **Matrix (CI)** | Estrategia de GitHub Actions para ejecutar el mismo job con diferentes combinaciones de parametros. Ejemplo: `buildmode: [debug, release]` × `dep-resolution: [spm, cocoapods]` = 4 ejecuciones. |
| **Interop layer** | Capa de compatibilidad que permite que codigo antiguo funcione con APIs nuevas. React Native 0.81 con Old Architecture usa interop para que los bridges Objective-C funcionen con el nuevo sistema. |
| **react-native-firebase** | Libreria open-source que proporciona modulos de Firebase para React Native. Cada servicio de Firebase (Auth, Analytics, etc.) es un paquete separado. Repo original: `invertase/react-native-firebase`. |
| **Fork** | Copia de un repositorio git en otra cuenta. Se usa para hacer cambios sin afectar el original. Aqui: `jsnavarroc/react-native-firebase` es fork de `invertase/react-native-firebase`. |
| **PR (Pull Request)** | Solicitud para integrar cambios de una rama a otra. Aqui: PR #1 de `feature/spm-dependency-support` → `main` en el fork. |
| **clang-format** | Herramienta de formateo automatico para codigo C/C++/Objective-C. El CI la usa para verificar que el codigo sigue el estilo del proyecto. |
| **Old Architecture (React Native)** | Arquitectura original de React Native que usa bridge Objective-C (`RCT_EXTERN_MODULE`), `NativeEventEmitter`, y `setNativeProps`. La "New Architecture" usa TurboModules y Fabric. |

---

## Apendice A: Commits en la Rama

| Hash | Mensaje | Que cambio |
|------|---------|-----------|
| `ca5604939` | `feat(ios): add SPM dependency resolution support alongside CocoaPods` | Commit principal: firebase_spm.rb, tests, 16 podspecs, 43 archivos nativos, CI matrix |
| `d5e423bec` | `fix(ios): guard Pod::UI.puts calls for test environments` | Agrego `if defined?(Pod::UI)` para evitar error en tests Ruby |
| `dcb618b41` | `fix(ios): resolve CI failures — clang-format, sed indentation, Pod constant guard` | Formateo clang-format, fix sed en workflow, guard `defined?(Pod)` |
| `d21651adb` | `fix(ci): use printf instead of sed multiline for Podfile flag insertion` | Reemplazo sed multiline por printf+cat para compatibilidad YAML |

## Apendice B: Estructura de Archivos del Cambio

```
react-native-firebase/
├── packages/
│   ├── app/
│   │   ├── firebase_spm.rb              ← NUEVO: Helper central
│   │   ├── __tests__/
│   │   │   └── firebase_spm_test.rb     ← NUEVO: Tests unitarios
│   │   ├── package.json                 ← MODIFICADO: agrego firebaseSpmUrl
│   │   └── RNFBApp.podspec              ← MODIFICADO: usa firebase_dependency()
│   ├── auth/
│   │   ├── RNFBAuth.podspec             ← MODIFICADO
│   │   └── ios/RNFBAuth/
│   │       ├── RNFBAuthModule.h         ← MODIFICADO: #if __has_include
│   │       └── RNFBAuthModule.m         ← MODIFICADO: #if __has_include
│   ├── analytics/
│   │   ├── RNFBAnalytics.podspec        ← MODIFICADO
│   │   └── ios/RNFBAnalytics/
│   │       └── RNFBAnalyticsModule.m    ← MODIFICADO
│   ├── messaging/
│   │   ├── RNFBMessaging.podspec        ← MODIFICADO
│   │   └── ios/RNFBMessaging/
│   │       ├── RNFBMessagingModule.m    ← MODIFICADO
│   │       └── RNFBMessagingSerializer.m← MODIFICADO
│   ├── crashlytics/
│   │   ├── RNFBCrashlytics.podspec      ← MODIFICADO
│   │   └── ios/RNFBCrashlytics/
│   │       ├── RNFBCrashlyticsModule.m         ← MODIFICADO
│   │       ├── RNFBCrashlyticsInitProvider.h   ← MODIFICADO
│   │       ├── RNFBCrashlyticsInitProvider.m   ← MODIFICADO
│   │       └── RNFBCrashlyticsNativeHelper.m   ← MODIFICADO
│   ├── firestore/                       ← MODIFICADO (5 archivos)
│   ├── database/                        ← MODIFICADO (5 archivos)
│   ├── storage/                         ← MODIFICADO (2 archivos)
│   ├── functions/                       ← MODIFICADO (1 archivo .mm)
│   ├── perf/                            ← MODIFICADO
│   ├── app-check/                       ← MODIFICADO (2 archivos)
│   ├── installations/                   ← MODIFICADO
│   ├── remote-config/                   ← MODIFICADO
│   ├── in-app-messaging/                ← MODIFICADO
│   ├── app-distribution/                ← MODIFICADO
│   └── ml/                              ← MODIFICADO (podspec deshabilitado)
├── tests/
│   └── ios/
│       └── Podfile                      ← MODIFICADO: linkage dynamic + SWIFT_ENABLE_EXPLICIT_MODULES
└── .github/
    └── workflows/
        └── tests_e2e_ios.yml            ← MODIFICADO: matriz SPM/CocoaPods + step configuracion
```

---

## 8. Bugs Encontrados Durante la Integracion y Sus Soluciones

> Esta seccion documenta bugs reales encontrados al integrar esta solucion en un proyecto tvOS con React Native 0.77 → 0.81 (react-native-tvos). Util para diagnosticar problemas similares.

---

### Bug 1: Linker error con `APMETaskManager` / `APMMeasurement` al usar `$RNFirebaseAnalyticsWithoutAdIdSupport = true` con SPM

**Sintoma:**

```
Undefined symbols for architecture arm64:
  "_OBJC_CLASS_$_APMETaskManager"
  "_OBJC_CLASS_$_APMMeasurement"
```

**Cuando ocurre:** Solo cuando se usan las tres condiciones simultaneamente:
1. SPM habilitado (no `$RNFirebaseDisableSPM`)
2. `$RNFirebaseAnalyticsWithoutAdIdSupport = true` en el Podfile
3. `FirebasePerformance` NO esta instalado

**Causa raiz:**

El producto SPM `FirebaseAnalytics` incluye `GoogleAppMeasurement`, que contiene referencias cruzadas a `APMETaskManager` y `APMMeasurement` (clases de Firebase Performance Monitoring). Cuando `FirebasePerformance` no esta instalado, esas clases no existen → error de linker.

El producto SPM `FirebaseAnalyticsCore` usa `GoogleAppMeasurementCore` en su lugar, que es la version sin IDFA y sin las referencias APM. Es exactamente lo que se necesita cuando se quiere analytics sin Ad ID support.

**Archivo afectado:** `packages/analytics/RNFBAnalytics.podspec`

**Fix aplicado:**

```ruby
# ANTES (solo FirebaseAnalytics, siempre):
firebase_dependency(s, firebase_sdk_version, ['FirebaseAnalytics'], 'FirebaseAnalytics/Core')

# DESPUES (condicional segun $RNFirebaseAnalyticsWithoutAdIdSupport + SPM):
if defined?(spm_dependency) && !defined?($RNFirebaseDisableSPM) &&
   defined?($RNFirebaseAnalyticsWithoutAdIdSupport) && $RNFirebaseAnalyticsWithoutAdIdSupport
  # FirebaseAnalyticsCore → GoogleAppMeasurementCore (sin IDFA, sin APM objects)
  Pod::UI.puts "#{s.name}: Using FirebaseAnalyticsCore SPM product (no IDFA, uses GoogleAppMeasurementCore)."
  firebase_dependency(s, firebase_sdk_version, ['FirebaseAnalyticsCore'], 'FirebaseAnalytics/Core')
else
  firebase_dependency(s, firebase_sdk_version, ['FirebaseAnalytics'], 'FirebaseAnalytics/Core')
end
```

**Cuando aplicar este fix:** Siempre que se use `$RNFirebaseAnalyticsWithoutAdIdSupport = true` con SPM y sin `FirebasePerformance`.

---

### Bug 2: Error "Packages are not supported when using legacy build locations" en Xcode 26

**Sintoma:**

```
error: Packages are not supported when using legacy build locations.
```

El build falla inmediatamente al abrir el workspace o durante `xcodebuild`.

**Cuando ocurre:** Al usar SPM (con `spm_dependency`) en un proyecto que tiene CocoaPods. El proyecto de Pods (`.xcodeproj` generado por CocoaPods) usa "legacy build locations" por defecto, pero Xcode 26 no permite paquetes SPM con ese modo.

**Causa raiz:**

CocoaPods genera proyectos `.xcodeproj` que no tienen `WorkspaceSettings.xcsettings` con `BuildSystemType = Latest`. Sin este archivo, Xcode usa "legacy build locations". Xcode 26 agregó la restricción de que los paquetes SPM no pueden usarse con ese modo.

**Archivo afectado:** `node_modules/react-native/scripts/cocoapods/spm.rb` (parte de `react-native`, no de este fork)

**Fix aplicado en `spm.rb` (metodo `apply_on_post_install`):**

```ruby
# Crear WorkspaceSettings.xcsettings para optar por modern build system
unless @dependencies_by_pod.empty?
  shared_data_dir = File.join(project.path, 'project.xcworkspace', 'xcshareddata')
  FileUtils.mkdir_p(shared_data_dir)
  settings_path = File.join(shared_data_dir, 'WorkspaceSettings.xcsettings')
  unless File.exist?(settings_path)
    File.write(settings_path, <<~PLIST)
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
      <plist version="1.0">
      <dict>
        <key>BuildSystemType</key>
        <string>Latest</string>
      </dict>
      </plist>
    PLIST
  end
end
```

**Nota importante:** Este fix esta en `react-native` / `react-native-tvos`, no en este fork. Hay que verificar si esta incluido en react-native >= 0.81 o aplicarlo via post_install hook en el Podfile del proyecto.

**Workaround alternativo (en Podfile del proyecto):**

```ruby
post_install do |installer|
  shared_data_dir = File.join(installer.pods_project.path, 'project.xcworkspace', 'xcshareddata')
  FileUtils.mkdir_p(shared_data_dir)
  settings_path = File.join(shared_data_dir, 'WorkspaceSettings.xcsettings')
  unless File.exist?(settings_path)
    File.write(settings_path, <<~PLIST)
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
      <plist version="1.0">
      <dict>
        <key>BuildSystemType</key>
        <string>Latest</string>
      </dict>
      </plist>
    PLIST
  end
end
```

---

### Bug 3: Crash "XCSwiftPackageProductDependency _setSavedArchiveVersion" o "Type checking error: got XCSwiftPackageProductDependency for mainGroup"

**Sintoma:**

Xcode crashea al abrir el workspace o el build falla con uno de estos errores:
```
XCSwiftPackageProductDependency _setSavedArchiveVersion: unrecognized selector
```
```
Type checking error: got XCSwiftPackageProductDependency for mainGroup
```

El `Pods.xcodeproj` resulta corrupto.

**Cuando ocurre:** En proyectos que ya tuvieron dependencias SPM y luego se ejecuta `pod install` de nuevo (por ejemplo, al cambiar versiones de Firebase o al hacer `rm -rf Pods && pod install`).

**Causa raiz:**

CocoaPods usa un contador secuencial para generar UUIDs de objetos en el `.pbxproj`. Cuando `clean_spm_dependencies_from_target` elimina los objetos SPM del proyecto, sus UUIDs vuelven al pool disponible. Al agregar nuevos objetos SPM, el contador puede reutilizar esos UUIDs, que coinciden con UUIDs de objetos no-SPM ya existentes (como `rootObject` o `mainGroup`).

En `objects_by_uuid`, el ultimo que escribe gana. El objeto SPM sobreescribe la entrada del objeto no-SPM → el proyecto queda corrupto.

**Archivo afectado:** `node_modules/react-native/scripts/cocoapods/spm.rb` (metodo `apply_on_post_install`)

**Fix aplicado en `spm.rb`:**

```ruby
# ANTES de agregar objetos SPM, tomar snapshot de objects_by_uuid
pre_spm_snapshot = project.objects_by_uuid.dup

# ... agregar objetos SPM ...

# DESPUES, detectar y corregir colisiones
fix_spm_uuid_collisions(project, pre_spm_snapshot)
```

El metodo `fix_spm_uuid_collisions` detecta objetos SPM cuyo UUID existia en el snapshot pre-SPM, les asigna un UUID aleatorio seguro via `SecureRandom.hex`, y restaura el objeto original en su UUID original.

**Nota importante:** Este fix esta en `react-native` / `react-native-tvos`, no en este fork. Reportar upstream o aplicar manualmente si se usa react-native < 0.81.

---

### Bug 4: `RNFBAppModule not found` — crash al iniciar la app en tvOS

**Sintoma:**

```
RNFBAppModule not found. Did you forget to link the native module?
```

La app crashea inmediatamente al iniciar en tvOS.

**Cuando ocurre:** Especificamente en el target tvOS. En iOS el mismo build funciona correctamente.

**Causa raiz:**

El target tvOS en `project.pbxproj` tenia `OTHER_LDFLAGS` incompleto:
```
OTHER_LDFLAGS = ("$(inherited)", " ");  // tvOS — FALTABA -ObjC
```

Mientras el target iOS tenia:
```
OTHER_LDFLAGS = ("$(inherited)", "-ObjC", "-lc++");  // iOS — correcto
```

Sin `-ObjC`, el linker no carga las categorias y clases Objective-C definidas en librerias estaticas (como los modulos nativos de Firebase). El modulo `RNFBAppModule` no se registra en el bridge de React Native → crash.

**Archivo afectado:** `ios/NextPlay.xcodeproj/project.pbxproj` (en el proyecto cliente, no en el fork)

**Fix:** Agregar `-ObjC` y `-lc++` a `OTHER_LDFLAGS` de los targets tvOS (Debug y Release):

```
OTHER_LDFLAGS = ("$(inherited)", "-ObjC", "-lc++");
```

Despues del fix: **Clean Build Folder** (`Cmd+Shift+K`) y rebuild.

**Como diagnosticar:** Buscar en `project.pbxproj` todas las ocurrencias de `OTHER_LDFLAGS` y verificar que los targets tvOS (`SDKROOT = appletvos`) tengan `-ObjC`.

---

### Bug 5: Firebase DebugView no muestra eventos (demora de hasta 1 hora)

**Sintoma:**

Los eventos de Firebase Analytics no aparecen en Firebase DebugView. Si aparecen, lo hacen con 30-60 minutos de retraso.

**Cuando ocurre:** Sin las flags de debug, Firebase Analytics agrupa los eventos y los envia en batch cada ~30-60 minutos para optimizar bateria/red.

**Causa raiz:**

Dos problemas combinados:
1. `AppDelegate.swift` solo tenia `FirebaseApp.configure()` sin activar el modo debug
2. Se usaba `-FIRDebugEnabled` en lugar de `-FIRAnalyticsDebugEnabled` (flag especifica para Analytics DebugView)
3. `CommandLine.arguments.append(...)` solo funciona si la app se lanza desde Xcode. Si se lanza manualmente en el simulador, no tiene efecto

**Fix aplicado en `AppDelegate.swift` (ANTES de `FirebaseApp.configure()`):**

```swift
#if DEBUG
// Metodo 1: funciona cuando se lanza desde Xcode
CommandLine.arguments.append("-FIRAnalyticsDebugEnabled")

// Metodo 2: funciona cuando se lanza manualmente en el simulador
UserDefaults.standard.set(true, forKey: "/google/firebase/debug_mode")
UserDefaults.standard.set(true, forKey: "/google/measurement/debug_mode")
UserDefaults.standard.synchronize()
#endif

FirebaseApp.configure()
```

**Nota:** Para tvOS, usar el simulador "Apple TV 4K (2nd generation)" o posterior. El simulador "Apple TV" original no reporta eventos a Firebase DebugView.

---

### Resumen de Bugs por Archivo

| Bug | Archivo afectado | Repositorio | Fix incluido en este PR |
|-----|-----------------|-------------|------------------------|
| APM linker error con `WithoutAdIdSupport` | `packages/analytics/RNFBAnalytics.podspec` | **este fork** | Si |
| Legacy build locations Xcode 26 | `node_modules/react-native/scripts/cocoapods/spm.rb` | react-native/react-native-tvos | No (upstream) |
| UUID collision en pbxproj | `node_modules/react-native/scripts/cocoapods/spm.rb` | react-native/react-native-tvos | No (upstream) |
| `RNFBAppModule not found` tvOS | `ios/*.xcodeproj/project.pbxproj` | proyecto cliente | No (fix manual) |
| Firebase DebugView sin eventos | `ios/NextPlay/AppDelegate.swift` | proyecto cliente | No (fix manual) |
