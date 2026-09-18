import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { WeeklyReportContent } from './WeeklyReportContent';

interface WeeklyReportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  childId?: string;
}

export const WeeklyReportExportModal: React.FC<WeeklyReportExportModalProps> = ({
  open,
  onOpenChange,
  studentName,
  childId,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-3xl border-slate-200 dark:border-slate-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Weekly Progress & Performance Report</DialogTitle>
          <DialogDescription>Download or print your personalized Cambridge learning report</DialogDescription>
        </DialogHeader>

        <WeeklyReportContent 
          childId={childId}
          studentName={studentName}
          onPrint={handlePrint}
        />
      </DialogContent>
    </Dialog>
  );
};
