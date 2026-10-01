localStorage.clear();

function loadChildNames() {
  const childNames = [
    "Olaniyi Akram",
    "Onuh David",
    "Oke Leonard",
    "Dele-Aisida Iyanuoluwa",
    "Adebayo Jamal",
    "Oloruntoba Bryan",
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
    "Olayiwola Zion",
    "Adeniyi Israel",
    "Adekola Abdurrahman",
    "Adekoya Nathan",
    "Muh'd-Awwal Abdullah",
    "Balogun Abdulmalyk",
    "Enebi Treasure",
    "Dahunsi Wuraola",
    "Adeyemo Akorede",
    "Adenuga Oluwaseyi & Ebunoluwa"
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
    const previousMonthFees = [];
    const postMonthFees = [];

    if (serviceFeeCheckbox.checked) {
      mainFees.push("Child Care Service Fee");
    }

    if (hygieneMaterialsCheckbox.checked) {
      mainFees.push("Hygiene Materials");
    }

    // Additional service charges are incurred in the month before the one
    // being paid for, so they are labelled with the previous month
    if (additionalChargesCheckbox.checked) {
      previousMonthFees.push("Additional Service Charge");
    }

    const monthIndex = monthNames.indexOf(selectedMonth);
    const previousMonth = monthNames[(monthIndex + 11) % 12];
    const previousMonthYear =
      monthIndex === 0 ? Number(selectedYear) - 1 : selectedYear;

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

    const parts = [];

    if (mainFees.length > 0) {
      parts.push(mainFees.join(" + ") + ` for ${selectedMonth} ${selectedYear}`);
    }

    if (previousMonthFees.length > 0) {
      parts.push(
        previousMonthFees.join(" + ") + ` for ${previousMonth} ${previousMonthYear}`
      );
    }

    parts.push(...postMonthFees);

    if (parts.length === 0) {
      descriptionTextarea.value = "";
      return;
    }

    descriptionTextarea.value = `${firstName}'s ` + parts.join(", ");
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

      let cloneDiv;
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

        // html2canvas sizes the capture using the node's live bounding
        // rect, which is all zeros for a detached node — so the clone has
        // to actually be in the document or the output PDF comes out
        // completely blank. Do NOT override position (fixed/absolute):
        // html2pdf does its own off-screen cloning internally, and an
        // overridden position on the source node collapses that to a
        // zero-height capture instead.
        cloneDiv = document.getElementById("receiptPreview").cloneNode(true);
        cloneDiv.style.display = "block";
        document.body.appendChild(cloneDiv);
        await waitForCloneReady(cloneDiv);

        var config = {
          margin: [15, 15],
          filename: `${childName.split(" ")[0]} ${monthAbbreviated}${year} Receipt.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        // Generating the blob ourselves (instead of html2pdf's own
        // .save(), which the old code relied on implicitly) is what makes
        // sharing possible below — a Blob/File can be handed to
        // navigator.share, a blob: URL can't be resolved by anything
        // outside this page, which is exactly the bug this replaces: on
        // iPhone, clicking a download link to a blob: URL doesn't save a
        // file, it opens the PDF in-page, and sharing from there via
        // WhatsApp sends the blob: URL itself as the message text instead
        // of attaching the PDF.
        const pdfBlob = await html2pdf().set(config).from(cloneDiv).outputPdf("blob");

        // A correctly rendered receipt is consistently several hundred KB
        // (the logo/signature images at 2x scale); anything near-empty
        // means the capture came out blank. Surfacing that here, instead
        // of only finding out after the file is already shared/saved,
        // is what let us catch this during testing — leaving it in so a
        // real-device failure is visible instead of silent.
        if (pdfBlob.size < 50000) {
          alert(
            "Heads up: the generated PDF looks unexpectedly small (" +
              pdfBlob.size +
              " bytes), it may be blank. Please screenshot this message and send it back."
          );
        }

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
      } catch (err) {
        alert(
          "Receipt generation failed: " +
            (err && err.message ? err.message : err) +
            "\nPlease screenshot this message and send it back."
        );
      } finally {
        if (cloneDiv) cloneDiv.remove();

        // Reset loading state
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;
        downloadBtn.classList.remove("btn-loading");
      }
    });

  function addCommas(amount) {
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

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
