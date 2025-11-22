import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CompleteTriageReport } from '@/lib/api/types';
import { AlertTriangle, MapPin, Calendar, FileText, Download, Share2, Printer, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CompleteTriageReportCardProps {
    report: CompleteTriageReport | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CompleteTriageReportCard({ report, open, onOpenChange }: CompleteTriageReportCardProps) {
    if (!report) return null;

    const handleDownload = () => {
        toast.success("Downloading PDF report...");
        // Mock download action
        setTimeout(() => {
            window.open(report.pdf_export.download_url, '_blank');
        }, 1000);
    };

    const handlePrint = () => {
        window.print();
    };

    const getSeverityColor = (level: string) => {
        switch (level) {
            case 'emergency': return 'bg-red-500 hover:bg-red-600';
            case 'urgent': return 'bg-orange-500 hover:bg-orange-600';
            case 'routine': return 'bg-blue-500 hover:bg-blue-600';
            case 'self_care': return 'bg-green-500 hover:bg-green-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-3 sm:px-6 py-3 sm:py-4 border-b bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-lg sm:text-2xl font-bold flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="truncate">Medical Triage Report</span>
                                <Badge className={getSeverityColor(report.triage_level)}>
                                    {report.triage_level.toUpperCase()}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-xs sm:text-sm truncate">
                                ID: {report.metadata.report_id} • {new Date(report.metadata.generated_at).toLocaleString()}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button variant="outline" size="icon" onClick={handlePrint} title="Print" className="h-8 w-8 sm:h-10 sm:w-10">
                                <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="outline" size="icon" title="Share" className="h-8 w-8 sm:h-10 sm:w-10">
                                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button onClick={handleDownload} title="Download PDF" className="h-8 sm:h-10 text-xs sm:text-sm">
                                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">PDF</span>
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Summary Section */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Symptom Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4">{report.symptom_summary}</p>
                                    {report.red_flags.length > 0 && (
                                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
                                            <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Red Flags Detected
                                            </h4>
                                            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-1">
                                                {report.red_flags.map((flag, idx) => (
                                                    <li key={idx}>{flag}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Suspected Conditions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="w-full">
                                        <div className="flex flex-wrap gap-2 pb-2">
                                            {report.suspected_conditions.map((condition, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-muted-foreground/20 whitespace-nowrap">
                                                    <span className="font-medium text-sm">{condition.name}</span>
                                                    <Badge variant="outline" className={`text-xs ${
                                                        condition.confidence === 'high' ? 'border-green-500 text-green-500' :
                                                        condition.confidence === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                                        'border-gray-500 text-gray-500'
                                                    }`}>
                                                        {condition.confidence}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Action Plan & Timeline */}
                        <section>
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="text-base sm:text-xl">Recommended Action Plan</span>
                            </h3>
                            <ScrollArea className="w-full">
                                <div className="flex gap-3 sm:gap-4 pb-4 lg:grid lg:grid-cols-4">
                                    <Card className="bg-red-50 dark:bg-red-950/10 border-red-100 dark:border-red-900/50 min-w-[240px] lg:min-w-0 flex-shrink-0">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-bold text-red-600 dark:text-red-400 uppercase">Immediate</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-medium">{report.follow_up.timeline.immediate}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="min-w-[240px] lg:min-w-0 flex-shrink-0">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Within Hours</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{report.follow_up.timeline.within_hours}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="min-w-[240px] lg:min-w-0 flex-shrink-0">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Next Few Days</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{report.follow_up.timeline.within_days}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="min-w-[240px] lg:min-w-0 flex-shrink-0">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Follow Up</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{report.follow_up.timeline.follow_up}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </ScrollArea>
                        </section>

                        {/* Location & Facilities */}
                        <section>
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="text-base sm:text-xl">Nearby Medical Facilities</span>
                            </h3>
                            {report.nearby_facilities.length > 0 ? (
                                <div className="relative">
                                    <ScrollArea className="w-full">
                                        <div className="flex gap-3 sm:gap-4 pb-4 lg:grid lg:grid-cols-2">
                                            {report.nearby_facilities.map((facility, idx) => (
                                                <Card key={idx} className="hover:shadow-md transition-shadow min-w-[280px] lg:min-w-0 flex-shrink-0">
                                                    <CardContent className="p-3 sm:p-4">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                                            <h4 className="font-bold text-base sm:text-lg">{facility.name}</h4>
                                                            <Badge variant="secondary" className="w-fit">{facility.distance_km} km</Badge>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{facility.address}</p>
                                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                                                            {facility.capabilities.map((cap, i) => (
                                                                <Badge key={i} variant="outline" className="text-xs">{cap}</Badge>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                            <Button size="sm" className="w-full text-xs sm:text-sm" variant="default">Get Directions</Button>
                                                            <Button size="sm" className="w-full text-xs sm:text-sm" variant="outline">Call {facility.phone}</Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No nearby facilities found</p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>

                        {/* Follow-up Checklist */}
                        <section>
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Patient Checklist</h3>
                            <Card>
                                <CardContent className="p-3 sm:p-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        {report.follow_up.checklist.map((item, idx) => (
                                            <div key={idx} className="flex items-start space-x-2">
                                                <Checkbox id={`check-${idx}`} className="mt-0.5" />
                                                <label
                                                    htmlFor={`check-${idx}`}
                                                    className="text-xs sm:text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {item}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-3 sm:px-6 py-3 sm:py-4 border-t bg-muted/30">
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center w-full leading-relaxed">
                        Disclaimer: This report is generated by AI and does not replace professional medical advice. In case of emergency, call 115 immediately.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
