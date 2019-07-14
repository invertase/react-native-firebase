import { VisionPoint, VisionRectangle } from './index';

/**
 * A representation of a barcode detected in an image.
 *
 * #### Example
 *
 * ```js
 * const [barcode, ...otherBarcodes] = await firebase.mlKitVision().barcodeDetectorProcessImage(filePath);
 * console.log(barcode);
 * ```
 */
export interface VisionBarcode {
  /**
   * Returns the bounding rectangle of the detected barcode.
   */
  boundingBox: VisionRectangle;

  /**
   * Gets the four corner points in clockwise direction starting with top-left. Due to the possible perspective distortions, this is not necessarily a rectangle. Parts of the region could be outside of the image.
   */
  cornerPoints: VisionPoint[];

  /**
   * Returns the barcode format, for example `VisionBarcodeFormat.QR_CODE`
   *
   * Use with `VisionBarcodeFormat` to switch based on format if needed.
   */
  format: number;

  /**
   * Returns type of the barcode value, for example `VisionBarcodeValueType.EMAIL`.
   *
   * If the value structure cannot be parsed, `VisionBarcodeValueType.TEXT` will be returned.
   * If the recognized structure type is not defined in the current version of the native Firebase SDKs, `VisionBarcodeValueType.UNKNOWN` will be returned.
   *
   * Note that the built-in parsers only recognize a few popular value structures. For your specific use case, you might want to directly consume `rawValue` and implement your own parsing logic.
   */
  valueType: number;

  /**
   * Returns barcode value in a user-friendly format.
   *
   * May omit some of the information encoded in the barcode. For example, if `'rawValue returns `MEBKM:TITLE:Invertase;URL://invertase.io;;'`, the display_value might be `'//invertase.io'`.
   *
   * If `valueType` === `VisionBarcodeValueType.TEXT`, this field will be identical to `rawValue`.
   *
   * This value can also be multiline, for example, when line breaks are encoded into the original `TEXT` barcode value.
   *
   * Returns `null` if nothing found.
   */
  displayValue: string | null;

  /**
   * Returns barcode value as it was encoded in the barcode.
   *
   * Structured values are not parsed.
   *
   * Returns `null` if nothing found.
   */
  rawValue: string | null;

  /**
   * Gets parsed calendar event (set if `valueType` is `VisionBarcodeValueType.CALENDAR_EVENT`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.CALENDAR_EVENT) {
   *   console.log(barcode.calendarEvent);
   * }
   */
  calendarEvent?: VisionBarcodeCalendarEvent;

  /**
   * Gets parsed contact details (set if `valueType` is `VisionBarcodeValueType.CONTACT_INFO`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.CONTACT_INFO) {
   *   console.log(barcode.contactInfo);
   * }
   */
  contactInfo?: VisionBarcodeContactInfo;

  /**
   * Gets parsed drivers license details (set if `valueType` is `VisionBarcodeValueType.DRIVER_LICENSE`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.DRIVER_LICENSE) {
   *   console.log(barcode.driverLicense);
   * }
   */
  driverLicense?: VisionBarcodeDriverLicense;

  /**
   * Gets parsed email details (set if `valueType` is `VisionBarcodeValueType.EMAIL`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.EMAIL) {
   *   console.log(barcode.email);
   * }
   */
  email?: VisionBarcodeEmail;

  /**
   * Gets parsed Geo Point details (set if `valueType` is `VisionBarcodeValueType.GEO`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.GEO) {
   *   console.log(barcode.geoPoint);
   * }
   */
  geoPoint?: VisionBarcodeGeoPoint;

  /**
   * Gets parsed phone details (set if `valueType` is `VisionBarcodeValueType.PHONE`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.PHONE) {
   *   console.log(barcode.phone);
   * }
   */
  phone?: VisionBarcodePhone;

  /**
   * Gets parsed sms details (set if `valueType` is `VisionBarcodeValueType.SMS`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.SMS) {
   *   console.log(barcode.sms);
   * }
   */
  sms?: VisionBarcodeSms;

  /**
   * Gets parsed url details (set if `valueType` is `VisionBarcodeValueType.URL`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.URL) {
   *   console.log(barcode.url);
   * }
   */
  url?: VisionBarcodeUrl;

