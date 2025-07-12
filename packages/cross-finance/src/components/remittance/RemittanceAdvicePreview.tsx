
import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RemittanceFormData } from './RemittanceAdviceForm';
import { FileDown, Mail, Save } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface RemittanceAdvicePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RemittanceFormData;
  transaction: any;
}

export function RemittanceAdvicePreview({ 
  open, 
  onOpenChange, 
  formData,
  transaction 
}: RemittanceAdvicePreviewProps) {
  const { toast } = useToast();
  const remittanceRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [emailSheetOpen, setEmailSheetOpen] = useState(false);
  const [email, setEmail] = useState("");

  // Get delivery method name 
  const getDeliveryMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      'swift': 'SWIFT',
      'sepa': 'SEPA',
      'ach': 'ACH',
      'wire': 'Wire Transfer',
      'local': 'Local Transfer'
    };
    return methods[methodId] || methodId;
  };

  const handleDownload = async () => {
    if (!remittanceRef.current) return;
    
    setLoading(true);
    
    try {
      const canvas = await html2canvas(remittanceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Add a subtle watermark
      pdf.setTextColor(220, 220, 220);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(30);
      pdf.text('Oneremit Internal', 50, 140, { 
        align: 'center',
        angle: 45
      });
      
      pdf.save(`remittance-advice-${transaction.id}.pdf`);
      
      // Save to history
      const historyItem = {
        id: Date.now(),
        transactionId: transaction.id,
        beneficiary: formData.beneficiaryName,
        date: new Date().toISOString(),
        amount: formData.amount,
        currency: formData.currency
      };
      
      // Get existing history
      const existingHistory = localStorage.getItem('remittanceHistory');
      let history = existingHistory ? JSON.parse(existingHistory) : [];
      history = [historyItem, ...history].slice(0, 50); // Keep last 50 items
      localStorage.setItem('remittanceHistory', JSON.stringify(history));
      
      toast({
        title: "PDF Generated",
        description: "Remittance advice has been downloaded and saved to history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
      console.error("PDF generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would call an API to send the email
    setTimeout(() => {
      setEmailSheetOpen(false);
      toast({
        title: "Email Sent",
        description: `Remittance advice has been sent to ${email}.`,
      });
    }, 1000);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Remittance Advice Preview</DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-md p-4 bg-white">
            <div ref={remittanceRef} className="p-8 bg-white font-sans">
              {/* Company Header */}
              <div className="flex justify-between items-start mb-8 border-b pb-6">
                <div>
                  <h1 className="text-2xl font-bold text-primary">Oneremit Limited</h1>
                  <p className="text-gray-500 text-sm mt-1">International Payment Solutions</p>
                  <p className="text-gray-500 text-sm">123 Finance Street, London, UK</p>
                  <p className="text-gray-500 text-sm">payments@oneremit.co</p>
                </div>
                <div className="text-right">
                  <h2 className="font-bold text-xl">Remittance Advice</h2>
                  <p className="text-sm text-gray-600 mt-1">Transaction ID: {transaction.id}</p>
                  <p className="text-sm text-gray-600">Date: {formatDate(formData.transferDate)}</p>
                </div>
              </div>
              
              {/* Reference Numbers */}
              <div className="mb-6 bg-slate-50 p-3 rounded border border-slate-100">
                <h3 className="font-bold text-sm mb-2 text-gray-500">REFERENCE NUMBERS</h3>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Transaction ID:</p>
                    <p className="font-mono font-semibold">{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">IMAD:</p>
                    <p className="font-mono font-semibold">{formData.imadNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">UETR:</p>
                    <p className="font-mono font-semibold">{formData.uetrNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3 text-gray-800">Payment Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-gray-600 text-sm">Amount:</p>
                    <p className="font-semibold">{formatCurrency(formData.amount, formData.currency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Transfer Date:</p>
                    <p>{formatDate(formData.transferDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Payment Method:</p>
                    <p>{getDeliveryMethodName(formData.deliveryMethod)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Reference:</p>
                    <p>{formData.reference || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Sender & Beneficiary */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                  <h3 className="font-bold mb-2 text-gray-800">Sender</h3>
                  <p>{formData.sender}</p>
                  <p className="text-sm text-gray-600 mt-2">Account: {formData.senderAccountNumber}</p>
                  <p className="text-sm text-gray-600">123 Finance Street</p>
                  <p className="text-sm text-gray-600">London, UK</p>
                </div>
                
                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                  <h3 className="font-bold mb-2 text-gray-800">Beneficiary</h3>
                  <p>{formData.beneficiaryName}</p>
                  <p className="text-sm text-gray-600 mt-2">{formData.bankName}</p>
                  <p className="text-sm text-gray-600">Account: {formData.accountNumber}</p>
                  <p className="text-sm text-gray-600">SWIFT/BIC: {formData.swiftCode}</p>
                </div>
              </div>

              {/* Notes Section */}
              {formData.notes && (
                <div className="mt-6 mb-6 border-t pt-4">
                  <h3 className="font-bold text-sm mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}
              
              {/* Disclaimer */}
              <div className="mt-10 pt-6 border-t text-xs text-gray-500">
                <p>This is a system-generated remittance advice from Oneremit Terminal. For questions, contact payments@oneremit.co.</p>
                <p className="mt-2 text-center text-gray-400">Generated from the Oneremit Terminal</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setEmailSheetOpen(true)}
                disabled={loading}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button 
                onClick={handleDownload}
                disabled={loading}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Sheet */}
      <Sheet open={emailSheetOpen} onOpenChange={setEmailSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Send Remittance Advice</SheetTitle>
            <SheetDescription>
              Enter the email address to send this remittance advice to.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input 
                id="email" 
                type="email" 
                className="w-full p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <Button onClick={handleSendEmail} className="w-full mt-4">
              Send Email
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
