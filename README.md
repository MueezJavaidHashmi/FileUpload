## Description

This project aims to upload all types of files to aws s3. It does not use popular libraries which do this by using multipart/form-data.
It does so with all types of content-type like image/png.

In order to achieve this task and use same amount of memory regardless of file size we use streams to write this file, and then we use streams to upload the file to AWS.

You can specify the maximum file size which can be uploaded. In the case an image gets uploaded you can also set the maximum image dimensions allowed. Currently, there are three sizes thumb, medium and large. These can be configured in the environment.

The service currently contains only one endpoint which is /{filename}. You need to also specify what file extensions are allowed and what file types are allowed. These can also be configured in the environment.

If you need more help setting-up the project env you can also refer to the .env.example file which has tips to set up the environment.

Hope you have a great time using the project! :smile:
