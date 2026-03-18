import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
};

export type CustomElement = {
  type: "paragraph";
  align?: "left" | "center" | "right";
  children: CustomText[];
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
