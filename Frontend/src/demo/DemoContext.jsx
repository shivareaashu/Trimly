'use client';

import React, { createContext, useContext, useState } from 'react';
import { DEMO_SALON } from './data/salon.mock';
import { MOCK_DASHBOARD } from './data/dashboard.mock';
import { MOCK_CALENDAR } from './data/calendar.mock';
import { MOCK_CUSTOMERS } from './data/customers.mock';
import { MOCK_STAFF } from './data/staff.mock';
import { MOCK_PAYMENTS } from './data/payments.mock';
import { MOCK_PAYROLL } from './data/payroll.mock';
import { MOCK_EXPENSES } from './data/expenses.mock';
import { MOCK_FINANCE } from './data/finance.mock';
import { MOCK_INVENTORY } from './data/inventory.mock';
import { MOCK_SUPPLIERS } from './data/suppliers.mock';
import { MOCK_PLATFORM } from './data/platform.mock';
import { DemoToast } from './DemoToast';

const DemoContext = createContext();

export function DemoProvider({ children }) {
  // Local state for interactive features
  const [salon, setSalon] = useState(DEMO_SALON);
  const [dashboard, setDashboard] = useState(MOCK_DASHBOARD);
  const [calendar, setCalendar] = useState(MOCK_CALENDAR);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS.customers);
  const [staff, setStaff] = useState(MOCK_STAFF.staff);
  const [payments, setPayments] = useState(MOCK_PAYMENTS.payments);
  const [payroll, setPayroll] = useState(MOCK_PAYROLL.payrollList);
  const [expenses, setExpenses] = useState(MOCK_EXPENSES.expenses);
  const [inventory, setInventory] = useState(MOCK_INVENTORY.products);
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS.suppliers);
  const [purchaseOrders, setPurchaseOrders] = useState(MOCK_SUPPLIERS.purchaseOrders);
  const [platform, setPlatform] = useState(MOCK_PLATFORM);
  const [websiteTheme, setWebsiteTheme] = useState('luxury');
  
  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, detail) => {
    setToast({ message, detail });
  };

  const triggerToast = (actionName) => {
    showToast(
      'Demo Mode Only',
      `Create your free Trimly account to save "${actionName}".`
    );
  };

  // Interactive mock mutations (local only)
  const addAppointment = (newApp) => {
    setCalendar(prev => ({
      ...prev,
      appointments: [...prev.appointments, { ...newApp, id: `cal-${Date.now()}` }]
    }));
    showToast('Success', 'Demo appointment scheduled locally!');
  };

  const updateAppointmentStatus = (id, status) => {
    setCalendar(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === id ? { ...a, status } : a)
    }));
    showToast('Updated', `Appointment status changed to ${status.toLowerCase()}`);
  };

  const updatePayrollStatus = (id, status) => {
    setPayroll(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    showToast('Payroll Updated', `Payroll entry ${status.toLowerCase()}`);
  };

  const adjustInventoryStock = (id, delta) => {
    setInventory(prev => prev.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + delta);
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'OUT_OF_STOCK' : newStock <= p.reorderPoint ? 'LOW' : 'IN_STOCK'
        };
      }
      return p;
    }));
    showToast('Stock Adjusted', 'Item stock adjusted locally.');
  };

  const handleDemoAction = (label) => {
    triggerToast(label);
  };

  return (
    <DemoContext.Provider value={{
      salon,
      dashboard,
      calendar,
      customers,
      staff,
      payments,
      payroll,
      expenses,
      inventory,
      suppliers,
      purchaseOrders,
      platform,
      websiteTheme,
      setWebsiteTheme,
      
      // Mutations
      addAppointment,
      updateAppointmentStatus,
      updatePayrollStatus,
      adjustInventoryStock,
      demoAction: handleDemoAction,
      showToast
    }}>
      {children}
      {toast && (
        <DemoToast
          message={toast.message}
          detail={toast.detail}
          onClose={() => setToast(null)}
        />
      )}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
