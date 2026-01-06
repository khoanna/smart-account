import { signerToEcdsaValidator } from "@botanary/ecdsa-validator";
import { publicClient, entryPoint, kernelVersion } from "../../utils/constant";
import { privateKeyToAccount } from "viem/accounts";
import { type Hex } from "viem";
import { createKernelAccount } from "@botanary/sdk/accounts";
import { encryptKey } from "../../utils/security";

export async function loginWithECDSA(password: string, privateKey: Hex): Promise<typeof kernelAccount> {
  // Create account from private key
  const eoaAccount = privateKeyToAccount(privateKey);
  
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

  // Encrypt and store private key with password
  const encryptedPrivateKey = encryptKey(privateKey, password);
  
  localStorage.setItem("type", "ecdsa");
  localStorage.setItem("kernelAccountAddress", JSON.stringify(kernelAccount.address));
  localStorage.setItem("encryptedPrivateKey", encryptedPrivateKey);
  localStorage.setItem("eoaAddress", eoaAccount.address);
  
  return kernelAccount;
}
