# Tools
<!-- markdownlint-disable MD033 -->

## API Server


Thease are the main tools used on the backend of course look at [package.json](/full-stack/src/server/package.json) for more tools utilized.

<div style="display: grid; grid-template-columns: repeat(3, auto); grid-gap: 12px; place-items: center;">
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  express
</p>
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  ffmpeg x ffprobe
</p>
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  sequelize x sqlite3
</p>
  </div>
  
<br>

<b>Express:</b> This is used to expose routes on a selected port on the computer, node is running the script on using other tools like multer, cors, cookie-parser, express-session, and more to enhance its capabilites.

<b>FFMPEG & FFPROBE:</b> is used to render and extract information from media files subtitles as its own extension and a simple .vtt file. Then audio and video are rendered into seperate segmeneted .ts files that make up their original full lentgth file.
These are used with their m3u8 files along with a master m3u8 file to serve them onto the website for streaming!

<b>Sequelize x Sqlite3:</b> Sequlize is a Object Relational Mapper (ORM) that maps or wraps SQL commands using an api written here in javascript. Currently it uses Sqlite3 as its SQL engine for storing relational data that also points to the uploaded files such as media.

## Web App

Thease are the main tools used on the frontend of course look at [package.json](/full-stack/src/web-client/package.json) for more tools utilized.

<div style="display: grid; grid-template-columns: repeat(3, auto); grid-gap: 12px; place-items: center;">
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  react x vite
</p>
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  ffmpeg.wasm
</p>
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  tailwind
</p>
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  hls
</p>
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  LIBASS.wasm
</p>
<p style="color: #f8f8ff; background-color: #0f0f0f; font-size: 24px; font-family: Arial, sans-serif; padding: 12px; border-radius: 4px; height: 80px; width: 250px; display: flex; justify-content: center; align-items: center; margin: 0;">
  lucide react
</p>
  </div>
  
<br>

<b>React x Vite:</b> React acts as teh UI library that is used to design htmls using components in a xml .jsx format so that Vite can bundle the entire structure of the web-client directory into a usable web app in a one page solution.

<b>FFMPEG.wasm:</b> Similarly to FFMPEG in the backend however it is primarly used extract information from a media file to autopopulate data for the user.

<b>Tailwind:</b> A abstract styling library for CSS using only class names to style elements in html. The [tailwind.config.js](/full-stack//src//web-client/tailwind.config.js) can be used to configure more styling options like color and animation that extends onto the existing classes.

<b>HLS:</b> Heavily simplifies the process of fetching the m3u8 files to serve the media files subtile, audio, and video. Dealing with buffering, auto resolution for less fortunate playback speeds, loading the different media files segments, and more.

<b>LIBASS.wasm:</b> Used to draw more advanced subtitles, SubStation Alpha (.ssa) and Advanced SubStation (.ass) onto the canvas of the video player instead of the default .vtt subtitling.

<b>Lucide React:</b> Definitely an honorable mention as it makes up much of the svg icons using their library for ease of use.

<b>Note:</b> Web Assembly (WASM) is a way to use bytecode to be ran in the browser compiled from the same or other languages like C/C++ so that another worker thread besides the main can run the compiled code. Its accessed through the javascript API implemented for it using a sharedarraybuffer to pass data between the instance and the main thread.
