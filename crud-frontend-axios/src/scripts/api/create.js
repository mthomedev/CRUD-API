import axios from "axios";

export async function createUser(apiUrl, user) {
  try {
    const response = await axios.post(apiUrl, {
      name: user.name,
      age: Number(user.age),
      email: user.email,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Failed to create user";
    console.error("Error creating user:", message);
    throw new Error(message);
  }
}
