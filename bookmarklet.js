// ==Bookmarklet==
// @name MyImage
// @author sadeshmukh
// @style https://static.sahil.ink/myimage/index.css
// ==/Bookmarklet==

// just delete everything created just in case
const existingOverlays = document.querySelectorAll(".myimage-image-overlay");
const existingModals = document.querySelectorAll(".myimage-modal");
existingOverlays.forEach((overlay) => overlay.remove());
existingModals.forEach((modal) => modal.remove());

function convertToAscii(image) {
  image.crossOrigin = "anonymous"; // unprotects the image

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!image.complete || !image.naturalWidth) {
      image.onload = () => processImage();
    } else {
      processImage();
    }

    function processImage() {
      const targetWidth = 120;
      const scale = targetWidth / image.naturalWidth;
      const width = Math.floor(image.naturalWidth * scale * 2); // width must be double since character width is half of the character height
      const height = Math.floor(image.naturalHeight * scale);

      canvas.width = width;
      canvas.height = height;

      try {
        ctx.drawImage(image, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const chars = " .:-=+*#%@"; // reversed, since dark background (blank is dark, @ is bright)
        let ascii = "";
        const { data, width: imgWidth } = imageData;

        for (let i = 0; i < data.length; i += 4 * imgWidth) {
          for (let j = 0; j < imgWidth * 4; j += 4) {
            const r = data[i + j];
            const g = data[i + j + 1];
            const b = data[i + j + 2];
            const avg = (r + g + b) / 3;
            const index = Math.floor((avg / 255) * (chars.length - 1));
            ascii += chars[index];
          }
          ascii += "\n";
        }
        resolve(ascii);
      } catch (error) {
        resolve("ASCII art not working");
      }
    }
  });
}

// because no umd is available (that I could find) this is a bit of a hack
const loadExtractColors = async () => {
  const module = await import(
    "https://cdn.jsdelivr.net/npm/extract-colors@4.2.0/+esm"
  );
  return module.extractColors;
};

