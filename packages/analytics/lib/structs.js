/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import struct from '@react-native-firebase/app/lib/common/struct';

const Item = struct({
  item_brand: 'string?',
  item_id: 'string?',
  item_name: 'string?',
  item_category: 'string?',
  item_category2: 'string?',
  item_category3: 'string?',
  item_category4: 'string?',
  item_category5: 'string?',
  item_list_id: 'string?',
  item_list_name: 'string?',
  item_location_id: 'string?',
  item_variant: 'string?',
  quantity: 'number?',
  price: 'number?',
});

export const ScreenView = struct.interface({
  screen_class: 'string?',
  screen_name: 'string?',
});

export const AddPaymentInfo = struct({
  items: struct.optional([Item]),
  value: 'number?',
  currency: 'string?',
  coupon: 'string?',
  payment_type: 'string?',
});

export const AddShippingInfo = struct({
  items: struct.optional([Item]),
  value: 'number?',
  currency: 'string?',
  coupon: 'string?',
  shipping_tier: 'string?',
});

export const AddToCart = struct({
  items: struct.optional([Item]),
  value: 'number?',
  currency: 'string?',
});

export const AddToWishlist = struct({
  items: struct.optional([Item]),
  value: 'number?',
  currency: 'string?',
});

export const BeginCheckout = struct({
  items: struct.optional([Item]),
  value: 'number?',
  currency: 'string?',
  coupon: 'string?',
});

export const CampaignDetails = struct({
  source: 'string',
  medium: 'string',
  campaign: 'string',
  term: 'string?',
  content: 'string?',
  aclid: 'string?',
  cp1: 'string?',
});

export const EarnVirtualCurrency = struct({
  virtual_currency_name: 'string',
  value: 'number',
});

export const GenerateLead = struct({
  currency: 'string?',
  value: 'number?',
});

export const JoinGroup = struct({
  group_id: 'string',
});

export const LevelEnd = struct({
  level: 'number',
  success: 'string?',
});

export const LevelStart = struct({
  level: 'number',
});

export const LevelUp = struct({
  level: 'number',
  character: 'string?',
});

export const Login = struct({
  method: 'string',
});

export const PostScore = struct({
  score: 'number',
  level: 'number?',
  character: 'string?',
});

export const Refund = struct({
  affiliation: 'string?',
  coupon: 'string?',
  currency: 'string?',
  items: struct.optional([Item]),
  shipping: 'number?',
  tax: 'number?',
  value: 'number?',
  transaction_id: 'string?',
});

export const Purchase = struct({
  affiliation: 'string?',
  coupon: 'string?',
  currency: 'string?',
  items: struct.optional([Item]),
  shipping: 'number?',
  tax: 'number?',
  value: 'number?',
  transaction_id: 'string?',
});

export const RemoveFromCart = struct({
  currency: 'string?',
  items: struct.optional([Item]),
  value: 'number?',
});

export const Search = struct({
  search_term: 'string',
  number_of_nights: 'number?',
  number_of_rooms: 'number?',
  number_of_passengers: 'number?',
  origin: 'string?',
  destination: 'string?',
  start_date: 'shortDate?',
  end_date: 'shortDate?',
  travel_class: 'string?',
});

export const SelectContent = struct({
  content_type: 'string',
  item_id: 'string',
});

export const SelectItem = struct({
  items: struct.optional([Item]),
  item_list_id: 'string?',
  item_list_name: 'string?',
  content_type: 'string?',
});

export const SelectPromotion = struct({
  creative_name: 'string',
  creative_slot: 'string',
  items: struct.optional([Item]),
  location_id: 'string',
  promotion_id: 'string',
  promotion_name: 'string',
});

export const SetCheckoutOption = struct({
  checkout_step: 'number',
  checkout_option: 'string',
});

export const Share = struct({
  content_type: 'string',
  item_id: 'string',
  method: 'string',
});

export const SignUp = struct({
  method: 'string',
});

export const SpendVirtualCurrency = struct({
  item_name: 'string',
  virtual_currency_name: 'string',
  value: 'number',
});

export const UnlockAchievement = struct({
  achievement_id: 'string',
});

export const ViewCart = struct({
  currency: 'string?',
  items: struct.optional([Item]),
  value: 'number?',
});

export const ViewItem = struct({
  currency: 'string?',
  items: struct.optional([Item]),
  value: 'number?',
});

export const ViewItemList = struct({
  items: struct.optional([Item]),
  item_list_id: 'string?',
  item_list_name: 'string?',
});

export const ViewPromotion = struct({
  items: struct.optional([Item]),
  location_id: 'string?',
  creative_name: 'string?',
  creative_slot: 'string?',
  promotion_id: 'string?',
  promotion_name: 'string?',
});

export const ViewSearchResults = struct({
  search_term: 'string',
});
