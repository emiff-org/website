# How to reindex site content

Essential documentation:

- https://www.aem.live/developer/indexing
- https://www.aem.live/docs/indexing-reference
- https://www.aem.live/docs/admin.html#tag/index/operation/indexResource
- https://github.com/adobe/helix-shared/blob/main/docs/index.schema.json

follow these steps to update your query-index sheet in GDrive:
- make sure all content is in published state
- authenticate to Admin API using your Google account
  - https://admin.hlx.page/login
- grab auth_token cookie and add as header attribute using API tool (e.g. Bruno)
- send PUT to endpoint https://admin.hlx.page/index/emiff-org/emiff-website/main/*

afterwards query-index in GDrive root should be updated
