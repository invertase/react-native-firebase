---
title: Community
description: Hosting a meeting or event which features React Native Firebase? Let us know and we may be able to send some goodies or attend.
---

# Community

We always love to hear about React Native Firebase being featured at community events. Whether you're 
hosting, speaking or attending an event which involves the library, please let us know using the form below.

We'd love to help promote the event via:

- Twitter exposure on our [@rnfirebase](https://twitter.com/rnfirebase) account.
- Members of our team attending the event in person.
- Giving out React Native Firebase T-Shirts.
- Sending stickers of the library logo.

## Get in touch

Please send as many details of the event as possible:

<Form 
    success="Thanks, we aim to respond to all enquiries within 48 hours."
    required={['name', 'email', 'type', 'event', 'details']}
>
    <Form.Input 
        id="name"
        label="Name"
    />
    <Form.Input 
        id="email"
        label="Email Address"
    />
    <Form.Select 
        id="type"
        label="Your role"
    >
        <Form.Select.Option value="host" label="Event Host" />
        <Form.Select.Option value="speaker" label="Event Speaker" />
        <Form.Select.Option value="attendee" label="Event Attendee" />
    </Form.Select>
    <Form.Input 
        id="event"
        label="Event Name"
    />
    <Form.TextArea 
        id="details"
        label="Event Details"
        placeholder="Please include details such as location, date, time, talk and anything else related to the event"
    />
    <Form.Submit>
        Send Enquiry
    </Form.Submit>
</Form>