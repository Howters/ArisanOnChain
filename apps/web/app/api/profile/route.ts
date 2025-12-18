import { NextRequest, NextResponse } from "next/server";
import { getProfile, upsertProfile, UserProfile } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("address");
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }
    
    const profile = await getProfile(walletAddress);
    
    if (!profile) {
      return NextResponse.json({ profile: null });
    }
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, nama, whatsapp, kota } = body;
    
    if (!walletAddress || !nama || !whatsapp) {
      return NextResponse.json(
        { error: "Wallet address, nama, dan WhatsApp wajib diisi" },
        { status: 400 }
      );
    }
    
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    const cleanPhone = whatsapp.replace(/[\s-]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Format nomor WhatsApp tidak valid" },
        { status: 400 }
      );
    }
    
    const profile: UserProfile = {
      walletAddress,
      nama,
      whatsapp: cleanPhone,
      kota,
    };
    
    const result = await upsertProfile(profile);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Profil berhasil disimpan",
    });
  } catch (error) {
    console.error("Profile POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}



