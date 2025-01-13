localStorage.clear();
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

    // Clone the original receipt preview div
    var cloneDiv = document.getElementById("receiptPreview").cloneNode(true);

    // Make the clone div visible before capturing its content
    cloneDiv.style.display = "block";

    // Create a configuration object for html2pdf
    var config = {
      margin: [15, 15],
      filename: `${name} Receipt.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Use html2pdf to generate a PDF from the content of the clone div
    const pdf = await html2pdf(cloneDiv, config);

    // Append the download link to the body and trigger the download
    var downloadLink = document.createElement("a");
    downloadLink.download = config.filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Remove the link from the body
    document.body.removeChild(downloadLink);
  });

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