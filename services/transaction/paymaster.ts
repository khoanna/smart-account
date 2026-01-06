import { publicClient, SPONSOR_PAYMASTER_ADDRESS } from "@/utils/constant";

import { createWalletClient, encodeFunctionData, http, parseAbi, parseEther, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

export const acceptUser = async (address: Hex) => {
  if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("ADMIN_PRIVATE_KEY environment variable is not set");
  }
  
  const adminAccount = privateKeyToAccount(process.env.ADMIN_PRIVATE_KEY as Hex);
  
  const adminWalletClient = createWalletClient({
    account: adminAccount,
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL || ""),
  });
  const whitelistHash = await adminWalletClient.sendTransaction({
    to: SPONSOR_PAYMASTER_ADDRESS,
    data: encodeFunctionData({
      abi: parseAbi(["function addAddress(address user) external"]),
      functionName: "addAddress",
      args: [address],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: whitelistHash });
};
