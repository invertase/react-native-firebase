---
title: Overview
layout: overview
---

<Grid columns={3} gap={40}>
  <Card
    icon="devices_other"
    title="Installation"
    color="#2196F3"
    to="/{{ latest_version }}/installation"
  >
    Install React Native Firebase with our step by step guide for
    JavaScript, Android & iOS.
  </Card>
  <Card
    icon="school"
    title="Guides"
    color="#4CAF50"
    to="/guides"
  >
    Getting started with React Native Firebase, or looking for 
    advanced topics? Our guides are a great place to start.
  </Card>
  <Card
    icon="layers"
    title="Reference"
    color="#00BCD4"
    to="/{{ latest_version }}/reference"
  >
    Start your next project with full module API reference,
    descriptions and examples.
  </Card>
</Grid>

## Supported Firebase Products

<FirebaseProducts />

<Grid columns={2} gap={50}>
    <Grid.Item>
      <Heading el="h3">Resources</Heading>
      <List>
          <List.Item
              to="/releases"
              icon="cake"
              title="Releases"
              color="#9C27B0"
          >
              Keep up to date with the features an fixes in our versioned release guides. The latest version is v5.x.x.
          </List.Item>
          <List.Item
              to="/faqs"
              icon="question_answer"
              title="Frequently Asked Questions"
              color="#1e88e5"
          >
              Have a question? It may be answered in our of our Frequently Asked Questions.
          </List.Item>
          <List.Item
              to="/support"
              icon="bug_report"
              title="Support"
              color="#f44336"
          >
              Found a bug or need further help with the library - find out how and where you can get support.
          </List.Item>
          <List.Item
              to="/contributing"
              icon="favorite"
              title="Contributing"
              color="#E91E63"
          >
              Interested in contributing to the library but don't know where to start?
          </List.Item>
          <List.Item
              to="/feedback"
              icon="build"
              title="Feedback"
              color="#FFC107"
          >
              Do you have a feature request or would like to provide constructive feedback to the libary?
              Add a request to our Canny board.
          </List.Item>
          <List.Item
              to="https://discordapp.com/invite/XsKpw4"
              icon="chat_bubble"
              title="Community Chat"
              color="#7289DA"
          >
              Our active and helpful community chat can be found on our Discord server.
              <Discord />
          </List.Item>
      </List>
    </Grid.Item>  
    <Grid.Item>
        <Heading 
          el="h3"
          actions={[<Anchor></Anchor>]}
        >
          Github
        </Heading>
        <GithubCard org="invertase" repo="react-native-firebase" />
    </Grid.Item>
</Grid>
