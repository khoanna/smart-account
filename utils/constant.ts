import { KERNEL_V3_3, getEntryPoint } from "@botanary/sdk/constants";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export const SPONSOR_PAYMASTER_ADDRESS = "0xD8b5D09f00eF3Bd681e7C5F838C63054E73261E9";
export const ERC20_PAYMASTER_ADDRESS = "0x49af013ae44c307876a6316a3e3d9e5a9e47e951";
export const TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const USDC_DECIMALS = 6;
export const PER_APPROVE_AMOUNT = BigInt(100 * 10 ** USDC_DECIMALS);

export const ENNTRYPOINT_VERSION = "0.7";
export const entryPoint = getEntryPoint(ENNTRYPOINT_VERSION);
export const kernelVersion = KERNEL_V3_3;
export const PASSKEY_NAME = "Wallet Passkey";
export const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC!),
  chain: sepolia,
});

