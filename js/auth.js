
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    const roleInputs = document.querySelectorAll('input[name="role"]');
    const relationshipGroup = document.getElementById("otherRelationshipGroup");
    const relationshipSelect = document.getElementById("relationship");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const formMessage = document.getElementById("formMessage");

    // Show the relationship field only when "Other" is selected.
    function updateRelationshipField() {
        const selectedRole = document.querySelector(
            'input[name="role"]:checked'
        );

        const isOther = selectedRole && selectedRole.value === "other";

        relationshipGroup.classList.toggle("hidden", !isOther);
        relationshipSelect.required = Boolean(isOther);

        if (!isOther) {
            relationshipSelect.value = "";
        }
    }

    roleInputs.forEach(function (input) {
        input.addEventListener("change", updateRelationshipField);
    });

    // Show or hide the password.
    togglePassword.addEventListener("click", function () {
        const isHidden = passwordInput.type === "password";

        passwordInput.type = isHidden ? "text" : "password";
        togglePassword.textContent = isHidden ? "Hide" : "Show";
    });

    // Demo submission: no account is created until a backend is connected.
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        formMessage.className = "form-message";

        if (!signupForm.checkValidity()) {
            signupForm.reportValidity();
            return;
        }

        formMessage.textContent =
            "Success! Your signup form is working. Account creation and " +
            "saving your details will be connected when we build the backend.";

        formMessage.classList.add("success");
    });

    updateRelationshipField();
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    const passwordInput = document.getElementById("loginPassword");
    const togglePassword = document.getElementById("toggleLoginPassword");
    const message = document.getElementById("loginMessage");
    const forgotPassword = document.getElementById("forgotPassword");

    // Show or hide the password.
    togglePassword.addEventListener("click", function () {
        const isHidden = passwordInput.type === "password";

        passwordInput.type = isHidden ? "text" : "password";
        togglePassword.textContent = isHidden ? "Hide" : "Show";
    });

    // Forgot-password demo.
    forgotPassword.addEventListener("click", function (event) {
        event.preventDefault();

        message.className = "form-message";
        message.textContent =
            "Password recovery will be available once email and backend services are connected.";
    });

    // Login demo.
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        message.className = "form-message success";
        message.textContent =
            "Your login form is working! Actual sign-in will be enabled when we connect the backend.";
    });
}