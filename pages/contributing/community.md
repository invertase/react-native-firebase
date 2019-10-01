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

## Other ways to Contribute

You can learn more about other ways of contributing to this project by visiting any of the sections below.

<Grid columns="2">
	<Block
		icon="error_outline"
		color="#2196f3"
		title="Issues, PRs & Project Management"
		to="/contributing/issues-prs-pm"
	>
		Help out with GitHub Issues, answering help requests on Discord and reviewing GitHub Pull Requests. This helps maintainers focus more on programming.
	</Block>
	<Block
		icon="library_books"
		color="#ffc107"
		title="Documentation"
		to="/contributing/documentation"
	>
		Adding new guides, examples, updating references or new FAQs. We also welcome grammatical improvements, e.g. fixing spelling mistakes.
	</Block>
	<Block
		icon="code"
		color="#673ab7"
		title="Code, Testing & Review"
		to="/contributing/code-testing-review"
	>
		Learn how to contribute, review and test code to the project and learn more about our coding guidelines.
	</Block>
	<Block
		icon="edit"
		color="#673ab7"
		title="Marketing & Content"
		to="/contributing/marketing-content"
	>
		Have you recently written an article or tutorial about React Native Firebase? We'd love to include it on the documentation.
	</Block>
	<Block
		icon="attach_money"
		color="#ffeb3b"
		title="Donations & Expenses"
		to="/contributing/donations-expenses"
	>
		Donating through our Open Collective exclusively helps to support all the maintainers and collaborators. We also encourage contributors to submit expenses for work done.
	</Block>
</Grid>
