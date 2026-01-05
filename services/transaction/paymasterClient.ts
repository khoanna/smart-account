import type { Hex } from "viem";


export const acceptUserClient = async (address: Hex): Promise<void> => {
  try {
    const response = await fetch("/api/paymaster/accept-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to accept user");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling acceptUser API:", error);
    throw error;
  }
};
