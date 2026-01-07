// templates/fda-m3.ts

import { FolderTemplateNode } from "@/templates/Guidance-for-Industry/fda-module2";

export const FDA_MODULE_3_TEMPLATE: FolderTemplateNode = {
  name: "MODULE 3 – QUALITY",
  children: [
    {
      name: "3.1 TABLE OF CONTENTS",
    },
    {
      name: "3.2 BODY OF DATA",
      children: [
        {
          name: "3.2.S DRUG SUBSTANCE [NAME, MANUFACTURER]",
          children: [
            {
              name: "3.2.S.1 General Information",
              children: [
                { name: "3.2.S.1.1 Nomenclature" },
                { name: "3.2.S.1.2 Structure" },
                { name: "3.2.S.1.3 General Properties" },
              ],
            },
            {
              name: "3.2.S.2 Manufacture",
              children: [
                { name: "3.2.S.2.1 Manufacturers" },
                {
                  name: "3.2.S.2.2 Description of Manufacturing Process and Process Controls",
                },
                { name: "3.2.S.2.3 Control of Materials" },
                {
                  name: "3.2.S.2.4 Controls of Critical Steps and Intermediates",
                },
                {
                  name: "3.2.S.2.5 Process Validation and/or Evaluation",
                },
                {
                  name: "3.2.S.2.6 Manufacturing Process Development",
                },
              ],
            },
            {
              name: "3.2.S.3 Characterization",
              children: [
                {
                  name: "3.2.S.3.1 Elucidation of Structure and Other Characteristics",
                },
                { name: "3.2.S.3.2 Impurities" },
              ],
            },
            {
              name: "3.2.S.4 Control of Drug Substance",
              children: [
                { name: "3.2.S.4.1 Specification" },
                { name: "3.2.S.4.2 Analytical Procedures" },
                {
                  name: "3.2.S.4.3 Validation of Analytical Procedures",
                },
                { name: "3.2.S.4.4 Batch Analyses" },
                {
                  name: "3.2.S.4.5 Justification of Specification",
                },
              ],
            },
            { name: "3.2.S.5 Reference Standards or Materials" },
            { name: "3.2.S.6 Container Closure System" },
            {
              name: "3.2.S.7 Stability",
              children: [
                {
                  name: "3.2.S.7.1 Stability Summary and Conclusions",
                },
                {
                  name: "3.2.S.7.2 Postapproval Stability Protocol and Stability Commitment",
                },
                { name: "3.2.S.7.3 Stability Data" },
              ],
            },
          ],
        },

        {
          name: "3.2.P DRUG PRODUCT [NAME, DOSAGE FORM]",
          children: [
            {
              name: "3.2.P.1 Description and Composition of the Drug Product",
            },
            {
              name: "3.2.P.2 Pharmaceutical Development",
              children: [
                { name: "3.2.P.2.1 Components of the Drug Product" },
                { name: "3.2.P.2.2 Drug Product" },
                {
                  name: "3.2.P.2.3 Manufacturing Process Development",
                },
                { name: "3.2.P.2.4 Container Closure System" },
                { name: "3.2.P.2.5 Microbiological Attributes" },
                { name: "3.2.P.2.6 Compatibility" },
              ],
            },
            {
              name: "3.2.P.3 Manufacture",
              children: [
                { name: "3.2.P.3.1 Manufacturers" },
                { name: "3.2.P.3.2 Batch Formula" },
                {
                  name: "3.2.P.3.3 Description of Manufacturing Process and Process Controls",
                },
                {
                  name: "3.2.P.3.4 Controls of Critical Steps and Intermediates",
                },
                {
                  name: "3.2.P.3.5 Process Validation and/or Evaluation",
                },
              ],
            },
            {
              name: "3.2.P.4 Control of Excipients",
              children: [
                { name: "3.2.P.4.1 Specifications" },
                { name: "3.2.P.4.2 Analytical Procedures" },
                {
                  name: "3.2.P.4.3 Validation of Analytical Procedures",
                },
                {
                  name: "3.2.P.4.4 Justification of Specifications",
                },
                {
                  name: "3.2.P.4.5 Excipients of Human or Animal Origin",
                },
                { name: "3.2.P.4.6 Novel Excipients" },
              ],
            },
            {
              name: "3.2.P.5 Control of Drug Product",
              children: [
                { name: "3.2.P.5.1 Specifications" },
                { name: "3.2.P.5.2 Analytical Procedures" },
                {
                  name: "3.2.P.5.3 Validation of Analytical Procedures",
                },
                { name: "3.2.P.5.4 Batch Analyses" },
                {
                  name: "3.2.P.5.5 Characterization of Impurities",
                },
                {
                  name: "3.2.P.5.6 Justification of Specifications",
                },
              ],
            },
            { name: "3.2.P.6 Reference Standards or Materials" },
            { name: "3.2.P.7 Container Closure System" },
            {
              name: "3.2.P.8 Stability",
              children: [
                {
                  name: "3.2.P.8.1 Stability Summary and Conclusion",
                },
                {
                  name: "3.2.P.8.2 Postapproval Stability Protocol and Stability Commitment",
                },
                { name: "3.2.P.8.3 Stability Data" },
              ],
            },
          ],
        },

        {
          name: "3.2.A APPENDICES",
          children: [
            { name: "3.2.A.1 Facilities and Equipment" },
            {
              name: "3.2.A.2 Adventitious Agents Safety Evaluation",
            },
            { name: "3.2.A.3 Novel Excipients" },
          ],
        },

        {
          name: "3.2.R REGIONAL INFORMATION",
        },
      ],
    },
    {
      name: "3.3 LITERATURE REFERENCES",
    },
  ],
};
