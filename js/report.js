
const reportForm = document.getElementById("reportForm");
const formMessage = document.getElementById("formMessage");
const photoInput = document.getElementById("itemPhoto");
const photoPreview = document.getElementById("photoPreview");
const itemDate = document.getElementById("itemDate");
const dateUnknown = document.getElementById("dateUnknown");

let photoData = "";

dateUnknown.addEventListener("change", () => {
    itemDate.disabled = dateUnknown.checked;

    if (dateUnknown.checked) {
        itemDate.value = "";
    }
});

photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];

    photoData = "";
    photoPreview.hidden = true;
    photoPreview.removeAttribute("src");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        photoInput.value = "";
        showMessage("Please choose a JPG, PNG or WebP image.", "error");
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        photoInput.value = "";
        showMessage("That image is too large. Please choose one under 2 MB.", "error");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        photoData = reader.result;
        photoPreview.src = photoData;
        photoPreview.hidden = false;
    };

    reader.onerror = () => {
        showMessage("We couldn't read that image. Please try another.", "error");
    };

    reader.readAsDataURL(file);
});

reportForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedType = document.querySelector(
        'input[name="reportType"]:checked'
    );

    if (!selectedType) {
        showMessage("Please choose Lost Something or Found Something.", "error");
        return;
    }

    const report = {
        id: "report-" + Date.now(),
        type: selectedType.value,
        itemName: document.getElementById("itemName").value.trim(),
        category: document.getElementById("category").value,
        brand: document.getElementById("brand").value.trim(),
        color: document.getElementById("color").value.trim(),
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        date: dateUnknown.checked ? "" : itemDate.value,
        dateUnknown: dateUnknown.checked || !itemDate.value,
        photo: photoData,
        status: selectedType.value === "Lost" ? "Searching" : "Found — Finder Holding",
        createdAt: new Date().toISOString()
    };

    const submitButton = reportForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const savedReports = JSON.parse(
            localStorage.getItem("reclaimReports") || "[]"
        );

        if (!Array.isArray(savedReports)) {
            throw new Error("Saved reports data is invalid.");
        }

        savedReports.unshift(report);

        localStorage.setItem(
            "reclaimReports",
            JSON.stringify(savedReports)
        );

        reportForm.reset();
        dateUnknown.checked = false;
        itemDate.disabled = false;
        photoData = "";
        photoPreview.hidden = true;
        photoPreview.removeAttribute("src");

        showMessage(
            "Report submitted successfully! Your report has been saved on this browser.",
            "success"
        );
    } catch (error) {
        console.error("Could not save ReClaim report:", error);

        showMessage(
            "We couldn't save this report. Your browser may be out of storage space, especially if the photo is large. Try again without the photo.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
    }
});

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
}