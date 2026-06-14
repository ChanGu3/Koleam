# Development DATA

- data such as the sqlite file for the database and the uploaded images and videos will exist in this folder for development

## Database Directory [Contains]

- sqlite.db (database file)

## Uploads Directory [Contains]

- titles (All Titles)
- titles/{title_id} (Title Data such as cover.jpg and installments)
- titles/{title_id}/{installment_id} (Installments Data of a Title such as streams)
- titles/{title_id}/{installment_id}/{stream_label} (Streams Data of a Installment such as thumbnail.jpg, the master and other m3u8 files with the corresponding segments or single files for video resolutions, subtitle, and audio)
