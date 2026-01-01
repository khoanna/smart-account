import { signerToEcdsaValidator } from "@botanary/ecdsa-validator";
import { publicClient, entryPoint, kernelVersion } from "../../utils/constant";
import { privateKeyToAccount } from "viem/accounts";
import { type Hex } from "viem";
import { createKernelAccount } from "@botanary/sdk/accounts";

export async function loginWithECDSA(privateKey: Hex) : Promise<typeof kernelAccount> {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: privateKeyToAccount(privateKey),
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

  localStorage.setItem("type", "ecdsa");
  localStorage.setItem("kernelAccountAddress", JSON.stringify(kernelAccount.address));
  return kernelAccount;
}
