import { NextRequest, NextResponse } from "next/server";
import { submitKYC, verifyKYC, getKYCStatus, KYCData } from "@/lib/db/client";

// GET /api/kyc?address=<walletAddress> - Get KYC status
export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const kycStatus = await getKYCStatus(address);

    if (!kycStatus) {
      return NextResponse.json({
        kycStatus: "unverified",
        isAdult: null,
        zkProofHash: null,
        submittedAt: null
      });
    }

    return NextResponse.json(kycStatus);
  } catch (error) {
    console.error("KYC GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST /api/kyc - Submit KYC data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, ktpNumber, fullName, birthDate, address: userAddress } = body;

    if (!walletAddress || !ktpNumber || !fullName || !birthDate || !userAddress) {
      return NextResponse.json(
        { error: "Semua field KTP wajib diisi" },
        { status: 400 }
      );
    }

    const kycData: KYCData = {
      walletAddress,
      ktpNumber,
      fullName,
      birthDate,
      address: userAddress
    };

    const result = await submitKYC(walletAddress, kycData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "KYC berhasil diajukan. Sistem akan memverifikasi dalam 24 jam.",
      kycStatus: result.kycStatus
    });
  } catch (error) {
    console.error("KYC POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT /api/kyc/verify - Admin verification endpoint (for demo)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const result = await verifyKYC(walletAddress);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const message = result.kycStatus === 'verified'
      ? "KYC berhasil diverifikasi! Anda sekarang bisa menggunakan semua fitur."
      : "KYC ditolak. Silakan periksa data Anda dan ajukan ulang.";

    return NextResponse.json({
      success: true,
      message,
      kycStatus: result.kycStatus
    });
  } catch (error) {
    console.error("KYC PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}