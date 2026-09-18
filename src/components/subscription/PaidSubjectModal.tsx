import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaidSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName?: string;
  syllabusCode?: string;
}

export const PaidSubjectModal: React.FC<PaidSubjectModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      onOpenChange(false);
      navigate('/billing');
    }
  }, [open, onOpenChange, navigate]);

  return null;
};
