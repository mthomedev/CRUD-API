import { findUserById } from "./render.js";

const form = document.getElementById("create-user-form");
const formTitle = document.getElementById("form-title");
const submitBtn = form.querySelector('button[type="submit"]');
const cancelBtn = document.getElementById("cancel-edit");
const formError = document.getElementById("form-error");
const fields = {
  name: document.getElementById("name"),
  age: document.getElementById("age"),
  email: document.getElementById("email"),
};

const rules = {
  name: (v) => v.trim().length > 0 || "Name is required",
  age: (v) => (v >= 1 && v <= 150) || "Age must be between 1 and 150",
  email: (v) => /^\S+@\S+\.\S+$/.test(v) || "Invalid email",
};

export function validateField(fieldName) {
  const input = fields[fieldName];
  const result = rules[fieldName](input.value);
  const errorEl = document.getElementById(`${fieldName}-error`);

  if (result === true) {
    input.classList.remove("invalid");
    errorEl.textContent = "";
    return true;
  } else {
    input.classList.add("invalid");
    errorEl.textContent = result;
    return false;
  }
}

export function validateAll() {
  return Object.keys(fields).map(validateField).every(Boolean);
}

let editingId = null;
let originalUser = null;

export function getEditingId() {
  return editingId;
}
export function getOriginalUser() {
  return originalUser;
}

export function showError(message) {
  formError.textContent = message;
  formError.classList.remove("d-none");
}

export function hideError() {
  formError.classList.add("d-none");
  formError.textContent = "";
}

export function enterEditMode(user) {
  editingId = user.id;
  originalUser = { ...user };
  document.getElementById("name").value = user.name;
  document.getElementById("age").value = user.age;
  document.getElementById("email").value = user.email;
  formTitle.textContent = "Edit User";
  submitBtn.textContent = "Update";
  cancelBtn.style.display = "";
  document.getElementById("name").focus();
}

export function exitEditMode() {
  editingId = null;
  originalUser = null;
  formTitle.textContent = "Create User";
  submitBtn.textContent = "Create";
  cancelBtn.style.display = "none";
  form.reset();
}

export function getUserFromCard(button) {
  const card = button.closest(".user-card");
  return findUserById(Number(card.id));
}
