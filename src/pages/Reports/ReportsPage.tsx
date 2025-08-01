import React, { useState } from 'react';
import ResetButton from '../../components/Common/ResetButton';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import { BarChart3, FileText, DollarSign, Calendar, Download, Printer } from 'lucide-react';
import { Purchase, Sale, Product, Expense, Staff } from '../../types';
import { generateCompanyInfoHTML } from '../../utils/printUtils';

type ReportType = 'purchase' | 'stock' | 'profit';
type DateRange = 'today' | 'week' | 'month' | 'custom';

const ReportsPage: React.FC = () => {
  const { purchases, sales, products, suppliers, customers, expenses, staff, loading } = useApp();
  const { showToast } = useToast();
  const [reportType, setReportType] = useState<ReportType>('purchase');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter data based on date range
  const filterByDateRange = (date: string) => {
    const itemDate = new Date(date);
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    switch (dateRange) {
      case 'today':
        return itemDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return itemDate >= weekAgo && itemDate <= today;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return itemDate >= monthAgo && itemDate <= today;
      case 'custom':
        return itemDate >= start && itemDate <= end;
      default:
        return true;
    }
  };

  // Filter purchases by date range and search term
  const filteredPurchases = purchases.filter(purchase => {
    const supplier = suppliers.find(s => s.id === purchase.supplierId);
    const matchesDate = filterByDateRange(purchase.purchaseDate);
    const matchesSearch = searchTerm === '' || 
      purchase.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier && supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate && matchesSearch;
  });

  // Filter sales by date range and search term
  const filteredSales = sales.filter(sale => {
    const customer = customers.find(c => c.id === sale.customerId);
    const matchesDate = filterByDateRange(sale.saleDate);
    const matchesSearch = searchTerm === '' || 
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate && matchesSearch;
  });

  // Filter expenses by date range and search term
  const filteredExpenses = expenses.filter(expense => {
    const matchesDate = filterByDateRange(expense.date);
    const matchesSearch = searchTerm === '' || 
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate && matchesSearch;
  });

  // Filter staff by search term (for paid salaries)
  const filteredStaff = staff.filter(staffMember => 
    searchTerm === '' || 
    staffMember.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total purchase amount (cost of goods sold)
  const totalPurchaseAmount = filteredPurchases.reduce(
    (sum, purchase) => sum + (purchase.netAmount || purchase.totalAmount), 
    0
  );

  // Calculate total sales amount
  const totalSalesAmount = filteredSales.reduce(
    (sum, sale) => sum + (sale.netAmount || sale.totalAmount), 
    0
  );

  // Calculate total paid expenses
  const totalPaidExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate total paid staff salaries
  const totalPaidSalaries = filteredStaff.reduce(
    (sum, staffMember) => sum + (staffMember.salaryPaid || 0),
    0
  );

  // Calculate total unpaid staff salaries (tracked but not subtracted from profit)
  const totalUnpaidSalaries = filteredStaff.reduce(
    (sum, staffMember) => sum + (staffMember.remainingSalary || 0),
    0
  );

  // Calculate profit: total sales - cost of goods sold - paid expenses - paid staff salaries
  const profit = totalSalesAmount - totalPurchaseAmount - totalPaidExpenses - totalPaidSalaries;

  // Purchase report columns
  const purchaseColumns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { 
      key: 'supplierId', 
      label: 'Supplier',
      render: (value: string) => {
        const supplier = suppliers.find(s => s.id === value);
        return supplier ? supplier.name : 'Unknown';
      }
    },
    { 
      key: 'purchaseDate', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { key: 'totalItems', label: 'Items' },
    { 
      key: 'totalAmount', 
      label: 'Total Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'discount', 
      label: 'Discount',
      render: (value: number) => value ? `₨${value.toFixed(2)}` : '₨0.00'
    },
    { 
      key: 'netAmount', 
      label: 'Net Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  // Stock report columns
  const stockColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category', render: (value: string) => value || 'N/A' },
    { 
      key: 'currentStock', 
      label: 'Current Stock',
      render: (value: number, product: Product) => `${value} ${product.unit}`
    },
    { 
      key: 'minStockLevel', 
      label: 'Min Stock Level',
      render: (value: number) => value || 'N/A'
    },
    { 
      key: 'tradePrice', 
      label: 'Trade Price',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'salePrice', 
      label: 'Sale Price',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'stockValue', 
      label: 'Stock Value',
      render: (_: any, product: Product) => `₨${(product.currentStock * product.tradePrice).toFixed(2)}`
    }
  ];

  // Filter products by search term
  const filteredProducts = products.filter(product => 
    searchTerm === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group sales by invoice for reference
  const salesByInvoice = filteredSales.reduce((acc, sale) => {
    acc[sale.invoiceNumber] = sale;
    return acc;
  }, {} as Record<string, Sale>);

  // Calculate profit data for products with sales information
  const profitData = [];
  
  // Process each sale to include invoice information
  filteredSales.forEach(sale => {
    // Add each product from this sale
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      const costAmount = item.quantity * product.tradePrice;
      const productProfit = item.total - costAmount;
      
      profitData.push({
        id: `${sale.id}-${item.id}`,
        invoiceNumber: sale.invoiceNumber,
        saleDate: sale.saleDate,
        customerName: sale.customerName || (sale.customer ? sale.customer.name : 'Walk-in Customer'),
        customerPhone: sale.customerPhone || (sale.customer ? sale.customer.phone : ''),
        code: product.code,
        name: product.name,
        category: product.category,
        soldQuantity: item.quantity,
        saleAmount: item.total,
        costAmount: costAmount,
        profit: productProfit,
        profitMargin: item.total > 0 ? (productProfit / item.total) * 100 : 0
      });
    });
  });
  
  // Sort by sale date (newest first)
  profitData.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

  // Profit report columns
  const profitColumns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { 
      key: 'saleDate', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { key: 'customerName', label: 'Customer' },
    { key: 'customerPhone', label: 'Phone' },
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category', render: (value: string) => value || 'N/A' },
    { key: 'soldQuantity', label: 'Qty' },
    { 
      key: 'saleAmount', 
      label: 'Sale Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'costAmount', 
      label: 'Cost Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'profit', 
      label: 'Profit',
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          ₨{value.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'profitMargin', 
      label: 'Profit Margin',
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {value.toFixed(2)}%
        </span>
      )
    }
  ];

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'today':
        start = today;
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start = new Date(today);
        start.setMonth(today.getMonth() - 1);
        break;
      case 'custom':
        // Keep existing custom dates
        return;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  // Export report to CSV
  const exportToCSV = () => {
    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];
    
    if (reportType === 'purchase') {
      data = filteredPurchases.map(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        return {
          'Invoice #': purchase.invoiceNumber,
          'Supplier': supplier ? supplier.name : 'Unknown',
          'Date': new Date(purchase.purchaseDate).toLocaleDateString(),
          'Items': purchase.totalItems,
          'Total Amount': purchase.totalAmount.toFixed(2),
          'Discount': (purchase.discount || 0).toFixed(2),
          'Net Amount': (purchase.netAmount || purchase.totalAmount).toFixed(2),
          'Status': purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)
        };
      });
      filename = 'purchase-report';
      headers = ['Invoice #', 'Supplier', 'Date', 'Items', 'Total Amount', 'Discount', 'Net Amount', 'Status'];
    } else if (reportType === 'stock') {
      data = filteredProducts.map(product => ({
        'Code': product.code,
        'Product Name': product.name,
        'Category': product.category || 'N/A',
        'Current Stock': product.currentStock,
        'Unit': product.unit,
        'Min Stock Level': product.minStockLevel || 'N/A',
        'Trade Price': product.tradePrice.toFixed(2),
        'Sale Price': product.salePrice.toFixed(2),
        'Stock Value': (product.currentStock * product.tradePrice).toFixed(2)
      }));
      filename = 'stock-report';
      headers = ['Code', 'Product Name', 'Category', 'Current Stock', 'Unit', 'Min Stock Level', 'Trade Price', 'Sale Price', 'Stock Value'];
    } else if (reportType === 'profit') {
      data = profitData.map(item => ({
        'Invoice #': item.invoiceNumber,
        'Date': new Date(item.saleDate).toLocaleDateString(),
        'Customer': item.customerName,
        'Phone': item.customerPhone || '',
        'Code': item.code,
        'Product Name': item.name,
        'Category': item.category || 'N/A',
        'Qty': item.soldQuantity,
        'Sale Amount': item.saleAmount.toFixed(2),
        'Cost Amount': item.costAmount.toFixed(2),
        'Profit': item.profit.toFixed(2),
        'Profit Margin': item.profitMargin.toFixed(2) + '%'
      }));
      
      // Add summary row with overall profit calculation
      data.push({
        'Invoice #': '',
        'Date': '',
        'Customer': '',
        'Phone': '',
        'Code': '',
        'Product Name': '--- SUMMARY ---',
        'Category': '',
        'Qty': '',
        'Sale Amount': '',
        'Cost Amount': '',
        'Profit': '',
        'Profit Margin': ''
      });
      
      data.push({
        'Invoice #': '',
        'Date': '',
        'Customer': '',
        'Phone': '',
        'Code': '',
        'Product Name': 'Total Sales',
        'Category': '',
        'Qty': '',
        'Sale Amount': totalSalesAmount.toFixed(2),
        'Cost Amount': '',
        'Profit': '',
        'Profit Margin': ''
      });
      
      data.push({
        'Invoice #': '',
        'Date': '',
        'Customer': '',
        'Phone': '',
        'Code': '',
        'Product Name': 'Cost of Goods Sold',
        'Category': '',
        'Qty': '',
        'Sale Amount': '',
        'Cost Amount': totalPurchaseAmount.toFixed(2),
        'Profit': '',
        'Profit Margin': ''
      });
      
      data.push({
        'Invoice #': '',
        'Date': '',
        'Customer': '',
        'Phone': '',
        'Code': '',
        'Product Name': 'Total Paid Expenses',
        'Category': '',
        'Qty': '',
        'Sale Amount': '',
        'Cost Amount': totalPaidExpenses.toFixed(2),
        'Profit': '',
        'Profit Margin': ''
      });
      
      data.push({
        'Invoice #': '',
        'Date': '',
        'Customer': '',
        'Phone': '',
        'Code': '',
        'Product Name': 'Total Paid Staff Salaries',
        'Category': '',
        'Qty': '',
        'Sale Amount': '',
        'Cost Amount': totalPaidSalaries.toFixed(2),
        'Profit': '',
        'Profit Margin': ''
      });
      
      data.push({
        'Invoice #': '',
        'Date': '',
        'Customer': '',
        'Phone': '',
        'Code': '',
        'Product Name': 'Net Profit',
        'Category': '',
        'Qty': '',
        'Sale Amount': '',
        'Cost Amount': '',
        'Profit': profit.toFixed(2),
        'Profit Margin': ''
      });
      
      data.push({
        'Invoice #': '',
        'Date': '',
        'Customer': '',
        'Phone': '',
        'Code': '',
        'Product Name': 'Total Unpaid Staff Salaries (Not Deducted)',
        'Category': '',
        'Qty': '',
        'Sale Amount': '',
        'Cost Amount': totalUnpaidSalaries.toFixed(2),
        'Profit': '',
        'Profit Margin': ''
      });
      
      filename = 'profit-report';
      headers = ['Invoice #', 'Date', 'Customer', 'Phone', 'Code', 'Product Name', 'Category', 'Qty', 'Sale Amount', 'Cost Amount', 'Profit', 'Profit Margin'];
    }
    
    // Add date range to filename
    filename += `-${startDate}-to-${endDate}.csv`;
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          // Wrap values with commas in quotes
          typeof row[header] === 'string' && row[header].includes(',') 
            ? `"${row[header]}"` 
            : row[header]
        ).join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print report
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow pop-ups to print reports', 'error');
      return;
    }

    let reportTitle = '';
    let reportContent = '';

    // Generate report title
    if (reportType === 'purchase') {
      reportTitle = 'Purchase Report';
    } else if (reportType === 'stock') {
      reportTitle = 'Stock Report';
    } else if (reportType === 'profit') {
      reportTitle = 'Profit Report';
    }
    
    // Get company information HTML
    const companyInfoHTML = generateCompanyInfoHTML();

    // Generate table HTML
    let tableHTML = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
    
    // Table headers
    tableHTML += '<thead><tr style="background-color: #f3f4f6;">';
    
    if (reportType === 'purchase') {
      tableHTML += '<th>Invoice #</th><th>Supplier</th><th>Date</th><th>Items</th><th>Total Amount</th><th>Discount</th><th>Net Amount</th><th>Status</th>';
      
      // Table body
      tableHTML += '</tr></thead><tbody>';
      filteredPurchases.forEach(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        tableHTML += `<tr>
          <td>${purchase.invoiceNumber}</td>
          <td>${supplier ? supplier.name : 'Unknown'}</td>
          <td>${new Date(purchase.purchaseDate).toLocaleDateString()}</td>
          <td>${purchase.totalItems}</td>
          <td>₨${purchase.totalAmount.toFixed(2)}</td>
            <td>₨${(purchase.discount || 0).toFixed(2)}</td>
            <td>₨${(purchase.netAmount || purchase.totalAmount).toFixed(2)}</td>
          <td>${purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}</td>
        </tr>`;
      });
    } else if (reportType === 'stock') {
      tableHTML += '<th>Code</th><th>Product Name</th><th>Category</th><th>Current Stock</th><th>Unit</th><th>Min Stock Level</th><th>Trade Price</th><th>Sale Price</th><th>Stock Value</th>';
      
      // Table body
      tableHTML += '</tr></thead><tbody>';
      filteredProducts.forEach(product => {
        tableHTML += `<tr>
          <td>${product.code}</td>
          <td>${product.name}</td>
          <td>${product.category || 'N/A'}</td>
          <td>${product.currentStock}</td>
          <td>${product.unit}</td>
          <td>${product.minStockLevel || 'N/A'}</td>
          <td>₨${product.tradePrice.toFixed(2)}</td>
            <td>₨${product.salePrice.toFixed(2)}</td>
            <td>₨${(product.currentStock * product.tradePrice).toFixed(2)}</td>
        </tr>`;
      });
    } else if (reportType === 'profit') {
      tableHTML += '<th>Invoice #</th><th>Date</th><th>Customer</th><th>Phone</th><th>Code</th><th>Product Name</th><th>Category</th><th>Qty</th><th>Sale Amount</th><th>Cost Amount</th><th>Profit</th><th>Profit Margin</th>';
      
      // Table body
      tableHTML += '</tr></thead><tbody>';
      profitData.forEach(item => {
        tableHTML += `<tr>
          <td>${item.invoiceNumber}</td>
          <td>${new Date(item.saleDate).toLocaleDateString()}</td>
          <td>${item.customerName}</td>
          <td>${item.customerPhone || ''}</td>
          <td>${item.code}</td>
          <td>${item.name}</td>
          <td>${item.category || 'N/A'}</td>
          <td>${item.soldQuantity}</td>
          <td>₨${item.saleAmount.toFixed(2)}</td>
          <td>₨${item.costAmount.toFixed(2)}</td>
          <td style="color: ${item.profit >= 0 ? 'green' : 'red'}">₨${item.profit.toFixed(2)}</td>
          <td style="color: ${item.profitMargin >= 0 ? 'green' : 'red'}">${item.profitMargin.toFixed(2)}%</td>
        </tr>`;
      });
      
      // Add summary rows for profit calculation
      tableHTML += `<tr style="background-color: #f3f4f6; font-weight: bold;">
        <td colspan="12">SUMMARY</td>
      </tr>`;
      
      tableHTML += `<tr>
        <td colspan="8"></td>
        <td>Total Sales</td>
        <td>₨${totalSalesAmount.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>`;
      
      tableHTML += `<tr>
        <td colspan="8"></td>
        <td>Cost of Goods Sold</td>
        <td>₨${totalPurchaseAmount.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>`;
      
      tableHTML += `<tr>
        <td colspan="8"></td>
        <td>Total Paid Expenses</td>
        <td>₨${totalPaidExpenses.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>`;
      
      tableHTML += `<tr>
        <td colspan="8"></td>
        <td>Total Paid Staff Salaries</td>
        <td>₨${totalPaidSalaries.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>`;
      
      tableHTML += `<tr>
        <td colspan="8"></td>
        <td>Net Profit</td>
        <td></td>
        <td style="color: ${profit >= 0 ? 'green' : 'red'}">₨${profit.toFixed(2)}</td>
        <td></td>
      </tr>`;
      
      tableHTML += `<tr>
        <td colspan="8"></td>
        <td>Total Unpaid Staff Salaries (Not Deducted)</td>
        <td>₨${totalUnpaidSalaries.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>`;
    }
    
    tableHTML += '</tbody></table>';

    // Summary information
    let summaryHTML = '<div style="margin-bottom: 20px; padding: 10px; background-color: #f9fafb; border-radius: 5px;">';
    summaryHTML += `<p><strong>Date Range:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>`;
    
    if (reportType !== 'stock') {
      summaryHTML += `<p><strong>Total Purchases:</strong> ₨${totalPurchaseAmount.toFixed(2)}</p>`;
  summaryHTML += `<p><strong>Total Sales:</strong> ₨${totalSalesAmount.toFixed(2)}</p>`;
    }
    
    if (reportType === 'stock') {
      summaryHTML += `<p><strong>Total Products:</strong> ${filteredProducts.length}</p>`;
      summaryHTML += `<p><strong>Total Stock Value:</strong> ₨${filteredProducts.reduce((sum, product) => sum + (product.currentStock * product.tradePrice), 0).toFixed(2)}</p>`;
    }
    
    if (reportType === 'profit') {
      summaryHTML += `<p><strong>Total Sales:</strong> ₨${totalSalesAmount.toFixed(2)}</p>`;
      summaryHTML += `<p><strong>Cost of Goods Sold:</strong> ₨${totalPurchaseAmount.toFixed(2)}</p>`;
      summaryHTML += `<p><strong>Total Paid Expenses:</strong> ₨${totalPaidExpenses.toFixed(2)}</p>`;
      summaryHTML += `<p><strong>Total Paid Staff Salaries:</strong> ₨${totalPaidSalaries.toFixed(2)}</p>`;
      summaryHTML += `<p><strong>Net Profit:</strong> <span style="color: ${profit >= 0 ? 'green' : 'red'}">₨${profit.toFixed(2)}</span></p>`;
      summaryHTML += `<p><strong>Total Unpaid Staff Salaries (Not Deducted):</strong> ₨${totalUnpaidSalaries.toFixed(2)}</p>`;
    }
    
    summaryHTML += '</div>';

    // Complete HTML content
    reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #1f2937; }
          .date { text-align: center; margin-bottom: 20px; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f3f4f6; text-align: left; }
          th, td { padding: 8px; border: 1px solid #e5e7eb; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .print-footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print();" style="padding: 8px 16px; background-color: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Report
          </button>
        </div>
        ${companyInfoHTML}
        <h1>${reportTitle}</h1>
        <p class="date">Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
        ${summaryHTML}
        ${tableHTML}
        <div class="print-footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and view business reports</p>
        </div>
        <div className="flex space-x-2">
          <ResetButton section="reports" />
          <Button icon={Printer} className="bg-nihal-blue text-white hover:bg-nihal-blue/90" onClick={printReport}>
            Print Report
          </Button>
          <Button icon={Download} className="bg-nihal-blue text-white hover:bg-nihal-blue/90" onClick={exportToCSV}>
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by invoice number, supplier, or customer..."
            className="w-full px-4 py-2 border border-nihal-yellow rounded-md focus:outline-none focus:ring-2 focus:ring-nihal-yellow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-nihal-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`cursor-pointer ${reportType === 'purchase' ? 'ring-2 ring-nihal-yellow' : ''}`}
              onClick={() => setReportType('purchase')}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-nihal-blue">Purchase Report</h3>
              <FileText className="text-nihal-blue" size={24} />
            </div>
            <p className="text-sm text-gray-600 mt-2">View purchase history and supplier payments</p>
          </div>
        </Card>
        
        <Card className={`cursor-pointer ${reportType === 'stock' ? 'ring-2 ring-nihal-yellow' : ''}`}
              onClick={() => setReportType('stock')}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-nihal-blue">Stock Report</h3>
              <BarChart3 className="text-nihal-blue" size={24} />
            </div>
            <p className="text-sm text-gray-600 mt-2">View current stock levels and inventory value</p>
          </div>
        </Card>
        
        <Card className={`cursor-pointer ${reportType === 'profit' ? 'ring-2 ring-nihal-yellow' : ''}`}
              onClick={() => setReportType('profit')}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-nihal-blue">Profit Report</h3>
              <DollarSign className="text-nihal-blue" size={24} />
            </div>
            <p className="text-sm text-gray-600 mt-2">View profit margins and sales performance</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <h2 className="text-lg font-medium">
              {reportType === 'purchase' && 'Purchase Report'}
              {reportType === 'stock' && 'Stock Report'}
              {reportType === 'profit' && 'Profit Report'}
            </h2>
            
            <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
              <Button 
                size="sm" 
                className={dateRange === 'today' ? 'bg-nihal-yellow text-blue' : 'bg-blue text-nihal-blue border border-nihal-yellow hover:bg-nihal-yellow hover:text-white'}
                onClick={() => handleDateRangeChange('today')}
              >
                Today
              </Button>
              <Button 
                size="sm" 
                className={dateRange === 'week' ? 'bg-nihal-yellow text-blue' : 'bg-blue text-nihal-blue border border-nihal-yellow hover:bg-nihal-yellow hover:text-white'}
                onClick={() => handleDateRangeChange('week')}
              >
                Last 7 Days
              </Button>
              <Button 
                size="sm" 
                className={dateRange === 'month' ? 'bg-nihal-yellow text-white' : 'bg-white text-nihal-blue border border-nihal-yellow hover:bg-nihal-yellow hover:text-white'}
                onClick={() => handleDateRangeChange('month')}
              >
                Last 30 Days
              </Button>
              <Button 
                size="sm" 
                className={dateRange === 'custom' ? 'bg-nihal-yellow text-blue' : 'bg-blue text-nihal-blue border border-nihal-yellow hover:bg-nihal-yellow hover:text-white'}
                onClick={() => handleDateRangeChange('custom')}
              >
                Custom
              </Button>
            </div>
          </div>
          
          {dateRange === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading data...</span>
          </div>
        ) : (
          <>
            <div className="p-4 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Date Range</p>
                  <p className="font-medium">
                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
                
                {reportType !== 'stock' && (
                  <>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Total Purchases</p>
                      <p className="font-medium">₨{totalPurchaseAmount.toFixed(2)}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="font-medium">₨{totalSalesAmount.toFixed(2)}</p>
                    </div>
                  </>
                )}
                
                {reportType === 'stock' && (
                  <>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Total Products</p>
                      <p className="font-medium">{filteredProducts.length}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Total Stock Value</p>
                      <p className="font-medium">
                        ₨{filteredProducts.reduce((sum, product) => sum + (product.currentStock * product.tradePrice), 0).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
                
                {reportType === 'profit' && (
                  <>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Total Sales</p>
                      <p className="font-medium">₨{totalSalesAmount.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Cost of Goods Sold</p>
                      <p className="font-medium">₨{totalPurchaseAmount.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Total Paid Expenses</p>
                      <p className="font-medium">₨{totalPaidExpenses.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Total Paid Staff Salaries</p>
                      <p className="font-medium">₨{totalPaidSalaries.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Net Profit</p>
                      <p className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₨{profit.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Unpaid Staff Salaries (Not Deducted)</p>
                      <p className="font-medium">₨{totalUnpaidSalaries.toFixed(2)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {reportType === 'purchase' && (
              <Table columns={purchaseColumns} data={filteredPurchases} />
            )}
            
            {reportType === 'stock' && (
              <Table columns={stockColumns} data={filteredProducts} />
            )}
            
            {reportType === 'profit' && (
              <Table columns={profitColumns} data={profitData} />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;