import { NextRequest, NextResponse } from "next/server";
import { getProfilesByAddresses } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses } = body;
    
    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: "Addresses array is required" },
        { status: 400 }
      );
    }
    
    const profiles = await getProfilesByAddresses(addresses);
    const profilesObj: Record<string, any> = {};
    profiles.forEach((profile, address) => {
      profilesObj[address] = profile;
    });
    
    return NextResponse.json({ profiles: profilesObj });
  } catch (error) {
    console.error("Profile batch error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}




