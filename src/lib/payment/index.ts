// ─── Payment Provider Interface ─────────────────────────────────────
export interface InitiateParams {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  method?: string;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'initiated' | 'success' | 'failed';
  checkoutUrl: string | null;
}

export interface VerifyResult {
  success: boolean;
  transactionId: string;
  amount: number;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
}

export interface IPaymentProvider {
  name: string;
  initiate(params: InitiateParams): Promise<PaymentTransaction>;
  verify(id: string, response: unknown): Promise<VerifyResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

// ─── Mock Payment Provider ──────────────────────────────────────────
// Simulates payment gateway for development / Spark plan
const mockTransactions = new Map<string, { amount: number; status: string }>();

export class MockPaymentProvider implements IPaymentProvider {
  name = 'mock';

  async initiate(params: InitiateParams): Promise<PaymentTransaction> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 300));

    const id = `mock_txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    mockTransactions.set(id, { amount: params.amount, status: 'initiated' });

    return {
      id,
      amount: params.amount,
      currency: params.currency,
      status: 'initiated',
      checkoutUrl: null,
    };
  }

  async verify(id: string, _response: unknown): Promise<VerifyResult> {
    await new Promise((r) => setTimeout(r, 200));

    const txn = mockTransactions.get(id);
    if (!txn) {
      return { success: false, transactionId: id, amount: 0 };
    }

    // Mock: always succeeds unless amount ends in .99 (test failure)
    const success = !String(txn.amount).endsWith('.99');
    txn.status = success ? 'success' : 'failed';

    return { success, transactionId: id, amount: txn.amount };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      refundId: `mock_refund_${Date.now()}`,
    };
  }
}

// ─── Provider Factory ───────────────────────────────────────────────
let provider: IPaymentProvider | null = null;

export function getPaymentProvider(): IPaymentProvider {
  if (!provider) {
    // Future: check env var for razorpay/stripe
    provider = new MockPaymentProvider();
  }
  return provider;
}