// grab every image
const images = Array.from(document.getElementsByTagName("img"));
images.forEach((image, index) => {
  const rect = image.getBoundingClientRect();

  const overlay = document.createElement("div");
  overlay.classList.add("myimage-image-overlay");
  overlay.style.position = "fixed";
  overlay.style.top = rect.top + "px";
  overlay.style.left = rect.left + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";
  overlay.style.zIndex = "1000";
  overlay.style.overflow = "hidden"; // hides gradient outside of border
  overlay.style.pointerEvents = "auto";

  //  inner gradient div has the actual styling, container just stops overflow + positions
  const gradientDiv = document.createElement("div");
  gradientDiv.classList.add("gradient");
  // gradientDiv.style.width = "100%";
  // gradientDiv.style.height = "100%";
  // gradientDiv.style.pointerEvents = "none"; // let clicks go through to overlay
  overlay.appendChild(gradientDiv);

  document.body.appendChild(overlay);

  // need to update on scroll
  window.addEventListener("scroll", () => {
    const newRect = image.getBoundingClientRect();
    overlay.style.top = newRect.top + "px";
    overlay.style.left = newRect.left + "px";
  });

  overlay.addEventListener("click", async () => {
    const imageUrl = image.src;
    const imageAlt = image.alt;
    const imageDescription = image.title;
    const imageCaption = image.caption;

    const imageAscii = await convertToAscii(image);
    console.log(imageAscii);
    const modal = document.createElement("div");
    modal.classList.add("myimage-modal");

    const modalImg = document.createElement("img");
    modalImg.src = imageUrl;
    modalImg.alt = imageAlt;
    modalImg.title = imageDescription;
    modalImg.setAttribute("caption", imageCaption);
    modalImg.classList.add("modal-image");

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");

    const modalImgOverlay = document.createElement("div");
    modalImgOverlay.classList.add("modal-image-overlay");

    const modalImgOverlayText = document.createElement("div");
    modalImgOverlayText.classList.add("modal-image-overlay-text");
    modalImgOverlayText.textContent = imageAscii;

    modalImgOverlay.appendChild(modalImgOverlayText);

    let isAsciiVisible = false;
    modalImgOverlay.addEventListener("click", () => {
      isAsciiVisible = !isAsciiVisible;
      modalImgOverlayText.style.opacity = isAsciiVisible ? "1" : "0";
      modalImgOverlayText.style.backgroundColor = isAsciiVisible
        ? "rgba(0,0,0,0.7)"
        : "rgba(0,0,0,0)";
    });

    imageContainer.appendChild(modalImg);
    imageContainer.appendChild(modalImgOverlay);

    const infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");

    const leftSideContainer = document.createElement("div");
    leftSideContainer.classList.add("side-container", "left-side");

    const rightSideContainer = document.createElement("div");
    rightSideContainer.classList.add("side-container", "right-side");

    const tinEyeButton = document.createElement("button");
    tinEyeButton.textContent = "Search on TinEye";
    tinEyeButton.classList.add("button", "tineye-button");
    tinEyeButton.addEventListener("click", () => {
      window.open(
        `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`,
        "_blank",
      );
    });
    leftSideContainer.appendChild(tinEyeButton);

    const colorPaletteContainer = document.createElement("div");
    colorPaletteContainer.classList.add("color-palette");

    const getMainColors = async (img) => {
      try {
        const extractColors = await loadExtractColors();
        const colors = await extractColors(img.src, {
          pixels: 10000,
          distance: 0.2,
          colorCount: 3,
        });
        return colors.map((color) => color.hex);
      } catch (error) {
        console.error("Color extraction failed:", error);
        return ["#888888", "#666666", "#444444"]; // grey as fallback
      }
    };

    modalImg.addEventListener("load", async () => {
      const mainColors = await getMainColors(modalImg);
      colorPaletteContainer.innerHTML = mainColors
        .map(
          (color) => `
          <div class="color-box" style="background-color: ${color}">
            <span class="color-value">${color}</span>
          </div>
        `,
        )
        .join("");
    });

    rightSideContainer.appendChild(colorPaletteContainer);

    const detailsHTML = `
        <h3>Image Details</h3>
        <div class="details-grid">
            <strong>Dimensions:</strong> <span>${image.naturalWidth} × ${image.naturalHeight}px</span>
            <strong>File name:</strong> <span>${imageUrl.split("/").pop()}</span>
            <strong>Alt text:</strong> <span>${imageAlt || "<em>None</em>"}</span>
            <strong>File size:</strong> <span id="fileSize">Calculating...</span>
            <strong>Format:</strong> <span>${imageUrl.split(".").pop().split("?")[0].toUpperCase()}</span>
        </div>
    `;
    infoContainer.innerHTML = detailsHTML;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy Image URL";
    copyButton.classList.add("button", "copy-button");

    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download Image";
    downloadButton.classList.add("button", "download-button");

    const copyAsciiButton = document.createElement("button");
    copyAsciiButton.textContent = "Copy ASCII Art";
    copyAsciiButton.classList.add("button", "copy-ascii-button");
    copyAsciiButton.addEventListener("click", () => {
      navigator.clipboard.writeText(imageAscii);
      copyAsciiButton.textContent = "ASCII Copied!";
      setTimeout(() => (copyAsciiButton.textContent = "Copy ASCII Art"), 2000);
    });

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.classList.add("button", "close-button");

    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(imageUrl);
      copyButton.textContent = "Copied!";
      setTimeout(() => (copyButton.textContent = "Copy Image URL"), 2000);
    });

    downloadButton.addEventListener("click", async () => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = imageUrl.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download failed:", error);
        downloadButton.textContent = "Download Failed";
        setTimeout(() => (downloadButton.textContent = "Download Image"), 2000);
      }
    });

    // Get file size
    fetch(imageUrl)
      .then((response) => {
        const size = response.headers.get("content-length");
        const sizeInMB = (size / 1024 / 1024).toFixed(2); // megabytes from bytes
        document.getElementById("fileSize").textContent = `${sizeInMB} MB`;
      })
      .catch(() => {
        document.getElementById("fileSize").textContent = "Unknown";
      });

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(downloadButton);
    buttonContainer.appendChild(copyAsciiButton);
    buttonContainer.appendChild(closeButton);

    modal.appendChild(imageContainer);
    modal.appendChild(infoContainer);
    modal.appendChild(leftSideContainer);
    modal.appendChild(rightSideContainer);
    modal.appendChild(buttonContainer);
    document.body.appendChild(modal);

    // cleanup yay
    const cleanup = () => {
      document.body.removeChild(modal);
    };

    closeButton.addEventListener("click", cleanup);

    // click outside to close
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        cleanup();
      }
    });
  });
});
