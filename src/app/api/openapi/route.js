import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

export const GET = () => NextResponse.json(openApiSpec);
