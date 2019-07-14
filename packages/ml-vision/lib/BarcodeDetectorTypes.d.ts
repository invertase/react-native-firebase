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
   *   console.log(barcode.contactInfo)
   * }
   */
  contactInfo?: VisionBarcodeContactInfo;
}

/**
 * A person's or organization's business card. For example a VCARD.
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
   * Gets contact person's title. E.g. `Dr`
   *
   * Returns `null` if no title detected.
   */
  title: string | null;

  /**
   * Gets contact person's organization.
   *
   * Returns `null` if no organization detected.
   */
  organization: string | null;

  /**
   * Gets contact person's phones.
   * Returns an empty array if nothing found.
   */
  phones: VisionBarcodePhone[];

  /**
   * Gets contact person's emails.
   * Returns an empty array if nothing found.
   */
  emails: VisionBarcodeEmail[];

  /**
   * Gets the contact person's name.
   */
  name: VisionBarcodePersonName;
}

/**
 * A person's name, both formatted version and their individual name components.
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
