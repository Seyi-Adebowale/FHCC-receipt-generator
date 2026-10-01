localStorage.clear();

// Temporary debug aid: html2canvas's own internal logging only goes to
// the console, which isn't reachable on a real iPhone without a Mac for
// Safari's remote inspector. Mirror it into an array we can render
// on-page instead.
const __debugLogs = [];
["log", "info", "debug", "warn", "error"].forEach((level) => {
  const original = console[level].bind(console);
  console[level] = function (...args) {
    __debugLogs.push(
      "[" + level + "] " + args.map((a) => (a && a.stack) || String(a)).join(" ")
    );
    original(...args);
  };
});
window.addEventListener("error", (e) => {
  __debugLogs.push("[window error] " + e.message);
});

document.addEventListener("DOMContentLoaded", function () {
  loadChildNames();
  loadFormData();
});

document.getElementById("form").addEventListener("input", function () {
  saveFormData();
});

document.addEventListener("DOMContentLoaded", function () {
  function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }
  document.getElementById("date").value = getCurrentDate();
  document.getElementById("balance").value = "0";

});

document
  .getElementById("downloadBtn")
  .addEventListener("click", async function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    try {
    // Fetch form values
    const date = document.getElementById("date").value;
    const name = document.getElementById("name").value;
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value;
    const balance = document.getElementById("balance").value;


    // Fetch receipt preview elements
    const receiptDateElement = document.getElementById("receipt-date");
    const receiptNameElement = document.getElementById("receipt-name");
    const paymentTypeElement = document.getElementById("payment-type");
    const paymentDescElement = document.getElementById("payment-desc");
    const receiptBalanceElement = document.getElementById("receipt-balance");
    const receiptAmountWordsElement = document.getElementById(
      "receipt-amount-words"
    );
    const receiptAmountElement = document.getElementById("receipt-amount");

    // Update receipt preview with form values
    receiptDateElement.textContent = date;
    receiptNameElement.textContent = capitalizeEachWord(name);
    paymentTypeElement.textContent = capitalizeFirstLetter(type);
    paymentDescElement.textContent = capitalizeEachWord(description);
    receiptBalanceElement.textContent = addCommas(balance);
    receiptAmountWordsElement.textContent = capitalizeEachWord(
      amountToWords(amount)
    );
    receiptAmountElement.textContent = addCommas(amount);

    // Clone the original receipt preview div. html2canvas sizes the
    // capture using the node's live bounding rect, which is all zeros for
    // a detached node, so the clone has to actually be in the document or
    // the output PDF comes out blank. Do NOT override position
    // (fixed/absolute): html2pdf does its own off-screen cloning
    // internally, and an overridden position on the source node collapses
    // that to a zero-height capture instead.
    var cloneDiv = document.getElementById("receiptPreview").cloneNode(true);
    cloneDiv.style.display = "block";
    document.body.appendChild(cloneDiv);
    await waitForCloneReady(cloneDiv);

    // Create a configuration object for html2pdf
    var config = {
      margin: [15, 15],
      filename: `${name} Receipt.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate the PDF as a blob ourselves instead of relying on
    // html2pdf's own .save() — a Blob/File can be handed to
    // navigator.share, a blob: URL can't be resolved outside this page.
    // That's the iPhone bug this replaces: clicking a download link to a
    // blob: URL doesn't save a file there, it opens the PDF in-page, and
    // sharing from it via WhatsApp sends the blob: URL as the message text
    // instead of attaching the PDF.
    const pdfWorker = html2pdf().set(config).from(cloneDiv);
    await pdfWorker.toCanvas();

    // A correctly rendered receipt is consistently several hundred KB
    // (the logo/signature images at 2x scale); anything near-empty means
    // part of the capture came out blank. Show exactly what got
    // rasterized instead of just the byte count, so a real-device failure
    // can be diagnosed from a screenshot instead of guessed at.
    showDebugPreview(pdfWorker.prop.canvas);

    const pdfBlob = await pdfWorker.outputPdf("blob");

    const pdfFile = new File([pdfBlob], config.filename, { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({ files: [pdfFile], title: "Receipt" });
      } catch (shareError) {
        if (shareError.name !== "AbortError") downloadBlob(pdfBlob, config.filename);
      }
    } else {
      downloadBlob(pdfBlob, config.filename);
    }

    cloneDiv.remove();
    } catch (err) {
      alert(
        "Receipt generation failed: " +
          (err && err.message ? err.message : err) +
          "\nPlease screenshot this message and send it back."
      );
    }
  });

// Force layout before handing off to html2canvas, and make sure every
// image has actually finished decoding — both can lag a tick behind
// appendChild on iOS Safari, which otherwise captures whatever
// half-ready state exists at the moment it's called.
async function waitForCloneReady(el) {
  void el.offsetHeight;
  const images = Array.from(el.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))
  );
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
}

// Temporary debug aid: shows a screenshot-able on-screen preview of the
// raw canvas html2canvas produced, right before it gets turned into the
// PDF — so a blank/partial capture is visible immediately on the real
// device instead of needing another guess-and-check round trip.
function showDebugPreview(canvas) {
  try {
    const thumb = document.createElement("canvas");
    const scale = 300 / canvas.width;
    thumb.width = 300;
    thumb.height = Math.round(canvas.height * scale);
    thumb.getContext("2d").drawImage(canvas, 0, 0, thumb.width, thumb.height);

    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;";

    const img = document.createElement("img");
    img.src = thumb.toDataURL("image/jpeg", 0.6);
    img.style.cssText = "max-width:90%;border:2px solid white;";

    const label = document.createElement("div");
    label.textContent = "Debug preview — screenshot this and send it back";
    label.style.cssText = "color:white;margin-top:10px;font-size:14px;text-align:center;";

    const logs = document.createElement("pre");
    logs.textContent = __debugLogs.join("\n") || "(no console output captured)";
    logs.style.cssText =
      "color:#0f0;background:#000;max-width:90%;max-height:30vh;overflow:auto;" +
      "font-size:10px;padding:8px;margin-top:10px;white-space:pre-wrap;word-break:break-word;";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.type = "button";
    closeBtn.style.cssText = "margin-top:15px;padding:10px 20px;";
    closeBtn.onclick = () => overlay.remove();

    overlay.append(img, label, logs, closeBtn);
    document.body.appendChild(overlay);
  } catch (e) {
    console.error("debug preview failed", e);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Function to save form data to localStorage
function saveFormData() {
  const formData = {
    date: document.getElementById("date").value,
    name: document.getElementById("name").value,
    amount: document.getElementById("amount").value,
    type: document.getElementById("type").value,
    description: document.getElementById("description").value,
    balance: document.getElementById("balance").value
  };

  localStorage.setItem("formData", JSON.stringify(formData));
}

// Function to load saved form data from localStorage
function loadFormData() {
  const savedFormData = localStorage.getItem("formData");

  if (savedFormData) {
    const formData = JSON.parse(savedFormData);

    document.getElementById("date").value = formData.date;
    document.getElementById("name").value = formData.name;
    document.getElementById("amount").value = formData.amount;
    document.getElementById("type").value = formData.type;
    document.getElementById("description").value = formData.description;
    document.getElementById("balance").value = formData.balance;
  }
}

// Function to add commas to the amount
function addCommas(amount) {
  return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function capitalizeEachWord(str) {
  return str.replace(/\b\w/g, function (match, offset, fullString) {
    // Check if the match is preceded by an apostrophe
    if (offset > 0 && fullString[offset - 1] === "'") {
      return match.toLowerCase(); // Keep it lowercase
    }
    return match.toUpperCase();
  });
}


// Function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function amountToWords(amount) {
  const numericAmount = parseInt(amount);

  if (!Number.isFinite(numericAmount)) {
    console.error("Invalid amount:", amount);
    return "Invalid amount";
  }

  const amountInWords = numberToWords.toWords(numericAmount);

  // Add "and" before the last part
  const formattedAmount = amountInWords.replace(/(\D|^)(\d+)$/, " and $2");

  return `${formattedAmount} Naira only`;
}