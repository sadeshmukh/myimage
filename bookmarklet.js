// ==Bookmarklet==
// @name Grab That Image
// @author sadeshmukh
// @style https://static.sahil.ink/myimage/index.css
// ==/Bookmarklet==

// grab every image
const images = Array.from(document.getElementsByTagName("img"));
images.forEach((image, index) => {
  const rect = image.getBoundingClientRect();

  const overlay = document.createElement("div");
  overlay.classList.add("image-overlay");
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
  gradientDiv.style.width = "100%";
  gradientDiv.style.height = "100%";
  gradientDiv.style.pointerEvents = "none"; // let clicks go through to overlay
  overlay.appendChild(gradientDiv);

  document.body.appendChild(overlay);

  // need to update on scroll
  window.addEventListener("scroll", () => {
    const newRect = image.getBoundingClientRect();
    overlay.style.top = newRect.top + "px";
    overlay.style.left = newRect.left + "px";
  });

  overlay.addEventListener("click", () => {
    const imageUrl = image.src;
    const imageAlt = image.alt;
    const imageDescription = image.title;
    const imageCaption = image.caption;

    const modal = document.createElement("div");
    modal.classList.add("modal");

    const modalImg = document.createElement("img");
    modalImg.src = imageUrl;
    modalImg.alt = imageAlt;
    modalImg.title = imageDescription;
    modalImg.setAttribute("caption", imageCaption);
    modalImg.classList.add("modal-image");

    const infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");

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
    buttonContainer.appendChild(closeButton);

    modal.appendChild(modalImg);
    modal.appendChild(infoContainer);
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
