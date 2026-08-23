import React from 'react';
import { ShoppingBag, ArrowRight, Package, Clock, Plus, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { NavigationPage, Order, OrderItem } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';

interface OrdersPageProps {
  orders: Order[];
  loading?: boolean;
  onNavigate: (page: NavigationPage) => void;
  onInitiateClaimWithOrder?: (order: Order, item: OrderItem) => void;
  onAddTestOrder?: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  loading = false,
  onNavigate,
  onInitiateClaimWithOrder,
  onAddTestOrder,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time grocery orders associated with your authenticated account in Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onAddTestOrder && (
            <button
              id="add-test-order-btn"
              type="button"
              onClick={onAddTestOrder}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-medium text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              <span>Add Test Order (Academic Testing)</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('submit-claim')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <span>Submit a Claim</span>
          </button>
        </div>
      </div>

      {/* Academic Prototype Notice */}
      <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Academic Prototype Notice:</strong> Live delivery API connection is not enabled. Use the developer test order button above to create a test order in Firestore for claim evaluation.
          </span>
        </div>
      </div>

      {/* Orders Loading / List / Empty State */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-xs font-medium text-gray-500">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet."
          description="Your orders will appear here when they are connected to your account."
          actionText={onAddTestOrder ? 'Add Academic Test Order' : 'Submit a Claim'}
          onAction={onAddTestOrder ? onAddTestOrder : () => onNavigate('submit-claim')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
            >
              {/* Order top bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3.5 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-100">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </span>
                      {order.isTestOrder && (
                        <span className="text-[10px] font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          Test Order
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span>Placed on {order.orderDate}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {order.deliveryTime || 'Delivered'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-900">
                    Total: ₹{order.totalAmount || order.price}
                  </span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
              </div>

              {/* Order items */}
              <div className="mt-3 divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                        {item.productName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{item.productName}</p>
                        <p className="text-[11px] text-gray-400">
                          Qty: {item.quantity} &bull; Category: {item.category} &bull; ₹{item.unitPrice} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-xs font-semibold text-gray-700">
                        ₹{item.totalPrice}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onInitiateClaimWithOrder) {
                            onInitiateClaimWithOrder(order, item);
                          } else {
                            onNavigate('submit-claim');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                        <span>Report Issue / Claim</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