  /**
   * Gets parsed wifi details (set if `valueType` is `VisionBarcodeValueType.WIFI`).
   *
   * #### Example
   *
   * ```js
   * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
   *
   * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
   *
   * if (barcode && barcode.valueType === VisionBarcodeValueType.WIFI) {
   *   console.log(barcode.wifi);
   * }
   */
  wifi?: VisionBarcodeWifi;
}

/**
 * Wifi network parameters from a 'WIFI:' or similar QRCode type.
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.WIFI) {
 *   console.log(barcode.wifi);
 * }
 */
export interface VisionBarcodeWifi {
  /**
   * The encryption type of the WIFI. e.g. `VisionBarcodeWifiEncryptionType.WPA`
   *
   * See all types at `VisionBarcodeWifiEncryptionType`.
   */
  encryptionType: number;

  /**
   * The password for this WIFI.
   *
   * Returns `null` if nothing found.
   */
  password: string | null;

  /**
   * The SSID for this WIFI.
   *
   * Returns `null` if nothing found.
   */
  ssid: string | null;
}

/**
 * A URL and title from a 'MEBKM:' or similar QRCode type.
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.URL) {
 *   console.log(barcode.url);
 * }
 */
export interface VisionBarcodeUrl {
  /**
   * The title for this url.
   *
   * Returns `null` if nothing found.
   */
  title: string | null;

  /**
   * The URL.
   *
   * Returns `null` if nothing found.
   */
  url: string | null;
}

/**
 * An sms message from an 'SMS:' or similar QRCode type.
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.SMS) {
 *   console.log(barcode.sms);
 * }
 */
export interface VisionBarcodeSms {
  /**
   * The message text for this SMS.
   *
   * Returns `null` if nothing found.
   */
  message: string | null;

  /**
   * The phone number for this SMS.
   *
   * Returns `null` if nothing found.
   */
  phoneNumber: string | number;
}

/**
 * GPS coordinates from a 'GEO:' or similar QRCode type.
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.GEO) {
 *   console.log(barcode.geoPoint);
 * }
 */
export interface VisionBarcodeGeoPoint {
  /**
   * The latitude for these GPS coordinates.
   */
  lat: number;

  /**
   * The longitude for these GPS coordinates.
   */
  lng: number;
}

/**
 * A driver license or ID card.
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.DRIVER_LICENSE) {
 *   console.log(barcode.driverLicense);
 * }
 */
export interface VisionBarcodeDriverLicense {
  /**
   * Gets city of holder's address.
   *
   * Returns `null` if nothing found.
   */
  addressCity: string | null;

  /**
   * Gets state of holder's address.
   *
   * Returns `null` if nothing found.
   */
  addressState: string | null;

  /**
   * The holder's street address.
   *
   * Returns `null` if nothing found.
   */
  addressStreet: string | null;

  /**
   * The zip code of holder's address.
   *
   * Returns `null` if nothing found.
   */
  addressZip: string | null;

  /**
   * The birth date of the holder.
   *
   * Returns `null` if nothing found.
   */
  birthDate: string | null;

  /**
   * The "DL" for driver licenses, "ID" for ID cards.
   *
   * Returns `null` if nothing found.
   */
  documentType: string | null;

  /**
   * The expiry date of the license.
   *
   * Returns `null` if nothing found.
   */
  expiryDate: string | null;

  /**
   * The holder's first name.
   *
   * Returns `null` if nothing found.
   */
  firstName: string | null;

  /**
   * The holder's gender.
   *
   * Returns `null` if nothing found.
   */
  gender: string | null;

  /**
   * The issue date of the license.
   *
   * Returns `null` if nothing found.
   */
  issueDate: string | null;

  /**
   * The country in which DL/ID was issued.
   *
   * Returns `null` if nothing found.
   */
  issuingCountry: string | null;

  /**
   * The holder's last name.
   *
   * Returns `null` if nothing found.
   */
  lastName: string | null;

  /**
   * The driver license ID number.
   *
   * Returns `null` if nothing found.
   */
  licenseNumber: string | null;

  /**
   * The holder's middle name.
   *
   * Returns `null` if nothing found.
   */
  middleName: string | null;
}

/**
 * A calendar event extracted from QRCode.
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.CALENDAR_EVENT) {
 *   console.log(barcode.calendarEvent);
 * }
 */
export interface VisionBarcodeCalendarEvent {
  /**
   * The description of the calendar event.
   *
   * Returns `null` if nothing found.
   */
  description: string | null;

  /**
   * The end date time of the calendar event.
   *
   * Returns `null` if nothing found.
   */
  end: string | null;

