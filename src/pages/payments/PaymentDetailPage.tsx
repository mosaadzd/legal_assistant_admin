import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../lib/apiClient';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const q = useQuery({ queryKey: ['pending-payment', id], queryFn: ()=> adminApi.pendingPaymentDetail(id!) , enabled: !!id });
  const data = q.data as any;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Payment Detail</h2>
          <p className="text-[12px] text-gray-500">Full lifecycle + inquiry data.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <Link to="/payments" className="h-8 px-3 rounded-md bg-gray-200 text-gray-900 text-xs font-medium flex items-center hover:bg-gray-300">← Back</Link>
          {q.isFetching && <span>Refreshing...</span>}
        </div>
      </div>
      {!q.isLoading && !data && <div className="text-sm text-red-600">Not found.</div>}
      {q.isLoading && <div className="text-sm text-gray-500">Loading...</div>}
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-medium text-gray-700 mb-1">Summary</h3>
            <dl className="space-y-1">
              <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium capitalize">{data.status}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd>{data.plan_key}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Amount</dt><dd>{(data.amount_cents/100).toFixed(2)} {data.currency}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Order ID</dt><dd>{data.order_id || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Transaction ID</dt><dd>{data.transaction_id || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Payment Method</dt><dd>{data.payment_method || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Card</dt><dd>{data.card_pan || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Created</dt><dd>{new Date(data.created_at).toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Paid At</dt><dd>{data.paid_at? new Date(data.paid_at).toLocaleString(): '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Processed</dt><dd>{data.processed_at? new Date(data.processed_at).toLocaleString(): '—'}</dd></div>
              {data.failure_reason && <div className="flex justify-between"><dt className="text-gray-500">Failure</dt><dd className="text-red-600 max-w-[240px] text-right">{data.failure_reason}</dd></div>}
              {data.failure_user_message_en && <div className="flex justify-between"><dt className="text-gray-500">User Msg (EN)</dt><dd className="max-w-[240px] text-right">{data.failure_user_message_en}</dd></div>}
              {data.failure_user_message_ar && <div className="flex justify-between"><dt className="text-gray-500">User Msg (AR)</dt><dd className="max-w-[240px] text-right">{data.failure_user_message_ar}</dd></div>}
            </dl>
          </div>
          <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-medium text-gray-700 mb-1">User</h3>
            {data.user ? (
              <dl className="space-y-1">
                <div className="flex justify-between"><dt className="text-gray-500">ID</dt><dd className="font-mono text-[11px]">{data.user.id}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{data.user.email || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd>{data.user.name || '—'}</dd></div>
              </dl>
            ) : <div className="text-[12px] text-gray-500">No user record.</div>}
            <h3 className="font-medium text-gray-700 mt-4 mb-1">Transaction Summary</h3>
            <pre className="text-[11px] bg-gray-50 border rounded p-2 max-h-56 overflow-auto whitespace-pre-wrap">{JSON.stringify(data.transaction_summary, null, 2)}</pre>
          </div>
          <div className="bg-white border rounded-lg p-4 text-sm md:col-span-2">
            <h3 className="font-medium text-gray-700 mb-2">Raw Webhook Response</h3>
            <pre className="text-[11px] bg-gray-50 border rounded p-2 max-h-72 overflow-auto whitespace-pre-wrap">{JSON.stringify(data.raw_response, null, 2)}</pre>
          </div>
          <div className="bg-white border rounded-lg p-4 text-sm md:col-span-2">
            <h3 className="font-medium text-gray-700 mb-2">Raw Inquiry Response</h3>
            <pre className="text-[11px] bg-gray-50 border rounded p-2 max-h-72 overflow-auto whitespace-pre-wrap">{JSON.stringify(data.raw_inquiry_response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
