CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_uuid TEXT UNIQUE,
  merchant_invoice_id TEXT NOT NULL UNIQUE,
  numero_beneficiaire TEXT NOT NULL,
  numero_payeur TEXT,
  operateur TEXT NOT NULL,
  forfait TEXT NOT NULL,
  montant INTEGER NOT NULL,
  payment_method TEXT,
  statut TEXT NOT NULL DEFAULT 'PENDING',
  pay_url TEXT,
  webhook_data JSONB,
  mode TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ
);

GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_transactions_uuid ON public.transactions (transaction_uuid);
CREATE INDEX idx_transactions_created_at ON public.transactions (created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();