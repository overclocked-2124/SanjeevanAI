// /src/app/prescription/page.tsx

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PrescriptionReport } from "@/components/reports/PrescriptionReport";

import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Stethoscope,
  BrainCircuit,
  Pill,
  Mic,
  Camera,
  User,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

// --- THE FIX: DYNAMIC IMPORT ---
// We dynamically import PDFDownloadLink and disable SSR for it.
// This ensures it only ever renders on the client side.
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);


// --- TYPE DEFINITIONS ---
type PrescriptionStatus = "Approved" | "Rejected" | "Pending";
type Patient = { name: string; age: number; gender: "Male" | "Female" | "Other"; height: string; weight: string; allergies: string[]; };
type Medication = { id: number; name: string; dosage: string; frequency: string; duration: string; isExisting: boolean; };
type CaseDetailsForPdf = {
    prescriptionId: string;
    date: string;
    aiSummary: string;
    aiDiagnosis: string;
    // REMOVED confidence
    medicalHistory: string;
    doctorName: string; // <<< --- ADD THIS LINE
};

// --- MOCK DATA ---
const caseDetails = {
  prescriptionId: "P-98124",
  date: "June 07, 2025",
  status: "Approved" as PrescriptionStatus,
  doctorName: "Dr. Anil Kumar",
  rejectionReason: "Patient reported side effects to Albuterol. Awaiting patient follow-up for alternative medication.",
  aiSummary: "Patient reported a persistent dry cough, wheezing, and shortness of breath, which has worsened over the last 3 days. Symptoms are more pronounced at night and during physical activity.",
  aiDiagnosis: "Moderate Persistent Asthma",
  medicalHistory: "Patient has a 5-year history of Hypertension (HTN) and Chronic Kidney Disease (CKD).",
  transcript: `AI: Hello, this is SanjeevanAI. How can I help you today?\nPatient: Hello, I've been having trouble breathing for a few days.\nAI: I see. Can you describe the feeling? Is it a cough, or something else?\nPatient: It's a dry cough, and I feel a wheezing sound when I breathe...\n(Transcript continues)`,
  confidence: 95.5,
};
const patientData: Patient = { name: "Priya Sharma", age: 42, gender: "Female", height: "165 cm", weight: "68 kg", allergies: ["Pollen", "No Known Drug Allergies"], };
const prescriptionData: Medication[] = [
  { id: 1, name: "Albuterol", dosage: "90 mcg", frequency: "2 puffs as needed", duration: "30 Days", isExisting: false },
  { id: 2, name: "Fluticasone", dosage: "110 mcg", frequency: "1 puff twice daily", duration: "90 Days", isExisting: false },
  { id: 3, name: "Metformin", dosage: "500 mg", frequency: "1 tablet twice daily", duration: "Ongoing", isExisting: true },
  { id: 4, name: "Melatonin", dosage: "500 mg", frequency: "1 tablet twice daily", duration: "300 Days", isExisting: false },
];

const pdfData = {
    patient: patientData,
    medications: prescriptionData,
    caseDetails: {
        prescriptionId: caseDetails.prescriptionId,
        date: caseDetails.date,
        aiSummary: caseDetails.aiSummary,
        aiDiagnosis: caseDetails.aiDiagnosis,
        doctorName: caseDetails.doctorName,
        medicalHistory: caseDetails.medicalHistory
    } as CaseDetailsForPdf
};

