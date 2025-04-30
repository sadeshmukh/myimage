# My Image

An image bookmarklet that shows the image details and allows you to copy the image URL and download the image.
CSS courtesy of ChatGPT.

## IMPORTANT!

The minimarklet.js is a smaller version that pulls it from https://static.sahil.ink/myimage/bookmarklet.js.
Also, all CSS is pulled from https://static.sahil.ink/myimage/index.css, a clone of myimage.css.

## Development

```bash
npm install
npm run build
```

This will create a bookmarklet in `build/output.txt`.

```bash
npm run build-mini
```

This will create a smaller bookmarklet in `build/mini.txt`.

## Usage

1. Drag the output in `build/mini.txt` to your bookmarks bar.
2. Navigate to a page with images.
3. Click the bookmarklet.
4. Click on an image to see the image details.
5. Click "Copy Image URL" to copy the image URL to your clipboard.
6. Click "Download Image" to download the image to your computer.
