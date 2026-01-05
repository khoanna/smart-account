import { KERNEL_V3_3, getEntryPoint } from "@zerodev/sdk/constants";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export const ENNTRYPOINT_VERSION = "0.7";
export const entryPoint = getEntryPoint(ENNTRYPOINT_VERSION);
export const kernelVersion = KERNEL_V3_3;
export const PASSKEY_NAME = "Wallet Passkey";
export const publicClient = createPublicClient({
  transport: http(),
  chain: sepolia,
});
