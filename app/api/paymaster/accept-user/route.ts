import { acceptUser } from "@/services/transaction/paymaster";
import { NextRequest, NextResponse } from "next/server";
import { isAddress, type Hex } from "viem";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    await acceptUser(address as Hex);

    return NextResponse.json(
      { success: true, message: "User accepted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting user:", error);
    return NextResponse.json(
      { error: "Failed to accept user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
