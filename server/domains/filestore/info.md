#Filestore

Besides integrating other file systems (eg Amazon S3, Azure File Store) or integrating other providers (Google Drive, Dropbox,...),
having an own filestore would appeal especially to business use cases in a self hosting scenario.

- Sync files from a source system (eg CRM, ERP, ...) to enyine
- Use WebDAV to modify the file directly from external applications like Word.
- To view the content in a explorer-like structure third party WebDAV Apps, Clients for syncing the folders (optimal would be with offline mode) could be used.

Solution:

- Use MongoDB as Backend, GridFS.
- Use ES for metadata, fulltext.
- Save a version counter, save the fulltext-DIFF for the version-number
- Use jsDAV with a custom Mongo-Backend (lib/DAV/backends, search  lib/DAV/server.js - "options.type" for initialization of custom backends) [jsDav](https://github.com/mikedeboer/jsDAV)
- Structure: space/items/files, eg. PersonalSpaceBirdo/issue17/[documents]

