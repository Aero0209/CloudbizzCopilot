export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  header: {
    title: string;
    subtitle?: string;
    logo?: string;
  };
  styles: {
    colors: {
      primary: string;
      secondary: string;
      text: string;
    };
    fonts: {
      header: string;
      body: string;
    };
  };
  sections: {
    header: boolean;
    customerInfo: boolean;
    services: boolean;
    total: boolean;
    footer: boolean;
  };
}

export const defaultTemplate: PDFTemplate = {
  id: '',
  name: 'Nouveau template',
  description: '',
  header: {
    title: 'FACTURE',
    subtitle: 'Cloudbizz SRL'
  },
  styles: {
    colors: {
      primary: '#0057B7',
      secondary: '#4B5563',
      text: '#1F2937'
    },
    fonts: {
      header: 'helvetica',
      body: 'helvetica'
    }
  },
  sections: {
    header: true,
    customerInfo: true,
    services: true,
    total: true,
    footer: true
  }
};

export type Template = PDFTemplate; 