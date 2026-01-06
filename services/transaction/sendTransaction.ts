import { createKernelAccount, createKernelAccountClient, CreateKernelAccountReturnType } from "@botanary/sdk";
import { Address, encodeFunctionData, type Hex, http, parseAbi, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { checkIsLoggedInSocial } from "../auth/social";
import { getSocialValidator, initiateLogin } from "@botanary/social-validator";
import { PASSKEY_NAME, entryPoint, ERC20_PAYMASTER_ADDRESS, kernelVersion, PER_APPROVE_AMOUNT, publicClient, SPONSOR_PAYMASTER_ADDRESS, TOKEN_ADDRESS, APP_DOMAIN } from "../../utils/constant";
import { PasskeyValidatorContractVersion, toPasskeyValidator, toWebAuthnKey, WebAuthnMode } from "@botanary/passkey-validator";
import { acceptUserClient } from "./paymasterClient";
import { signerToEcdsaValidator } from "@botanary/ecdsa-validator";
import { privateKeyToAccount } from "viem/accounts";
import { decryptKey } from "../../utils/security";

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

export class InsufficientGasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientGasError";
  }
}

const parseTransactionError = (error: any): Error => {
  const errorMessage = error?.message?.toLowerCase() || error?.toString()?.toLowerCase() || "";

  if (errorMessage.includes("insufficient balance") || errorMessage.includes("insufficient funds for transfer") || errorMessage.includes("transfer amount exceeds balance")) {
    return new InsufficientBalanceError("Insufficient balance to complete transaction");
  }

  if (
    errorMessage.includes("insufficient funds for gas") ||
    errorMessage.includes("gas required exceeds allowance") ||
    errorMessage.includes("paymaster validation failed") ||
    errorMessage.includes("aa31") ||
    errorMessage.includes("aa33") ||
    errorMessage.includes("aa34") ||
    errorMessage.includes("signature error") ||
    errorMessage.includes("not whitelisted") ||
    errorMessage.includes("not allowed")
  ) {
    return new InsufficientGasError("Insufficient gas fee or not whitelisted");
  }

  return error;
};

const sendTransactionSocial = async (to: Hex, value: bigint, retryCount = 0): Promise<Hex> => {
  const isUserLoggedIn = await checkIsLoggedInSocial();
  if (!isUserLoggedIn) {
    await initiateLogin({
      socialProvider: "google",
      oauthCallbackUrl: `${window.location.origin}/dashboard`,
      magicPublishKey: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY!,
    });
    throw new Error("User not logged in");
  }

  try {
    const socialValidator = await getSocialValidator(publicClient, {
      entryPoint,
      kernelVersion,
      magicPublishKey: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY!,
    });

    const kernelAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: socialValidator,
      },
      entryPoint,
      kernelVersion,
    });

    // === Send UserOp with ERC20 Paymaster ===
    const sponsoredClient = createKernelAccountClient({
      account: kernelAccount,
      chain: sepolia,
      bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL || ""),
      paymaster: {
        getPaymasterData: async (userOp) => {
          return {
            paymaster: SPONSOR_PAYMASTER_ADDRESS as Address,
            paymasterData: "0x" as Hex,
            paymasterVerificationGasLimit: BigInt(100000),
            paymasterPostOpGasLimit: BigInt(0),
          };
        },
      },
    });

    const txHash = await sponsoredClient.sendTransaction({
      to: to,
      value: value,
      data: "0x",
    });

    return txHash;
  } catch (error) {
    console.log(error);

    const parsedError = parseTransactionError(error);

    if (parsedError instanceof InsufficientGasError && retryCount === 0) {
      console.log("Gas error detected, attempting to whitelist user and retry...");

      const socialValidator = await getSocialValidator(publicClient, {
        entryPoint,
        kernelVersion,
        magicPublishKey: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY!,
      });

      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: socialValidator,
        },
        entryPoint,
        kernelVersion,
      });

      await acceptUserClient(kernelAccount.address);

      return sendTransactionSocial(to, value, retryCount + 1);
    }

    throw parsedError;
  }
};

