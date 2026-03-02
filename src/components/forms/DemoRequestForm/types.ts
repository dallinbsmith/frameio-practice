export type DemoRequestFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  companySize: string;
  industry: string;
  useCase: string;
  teamMembers: string[];
  currentTools: string;
  timeline: string;
  budget: string;
  requirements: string;
  files: File[];
  referralSource: string;
  marketingConsent: boolean;
};

export type DemoRequestFormProps = {
  onSubmit: (values: DemoRequestFormValues) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
};
