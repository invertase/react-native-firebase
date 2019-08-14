---
title: Reserved Events
description: Analytics works out of the box, however automatically reserved a number of events for its own use.
---

# Reserved Events

The Analytics package works out of the box, however a number of events are automatically reported to Firebase.
These event names are called as 'Reserved Events'. Attempting to send any custom event using the `logEvent` method
with any of the following event names will throw an error.

## Reserved event list

- `app_clear_data`
- `app_uninstall`
- `app_update`
- `error`
- `first_open`
- `first_visit`
- `first_visit`
- `first_open_time`
- `first_visit_time`
- `in_app_purchase`
- `in_app_purchase`
- `notification_dismiss`
- `notification_foreground`
- `notification_open`
- `notification_receive`
- `os_update`
- `session_start`
- `screen_view`
- `user_engagement`
- `ad_impression`
- `ad_click`
- `ad_query`
- `ad_exposure`
- `adunit_exposure`
- `ad_activeiew`
