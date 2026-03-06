export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  
  if (!productId) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    );
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const successUrl = process.env.POLAR_SUCCESS_URL || `${request.nextUrl.origin}/payment/success`;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Payment configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: successUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Polar API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    const checkout = await response.json();
    
    if (checkout.url) {
      return NextResponse.redirect(checkout.url);
    }

    return NextResponse.json(checkout);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
