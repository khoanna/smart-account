import CryptoJS from "crypto-js";

export const encryptKey = (privateKey: string, pin: string): string => {
  return CryptoJS.AES.encrypt(privateKey, pin).toString();
};

export const decryptKey = (encryptedKey: string, pin: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, pin);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted; 
  } catch (error) {
    return "";
  }
};