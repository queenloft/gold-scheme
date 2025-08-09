import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';

const BillEntry = ({ db }) => {
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState('');
  const [labour, setLabour] = useState('');
  const [cgst, setCgst] = useState('');
  const [sgst, setSgst] = useState('');
  const [total, setTotal] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = parseFloat(total) || 0;
    const bill = {
      customerName,
      description,
      quantity: parseFloat(quantity) || 0,
      rate: parseFloat(rate) || 0,
      labour: parseFloat(labour) || 0,
      cgst: parseFloat(cgst) || 0,
      sgst: parseFloat(sgst) || 0,
      totalAmount,
      date: new Date().toISOString().slice(0, 10),
    };
    await addDoc(collection(db, 'bills'), bill);
    window.print();
    setCustomerName('');
    setDescription('');
    setQuantity(1);
    setRate('');
    setLabour('');
    setCgst('');
    setSgst('');
    setTotal('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 print:block">
      <h2 className="text-3xl font-bold text-indigo-800 mb-6">Bill Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Labour"
            value={labour}
            onChange={(e) => setLabour(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="CGST"
            value={cgst}
            onChange={(e) => setCgst(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="SGST"
            value={sgst}
            onChange={(e) => setSgst(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Total Amount"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Save & Print
        </button>
      </form>
    </div>
  );
};

export default BillEntry;
