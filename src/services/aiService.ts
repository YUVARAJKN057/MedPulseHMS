export interface DiagnosisResult {
  diagnosis: string;
  prescription: string;
  urgency: number;
  advice: string;
  warning: string;
}

export const aiService = {
  async getDiagnosis(symptoms: string): Promise<DiagnosisResult> {
    const response = await fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error('Failed to get diagnosis');
    }

    return response.json();
  },

  async checkSymptoms(symptoms: string, history: string = ''): Promise<string> {
    const response = await fetch('/api/ai/symptom-checker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, history }),
    });

    if (!response.ok) {
      throw new Error('Failed to check symptoms');
    }

    const data = await response.json();
    return data.analysis;
  }
};
