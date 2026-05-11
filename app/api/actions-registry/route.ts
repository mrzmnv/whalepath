import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const payload = {
    rules: [
      {
        pathPattern: "/wallet/*",
        apiPath: "/api/actions/whale/*",
      },
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };

  return NextResponse.json(payload, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