// --- HELPER COMPONENT for STATUS ---
const ApprovalStatusCard = ({ status, doctorName, rejectionReason }: { status: PrescriptionStatus; doctorName: string; rejectionReason?: string; }) => {
  const statusConfig = {
    Approved: { Icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-500/10", title: "Prescription Approved", description: `This prescription was reviewed and approved by ${doctorName}.` },
    Rejected: { Icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10", title: "Prescription Rejected", description: `This prescription was rejected by ${doctorName}.` },
    Pending: { Icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10", title: "Approval Pending", description: `This prescription is awaiting review by ${doctorName}.` },
  };
  const config = statusConfig[status];

  return (
    <Card className={`border-border/60 ${config.bgColor}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <config.Icon className={`h-8 w-8 ${config.color}`} />
          <div>
            <CardTitle className={config.color}>{config.title}</CardTitle>
            <CardDescription className="text-foreground/80">{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {status === 'Rejected' && rejectionReason && (
        <CardContent>
          <p className="text-sm font-semibold">Reason for Rejection:</p>
          <p className="text-sm text-muted-foreground">{rejectionReason}</p>
        </CardContent>
      )}
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function PatientPrescriptionPage() {
  // This state ensures the component has mounted on the client before attempting to render the PDF link.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription for {patientData.name}</h1>
          <p className="text-muted-foreground">Prescription ID: {caseDetails.prescriptionId} | Issued on: {caseDetails.date}</p>
        </div>
        {/* We only render the PDF link once we're sure we are on the client */}
        {isClient && (
            <PDFDownloadLink
                document={<PrescriptionReport {...pdfData} />}
                fileName={`Sanjeevan-Prescription-${caseDetails.prescriptionId}.pdf`}
            >
            {({ loading }) => (
                <Button variant="outline" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'Generating...' : 'Download as PDF'}
                </Button>
            )}
            </PDFDownloadLink>
        )}
      </div>
      
      {/* The rest of your page layout remains untouched */}
      <div className="p-1">
        <div className="space-y-6">
          <ApprovalStatusCard
            status={caseDetails.status}
            doctorName={caseDetails.doctorName}
            rejectionReason={caseDetails.rejectionReason}
          />
          <Card className="border-border/60"><CardHeader><CardTitle>Consultation Details</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"><div className="flex items-start gap-3"><User className="h-5 w-5 mt-1 text-primary" /><div><p className="font-semibold text-foreground">Patient Details</p><p className="text-muted-foreground">{patientData.age} years old • {patientData.gender} • {patientData.height} • {patientData.weight}</p></div></div><div className="flex items-start gap-3"><Stethoscope className="h-5 w-5 mt-1 text-primary" /><div><p className="font-semibold text-foreground">Consulting Physician</p><p className="text-muted-foreground">{caseDetails.doctorName}</p></div></div><div className="flex items-start gap-3"><FileText className="h-5 w-5 mt-1 text-primary" /><div><p className="font-semibold text-foreground">Known Allergies & History</p><p className="text-muted-foreground">{patientData.allergies.join(", ")} • {caseDetails.medicalHistory}</p></div></div></CardContent></Card>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6"><div className="lg:col-span-3 space-y-6"><Card className="border-border/60"><CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5" /> AI Symptom Summary</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{caseDetails.aiSummary}</p></CardContent></Card><Card className="border-border/60"><CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" /> Final Diagnosis</CardTitle></CardHeader><CardContent><p className="text-xl font-bold text-primary">{caseDetails.aiDiagnosis}</p></CardContent></Card></div><div className="lg:col-span-2 space-y-6"><Card className="border-border/60"><CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Conversation Transcript</CardTitle></CardHeader><CardContent><Textarea readOnly value={caseDetails.transcript} className="h-40 text-xs bg-muted/50 border-none" /></CardContent></Card><Card className="border-border/60"><CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Patient Uploads</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No images were uploaded for this consultation.</p></CardContent></Card></div></div>
          <Card className="border-border/60"><CardHeader><CardTitle className="flex items-center gap-2"><Pill className="h-6 w-6" /> Finalized Prescription</CardTitle><CardDescription>This prescription has been approved by your doctor. Follow the instructions carefully.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="w-[30%]">Medication</TableHead><TableHead>Dosage</TableHead><TableHead>Frequency</TableHead><TableHead>Duration</TableHead></TableRow></TableHeader><TableBody>{prescriptionData.map((med) => (<TableRow key={med.id}><TableCell className="font-medium">{med.name}{med.isExisting && <Badge variant="secondary" className="ml-2">Existing Medication</Badge>}</TableCell><TableCell>{med.dosage}</TableCell><TableCell>{med.frequency}</TableCell><TableCell>{med.duration}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        </div>
      </div>
    </AppLayout>
  );
}

