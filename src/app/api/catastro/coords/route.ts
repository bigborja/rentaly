import { NextResponse } from "next/server";
import { lookupByCoordinates } from "@/lib/catastro";
import { barrioAt } from "@/lib/barrios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lng = Number(searchParams.get("lng"));
  const lat = Number(searchParams.get("lat"));
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return NextResponse.json({ error: "Coordenadas no válidas." }, { status: 400 });
  }
  try {
    const parcel = await lookupByCoordinates(lng, lat);
    const barrio = await barrioAt(parcel.longitude, parcel.latitude);
    return NextResponse.json({ ...parcel, barrio });
  } catch (error) {
    const barrio = await barrioAt(lng, lat);
    const message = error instanceof Error ? error.message : "No hay parcela en ese punto.";
    return NextResponse.json({ error: message, barrio }, { status: 404 });
  }
}
