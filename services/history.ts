import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY || "YOUR_KEY",
  network: Network.ETH_SEPOLIA, 
};

const alchemy = new Alchemy(config);

export interface TransactionActivity {
  hash: string;
  action: "Send" | "Receive";
  asset: string;
  value: number;
  from: string;
  to: string;
  timestamp: string; // ISO string (e.g., "2023-12-30T10:00:00Z")
}

export const getTransactionHistory = async (address: string): Promise<TransactionActivity[]> => {
  if (!address) return [];

  try {
    const receivedResponse = await alchemy.core.getAssetTransfers({
      toAddress: address,
      category: [
        AssetTransfersCategory.EXTERNAL, 
        AssetTransfersCategory.INTERNAL, 
      ],
      withMetadata: true, 
      excludeZeroValue: true,
      order: SortingOrder.DESCENDING,
      maxCount: 10,
    });

    const sendResponse = await alchemy.core.getAssetTransfers({
      fromAddress: address,
      category: [
        AssetTransfersCategory.EXTERNAL, 
        AssetTransfersCategory.INTERNAL, 
      ],
      withMetadata: true, 
      excludeZeroValue: true,
      order: SortingOrder.DESCENDING,
      maxCount: 10,
    });
    
    const allTransfers = [
      ...receivedResponse.transfers, 
      ...sendResponse.transfers
    ];

    const history: TransactionActivity[] = allTransfers
      .map((tx) => {
        const isSender = tx.from.toLowerCase() === address.toLowerCase();
        return {
          hash: tx.hash,
          action: (isSender ? "Send" : "Receive") as "Send" | "Receive",
          asset: tx.asset || "ETH",
          value: tx.value || 0,
          from: tx.from,
          to: tx.to || "",
          timestamp: tx.metadata.blockTimestamp,
        };
      })
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

    return history;
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};