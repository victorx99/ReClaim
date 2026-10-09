
const sampleReports = [
    {
        id: "sample-1",
        type: "lost",
        name: "Black Backpack",
        category: "Bags",
        description: "Example report: backpack with books and a water bottle.",
        location: "Library",
        date: "Example",
        isSample: true
    },
    {
        id: "sample-2",
        type: "found",
        name: "Wireless Earbuds",
        category: "Electronics",
        description: "Example report: earbuds found in a classroom.",
        location: "Lecture Hall",
        date: "Example",
        isSample: true
    },
    {
        id: "sample-3",
        type: "lost",
        name: "Student ID Card",
        category: "IDs / Cards",
        description: "Example report: student ID card misplaced.",
        location: "Main Cafeteria",
        date: "Example",
        isSample: true
    },
    {
        id: "sample-4",
        type: "found",
        name: "Set of Keys",
        category: "Keys",
        description: "Example report: keys found near a walkway.",
        location: "Campus Walkway",
        date: "Example",
        isSample: true
    },
    {
        id: "sample-5",
        type: "lost",
        name: "Blue Notebook",
        category: "Books / Documents",
        description: "Example report: notebook containing class notes.",
        location: "Study Area",
        date: "Example",
        isSample: true
    },
    {
        id: "sample-6",
        type: "found",
        name: "Water Bottle",
        category: "Other",
        description: "Example report: reusable bottle left on a desk.",
        location: "Computer Lab",
        date: "Example",
        isSample: true
    }
];

const reportList = document.getElementById("reportList");

