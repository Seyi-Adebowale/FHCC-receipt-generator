localStorage.clear();

function loadChildNames() {
  const childNames = [
    "Olaniyi Akram",
    "Onuh David",
    "Oke Leonard",
    "Owoyomi Frieda",
    "Dele-Aisida Iyanuoluwa",
    "Adetola Obaloluwa",
    "Adebayo Jamal",
    "Oloruntoba Bryan",
    "James Daniel",
    "Agboola Furqan",
    "Godspower Rebecca",
    "Enitan Rachael",
    "Nwaokolo Onyinye",
    "Zedomi Oluwajoba",
    "Olajide-Idowu Michael",
    "Adebayo Igbayilola",
    "Adegoke Oluwanimisokan",
    "Daniel-Ojuade Oluwafimihan",
    "Uweomah Nathaniel",
    "Olagunju Rejoice",
    "Owele Rachael",
    "Bello Outstanding",
    "Kareem Musteqeem",
    "Olayiwola Zion",
    "Adeniyi Israel",
    "Adekola Abdurrahman",
    "Adekoya Nathan",
    "Ogunkoya Iremide",
    "Iperepolu Samuel",
    "Muh'd-Awwal Abdullah",
    "Sontan Eriifeoluwa"
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

  // Set default month & year based on payment advance rule:
  // From the 24th, payments are for the next month
  const now = new Date();
  const currentDay = now.getDate();
  let defaultMonth = now.getMonth(); // 0-indexed
  let defaultYear = now.getFullYear();

  if (currentDay >= 24) {
    defaultMonth += 1;
    if (defaultMonth > 11) {
      defaultMonth = 0; // wrap to January
      defaultYear += 1;
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  document.getElementById("month").value = monthNames[defaultMonth];
  document.getElementById("year").value = defaultYear;

  const childNameSelect = document.getElementById("childName");
  const parentNameInput = document.getElementById("name");
  const monthSelect = document.getElementById("month");
  const yearInput = document.getElementById("year");
  const descriptionTextarea = document.getElementById("description");

  const serviceFeeCheckbox = document.getElementById("serviceFee");
  const hygieneMaterialsCheckbox = document.getElementById("hygieneMaterials");
  const additionalChargesCheckbox = document.getElementById("additionalCharges");
  const annualDevelopmentLevyCheckbox = document.getElementById("annualDevelopmentLevy");
  const enrolmentFormsCheckbox = document.getElementById("enrolmentForms");
  const booksStationeriesCheckbox = document.getElementById("booksStationeries"); // NEW

  // Add event listeners for the new fields
  childNameSelect.addEventListener("change", updateParentName);
  monthSelect.addEventListener("change", updateDescription);
  yearInput.addEventListener("change", updateDescription);
  serviceFeeCheckbox.addEventListener("change", updateDescription);
  hygieneMaterialsCheckbox.addEventListener("change", updateDescription);
  additionalChargesCheckbox.addEventListener("change", updateDescription);
  annualDevelopmentLevyCheckbox.addEventListener("change", updateDescription);
  enrolmentFormsCheckbox.addEventListener("change", updateDescription);
  booksStationeriesCheckbox.addEventListener("change", updateDescription); // NEW

  function updateParentName() {
    const selectedChildOption =
      childNameSelect.options[childNameSelect.selectedIndex];
    const selectedChildName = selectedChildOption
      ? selectedChildOption.text
      : "";
    const parentNamePrefix = "Mr & Mrs ";
    parentNameInput.value = parentNamePrefix + selectedChildName.split(" ")[0];

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

    const mainFees = [];
    const postMonthFees = [];

    if (serviceFeeCheckbox.checked) {
      mainFees.push("Child Care Service Fee");
    }

    if (hygieneMaterialsCheckbox.checked) {
      mainFees.push("Hygiene Materials");
    }

    if (additionalChargesCheckbox.checked) {
      mainFees.push("Additional Service Charge");
    }

    if (booksStationeriesCheckbox.checked) {
      postMonthFees.push("Books and Stationeries"); 
    }

    if (annualDevelopmentLevyCheckbox.checked) {
      postMonthFees.push(`Annual Development Levy (${selectedYear})`);
    }

    if (enrolmentFormsCheckbox.checked) {
      postMonthFees.push("Enrolment & Agreement Forms");
    }

    // Extract first name(s) (everything after the first word)
    const nameParts = selectedChildName.split(" ");
    const firstName = nameParts.slice(1).join(" "); // Remove the surname (first word)

    if (mainFees.length === 0 && postMonthFees.length === 0) {
      descriptionTextarea.value = "";
      return;
    }

    let descriptionText = `${firstName}'s `;

    if (mainFees.length > 0) {
      descriptionText += mainFees.join(" + ") + ` for ${selectedMonth} ${selectedYear}`;
    }

    if (postMonthFees.length > 0) {
      if (mainFees.length > 0) {
        descriptionText += ", ";
      }
      descriptionText += postMonthFees.join(", ");
    }

    descriptionTextarea.value = descriptionText;
  }

  // Required fields validation config
  const requiredFields = [
    { id: "childName", label: "Child's Name" },
    { id: "name", label: "Received from" },
    { id: "amount", label: "Amount" },
    { id: "description", label: "Description" },
  ];

  // Clear error state when user interacts with a field
  requiredFields.forEach(({ id }) => {
    const el = document.getElementById(id);
    const clearError = () => {
      el.classList.remove("field-error");
      const errMsg = el.parentElement.querySelector(".error-message");
      if (errMsg) errMsg.classList.remove("visible");
    };
    el.addEventListener("input", clearError);
    el.addEventListener("change", clearError);
  });

  function validateForm() {
    let isValid = true;
    let firstInvalid = null;

    requiredFields.forEach(({ id, label }) => {
      const el = document.getElementById(id);
      const value = el.value.trim();

      // Remove previous error state
      el.classList.remove("field-error");
      let errMsg = el.parentElement.querySelector(".error-message");

      if (!value) {
        isValid = false;
        el.classList.add("field-error");

        // Create or show error message
        if (!errMsg) {
          errMsg = document.createElement("div");
          errMsg.className = "error-message";
          el.insertAdjacentElement("afterend", errMsg);
        }
        errMsg.textContent = `${label} is required`;
        errMsg.classList.add("visible");

        if (!firstInvalid) firstInvalid = el;
      } else if (errMsg) {
        errMsg.classList.remove("visible");
      }
    });

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.focus();
    }

    return isValid;
  }

  const downloadBtn = document.getElementById("downloadBtn");

  downloadBtn.addEventListener("click", async function (event) {
      event.preventDefault();

      // Validate before proceeding
      if (!validateForm()) return;

      // Set loading state
      const originalText = downloadBtn.textContent;
      downloadBtn.disabled = true;
      downloadBtn.textContent = "Generating...";
      downloadBtn.classList.add("btn-loading");

      try {
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

        const receiptDateElement = document.getElementById("receipt-date");
        const receiptNameElement = document.getElementById("receipt-name");
        const paymentTypeElement = document.getElementById("payment-type");
        const paymentDescElement = document.getElementById("payment-desc");
        const receiptBalanceElement = document.getElementById("receipt-balance");
        const receiptAmountWordsElement = document.getElementById("receipt-amount-words");
        const receiptAmountElement = document.getElementById("receipt-amount");

        receiptDateElement.textContent = date;
        receiptNameElement.textContent = capitalizeEachWord(name);
        paymentTypeElement.textContent = capitalizeFirstLetter(type);
        paymentDescElement.textContent = capitalizeFirstLetter(description);
        receiptBalanceElement.textContent = addCommas(balance);
        receiptAmountWordsElement.textContent = capitalizeEachWord(
          amountToWords(amount)
        );
        receiptAmountElement.textContent = addCommas(amount);

        var cloneDiv = document.getElementById("receiptPreview").cloneNode(true);
        cloneDiv.style.display = "block";

        var config = {
          margin: [15, 15],
          filename: `${childName.split(" ")[0]} ${monthAbbreviated}${year} Receipt.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        const pdf = await html2pdf(cloneDiv, config);

        var downloadLink = document.createElement("a");
        downloadLink.download = config.filename;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } finally {
        // Reset loading state
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;
        downloadBtn.classList.remove("btn-loading");
      }
    });

  function addCommas(amount) {
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

function capitalizeEachWord(str) {
  return str.replace(/(^|[\s-])([a-z])/g, function(match, separator, letter) {
    return separator + letter.toUpperCase();
  });
}
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
    const formattedAmount = amountInWords.replace(/(\D|^)(\d+)$/, " and $2");

    return `${formattedAmount} Naira only`;
  }
});
