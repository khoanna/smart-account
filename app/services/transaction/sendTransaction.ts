import { createKernelAccount, createKernelAccountClient, CreateKernelAccountReturnType } from "@botanary/sdk";
import { type Hex, http } from "viem";
import { sepolia } from "viem/chains";
import { checkIsLoggedInSocial } from "../auth/social";
import { getSocialValidator, initiateLogin } from "@botanary/social-validator";
import { BOTANARY_PASSKEY_NAME, entryPoint, kernelVersion, publicClient } from "../../utils/constant";
import { PasskeyValidatorContractVersion, toPasskeyValidator, toWebAuthnKey, WebAuthnMode } from "@botanary/passkey-validator";

const sendTransactionSocial = async (to: Hex, value: bigint) => {
  const isUserLoggedIn = await checkIsLoggedInSocial();
  if (!isUserLoggedIn) {
    await initiateLogin({
      socialProvider: "google",
      oauthCallbackUrl: `${window.location.origin}/dashboard`,
      magicPublishKey: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY!,
    });
    return;
  }
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
  const kernelClient = createKernelAccountClient({
    client: publicClient,
    account: kernelAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL || ""),
  });
  const userOpHash = await kernelClient.sendUserOperation({
    callData: await kernelAccount.encodeCalls([
      {
        to: to,
        value: value,
        data: "0x",
      },
    ]),
  });

  return userOpHash;
};

const sendTransactionPasskey = async (to: Hex, value: bigint) => {
  const webAuthnKey = await toWebAuthnKey({
    passkeyName: BOTANARY_PASSKEY_NAME,
    passkeyServerUrl: process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL!,
    mode: WebAuthnMode.Login,
    passkeyServerHeaders: {},
  });

  const passkeyValidator = await toPasskeyValidator(publicClient, {
    webAuthnKey,
    entryPoint,
    kernelVersion,
    validatorContractVersion: PasskeyValidatorContractVersion.V0_0_3_PATCHED,
  });

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: passkeyValidator,
    },
    entryPoint,
    kernelVersion,
  });

  const kernelClient = createKernelAccountClient({
    client: publicClient,
    account: account,
    chain: sepolia,
    bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL || ""),
  });

  const userOpHash = await kernelClient.sendTransaction({
    to: to,
    value: value,
    data: "0x",
  });

  return userOpHash;
};

export const sendTransaction = async (to: Hex, value: bigint) => {
  const type = localStorage.getItem("type");
  switch (type) {
    case "social":
      const hash = await sendTransactionSocial(to, value);
      return hash;
    case "passkey":
      const passkeyHash = await sendTransactionPasskey(to, value);
      return passkeyHash;
    case "ecdsa":
      break;
    default:
      throw new Error("User not logged in");
  }
};
