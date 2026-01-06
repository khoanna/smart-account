import { toPasskeyValidator, toWebAuthnKey, WebAuthnMode, PasskeyValidatorContractVersion } from "@botanary/passkey-validator";
import { createKernelAccount } from "@botanary/sdk";
import { PASSKEY_NAME, entryPoint, kernelVersion, publicClient } from "../../utils/constant";

export const registerWithPasskey = async (): Promise<typeof kernelAccount> => {
  const webAuthnKey = await toWebAuthnKey({
    passkeyName: PASSKEY_NAME,
    passkeyServerUrl: process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL!,
    mode: WebAuthnMode.Register,
    passkeyServerHeaders: {},
    ...(typeof window !== 'undefined' && { rpID: window.location.hostname }),
  });

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
  localStorage.setItem("type", "passkey");
  localStorage.setItem("has_passkey", "true");
  localStorage.setItem("kernelAccountAddress", JSON.stringify(kernelAccount.address));
  return kernelAccount;
};

export const loginWithPasskey = async (): Promise<typeof kernelAccount> => {
  const hasPasskey = localStorage.getItem("has_passkey");
  if (!hasPasskey || hasPasskey !== "true") {
    const account = await registerWithPasskey();
    return account;
  }
  const webAuthnKey = await toWebAuthnKey({
    passkeyName: PASSKEY_NAME,
    passkeyServerUrl: process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL!,
    mode: WebAuthnMode.Login,
    passkeyServerHeaders: {},
    ...(typeof window !== 'undefined' && { rpID: window.location.hostname }),
  });

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

  localStorage.setItem("type", "passkey");
  localStorage.setItem("kernelAccountAddress", JSON.stringify(kernelAccount.address));
  return kernelAccount;
};
