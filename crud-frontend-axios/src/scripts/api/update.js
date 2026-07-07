import axios from "axios";

export async function putUser(apiUrl, id, user) {
  try {
    const response = await axios.put(`${apiUrl}?id=${id}`, {
      name: user.name,
      age: Number(user.age),
      email: user.email,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Failed to update user";
    throw new Error(message);
  }
}

export async function patchUser(apiUrl, id, fields) {
  try {
    const response = await axios.patch(`${apiUrl}?id=${id}`, fields);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Failed to patch user";
    throw new Error(message);
  }
}

export async function updateUser(apiUrl, id, user, originalUser) {
  const changedFields = {};
  if (user.name !== originalUser.name) changedFields.name = user.name;
  if (Number(user.age) !== originalUser.age)
    changedFields.age = Number(user.age);
  if (user.email !== originalUser.email) changedFields.email = user.email;

  if (Object.keys(changedFields).length === 0) return null;

  const allChanged = Object.keys(changedFields).length === 3;
  if (allChanged) {
    return putUser(apiUrl, id, user);
  } else {
    return patchUser(apiUrl, id, changedFields);
  }
}
