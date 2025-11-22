/**
 * Format initial patient context from onboarding data
 * Creates a natural language summary of patient information
 */

interface PatientContextData {
    name: string;
    age: number;
    gender?: string;
    chiefComplaint: string;
    duration?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    painLevel?: number;
    bodyParts?: string[];
    chronicConditions?: string[];
    allergies?: string[];
    currentMedications?: string;
    symptomImage?: File;
}

export function formatInitialPatientContext(patientData: PatientContextData): string {
    const parts: string[] = [];

    // Patient intro
    const genderText = patientData.gender ? `, ${patientData.gender}` : '';
    parts.push(`Patient: ${patientData.name}, ${patientData.age} years old${genderText}.`);

    // Chief complaint & symptoms
    parts.push(`\nChief Complaint: ${patientData.chiefComplaint}`);

    // Duration & severity
    if (patientData.duration) {
        const durationText = formatDuration(patientData.duration);
        parts.push(`Duration: ${durationText}.`);
    }

    if (patientData.severity) {
        parts.push(`Severity: ${patientData.severity}.`);
    }

    // Body parts if available
    if (patientData.bodyParts && patientData.bodyParts.length > 0) {
        const bodyPartsText = patientData.bodyParts.length === 1
            ? patientData.bodyParts[0]
            : patientData.bodyParts.slice(0, -1).join(', ') + ' and ' + patientData.bodyParts[patientData.bodyParts.length - 1];
        parts.push(`Affected areas: ${bodyPartsText}.`);
    }

    // Pain level if available
    if (patientData.painLevel && patientData.painLevel > 0) {
        const painDesc = patientData.painLevel <= 3 ? 'mild' :
            patientData.painLevel <= 6 ? 'moderate' : 'severe';
        parts.push(`Pain level: ${patientData.painLevel}/10 (${painDesc}).`);
    }

    // Medical history
    if (patientData.chronicConditions && patientData.chronicConditions.length > 0) {
        parts.push(`\nChronic conditions: ${patientData.chronicConditions.join(', ')}.`);
    }

    if (patientData.currentMedications) {
        parts.push(`Current medications: ${patientData.currentMedications}`);
    }

    if (patientData.allergies && patientData.allergies.length > 0) {
        parts.push(`Allergies: ${patientData.allergies.join(', ')}.`);
    }

    // Image note
    if (patientData.symptomImage) {
        parts.push(`\nI've attached a photo of the affected area.`);
    }

    return parts.join(' ');
}

function formatDuration(duration: string): string {
    const durationMap: Record<string, string> = {
        'less_than_1_day': 'less than 1 day',
        '1_3_days': '1-3 days',
        '3_7_days': '3-7 days',
        '1_2_weeks': '1-2 weeks',
        'more_than_2_weeks': 'more than 2 weeks'
    };
    return durationMap[duration] || duration;
}
