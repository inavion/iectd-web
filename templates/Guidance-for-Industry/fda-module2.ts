export type FolderTemplateNode = {
  name: string;
  children?: FolderTemplateNode[];
};

export const FDA_M4Q_TEMPLATE: FolderTemplateNode = {
  name: "MODULE 2 - QUALITY OVERALL SUMMARY",
  children: [
    {
      name: "2.3 INTRODUCTION TO THE QUALITY OVERALL SUMMARY",
    },
    {
      name: "2.3.S DRUG SUBSTANCE [NAME, MANUFACTURER]",
      children: [
        { name: "2.3.S.1 General Information" },
        { name: "2.3.S.2 Manufacture" },
        { name: "2.3.S.3 Characterization" },
        { name: "2.3.S.4 Control of Drug Substance" },
        { name: "2.3.S.5 Reference Standards or Materials" },
        { name: "2.3.S.6 Container Closure System" },
        { name: "2.3.S.7 Stability" },
      ],
    },
    {
      name: "2.3.P DRUG PRODUCT [NAME, DOSAGE FORM]",
      children: [
        { name: "2.3.P.1 Description and Composition" },
        { name: "2.3.P.2 Pharmaceutical Development" },
        { name: "2.3.P.3 Manufacture" },
        { name: "2.3.P.4 Control of Excipients" },
        { name: "2.3.P.5 Control of Drug Product" },
        { name: "2.3.P.6 Reference Standards or Materials" },
        { name: "2.3.P.7 Container Closure System" },
        { name: "2.3.P.8 Stability" },
      ],
    },
  ],
};
