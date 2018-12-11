---
title: Overview
layout: overview
---

<grid columns="3" gap="40">
  <card
    icon="devices_other"
    title="Installation"
    color="#2196F3"
    to="/{{ latest_version }}/installation"
  >
    Install React Native Firebase with our step by step guide for
    JavaScript, Android & iOS.
  </card>
  <card
    icon="school"
    title="Guides"
    color="#4CAF50"
    to="/guides"
  >
    Our guides cover development use-cases from setup to advanced topics.
  </card>
  <card
    icon="layers"
    title="Reference"
    color="#00BCD4"
    to="/{{ latest_version }}/reference"
  >
    Start your next project
    with our full API reference documentation.
  </card>
</grid>

## Supported Firebase Products

<firebase-products></firebase-products>

<grid columns="2" gap="50">
    <list title="Resources">
        <list-item
            to="/releases"
            icon="cake"
            title="Releases"
            color="#9C27B0"
        >
            Keep up to date with the features an fixes in our versioned release guides. The latest version is v5.x.x.
        </list-item>
        <list-item
            to="/faqs"
            icon="question_answer"
            title="Frequently Asked Questions"
            color="#1e88e5"
        >
            Have a question? It may be answered in our of our Frequently Asked Questions.
        </list-item>
        <list-item
            to="/support"
            icon="bug_report"
            title="Support"
            color="#f44336"
        >
            Found a bug or need further help with the library - find out how and where you can get support.
        </list-item>
        <list-item
            to="/contributing"
            icon="favorite"
            title="Contributing"
            color="#E91E63"
        >
            Interested in contributing to the library but don't know where to start?
        </list-item>
        <list-item
            to="/feedback"
            icon="build"
            title="Feedback"
            color="#FFC107"
        >
            Do you have a feature request or would like to provide constructive feedback to the libary?
            Add a request to our Canny board.
        </list-item>
        <list-item
            to="https://discordapp.com/invite/XsKpw4"
            title="Community Chat"
        >
            Our active and helpful community chat can be found on our Discord server.
            <discord></discord>
        </list-item>
    </list>
    <div>
        <h2>Github <a href="https://github.com/invertase/react-native-firebase"><small>invertase/react-native-firebase &#187;</small></a></h3>
        <github-card org="invertase" repo="react-native-firebase"></github-card>
    </div>
</grid>
