import React, { useState, useEffect } from 'react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { Settings, Store, Printer, Database } from 'lucide-react';
import { FirebaseService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  cell: string;
  email: string;
  website: string;
  ntn: string;
  strn: string;
  logo: string | null;
}

interface PrintSettings {
  showLogo: boolean;
  showTaxId: boolean; // Now controls display of NTN, STRN, Phone, and Cell
  showSignature: boolean;
  footerText: string;
  paperSize: 'a4' | 'letter' | 'thermal';
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('company'); // Default to company tab
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'My Inventory System',
    address: '123 Business Street, City',
    phone: '+1 234 567 890',
    cell: '+1 987 654 321',
    email: 'contact@myinventory.com',
    website: 'www.myinventory.com',
    ntn: 'NTN-12345',
    strn: 'STRN-67890',
    logo: null
  });
  
  // Load settings from Firebase and localStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      // First try to load from localStorage for immediate display
      try {
        const localCompanyInfo = localStorage.getItem('companyInfo');
        if (localCompanyInfo) {
          setCompanyInfo(JSON.parse(localCompanyInfo));
        }
        
        const localPrintSettings = localStorage.getItem('printSettings');
        if (localPrintSettings) {
          setPrintSettings(JSON.parse(localPrintSettings));
        }
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
      
      // Then try to load from Firebase if user is logged in
      if (!user) return;
      
      try {
        // Load company info
        const storedCompanyInfo = await FirebaseService.getSettings('companyInfo', user.id);
        if (storedCompanyInfo) {
          setCompanyInfo(storedCompanyInfo);
          // Update localStorage with Firebase data
          localStorage.setItem('companyInfo', JSON.stringify(storedCompanyInfo));
        }
        
        // Load print settings
        const storedPrintSettings = await FirebaseService.getSettings('printSettings', user.id);
        if (storedPrintSettings) {
          setPrintSettings(storedPrintSettings);
          // Update localStorage with Firebase data
          localStorage.setItem('printSettings', JSON.stringify(storedPrintSettings));
        }
      } catch (error) {
        console.error('Error loading settings from Firebase:', error);
        showToast('Error loading settings. Please try again.', 'error');
      }
    };
    
    loadSettings();
  }, [user]);
  
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    showLogo: true,
    showTaxId: true,
    showSignature: true,
    footerText: 'Thank you for your business!',
    paperSize: 'a4'
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Handle company info changes
  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle print settings changes
  const handlePrintSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setPrintSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCompanyInfo(prev => ({
            ...prev,
            logo: event.target.result as string
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Save settings to Firebase and localStorage
  const saveSettings = async () => {
    if (!user) {
      showToast('You must be logged in to save settings', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save company info to Firebase
      await FirebaseService.saveSettings('companyInfo', companyInfo, user.id);
      
      // Save print settings to Firebase
      await FirebaseService.saveSettings('printSettings', printSettings, user.id);
      
      // Save to localStorage for immediate use in the application
      localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
      localStorage.setItem('printSettings', JSON.stringify(printSettings));
      
      setIsSubmitting(false);
      showToast('Settings saved successfully to your account!', 'success');
    } catch (error) {
      console.error('Error saving settings to Firebase:', error);
      setIsSubmitting(false);
      showToast('Error saving settings. Please try again.', 'error');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your application settings</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center px-4 py-3 text-left ${activeTab === 'company' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('company')}
              >
                <Store className="mr-3 h-5 w-5" />
                Company Information
              </button>
              
              <button
                className={`w-full flex items-center px-4 py-3 text-left ${activeTab === 'printing' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('printing')}
              >
                <Printer className="mr-3 h-5 w-5" />
                Printing Settings
              </button>
              
              <button
                className={`w-full flex items-center px-4 py-3 text-left ${activeTab === 'database' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('database')}
              >
                <Database className="mr-3 h-5 w-5" />
                Database Backup
              </button>
            </nav>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card>
            {activeTab === 'company' && (
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Company Information</h2>
                <p className="text-gray-600 mb-6">This information will be displayed on your invoices and reports.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={companyInfo.name}
                      onChange={handleCompanyInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={companyInfo.address}
                      onChange={handleCompanyInfoChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={companyInfo.phone}
                        onChange={handleCompanyInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={companyInfo.email}
                        onChange={handleCompanyInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="text"
                        name="website"
                        value={companyInfo.website}
                        onChange={handleCompanyInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cell
                      </label>
                      <input
                        type="text"
                        name="cell"
                        value={companyInfo.cell}
                        onChange={handleCompanyInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NTN Number
                      </label>
                      <input
                        type="text"
                        name="ntn"
                        value={companyInfo.ntn}
                        onChange={handleCompanyInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        STRN Number
                      </label>
                      <input
                        type="text"
                        name="strn"
                        value={companyInfo.strn}
                        onChange={handleCompanyInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                        {companyInfo.logo ? (
                          <img src={companyInfo.logo} alt="Company Logo" className="max-w-full max-h-full" />
                        ) : (
                          <Store className="text-gray-400" size={32} />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Upload Logo
                        </label>
                        {companyInfo.logo && (
                          <button
                            type="button"
                            onClick={() => setCompanyInfo(prev => ({ ...prev, logo: null }))}
                            className="ml-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'printing' && (
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Printing Settings</h2>
                <p className="text-gray-600 mb-6">Configure how your invoices and reports will be printed.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Paper Size
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="paperSize"
                          value="a4"
                          checked={printSettings.paperSize === 'a4'}
                          onChange={handlePrintSettingsChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2">A4</span>
                      </label>
                      
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="paperSize"
                          value="letter"
                          checked={printSettings.paperSize === 'letter'}
                          onChange={handlePrintSettingsChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2">Letter</span>
                      </label>
                      
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="paperSize"
                          value="thermal"
                          checked={printSettings.paperSize === 'thermal'}
                          onChange={handlePrintSettingsChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2">Thermal (80mm)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Elements
                    </label>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="showLogo"
                        checked={printSettings.showLogo}
                        onChange={handlePrintSettingsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Show company logo</span>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="showTaxId"
                        checked={printSettings.showTaxId}
                        onChange={handlePrintSettingsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Show NTN, STRN, Phone and Cell</span>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="showSignature"
                        checked={printSettings.showSignature}
                        onChange={handlePrintSettingsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Show signature line</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Footer Text
                    </label>
                    <textarea
                      name="footerText"
                      value={printSettings.footerText}
                      onChange={handlePrintSettingsChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'database' && (
              <div className="p-6">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Database Backup</h2>
                <p className="text-gray-600 mb-6">Backup and restore your database.</p>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-blue-800 mb-2">Backup Database</h3>
                    <p className="text-sm text-blue-700 mb-4">Create a backup of your current database. This will download a JSON file containing all your data.</p>
                    <Button>
                      Download Backup
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-yellow-800 mb-2">Restore Database</h3>
                    <p className="text-sm text-yellow-700 mb-4">Restore your database from a backup file. This will replace all your current data.</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        id="restore-upload"
                      />
                      <label htmlFor="restore-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Select Backup File
                      </label>
                      <Button variant="warning">
                        Restore
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            

            
            {/* Save button for all tabs */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <Button 
                onClick={saveSettings} 
                disabled={isSubmitting}
                icon={isSubmitting ? undefined : Settings}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Saving...
                  </>
                ) : 'Save Settings'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;