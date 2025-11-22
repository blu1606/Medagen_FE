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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                Medical Triage Report
                                <Badge className={getSeverityColor(report.triage_level)}>
                                    {report.triage_level.toUpperCase()}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                ID: {report.metadata.report_id} • {new Date(report.metadata.generated_at).toLocaleString()}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={handlePrint} title="Print">
                                <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" title="Share">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button onClick={handleDownload} title="Download PDF">
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="space-y-8">
                        {/* Summary Section */}
                        <section className="grid md:grid-cols-2 gap-6">
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
                                    <ul className="space-y-3">
                                        {report.suspected_conditions.map((condition, idx) => (
                                            <li key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                                <span className="font-medium">{condition.name}</span>
                                                <Badge variant="outline" className={
                                                    condition.confidence === 'high' ? 'border-green-500 text-green-500' :
                                                        condition.confidence === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                                            'border-gray-500 text-gray-500'
                                                }>
                                                    {condition.confidence} confidence
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Action Plan & Timeline */}
                        <section>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Recommended Action Plan
                            </h3>
                            <div className="grid md:grid-cols-4 gap-4">
                                <Card className="bg-red-50 dark:bg-red-950/10 border-red-100 dark:border-red-900/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-red-600 dark:text-red-400 uppercase">Immediate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm font-medium">{report.follow_up.timeline.immediate}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Within Hours</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">{report.follow_up.timeline.within_hours}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Next Few Days</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">{report.follow_up.timeline.within_days}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Follow Up</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">{report.follow_up.timeline.follow_up}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Location & Facilities */}
                        <section>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Nearby Medical Facilities
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {report.nearby_facilities.map((facility, idx) => (
                                    <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg">{facility.name}</h4>
                                                <Badge variant="secondary">{facility.distance_km} km</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{facility.address}</p>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {facility.capabilities.map((cap, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">{cap}</Badge>
                                                ))}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" className="w-full" variant="default">Get Directions</Button>
                                                <Button size="sm" className="w-full" variant="outline">Call {facility.phone}</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Follow-up Checklist */}
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Patient Checklist</h3>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {report.follow_up.checklist.map((item, idx) => (
                                            <div key={idx} className="flex items-center space-x-2">
                                                <Checkbox id={`check-${idx}`} />
                                                <label
                                                    htmlFor={`check-${idx}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

                <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center w-full">
                        Disclaimer: This report is generated by AI and does not replace professional medical advice. In case of emergency, call 115 immediately.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
