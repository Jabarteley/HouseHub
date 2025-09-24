// src/pages/property-details/components/MortgageCalculator.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const MortgageCalculator = ({ propertyPrice }) => {
  const [loanAmount, setLoanAmount] = useState(propertyPrice * 0.8); // 20% down
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.2);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(propertyPrice * 0.01 / 12); // 1% annually
  const [insurance, setInsurance] = useState(propertyPrice * 0.005 / 12); // 0.5% annually
  const [pmi, setPmi] = useState(0);
  const [hoaFees, setHoaFees] = useState(0);

  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

  useEffect(() => {
    // Update loan amount when down payment changes
    setLoanAmount(propertyPrice - downPayment);
  }, [downPayment, propertyPrice]);

  useEffect(() => {
    // Update down payment when loan amount changes
    setDownPayment(propertyPrice - loanAmount);
  }, [loanAmount, propertyPrice]);

  useEffect(() => {
    // Calculate PMI if down payment is less than 20%
    const downPaymentPercentage = (downPayment / propertyPrice) * 100;
    if (downPaymentPercentage < 20) {
      setPmi((loanAmount * 0.005) / 12); // 0.5% of loan amount annually
    } else {
      setPmi(0);
    }
  }, [downPayment, loanAmount, propertyPrice]);

  useEffect(() => {
    calculatePayment();
  }, [loanAmount, interestRate, loanTerm, propertyTax, insurance, pmi, hoaFees]);

  const calculatePayment = () => {
    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) {
      setMonthlyPayment(0);
      setTotalMonthlyPayment(0);
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const principal = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    setMonthlyPayment(principal);
    setTotalMonthlyPayment(principal + propertyTax + insurance + pmi + hoaFees);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US')?.format(num);
  };

  const handleDownPaymentPercentageChange = (percentage) => {
    const newDownPayment = (propertyPrice * percentage) / 100;
    setDownPayment(newDownPayment);
  };

  const downPaymentPercentage = ((downPayment / propertyPrice) * 100)?.toFixed(1);

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Calculator" size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">Mortgage Calculator</h2>
      </div>
      <div className="space-y-6">
        {/* Property Price */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Property Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
            <input
              type="text"
              value={formatNumber(propertyPrice)}
              readOnly
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md bg-secondary-100 text-text-secondary cursor-not-allowed"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Down Payment ({downPaymentPercentage}%)
          </label>
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e?.target?.value))}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            />
          </div>
          <div className="flex space-x-2">
            {[10, 15, 20, 25]?.map((percentage) => (
              <button
                key={percentage}
                onClick={() => handleDownPaymentPercentageChange(percentage)}
                className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                  Math.abs(Number(downPaymentPercentage) - percentage) < 0.1
                    ? 'bg-primary text-white' :'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Loan Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e?.target?.value))}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Interest Rate
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e?.target?.value))}
              className="w-full pr-8 pl-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">%</span>
          </div>
        </div>

        {/* Loan Term */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Loan Term
          </label>
          <div className="flex space-x-2 mb-2">
            {[15, 20, 25, 30]?.map((term) => (
              <button
                key={term}
                onClick={() => setLoanTerm(term)}
                className={`flex-1 py-2 text-sm rounded-md transition-all duration-200 ${
                  loanTerm === term
                    ? 'bg-primary text-white' :'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
                }`}
              >
                {term} years
              </button>
            ))}
          </div>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e?.target?.value))}
            className="w-full px-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            placeholder="Custom term (years)"
          />
        </div>

        {/* Additional Costs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Additional Monthly Costs</h3>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Property Tax (monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
              <input
                type="number"
                value={propertyTax}
                onChange={(e) => setPropertyTax(Number(e?.target?.value))}
                className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Home Insurance (monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
              <input
                type="number"
                value={insurance}
                onChange={(e) => setInsurance(Number(e?.target?.value))}
                className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 text-sm"
              />
            </div>
          </div>
          
          {pmi > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                PMI (monthly)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  value={pmi}
                  onChange={(e) => setPmi(Number(e?.target?.value))}
                  className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 text-sm"
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Required for down payments less than 20%
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              HOA Fees (monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
              <input
                type="number"
                value={hoaFees}
                onChange={(e) => setHoaFees(Number(e?.target?.value))}
                className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly Payment Breakdown</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Principal & Interest:</span>
              <span className="font-medium text-text-primary">{formatCurrency(monthlyPayment)}</span>
            </div>
            
            {propertyTax > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Property Tax:</span>
                <span className="font-medium text-text-primary">{formatCurrency(propertyTax)}</span>
              </div>
            )}
            
            {insurance > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Home Insurance:</span>
                <span className="font-medium text-text-primary">{formatCurrency(insurance)}</span>
              </div>
            )}
            
            {pmi > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">PMI:</span>
                <span className="font-medium text-text-primary">{formatCurrency(pmi)}</span>
              </div>
            )}
            
            {hoaFees > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">HOA Fees:</span>
                <span className="font-medium text-text-primary">{formatCurrency(hoaFees)}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-3 mt-3 border-t border-border">
            <span className="font-semibold text-text-primary">Total Monthly Payment:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(totalMonthlyPayment)}</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-text-secondary bg-secondary-100 p-3 rounded-md">
          <Icon name="Info" size={14} className="inline mr-1" />
          This calculator provides estimates only. Actual payments may vary based on lender terms, fees, and other factors.
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;