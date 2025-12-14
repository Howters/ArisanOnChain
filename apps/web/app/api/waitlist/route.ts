import { NextRequest, NextResponse } from "next/server";
import { addToWaitlist, getWaitlistStats, WaitlistEntry } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistEntry = await request.json();
    
    if (!body.nama || !body.email || !body.whatsapp || !body.kota || !body.peran) {
      return NextResponse.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }
    
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    const cleanPhone = body.whatsapp.replace(/[\s-]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Format nomor WhatsApp tidak valid" },
        { status: 400 }
      );
    }
    
    const result = await addToWaitlist({
      ...body,
      whatsapp: cleanPhone,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Berhasil bergabung dengan waiting list!",
      id: result.id,
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await getWaitlistStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Waitlist stats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

