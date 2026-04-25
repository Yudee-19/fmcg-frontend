export type LegalBlock =
    | { type: "paragraph"; text: string }
    | { type: "list"; items: string[] }
    | { type: "callout"; text: string };

export interface LegalSubsection {
    number?: string;
    title: string;
    blocks: LegalBlock[];
}

export interface LegalSection {
    number?: string;
    title: string;
    blocks?: LegalBlock[];
    subsections?: LegalSubsection[];
}

export interface LegalContent {
    title: string;
    subtitle?: string;
    tagline?: string;
    intro?: string[];
    sections: LegalSection[];
}

export type LocalizedLegalContent = {
    en: LegalContent;
    ar: LegalContent;
};