  /**
   * The location of the calendar event.
   *
   * Returns `null` if nothing found.
   */
  location: string | null;

  /**
   * The organizer of the calendar event.
   *
   * Returns `null` if nothing found.
   */
  organizer: string | null;

  /**
   * The start date time of the calendar event.
   *
   * Returns `null` if nothing found.
   */
  start: string | null;

  /**
   * The status of the calendar event.
   *
   * Returns `null` if nothing found.
   */
  status: string | null;

  /**
   * The summary of the calendar event.
   *
   * Returns `null` if nothing found.
   */
  summary: string | null;
}

/**
 * A persons or organization's business card. For example a VCARD.
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.CONTACT_INFO) {
 *   console.log(barcode.contactInfo);
 * }
 */
export interface VisionBarcodeContactInfo {
  /**
   * Get an array of detected urls for the contact.
   *
   * Returns an empty array if nothing found;
   */
  urls: string[];

  /**
   * Gets the contact persons title. E.g. `Dr`
   *
   * Returns `null` if no title detected.
   */
  title: string | null;

  /**
   * Gets the contact persons organization.
   *
   * Returns `null` if no organization detected.
   */
  organization: string | null;

  /**
   * Gets the contact persons phones.
   *
   * Returns an empty array if nothing found.
   */
  phones: VisionBarcodePhone[];

  /**
   * Gets the contact persons emails.
   *
   * Returns an empty array if nothing found.
   */
  emails: VisionBarcodeEmail[];

  /**
   * Gets the contact persons name.
   */
  name: VisionBarcodePersonName;

  /**
   * Gets an array of the contact persons addresses.
   *
   * Returns an empty array if nothing found.
   */
  addresses: VisionBarcodeAddress[];
}

/**
 * A contacts address.
 */
export interface VisionBarcodeAddress {
  /**
   * An array of address line strings of the formatted address.
   */
  lines: string[];

  /**
   * The address type, e.g. `VisionBarcodeAddressType.WORK`.
   */
  type: number;
}

/**
 * A persons name, both formatted version and their individual name components.
 */
export interface VisionBarcodePersonName {
  /**
   * The persons first name.
   *
   * Returns `null` if not found.
   */
  first: string | null;

  /**
   * A properly formatted name.
   *
   * Returns `null` if no name components found.
   */
  formatted: string | null;

  /**
   * The persons last name.
   *
   * Returns `null` if not found.
   */
  last: string | null;

  /**
   * The persons middle name.
   *
   * Returns `null` if not found.
   */
  middle: string | null;

  /**
   * The prefix of the name.
   *
   * Returns `null` if not found.
   */
  prefix: string | null;

  /**
   * Designates a text string to be set as the kana name in the phonebook.
   */
  pronunciation: string | null;

  /**
   * The suffix of the persons name.
   *
   * Returns `null` if not found.
   */
  suffix: string | null;
}

/**
 * An email message from a 'MAILTO:' or similar QRCode type, or from a ContactInfo/VCARD.
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.EMAIL) {
 *   console.log(barcode.email);
 * } else if (barcode && barcode.valueType === VisionBarcodeValueType.CONTACT_INFO) {
 *   console.log(barcode.contactInfo.emails[0]);
 * }
 */
export interface VisionBarcodeEmail {
  /**
   * The email address.
   *
   * Returns `null` if non detected for this `type`.
   */
  address: string | null;

  /**
   * The email body content.
   *
   * Returns `null` if no body detected.
   */
  body: string | null;

  /**
   * The email subject.
   *
   * Returns `null` if no subject was detected.
   */
  subject: string | null;
}

/**
 * A phone number and it's detected type, e.g. `VisionBarcodePhoneType.MOBILE`
 *
 * #### Example
 *
 * ```js
 * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
 *
 * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
 *
 * if (barcode && barcode.valueType === VisionBarcodeValueType.PHONE) {
 *   console.log(barcode.phone);
 * } else if (barcode && barcode.valueType === VisionBarcodeValueType.CONTACT_INFO) {
 *   console.log(barcode.contactInfo.phones[0]);
 * }
 */
export interface VisionBarcodePhone {
  /**
   * The detected phone number.
   *
   * Returns `null` if no number detected for this type.
   */
  number: string | null;

  /**
   * Gets type of the phone number, e.g. `VisionBarcodePhoneType.MOBILE`.
   *
   * See also `VisionBarcodePhoneType`.
   */
  type: number;
}
