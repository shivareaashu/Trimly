import { AlertTriangle, Wallet } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export function AlertsAndPayments({ paymentsList, showMockData }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Inventory Alerts Box */}
      <div className="glass-card p-6 rounded-[32px] border-l-[6px] border-rose-500">
        <div className="flex items-center gap-3 mb-4 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-headline-md text-lg text-foreground font-semibold">{t('inventory_alerts')}</h3>
        </div>
        <ul className="space-y-4">
          <li className="flex justify-between items-center text-sm border-b border-border/40 pb-3">
            <div>
              <p className="font-semibold text-foreground">L'Oréal Mythic Oil</p>
              <p className="text-xs text-muted-foreground">2 units left</p>
            </div>
            <button className="text-primary hover:text-primary/80 transition-colors font-semibold text-xs border-b border-primary">
              Reorder
            </button>
          </li>
          <li className="flex justify-between items-center text-sm">
            <div>
              <p className="font-semibold text-foreground">Wella Koleston 7/0</p>
              <p className="text-xs text-rose-600 font-semibold uppercase text-[10px]">Out of Stock</p>
            </div>
            <button className="text-primary hover:text-primary/80 transition-colors font-semibold text-xs border-b border-primary">
              Reorder
            </button>
          </li>
        </ul>
      </div>

      {/* Pending Payments Box */}
      <div className="glass-card p-6 rounded-[32px] bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-3 mb-4 text-primary">
          <Wallet className="h-5 w-5" />
          <h3 className="font-headline-md text-lg text-foreground font-semibold">{t('pending_payments')}</h3>
        </div>
        
        <div className="space-y-3.5">
          {!showMockData && paymentsList.filter(p => p.paymentStatus !== 'PAID').length > 0 ? (
            paymentsList.filter(p => p.paymentStatus !== 'PAID').slice(0, 3).map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-3.5 bg-white border border-border/40 rounded-2xl shadow-sm hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-foreground text-sm">Inv #{payment.id?.slice(0, 4)} - {payment.customer?.firstName || 'Guest'}</p>
                  <p className="text-xs text-muted-foreground">{payment.appointment?.service?.name || 'Treatment'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">₹{Number(payment.amount).toLocaleString('en-IN')}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider ${
                    payment.paymentStatus === 'PARTIAL' ? 'text-amber-500' : 'text-rose-600'
                  }`}>{payment.paymentStatus || 'UNPAID'}</p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="flex justify-between items-center p-3.5 bg-white border border-border/40 rounded-2xl shadow-sm hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-foreground text-sm">Inv #8842 - Meera J.</p>
                  <p className="text-xs text-muted-foreground">Keratin Treatment</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">₹8,500</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Partial</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-white border border-border/40 rounded-2xl shadow-sm hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-foreground text-sm">Inv #8839 - Arjun S.</p>
                  <p className="text-xs text-muted-foreground">Facial & Grooming</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">₹3,200</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-rose-600">Unpaid</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertsAndPayments;
