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

import { object, string, number, array, optional, define, type } from 'superstruct';

const ShortDate = define(
  'ShortDate',
  value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value),
);

const Item = type({
  item_brand: optional(string()),
  item_id: optional(string()),
  item_name: optional(string()),
  item_category: optional(string()),
  item_category2: optional(string()),
  item_category3: optional(string()),
  item_category4: optional(string()),
  item_category5: optional(string()),
  item_list_id: optional(string()),
  item_list_name: optional(string()),
  item_location_id: optional(string()),
  item_variant: optional(string()),
  quantity: optional(number()),
  price: optional(number()),
});

export const ScreenView = type({
  screen_class: optional(string()),
  screen_name: optional(string()),
});

export const AddPaymentInfo = object({
  items: optional(array(Item)),
  value: optional(number()),
  currency: optional(string()),
  coupon: optional(string()),
  payment_type: optional(string()),
});

export const AddShippingInfo = object({
  items: optional(array(Item)),
  value: optional(number()),
  currency: optional(string()),
  coupon: optional(string()),
  shipping_tier: optional(string()),
});

export const AddToCart = object({
  items: optional(array(Item)),
  value: optional(number()),
  currency: optional(string()),
});

export const AddToWishlist = object({
  items: optional(array(Item)),
  value: optional(number()),
  currency: optional(string()),
});

export const BeginCheckout = type({
  items: optional(array(Item)),
  value: optional(number()),
  currency: optional(string()),
  coupon: optional(string()),
});

export const CampaignDetails = object({
  source: string(),
  medium: string(),
  campaign: string(),
  term: optional(string()),
  content: optional(string()),
  aclid: optional(string()),
  cp1: optional(string()),
});

export const EarnVirtualCurrency = object({
  virtual_currency_name: string(),
  value: number(),
});

export const GenerateLead = object({
  currency: optional(string()),
  value: optional(number()),
});

export const JoinGroup = object({
  group_id: string(),
});

export const LevelEnd = object({
  level: number(),
  success: optional(string()),
});

export const LevelStart = object({
  level: number(),
});

export const LevelUp = object({
  level: number(),
  character: optional(string()),
});

export const Login = object({
  method: string(),
});

export const PostScore = object({
  score: number(),
  level: optional(number()),
  character: optional(string()),
});

export const Refund = object({
  affiliation: optional(string()),
  coupon: optional(string()),
  currency: optional(string()),
  items: optional(array(Item)),
  shipping: optional(number()),
  tax: optional(number()),
  value: optional(number()),
  transaction_id: optional(string()),
});

export const Purchase = type({
  affiliation: optional(string()),
  coupon: optional(string()),
  currency: optional(string()),
  items: optional(array(Item)),
  shipping: optional(number()),
  tax: optional(number()),
  value: optional(number()),
  transaction_id: optional(string()),
});

export const RemoveFromCart = object({
  currency: optional(string()),
  items: optional(array(Item)),
  value: optional(number()),
});

export const Search = object({
  search_term: string(),
  number_of_nights: optional(number()),
  number_of_rooms: optional(number()),
  number_of_passengers: optional(number()),
  origin: optional(string()),
  destination: optional(string()),
  start_date: optional(ShortDate),
  end_date: optional(ShortDate),
  travel_class: optional(string()),
});

export const SelectContent = object({
  content_type: string(),
  item_id: string(),
});

export const SelectItem = object({
  items: optional(array(Item)),
  item_list_id: optional(string()),
  item_list_name: optional(string()),
  content_type: optional(string()),
});

export const SelectPromotion = object({
  creative_name: string(),
  creative_slot: string(),
  items: optional(array(Item)),
  location_id: string(),
  promotion_id: string(),
  promotion_name: string(),
});

export const SetCheckoutOption = object({
  checkout_step: number(),
  checkout_option: string(),
});

export const Share = object({
  content_type: string(),
  item_id: string(),
  method: string(),
});

export const SignUp = object({
  method: string(),
});

export const SpendVirtualCurrency = object({
  item_name: string(),
  virtual_currency_name: string(),
  value: number(),
});

export const UnlockAchievement = object({
  achievement_id: string(),
});

export const ViewCart = object({
  currency: optional(string()),
  items: optional(array(Item)),
  value: optional(number()),
});

export const ViewItem = object({
  currency: optional(string()),
  items: optional(array(Item)),
  value: optional(number()),
});

export const ViewItemList = object({
  items: optional(array(Item)),
  item_list_id: optional(string()),
  item_list_name: optional(string()),
});

export const ViewPromotion = object({
  items: optional(array(Item)),
  location_id: optional(string()),
  creative_name: optional(string()),
  creative_slot: optional(string()),
  promotion_id: optional(string()),
  promotion_name: optional(string()),
});

export const ViewSearchResults = object({
  search_term: string(),
});
