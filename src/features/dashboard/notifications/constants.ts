export const TUTORIALS = [
  {
    id: 1,
    context: "post_job",
    en: {
      title: "How to Post a Job",
      description:
        "Tap Post Job → Enter job details, budget, location, and number of workers → Choose job type (Fixed or Bid) → Tap Create Job to publish.",
    },
    sw: {
      title: "Jinsi ya Kupost Kazi",
      description:
        "Gusa Tangaza Kazi → Jaza maelezo ya kazi, bajeti, eneo, na idadi ya wafanyakazi → Chagua aina ya kazi (Fixed au Bid) → Gusa Tengeneza Kazi ili kupost.",
    },
  },
  {
    id: 2,
    context: "apply_job",
    en: {
      title: "How to Apply for a Job",
      description:
        "Open a job → Tap Apply → Wait for approval → If selected, your status will show Accepted.",
    },
    sw: {
      title: "Jinsi ya Kuomba Kazi",
      description:
        "Fungua kazi → Gusa Omba (Apply) → Subiri idhini → Ukikubaliwa utaona hali ya Umechaguliwa (Accepted).",
    },
  },
  {
    id: 3,
    context: "bid_job",
    en: {
      title: "How to Bid on a Job",
      description:
        "Open a Bid Job → Tap Place Bid → Enter your price and message → Wait for the employer to choose a winner.",
    },
    sw: {
      title: "Jinsi ya Kutoa Ofa kwenye Kazi",
      description:
        "Fungua kazi ya Bid → Gusa Weka Ofa (Place Bid) → Weka bei na ujumbe → Subiri mwajiri achague mshindi.",
    },
  },
  {
    id: 4,
    context: "hire_applicant",
    en: {
      title: "How to Hire",
      description:
        "Go to Jobs → Posted → Open your Job → Tap View Applications → Review profiles → Tap Employ to hire.",
    },
    sw: {
      title: "Jinsi ya Kuajiri",
      description:
        "Nenda Kazi → Imechapishwa → Fungua Kazi Yako → Gusa Tazama Maombi → Kagua profaili → Gusa Ajiri.",
    },
  },
  {
    id: 5,
    context: "hire_bidders",
    en: {
      title: "How to Hire Bidders",
      description:
        "Go to Jobs → Posted → Open your Bid Job → Tap View Bids/Applications → Compare prices and messages → Review profiles → Tap Employ to select a winner.",
    },
    sw: {
      title: "Jinsi ya Kuajiri Wapiga Zabuni",
      description:
        "Nenda Kazi → Imechapishwa → Fungua Kazi ya Bid → Gusa Tazama Zabuni/Maombi → Linganisha bei na ujumbe → Kagua profaili → Gusa Ajiri kuchagua mshindi.",
    },
  },
  {
    id: 6,
    context: "contact_employer",
    en: {
      title: "How to Contact the Employer",
      description:
        "Go to Jobs → Applied → Open the Accepted Job → Tap Call Employer → Follow the instructions provided.",
    },
    sw: {
      title: "Jinsi ya Kuwasiliana na Mwajiri",
      description:
        "Nenda Kazi → Ulizoomba → Fungua Kazi Uliyo Kubaliwa → Gusa Piga Mwajiri → Fuata maelekezo.",
    },
  },
  {
    id: 7,
    context: "contact_worker",
    en: {
      title: "How to Contact Your Worker",
      description:
        "Go to Jobs → Posted → Open your Job → Tap View Applications → Go to Hired Applicants → Tap Call to communicate.",
    },
    sw: {
      title: "Jinsi ya Kuwasiliana na Mfanyakazi Wako",
      description:
        "Nenda Kazi → Imechapishwa → Fungua Kazi Yako → Gusa Tazama Maombi → Nenda Wafanyakazi Ulioajiri → Gusa Piga Simu kuwasiliana.",
    },
  },
  {
    id: 8,
    context: "complete_job",
    en: {
      title: "How to Complete Your Job",
      description:
        "Go to Jobs → Applied → Open the Accepted Job → After finishing, tap Complete Job → Wait for employer approval → Tap Rate Employer to finalize.",
    },
    sw: {
      title: "Jinsi ya Kukamilisha Kazi Yako",
      description:
        "Nenda Kazi → Ulizoomba → Fungua Kazi Uliyo Kubaliwa → Baada ya kumaliza, gusa Kamilisha Kazi → Subiri idhini ya mwajiri → Gusa Kadiria Mwajiri.",
    },
  },
  {
    id: 9,
    context: "approve_completed_job",
    en: {
      title: "How to Approve Completed Work",
      description:
        "Go to Jobs → Posted → Open your Job → Tap View Applications → Go to Hired Applicants → Review the work → Tap Approve → Rate the worker.",
    },
    sw: {
      title: "Jinsi ya Kuidhinisha Kazi Iliyokamilika",
      description:
        "Nenda Kazi → Ulizopost → Fungua Kazi Yako → Gusa Tazama Maombi → Nenda Wafanyakazi Ulioajiri → Kagua kazi → Gusa Idhinisha → Kadiria mfanyakazi.",
    },
  },
  {
    id: 10,
    context: "complete_profile",
    en: {
      title: "How to Complete Your Profile",
      description:
        "Go to Profile → Tap Edit Profile → Upload Profile Picture → Fill in your Full Name, Phone Number, and Country → Write a strong Bio (essential) → Save to increase your chances of getting hired.",
    },
    sw: {
      title: "Jinsi ya Kukamilisha Profaili Yako",
      description:
        "Bonyeza Wasifu → Gusa Hariri Wasifu → Pakia Picha ya Profaili → Jaza Jina Kamili, Namba ya Simu, na Nchi → Andika Bio nzuri (muhimu sana) → Hifadhi ili kuongeza nafasi zako za kuajiriwa.",
    },
  },
  {
    id: 11,
    context: "add_portfolio",
    en: {
      title: "How to Add Your Portfolio",
      description:
        "Go to Profile → Portfolio → Tap + to upload photos (e.g. jobs done), files (CV, PDF), or links (YouTube, Instagram) → Save.",
    },
    sw: {
      title: "Jinsi ya Kuongeza Wasifu wa Kazi",
      description:
        "Bonyeza Wasifu → Wasifu wa Kazi (Portfolio) → Gusa alama ya + ili kupakia picha (mfano: kazi ulizofanya), mafaili (CV, PDF), au Kiungo (YouTube, Instagram) → Hifadhi.",
    },
  },
];

export type Language = "en" | "sw";

export interface Tutorial {
  id: number;
  context: string;
  en: {
    title: string;
    description: string;
  };
  sw: {
    title: string;
    description: string;
  };
}
