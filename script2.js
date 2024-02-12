localStorage.clear();
function loadChildNames() {
  const childNames = [
    "Olaniyi Akorede",
    "Musa Ibrahim",
    "Akinduro Oluwafisayo",
    "Omoyeni Celine",
    "Onuh David",
    "Adelakun Emmanuel&Emmanuella",
    "Oyebode Fareedah",
    "Edwin-Okon Nkenimabasi",
    "Ayodeji Mojisola",
    "Lawal Eriife",
    "Oke Leonard",
    "Owoyomi Frieda",
    "Adeyemi Zayyana",
    "Oloruntoba Tiwaloluwa",
    "Alebiosu Naimat",
    "Olagunju Ifeoluwa",
    "Dele-Aisida Ireoluwa",
    "Adetola Obaloluwa",
    "Ibileke Tehila&Tedra",
    "Ojajuni Tobiloba",
    "Ewuola Iyiolayemi",
    "Jinadu Adesewa",
    "Odefunsho Danielle",
    "Adebayo Jamal",
    "Adekan Daniel&Elizabeth",
    "Akinmarin Ezekiel",
    "Igwe Chimkasinma"
  ];

  const sortedChildNames = childNames.sort();

  const childNameDropdown = document.getElementById("childName");
  sortedChildNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.text = name;
    childNameDropdown.add(option);
  });
}

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

  const childNameSelect = document.getElementById("childName");
  const parentNameInput = document.getElementById("name");
  const monthSelect = document.getElementById("month");
  const yearInput = document.getElementById("year");
  const descriptionTextarea = document.getElementById("description");

  const serviceFeeCheckbox = document.getElementById("serviceFee");
  const hygieneMaterialsCheckbox = document.getElementById("hygieneMaterials");
  const additionalChargesCheckbox =
    document.getElementById("additionalCharges");

  // Add event listeners for the new fields
  childNameSelect.addEventListener("change", updateParentName);
  monthSelect.addEventListener("change", updateDescription);
  yearInput.addEventListener("change", updateDescription);
  serviceFeeCheckbox.addEventListener("change", updateDescription);
  hygieneMaterialsCheckbox.addEventListener("change", updateDescription);
  additionalChargesCheckbox.addEventListener("change", updateDescription);

  function updateParentName() {
    const selectedChildOption =
      childNameSelect.options[childNameSelect.selectedIndex];
    const selectedChildName = selectedChildOption
      ? selectedChildOption.text
      : "";
    const parentNamePrefix = "Mr & Mrs ";
    parentNameInput.value = parentNamePrefix + selectedChildName.split(" ")[0];

    // Update the description whenever the parent name changes
    updateDescription();
  }

  function updateDescription() {
    const selectedChildOption =
      childNameSelect.options[childNameSelect.selectedIndex];
    const selectedChildName = selectedChildOption
      ? selectedChildOption.text
      : "";
    const selectedMonth = monthSelect.value;
    const selectedYear = yearInput.value;

    const selectedOptions = [];

    if (serviceFeeCheckbox.checked) {
      selectedOptions.push("Service Fee");
    }

    if (hygieneMaterialsCheckbox.checked) {
      selectedOptions.push("Hygiene Materials");
    }

    if (additionalChargesCheckbox.checked) {
      selectedOptions.push("Additional Service Charges");
    }

    // Create the description based on the selected information
    const descriptionText =
      selectedChildName.split(" ")[1] +
      "'s Child Care " +
      (selectedOptions.length > 0
        ? selectedOptions.join(" + ") + " for "
        : "") +
      selectedMonth +
      " " +
      selectedYear;

    // Update the description textarea
    descriptionTextarea.value = descriptionText;
  }

  // Trigger the change event initially to set the initial values
  updateParentName();
  updateDescription();
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

    const childName = document.getElementById("childName").value;
    const month = document.getElementById("month").value;
    const year = document.getElementById("year").value;

    const monthAbbreviated = month.substring(0, 3);

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
    paymentDescElement.textContent = capitalizeFirstLetter(description);
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
      filename: `${childName.split(" ")[0]} ${monthAbbreviated}${year} Receipt.pdf`,
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
      balance: document.getElementById("balance").value,
      childName: document.getElementById("childName").value,
      month: document.getElementById("month").value,
      year: document.getElementById("year").value,
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
      document.getElementById("childName").value = formData.childName;
      document.getElementById("month").value = formData.month;
      document.getElementById("year").value = formData.year;
    }
  }

// Function to add commas to the amount
function addCommas(amount) {
  return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function capitalizeEachWord(str) {
  return str.replace(/\b\w/g, function (match) {
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