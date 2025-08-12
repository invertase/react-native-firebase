/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// Module declarations for analytics package internal dependencies

declare module './struct' {
  export function validateStruct(object: any, struct: any, prefix: string): any;
  export function validateCompound(object: any, key1: string, key2: string, prefix: string): void;
}

declare module './version' {
  const version: string;
  export default version;
}

declare module './structs' {
  export const AddPaymentInfo: any;
  export const ScreenView: any;
  export const AddShippingInfo: any;
  export const AddToCart: any;
  export const AddToWishlist: any;
  export const BeginCheckout: any;
  export const CampaignDetails: any;
  export const EarnVirtualCurrency: any;
  export const GenerateLead: any;
  export const JoinGroup: any;
  export const LevelEnd: any;
  export const LevelStart: any;
  export const LevelUp: any;
  export const Login: any;
  export const PostScore: any;
  export const SelectContent: any;
  export const Purchase: any;
  export const Refund: any;
  export const RemoveFromCart: any;
  export const Search: any;
  export const SelectItem: any;
  export const SetCheckoutOption: any;
  export const SelectPromotion: any;
  export const Share: any;
  export const SignUp: any;
  export const SpendVirtualCurrency: any;
  export const UnlockAchievement: any;
  export const ViewCart: any;
  export const ViewItem: any;
  export const ViewItemList: any;
  export const ViewPromotion: any;
  export const ViewSearchResults: any;
}

declare module './web/RNFBAnalyticsModule' {
  const fallBackModule: any;
  export default fallBackModule;
}
