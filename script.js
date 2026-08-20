const $ = (selector) => document.querySelector(selector);

const drop = $("#drop");
const input = $("#fileInput");
const workspace = $("#workspace");
const preview = $("#preview");
const widthInput = $("#width");
const heightInput = $("#height");
const quality = $("#quality");
const result = $("#result");
const error = $("#error");

let file = null;
let imageUrl = "";
let outputUrl = "";
let format = "image/webp";
let ratioLocked = true;
let originalWidth = 0;
let originalHeight = 0;

const formatNames = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP"
};

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + " B";
  }

  if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + " KB";
  }

  return (bytes / 1048576).toFixed(2) + " MB";
}

function loadFile(selectedFile) {
  error.textContent = "";

  if (
    !selectedFile ||
    !selectedFile.type.startsWith("image/")
  ) {
    error.textContent =
      "Choose a compatible image.";

    return;
  }

  if (selectedFile.size > 26214400) {
    error.textContent =
      "The file is larger than 25 MB.";

    return;
  }

  file = selectedFile;

  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
  }

  imageUrl = URL.createObjectURL(selectedFile);

  preview.src = imageUrl;

  const image = new Image();

  image.onload = () => {
    originalWidth = image.naturalWidth;
    originalHeight = image.naturalHeight;

    widthInput.value = originalWidth;
    heightInput.value = originalHeight;

    $("#fileDetails").textContent =
      `${formatFileSize(selectedFile.size)} · ` +
      `${originalWidth} × ${originalHeight}px`;
  };

  image.src = imageUrl;

  $("#fileName").textContent = selectedFile.name;

  drop.classList.add("hidden");
  workspace.classList.remove("hidden");
  result.classList.add("hidden");
}

drop.addEventListener("click", () => {
  input.click();
});

drop.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" ||
    event.key === " "
  ) {
    input.click();
  }
});

input.addEventListener("change", (event) => {
  loadFile(event.target.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  drop.addEventListener(eventName, (event) => {
    event.preventDefault();
    drop.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  drop.addEventListener(eventName, (event) => {
    event.preventDefault();
    drop.classList.remove("dragging");
  });
});

drop.addEventListener("drop", (event) => {
  loadFile(event.dataTransfer.files[0]);
});

document
  .querySelectorAll(".formats button")
  .forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".formats button")
        .forEach((item) => {
          item.classList.remove("active");
        });

      button.classList.add("active");

      format = button.dataset.format;

      $("#convert").textContent =
        `Convert to ${formatNames[format]}`;

      $("#qualityBox").classList.toggle(
        "hidden",
        format === "image/png"
      );

      result.classList.add("hidden");
    });
  });

quality.addEventListener("input", () => {
  $("#qualityValue").textContent =
    quality.value + "%";

  result.classList.add("hidden");
});

widthInput.addEventListener("input", () => {
  if (
    ratioLocked &&
    widthInput.value &&
    originalWidth
  ) {
    heightInput.value = Math.round(
      widthInput.value *
      originalHeight /
      originalWidth
    );
  }

  result.classList.add("hidden");
});

heightInput.addEventListener("input", () => {
  if (
    ratioLocked &&
    heightInput.value &&
    originalHeight
  ) {
    widthInput.value = Math.round(
      heightInput.value *
      originalWidth /
      originalHeight
    );
  }

  result.classList.add("hidden");
});

$("#ratio").addEventListener("click", () => {
  ratioLocked = !ratioLocked;

  $("#ratio").textContent = ratioLocked
    ? "Ratio locked"
    : "Free resize";
});

$("#remove").addEventListener("click", () => {
  file = null;

  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
  }

  drop.classList.remove("hidden");
  workspace.classList.add("hidden");

  input.value = "";
  error.textContent = "";
});

$("#convert").addEventListener("click", async () => {
  if (
    !file ||
    !Number(widthInput.value) ||
    !Number(heightInput.value)
  ) {
    return;
  }

  const convertButton = $("#convert");

  convertButton.disabled = true;
  convertButton.textContent = "Converting…";

  error.textContent = "";

  try {
    const image = new Image();

    image.src = imageUrl;

    await image.decode();

    const canvas = document.createElement("canvas");

    canvas.width = Number(widthInput.value);
    canvas.height = Number(heightInput.value);

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas unavailable");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const convertedBlob = await new Promise(
      (resolve) => {
        canvas.toBlob(
          resolve,
          format,
          format === "image/png"
            ? undefined
            : Number(quality.value) / 100
        );
      }
    );

    if (!convertedBlob) {
      throw new Error("Conversion failed");
    }

    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
    }

    outputUrl = URL.createObjectURL(
      convertedBlob
    );

    let reductionText = "";

    if (convertedBlob.size < file.size) {
      const reduction = Math.round(
        (
          1 -
          convertedBlob.size / file.size
        ) * 100
      );

      reductionText =
        ` · ${reduction}% smaller`;
    }

    $("#resultInfo").textContent =
      formatFileSize(convertedBlob.size) +
      reductionText;

    const downloadButton = $("#download");

    downloadButton.href = outputUrl;

    const originalName =
      file.name.replace(/\.[^/.]+$/, "") ||
      "converted-image";

    downloadButton.download =
      originalName +
      "." +
      extensions[format];

    result.classList.remove("hidden");
  } catch (conversionError) {
    error.textContent =
      "We couldn't convert this image. " +
      "Try another format.";
  } finally {
    convertButton.disabled = false;

    convertButton.textContent =
      `Convert to ${formatNames[format]}`;
  }
});
