[![License](https://img.shields.io/github/license/dolbyio-samples/blog-wavesurfer-konva-solidjs)](LICENSE)

![Blog Picture](https://dolby.io/wp-content/uploads/2022/07/How-to-Visualize-and-anotate...wavesurfer-and-konva.jpg)

# Dolby.io Sample Application for Wavesurfer & Konva in SolidJS
This repo follows a [SolidJS sample application](https://dolby.io/blog/how-to-visualize-and-annotate-your-audio-with-wavesurfer-js-and-konva-in-solidjs/) demonstrating the use of Dolby.io Enhancement API in Media APIs, with visualization by wavesurfer.js and interactive UI by Konva.

# Overview
We will guide you through creating a frontend application to upload and visualize your audio, to annotate on your waveform, to communicate with Dolby.io Media API, and to download the enhanced audio. 

# Requirements 
Install dependencies<br>
```bash
$ npm install # or pnpm install or yarn install
```

To test your app locally, Dolby.io app key credentials are required for the OAuth access token function.<br>
```
VITE_CONSUMER_KEY=COPY_FROM_MEDIA_API_APP_KEY
VITE_CONSUMER_SECRET=COPY_FROM_MEDIA_API_APP_SECRET
```
Save it as ".env" file at project root directory then you can start testing or developing your app.<br>
OAuth access token function and Dolby.io app key credentials are written into the app **only for testing purpose, do not deploy this app as-is on public domain**.

# Getting Started 

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

**Caution: OAuth access token function and key credentials should be implemented on the server side.** 

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

# Report a Bug 
In the case any bugs occur, report it using Github issues, and we will see to it. 

# Forking
We welcome your interest in trying to experiment with our repos. 

# Feedback 
If there are any suggestions or if you would like to deliver any positive notes, feel free to open an issue and let us know!

# Learn More
For a deeper dive, we welcome you to review the following:
 - [Media Enhance API](https://docs.dolby.io/media-apis/docs/enhance-api-guide)
 - [Getting Started with Enhance API](https://docs.dolby.io/media-apis/docs/quick-start-to-enhancing-media)
 - [API Reference](https://docs.dolby.io/media-apis/reference/media-enhance-post)
 - [Visualizing Media Diagnose Workflows with Postman Flows](https://dolby.io/blog/visualizing-media-diagnose-workflows-with-postman-flows/)
 - [Transcoding Files Using Zapier, Google Drive, and Dolby.io](https://dolby.io/blog/transcoding-files-using-zapier-google-drive-and-dolby-io/)
 - [Searching Video to Find Loudness and Music Sections](https://dolby.io/blog/searching-video-to-find-loudness-and-music-sections-analyze-data/)
 - [Blog Session - Media API](https://dolby.io/search/?_blog_categories=media)

# About Dolby.io
Using decades of Dolby's research in sight and sound technology, Dolby.io provides APIs to integrate real-time streaming, voice & video communications, and file-based media processing into your applications. [Sign up for a free account](https://dashboard.dolby.io/signup/) to get started building the next generation of immersive, interactive, and social apps.

<div align="center">
  <a href="https://dolby.io/" target="_blank"><img src="https://img.shields.io/badge/Dolby.io-0A0A0A?style=for-the-badge&logo=dolby&logoColor=white"/></a>
&nbsp; &nbsp; &nbsp;
  <a href="https://docs.dolby.io/" target="_blank"><img src="https://img.shields.io/badge/Dolby.io-Docs-0A0A0A?style=for-the-badge&logoColor=white"/></a>
&nbsp; &nbsp; &nbsp;
  <a href="https://dolby.io/blog/category/developer/" target="_blank"><img src="https://img.shields.io/badge/Dolby.io-Blog-0A0A0A?style=for-the-badge&logoColor=white"/></a>
</div>

<div align="center">
&nbsp; &nbsp; &nbsp;
  <a href="https://youtube.com/@dolbyio" target="_blank"><img src="https://img.shields.io/badge/YouTube-red?style=flat-square&logo=youtube&logoColor=white" alt="Dolby.io on YouTube"/></a>
&nbsp; &nbsp; &nbsp; 
  <a href="https://twitter.com/dolbyio" target="_blank"><img src="https://img.shields.io/badge/Twitter-blue?style=flat-square&logo=twitter&logoColor=white" alt="Dolby.io on Twitter"/></a>
&nbsp; &nbsp; &nbsp;
  <a href="https://www.linkedin.com/company/dolbyio/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white" alt="Dolby.io on LinkedIn"/></a>
</div>



