import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';

interface GenerateReportButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    className?: string;
}

export const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
    onClick,
    isLoading = false,
    className
}) => {
    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            className={className}
            variant="outline"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Full Report
        </Button>
    );
};
