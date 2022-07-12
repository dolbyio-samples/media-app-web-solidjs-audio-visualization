# Dolby.io Sample Application for wavesurfer & konva in SolidJS
This is a SolidJS sample application demonstrating the use of Dolby.io Enhancement API in Media APIs, with visualization by wavesurfer.js and interactive UI by konva.

## Usage

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


## Available Scripts

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

**Caution: OAuth access token function and key credentials should be implemented on the server side** 
You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)