# Basis Theory GitHub Actions

## Deploy Notifier

This action will notify a Slack channel on specific deployment actions.

### Inputs

* `slack-api-token` - **Required** The Slack API token.
* `channel` - **Required** The channel to send the message.
* `mention_person` - **Optional** The user to mention in the message.
* `status` - **Optional** The status of the run. Can be `start`, `done`, or `request`. Default is `start`.

### Example usage


```yaml
name: Product Deploy

on:
  release:
    branches: [ master ]
    types: [ released ]

jobs:
  request_approval:
    runs-on: ubuntu-latest
    steps:
    - name: Send Deploy Request
      uses: Basis-Theory/github-actions/deploy-slack-action@master
      with:
        slack-api-token: ${{ secrets.API_TOKEN }}
        channel: ${{ vars.APPROVALS_CHANNEL }}
        mention_person: ${{ vars.APPROVER }}
        status: 'request'
    - name: Start Deploy Message
      uses: Basis-Theory/github-actions/deploy-slack-action@master
      with:
        slack-api-token: ${{ secrets.API_TOKEN }}
        channel: ${{ vars.DEPLOY_CHANNEL }}
    - name: Sleep for 10 seconds
      run: sleep 10s
      shell: bash
    - name: Stop Deploy Message
      if: always()
      uses: Basis-Theory/github-actions/deploy-slack-action@master
      with:
       slack-api-token: ${{ secrets.API_TOKEN }}
       channel: ${{ vars.DEPLOY_CHANNEL }}
       status: 'done'
```

## Slack

This action sends a message to a Slack channel.

### Inputs

* `slack-api-token` - **Required** The Slack API token.
* `channel` - **Required** The channel to send the message.
* `text` - **Optional** The text of the message.
* `blocks` - **Optional** The [blocks](https://app.slack.com/block-kit-builder/) of the message.
* `update-message-id` - **Optional** The message ID to update.
* `thread-message-id` - **Optional** The message ID to add the message to a thread.

### Outputs

* `message_id` - The message Id of the sent message

### Example

```yaml
name: Send Messages

on:
  push:
    branches: [ master ]

jobs:
  request_approval:
    runs-on: ubuntu-latest
    steps:
    - name: Just a message
      id: first_message
      uses: Basis-Theory/github-actions/slack-message-action@master
      with:
        slack-api-token: ${{ secrets.API_TOKEN }}
        channel: ${{ vars.CHANNEL }}
        blocks: |
          [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": ":rocket:  Check it out"
              } 
            }
          ]
    - name: Update a message
      id: update_message
      uses: Basis-Theory/github-actions/slack-message-action@master
      with:
        slack-api-token: ${{ secrets.API_TOKEN }}
        channel: ${{ vars.CHANNEL }}
        update-message-id: ${{ steps.first_message.outputs.message_id }}
        blocks: |
          [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": ":rocket:  Check it out - updated"
              } 
            }
          ]
    - name: Thread a message
      id: thread_message
      uses: Basis-Theory/github-actions/slack-message-action@master
      with:
        slack-api-token: ${{ secrets.API_TOKEN }}
        channel: ${{ vars.CHANNEL }}
        thread-message-id: ${{ steps.first_message.outputs.message_id }}
        blocks: |
          [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": ":threads:  thead it out"
              } 
            }
          ]
```