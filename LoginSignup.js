const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error_message.style.display = 'none';
    error_message.classList.remove('vibrate');

    let errors = [];
    if (firstname_input && repeat_password_input) {
      errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, repeat_password_input.value);
    } else {
      errors = getLoginFormErrors(email_input.value, password_input.value);
    }

    if (errors.length > 0) {
      displayErrors(errors);
    } else {
      try {
        const response = await fetch(firstname_input ? '/signup' : '/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });

        const data = await response.json();

        if (data.success) {
          window.location.href = data.redirect;
        } else {
          displayErrors([data.message]);
        }
      } catch (error) {
        console.error('Error:', error);
        displayErrors(['An error occurred. Please try again.']);
      }
    }
  });
}

function getSignupFormErrors(firstname, email, password, repeatPassword) {
  let errors = [];

  if (!firstname) {
    errors.push('Firstname is required');
    firstname_input.parentElement.classList.add('incorrect');
  }

  if (!email) {
    errors.push('Email is required');
    email_input.parentElement.classList.add('incorrect');
  }

  if (!password || password.length < 8) {
    errors.push('Password must have at least 8 characters');
    password_input.parentElement.classList.add('incorrect');
  }

  if (password !== repeatPassword) {
    errors.push("Passwords don't match");
    password_input.parentElement.classList.add('incorrect');
    repeat_password_input.parentElement.classList.add('incorrect');
  }

  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];

  if (!email) {
    errors.push("Email is required");
    email_input.parentElement.classList.add("incorrect");
  }

  if (!password) {
    errors.push("Password is required");
    password_input.parentElement.classList.add("incorrect");
  }

  return errors;
}

function displayErrors(errors) {
  error_message.textContent = errors.join(". ");
  error_message.style.display = 'block';
  error_message.classList.add('vibrate');

  // Trigger vibration on mobile devices if supported
  if ('vibrate' in navigator) {
    navigator.vibrate(300);
  }

  // Remove vibration class after animation completes
  setTimeout(() => {
    error_message.classList.remove('vibrate');
  }, 300);
}

const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null);

allInputs.forEach(input => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("incorrect")) {
      input.parentElement.classList.remove("incorrect");
      error_message.style.display = 'none';
    }
  });
});