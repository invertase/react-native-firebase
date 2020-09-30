import firebase from '@react-native-firebase/app';
import * as vision from '@react-native-firebase/ml-vision';

console.log(vision.default().app);

// checks module exists at root
console.log(firebase.vision().app.name);

// checks module exists at app level
console.log(firebase.app().vision().app.name);

// checks statics exist
console.log(firebase.vision.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(vision.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.vision(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase.vision(firebase.app('foo')).app.name);

console.log(firebase.vision.VisionBarcodeFormat.ALL_FORMATS);
console.log(vision.VisionBarcodeFormat);

console.log(firebase.vision.VisionFaceContourType.ALL_POINTS);
console.log(vision.VisionFaceContourType.ALL_POINTS);

console.log(firebase.vision.VisionFaceLandmarkType.LEFT_CHEEK);
console.log(vision.VisionFaceLandmarkType.LEFT_EAR);

console.log(firebase.vision.VisionBarcodeValueType.CALENDAR_EVENT);
// console.log(vision.VisionBarcodeValueType.);

console.log(firebase.vision.VisionFaceDetectorContourMode.ALL_CONTOURS);
console.log(vision.VisionFaceDetectorContourMode.ALL_CONTOURS);

console.log(firebase.vision.VisionFaceDetectorLandmarkMode.ALL_LANDMARKS);
console.log(vision.VisionFaceDetectorLandmarkMode.ALL_LANDMARKS);

console.log(firebase.vision.VisionBarcodeWifiEncryptionType.WEP);
// console.log(vision.VisionBarcodeWifiEncryptionType.WEP);

console.log(firebase.vision.VisionFaceDetectorPerformanceMode.ACCURATE);
console.log(vision.VisionFaceDetectorPerformanceMode.FAST);

console.log(firebase.vision.VisionCloudTextRecognizerModelType.DENSE_MODEL);
console.log(vision.VisionCloudTextRecognizerModelType.SPARSE_MODEL);

console.log(firebase.vision.VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS);
console.log(vision.VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS);

console.log(firebase.vision.VisionDocumentTextRecognizedBreakType.EOL_SURE_SPACE);
console.log(vision.VisionDocumentTextRecognizedBreakType.HYPHEN);

console.log(firebase.vision.VisionCloudLandmarkRecognizerModelType.LATEST_MODEL);
console.log(vision.VisionCloudLandmarkRecognizerModelType.STABLE_MODEL);
