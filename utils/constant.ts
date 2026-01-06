import { KERNEL_V3_3, getEntryPoint } from "@botanary/sdk/constants";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export const SPONSOR_PAYMASTER_ADDRESS = "0xD8b5D09f00eF3Bd681e7C5F838C63054E73261E9";

export const ENNTRYPOINT_VERSION = "0.7";
export const entryPoint = getEntryPoint(ENNTRYPOINT_VERSION);
export const kernelVersion = KERNEL_V3_3;
export const PASSKEY_NAME = "Wallet Passkey";
export const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC!),
  chain: sepolia,
});

