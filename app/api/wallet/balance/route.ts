import { NextRequest, NextResponse } from 'next/server';
import { GoldRushClient, type Chain } from '@covalenthq/client-sdk';

// Initialize GoldRush client on server side with API key
const client = new GoldRushClient(process.env.GOLD_RUSH_API_KEY || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainName = searchParams.get('chain') || 'eth-sepolia';
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const balanceResp = await client.BalanceService.getTokenBalancesForWalletAddress(
      chainName as Chain,
      walletAddress
    );

    if (balanceResp.error) {
      console.error('GoldRush API error:', balanceResp.error);
      return NextResponse.json(
        { error: 'Failed to fetch wallet balance' },
        { status: 500 }
      );
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedData = JSON.parse(JSON.stringify(balanceResp.data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({
      success: true,
      data: serializedData
    });

  } catch (error) {
    console.error('Error fetching token balances:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}