# My Image

An image bookmarklet that shows the image details and allows you to copy the image URL and download the image.
CSS courtesy of ChatGPT.

## IMPORTANT!

Though CSS is within myimage.css, it is loaded from my media server (which I manually copy).
If the script ends up becoming too long, I will move it to that server as well.

## Development

```bash
npm install
npm run build
```

This will create a bookmarklet in `build/output.txt`.

## Usage

1. Drag the `bookmarklet.js` to your bookmarks bar.
2. Navigate to a page with images.
3. Click the bookmarklet.
4. Click on an image to see the image details.
5. Click "Copy Image URL" to copy the image URL to your clipboard.
6. Click "Download Image" to download the image to your computer.
