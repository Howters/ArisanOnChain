import { NextRequest, NextResponse } from "next/server";
import { verifyKYC } from "@/lib/db/client";

// POST /api/kyc/verify - Demo verification endpoint (normally this would be admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // In production, this should check admin permissions
    // For demo purposes, we'll allow verification

    const result = await verifyKYC(walletAddress);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.kycStatus === 'verified'
        ? "KYC verified successfully!"
        : "KYC verification completed",
      kycStatus: result.kycStatus
    });
  } catch (error) {
    console.error("KYC verification error:", error);
    return NextResponse.json(
      { error: "Server error during verification" },
      { status: 500 }
    );
  }
}