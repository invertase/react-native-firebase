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
    name="community"
    success="Thanks, we aim to respond to all enquiries within 48 hours."
    required={['name', 'email', 'type', 'event', 'details']}
>
    <FormInput 
        name="name"
        label="Name"
    />
    <FormInput 
        name="email"
        label="Email Address"
    />
    <FormSelect 
        name="type"
        label="Your role"
    >
        <FormSelectOption value="host" label="Event Host" />
        <FormSelectOption value="speaker" label="Event Speaker" />
        <FormSelectOption value="attendee" label="Event Attendee" />
    </FormSelect>
    <FormInput 
        name="event"
        label="Event Name"
    />
    <FormTextArea 
        name="details"
        label="Event Details"
        placeholder="Please include details such as location, date, time, talk and anything else related to the event"
    />
    <FormSubmit>
        Send Enquiry
    </FormSubmit>
</Form>