const sendTransactionPasskey = async (to: Hex, value: bigint, retryCount = 0): Promise<Hex> => {
  const webAuthnKey = await toWebAuthnKey({
    passkeyName: PASSKEY_NAME,
    passkeyServerUrl: process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL!,
    mode: WebAuthnMode.Login,
    passkeyServerHeaders: {},
    rpID: APP_DOMAIN,
  });
  try {
    const passkeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint,
      kernelVersion,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_3_PATCHED,
    });

    const kernelAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: passkeyValidator,
      },
      entryPoint,
      kernelVersion,
    });

    const sponsoredClient = createKernelAccountClient({
      account: kernelAccount,
      chain: sepolia,
      bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL || ""),
      paymaster: {
        getPaymasterData: async (userOp) => {
          return {
            paymaster: SPONSOR_PAYMASTER_ADDRESS as Address,
            paymasterData: "0x" as Hex,
            paymasterVerificationGasLimit: BigInt(100000),
            paymasterPostOpGasLimit: BigInt(0),
          };
        },
      },
    });

    const txHash = await sponsoredClient.sendTransaction({
      to: to,
      value: value,
      data: "0x",
    });

    return txHash;
  } catch (error) {
    const parsedError = parseTransactionError(error);

    if (parsedError instanceof InsufficientGasError && retryCount === 0) {
      console.log("Gas error detected, attempting to whitelist user and retry...");

      const passkeyValidator = await toPasskeyValidator(publicClient, {
        webAuthnKey,
        entryPoint,
        kernelVersion,
        validatorContractVersion: PasskeyValidatorContractVersion.V0_0_3_PATCHED,
      });

      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: passkeyValidator,
        },
        entryPoint,
        kernelVersion,
      });

      await acceptUserClient(kernelAccount.address);

      return sendTransactionPasskey(to, value, retryCount + 1);
    }

    throw parsedError;
  }
};

const sendTransactionECDSA = async (to: Hex, value: bigint, password: string, retryCount = 0): Promise<Hex> => {
  const encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");
  const storedEoaAddress = localStorage.getItem("eoaAddress");
  
  if (!encryptedPrivateKey || !storedEoaAddress) {
    throw new Error("EOA credentials not found");
  }

  try {
    // Decrypt private key with password
    const decryptedPrivateKey = decryptKey(encryptedPrivateKey, password);
    
    if (!decryptedPrivateKey) {
      throw new Error("Invalid password");
    }

    // Verify the private key matches the stored EOA address
    const eoaAccount = privateKeyToAccount(decryptedPrivateKey as Hex);
    
    if (eoaAccount.address.toLowerCase() !== storedEoaAddress.toLowerCase()) {
      throw new Error("Private key mismatch - invalid password");
    }

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: eoaAccount,
      entryPoint,
      kernelVersion,
    });

    const kernelAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    });

    const sponsoredClient = createKernelAccountClient({
      account: kernelAccount,
      chain: sepolia,
      bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL || ""),
      paymaster: {
        getPaymasterData: async (userOp) => {
          return {
            paymaster: SPONSOR_PAYMASTER_ADDRESS as Address,
            paymasterData: "0x" as Hex,
            paymasterVerificationGasLimit: BigInt(100000),
            paymasterPostOpGasLimit: BigInt(0),
          };
        },
      },
    });

    const txHash = await sponsoredClient.sendTransaction({
      to: to,
      value: value,
      data: "0x",
    });

    return txHash;
  } catch (error) {
    const parsedError = parseTransactionError(error);

    if (parsedError instanceof InsufficientGasError && retryCount === 0) {
      console.log("Gas error detected, attempting to whitelist user and retry...");

      const decryptedPrivateKey = decryptKey(encryptedPrivateKey, password);
      const eoaAccount = privateKeyToAccount(decryptedPrivateKey as Hex);

      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: eoaAccount,
        entryPoint,
        kernelVersion,
      });

      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion,
      });

      await acceptUserClient(kernelAccount.address);

      return sendTransactionECDSA(to, value, password, retryCount + 1);
    }

    throw parsedError;
  }
};

export const sendTransaction = async (to: Hex, value: bigint, password?: string) => {
  const type = localStorage.getItem("type");
  switch (type) {
    case "social":
      const hash = await sendTransactionSocial(to, value);
      return hash;
    case "passkey":
      const passkeyHash = await sendTransactionPasskey(to, value);
      return passkeyHash;
    case "ecdsa":
      if (!password) {
        throw new Error("Password required for EOA transaction");
      }
      const ecdsaHash = await sendTransactionECDSA(to, value, password);
      return ecdsaHash;
    default:
      throw new Error("User not logged in");
  }
};
