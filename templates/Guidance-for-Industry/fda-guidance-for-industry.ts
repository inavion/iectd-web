import { FolderTemplateNode } from "@/templates/Guidance-for-Industry/fda-module2";
import { FDA_M4Q_TEMPLATE } from "@/templates/Guidance-for-Industry/fda-module2";
import { FDA_MODULE_3_TEMPLATE } from "@/templates/Guidance-for-Industry/fda-module3";

export const FDA_GUIDANCE_FOR_INDUSTRY_TEMPLATE: FolderTemplateNode = {
  name: "Guidance for Industry",
  children: [
    FDA_M4Q_TEMPLATE,
    FDA_MODULE_3_TEMPLATE,
  ],
};
