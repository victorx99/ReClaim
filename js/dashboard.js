
/* =========================================
   RECLAIM DASHBOARD
   Reports + Search + Filters + Matching
   + Claim Requests + Verification
   + User Profile + Logout
========================================= */

const reportList = document.getElementById("reportList");

if (reportList) {
    // ---------- SAMPLE REPORTS ----------
    const sampleReports = [
        {
            id: "sample-1",
            type: "lost",
            name: "Black Backpack",
            category: "Bags",
            description: "Example report: backpack with books and a water bottle.",
            location: "Library",
            date: "Example",
            brand: "",
            color: "",
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
            brand: "",
            color: "",
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
            brand: "",
            color: "",
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
            brand: "",
            color: "",
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
            brand: "",
            color: "",
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
            brand: "",
            color: "",
            isSample: true
        }
    ];

    // ---------- DASHBOARD ELEMENTS ----------
    const searchForm = document.getElementById("dashboardSearch");
    const searchInput = document.getElementById("itemSearch");
    const filterButtons = document.querySelectorAll(".filter-chip");
    const emptyState = document.getElementById("emptyState");
    const clearSearchButton = document.getElementById("clearSearch");
    const toast = document.getElementById("dashboardToast");

    let currentFilter = "all";
    let searchTerm = "";
    let toastTimer;

    // ---------- LOAD USER PROFILE ----------
    function loadUserProfile() {
        let user = {};

        try {
            user = JSON.parse(
                localStorage.getItem("reclaimUser") || "{}"
            );

            if (!user || typeof user !== "object" || Array.isArray(user)) {
                user = {};
            }
        } catch (error) {
            console.error("Could not load user profile:", error);
        }

        const firstName = String(user.firstName || "").trim();
        const lastName = String(user.lastName || "").trim();
        const fullName = [firstName, lastName]
            .filter(Boolean)
            .join(" ");

        const welcomeElement =
            document.getElementById("welcomeMessage");

        // IMPORTANT: This is the actual ID in dashboard.html.
        const institutionElement =
            document.getElementById("organizationLabel");

        const profileName =
            document.getElementById("profileName");

        if (welcomeElement) {
            welcomeElement.textContent = firstName
                ? `Welcome back, ${firstName}!`
                : "Let's find what matters.";
        }

        if (institutionElement) {
            institutionElement.textContent =
                String(user.institution || "").trim() ||
                "Your school or organization";
        }

        if (profileName) {
            profileName.textContent = fullName || "ReClaim User";
        }
    }

    // ---------- NOTIFICATION MESSAGE ----------
    function showToast(message) {
        if (!toast) {
            alert(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, 3500);
    }

    // ---------- SAFE HTML TEXT ----------
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[char];
        });
    }

    // ---------- DATE FORMATTING ----------
    function formatDate(dateString) {
        if (!dateString) return "Date unknown";

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

    // ---------- LOAD SAVED REPORTS ----------
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
                        type: String(report.type || "").toLowerCase(),
                        name: String(report.itemName || "Unnamed item"),
                        category: String(report.category || "Other"),
                        description: String(
                            report.description || "No description provided."
                        ),
                        location: String(
                            report.location || "Not specified"
                        ),
                        brand: String(report.brand || ""),
                        color: String(report.color || ""),
                        date: report.date
                            ? formatDate(report.date)
                            : "Date unknown",
                        createdAt: report.createdAt || "",
                        isSample: false
                    };
                })
                .filter(function (report) {
                    return (
                        report.id &&
                        ["lost", "found"].includes(report.type)
                    );
                });
        } catch (error) {
            console.error("Error loading reports:", error);
            showToast("We couldn't read your saved reports.");
            return [];
        }
    }

    function getAllReports() {
        return getSavedReports().concat(sampleReports);
    }

    // ---------- CLAIM STORAGE ----------
    function getSavedClaims() {
        try {
            const claims = JSON.parse(
                localStorage.getItem("reclaimClaims") || "[]"
            );

            return Array.isArray(claims) ? claims : [];
        } catch (error) {
            console.error("Error loading claims:", error);
            return [];
        }
    }

    function saveClaims(claims) {
        localStorage.setItem("reclaimClaims", JSON.stringify(claims));
    }

    function getClaimForFoundReport(foundReportId) {
        return getSavedClaims().find(function (claim) {
            return (
                String(claim.foundReportId) === String(foundReportId) &&
                claim.status !== "Rejected" &&
                claim.status !== "Closed"
            );
        }) || null;
    }

    // ---------- AUTOMATIC ITEM MATCHING ----------
    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    }

    function findPossibleMatches(report) {
        if (!report || report.isSample) return [];

        return getSavedReports()
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

                if (nameA && nameA === nameB) {
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

                if (brandA && brandA === brandB) {
                    score += 2;
                }

                const colorA = normalizeText(report.color);
                const colorB = normalizeText(other.color);

                if (colorA && colorA === colorB) {
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

    // ---------- CLAIM AND VERIFICATION ----------
    function startClaim(lostReport) {
        const matches = findPossibleMatches(lostReport);

        const foundReport = matches.find(function (match) {
            return match.type === "found";
        });

        if (!foundReport) {
            showToast("No matching found report is available.");
            return;
        }

        const existingClaim = getClaimForFoundReport(foundReport.id);

        if (existingClaim) {
            showToast(
                "A claim already exists for this found item: " +
                existingClaim.status + "."
            );
            return;
        }

        const confirmed = window.confirm(
            'Start a claim for "' + foundReport.name +
            '" found at ' + foundReport.location + '?\n\n' +
            "This is a local demo. It won't contact another user " +
            "or prove ownership."
        );

        if (!confirmed) return;

        const claims = getSavedClaims();

        claims.push({
            id: "claim-" + Date.now(),
            lostReportId: lostReport.id,
            foundReportId: foundReport.id,
            status: "Claim Pending",
            createdAt: new Date().toISOString()
        });

        try {
            saveClaims(claims);
            renderReports();
            showToast("Claim submitted! Status: Claim Pending.");
        } catch (error) {
            console.error("Could not save claim:", error);
            showToast("Couldn't save your claim. Please try again.");
        }
    }

    function reviewClaim(foundReport) {
        const claim = getClaimForFoundReport(foundReport.id);

        if (!claim) {
            showToast("No active claim exists for this found item.");
            return;
        }

        if (claim.status === "Verification") {
            showToast(
                "This claim is already awaiting ownership verification."
            );
            return;
        }

        const confirmed = window.confirm(
            "Move this demo claim to ownership verification?\n\n" +
            "This is not proof that the claimant owns the item."
        );

        if (!confirmed) return;

        const claims = getSavedClaims();

        const claimIndex = claims.findIndex(function (item) {
            return item.id === claim.id;
        });

        if (claimIndex === -1) {
            showToast("Claim not found. Please refresh and try again.");
            return;
        }

        claims[claimIndex].status = "Verification";
        claims[claimIndex].updatedAt = new Date().toISOString();

        try {
            saveClaims(claims);
            renderReports();

            showToast(
                "Claim moved to Verification. Ownership is not confirmed."
            );
        } catch (error) {
            console.error("Could not update claim:", error);
            showToast("Couldn't update the claim. Please try again.");
        }
    }

    // ---------- RENDER DASHBOARD REPORTS ----------
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
                report.type,
                report.brand,
                report.color
            ].join(" ").toLowerCase();

            return matchesFilter && searchableText.includes(searchTerm);
        });

        reportList.innerHTML = filteredReports.map(function (report) {
            const label =
                report.type === "lost" ? "LOST ITEM" : "FOUND ITEM";

            const possibleMatches = report.isSample
                ? []
                : findPossibleMatches(report);

            const relatedClaim =
                !report.isSample && report.type === "found"
                    ? getClaimForFoundReport(report.id)
                    : null;

            const sampleLabel = report.isSample
                ? '<span class="sample-report-label">SAMPLE</span>'
                : "";

            const matchLabel = possibleMatches.length > 0
                ? '<span class="possible-match-label">POSSIBLE MATCH</span>'
                : "";

            const claimStatusLabel = relatedClaim
                ? '<span class="claim-status-label">' +
                    escapeHTML(relatedClaim.status.toUpperCase()) +
                  '</span>'
                : "";

            let action = "View report";

            if (report.isSample) {
                action = "Example details";
            } else if (
                report.type === "lost" &&
                possibleMatches.some(function (match) {
                    return match.type === "found";
                })
            ) {
                action = "Start a claim";
            } else if (report.type === "found" && relatedClaim) {
                action = "Review claim";
            }

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
                    ${claimStatusLabel}

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
                        return;
                    }

                    if (report.type === "lost") {
                        const matches = findPossibleMatches(report);

                        if (matches.length > 0) {
                            startClaim(report);
                        } else {
                            showToast(
                                "No possible matches yet. Check again when another report is submitted."
                            );
                        }

                        return;
                    }

                    if (report.type === "found") {
                        const claim = getClaimForFoundReport(report.id);

                        if (claim) {
                            reviewClaim(report);
                        } else {
                            showToast(
                                "No claim has been submitted for this found item yet."
                            );
                        }
                    }
                });
            });
    }

    // ---------- SEARCH ----------
    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();

            searchTerm = searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

            renderReports();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            searchTerm = searchInput.value.trim().toLowerCase();
            renderReports();
        });
    }

    // ---------- FILTERS ----------
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            currentFilter = button.dataset.filter || "all";

            filterButtons.forEach(function (filterButton) {
                filterButton.classList.toggle(
                    "active",
                    filterButton === button
                );
            });

            renderReports();
        });
    });

    function resetFilters() {
        currentFilter = "all";
        searchTerm = "";

        if (searchInput) {
            searchInput.value = "";
        }

        filterButtons.forEach(function (button) {
            button.classList.toggle(
                "active",
                button.dataset.filter === "all"
            );
        });

        renderReports();
    }

    if (clearSearchButton) {
        clearSearchButton.addEventListener("click", resetFilters);
    }

    // ---------- VIEW ALL REPORTS ----------
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

    // ---------- REPORTING NAVIGATION ----------
    ["lostAction", "foundAction", "navReport"].forEach(function (id) {
        const button = document.getElementById(id);

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                window.location.href = "report.html";
            });
        }
    });

    // ---------- SEARCH NAVIGATION ----------
    const navSearch = document.getElementById("navSearch");

    if (navSearch) {
        navSearch.addEventListener("click", function (event) {
            event.preventDefault();

            document.querySelector(".dashboard-search-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            if (searchInput) {
                searchInput.focus({ preventScroll: true });
            }
        });
    }

    // ---------- ALERTS NAVIGATION ----------
    const navAlerts = document.getElementById("navAlerts");

    if (navAlerts) {
        navAlerts.addEventListener("click", function (event) {
            event.preventDefault();

            showToast(
                "Notifications will be connected in a future stage."
            );
        });
    }

    // ---------- DEMO LOGIN / LOGOUT ----------
    const logoutLink = document.getElementById("logoutLink");

    function updateLoginLink() {
        if (!logoutLink) return;

        const isLoggedIn =
            localStorage.getItem("reclaimLoggedIn") === "true";

        logoutLink.textContent = isLoggedIn ? "Log out" : "Log in";
        logoutLink.href = isLoggedIn ? "#" : "login.html";
    }

    if (logoutLink) {
        updateLoginLink();

        logoutLink.addEventListener("click", function (event) {
            if (
                localStorage.getItem("reclaimLoggedIn") !== "true"
            ) {
                return;
            }

            event.preventDefault();

            localStorage.removeItem("reclaimLoggedIn");
            window.location.href = "login.html";
        });
    }

    // ---------- INITIAL LOAD ----------
    loadUserProfile();
    renderReports();

    // Refresh reports if another page in this browser changes them.
    window.addEventListener("storage", function (event) {
        if (
            event.key === "reclaimReports" ||
            event.key === "reclaimClaims"
        ) {
            renderReports();
        }

        if (event.key === "reclaimUser") {
            loadUserProfile();
        }

        if (event.key === "reclaimLoggedIn") {
            updateLoginLink();
        }
    });
}