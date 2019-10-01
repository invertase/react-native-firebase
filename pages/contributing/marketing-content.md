---
title: Marketing & Content
description: Have you written an article or tutorial about React Native Firebase? Let us know and we can help promote it on our website.
---

# Marketing & Content

## Content Submission

Have you written an article or blog post about React Native Firebase? We're always looking for external content
to help promote the library and we'd love to have it featured on this website. We accept submissions from self
hosted sites or 3rd party hosted sites such as Medium.

### Self hosted content

Please send us a link to your content. After successful review, we'll add this to our website in
the appropriate sections. Content will be 301 directed from the website to the external content.

<Form
    name="content-submission"
    success="Thank you for your submission. We'll let you know via email if your content has been accepted."
    required={['name', 'email', 'github', 'url']}
>
    <FormInput
        name="name"
        label="Name"
    />
    <FormInput
        name="email"
        label="Email Address"
    />
    <FormInput
        name="github"
        label="GitHub Profile"
        placeholder="https://github.com"
    />
    <FormInput
        name="url"
        label="Content URL"
        placeholder="https://"
    />
    <FormSubmit>Send Submission</FormSubmit>
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
		icon="person_pin"
		color="#3f51b5"
		title="Community & Events"
		to="/contributing/community"
	>
		Hosting a meetup or event that features React Native Firebase? We may be able to sponsor it through our Open Collective, provide swag or even attend it.
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
