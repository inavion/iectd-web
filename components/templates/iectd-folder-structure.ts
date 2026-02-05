export interface FolderNode {
  name: string;
  children?: FolderNode[];
}

export const IECTD_FOLDER_STRUCTURE: FolderNode = {
  name: "ieCTD/Drugs",
  children: [
    {
      name: "m1"
    },
    {
      name: "m2",
      children: [
        { name: "22-intro" },
        { name: "23-qos" },
        { name: "24-nonclin-over" },
        { name: "25-clin-over" },
        { name: "26-nonclin-sum" },
        { name: "27-clin-sum" },
      ],
    },
    {
      name: "m3",
      children: [
        {
          name: "32-body-data",
          children: [
            {
              name: "32a-app",
              children: [
                { name: "32a1-fac-equip" },
                { name: "32a2-advent-agent" },
                { name: "32a3-excip-name-1" },
              ],
            },
            {
              name: "32p-drug-prod",
              children: [
                {
                  name: "product-1",
                  children: [
                    { name: "32p1-desc-comp" },
                    { name: "32p2-pharm-dev" },
                    { name: "32p3-manuf" },
                    {
                      name: "32p4-contr-excip",
                      children: [{ name: "excipient-1" }],
                    },
                    {
                      name: "32p5-contr-drug-prod",
                      children: [
                        { name: "32p51-spec" },
                        { name: "32p52-analyt-proc" },
                        { name: "32p53-val-analyt-proc" },
                        { name: "32p54-batch-analys" },
                        { name: "32p55-charac-imp" },
                        { name: "32p56-justif-spec" },
                      ],
                    },
                    { name: "32p6-ref-stand" },
                    { name: "32p7-cont-closure-sys" },
                    { name: "32p8-stab" },
                  ],
                },
              ],
            },
            { name: "32r-reg-info" },
            {
              name: "32s-drug-sub",
              children: [
                {
                  name: "substance-1-manufacturer-1",
                  children: [
                    { name: "32s1-gen-info" },
                    { name: "32s2-manuf" },
                    { name: "32s3-charac" },
                    {
                      name: "32s4-contr-drug-sub",
                      children: [
                        { name: "32s41-spec" },
                        { name: "32s42-analyt-proc" },
                        { name: "32s43-val-analyt-proc" },
                        { name: "32s44-batch-analys" },
                        { name: "32s45-justif-spec" },
                      ],
                    },
                    { name: "32s5-ref-stand" },
                    { name: "32s6-cont-closure-sys" },
                    { name: "32s7-stab" },
                  ],
                },
              ],
            },
          ],
        },
        { name: "33-lit-ref" },
      ],
    },
    {
      name: "m4",
      children: [
        {
          name: "42-stud-rep",
          children: [
            {
              name: "421-pharmacol",
              children: [
                { name: "4211-prim-pd" },
                { name: "4212-sec-pd" },
                { name: "4213-safety-pharmacol" },
                { name: "4214-pd-drug-interact" },
              ],
            },
            {
              name: "422-pk",
              children: [
                { name: "4221-analyt-met-val" },
                { name: "4222-absorp" },
                { name: "4223-distrib" },
                { name: "4224-metab" },
                { name: "4225-excr" },
                { name: "4226-pk-drug-interact" },
                { name: "4227-other-pk-stud" },
              ],
            },
            {
              name: "423-tox",
              children: [
                { name: "4231-single-dose-tox" },
                { name: "4232-repeat-dose-tox" },
                {
                  name: "4233-genotox",
                  children: [
                    { name: "42331-in-vitro" },
                    { name: "42332-in-vivo" },
                  ],
                },
                {
                  name: "4234-carcigen",
                  children: [
                    { name: "42341-lt-stud" },
                    { name: "42342-smt-stud" },
                    { name: "42343-other-stud" },
                  ],
                },
                {
                  name: "4235-repro-dev-tox",
                  children: [
                    { name: "42351-fert-embryo-dev" },
                    { name: "42352-embryo-fetal-dev" },
                    { name: "42353-pre-postnatal-dev" },
                    { name: "42354-juv" },
                  ],
                },
                { name: "4236-loc-tol" },
                {
                  name: "4237-other-tox-stud",
                  children: [
                    { name: "42371-antigen" },
                    { name: "42372-immunotox" },
                    { name: "42373-mechan-stud" },
                    { name: "42374-dep" },
                    { name: "42375-metab" },
                    { name: "42376-imp" },
                    { name: "42377-other" },
                  ],
                },
              ],
            },
          ],
        },
        { name: "43-lit-ref" },
      ],
    },
    {
      name: "m5",
      children: [
        { name: "52-tab-list" },
        {
          name: "53-clin-stud-rep",
          children: [
            {
              name: "531-rep-biopharm-stud",
              children: [
                {
                  name: "5311-ba-stud-rep",
                  children: [
                    { name: "study-report-1" },
                    { name: "study-report-2" },
                    { name: "study-report-3" },
                  ],
                },
                {
                  name: "5312-compar-ba-be-stud-rep",
                  children: [
                    { name: "study-report-1" },
                    { name: "study-report-2" },
                    { name: "study-report-3" },
                  ],
                },
                {
                  name: "5313-in-vitro-in-vivo-corr-stud-rep",
                  children: [
                    { name: "study-report-1" },
                    { name: "study-report-2" },
                    { name: "study-report-3" },
                  ],
                },
                {
                  name: "5314-bioanalyt-analyt-met",
                  children: [
                    { name: "study-report-1" },
                    { name: "study-report-2" },
                    { name: "study-report-3" },
                  ],
                },
              ],
            },
            {
              name: "532-rep-stud-pk-human-biomat",
              children: [
                {
                  name: "5321-plasma-prot-bind-stud-rep",
                  children: [
                    { name: "study-report-1" },
                    { name: "study-report-2" },
                    { name: "study-report-3" },
                  ],
                },
                {
                  name: "5322-rep-hep-metab-interact-stud",
                  children: [
                    { name: "study-report-1" },
                    { name: "study-report-2" },
                    { name: "study-report-3" },
                  ],
                },
                {
                  name: "5323-stud-other-human-biomat",
                  children: [
                    { name: "study-report-1" },
                    { name: "study-report-2" },
                    { name: "study-report-3" },
                  ],
                },
              ],
            },
            {
              name: "535-rep-effic-safety-stud",
              children: [
                {
                  name: "indication-1",
                  children: [
                    {
                      name: "5351-stud-rep-contr",
                      children: [
                        { name: "study-report-1" },
                        { name: "study-report-2" },
                        { name: "study-report-3" },
                      ],
                    },
                    {
                      name: "5352-stud-rep-uncontr",
                      children: [
                        { name: "study-report-1" },
                        { name: "study-report-2" },
                        { name: "study-report-3" },
                      ],
                    },
                    {
                      name: "5353-rep-analys-data-more-one-stud",
                      children: [
                        { name: "study-report-1" },
                        { name: "study-report-2" },
                        { name: "study-report-3" },
                      ],
                    },
                    {
                      name: "5354-other-stud-rep",
                      children: [
                        { name: "study-report-1" },
                        { name: "study-report-2" },
                        { name: "study-report-3" },
                      ],
                    },
                  ],
                },
              ],
            },
            { name: "536-postmark-exp" },
            {
              name: "537-crf-ipl",
              children: [
                { name: "study-1" },
                { name: "study-2" },
                { name: "study-3" },
              ],
            },
          ],
        },
        { name: "54-lit-ref" },
      ],
    },
  ],
};


export const getAllTemplateFolderNames = (): string[] => {
  const names: string[] = [];
  
  const collectNames = (node: FolderNode) => {
    names.push(node.name);
    if (node.children) {
      node.children.forEach(collectNames);
    }
  };
  
  collectNames(IECTD_FOLDER_STRUCTURE);
  // Also add "Guidance for Industry" as it's the parent wrapper
  names.push("Guidance for Industry");
  
  return names;
};