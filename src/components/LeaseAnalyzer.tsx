import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Loader2,
  Download,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Brain,
  BarChart3,
  FileSearch
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import jsPDF from "jspdf";

interface AnalysisResult {
  id: string;
  fileName: string;
  location: string;
  analysisDate: string;
  overallScore: number;
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    suggestion: string;
    legalBasis?: string;
    clauseReference?: string;
  }>;
  recommendations: string[];
  locationSpecificAdvice?: string[];
  documentAuthenticity?: {
    isLegitimate: boolean;
    concerns: string[];
    confidence: number;
  };
  riskAssessment?: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
  verificationNotes?: string[];
  aiPowered?: boolean;
  analysisVersion?: string;
}

interface LeaseAnalyzerProps {
  user: any;
  accessToken: string;
}

export function LeaseAnalyzer({ user, accessToken }: LeaseAnalyzerProps) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Results
  const [loading, setLoading] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    leaseText: '',
    fileName: '',
    location: ''
  });

  // Analysis results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, fileName: file.name }));
      
      // For demo purposes, we'll simulate reading the file
      // In a real app, you'd use FileReader or upload to storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ 
          ...prev, 
          leaseText: "Sample lease agreement text extracted from uploaded file. This would contain the actual lease content in a real implementation." 
        }));
      };
      reader.readAsText(file);
    }
  };

  const downloadReport = async (analysis: AnalysisResult) => {
    setDownloadingReport(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.5);
    };

    // Helper function to check if we need a new page
    const checkNewPage = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Header
    doc.setFillColor(3, 2, 19); // Primary color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Lease Analysis Report', margin, 25);
    
    if (analysis.aiPowered) {
      doc.setFontSize(12);
      doc.text('AI-Powered Analysis with Gemini', margin, 35);
    }

    yPosition = 60;

    // Document Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Document Information', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`File Name: ${analysis.fileName}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Analysis Date: ${new Date(analysis.analysisDate).toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;
    if (analysis.location) {
      doc.text(`Location: ${analysis.location}`, margin, yPosition);
      yPosition += 10;
    }

    yPosition += 10;

    // Overall Score
    checkNewPage(40);
    doc.setFontSize(16);
    doc.text('Overall Assessment', margin, yPosition);
    yPosition += 15;

    // Score visualization
    const scoreColor = analysis.overallScore >= 80 ? [34, 197, 94] : 
                      analysis.overallScore >= 60 ? [234, 179, 8] : [239, 68, 68];
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.rect(margin, yPosition, (analysis.overallScore / 100) * 100, 8, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition, 100, 8, 'D');
    
    doc.setFontSize(14);
    doc.text(`${analysis.overallScore}%`, margin + 110, yPosition + 6);
    yPosition += 25;

    // Document Authenticity
    if (analysis.documentAuthenticity) {
      checkNewPage(60);
      doc.setFontSize(16);
      doc.text('Document Verification', margin, yPosition);
      yPosition += 15;

      const authColor = analysis.documentAuthenticity.isLegitimate ? [34, 197, 94] : [239, 68, 68];
      doc.setTextColor(authColor[0], authColor[1], authColor[2]);
      doc.setFontSize(12);
      doc.text(
        analysis.documentAuthenticity.isLegitimate ? 'Document Appears Legitimate' : 'Document Verification Failed',
        margin, yPosition
      );
      yPosition += 10;

      doc.setTextColor(0, 0, 0);
      doc.text(`Confidence: ${analysis.documentAuthenticity.confidence}%`, margin, yPosition);
      yPosition += 15;

      if (analysis.documentAuthenticity.concerns.length > 0) {
        doc.text('Verification Concerns:', margin, yPosition);
        yPosition += 10;
        analysis.documentAuthenticity.concerns.forEach((concern) => {
          yPosition = addWrappedText(`• ${concern}`, margin + 10, yPosition, pageWidth - margin * 2 - 10, 10);
          yPosition += 5;
        });
      }
      yPosition += 10;
    }

    // Risk Assessment
    if (analysis.riskAssessment) {
      checkNewPage(80);
      doc.setFontSize(16);
      doc.text('Risk Assessment', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`High Risk Issues: ${analysis.riskAssessment.highRisk}`, margin, yPosition);
      yPosition += 10;
      doc.text(`Medium Risk Issues: ${analysis.riskAssessment.mediumRisk}`, margin, yPosition);
      yPosition += 10;
      doc.text(`Low Risk Issues: ${analysis.riskAssessment.lowRisk}`, margin, yPosition);
      yPosition += 10;
      
      const riskColor = analysis.riskAssessment.overallRiskLevel === 'high' ? [239, 68, 68] :
                        analysis.riskAssessment.overallRiskLevel === 'medium' ? [234, 179, 8] : [34, 197, 94];
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(`Overall Risk Level: ${analysis.riskAssessment.overallRiskLevel.toUpperCase()}`, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 20;
    }

    // Issues Identified
    if (analysis.issues.length > 0) {
      checkNewPage(40);
      doc.setFontSize(16);
      doc.text('Issues Identified', margin, yPosition);
      yPosition += 15;

      analysis.issues.forEach((issue, index) => {
        checkNewPage(60);
        
        const severityColor = issue.severity === 'high' ? [239, 68, 68] :
                              issue.severity === 'medium' ? [234, 179, 8] : [34, 197, 94];
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${issue.title}`, margin, yPosition);
        
        doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
        doc.text(`[${issue.severity.toUpperCase()}]`, margin + 120, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;

        yPosition = addWrappedText(issue.description, margin + 5, yPosition, pageWidth - margin * 2 - 5, 10);
        yPosition += 5;

        if (issue.clauseReference) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          yPosition = addWrappedText(`Clause Reference: ${issue.clauseReference}`, margin + 5, yPosition, pageWidth - margin * 2 - 5, 10);
          yPosition += 3;
        }

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        yPosition = addWrappedText(`Suggestion: ${issue.suggestion}`, margin + 5, yPosition, pageWidth - margin * 2 - 5, 11);
        yPosition += 5;

        if (issue.legalBasis) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          yPosition = addWrappedText(`Legal Basis: ${issue.legalBasis}`, margin + 5, yPosition, pageWidth - margin * 2 - 5, 10);
          yPosition += 5;
        }

        yPosition += 10;
      });
    }

    // Location-Specific Advice
    if (analysis.locationSpecificAdvice && analysis.locationSpecificAdvice.length > 0) {
      checkNewPage(40);
      doc.setFontSize(16);
      doc.text('Location-Specific Advice', margin, yPosition);
      if (analysis.location) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${analysis.location})`, margin + 120, yPosition);
        doc.setTextColor(0, 0, 0);
      }
      yPosition += 15;

      analysis.locationSpecificAdvice.forEach((advice, index) => {
        checkNewPage(20);
        yPosition = addWrappedText(`${index + 1}. ${advice}`, margin, yPosition, pageWidth - margin * 2, 12);
        yPosition += 8;
      });
      yPosition += 10;
    }

    // General Recommendations
    checkNewPage(40);
    doc.setFontSize(16);
    doc.text('General Recommendations', margin, yPosition);
    yPosition += 15;

    analysis.recommendations.forEach((rec, index) => {
      checkNewPage(20);
      yPosition = addWrappedText(`${index + 1}. ${rec}`, margin, yPosition, pageWidth - margin * 2, 12);
      yPosition += 8;
    });

    // Verification Notes
    if (analysis.verificationNotes && analysis.verificationNotes.length > 0) {
      yPosition += 10;
      checkNewPage(40);
      doc.setFontSize(16);
      doc.text('Verification Notes', margin, yPosition);
      yPosition += 15;

      analysis.verificationNotes.forEach((note, index) => {
        checkNewPage(20);
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        yPosition = addWrappedText(`• ${note}`, margin, yPosition, pageWidth - margin * 2, 11);
        yPosition += 8;
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated by Tenant Rights Platform - Page ${i} of ${totalPages}`,
        margin,
        pageHeight - 10
      );
      doc.text(
        new Date().toLocaleDateString(),
        pageWidth - margin - 40,
        pageHeight - 10
      );
    }

    // Save the PDF
    const fileName = `lease-analysis-${analysis.fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('Report downloaded successfully!', {
      description: `${fileName} has been saved to your downloads folder.`
    });
    
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleAnalyze = async () => {
    if (!formData.leaseText.trim()) {
      setError('Please provide lease text or upload a file');
      return;
    }

    setError('');
    setLoading(true);
    setStep(2);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bda67e5/analyze-lease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          leaseText: formData.leaseText,
          fileName: formData.fileName || 'Manual Entry',
          location: formData.location
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 3000));

      setAnalysis(data.analysis);
      setStep(3);

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Info;
      case 'low': return CheckCircle;
      default: return Info;
    }
  };

  const getAuthenticityIcon = (isLegitimate: boolean) => {
    return isLegitimate ? ShieldCheck : ShieldAlert;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const startNewAnalysis = () => {
    setStep(1);
    setAnalysis(null);
    setFormData({ leaseText: '', fileName: '', location: '' });
    setError('');
    setDownloadingReport(false);
  };

  if (step === 2) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Brain className="h-8 w-8 text-primary animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-xl mb-2">AI-Powered Lease Analysis</h3>
            <p className="text-muted-foreground">
              Gemini AI is performing comprehensive document verification, legal compliance checks, and risk assessment...
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Progress value={25} className="w-full" />
              <p className="text-sm text-muted-foreground">✓ Document authenticity verification</p>
            </div>
            <div className="space-y-2">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-muted-foreground">✓ Legal clause analysis</p>
            </div>
            <div className="space-y-2">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground">⏳ Risk assessment and recommendations</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Enhanced AI analysis in progress...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 3 && analysis) {
    return (
      <div className="space-y-6">
        {/* Analysis Header with AI Badge */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl">Analysis Complete</h3>
                {analysis.aiPowered && (
                  <Badge variant="secondary" className="gap-1">
                    <Brain className="h-3 w-3" />
                    AI-Powered
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {analysis.fileName} • {new Date(analysis.analysisDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analysis.overallScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>

          <Progress value={analysis.overallScore} className="w-full mb-4" />
          
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              {analysis.issues.filter(i => i.severity === 'high').length} High Priority
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-yellow-500" />
              {analysis.issues.filter(i => i.severity === 'medium').length} Medium
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {analysis.issues.filter(i => i.severity === 'low').length} Low Priority
            </div>
          </div>
        </Card>

        {/* Document Authenticity & Verification */}
        {analysis.documentAuthenticity && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5" />
              <h4 className="text-lg">Document Verification</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {analysis.documentAuthenticity.isLegitimate ? (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">
                      {analysis.documentAuthenticity.isLegitimate ? 'Document Appears Legitimate' : 'Document Verification Failed'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {analysis.documentAuthenticity.confidence}%
                    </div>
                  </div>
                </div>
              </div>

              {analysis.documentAuthenticity.concerns.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Verification Concerns:</h5>
                  <ul className="space-y-1">
                    {analysis.documentAuthenticity.concerns.map((concern, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Risk Assessment */}
        {analysis.riskAssessment && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" />
              <h4 className="text-lg">Risk Assessment</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analysis.riskAssessment.highRisk}</div>
                <div className="text-sm text-red-600">High Risk</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analysis.riskAssessment.mediumRisk}</div>
                <div className="text-sm text-yellow-600">Medium Risk</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysis.riskAssessment.lowRisk}</div>
                <div className="text-sm text-green-600">Low Risk</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${getRiskLevelColor(analysis.riskAssessment.overallRiskLevel)}`}>
                  {analysis.riskAssessment.overallRiskLevel.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">Overall Risk</div>
              </div>
            </div>
          </Card>
        )}

        {/* Issues Found */}
        {analysis.issues.length > 0 && (
          <Card className="p-6">
            <h4 className="text-lg mb-4">Issues Identified</h4>
            <div className="space-y-4">
              {analysis.issues.map((issue, index) => {
                const SeverityIcon = getSeverityIcon(issue.severity);
                return (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <SeverityIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{issue.title}</h5>
                          <Badge variant={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {issue.description}
                        </p>
                        {issue.clauseReference && (
                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Clause Reference:</strong> {issue.clauseReference}
                          </p>
                        )}
                        <div className="bg-muted/50 rounded p-3 mb-2">
                          <p className="text-sm">
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </p>
                        </div>
                        {issue.legalBasis && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Legal Basis:</strong> {issue.legalBasis}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Location-Specific Advice */}
        {analysis.locationSpecificAdvice && analysis.locationSpecificAdvice.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h4 className="text-lg">Location-Specific Advice</h4>
              {analysis.location && (
                <Badge variant="outline">{analysis.location}</Badge>
              )}
            </div>
            <ul className="space-y-2">
              {analysis.locationSpecificAdvice.map((advice, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{advice}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* General Recommendations */}
        <Card className="p-6">
          <h4 className="text-lg mb-4">Our Recommendations</h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Verification Notes */}
        {analysis.verificationNotes && analysis.verificationNotes.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="h-5 w-5" />
              <h4 className="text-lg">Verification Notes</h4>
            </div>
            <ul className="space-y-2">
              {analysis.verificationNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{note}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={startNewAnalysis} variant="outline" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Analyze Another Lease
          </Button>
          <Button 
            onClick={() => downloadReport(analysis)} 
            className="flex-1"
            disabled={downloadingReport}
          >
            {downloadingReport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {downloadingReport ? 'Generating...' : 'Download Report'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5" />
          <h3 className="text-xl">AI-Powered Lease Analysis</h3>
          <Badge variant="secondary">Enhanced with Gemini</Badge>
        </div>
        <p className="text-muted-foreground mb-4">
          Upload your lease agreement for comprehensive AI-powered analysis including document verification, legal compliance checks, and personalized recommendations.
        </p>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="lease-file">Upload Document (PDF, DOC, TXT)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                id="lease-file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
              <label htmlFor="lease-file" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                {formData.fileName && (
                  <p className="text-sm text-primary mt-2">
                    File selected: {formData.fileName}
                  </p>
                )}
              </label>
            </div>
          </div>

          {/* Manual Text Entry */}
          <div className="space-y-2">
            <Label htmlFor="lease-text">Or paste your lease text here</Label>
            <Textarea
              id="lease-text"
              placeholder="Copy and paste your lease agreement text here..."
              value={formData.leaseText}
              onChange={(e) => setFormData(prev => ({ ...prev, leaseText: e.target.value }))}
              rows={6}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Property Location (City, State)</Label>
            <Input
              id="location"
              placeholder="e.g., San Francisco, CA"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Location helps us check against local tenant laws and provide specific legal guidance
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <Button 
            onClick={handleAnalyze}
            className="w-full" 
            disabled={loading || (!formData.leaseText.trim())}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze with AI
          </Button>
        </div>
      </Card>
    </div>
  );
}