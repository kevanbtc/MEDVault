import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MoneyTab from './components/MoneyTab/MoneyTab';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('money');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">MEDVault</h1>
                <span className="ml-2 text-sm text-gray-500">Medical Cost Transparency Platform</span>
              </div>
              <nav className="flex space-x-8">
                <Link
                  to="/money"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'money'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('money')}
                >
                  Money
                </Link>
                <Link
                  to="/plans"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'plans'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('plans')}
                >
                  Plans
                </Link>
                <Link
                  to="/records"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'records'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('records')}
                >
                  Records
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<MoneyTab />} />
            <Route path="/money" element={<MoneyTab />} />
            <Route path="/plans" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-500">Plans tab coming soon</h2></div>} />
            <Route path="/records" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-500">Records tab coming soon</h2></div>} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              © 2024 MEDVault. All rights reserved. | 
              <span className="ml-1">
                Backed by primary sources and evidence-based healthcare cost transparency.
              </span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;