if (reportList) {
    const searchForm = document.getElementById("dashboardSearch");
    const searchInput = document.getElementById("itemSearch");
    const filterButtons = document.querySelectorAll(".filter-chip");
    const emptyState = document.getElementById("emptyState");
    const clearSearchButton = document.getElementById("clearSearch");
    const toast = document.getElementById("dashboardToast");

    let currentFilter = "all";
    let searchTerm = "";
    let toastTimer;

    // Safely read reports saved by the reporting form.
    function getSavedReports() {
        try {
            const saved = JSON.parse(
                localStorage.getItem("reclaimReports") || "[]"
            );

            if (!Array.isArray(saved)) return [];

            return saved
                .filter(function (report) {
                    return report && typeof report === "object";
                })
                .map(function (report) {
                    return {
                        id: String(report.id || ""),
                        name: String(report.itemName || "Unnamed item"),
                        category: String(report.category || "Other"),
                        brand: String(report.brand || ""),
                        color: String(report.color || ""),
                        category: String(report.category || "Other"),
                        description: String(
                            report.description || "No description provided."
                        ),
                        location: String(report.location || "Not specified"),
                        date: report.date
                            ? formatDate(report.date)
                            : "Date unknown",
                        createdAt: report.createdAt || "",
                        isSample: false
                    };
                })
                .filter(function (report) {
                    return (
                        report.type === "lost" ||
                        report.type === "found"
                    );
                });
        } catch (error) {
            console.error("Could not read ReClaim reports:", error);
            return [];
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString + "T12:00:00");

        if (Number.isNaN(date.getTime())) {
            return "Date unknown";
        }

        return date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Prevent user-entered text from being interpreted as HTML.
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    function getAllReports() {
        const savedReports = getSavedReports();

        // Real reports first, followed by clearly marked examples.
        return savedReports.concat(sampleReports);
    }
function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}
function findPossibleMatches(report) {
    // Match real user reports only, never sample examples.
    const savedReports = getSavedReports();

    return savedReports
        .filter(function (other) {
            return (
                other.id !== report.id &&
                other.type !== report.type
            );
        })
        .map(function (other) {
            let score = 0;
            let nameScore = 0;

            const nameA = normalizeText(report.name);
            const nameB = normalizeText(other.name);

            const wordsA = nameA.split(" ").filter(Boolean);
            const wordsB = nameB.split(" ").filter(Boolean);

            if (nameA && nameB && nameA === nameB) {
                nameScore = 3;
            } else if (
                nameA.length >= 4 &&
                nameB.length >= 4 &&
                (nameA.includes(nameB) || nameB.includes(nameA))
            ) {
                nameScore = 3;
            } else {
                const sharedWords = wordsA.filter(function (word) {
                    return word.length > 2 && wordsB.includes(word);
                });

                if (sharedWords.length > 0) {
                    nameScore = 2;
                }
            }

            score += nameScore;

            const categoryA = normalizeText(report.category);
            const categoryB = normalizeText(other.category);

            if (categoryA && categoryA === categoryB) {
                score += 1;
            }

            const brandA = normalizeText(report.brand);
            const brandB = normalizeText(other.brand);

            if (brandA && brandB && brandA === brandB) {
                score += 2;
            }

            const colorA = normalizeText(report.color);
            const colorB = normalizeText(other.color);

            if (colorA && colorB && colorA === colorB) {
                score += 1;
            }

            const locationA = normalizeText(report.location);
            const locationB = normalizeText(other.location);

            if (
                locationA &&
                locationB &&
                (
                    locationA === locationB ||
                    locationA.includes(locationB) ||
                    locationB.includes(locationA)
                )
            ) {
                score += 1;
            }

            return {
                report: other,
                score: score,
                nameScore: nameScore
            };
        })
        // A category or location match alone isn't enough.
        .filter(function (match) {
            return match.score >= 3 && match.nameScore >= 2;
        })
        .sort(function (a, b) {
            return b.score - a.score;
        })
        .map(function (match) {
            return match.report;
        });
}

    function renderReports() {
        const allReports = getAllReports();

        const filteredReports = allReports.filter(function (report) {
            const matchesFilter =
                currentFilter === "all" ||
                report.type === currentFilter;

            const searchableText = [
                report.name,
                report.category,
                report.description,
                report.location,
                report.type
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            return matchesFilter && matchesSearch;
        });

        reportList.innerHTML = filteredReports.map(function (report) {
            const label =
                report.type === "lost" ? "LOST ITEM" : "FOUND ITEM";

            const action =
                report.isSample ? "Example details" : "View report";

            const sampleLabel = report.isSample
                ? '<span class="sample-report-label">SAMPLE</span>'
                : "";
            const possibleMatches = report.isSample
                ? []
                : findPossibleMatches(report);

            const matchLabel = possibleMatches.length > 0
                ? '<span class="possible-match-label">POSSIBLE MATCH</span>'
                : "";

            return `
                <article class="report-card">
                    <div class="report-card-top">
                        <span class="report-type ${report.type}">
                            ${label}
                        </span>
                        <span class="report-category">
                            ${escapeHTML(report.category)}
                        </span>
                    </div>

                    ${sampleLabel}
                    ${matchLabel}

                    <h3>${escapeHTML(report.name)}</h3>

                    <p class="report-description">
                        ${escapeHTML(report.description)}
                    </p>

                    <div class="report-meta">
                        <span>⌖ ${escapeHTML(report.location)}</span>
                        <span>◷ ${escapeHTML(report.date)}</span>
                    </div>

                    <button
                        type="button"
                        class="report-card-action"
                        data-report-id="${escapeHTML(report.id)}"
                    >${action}</button>
                </article>
            `;
        }).join("");

        if (emptyState) {
            emptyState.classList.toggle(
                "hidden",
                filteredReports.length > 0
            );
        }

        reportList.classList.toggle(
            "hidden",
            filteredReports.length === 0
        );

        reportList.querySelectorAll(".report-card-action")
            .forEach(function (button) {
                button.addEventListener("click", function () {
                    const report = filteredReports.find(function (item) {
                        return item.id === button.dataset.reportId;
                    });

                    if (!report) return;

                    
                    if (report.isSample) {
                        showToast(
                            "This is an example only, not a real item report."
                        );
                    } else {
                        const matches = findPossibleMatches(report);

                        if (matches.length > 0) {
                            const matchNames = matches
                                .slice(0, 2)
                                .map(function (match) {
                                    return match.name + " (" + match.location + ")";
                                    })
                            .join("; ");

                                showToast("Possible match: " + matchNames);
                                    } else {
                        showToast(
                            "No possible matches yet. ReClaim will compare this report with new reports."
                                );
                            }
                        }
                });
            });
    }

    function resetFilters() {
        currentFilter = "all";
        searchTerm = "";

        if (searchInput) searchInput.value = "";

        filterButtons.forEach(function (button) {
            button.classList.toggle(
                "active",
                button.dataset.filter === "all"
            );
        });

        renderReports();
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            searchTerm = searchInput.value.trim().toLowerCase();
            renderReports();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            searchTerm = searchInput.value.trim().toLowerCase();
            renderReports();
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            currentFilter = button.dataset.filter;

            filterButtons.forEach(function (filterButton) {
                filterButton.classList.toggle(
                    "active",
                    filterButton === button
                );
            });

            renderReports();
        });
    });

    if (clearSearchButton) {
        clearSearchButton.addEventListener("click", resetFilters);
    }

    const viewAllButton = document.getElementById("viewAllReports");

    if (viewAllButton) {
        viewAllButton.addEventListener("click", function () {
            resetFilters();

            document.querySelector(".recent-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        });
    }

    // Reporting buttons now open the actual reporting form.
    ["lostAction", "foundAction", "navReport"].forEach(function (id) {
        const button = document.getElementById(id);

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                window.location.href = "report.html";
            });
        }
    });

    const navSearch = document.getElementById("navSearch");

    if (navSearch) {
        navSearch.addEventListener("click", function (event) {
            event.preventDefault();

            document.querySelector(".dashboard-search-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            searchInput?.focus({ preventScroll: true });
        });
    }

    const navAlerts = document.getElementById("navAlerts");

    if (navAlerts) {
        navAlerts.addEventListener("click", function (event) {
            event.preventDefault();

            showToast(
                "Alerts will be connected when notifications are implemented."
            );
        });
    }

    // Display saved reports whenever the dashboard opens.
    renderReports();

    // Refresh the list if another page in this browser saves a report.
    window.addEventListener("storage", function (event) {
        if (event.key === "reclaimReports") {
            renderReports();
        }
    });
}