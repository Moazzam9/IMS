import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Battery } from 'lucide-react';

interface OldBatteryFormProps {
  onOldBatteryChange: (oldBatteryData: {
    name: string;
    weight: number | null;
    ratePerKg: number | null;
    deductionAmount: number;
  } | null) => void;
  enabled: boolean;
  initialData?: {
    name: string;
    weight: number | null;
    ratePerKg: number | null;
    deductionAmount: number;
  };
}

const OldBatteryForm: React.FC<OldBatteryFormProps> = ({
  onOldBatteryChange,
  enabled,
  initialData,
}) => {
  const [includeOldBattery, setIncludeOldBattery] = useState(!!initialData);
  const [oldBatteryData, setOldBatteryData] = useState(
    initialData || {
      name: '',
      weight: null,
      ratePerKg: null,
      deductionAmount: 0,
    }
  );

  // Calculate deduction amount whenever weight or rate changes
  useEffect(() => {
    const weight = oldBatteryData.weight || 0;
    const ratePerKg = oldBatteryData.ratePerKg || 0;
    const deductionAmount = weight * ratePerKg;

    setOldBatteryData((prev) => ({
      ...prev,
      deductionAmount,
    }));
  }, [oldBatteryData.weight, oldBatteryData.ratePerKg]);

  // Notify parent component when includeOldBattery changes
  useEffect(() => {
    if (includeOldBattery) {
      onOldBatteryChange(oldBatteryData);
    } else {
      onOldBatteryChange(null);
      setOldBatteryData({
        name: '',
        weight: null,
        ratePerKg: null,
        deductionAmount: 0,
      });
    }
  }, [includeOldBattery, onOldBatteryChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      const newData = { ...oldBatteryData, [name]: value };
      setOldBatteryData(newData);
      if (includeOldBattery) {
        onOldBatteryChange(newData);
      }
      return;
    }

    // Handle numeric fields (weight and ratePerKg)
    const numericValue = value === '' ? null : Number(value);
    if (!isNaN(numericValue as number) || numericValue === null) {
      const newData = { ...oldBatteryData, [name]: numericValue };
      setOldBatteryData(newData);
      if (includeOldBattery) {
        onOldBatteryChange(newData);
      }
    }
  };


  return (
    <div className="mt-4">
      <div className="flex items-center mb-3">
        <input
          type="checkbox"
          id="includeOldBattery"
          checked={includeOldBattery}
          onChange={(e) => setIncludeOldBattery(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="includeOldBattery"
          className="ml-2 text-sm font-medium text-gray-700 flex items-center"
        >
          <Battery size={16} className="mr-1 text-blue-600" />
          Include Old Battery
        </label>
      </div>

      {includeOldBattery && (
        <form className="p-4 bg-blue-50 rounded-md border border-blue-200 w-full md:w-[400px]" onSubmit={(e) => e.preventDefault()}>
          <h4 className="text-sm font-medium text-blue-800 mb-3">
            Old Battery Details
          </h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name/Reference
            </label>
            <input
              type="text"
              name="name"
              value={oldBatteryData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Customer's old battery"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={oldBatteryData.weight ?? ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              placeholder="Enter weight"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate per Kg
            </label>
            <input
              type="text"
              value={oldBatteryData.ratePerKg ?? ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                const numericValue = value === '' ? null : parseFloat(value);
                if (!isNaN(numericValue as number) || value === '') {
                  const newData = { ...oldBatteryData, ratePerKg: numericValue };
                  setOldBatteryData(newData);
                  if (includeOldBattery) {
                    onOldBatteryChange(newData);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter rate per kg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deduction Amount
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-700">
              ₨{oldBatteryData.deductionAmount.toFixed(2)}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default OldBatteryForm;