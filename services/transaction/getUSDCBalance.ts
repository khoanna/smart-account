import { publicClient, TOKEN_ADDRESS } from "@/utils/constant";
import { type Address, formatUnits } from "viem";

/**
 * Get USDC balance for an account
 * @param accountAddress - The address to check balance for
 * @returns USDC balance as a formatted string 
 */
export const getUSDCBalance = async (accountAddress: Address): Promise<string> => {
  try {
    const balance = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [accountAddress],
    });

    return formatUnits(balance as bigint, 6);
  } catch (error) {
    console.error("Error fetching USDC balance:", error);
    throw error;
  }
};

/**
 * Get USDC balance as raw bigint value
 * @param accountAddress - The address to check balance for
 * @returns USDC balance as bigint 
 */
export const getUSDCBalanceRaw = async (accountAddress: Address): Promise<bigint> => {
  try {
    const balance = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [accountAddress],
    });

    return balance as bigint;
  } catch (error) {
    console.error("Error fetching USDC balance:", error);
    throw error;
  }
};
