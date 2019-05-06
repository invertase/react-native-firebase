workflow "Label PR" {
  on = "pull_request"
  resolves = "Labeler"
}

action "Synchronize or Opened" {
  uses = "actions/bin/filter@master"
  args = "action 'opened|synchronize'"
}

action "Labeler" {
  uses = "Asimetriq/github-actions/action-labeler@master"
  needs = "Synchronize or Opened"
  env = {
    LABEL_SPEC_FILE=".github/labeler.json"
  }
  secrets = ["GITHUB_TOKEN"]
}
