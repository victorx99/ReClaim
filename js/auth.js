
const signupForm = document.getElementById("signupForm");

// ==============================
// SIGNUP
// ==============================

if (signupForm) {
    const roleInputs = document.querySelectorAll('input[name="role"]');
    const relationshipGroup = document.getElementById("otherRelationshipGroup");
    const relationshipSelect = document.getElementById("relationship");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const formMessage = document.getElementById("formMessage");

    function updateRelationshipField() {
        const selectedRole = document.querySelector(
            'input[name="role"]:checked'
        );

        const isOther = selectedRole && selectedRole.value === "other";

        if (relationshipGroup && relationshipSelect) {
            relationshipGroup.classList.toggle("hidden", !isOther);
            relationshipSelect.required = Boolean(isOther);

            if (!isOther) {
                relationshipSelect.value = "";
            }
        }
    }

    roleInputs.forEach(function (input) {
        input.addEventListener("change", updateRelationshipField);
    });

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const isHidden = passwordInput.type === "password";

            passwordInput.type = isHidden ? "text" : "password";
            togglePassword.textContent = isHidden ? "Hide" : "Show";
        });
    }

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!signupForm.checkValidity()) {
            signupForm.reportValidity();
            return;
        }

        try {
            const formData = new FormData(signupForm);

            function getFieldValue(name, id) {
                const element = document.getElementById(id);
                const value = element ? element.value : formData.get(name);

                return String(value || "").trim();
            }

            const selectedRole = document.querySelector(
                'input[name="role"]:checked'
            );

            const userProfile = {
                firstName: getFieldValue("firstName", "firstName"),
                lastName: getFieldValue("lastName", "lastName"),
                email: getFieldValue("email", "email"),
                role: selectedRole ? selectedRole.value : "",
                relationship: relationshipSelect
                    ? relationshipSelect.value
                    : "",
                institution: getFieldValue("institution", "institution")
            };

            // Save the profile for the dashboard.
            localStorage.setItem(
                "reclaimUser",
                JSON.stringify(userProfile)
            );

            localStorage.setItem("reclaimLoggedIn", "true");

            if (formMessage) {
                formMessage.className = "form-message success";
                formMessage.textContent =
                    "Signup successful! Taking you to your dashboard...";
            }

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 800);

        } catch (error) {
            console.error("Signup profile could not be saved:", error);

            if (formMessage) {
                formMessage.className = "form-message";
                formMessage.textContent =
                    "We couldn't save your details. Please try again.";
            }
        }
    });

    updateRelationshipField();
}


// ==============================
// LOGIN
// ==============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    const passwordInput = document.getElementById("loginPassword");
    const togglePassword = document.getElementById("toggleLoginPassword");
    const message = document.getElementById("loginMessage");
    const forgotPassword = document.getElementById("forgotPassword");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const isHidden = passwordInput.type === "password";

            passwordInput.type = isHidden ? "text" : "password";
            togglePassword.textContent = isHidden ? "Hide" : "Show";
        });
    }

    if (forgotPassword) {
        forgotPassword.addEventListener("click", function (event) {
            event.preventDefault();

            if (message) {
                message.className = "form-message";
                message.textContent =
                    "Password recovery will be available once email and backend services are connected.";
            }
        });
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        localStorage.setItem("reclaimLoggedIn", "true");

        if (message) {
            message.className = "form-message success";
            message.textContent =
                "Login successful! Taking you to your dashboard...";
        }

        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 800);
    });
}