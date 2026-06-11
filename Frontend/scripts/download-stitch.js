const https = require('https');
const fs = require('fs');
const path = require('path');

const htmlUrl = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE0MDZhNjRmMGM1YjQzMGQ5MzhkYWM2NDI0YzVjZTQxEgsSBxDE4vrMlxAYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ2NDkwNDQwNzEwMTgzODUyMw&filename=&opi=89354086';
const imgUrl = 'https://lh3.googleusercontent.com/aida/AP1WRLvw7SJS03uKJInq23wbkZMYazHyTajjRmRuUUyY7FeyuhpwVbcbdRoC2rV0rtZh5AF-rue4WCgQkI2HSzlIhDCXO4FveUyDE7BRmKqqAUqu5pgdMy3rg6nbtsjPW_5q7QJE4CHX_MtnmJsmZSQ2dPlQBoSdTCEk-VuIT8hvETQHoaCcKuSyNcdfB7KI1X_76DM8rl61sWMmCSDuY2bslL4_ht4_FYQywUDQKNIKoF7cMOp1LKLGtEyrAjkW';

const htmlPath = path.join(__dirname, '..', '..', 'stitch_dashboard.html');
const imgPath = path.join(__dirname, '..', '..', 'stitch_dashboard.png');

function download(url, dest, callback) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      // Follow redirect
      download(response.headers.location, dest, callback);
      return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(callback);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error(`Error downloading ${url}:`, err.message);
  });
}

console.log('Downloading Stitch Owner Dashboard HTML...');
download(htmlUrl, htmlPath, () => {
  console.log(`Saved Stitch HTML to: ${htmlPath}`);
  console.log('Downloading Stitch Owner Dashboard screenshot...');
  download(imgUrl, imgPath, () => {
    console.log(`Saved Stitch screenshot to: ${imgPath}`);
  });
});
